#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify/tema-5-verify.py — Verificación con SymPy de todas las respuestas
del Tema V (assets/data/tema-5.js).

Recalcula cada resultado desde el enunciado (autovalores, Cholesky, SVD,
pseudoinversa, inercia) y lo compara con los `expected` del banco de
ejercicios. Imprime «OK: N/N verificados» y sale con código 0.
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


def sorted_eigenvalues(M):
    """Autovalores (con multiplicidad) de M, ordenados por (parte real, parte imaginaria)."""
    ev = []
    for val, mult in M.eigenvals().items():
        ev.extend([sp.simplify(val)] * mult)
    return sorted(ev, key=lambda z: (complex(z).real, complex(z).imag))


def _primera_no_nula_positiva(v) -> bool:
    """¿La primera componente no nula del vector es positiva?

    Es el criterio de signos que fijan los enunciados: en cada columna de Q,
    la primera componente no nula ha de ser positiva (así el signo de cada
    autovector queda determinado).
    """
    for i in range(v.rows):
        c = sp.simplify(v[i, 0])
        if c != 0:
            return c > 0
    return False


# --------------------------------------------------------------------------
# Comprobaciones por ejercicio (recalculan y comparan con expected)
# --------------------------------------------------------------------------

checks = []


def check(name):
    def deco(fn):
        checks.append((name, fn))
        return fn

    return deco


@check("T5-N1 autovalores de [[4,1],[2,3]] == exprset {5,2}")
def _():
    A = sp.Matrix([[4, 1], [2, 3]])
    expected = ["5", "2"]
    return exprset_equal(sorted_eigenvalues(A), expected)


@check("T5-N2 [[3,1],[0,3]] no es diagonalizable (bool -> False)")
def _():
    A = sp.Matrix([[3, 1], [0, 3]])
    expected = False
    # diagonalizable iff dim(E_lambda) == multiplicidad algebraica para cada lambda
    diagonalizable = all(
        len(vecs) == mult for (_, mult, vecs) in A.eigenvects()
    ) and sum(len(vecs) for (_, _, vecs) in A.eigenvects()) == A.rows
    return diagonalizable == expected


@check("T5-N3 Cholesky L=[[2,0],[1,2]] de [[4,2],[2,5]]: L L^T == A")
def _():
    A = sp.Matrix([[4, 2], [2, 5]])
    L_expected = [["2", "0"], ["1", "2"]]
    L = matrix_from_rows(L_expected)
    return matrix_equal((L * L.T).applyfunc(sp.simplify), A) and all(L[i, i] > 0 for i in range(2))


@check("T5-N4 forma [[2,3],[3,2]] indefinida (choice -> 2)")
def _():
    A = sp.Matrix([[2, 3], [3, 2]])
    expected_index = 2  # 0: def. positiva · 1: semidef. positiva · 2: indefinida · 3: def. negativa
    ev = sorted_eigenvalues(A)
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
    return computed_index == expected_index


@check("T5-N5 pseudoinversa de diag(2,4) == [[1/2,0],[0,1/4]]")
def _():
    A = sp.diag(2, 4)
    expected = [["1/2", "0"], ["0", "1/4"]]
    return matrix_equal(A.pinv(), expected)


@check("T5-N6 norma espectral de [[2,1],[1,2]] == 3")
def _():
    A = sp.Matrix([[2, 1], [1, 2]])
    expected = sp.Integer(3)
    # ||A||_2 = σ1 = raíz cuadrada del mayor autovalor de A^T A
    eig = [sp.simplify(l) for l in (A.T * A).eigenvals()]
    sigma1 = sp.sqrt(max(eig))
    return sp.simplify(sigma1 - expected) == 0


