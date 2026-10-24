#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Incrusta los subtítulos de las animaciones en las páginas de tema.

Motivo
------
El curso se abre con doble clic, es decir bajo el esquema ``file://``. Bajo ese
esquema el navegador trata cada fichero como un origen opaco distinto, así que
un ``<track src="...vtt">`` **no carga**: el elemento queda en ``readyState 3``
con cero cues y su evento ``error`` se dispara. Lo mismo ocurre si el JavaScript
intenta leer el ``.vtt`` con ``fetch`` o ``XMLHttpRequest`` (bloqueados por la
política de origen opaco). Es un límite del navegador, no un error del sitio.

Solución
---------
El subtítulo se incrusta en el propio HTML como URI ``data:``, que no depende
de ninguna red ni de permisos de origen. El ``.vtt`` sigue siendo la fuente de
verdad en ``assets/animaciones/``: este script lo lee, lo codifica y reescribe
el ``src`` del ``<track>``.

Cada ``<track>`` conserva el nombre de su fichero en el atributo ``data-vtt``,
de modo que el script es idempotente: si el ``.vtt`` del disco cambia, vuelve a
incrustarlo; si no ha cambiado, no toca nada.

Uso
---
    python3 scripts/build_subtitulos.py            # reescribe los HTML
    python3 scripts/build_subtitulos.py --check    # solo comprueba (sale 1 si hay fallos)
"""

from __future__ import annotations

import base64
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
ANIM = BASE / "assets" / "animaciones"

TRACK_RE = re.compile(r"<track\b[^>]*>", re.IGNORECASE)
SRC_RE = re.compile(r"(\bsrc=\")([^\"]*)(\")", re.IGNORECASE)
DATA_VTT_RE = re.compile(r"(\bdata-vtt=\")([^\"]*)(\")", re.IGNORECASE)


def data_uri(vtt_path: Path) -> str:
    """Codifica un .vtt como URI data: MIME text/vtt en base64."""
    return "data:text/vtt;charset=utf-8;base64," + base64.b64encode(
        vtt_path.read_bytes()
    ).decode("ascii")


def uri_to_bytes(uri: str) -> bytes | None:
    """Decodifica un URI data: de subtítulo; None si no lo es o está corrupto."""
    if not uri.startswith("data:text/vtt"):
        return None
    if "base64," not in uri:
        return None
    try:
        return base64.b64decode(uri.split("base64,", 1)[1])
    except Exception:
        return None


def read_vtts() -> dict[str, bytes]:
    """Nombre de fichero -> contenido, de todos los .vtt del proyecto."""
    return {p.name: p.read_bytes() for p in sorted(ANIM.glob("*.vtt"))}


def build() -> int:
    vtts = read_vtts()
    if not vtts:
        print(f"ERROR: no hay ficheros .vtt en {ANIM}", file=sys.stderr)
        return 2
    uris = {nombre: data_uri(ANIM / nombre) for nombre in vtts}

    cambios = 0
    desajustes: list[str] = []

    for html in sorted((BASE / "temas").glob("tema-*.html")):
        texto = html.read_text(encoding="utf-8")
        original = texto

        def sustituir(m: re.Match) -> str:
            nonlocal cambios
            tag = m.group(0)

            # 1) ¿ya tiene data-vtt? Entonces es un track ya incrustado.
            dm = DATA_VTT_RE.search(tag)
            if dm:
                nombre = dm.group(2)
                if nombre not in uris:
                    desajustes.append(f"{html.name}: data-vtt='{nombre}' no existe")
                    return tag
                nuevo = uris[nombre]
                sm = SRC_RE.search(tag)
                if sm and sm.group(2) == nuevo:
                    return tag  # ya correcto
                cambios += 1
                if sm:
                    return SRC_RE.sub(lambda s: s.group(1) + nuevo + s.group(3), tag, count=1)
                return tag[:-1] + f' src="{nuevo}">'

            # 2) track original: el nombre está en la ruta del src.
            sm = SRC_RE.search(tag)
            if not sm:
                desajustes.append(f"{html.name}: <track> sin src")
                return tag
            nombre = sm.group(2).rsplit("/", 1)[-1]
            if nombre not in uris:
                desajustes.append(f"{html.name}: {sm.group(2)} (no hay .vtt correspondiente)")
                return tag
            nuevo = uris[nombre]
            cambios += 1
            tag = SRC_RE.sub(lambda s: s.group(1) + nuevo + s.group(3), tag, count=1)
            # se conserva el nombre del fichero para que el script sea idempotente
            tag = tag[:-1] + f' data-vtt="{nombre}">'
            return tag

        texto = TRACK_RE.sub(sustituir, texto)
        if texto != original:
            html.write_text(texto, encoding="utf-8")
            print(f"  · {html.relative_to(BASE)}: subtítulos incrustados")

    if desajustes:
        for d in desajustes:
            print(f"AVISO: {d}", file=sys.stderr)
        return 1

    print(f"OK: {len(vtts)} subtítulos incrustados ({cambios} referencias reescritas)")
    return 0


def check() -> int:
    """Comprueba que cada <track> lleva un URI data: válido y que el contenido
    decodificado coincide con el .vtt del disco."""
    vtts = read_vtts()
    if not vtts:
        print(f"ERROR: no hay .vtt en {ANIM}", file=sys.stderr)
        return 2

    fallos: list[str] = []
    total = 0
    for html in sorted((BASE / "temas").glob("tema-*.html")):
        texto = html.read_text(encoding="utf-8")
        for m in TRACK_RE.finditer(texto):
            total += 1
            tag = m.group(0)
            sm = SRC_RE.search(tag)
            if not sm:
                fallos.append(f"{html.name}: <track> sin src")
                continue
            src = sm.group(2)
            if not src.startswith("data:text/vtt"):
                fallos.append(f"{html.name}: el src no es un URI data: ({src[:40]}…)")
                continue
            contenido = uri_to_bytes(src)
            if contenido is None:
                fallos.append(f"{html.name}: URI data: corrupto")
                continue
            dm = DATA_VTT_RE.search(tag)
            if not dm:
                fallos.append(f"{html.name}: falta el atributo data-vtt")
                continue
            nombre = dm.group(2)
            if nombre not in vtts:
                fallos.append(f"{html.name}: {nombre} no existe en assets/animaciones/")
                continue
            if contenido != vtts[nombre]:
                fallos.append(f"{html.name}: {nombre} no coincide con el .vtt del disco")

    if fallos:
        for f in fallos:
            print("✗ " + f, file=sys.stderr)
        return 1
    print(f"OK: {total} <track> incrustados y verificados contra los .vtt")
    return 0


if __name__ == "__main__":
    if "--check" in sys.argv:
        sys.exit(check())
    sys.exit(build())
