#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify/crosscheck-expected.py — contrasta los `expected` del banco de
ejercicios (assets/data/) con los que declaran o calculan los scripts de
verificación (verify/*-verify.py).

Los scripts de verify/ llevan una copia de la respuesta esperada de cada
ejercicio: en el diccionario EXPECTED, o bien como constante dentro de la
propia comprobación cuando el script recalcula el resultado. Esa copia puede
quedarse obsoleta si alguien edita assets/data/ sin tocar el script.

La comparación es **por valor**, no por texto: se ejecuta el script de
verificación en un entorno aislado, se recoge lo que declara (literales) y lo
que calcula (variables) en el bloque de cada ejercicio, y se contrasta con
el `expected` del banco admitiendo equivalencias simbólicas de SymPy.

Salida:

    OK: 179/179 valores coinciden entre assets/data/ y los scripts de verificación.

Uso:  python3 -I verify/crosscheck-expected.py
"""

from __future__ import annotations

import ast
import contextlib
import io
import json
import re
import subprocess
import sys
from pathlib import Path

import sympy as sp

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "assets" / "data"

I, pi = sp.I, sp.pi

# Ficheros de verificación y el bloque de datos que contrastan.
SCRIPTS = {
    "verify/tema-1-verify.py": "tema-1",
    "verify/tema-2-verify.py": "tema-2",
    "verify/tema-3-verify.py": "tema-3",
    "verify/tema-4-verify.py": "tema-4",
    "verify/tema-5-verify.py": "tema-5",
    "verify/examen-1-verify.py": "examen-1",
    "verify/examen-2-verify.py": "examen-2",
    "verify/examen-3-verify.py": "examen-3",
}

# Identificador de ejercicio: T1-N1 / T3-M4 / T5-E6 y X1-1 … X3-12.
ID_RE = re.compile(r"([TX]\d-(?:[NME]\d+|\d+))")

# Extrae los `expected` de los ficheros de datos con Node (son ficheros JS).
EXTRACT_JS = r"""
const fs = require("fs"), path = require("path");
const DIR = path.resolve("assets/data");
global.window = {};
const out = {};
for (const f of fs.readdirSync(DIR).sort()) {
  if (!f.endsWith(".js")) continue;
  const key = f.replace(/\.js$/, "");
  require(path.join(DIR, f));
  const d = (global.window.CURSO_DATA || {})[key];
  if (!d) continue;
  const q = d.exam ? d.exam.questions : d.drills;
  out[key] = {};
  q.forEach((x) => { out[key][x.id] = x.answer || {}; });
}
process.stdout.write(JSON.stringify(out));
"""


# --------------------------------------------------------------------------
# Utilidades de comparación
# --------------------------------------------------------------------------


def sympify(s):
    """Convierte a expresión de SymPy: `i` es la unidad imaginaria."""
    txt = str(s).replace("sp.", "")
    return sp.sympify(re.sub(r"\bi\b", "I", txt), locals={"I": I, "pi": pi})


def _a_lista(v):
    """Normaliza una matriz de SymPy a lista de listas de cadenas."""
    if isinstance(v, sp.MatrixBase):
        return [[str(v[i, j]) for j in range(v.cols)] for i in range(v.rows)]
    if isinstance(v, sp.Matrix):
        return [[str(v[i, j]) for j in range(v.cols)] for i in range(v.rows)]
    return v


def eq_value(a, b) -> bool:
    """¿Son el mismo valor, admitiendo las diferencias de formato del banco?

    Las listas se comparan **en orden**: una matriz es una lista de filas y su
    orden importa. Los conjuntos (`exprset`) se comparan aparte, con
    `eq_conjunto`.
    """
    if a is None or b is None:
        return a is b
    if isinstance(a, bool) or isinstance(b, bool):
        if isinstance(a, bool) and isinstance(b, bool):
            return a == b
        return False
    a, b = _a_lista(a), _a_lista(b)
    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            return False
        return all(eq_value(x, y) for x, y in zip(a, b))
    if isinstance(a, list) != isinstance(b, list):
        return False
    if isinstance(a, dict) and isinstance(b, dict):
        if set(a) != set(b):
            return False
        return all(eq_value(a[k], b[k]) for k in a)
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(float(a) - float(b)) < 1e-9
    if str(a).strip() == str(b).strip():
        return True
    try:
        return sp.simplify(sympify(a) - sympify(b)) == 0
    except Exception:
        return False


def eq_conjunto(a, b) -> bool:
    """¿Coinciden como conjuntos no ordenados (tipo `exprset`)?"""
    if isinstance(a, list) and isinstance(b, list):
        return _empareja(a, b)
    return eq_value(a, b)


def _empareja(a: list, b: list) -> bool:
    """Empareja los elementos de dos listas sin importar el orden."""
    if len(a) != len(b):
        return False
    usado = [False] * len(b)
    for x in a:
        for j, y in enumerate(b):
            if not usado[j] and eq_value(x, y):
                usado[j] = True
                break
        else:
            return False
    return True


def expected_of(spec: dict):
    """Devuelve [(campo, valor)] del spec, sea plano o `multi`."""
    if spec.get("type") == "multi":
        return [(k, f.get("expected")) for k, f in spec.get("fields", {}).items()]
    if "expected" in spec:
        return [("__root__", spec["expected"])]
    return []


# --------------------------------------------------------------------------
# Extracción del contenido de cada script de verificación
# --------------------------------------------------------------------------


def extract_data() -> dict:
    r = subprocess.run(
        ["node", "-e", EXTRACT_JS], cwd=BASE, capture_output=True, text=True, check=True
    )
    return json.loads(r.stdout)


def _sin_exit(tree) -> ast.Module:
    """Sustituye `sys.exit(...)` por un `pass` en el árbol del script.

    Tres scripts llaman a `sys.exit()` al final del módulo; al importarlos
    para leer sus constantes, esa llamada cortaría el proceso.
    """
    for st in ast.walk(tree):
        if (
            isinstance(st, ast.Expr)
            and isinstance(st.value, ast.Call)
            and isinstance(st.value.func, ast.Attribute)
            and st.value.func.attr == "exit"
        ):
            st.value = ast.Constant(value=None)
    return ast.fix_missing_locations(tree)


def ejecutar_script(src: str, rel: str):
    """Ejecuta el script en un espacio de nombres aislado.

    Devuelve (namespace, error).
    """
    ns = {"__name__": "__crosscheck__", "__file__": str(BASE / rel), "__builtins__": __builtins__}
    buf = io.StringIO()
    try:
        tree = _sin_exit(ast.parse(src))
        with contextlib.redirect_stdout(buf):
            exec(compile(tree, rel, "exec"), ns)
    except SystemExit:
        pass
    except Exception as exc:  # noqa: BLE001 — el error se reporta, no se lanza
        return ns, f"{type(exc).__name__}: {exc}"
    return ns, None


def _id_de_decorador(node) -> str | None:
    """El identificador de ejercicio de un decorador `@check("T5-N1 …")`."""
    for dec in node.decorator_list:
        args = dec.args if isinstance(dec, ast.Call) else []
        for a in args:
            if isinstance(a, ast.Constant) and isinstance(a.value, str):
                m = ID_RE.search(a.value)
                if m:
                    return m.group(1)
    return None


def _seccion_de_comentario(linea: str) -> str | None:
    """El identificador con el que empieza una sección de comentario."""
    txt = linea.lstrip()
    if not txt.startswith("#"):
        return None
    txt = txt.lstrip("#").strip()
    txt = re.sub(r"^[-=*_:\s]+", "", txt)
    m = ID_RE.match(txt)
    return m.group(1) if m else None


def _nombres_asignados(stmts) -> set[str]:
    """Nombres que las sentencias asignan (para leerlos tras ejecutarlas)."""
    nombres: set[str] = set()
    for st in stmts:
        for n in ast.walk(st):
            if isinstance(n, ast.Assign):
                for t in n.targets:
                    nombres |= _nombres_de_destino(t)
            elif isinstance(n, (ast.AnnAssign, ast.AugAssign)):
                nombres |= _nombres_de_destino(n.target)
            elif isinstance(n, (ast.For, ast.comprehension)):
                nombres |= _nombres_de_destino(n.target)
    return nombres


def _nombres_de_destino(target) -> set[str]:
    if isinstance(target, ast.Name):
        return {target.id}
    if isinstance(target, (ast.Tuple, ast.List)):
        out: set[str] = set()
        for e in target.elts:
            out |= _nombres_de_destino(e)
        return out
    return set()


def _literales(stmts) -> list:
    """Constantes escritas literalmente en las sentencias."""
    out = []

    def valor(n):
        if isinstance(n, ast.Constant) and isinstance(n.value, (int, float, str, bool)):
            return n.value
        if isinstance(n, ast.List):
            vals = [valor(e) for e in n.elts]
            if all(v is not None for v in vals):
                return vals
        return None

    for st in stmts:
        for n in ast.walk(st):
            v = valor(n)
            if v is not None:
                out.append(v)
    return out


def _expresiones_de(stmts, local: dict) -> list:
    """Valor de las expresiones que el script evalúa dentro del bloque.

    En estos scripts el resultado suele aparecer como argumento de una
    comprobación: `check("T3-N5 autovalores {4,-2}", eq_set(A.eigenvals(), [4,-2]))`.
    Esas expresiones no quedan en ninguna variable, así que se evaluan aquí.

    El `eval` es deliberado: evalúa subexpresiones del propio script de
    verificación, que este script ya ejecuta entero de principio a fin, de
    modo que no abre una superficie de ataque nueva.
    """
    valores: list = []
    for st in stmts:
        for n in ast.walk(st):
            if not isinstance(n, ast.Call):
                continue
            func = n.func
            nombre = getattr(func, "id", None) or getattr(func, "attr", None)
            if nombre not in ("check", "ok", "eq_set", "eq", "print"):
                continue
            for a in n.args:
                try:
                    valores.append(eval(compile(ast.Expression(a), "<expr>", "eval"), local))
                except Exception:
                    continue
    return valores


def regiones(src: str) -> dict:
    """Reparte el código de un script en bloques, uno por ejercicio.

    Dos estilos conviven en los scripts:
      · funciones decoradas con `@check("T5-N1 …")` — el bloque es la función;
      · sentencias al nivel del módulo separadas por comentarios `# --- T3-N1`
        — el bloque va desde el separador hasta el siguiente.
    """
    tree = ast.parse(src)
    lineas = src.splitlines()
    bloques: dict[str, list] = {}

    # 1) Localiza los separadores de sección por número de línea.
    marcadores: list[tuple[int, str]] = []
    for i, linea in enumerate(lineas, 1):
        eid = _seccion_de_comentario(linea)
        if eid:
            marcadores.append((i, eid))

    def seccion_de(lineno: int) -> str | None:
        actual = None
        for mlin, mid in marcadores:
            if mlin <= lineno:
                actual = mid
            else:
                break
        return actual

    # 2) Recorre las sentencias de nivel superior.
    actual: list = []
    actual_id: str | None = None
    for st in tree.body:
        if isinstance(st, ast.FunctionDef):
            eid = _id_de_decorador(st)
            if eid:
                if actual_id and actual:
                    bloques.setdefault(actual_id, []).extend(actual)
                actual, actual_id = [], None
                # El bloque es la función entera: se conserva el nodo para
                # poder ejecutarla con su propio espacio de nombres.
                bloques.setdefault(eid, []).append(st)
                continue
        sid = seccion_de(st.lineno)
        if sid != actual_id:
            if actual_id and actual:
                bloques.setdefault(actual_id, []).extend(actual)
            actual, actual_id = [], sid
        actual.append(st)
    if actual_id and actual:
        bloques.setdefault(actual_id, []).extend(actual)
    return bloques


def recoger_regiones(src: str, ns: dict) -> dict:
    """Para cada ejercicio: los literales y los valores que calcula su bloque.

    Los bloques con `return` (funciones decoradas con `@check`) se ejecutan
    como funciones: se les inyecta una captura de sus variables locales. Los
    bloques de sentencias se ejecutan como código de módulo y se les captura
    el espacio de nombres tras ejecutarlos. En ambos casos la captura ocurre
    con el estado real del script, no con el final.
    """
    salida: dict[str, dict] = {}
    lineas = src.splitlines()

    for eid, stmts in regiones(src).items():
        bloque = {
            "literales": _literales(stmts),
            "locales": {},
            "expresiones": [],
            "texto": "\n".join(
                lineas[
                    min((s.lineno for s in stmts), default=1) - 1 : max(
                        (getattr(s, "end_lineno", s.lineno) for s in stmts), default=1
                    )
                ]
            ),
        }
        nombres = _nombres_asignados(stmts)
        if stmts and isinstance(stmts[0], ast.FunctionDef):
            # Bloque = una función decorada con `@check("T5-N1 …")`.
            # La sonda se inyecta en el cuerpo *antes* de cualquier `return`,
            # para que se ejecute aunque la función retorne pronto.
            captura: dict = {}
            fn = stmts[0]
            original = fn.body
            try:
                sonda = ast.parse(
                    "__captura.update({k: v for k, v in locals().items() "
                    "if k != '__captura'})"
                ).body[0]
                # Se coloca tras la última asignación del cuerpo, pero antes
                # de la primera sentencia `return`.
                corte = len(original)
                for i, st in enumerate(original):
                    if isinstance(st, ast.Return):
                        corte = i
                        break
                fn.body = [
                    ast.fix_missing_locations(n)
                    for n in (original[:corte] + [sonda] + original[corte:])
                ]
                # Se compila la función sin decorador (el decorador solo la
                # registra; su valor de retorno no interesa aquí).
                fn.decorator_list = []
                codigo = compile(
                    ast.Module(body=[fn], type_ignores=[]), "<bloque>", "exec"
                )
                local = dict(ns)
                local["__captura"] = captura
                with contextlib.redirect_stdout(io.StringIO()):
                    exec(codigo, local)
                    # La función se invoca: solo así se ejecuta su cuerpo.
                    fn_def = local.get(fn.name)
                    if callable(fn_def):
                        fn_def()
            except Exception:
                pass
            finally:
                fn.body = original
            bloque["locales"] = {k: v for k, v in captura.items() if k in nombres}
            bloque["expresiones"] = _expresiones_de(stmts, {**local, **captura})
        else:
            local = dict(ns)
            try:
                arbol = _sin_exit(ast.Module(body=stmts, type_ignores=[]))
                codigo = compile(arbol, "<bloque>", "exec")
                with contextlib.redirect_stdout(io.StringIO()):
                    exec(codigo, local)
            except Exception:
                pass
            bloque["locales"] = {k: local[k] for k in nombres if k in local}
            bloque["expresiones"] = _expresiones_de(stmts, local)
        salida[eid] = bloque
    return salida


# --------------------------------------------------------------------------
# Reglas de contraste
# --------------------------------------------------------------------------


def declarado_bool(texto: str, literales: list):
    """El booleano que el script declara explícitamente, si lo declara."""
    for lit in literales:
        if isinstance(lit, bool):
            return lit
    for patron in (
        r"expected\s*=\s*(True|False)\b",
        r"expected\s+bool\s+(true|false)\b",
        r"bool\s*->\s*(True|False)\b",
        r"expected\s*:\s*(True|False)\b",
        r"expected\s+bool\s*:\s*(true|false)\b",
    ):
        m = re.search(patron, texto)
        if m:
            return m.group(1).lower() == "true"
    return None


def _valores_de(v, prof=0):
    """Los valores que aparecen dentro de una estructura calculada.

    De una matriz se extraen sus entradas; de un diccionario, sus claves y
    sus valores; de un conjunto, sus elementos. Así se puede contrastar, por
    ejemplo, que un autovalor calculado por el script sea el que espera el
    banco, o que las claves de un `eigenvals()` coincidan.
    """
    if prof > 4:
        return
    if isinstance(v, sp.MatrixBase):
        for i in range(v.rows):
            for j in range(v.cols):
                yield v[i, j]
        return
    if isinstance(v, dict):
        for k, val in v.items():
            yield k
            yield from _valores_de(val, prof + 1)
        return
    if isinstance(v, (set, frozenset)):
        for e in v:
            yield e
        return
    if isinstance(v, (list, tuple)):
        for e in v:
            yield from _valores_de(e, prof + 1)
        return


def coincide_bloque(bloque: dict, valor) -> bool:
    """¿El bloque del ejercicio declara o calcula ese valor esperado?

    `conjunto` indica que el valor esperado es un conjunto no ordenado (tipo
    `exprset`): en ese caso el orden de los elementos no se compara.
    """
    if isinstance(valor, bool):
        declarado = declarado_bool(bloque["texto"], bloque["literales"])
        if declarado is not None and declarado == valor:
            return True
        for v in bloque["locales"].values():
            if isinstance(v, bool) and v == valor:
                return True
        return False
    compara = eq_conjunto if bloque.get("conjunto") else eq_value
    for lit in bloque["literales"]:
        if compara(lit, valor):
            return True
    for v in bloque["locales"].values():
        if compara(v, valor):
            return True
        for inner in _valores_de(v):
            if compara(inner, valor):
                return True
        # Un conjunto esperado puede ser el conjunto de claves de un
        # diccionario de multiplicidades (p. ej. `A.eigenvals()`).
        if isinstance(v, dict) and isinstance(valor, list):
            if _empareja(list(v.keys()), valor):
                return True
    # Por último, el valor de las expresiones que el script calcula
    # (p. ej. `A.eigenvals()` o `D.det()`), que no queda en ninguna variable.
    for expr in bloque.get("expresiones", []):
        if compara(expr, valor):
            return True
        for inner in _valores_de(expr):
            if compara(inner, valor):
                return True
    return False


def comparar_estatico(valor, spec: dict):
    """Compara la copia estática de un script con el spec del banco.

    Devuelve (n_valores, divergencias).
    """
    div: list[str] = []
    n = 0
    if isinstance(valor, dict) and "fields" in valor:
        campos = valor["fields"]
        campos_datos = spec.get("fields", {}) if spec.get("type") == "multi" else {}
        if set(campos) != set(campos_datos):
            return 0, [f"campos {sorted(campos)} ≠ datos {sorted(campos_datos)}"]
        for k in campos:
            v = campos[k]
            v = v.get("expected") if isinstance(v, dict) else v
            ev = campos_datos[k].get("expected")
            n += 1
            if not eq_value(v, ev):
                div.append(f"{k}: script={v!r} datos={ev!r}")
        return n, div
    if isinstance(valor, dict) and "expected" in valor:
        v = valor["expected"]
    else:
        v = valor
    if spec.get("type") == "multi":
        # El script guarda el multi como dict plano {campo: valor}.
        campos_datos = {k: f.get("expected") for k, f in spec.get("fields", {}).items()}
        if isinstance(v, dict) and set(v) == set(campos_datos):
            for k in v:
                n += 1
                if not eq_value(v[k], campos_datos[k]):
                    div.append(f"{k}: script={v[k]!r} datos={campos_datos[k]!r}")
            return n, div
        return 0, ["multi con forma inesperada"]
    ev = spec.get("expected")
    n = 1
    if not eq_value(v, ev):
        div.append(f"script={v!r} datos={ev!r}")
    return n, div


def extract_static_expected(src: str) -> dict:
    """Lee el diccionario EXPECTED = {...} de un script, si existe."""
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id == "EXPECTED" for t in node.targets
        ):
            try:
                val = ast.literal_eval(node.value)
            except Exception:
                return {}
            return val if isinstance(val, dict) else {}
    return {}


# --------------------------------------------------------------------------


def main() -> int:
    data = extract_data()
    total_ej = sum(len(v) for v in data.values())
    problemas: list[str] = []
    contrastados = 0
    ids_contrastados: set[str] = set()

    for rel, clave in SCRIPTS.items():
        path = BASE / rel
        if not path.exists():
            problemas.append(f"{rel}: no existe")
            continue
        src = path.read_text(encoding="utf-8")
        spec_de = data.get(clave, {})

        ns, err = ejecutar_script(src, rel)
        if err:
            problemas.append(f"{rel}: no se pudo ejecutar ({err})")
            continue

        # 1) Copia estática: diccionario EXPECTED.
        estatico = extract_static_expected(src)
        for eid, valor in estatico.items():
            if eid not in spec_de:
                problemas.append(f"{rel}: {eid} no está en assets/data/{clave}.js")
                continue
            ids_contrastados.add(eid)
            n, div = comparar_estatico(valor, spec_de[eid])
            contrastados += n
            for d in div:
                problemas.append(f"{rel}: {eid} {d}")

        # 2) Bloques que recalculan: literales y valores calculados.
        bloques = recoger_regiones(src, ns)
        for eid, bloque in bloques.items():
            if eid in estatico:
                continue
            if eid not in spec_de:
                problemas.append(f"{rel}: {eid} no está en assets/data/{clave}.js")
                continue
            ids_contrastados.add(eid)
            spec = spec_de[eid]
            # Un `exprset` es un conjunto no ordenado: se compara como tal.
            conjunto = spec.get("type") == "exprset" or (
                spec.get("type") == "multi"
                and any(f.get("type") == "exprset" for f in spec.get("fields", {}).values())
            )
            bloque["conjunto"] = conjunto
            for campo, ev in expected_of(spec):
                if ev is None:
                    continue
                contrastados += 1
                if not coincide_bloque(bloque, ev):
                    problemas.append(
                        f"{rel}: {eid}.{campo} = {ev!r} no lo declara ni lo calcula el script"
                    )

    faltan = sorted(set(data.keys()) and {i for v in data.values() for i in v} - ids_contrastados)
    print(f"Ejercicios en el banco: {total_ej}")
    print(f"Ejercicios contrastados contra su script: {len(ids_contrastados)}")
    print(f"Valores comparados: {contrastados}")
    if faltan:
        print(f"Sin script que los contraste: {len(faltan)} → {', '.join(faltan)}")
    if problemas:
        print(f"\nDIVERGENCIAS: {len(problemas)}")
        for p in problemas:
            print("  - " + p)
        return 1
    print(
        f"\nOK: {contrastados}/{contrastados} valores coinciden entre "
        f"assets/data/ y los scripts de verificación."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