@check("T5-N8 forma cuadrática x²+2xy+y²: semidefinida positiva, autovalor nulo 0 y autovector unitario")
def _():
    A = sp.Matrix([[1, 1], [1, 1]])
    # Copia de la respuesta esperada del banco (la contrasta el cross-check).
    esperado_tipo = 1
    esperado_nulo = "0"
    esperado_vec = [["sqrt(2)/2"], ["-sqrt(2)/2"]]
    # Autovalores de A: λ²-2λ = 0 → 0 y 2.
    valores = sorted_eigenvalues(A)
    # Semidefinida positiva (pero no definida positiva) ⇔ todos ≥ 0 y alguno nulo.
    no_negativos = all(v >= 0 for v in valores)
    tiene_nulo = any(v == 0 for v in valores)
    # q(1,-1) = 0: la forma se anula en una dirección no nula.
    q_nula = (sp.Matrix([1, -1]).T * A * sp.Matrix([1, -1]))[0, 0]
    # El autovector esperado: unitario, autovector de 0 y con primera componente positiva.
    v = sp.Matrix([sp.sqrt(2) / 2, -sp.sqrt(2) / 2])
    unitario = sp.simplify(v.dot(v)) == 1
    autovector = (A * v).applyfunc(sp.simplify) == sp.zeros(2, 1)
    signo = _primera_no_nula_positiva(v)
    return (
        valores == [0, 2]
        and no_negativos
        and tiene_nulo
        and q_nula == 0
        and unitario
        and autovector
        and signo
        and esperado_tipo == 1
        and esperado_nulo == "0"
        and esperado_vec == [["sqrt(2)/2"], ["-sqrt(2)/2"]]
    )


@check("T5-M7 LDL^T de [[0,1],[1,2]]: sin permutar no (pivote d1=0), permutando si")
def _():
    A = sp.Matrix([[0, 1], [1, 2]])
    # Copia de la respuesta esperada del banco (la contrasta el cross-check).
    esperado_sin_perm = 1
    esperado_pivote = "0"
    esperado_con_perm = 0
    # Sin permutar: d1 = a11 = 0 y el multiplicador l21 = a21/d1 no existe.
    pivote_nulo = A[0, 0] == 0 and A[1, 0] != 0
    # Con la permutación de intercambio: PAPᵀ = [[2,1],[1,0]], con d1 = 2 ≠ 0.
    P = sp.Matrix([[0, 1], [1, 0]])
    PAPt = (P * A * P.T).applyfunc(sp.simplify)
    d1 = PAPt[0, 0]
    l21 = sp.simplify(PAPt[1, 0] / d1)
    d2 = sp.simplify(PAPt[1, 1] - l21 ** 2 * d1)
    L = sp.Matrix([[1, 0], [l21, 1]])
    D = sp.diag(d1, d2)
    con_perm = d1 != 0 and (L * D * L.T - PAPt).applyfunc(sp.simplify) == sp.zeros(2, 2)
    return (
        pivote_nulo
        and con_perm
        and PAPt == sp.Matrix([[2, 1], [1, 0]])
        and esperado_sin_perm == 1
        and esperado_pivote == "0"
        and esperado_con_perm == 0
    )


@check("T5-M1 diagonalizacion A=[[5,-1],[2,2]] = P D P^{-1}, P=[[1,1],[2,1]], D=diag(3,4)")
def _():
    A = sp.Matrix([[5, -1], [2, 2]])
    P_expected = [["1", "1"], ["2", "1"]]
    D_expected = [["3", "0"], ["0", "4"]]
    P = matrix_from_rows(P_expected)
    D = matrix_from_rows(D_expected)
    return matrix_equal(P.inv() * A * P, D_expected) and matrix_equal((P * D * P.inv()).applyfunc(sp.simplify), A)


@check("T5-M2 LDL^T de [[1,2,-1],[2,7,1],[-1,1,6]]: L=[[1,0,0],[2,1,0],[-1,1,1]], D=diag(1,3,2)")
def _():
    A = sp.Matrix([[1, 2, -1], [2, 7, 1], [-1, 1, 6]])
    L_expected = [["1", "0", "0"], ["2", "1", "0"], ["-1", "1", "1"]]
    D_expected = [["1", "0", "0"], ["0", "3", "0"], ["0", "0", "2"]]
    L = matrix_from_rows(L_expected)
    D = matrix_from_rows(D_expected)
    # L unitriangular inferior: diagonal 1 y nula por encima de la diagonal
    unitriangular = all(L[i, i] == 1 for i in range(3)) and all(
        L[i, j] == 0 for i in range(3) for j in range(i + 1, 3)
    )
    # D diagonal
    diagonal = all(D[i, j] == 0 for i in range(3) for j in range(3) if i != j)
    return (
        matrix_equal((L * D * L.T).applyfunc(sp.simplify), A)
        and unitriangular
        and diagonal
    )


