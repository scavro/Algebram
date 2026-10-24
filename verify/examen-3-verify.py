#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify/examen-3-verify.py — Verificación con SymPy de las 12 preguntas
del Examen 3 (assets/data/examen-3.js).

Recalcula cada respuesta desde el enunciado (Cholesky, LDL^T, Jordan,
espectral, inercia, pseudoinversa, mínimos cuadrados, determinantes,
complejos, Rouché–Frobenius) y la compara con los `expected` del banco
de preguntas. Imprime «OK: 12/12 verificados» y sale con código 0.
"""

import sys
from itertools import permutations

import sympy as sp

# --------------------------------------------------------------------------
# Utilidades de comparación
# --------------------------------------------------------------------------


def matrix_from_rows(rows):
    """rows: lista de filas de strings -> Matrix de SymPy."""
    return sp.Matrix([[sp.sympify(cell) for cell in row] for row in rows])


def matrix_equal(M, expected_rows):
    """Igualdad elemento a elemento con simplify(M - E) == 0.
    expected_rows: lista de filas de strings, o bien una Matrix de SymPy."""
    if isinstance(expected_rows, sp.MatrixBase):
        E = expected_rows
    else:
        E = matrix_from_rows(expected_rows)
    if M.shape != E.shape:
        return False
    return all(sp.simplify(M[i, j] - E[i, j]) == 0 for i in range(M.rows) for j in range(M.cols))


def exprset_equal(values, expected):
    """Conjunto no ordenado de expresiones vs lista de strings."""
    vals = [sp.simplify(sp.sympify(v)) for v in values]
    exp = [sp.simplify(sp.sympify(e)) for e in expected]
    if len(vals) != len(exp):
        return False
    for perm in permutations(exp):
        if all(sp.simplify(a - b) == 0 for a, b in zip(vals, perm)):
            return True
    return False


# --------------------------------------------------------------------------
# Comprobaciones por pregunta (recalculan y comparan con expected)
# --------------------------------------------------------------------------

checks = []


def check(name):
    def deco(fn):
        checks.append((name, fn))
        return fn

    return deco


@check("X3-1 Cholesky de [[25,15],[15,18]] == [[5,0],[3,3]]")
def _():
    A = sp.Matrix([[25, 15], [15, 18]])
    expected = [["5", "0"], ["3", "3"]]
    L = matrix_from_rows(expected)
    # recalcula L por el algoritmo de Cholesky y lo compara
    Lc = A.cholesky()
    return (
        matrix_equal(Lc, expected)
        and matrix_equal((L * L.T).applyfunc(sp.simplify), A)
        and all(L[i, i] > 0 for i in range(2))
    )


@check("X3-2 (3+4i)/(1-2i) == -1+2*i")
def _():
    z = sp.sympify("(3+4*I)/(1-2*I)")
    expected = sp.sympify("-1+2*I")
    return sp.simplify(z - expected) == 0


@check("X3-3 (AB)^T != A^T B^T en general (bool -> False)")
def _():
    A = sp.Matrix([[1, 2], [3, 4]])
    B = sp.Matrix([[0, 1], [1, 0]])
    expected = False
    afirmacion = all(
        sp.simplify(((A * B).T - A.T * B.T)[i, j]) == 0 for i in range(2) for j in range(2)
    )
    # la identidad correcta sí se cumple
    identidad_ok = (A * B).T == B.T * A.T
    return (afirmacion == expected) and identidad_ok


@check("X3-4 det(2A) con det(A)=-2, A de orden 3 == -16")
def _():
    # recalcula con una matriz concreta de orden 3 y determinante -2
    A = sp.diag(-2, 1, 1)
    assert A.det() == -2
    expected = sp.Integer(-16)
    # regla: det(kA) = k^n det(A)
    regla = 2 ** 3 * A.det()
    return (2 * A).det() == expected and regla == expected


@check("X3-5 LDL^T de [[2,4,2],[4,9,6],[2,6,9]]: L=[[1,0,0],[2,1,0],[1,2,1]], D=diag(2,1,3)")
def _():
    A = sp.Matrix([[2, 4, 2], [4, 9, 6], [2, 6, 9]])
    L_expected = [["1", "0", "0"], ["2", "1", "0"], ["1", "2", "1"]]
    D_expected = [["2", "0", "0"], ["0", "1", "0"], ["0", "0", "3"]]
    L = matrix_from_rows(L_expected)
    D = matrix_from_rows(D_expected)
    # unitriangular inferior: diagonal 1, estricta superior nula
    unitriangular = all(
        (L[i, j] == 1) if i == j else (L[i, j] == 0) if i < j else True
        for i in range(3)
        for j in range(3)
    )
    return (
        matrix_equal((L * D * L.T).applyfunc(sp.simplify), A)
        and unitriangular
        and matrix_equal(D, D_expected)
    )


@check("X3-6 minimos cuadrados (0,0),(1,2),(2,2),(3,4): m=6/5, n=1/5")
def _():
    xs = [sp.Integer(0), sp.Integer(1), sp.Integer(2), sp.Integer(3)]
    ys = [sp.Integer(0), sp.Integer(2), sp.Integer(2), sp.Integer(4)]
    M = sp.Matrix([[1, x] for x in xs])
    b = sp.Matrix(ys)
    # ecuaciones normales
    sol = (M.T * M).solve(M.T * b)  # (n, m)
    n_expected = sp.Rational(1, 5)
    m_expected = sp.Rational(6, 5)
    return sp.simplify(sol[0] - n_expected) == 0 and sp.simplify(sol[1] - m_expected) == 0


@check("X3-7 Jordan de [[3,-1],[1,1]] == [[2,1],[0,2]]")
def _():
    A = sp.Matrix([[3, -1], [1, 1]])
    expected = [["2", "1"], ["0", "2"]]
    J_expected = matrix_from_rows(expected)
    P, J = A.jordan_form()  # A = P J P^{-1}, J es la forma canónica de Jordan
    # única salvo orden de bloques: aquí un único bloque
    ok_form = matrix_equal(J, expected)
    ok_similitud = matrix_equal((P * J * P.inv()).applyfunc(sp.simplify), A)
    # no diagonalizable: dim ker(A-2I) = 1 < 2
    ker_dim = 2 - (A - 2 * sp.eye(2)).rank()
    return ok_form and ok_similitud and ker_dim == 1 and matrix_equal(J, J_expected)


@check("X3-8 sistema con parámetro: compatible <=> k == 4")
def _():
    k = sp.symbols("k")
    A = sp.Matrix([[1, 1, 1], [2, 1, 3], [3, 2, 4]])
    b = sp.Matrix([1, 3, k])
    M = A.row_join(b)  # matriz ampliada 3x4
    # Rouché–Frobenius: compatible <=> rango(A) == rango(M), es decir
    # todos los menores de orden 3 de la ampliada se anulan
    rango_A = A.rank()
    expected = 4
    menor = M[:, [0, 1, 3]].det()  # menor de la ampliada con la columna de términos
    soluciones = sp.solve(sp.Eq(sp.expand(menor), 0), k)
    return soluciones == [sp.Integer(expected)] and rango_A == 2


@check("X3-9 espectral [[2,2],[2,-1]]: Q=(1/√5)[[1,2],[-2,1]], Λ=diag(-2,3)")
def _():
    A = sp.Matrix([[2, 2], [2, -1]])
    r = sp.sqrt(5) / 5
    Q_expected = [[str(r), str(2 * r)], [str(-2 * r), str(r)]]
    Lam_expected = [["-2", "0"], ["0", "3"]]
    Q = matrix_from_rows(Q_expected)
    Lam = matrix_from_rows(Lam_expected)
    ortogonal = matrix_equal((Q.T * Q).applyfunc(sp.simplify), sp.eye(2).tolist())
    # los autovalores en orden creciente son -2 y 3
    ev = sorted(A.eigenvals().keys(), key=lambda z: complex(z).real)
    return (
        ortogonal
        and matrix_equal((Q * Lam * Q.T).applyfunc(sp.simplify), A)
        and ev == [sp.Integer(-2), sp.Integer(3)]
    )


@check("X3-10 autovalores {2,2,-1,4}: det(A^2)=256, tr(A^-1)=1/4")
def _():
    # cualquier matriz con esos autovalores; usamos la diagonal
    A = sp.diag(2, 2, -1, 4)
    det2_expected = sp.Integer(256)
    trinv_expected = sp.Rational(1, 4)
    det2 = sp.expand((A**2).det())
    trinv = sp.simplify(sp.trace(A.inv()))
    # invariancia por similitud: comprobamos con una matriz semejante
    P = sp.Matrix([[1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 1, 1], [0, 0, 0, 1]])
    B = P * A * P.inv()
    return (
        det2 == det2_expected
        and sp.simplify(trinv - trinv_expected) == 0
        and sp.expand((B**2).det()) == det2_expected
        and sp.simplify(sp.trace(B.inv()) - trinv_expected) == 0
    )


@check("X3-11 inercia de [[2,-1,-1],[-1,2,-1],[-1,-1,2]]: semidefinida positiva (choice -> 1)")
def _():
    A = sp.Matrix([[2, -1, -1], [-1, 2, -1], [-1, -1, 2]])
    expected_index = 1  # 0: def. positiva · 1: semidef. positiva no definida · 2: indefinida · 3: def. negativa
    ev = sorted(A.eigenvals().keys(), key=lambda z: complex(z).real)
    pos = sum(1 for z in ev if z > 0)
    neg = sum(1 for z in ev if z < 0)
    zer = sum(1 for z in ev if z == 0)
    if pos and neg:
        computed_index = 2
    elif neg == 0 and zer == 0:
        computed_index = 0
    elif pos == 0 and zer == 0:
        computed_index = 3
    else:
        computed_index = 1
    # q = (x-y)^2+(y-z)^2+(z-x)^2 >= 0, y q(1,1,1)=0
    x, y, z = sp.symbols("x y z", real=True)
    q = 2 * x**2 + 2 * y**2 + 2 * z**2 - 2 * x * y - 2 * x * z - 2 * y * z
    suma_cuadrados = (x - y) ** 2 + (y - z) ** 2 + (z - x) ** 2
    return (
        computed_index == expected_index
        and sp.expand(q - suma_cuadrados) == 0
        and q.subs({x: 1, y: 1, z: 1}) == 0
    )


@check("X3-12 pseudoinversa de [[1,1],[2,2]] y x=A^dagger b == (6/5, 6/5)")
def _():
    A = sp.Matrix([[1, 1], [2, 2]])
    b = sp.Matrix([2, 5])
    Adag_expected = [["1/10", "1/5"], ["1/10", "1/5"]]
    x_expected = sp.Matrix([sp.Rational(6, 5), sp.Rational(6, 5)])
    Adag = matrix_from_rows(Adag_expected)
    penrose = (
        A * Adag * A == A
        and Adag * A * Adag == Adag
        and (A * Adag).T == A * Adag
        and (Adag * A).T == Adag * A
    )
    ok_pinv = matrix_equal(A.pinv().applyfunc(sp.simplify), Adag_expected)
    x = Adag * b
    ok_x = matrix_equal(x, x_expected)
    # ecuaciones normales: A^T A x = A^T b
    normales = matrix_equal((A.T * A * x).applyfunc(sp.simplify), (A.T * b).applyfunc(sp.simplify))
    return penrose and ok_pinv and ok_x and normales


# --------------------------------------------------------------------------


def main():
    passed = 0
    for name, fn in checks:
        ok = fn()
        status = "OK " if ok else "FALLO"
        print(f"[{status}] {name}")
        if ok:
            passed += 1
    total = len(checks)
    if passed == total:
        print(f"OK: {passed}/{total} verificados")
        return 0
    print(f"FALLO: {passed}/{total} verificados")
    return 1


if __name__ == "__main__":
    sys.exit(main())
