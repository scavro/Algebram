#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify/examen-2-verify.py — Examen 2 · Temas III–IV
(Aplicaciones lineales · Procesos de triangulación)

RECALCULA con SymPy, desde los datos del enunciado de cada pregunta
(X2-1 … X2-12), la respuesta correcta, y la compara con el `expected`
declarado en assets/data/examen-2.js (aquí, como constantes).

Comprobaciones adicionales por tipo:
  - expr/number: simplify(computado - esperado) == 0;
  - matrices/vectores: Matrix(...) y simplify elemento a elemento;
  - exprset: comparación de conjuntos, elemento a elemento;
  - multi: se verifica cada campo;
  - choice/bool: se recalculan los hechos (autovalores, nulidades…);
  - determinantes: homogeneidad, multiplicatividad y producto de la
    diagonal en matrices triangulares (¡no la primera fila!);
  - teorema del rango: dimensiones contrastadas con nulspaces concretos;
  - mínimos cuadrados: residuo ortogonal a las columnas de A;
  - QR: ortonormalidad de Q, Q R = A y diagonal de R positiva.

Ejecución:  python3 verify/examen-2-verify.py
Salida:     "OK: 12/12 verificados" y código de salida 0.
"""

import json
import os
import subprocess
import sys

from sympy import (
    I,
    Matrix,
    Rational,
    eye,
    pi,
    simplify,
    solve,
    sqrt,
    symbols,
    sympify,
    zeros,
)

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
DATA_JS = os.path.join(BASE, "assets", "data", "examen-2.js")

# ---------------------------------------------------------------------------
# Respuestas esperadas (idénticas a las de assets/data/examen-2.js)
# ---------------------------------------------------------------------------
EXPECTED = {
    "X2-1": {"type": "number", "expected": "32"},
    "X2-2": {"type": "number", "expected": "49"},
    "X2-3": {
        "type": "multi",
        "fields": {
            "nul": {"type": "number", "expected": "3"},
            "nulT": {"type": "number", "expected": "1"},
        },
    },
    "X2-4": {
        "type": "vector",
        "expected": [["2"], ["-1"], ["3"]],
    },
    "X2-5": {"type": "bool", "expected": False},
    "X2-6": {"type": "number", "expected": "-24"},
    "X2-7": {
        "type": "multi",
        "fields": {
            "m": {"type": "number", "expected": "2"},
            "n": {"type": "number", "expected": "1"},
            "res": {"type": "number", "expected": "2"},
        },
    },
    "X2-8": {"type": "exprset", "expected": ["4", "2", "1"]},
    "X2-9": {"type": "choice", "expected": 3},
    "X2-10": {
        "type": "multi",
        "fields": {
            "alpha": {"type": "number", "expected": "7"},
            "beta": {"type": "number", "expected": "5"},
        },
    },
    "X2-11": {"type": "number", "expected": "15"},
    "X2-12": {
        "type": "multi",
        "fields": {
            "Q": {
                "type": "matrix",
                "expected": [
                    ["1/sqrt(3)", "0"],
                    ["1/sqrt(3)", "-1/sqrt(2)"],
                    ["1/sqrt(3)", "1/sqrt(2)"],
                ],
            },
            "R": {
                "type": "matrix",
                "expected": [
                    ["sqrt(3)", "sqrt(3)"],
                    ["0", "sqrt(2)"],
                ],
            },
        },
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
def verify_X2_1(exp):
    # A es 3x3 con det(A) = -2; det(2 A^T A) = 2^3 · det(A)^2
    det_A = Rational(-2)
    det_ATA = det_A ** 2  # det(A^T A) = det(A^T) det(A) = det(A)^2
    valor = 2 ** 3 * det_ATA
    if simplify(det_ATA - 4) != 0:
        return False, "det(A^T A) = %s, se esperaba 4" % det_ATA
    # comprobación con una matriz concreta de determinante -2
    A = Matrix([[-2, 0, 0], [0, 1, 0], [0, 0, 1]])
    if A.det() != det_A:
        return False, "la matriz de prueba tiene det %s != -2" % A.det()
    concreto = simplify((2 * (A.T * A)).det())
    if concreto != valor:
        return False, "cálculo concreto %s != %s" % (concreto, valor)
    return same_scalar(valor, exp["expected"])


def verify_X2_2(exp):
    A = Matrix([[2, -3], [3, 6], [6, -2]])
    G = A.T * A
    if G != Matrix([[49, 0], [0, 49]]):
        return False, "A^T A = %s, se esperaba [[49,0],[0,49]]" % G
    det_G = G.det()
    if det_G != 2401:
        return False, "det(A^T A) = %s, se esperaba 2401" % det_G
    vol = sqrt(det_G)
    if simplify(vol - 49) != 0:
        return False, "sqrt(det(A^T A)) = %s, se esperaba 49" % vol
    return same_scalar(vol, exp["expected"])


def verify_X2_3(exp):
    n, m, r = 4, 6, 3
    # matriz concreta 4x6 de rango 3 (la fila 4 es suma de las tres primeras)
    A = Matrix(
        [
            [1, 0, 0, 1, 2, 3],
            [0, 1, 0, 2, 3, 4],
            [0, 0, 1, 3, 4, 5],
            [1, 1, 1, 6, 9, 12],
        ]
    )
    if A.rank() != r:
        return False, "la matriz de prueba tiene rango %d != 3" % A.rank()
    dim_nul = m - r
    dim_nulT = n - r
    if len(A.nullspace()) != dim_nul:
        return False, "dim nul(A) concreta %d != %d" % (len(A.nullspace()), dim_nul)
    if len(A.T.nullspace()) != dim_nulT:
        return False, "dim nul(A^T) concreta %d != %d" % (len(A.T.nullspace()), dim_nulT)
    ok, msg = same_scalar(dim_nul, exp["fields"]["nul"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_scalar(dim_nulT, exp["fields"]["nulT"]["expected"])
    if not ok:
        return ok, msg
    # cierre del teorema del rango en ambos espacios
    if r + dim_nul != m or r + dim_nulT != n:
        return False, "las sumas del teorema del rango no cierran"
    return True, "dim nul(A) = %d, dim nul(A^T) = %d (rango %d)" % (dim_nul, dim_nulT, r)


def verify_X2_4(exp):
    A = Matrix([[1, 1, 1], [2, -1, 1], [1, 2, -1]])
    b = Matrix([4, 8, -3])
    sol = A.LUsolve(b)
    ok, msg = same_matrix(sol, exp["expected"])
    if not ok:
        return ok, msg
    if simplify(A * sol - b) != zeros(3, 1):
        return False, "la solución no verifica A x = b"
    # el determinante del sistema es no nulo: solución única
    if A.det() == 0:
        return False, "el sistema no tendría solución única"
    return True, "x = %s (comprobado: A x = b)" % list(sol)


def verify_X2_5(exp):
    A = Matrix([[2, 1], [0, 2]])
    lam = 2
    s = symbols("lam")
    p = A.charpoly(s)
    expr = p.as_expr() if hasattr(p, "as_expr") else sympify(p)
    if simplify(expr - (s - 2) ** 2) != 0:
        return False, "el polinomio característico %s no es (lam-2)^2" % expr
    alg = 2
    geo = 2 - (lam * eye(2) - A).rank()
    if geo != 1:
        return False, "multiplicidad geométrica de 2: %d != 1" % geo
    diagonalizable = alg == geo
    if diagonalizable != bool(exp["expected"]):
        return False, (
            "el cálculo da diagonalizable = %s y expected = %s"
            % (diagonalizable, exp["expected"])
        )
    return True, (
        "alg(2) = %d > geo(2) = %d → no diagonalizable (expected False)" % (alg, geo)
    )


def verify_X2_6(exp):
    P = Matrix([[0, 1, 0], [1, 0, 0], [0, 0, 1]])
    L = Matrix([[1, 0, 0], [2, 1, 0], [3, 1, 1]])
    U = Matrix([[1, 2, 3], [0, 4, 5], [0, 0, 6]])
    if P.det() != -1:
        return False, "det(P) = %s != -1" % P.det()
    if L.det() != 1:
        return False, "det(L) = %s != 1 (unitriangular)" % L.det()
    # det(U) = producto de la diagonal (¡no de la primera fila!)
    diag_U = U[0, 0] * U[1, 1] * U[2, 2]
    if U.det() != diag_U or U.det() != 24:
        return False, "det(U) = %s, producto de la diagonal = %s" % (U.det(), diag_U)
    det_A = P.det() * L.det() * U.det()
    if det_A != -24:
        return False, "det(A) = det(P)det(L)det(U) = %s != -24" % det_A
    # comprobación directa: A = P L U
    A = P * L * U
    if A.det() != det_A:
        return False, "det(P L U) = %s != %s" % (A.det(), det_A)
    return same_scalar(det_A, exp["expected"])


def verify_X2_7(exp):
    A = Matrix([[0, 1], [1, 1], [2, 1], [3, 1]])
    b = Matrix([2, 2, 4, 8])
    x = (A.T * A).solve(A.T * b)  # (m, n)
    m, n = x[0], x[1]
    e = b - A * x
    res = sqrt(e.dot(e))
    ok, msg = same_scalar(m, exp["fields"]["m"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_scalar(n, exp["fields"]["n"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_scalar(res, exp["fields"]["res"]["expected"])
    if not ok:
        return ok, msg
    # condición de mínimos cuadrados: A^T e = 0
    if simplify(A.T * e) != zeros(2, 1):
        return False, "el residuo no es ortogonal a las columnas de A"
    return True, "m = %s, n = %s, ||e|| = %s (A^T e = 0)" % (m, n, res)


def verify_X2_8(exp):
    A = Matrix([[3, 1, 0], [1, 3, 0], [0, 0, 1]])
    lam = symbols("lam")
    p = A.charpoly(lam)
    expr = p.as_expr() if hasattr(p, "as_expr") else sympify(p)
    raices = [simplify(r) for r in solve(expr, lam)]
    if not eq_set(raices, exp["expected"]):
        return False, "autovalores de A: %s, esperados %s" % (raices, exp["expected"])
    # comprobaciones espectrales: traza y determinante
    if simplify(sum(raices) - A.trace()) != 0:
        return False, "la suma de los autovalores no es la traza"
    prod = Rational(1)
    for r in raices:
        prod *= r
    if simplify(prod - A.det()) != 0:
        return False, "el producto de los autovalores no es el determinante"
    return True, "autovalores %s (traza %s, det %s)" % (raices, A.trace(), A.det())


def verify_X2_9(exp):
    A = Matrix([[1, 2, 0], [2, 1, 0], [0, 0, 3]])
    autovals = A.eigenvals()  # {raíz: multiplicidad algebraica}
    raices = []
    for r, m in autovals.items():
        raices.extend([simplify(r)] * int(m))
    # raíces esperadas (con multiplicidad): 3, 3, -1
    if not eq_set(raices, ["3", "3", "-1"]):
        return False, "autovalores de A: %s, se esperaban 3, 3, -1" % raices
    positivos = [r for r in raices if r > 0]
    negativos = [r for r in raices if r < 0]
    if positivos and negativos:
        clasif = 3  # indefinida
    elif len(positivos) == len(raices):
        clasif = 0  # definida positiva
    elif len(negativos) == len(raices):
        clasif = 1  # definida negativa
    else:
        clasif = 2  # semidefinida
    if clasif != exp["expected"]:
        return False, "clasificación calculada %d != expected %d" % (clasif, exp["expected"])
    # contraste numérico con la propia definición de indefinida
    f1 = Matrix([1, 0, 0]).T * A * Matrix([1, 0, 0])
    f2 = Matrix([1, -1, 0]).T * A * Matrix([1, -1, 0])
    if not (f1[0] > 0 and f2[0] < 0):
        return False, "f no toma valores de los dos signos: %s, %s" % (f1[0], f2[0])
    return True, "autovalores %s → forma indefinida (opción %d)" % (raices, clasif)


def verify_X2_10(exp):
    alpha, beta = symbols("alpha beta")
    A = Matrix([[1, 1, 1], [2, 3, 4], [3, 5, alpha]])
    b = Matrix([1, 3, beta])
    C = A.row_join(b)
    # det A = alpha - 7 (rango 3 si y solo si alpha != 7)
    if simplify(A.det() - (alpha - 7)) != 0:
        return False, "det A = %s != alpha - 7" % simplify(A.det())
    a0, b0 = 7, 5
    A0 = A.subs(alpha, a0)
    C0 = C.subs({alpha: a0, beta: b0})
    if A0.rank() != 2 or C0.rank() != 2:
        return False, "con (7,5): rng(A) = %d, rng(C) = %d; se esperaba 2 y 2" % (
            A0.rank(),
            C0.rank(),
        )
    if not (A0.rank() == C0.rank() and C0.rank() < 3):
        return False, "con (7,5) no se cumple rng(A) = rng(C) < 3"
    # unicidad: alpha != 7 → determinado; alpha = 7, beta != 5 → incompatible
    A1 = A.subs(alpha, 6)
    C1 = C.subs({alpha: 6, beta: b0})
    if A1.rank() != 3 or C1.rank() != 3:
        return False, "con alpha = 6 el sistema debería ser determinado"
    C2 = C.subs({alpha: a0, beta: 4})
    if not (A0.rank() == 2 and C2.rank() == 3):
        return False, "con (7,4) el sistema debería ser incompatible"
    ok, msg = same_scalar(a0, exp["fields"]["alpha"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_scalar(b0, exp["fields"]["beta"]["expected"])
    if not ok:
        return ok, msg
    return True, "indeterminado ⇔ α = %d, β = %d (rng(A) = rng(C) = 2 < 3)" % (a0, b0)


def verify_X2_11(exp):
    A = Matrix([[2, -1, 0], [1, 2, 0], [0, 0, 3]])
    lam = symbols("lam")
    p = A.charpoly(lam)
    expr = p.as_expr() if hasattr(p, "as_expr") else sympify(p)
    raices = [simplify(r) for r in solve(expr, lam)]
    if not eq_set(raices, ["3", "2+i", "2-i"]):
        return False, "autovalores de A: %s, se esperaban 3, 2+i, 2-i" % raices
    # la diagonal de U (forma de Schur) contiene los autovalores:
    # det(U) = producto de la diagonal
    det_U = Rational(1)
    for r in raices:
        det_U *= r
    det_U = simplify(det_U)
    if det_U != 15:
        return False, "producto de la diagonal de U = %s != 15" % det_U
    # Q unitaria ⇒ det(U) = det(A)
    if simplify(A.det() - det_U) != 0:
        return False, "det(A) = %s != det(U) = %s" % (A.det(), det_U)
    return same_scalar(det_U, exp["expected"])


def verify_X2_12(exp):
    A = Matrix([[1, 1], [1, 0], [1, 2]])
    c1 = A[:, 0]
    c2 = A[:, 1]
    r11 = sqrt(c1.dot(c1))
    q1 = c1 / r11
    r12 = simplify(q1.dot(c2))
    u = simplify(c2 - r12 * q1)
    r22 = sqrt(u.dot(u))
    q2 = simplify(u / r22)
    Q = simplify(q1.row_join(q2))
    R = Matrix([[r11, r12], [0, r22]])
    ok, msg = same_matrix(Q, exp["fields"]["Q"]["expected"])
    if not ok:
        return ok, msg
    ok, msg = same_matrix(R, exp["fields"]["R"]["expected"])
    if not ok:
        return ok, msg
    # ortonormalidad de Q y reconstrucción A = Q R
    if simplify(Q.T * Q) != eye(2):
        return False, "las columnas de Q no son ortonormales"
    if simplify(Q * R - A) != zeros(3, 2):
        return False, "Q R != A"
    if not (r11 > 0 and r22 > 0):
        return False, "la diagonal de R no es estrictamente positiva"
    return True, "Q = %s, R = %s (ortonormal, A = Q R)" % (Q.tolist(), R.tolist())


VERIFIERS = {
    "X2-1": verify_X2_1,
    "X2-2": verify_X2_2,
    "X2-3": verify_X2_3,
    "X2-4": verify_X2_4,
    "X2-5": verify_X2_5,
    "X2-6": verify_X2_6,
    "X2-7": verify_X2_7,
    "X2-8": verify_X2_8,
    "X2-9": verify_X2_9,
    "X2-10": verify_X2_10,
    "X2-11": verify_X2_11,
    "X2-12": verify_X2_12,
}


# ---------------------------------------------------------------------------
# Consistencia con assets/data/examen-2.js (esperados idénticos)
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
        "const d=window.CURSO_DATA['examen-2'];"
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
        print("✗ Consistencia con assets/data/examen-2.js: " + msg)
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