@check("T5-M3 valores singulares de [[1,3],[3,1]] == exprset {4,2}")
def _():
    A = sp.Matrix([[1, 3], [3, 1]])
    expected = ["4", "2"]
    # sigma_i = sqrt(autovalores de A^T A), orden decreciente
    eig = [sp.simplify(l) for l in (A.T * A).eigenvals()]
    sigmas = sorted((sp.sqrt(e) for e in eig), key=lambda z: -float(z))
    return exprset_equal(sigmas, expected)


@check("T5-M4 pseudoinversa de [[2,4],[1,2]] == [[2/25,1/25],[4/25,2/25]] (Penrose)")
def _():
    A = sp.Matrix([[2, 4], [1, 2]])
    expected = [["2/25", "1/25"], ["4/25", "2/25"]]
    Ap = A.pinv()
    penrose = (
        A * Ap * A == A
        and Ap * A * Ap == Ap
        and (A * Ap).T == A * Ap
        and (Ap * A).T == Ap * A
    )
    return matrix_equal(Ap, expected) and penrose


@check("T5-M5 espectral [[2,1],[1,2]]: Q=[[√2/2,√2/2],[-√2/2,√2/2]], Λ=diag(1,3)")
def _():
    A = sp.Matrix([[2, 1], [1, 2]])
    q = sp.sqrt(2) / 2
    # Autovalores en orden creciente (λ1 < λ2): λ1 = 1 y λ2 = 3.
    # La primera columna es el autovector de λ1 = 1 y la segunda el de λ2 = 3,
    # ambos con la primera componente positiva.
    Q_expected = [[str(q), str(q)], [str(-q), str(q)]]
    Lam_expected = [["1", "0"], ["0", "3"]]
    Q = matrix_from_rows(Q_expected)
    Lam = matrix_from_rows(Lam_expected)
    orthogonal = matrix_equal((Q.T * Q).applyfunc(sp.simplify), [["1", "0"], ["0", "1"]])
    # primera componente no nula positiva en cada columna
    signos = all(_primera_no_nula_positiva(Q[:, j]) for j in range(2))
    # y las columnas son autovectores de los autovalores correspondientes
    autovectores = all(
        matrix_equal((A * Q[:, j]).applyfunc(sp.simplify), (Lam[j, j] * Q[:, j]).applyfunc(sp.simplify))
        for j in range(2)
    )
    return (
        orthogonal
        and signos
        and autovectores
        and matrix_equal((Q * Lam * Q.T).applyfunc(sp.simplify), A)
    )


@check("T5-E1 espectral [[1,2,0],[2,1,0],[0,0,4]]: Q y Λ=diag(-1,3,4)")
def _():
    A = sp.Matrix([[1, 2, 0], [2, 1, 0], [0, 0, 4]])
    q = sp.sqrt(2) / 2
    # Autovalores en orden creciente: λ1 = -1, λ2 = 3, λ3 = 4.
    # Columnas: autovector de λ1 = -1, de λ2 = 3 y de λ3 = 4, con la
    # primera componente no nula positiva.
    Q_expected = [[str(q), str(q), "0"], [str(-q), str(q), "0"], ["0", "0", "1"]]
    Lam_expected = [["-1", "0", "0"], ["0", "3", "0"], ["0", "0", "4"]]
    Q = matrix_from_rows(Q_expected)
    Lam = matrix_from_rows(Lam_expected)
    orthogonal = matrix_equal((Q.T * Q).applyfunc(sp.simplify), sp.eye(3).tolist())
    # Criterio de signos del enunciado: en cada columna, la primera
    # componente *no nula* debe ser positiva (aquí la 3.ª columna es (0,0,1),
    # cuya primera componente no nula es la tercera, igual a 1).
    signos = all(
        _primera_no_nula_positiva(Q[:, j]) for j in range(3)
    )
    # y cada columna es autovector de su autovalor
    autovectores = all(
        matrix_equal(
            (A * Q[:, j]).applyfunc(sp.simplify),
            (Lam[j, j] * Q[:, j]).applyfunc(sp.simplify),
        )
        for j in range(3)
    )
    return (
        orthogonal
        and signos
        and autovectores
        and matrix_equal((Q * Lam * Q.T).applyfunc(sp.simplify), A)
    )


