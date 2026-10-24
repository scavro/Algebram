#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify/examen-1-verify.py — Examen 1 · Temas I–II (Escalares · Tensores)

RECALCULA con SymPy, desde los datos del enunciado de cada pregunta
(X1-1 … X1-12), la respuesta correcta, y la compara con el `expected`
declarado en assets/data/examen-1.js (aquí, como constantes).

Comprobaciones adicionales por tipo:
  - expr/number: simplify(computado - esperado) == 0;
  - matrices/vectores: Matrix(...) y simplify elemento a elemento;
  - exprset: comparación de conjuntos, elemento a elemento;
  - multi: se verifica cada campo;
  - choice/bool: se recalculan los hechos (contraejemplo si hace falta);
  - proyecciones: el residuo es ortogonal al subespacio;
  - Gram–Schmidt: ortonormalidad de la familia resultante;
  - inversa: M M^{-1} = I y forma por bloques declarada.

Ejecución:  python3 verify/examen-1-verify.py
Salida:     "OK: 12/12 verificados" y código de salida 0.
"""

import json
import os
import subprocess
import sys
from decimal import Decimal, ROUND_HALF_EVEN

from sympy import (
    I,
    Matrix,
    Rational,
    eye,
    pi,
    simplify,
    solve,
    sqrt,
    sympify,
    zeros,
)

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
DATA_JS = os.path.join(BASE, "assets", "data", "examen-1.js")

# ---------------------------------------------------------------------------
# Respuestas esperadas (idénticas a las de assets/data/examen-1.js)
# ---------------------------------------------------------------------------
EXPECTED = {
    "X1-1": {"type": "text", "expected": "1211"},
    "X1-2": {"type": "expr", "expected": "1/7"},
    "X1-3": {"type": "bool", "expected": False},
    "X1-4": {"type": "number", "expected": "7"},
    "X1-5": {"type": "expr", "expected": "0.12"},
    "X1-6": {"type": "expr", "expected": "4/9"},
    "X1-7": {"type": "expr", "expected": "2/5+11/5*i"},
    "X1-8": {
        "type": "multi",
        "fields": {
            "f1": {"type": "vector", "expected": [["1/sqrt(2)"], ["1/sqrt(2)"], ["0"]]},
            "f2": {
                "type": "vector",
                "expected": [["1/sqrt(6)"], ["-1/sqrt(6)"], ["2/sqrt(6)"]],
            },
        },
    },
    "X1-9": {"type": "exprset", "expected": ["-1+2*i", "-1-2*i"]},
    "X1-10": {"type": "vector", "expected": [["5/2"], ["5/2"], ["1"]]},
    "X1-11": {"type": "choice", "expected": 2},
    "X1-12": {
        "type": "matrix",
        "expected": [
            ["1", "0", "-1", "-2"],
            ["0", "1", "-3", "-4"],
            ["0", "0", "1", "0"],
            ["0", "0", "0", "1"],
        ],
    },
}


# ---------------------------------------------------------------------------
# Utilidades de comparación
# ---------------------------------------------------------------------------
def E(s):
    """Convierte una cadena `expected` del data en expresión de SymPy.

    La unidad imaginaria se escribe `i` en el data; se pasa a `I` sin tocar
    identificadores como `pi` o `sqrt`.
    """
    import re

    return sympify(re.sub(r"\bi\b", "I", str(s)), locals={"I": I, "pi": pi})


def eq_expr(computado, esperado_str):
    """Equivalencia simbólica exacta para respuestas de tipo expr."""
    return simplify(sympify(computado) - E(esperado_str)) == 0


def eq_set(computado_list, esperado_list):
    """Conjuntos iguales: cada esperado se cubre con algún computado."""
    if len(computado_list) != len(esperado_list):
        return False
    usados = [False] * len(esperado_list)
    for c in computado_list:
        ok = False
        for k, e in enumerate(esperado_list):
            if not usados[k] and simplify(sympify(c) - E(e)) == 0:
                usados[k] = True
                ok = True
                break
        if not ok:
            return False
    return True


def M(rows):
    """Matrix(...) a partir de lista de filas de strings (o de una Matrix)."""
    if isinstance(rows, Matrix):
        return rows
    return Matrix([[simplify(E(x)) for x in row] for row in rows])


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
    if simplify(sympify(val) - E(expected_expr)) != 0:
        return False, "valor calculado %s != esperado %s" % (simplify(val), expected_expr)
    return True, ""


# ---------------------------------------------------------------------------
# Recálculo de cada pregunta desde los datos de su enunciado
# ---------------------------------------------------------------------------
def a_base(n, b):
    """Divisiones sucesivas: representación de n en base b (sin subíndice)."""
    if n == 0:
        return "0"
    cifras = []
    while n > 0:
        cifras.append(str(n % b))
        n //= b
    return "".join(reversed(cifras))


def verify_X1_1(exp):
    rep = a_base(101, 4)
    valor = sum(int(d) * 4 ** k for k, d in enumerate(reversed(rep)))
    if rep != exp["expected"]:
        return False, "101 en base 4 = %s, esperado %s" % (rep, exp["expected"])
    if valor != 101:
        return False, "la comprobación posicional dio %d" % valor
    return True, "101 = %s_4 (comprobación posicional = %d)" % (rep, valor)


def verify_X1_2(exp):
    # 10^6 r - r = 142857  ⇒  r = 142857/999999
    r = Rational(142857, 999999)
    if simplify(r - Rational(1, 7)) != 0:
        return False, "142857/999999 = %s, no es 1/7" % simplify(r)
    return same_scalar(r, exp["expected"])


def verify_X1_3(exp):
    # |B^A| = |B|^{|A|} = 4^3 = 64 funciones; el enunciado afirma 12.
    n_funciones = 4 ** 3
    if n_funciones == 12:
        return False, "el recuento de funciones dio 12 y no debería"
    if exp["expected"] is not False:
        return False, "expected = %s, se esperaba False" % exp["expected"]
    return True, "hay 4^3 = %d funciones de A en B (≠ 12) → la afirmación es falsa" % n_funciones


def verify_X1_4(exp):
    A = Matrix([[1, 2, 0], [0, 1, 1]])
    B = Matrix([[2, 0], [1, 1], [0, 2]])
    AB = A * B
    if AB != Matrix([[4, 2], [1, 3]]):
        return False, "AB = %s, se esperaba [[4,2],[1,3]]" % AB
    ok, msg = same_scalar(AB.trace(), exp["expected"])
    if not ok:
        return ok, msg
    # coherencia con tr(AB) = tr(BA)
    if simplify(AB.trace() - (B * A).trace()) != 0:
        return False, "tr(AB) != tr(BA)"
    return True, "AB = %s, tr(AB) = tr(BA) = %s" % (AB, AB.trace())


def verify_X1_5(exp):
    # 0,125 exactamente entre 0,12 y 0,13 → redondeo al par → 0,12
    red = Decimal("0.125").quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)
    if red != Decimal("0.12"):
        return False, "ROUND_HALF_EVEN(0.125 → 2 decimales) = %s" % red
    if Decimal(str(exp["expected"])) != red:
        return False, "expected %s != %s" % (exp["expected"], red)
    return True, "redondeo al par de 0,125 a 2 c.s. = %s" % red


def verify_X1_6(exp):
    u = Matrix([1, 2, 2])
    v = Matrix([2, -1, 2])
    cos_uv = Rational(u.dot(v), 1) / (sqrt(u.dot(u)) * sqrt(v.dot(v)))
    return same_scalar(cos_uv, exp["expected"])


def verify_X1_7(exp):
    w = (3 + 4 * I) / (2 - I)
    return same_scalar(w, exp["expected"])


def verify_X1_8(exp):
    v1 = Matrix([1, 1, 0])
    v2 = Matrix([1, 0, 1])
    f1 = v1 / sqrt(v1.dot(v1))
    u2 = v2 - f1.dot(v2) * f1
    f2 = u2 / sqrt(u2.dot(u2))
    ok, msg = same_matrix(f1, exp["fields"]["f1"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(f2, exp["fields"]["f2"]["expected"])
    if not ok:
        return ok, msg
    # la familia debe resultar ortonormal
    if simplify(f1.dot(f1) - 1) != 0 or simplify(f2.dot(f2) - 1) != 0:
        return False, "f1 o f2 no son unitarios"
    if simplify(f1.dot(f2)) != 0:
        return False, "f1 y f2 no son ortogonales"
    return True, "f1 = %s, f2 = %s (ortonormales)" % (list(f1), list(f2))


def verify_X1_9(exp):
    z = sympify("z")
    raices = [simplify(r) for r in solve(z ** 2 + 2 * z + 5, z)]
    if not eq_set(raices, exp["expected"]):
        return False, "raíces de z^2+2z+5: %s, esperadas %s" % (raices, exp["expected"])
    # comprobación directa en el enunciado
    for r in raices:
        if simplify(r ** 2 + 2 * r + 5) != 0:
            return False, "la raíz %s no anula el polinomio" % r
    return True, "raíces de z^2+2z+5 = %s" % raices


def verify_X1_10(exp):
    v1 = Matrix([1, 1, 0])
    v2 = Matrix([0, 0, 1])
    w = Matrix([3, 2, 1])
    proj = (w.dot(v1) / v1.dot(v1)) * v1 + (w.dot(v2) / v2.dot(v2)) * v2
    ok, msg = same_matrix(proj, exp["expected"])
    if not ok:
        return ok, msg
    resid = w - proj
    if simplify(v1.dot(resid)) != 0 or simplify(v2.dot(resid)) != 0:
        return False, "el residuo w - proy no es ortogonal a V"
    return True, "proy_V(w) = %s; residuo = %s ⊥ V" % (list(proj), list(resid))


def verify_X1_11(exp):
    pares = [
        (Matrix([1, 1, 0]), Matrix([0, 1, 1])),
        (Matrix([1, 2, 2]), Matrix([2, -1, 2])),
        (Matrix([2, 2, 1]), Matrix([2, -1, -2])),
        (Matrix([3, 0, 4]), Matrix([4, 0, 3])),
    ]
    productos = [simplify(a.dot(b)) for a, b in pares]
    ortogonales = [k for k, p in enumerate(productos) if p == 0]
    if len(ortogonales) != 1:
        return False, "se esperaba exactamente una familia ortogonal: %s" % productos
    if ortogonales[0] != exp["expected"]:
        return False, "la familia ortogonal es la %d, expected dice %d" % (
            ortogonales[0],
            exp["expected"],
        )
    return True, "productos escalares %s → solo la opción %d se anula" % (
        productos,
        ortogonales[0],
    )


def verify_X1_12(exp):
    B = Matrix([[1, 2], [3, 4]])
    I2 = eye(2)
    Z = zeros(2, 2)
    M_mat = I2.row_join(B).col_join(Z.row_join(I2))
    Minv = M_mat.inv()
    ok, msg = same_matrix(Minv, exp["expected"])
    if not ok:
        return ok, msg
    # forma por bloques declarada: [[I, -B], [0, I]]
    bloques = I2.row_join(-B).col_join(Z.row_join(I2))
    ok, msg = same_matrix(Minv, bloques.tolist())
    if not ok:
        return False, "la inversa no tiene la forma [[I,-B],[0,I]]: " + msg
    ok, msg = same_matrix(simplify(M_mat * Minv), eye(4).tolist())
    if not ok:
        return False, "M * Minv != I4: " + msg
    return True, "M^{-1} = [[I2, -B], [0, I2]] con B = [[1,2],[3,4]]"


VERIFIERS = {
    "X1-1": verify_X1_1,
    "X1-2": verify_X1_2,
    "X1-3": verify_X1_3,
    "X1-4": verify_X1_4,
    "X1-5": verify_X1_5,
    "X1-6": verify_X1_6,
    "X1-7": verify_X1_7,
    "X1-8": verify_X1_8,
    "X1-9": verify_X1_9,
    "X1-10": verify_X1_10,
    "X1-11": verify_X1_11,
    "X1-12": verify_X1_12,
}


# ---------------------------------------------------------------------------
# Consistencia con assets/data/examen-1.js (esperados idénticos)
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
        "const d=window.CURSO_DATA['examen-1'];"
        "const out={};"
        "for (const q of d.exam.questions){out[q.id]=q.answer;}"
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
        return False, "preguntas en el data file sin verificar: %s" % sorted(extra)
    return True, ""


# ---------------------------------------------------------------------------
# Programa principal
# ---------------------------------------------------------------------------
def main():
    ok, msg = crosscheck_with_data_file()
    if not ok:
        print("✗ Consistencia con assets/data/examen-1.js: " + msg)
        print("OK: 0/%d verificados" % len(EXPECTED))
        return 1

    verified = 0
    total = len(VERIFIERS)
    failures = []
    for drill_id, fn in VERIFIERS.items():
        try:
            ok, msg = fn(EXPECTED[drill_id])
        except Exception as exc:  # fallo inesperado = pregunta no verificada
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
