#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""verify/arbitro/ronda12/certificar-r12.py — Certifica con SymPy las
identidades que sustentan cada caso del catálogo de ataques de la ronda 12.

Lee las certificaciones (`sympy:`) del propio arnés `ataques-r12.js` —no hay
copia en este script— y las evalúa con SymPy. Cada certificación debe
devolver True: es la prueba de que el caso es lo que dice ser
(identidad verdadera en los casos FN, identidad falsa en los casos FP).

Nota sobre `eval`: las expresiones evaluadas salen del arnés del propio
proyecto (archivo del equipo, no entrada externa) y son fórmulas de SymPy
con un espacio de nombres restringido a `sp` y `U`. Es el uso previsto:
aquí la evaluación de la expresión ES la certificación.

Uso:  python3 -I verify/arbitro/ronda12/certificar-r12.py
Sale con 0 si todas las certificaciones se cumplen, 1 si alguna falla.
"""

import re
import sys
import os

import sympy as sp

AQUI = os.path.dirname(os.path.abspath(__file__))
ARNES = os.path.join(AQUI, "ataques-r12.js")
BARRIDO = os.path.join(AQUI, "casos-barrido-r12.js")

# Contexto compartido por las certificaciones.
U = sp.Matrix([[1, 2, -1], [0, 2, 4], [0, 0, -1]])

# `ficha:` en las fichas del banco; `sonda: true` en las sondas sintéticas.
RE_CASO = re.compile(
    r'(?:ficha:\s*"([^"]+)"\s*,\s*caso:\s*"([^"]+)"|sonda:\s*true\s*,\s*caso:\s*"([^"]+)")')
RE_SYM = re.compile(r'sympy:\s*"((?:[^"\\]|\\.)*)"')

# Certificaciones que son texto ("True") y no identidad: se listan aparte.
TRIVIALES = 0


def extraer_casos(texto):
    """Devuelve [(etiqueta, caso, certificacion)] en el orden del archivo."""
    casos = []
    for m in RE_CASO.finditer(texto):
        bloque = texto[m.start():]
        s = RE_SYM.search(bloque)
        if not s:
            continue
        cert = s.group(1).replace('\\"', '"').replace("\\\\", "\\")
        etiqueta = m.group(1) if m.group(1) else "Sonda"
        casos.append((etiqueta, m.group(2) or m.group(3), cert))
    return casos


def main():
    casos = []
    for origen in (ARNES, BARRIDO):
        with open(origen, encoding="utf-8") as f:
            casos.extend(extraer_casos(f.read()))
    if not casos:
        print("No se han encontrado casos en", ARNES, "ni en", BARRIDO)
        return 1

    fallos = 0
    triviales = 0
    for ficha, caso, cert in casos:
        try:
            ok = bool(eval(cert, {"sp": sp, "U": U, "abs": abs, "len": len,
                                   "all": all, "any": any, "sorted": sorted,
                                   "min": min, "max": max, "range": range,
                                   "__builtins__": {}}))
        except Exception as exc:  # noqa: BLE001
            ok = False
            cert = cert + "   ->  ERROR: " + str(exc)
        if cert.strip() == "True":
            triviales += 1
        if ok:
            print(f"[OK ] {ficha} {caso}")
        else:
            print(f"[X  ] {ficha} {caso}: la certificacion no se cumple")
            print(f"       {cert}")
            fallos += 1

    total = len(casos)
    print("")
    print(f"Certificaciones SymPy: {total - fallos}/{total} se cumplen "
          f"({triviales} triviales, sin identidad que certificar).")
    if fallos:
        print(f"FALLO: {fallos} certificaciones no se cumplen")
        return 1
    print("OK: todas las certificaciones se cumplen")
    return 0


if __name__ == "__main__":
    sys.exit(main())