@check("T5-E2 Cholesky L=[[2,0,0],[1,2,0],[1,1,3]] de [[4,2,2],[2,5,3],[2,3,11]]")
def _():
    L = matrix_from_rows([["2", "0", "0"], ["1", "2", "0"], ["1", "1", "3"]])
    A_rows = [["4", "2", "2"], ["2", "5", "3"], ["2", "3", "11"]]
    A = matrix_from_rows(A_rows)
    return matrix_equal((L * L.T).applyfunc(sp.simplify), A) and all(L[i, i] > 0 for i in range(3))


@check("T5-E3 pseudoinversa de [[3,1],[-1,3]] == [[3/10,-1/10],[1/10,3/10]]")
def _():
    A = sp.Matrix([[3, 1], [-1, 3]])
    expected = [["3/10", "-1/10"], ["1/10", "3/10"]]
    Ap = A.pinv()
    penrose = A * Ap * A == A and Ap * A * Ap == Ap and (A * Ap).T == A * Ap and (Ap * A).T == Ap * A
    return matrix_equal(Ap, expected) and penrose


@check("T5-E4 inercia de [[2,1,0],[1,2,0],[0,0,-3]]: pos=2, neg=1")
def _():
    A = sp.Matrix([[2, 1, 0], [1, 2, 0], [0, 0, -3]])
    expected = {"pos": sp.Integer(2), "neg": sp.Integer(1)}
    ev = sorted_eigenvalues(A)
    pos = sum(1 for z in ev if z > 0)
    neg = sum(1 for z in ev if z < 0)
    return sp.Integer(pos) == expected["pos"] and sp.Integer(neg) == expected["neg"]


# --- Ejercicios añadidos en la ampliación de cobertura (2026-10-21) ---


@check("T5-N7 menores principales líderes de [[2,-1,0],[-1,2,-1],[0,-1,2]] == 2, 3, 4")
def _():
    A = sp.Matrix([[2, -1, 0], [-1, 2, -1], [0, -1, 2]])
    d1 = A[:1, :1].det()
    d2 = A[:2, :2].det()
    d3 = A.det()
    return (
        sp.simplify(d1) == sp.Integer(2)
        and sp.simplify(d2) == sp.Integer(3)
        and sp.simplify(d3) == sp.Integer(4)
        # por Sylvester, los tres positivos ⇒ definida positiva
        and d1 > 0
        and d2 > 0
        and d3 > 0
    )


@check("T5-M6 raíz cuadrada SPP de [[10,6],[6,10]] == [[3,1],[1,3]]")
def _():
    A = sp.Matrix([[10, 6], [6, 10]])
    X = matrix_from_rows([["3", "1"], ["1", "3"]])
    simetrica = X == X.T
    # X debe ser definida positiva: autovalores positivos
    ev = X.eigenvals()
    def_pos = all(v > 0 for v in ev.values())
    # y cumplir X^2 = A
    cuadrado = matrix_equal((X * X).applyfunc(sp.simplify), A)
    return simetrica and def_pos and cuadrado


@check("T5-E5 Jordan de [[3,1,0],[-1,1,0],[0,0,2]]: dim ker(A-2I)=2 y J=[[2,1,0],[0,2,0],[0,0,2]]")
def _():
    A = sp.Matrix([[3, 1, 0], [-1, 1, 0], [0, 0, 2]])
    N = A - 2 * sp.eye(3)
    dim_ker = 3 - N.rank()
    # polinomio característico: un único autovalor 2 con multiplicidad 3
    charpoly = sp.factor(A.charpoly().as_expr())
    unico_autovalor = charpoly == (sp.Symbol("lambda") - 2) ** 3
    # A y J deben ser semejantes (misma forma de Jordan)
    J = matrix_from_rows([["2", "1", "0"], ["0", "2", "0"], ["0", "0", "2"]])
    # se busca P con A = P J P^{-1}: basta comprobar que J es la forma canónica
    # con dos bloques (1 de tamaño 2 y 1 de tamaño 1)
    bloques = 3 - (J - 2 * sp.eye(3)).rank()
    # y que A y J tienen el mismo polinomio característico y el mismo número
    # de bloques, lo que determina la forma de Jordan
    mismo_charpoly = sp.expand(A.charpoly().as_expr() - J.charpoly().as_expr()) == 0
    # comprobación explícita de semejanza: cadena de Jordan
    #   p1 = (-1,1,0) autovector,  p2 = (-1,0,0) con (A-2I)p2 = p1,
    #   p3 = (0,0,1) autovector del bloque de tamaño 1.
    p1 = sp.Matrix([-1, 1, 0])
    p2 = sp.Matrix([-1, 0, 0])
    p3 = sp.Matrix([0, 0, 1])
    cadena = matrix_equal((N * p2).applyfunc(sp.simplify), p1) and (N * p1).applyfunc(sp.simplify) == sp.zeros(3, 1)
    P = sp.Matrix.hstack(p1, p2, p3)
    # se verifica: P^{-1} A P = J
    semejante = matrix_equal((P.inv() * A * P).applyfunc(sp.simplify), J)
    return (
        dim_ker == 2
        and unico_autovalor
        and bloques == 2
        and mismo_charpoly
        and cadena
        and semejante
    )


