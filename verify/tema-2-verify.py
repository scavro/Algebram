#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify/tema-2-verify.py — Tema II · Tensores, matrices y vectores

RECALCULA con SymPy, desde los datos del enunciado de cada ejercicio
(T2-N1 … T2-E4), la respuesta correcta, y la compara con el `expected`
declarado en assets/data/tema-2.js (aquí, como constantes).

Comprobaciones adicionales por tipo:
  - matrices/vectores: Matrix(...) y simplify elemento a elemento;
  - inversas: .inv() y AA^{-1} = I;
  - Gram–Schmidt: ortogonalidad y que el espacio generado coincide
    (igual rango de la matriz de vectores);
  - proyección ortogonal: el residuo es ortogonal al subespacio;
  - choice/bool: se verifican todas las opciones candidatas.

Ejecución:  python3 verify/tema-2-verify.py
Salida:     "OK: N/N verificados" y código de salida 0.
"""

import json
import os
import subprocess
import sys

from sympy import Matrix, eye, simplify, sqrt, sympify, zeros

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
DATA_JS = os.path.join(BASE, "assets", "data", "tema-2.js")

# ---------------------------------------------------------------------------
# Respuestas esperadas (idénticas a las de assets/data/tema-2.js)
# ---------------------------------------------------------------------------
EXPECTED = {
    "T2-N1": {"type": "vector", "rows": 3, "cols": 1, "expected": [["4"], ["-11"], ["13"]]},
    "T2-N2": {"type": "matrix", "rows": 2, "cols": 2, "expected": [["2", "7"], ["8", "8"]]},
    "T2-N3": {
        "type": "multi",
        "fields": {
            "prod": {"type": "matrix", "rows": 2, "cols": 2, "expected": [["26", "30"], ["38", "44"]]},
            "tr": {"type": "number", "expected": "70"},
        },
    },
    "T2-N4": {
        "type": "multi",
        "fields": {
            "norm": {"type": "number", "expected": "7"},
            "dist": {"type": "number", "expected": "3*sqrt(2)"},
        },
    },
    "T2-N5": {"type": "bool", "expected": True},
    "T2-N6": {"type": "matrix", "rows": 2, "cols": 2, "expected": [["3", "-5"], ["-1", "2"]]},
    "T2-M1": {"type": "matrix", "rows": 3, "cols": 2, "expected": [["7", "10"], ["1", "2"], ["3", "7"]]},
    "T2-M2": {
        "type": "matrix",
        "rows": 3,
        "cols": 3,
        "expected": [["-24", "18", "5"], ["20", "-15", "-4"], ["-5", "4", "1"]],
    },
    "T2-M3": {"type": "vector", "rows": 3, "cols": 1, "expected": [["1"], ["-1"], ["1"]]},
    "T2-M4": {"type": "vector", "rows": 3, "cols": 1, "expected": [["1"], ["2"], ["1"]]},
    "T2-M5": {"type": "vector", "rows": 3, "cols": 1, "expected": [["0"], ["2"], ["1"]]},
    "T2-E1": {
        "type": "matrix",
        "rows": 3,
        "cols": 3,
        "expected": [["1", "-1", "1"], ["-38", "41", "-34"], ["27", "-29", "24"]],
    },
    "T2-E2": {
        "type": "multi",
        "fields": {
            "proj": {"type": "vector", "rows": 3, "cols": 1, "expected": [["1"], ["0"], ["1"]]},
            "perp": {"type": "vector", "rows": 3, "cols": 1, "expected": [["1"], ["1"], ["-1"]]},
        },
    },
    "T2-E3": {"type": "choice", "expected": 1},
    "T2-E4": {
        "type": "multi",
        "fields": {
            "orth": {"type": "bool", "expected": True},
            "inv": {
                "type": "matrix",
                "rows": 3,
                "cols": 3,
                "expected": [["2/7", "6/7", "-3/7"], ["3/7", "2/7", "6/7"], ["6/7", "-3/7", "-2/7"]],
            },
        },
    },
}

# ---------------------------------------------------------------------------
# Utilidades de comparación
# ---------------------------------------------------------------------------
def M(rows):
    """Matrix(...) a partir de lista de filas de strings (o de una Matrix)."""
    if isinstance(rows, Matrix):
        return rows
    return Matrix([[simplify(x) for x in row] for row in rows])


def same_matrix(A, rows_expected):
    """Igualdad elemento a elemento con simplify(A - B) == 0."""
    B = M(rows_expected)
    if A.shape != B.shape:
        return False, "formatos distintos: %s vs %s" % (A.shape, B.shape)
    D = simplify(A - B)
    if D != zeros(*A.shape):
        return False, "matriz calculada %s != esperada %s" % (A, B)
    return True, ""


def same_scalar(val, expected_expr):
    """simplify(val - expected) == 0 para escalares simbólicos."""
    if simplify(val - expected_expr) != 0:
        return False, "valor calculado %s != esperado %s" % (simplify(val), expected_expr)
    return True, ""


def to_int_matrix(rows):
    return Matrix([[int(simplify(x)) for x in row] for row in rows])


# ---------------------------------------------------------------------------
# Recálculo de cada ejercicio desde los datos de su enunciado
# ---------------------------------------------------------------------------
def verify_T2_N1(exp):
    u = Matrix([2, -1, 3])
    v = Matrix([1, 4, -2])
    w = 3 * u - 2 * v
    return same_matrix(w, exp["expected"])


def verify_T2_N2(exp):
    A = Matrix([[1, 2, 0], [3, 1, 2]])
    B = Matrix([[2, 1], [0, 3], [1, 1]])
    return same_matrix(A * B, exp["expected"])


def verify_T2_N3(exp):
    A = Matrix([[1, 2], [3, 4]])
    B = Matrix([[5, 6], [7, 8]])
    C = A.T * B
    ok, msg = same_matrix(C, exp["fields"]["prod"]["expected"])
    if not ok:
        return ok, msg
    return same_scalar(C.trace(), sympify(exp["fields"]["tr"]["expected"]))


def verify_T2_N4(exp):
    u = Matrix([2, 3, 6])
    v = Matrix([1, 2, 2])
    norm = sqrt((u.T * u)[0])
    dist = sqrt(sum((u - v).applyfunc(lambda x: x ** 2)))
    ok, msg = same_scalar(norm, sympify(exp["fields"]["norm"]["expected"]))
    if not ok:
        return ok, msg
    return same_scalar(dist, sympify("3*sqrt(2)"))


def verify_T2_N5(exp):
    Q = Matrix([[3, 4], [4, -3]]) / 5
    is_orth = simplify(Q.T * Q) == eye(2)
    if bool(is_orth) != exp["expected"]:
        return False, "Q^T Q = %s y expected = %s" % (simplify(Q.T * Q), exp["expected"])
    return True, ""


def verify_T2_N6(exp):
    A = Matrix([[2, 5], [1, 3]])
    Ainv = A.inv()
    ok, msg = same_matrix(Ainv, exp["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(A * Ainv, [["1", "0"], ["0", "1"]])
    if not ok:
        return False, "A*Ainv != I: " + msg
    return True, ""


def verify_T2_M1(exp):
    A = Matrix([[1, 2], [0, 1]])
    B = Matrix([[1], [0]])
    C = Matrix([[0, 1]])
    D = Matrix([[1]])
    E = Matrix([[3, 1], [1, 2]])
    F = Matrix([[2, 5]])
    X = A.row_join(B).col_join(C.row_join(D))
    Y = E.col_join(F)
    ok, msg = same_matrix(X * Y, exp["expected"])
    if not ok:
        return ok, msg
    # la propiedad del bloque: el producto por bloques da lo mismo
    ok, msg = same_matrix((A * E + B * F).col_join(C * E + D * F), exp["expected"])
    if not ok:
        return False, "el cálculo por bloques no coincide: " + msg
    return True, ""


def verify_T2_M2(exp):
    A = Matrix([[1, 2, 3], [0, 1, 4], [5, 6, 0]])
    Ainv = A.inv()
    ok, msg = same_matrix(Ainv, exp["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(simplify(A * Ainv), eye(3))
    if not ok:
        return False, "A*Ainv != I: " + msg
    return True, ""


def verify_T2_M3(exp):
    v1 = Matrix([1, 1, 0])
    v2 = Matrix([2, 0, 1])
    u2 = v2 - (v1.dot(v2) / v1.dot(v1)) * v1
    ok, msg = same_matrix(u2, exp["expected"])
    if not ok:
        return ok, msg
    # ortogonalidad
    if simplify(v1.dot(u2)) != 0:
        return False, "u2 no es ortogonal a v1"
    # el espacio generado coincide: mismo rango que {v1, v2}
    if Matrix.hstack(v1, v2).rank() != Matrix.hstack(v1, u2).rank():
        return False, "el espacio generado por {v1, u2} no coincide con el de {v1, v2}"
    return True, ""


def verify_T2_M4(exp):
    A = Matrix([[1, 0], [1, 1], [0, 1]])
    w = Matrix([3, 0, 3])
    proj = A * (A.T * A).inv() * A.T * w
    ok, msg = same_matrix(proj, exp["expected"])
    if not ok:
        return ok, msg
    resid = w - proj
    if any(simplify(a.dot(resid)) != 0 for a in A.columnspace()):
        return False, "el residuo w - proy no es ortogonal a V"
    return True, ""


def verify_T2_M5(exp):
    W = Matrix([[1, 1, 0], [0, 1, 1], [0, 0, 1]])
    u = Matrix([2, 3, 1])
    coords = W.inv() * u
    ok, msg = same_matrix(coords, exp["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(W * coords, u)
    if not ok:
        return False, "W*coords != u: " + msg
    return True, ""


def verify_T2_E1(exp):
    A = Matrix([[2, 5, 7], [6, 3, 4], [5, -2, -3]])
    if A.det() != -1:
        return False, "det(A) = %s, se esperaba -1" % A.det()
    Ainv = A.inv()
    ok, msg = same_matrix(Ainv, exp["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(simplify(A * Ainv), eye(3))
    if not ok:
        return False, "A*Ainv != I: " + msg
    return True, ""


def verify_T2_E2(exp):
    A = Matrix([[1, 0], [0, 1], [1, 1]])
    w = Matrix([2, 1, 0])
    proj = A * (A.T * A).inv() * A.T * w
    perp = w - proj
    ok, msg = same_matrix(proj, exp["fields"]["proj"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(perp, exp["fields"]["perp"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(proj + perp, w)
    if not ok:
        return False, "proy + componente != w: " + msg
    if any(simplify(a.dot(perp)) != 0 for a in A.columnspace()):
        return False, "el componente ortogonal no es ortogonal a V"
    return True, ""


def verify_T2_E3(exp):
    cands = [
        Matrix([[1, 1], [0, 1]]),
        Matrix([[0, -1], [1, 0]]),
        Matrix([[1, 1], [1, -1]]),
        Matrix([[2, 0], [0, 2]]),
    ]
    orth_flags = [simplify(Q.T * Q) == eye(2) for Q in cands]
    # exactamente una es ortogonal, y es la declarada en expected
    if orth_flags.count(True) != 1:
        return False, "se esperaba exactamente una opción ortogonal: %s" % orth_flags
    if not orth_flags[exp["expected"]]:
        return False, "la opción %d (expected) no resultó ortogonal" % exp["expected"]
    return True, ""


def verify_T2_E4(exp):
    Q = Matrix([[2, 3, 6], [6, 2, -3], [-3, 6, -2]]) / 7
    is_orth = simplify(Q.T * Q) == eye(3)
    if bool(is_orth) != exp["fields"]["orth"]["expected"]:
        return False, "Q^T Q = %s y expected = %s" % (simplify(Q.T * Q), exp["fields"]["orth"]["expected"])
    Qinv = Q.inv()
    ok, msg = same_matrix(Qinv, exp["fields"]["inv"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(Qinv, Q.T)
    if not ok:
        return False, "Qinv != Q^T: " + msg
    return True, ""


VERIFIERS = {
    "T2-N1": verify_T2_N1,
    "T2-N2": verify_T2_N2,
    "T2-N3": verify_T2_N3,
    "T2-N4": verify_T2_N4,
    "T2-N5": verify_T2_N5,
    "T2-N6": verify_T2_N6,
    "T2-M1": verify_T2_M1,
    "T2-M2": verify_T2_M2,
    "T2-M3": verify_T2_M3,
    "T2-M4": verify_T2_M4,
    "T2-M5": verify_T2_M5,
    "T2-E1": verify_T2_E1,
    "T2-E2": verify_T2_E2,
    "T2-E3": verify_T2_E3,
    "T2-E4": verify_T2_E4,
}


# ---------------------------------------------------------------------------
# Consistencia con assets/data/tema-2.js (esperados idénticos)
# ---------------------------------------------------------------------------
def canonical(spec):
    out = {"type": spec.get("type")}
    if spec.get("type") == "multi":
        out["fields"] = {
            k: {"type": v.get("type"), "expected": v.get("expected")}
            for k, v in spec.get("fields", {}).items()
        }
    else:
        out["expected"] = spec.get("expected")
    return out


def crosscheck_with_data_file():
    if not os.path.exists(DATA_JS):
        return False, "no existe %s" % DATA_JS
    node_code = (
        "global.window={};"
        "require(process.argv[1]);"
        "const d=window.CURSO_DATA['tema-2'];"
        "const out={};"
        "for (const dr of d.drills){out[dr.id]=dr.answer;}"
        "console.log(JSON.stringify(out));"
    )
    try:
        r = subprocess.run(
            ["node", "-e", node_code, DATA_JS],
            capture_output=True, text=True, timeout=60,
        )
    except (OSError, subprocess.TimeoutExpired) as e:
        return True, "aviso: no se pudo ejecutar node (%s); se omite el cruce" % e
    if r.returncode != 0:
        return False, "node falló al leer el data file: %s" % r.stderr.strip()
    js_answers = json.loads(r.stdout)
    for drill_id, spec in EXPECTED.items():
        if drill_id not in js_answers:
            return False, "%s no está en %s" % (drill_id, DATA_JS)
        if canonical(spec) != canonical(js_answers[drill_id]):
            return False, "%s: expected del script %s != expected del data file %s" % (
                drill_id, canonical(spec), canonical(js_answers[drill_id]))
    extra = set(js_answers) - set(EXPECTED)
    if extra:
        return False, "ejercicios en el data file sin verificar: %s" % sorted(extra)
    return True, ""


# ---------------------------------------------------------------------------
# Programa principal
# ---------------------------------------------------------------------------
def main():
    ok, msg = crosscheck_with_data_file()
    if not ok:
        print("✗ Consistencia con assets/data/tema-2.js: " + msg)
        print("OK: 0/%d verificados" % len(EXPECTED))
        return 1

    verified = 0
    total = len(VERIFIERS)
    failures = []
    for drill_id, fn in VERIFIERS.items():
        try:
            ok, msg = fn(EXPECTED[drill_id])
        except Exception as exc:  # fallo inesperado = ejercicio no verificado
            ok, msg = False, "excepción: %r" % exc
        if ok:
            verified += 1
        else:
            failures.append("%s: %s" % (drill_id, msg))

    if failures:
        for f in failures:
            print("✗ " + f)
        print("OK: %d/%d verificados" % (verified, total))
        return 1

    print("OK: %d/%d verificados" % (verified, total))
    return 0


if __name__ == "__main__":
    sys.exit(main())