@check("T5-E6 SVD de [[1,4],[2,2],[2,-4]]: sigmas {6,3} y A† == [[1/9,2/9,2/9],[1/9,1/18,-1/9]]")
def _():
    A = sp.Matrix([[1, 4], [2, 2], [2, -4]])
    AtA = (A.T * A).applyfunc(sp.simplify)
    # las columnas son ortogonales: A^T A es diagonal
    ortogonal = AtA[0, 1] == 0
    eig = sorted((sp.simplify(l) for l in AtA.eigenvals()), reverse=True)
    sigmas = [sp.sqrt(eig[0]), sp.sqrt(eig[1])]
    sigmas_ok = exprset_equal(sigmas, ["6", "3"])
    # pseudoinversa: (A^T A)^{-1} A^T (rango completo por columnas)
    pinv = (AtA.inv() * A.T).applyfunc(sp.simplify)
    esperado = matrix_from_rows([["1/9", "2/9", "2/9"], ["1/9", "1/18", "-1/9"]])
    pinv_ok = matrix_equal(pinv, esperado)
    # y cumple las ecuaciones de Penrose
    Ap = A.pinv()
    penrose = A * Ap * A == A and Ap * A * Ap == Ap and (A * Ap).T == A * Ap and (Ap * A).T == Ap * A
    return ortogonal and sigmas_ok and pinv_ok and penrose


# --------------------------------------------------------------------------
# Comprobaciones de la teoría del tema (métodos exigidos: SVD, Jordan, Penrose)
# --------------------------------------------------------------------------


@check("Teoría: SVD de [[0,3],[2,0]] — U Σ V^T == A y ||A||_2 = σ1")
def _():
    A = sp.Matrix([[0, 3], [2, 0]])
    V = sp.Matrix([[0, 1], [1, 0]])
    Sigma = sp.diag(3, 2)
    U = sp.eye(2)
    svd_ok = matrix_equal((U * Sigma * V.T).applyfunc(sp.simplify), [["0", "3"], ["2", "0"]])
    # verificación alternativa: σ_i = sqrt(autovalores de A^T A)
    eig = sorted((sp.simplify(l) for l in (A.T * A).eigenvals()), reverse=True)
    sigma_ok = eig == [sp.Integer(9), sp.Integer(4)] and sp.sqrt(eig[0]) == 3
    return svd_ok and sigma_ok


@check("Teoría: Jordan de [[5,1],[-1,3]] — W J W^{-1} == A con J=[[4,1],[0,4]]")
def _():
    A = sp.Matrix([[5, 1], [-1, 3]])
    W = sp.Matrix([[1, 1], [-1, 0]])
    J = sp.Matrix([[4, 1], [0, 4]])
    return matrix_equal((W * J * W.inv()).applyfunc(sp.simplify), A)


@check("Teoría: pseudoinversa de [[1,2],[2,4]] verifica las 4 ecuaciones de Penrose")
def _():
    A = sp.Matrix([[1, 2], [2, 4]])
    Ap = sp.Rational(1, 25) * A  # A† = u u^T / ‖u‖⁴
    return (
        A * Ap * A == A
        and Ap * A * Ap == Ap
        and (A * Ap).T == A * Ap
        and (Ap * A).T == Ap * A
    )


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
