#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify/tema-4-verify.py — Tema IV · Procesos de triangulación

Recalcula con SymPy la respuesta esperada de cada uno de los 20 ejercicios de
assets/data/tema-4.js y la compara con las constantes `expected`.
Sale con código 0 e imprime «OK: N/N verificados» si todo cuadra.
"""

import sys

from sympy import (
    Matrix,
    Rational,
    eye,
    I,
    simplify,
    sqrt,
    symbols,
    sympify,
    zeros,
)

N = 0
FAIL = 0


def ok(cond, msg):
    global N, FAIL
    N += 1
    if cond:
        print("  ✓ " + msg)
    else:
        FAIL += 1
        print("  ✗ " + msg)


def eq(a, b):
    """Igualdad exacta o simbólica con simplify."""
    try:
        return simplify(sympify(a) - sympify(b)) == 0
    except Exception:
        return False


def same_matrix(M, expected_rows):
    """Compara matriz sympy con expected (lista de filas de strings)."""
    if M.rows != len(expected_rows) or M.cols != len(expected_rows[0]):
        return False
    for i in range(M.rows):
        for j in range(M.cols):
            if not eq(M[i, j], expected_rows[i][j]):
                return False
    return True


print("== Tema IV · Procesos de triangulación (20 ejercicios) ==")

# ---------------------------------------------------------------- T4-N1
# Gauss: sistema 3x3 con solución única (1, -1, 2)
print("T4-N1 · Gauss, solución única")
A = Matrix([[1, 1, 1], [2, -1, 1], [1, 2, -1]])
b = Matrix([2, 5, -3])
x = A.solve(b)
ok(x == Matrix([1, -1, 2]), "solve(A,b) = (1,-1,2); expected vector [['1'],['-1'],['2']]")
ok(same_matrix(x, [["1"], ["-1"], ["2"]]), "same_matrix con expected de T4-N1")

# ---------------------------------------------------------------- T4-N2
# Rouché–Frobenius: sistema incompatible (choice, índice 2)
print("T4-N2 · Clasificación por Rouché–Frobenius")
A = Matrix([[1, 1], [2, 2]])
C = Matrix([[1, 1, 1], [2, 2, 3]])
ok(A.rank() == 1, "rango(A) = 1")
ok(C.rank() == 2, "rango([[A,b]]) = 2 > rango(A) ⇒ incompatible")
ok(A.rank() < C.rank(), "expected choice 2 = «incompatible»")

# ---------------------------------------------------------------- T4-N3
# Sistema indeterminado: x = 4 - s - t
print("T4-N3 · Solución paramétrica de un sistema indeterminado")
s, t = symbols("s t")
x_param = 4 - s - t
res = Matrix([x_param, s, t])
A = Matrix([[1, 1, 1], [2, 2, 2]])
ok(simplify(A * res - Matrix([4, 8])) == zeros(2, 1), "x = 4-s-t cumple x+y+z=4 y 2x+2y+2z=8")
ok(eq(x_param, "4-s-t"), "expected expr «4-s-t»")

# ---------------------------------------------------------------- T4-N4
# Proyección ortogonal de b=(3,1) sobre a=(1,1)
print("T4-N4 · Proyección ortogonal")
a = Matrix([1, 1])
b = Matrix([3, 1])
coef = (a.dot(b)) / (a.dot(a))
proj = coef * a
ok(proj == Matrix([2, 2]), "proj_a(b) = (2,2); expected vector [['2'],['2']]")

# ---------------------------------------------------------------- T4-N5
# Compatibilidad: bool false
print("T4-N5 · ¿Es compatible el sistema?")
A = Matrix([[1, 2], [2, 4]])
C = Matrix([[1, 2, 3], [2, 4, 7]])
ok(A.rank() == 1 and C.rank() == 2, "rango(A)=1 < rango(C)=2 ⇒ incompatible")
ok(A.rank() < C.rank(), "expected bool false")

# ---------------------------------------------------------------- T4-N6
# A^T A para las ecuaciones normales
print("T4-N6 · Matriz A^T A")
A = Matrix([[1, 0], [1, 1], [1, 2]])
AtA = A.T * A
ok(same_matrix(AtA, [["3", "3"], ["3", "5"]]), "A^T A = [[3,3],[3,5]]")

# ---------------------------------------------------------------- T4-N7
# Inversa de matriz triangular superior por recurrencia (Prop. 4.2)
print("T4-N7 · Inversa de matriz triangular superior por recurrencia")
U = Matrix([[1, 2, -1], [0, 2, 4], [0, 0, -1]])
Uinv = U.inv()
ok(same_matrix(Uinv, [["1", "-1", "-5"], ["0", "1/2", "2"], ["0", "0", "-1"]]),
   "U^-1 = [[1,-1,-5],[0,1/2,2],[0,0,-1]]")
# Comprobación explícita de la recurrencia de la Prop. 4.2
B = zeros(3, 3)
for j in range(3):
    B[j, j] = Rational(1, U[j, j])
for j in range(1, 3):
    for i in range(j - 1, -1, -1):
        B[i, j] = -Rational(1, U[i, i]) * sum(U[i, k] * B[k, j] for k in range(i + 1, j + 1))
ok(B == Uinv, "Recurrencia b_ij = -(1/u_ii) sum_{k=i+1}^j u_ik b_kj reproduce U^-1")

# ---------------------------------------------------------------- T4-M1
# Menores principales conducentes y existencia de LU (Teo. 4.11)
print("T4-M1 · Menores principales conducentes y existencia de LU")
A = Matrix([[2, 4, 1], [4, 8, 3], [1, 3, 5]])
d1 = A[:1, :1].det()
d2 = A[:2, :2].det()
d3 = A.det()
ok(eq(d1, "2") and eq(d2, "0") and eq(d3, "-2"),
   "Δ1 = 2, Δ2 = 0, Δ3 = -2 != 0 (no singular con Δ2=0)")
ok(d3 != 0 and d2 == 0, "Por el Teorema 4.11, A no admite factorización A = LU sin permutación (choice 1)")

# ---------------------------------------------------------------- T4-M2
# QR reducida por Gram–Schmidt de [[1,1],[0,3],[0,4]] con diagonal positiva
print("T4-M2 · QR reducida (Gram–Schmidt con r_ii > 0)")
A = Matrix([[1, 1], [0, 3], [0, 4]])
Q1, R1 = A.QRdecomposition()
ok(same_matrix(Q1, [["1", "0"], ["0", "3/5"], ["0", "4/5"]]),
   "expected Q1 = [[1,0],[0,3/5],[0,4/5]]")
ok(same_matrix(R1, [["1", "1"], ["0", "5"]]),
   "expected R1 = [[1,1],[0,5]]")
ok(simplify(Q1 * R1 - A) == zeros(3, 2), "Q1·R1 = A")
ok(simplify(Q1.T * Q1 - eye(2)) == zeros(2, 2), "columnas de Q1 ortonormales")
ok(R1[0, 0] > 0 and R1[1, 1] > 0, "diagonal de R1 estrictamente positiva")

# ---------------------------------------------------------------- T4-M3
# Ajuste de la recta y = m x + n a (0,0),(1,1),(2,3),(3,4)
print("T4-M3 · Ajuste de recta por mínimos cuadrados")
Amat = Matrix([[0, 1], [1, 1], [2, 1], [3, 1]])
bvec = Matrix([0, 1, 3, 4])
sol = (Amat.T * Amat).inv() * Amat.T * bvec
m_val, n_val = sol[0], sol[1]
ok(eq(m_val, "7/5") and eq(n_val, "-1/10"),
   "(A^T A)^-1 A^T b = (7/5, -1/10); expected m=7/5, n=-1/10")
residuo = Amat * sol - bvec
ok(simplify(Amat.T * residuo) == zeros(2, 1),
   "residuo ortogonal a las columnas de A: A^T(b-Ax)=0")

# ---------------------------------------------------------------- T4-M4
# Predicción con el modelo ajustado y = 2x + 1/2 en x = 5
print("T4-M4 · Predicción con el modelo")
pred = 2 * 5 + Rational(1, 2)
ok(eq(pred, "21/2"), "y(5) = 2·5 + 1/2 = 21/2")

# ---------------------------------------------------------------- T4-M5
# Schur: autovalores de [[1,-2],[1,-1]]
print("T4-M5 · Autovalores en la diagonal de U (Schur)")
A = Matrix([[1, -2], [1, -1]])
eigs = A.eigenvals()
ok(set(eigs.keys()) == {I, -I}, "autovalores de [[1,-2],[1,-1]] = {i, -i}")
lam = symbols("lam")
ok(A.charpoly(lam).as_expr() == lam**2 + 1,
   "p_A(λ) = λ² + 1 (misma diagonal que U)")

# ---------------------------------------------------------------- T4-M6
# QR de rango + base ortonormal de ker(C^T) con columnas dependientes
print("T4-M6 · Factorización QR de rango y base ortonormal de ker(C^T)")
C = Matrix([[1, 2, 1], [0, 0, 1], [1, 2, 1]])
Q1 = Matrix([[1 / sqrt(2), 0], [0, 1], [1 / sqrt(2), 0]])
R1 = Matrix([[sqrt(2), 2 * sqrt(2), sqrt(2)], [0, 0, 1]])
Q2 = Matrix([1 / sqrt(2), 0, -1 / sqrt(2)])
ok(C.rank() == 2, "rango(C) = 2")
ok(simplify(Q1 * R1 - C) == zeros(3, 3), "Q1·R1 = C")
ok(simplify(Q1.T * Q1 - eye(2)) == zeros(2, 2), "Q1^T Q1 = I_2")
ok(simplify(C.T * Q2) == zeros(3, 1) and simplify(Q2.T * Q2) == Matrix([[1]]),
   "Q2 es unitario y pertenece a ker(C^T)")
ok(same_matrix(Q1, [["1/sqrt(2)", "0"], ["0", "1"], ["1/sqrt(2)", "0"]]),
   "expected Q1 verificado")
ok(same_matrix(R1, [["sqrt(2)", "2*sqrt(2)", "sqrt(2)"], ["0", "0", "1"]]),
   "expected R1 verificado")
ok(same_matrix(Q2, [["1/sqrt(2)"], ["0"], ["-1/sqrt(2)"]]),
   "expected Q2 verificado")

# ---------------------------------------------------------------- T4-M7
# Ajuste de un plano z = p1 x + p2 y + p3 en R^3 por mínimos cuadrados
print("T4-M7 · Ajuste de un plano en R^3 por mínimos cuadrados")
A = Matrix([[1, 0, 1], [0, 1, 1], [-1, 0, 1], [0, -1, 1], [0, 0, 1]])
b = Matrix([5, 3, 1, 3, 2])
p = (A.T * A).inv() * A.T * b
r = b - A * p
err2 = (r.T * r)[0, 0]
ok(eq(p[0], "2") and eq(p[1], "0") and eq(p[2], "14/5"),
   "p = (2, 0, 14/5)")
ok(eq(err2, "4/5"), "||b - Ap||_2^2 = 4/5")
ok(simplify(A.T * r) == zeros(3, 1), "residuo ortogonal a col(A)")

# ---------------------------------------------------------------- T4-E1
# Gauss con permutación: y+z=5, x+z=4, x+y=3
print("T4-E1 · Gauss con permutación de filas")
A = Matrix([[0, 1, 1], [1, 0, 1], [1, 1, 0]])
b = Matrix([5, 4, 3])
x = A.solve(b)
ok(x == Matrix([1, 2, 3]), "solve(A,b) = (1,2,3); expected vector [['1'],['2'],['3']]")

# ---------------------------------------------------------------- T4-E2
# Rouché–Frobenius: rango de A y de la ampliada
print("T4-E2 · Rangos de Rouché–Frobenius")
A = Matrix([[1, -2], [-2, 4], [3, -6]])
C = Matrix([[1, -2, 3], [-2, 4, -6], [3, -6, 5]])
ok(A.rank() == 1, "rango(A) = 1")
ok(C.rank() == 2, "rango([[A,b]]) = 2")
ok(A.rank() == 1 and C.rank() == 2,
   "expected multi {rangoA: 1, rangoC: 2} ⇒ incompatible")

# ---------------------------------------------------------------- T4-E3
# PLU con permutación en la etapa 2 y conmutación E1^-1 P2^-1 = P2^-1 \hat{E}_1^-1
print("T4-E3 · Factorización PLU con permutación en etapa 2")
C = Matrix([[1, 2, -1], [2, 4, 1], [-1, -1, 3]])
E1 = Matrix([[1, 0, 0], [-2, 1, 0], [1, 0, 1]])
P2 = Matrix([[1, 0, 0], [0, 0, 1], [0, 1, 0]])
P = P2.inv()
L = P2 * E1.inv() * P2.inv()
U = P2 * E1 * C
ok(P * L * U == C, "P·L·U = C")
ok(same_matrix(P, [["1", "0", "0"], ["0", "0", "1"], ["0", "1", "0"]]),
   "expected P = [[1,0,0],[0,0,1],[0,1,0]]")
ok(same_matrix(L, [["1", "0", "0"], ["-1", "1", "0"], ["2", "0", "1"]]),
   "expected L = [[1,0,0],[-1,1,0],[2,0,1]] (multiplicadores permutados)")
ok(same_matrix(U, [["1", "2", "-1"], ["0", "1", "2"], ["0", "0", "3"]]),
   "expected U = [[1,2,-1],[0,1,2],[0,0,3]]")

# ---------------------------------------------------------------- T4-E4
# Ajuste y = m x + n a (0,3),(1,1),(2,5) y predicción en x = 4
print("T4-E4 · Ajuste de recta y predicción")
Amat = Matrix([[0, 1], [1, 1], [2, 1]])
bvec = Matrix([3, 1, 5])
sol = (Amat.T * Amat).inv() * Amat.T * bvec
m_val, n_val = sol[0], sol[1]
pred = m_val * 4 + n_val
ok(eq(m_val, "1"), "pendiente m = 1")
ok(eq(n_val, "2"), "ordenada n = 2")
ok(eq(pred, "6"), "predicción y(4) = 6")
residuo = Amat * sol - bvec
ok(simplify(Amat.T * residuo) == zeros(2, 1), "A^T(b-Ax)=0")

# ---------------------------------------------------------------- T4-E5
# Sistema compatible indeterminado vía QR de A^T (ec. 28 de Perán)
print("T4-E5 · Solución de mínima norma vía QR de A^T (Perán ec. 28)")
A = Matrix([[1, 0, 1], [0, 1, 1]])
b = Matrix([2, 3])
Q1 = Matrix([[1 / sqrt(2), -1 / sqrt(6)], [0, 2 / sqrt(6)], [1 / sqrt(2), 1 / sqrt(6)]])
Q2 = Matrix([1 / sqrt(3), 1 / sqrt(3), -1 / sqrt(3)])
R1 = Matrix([[sqrt(2), 1 / sqrt(2)], [0, sqrt(6) / 2]])
ok(simplify(Q1 * R1 - A.T) == zeros(3, 2), "Q1·R1 = A^T")
x0 = simplify(Q1 * (R1 * R1.T).inv() * R1 * b)
norm2 = simplify((x0.T * x0)[0, 0])
ok(same_matrix(x0, [["1/3"], ["4/3"], ["5/3"]]), "x0 = (1/3, 4/3, 5/3)^T")
ok(eq(norm2, "14/3"), "||x0||_2^2 = 14/3")
ok(simplify(A * x0 - b) == zeros(2, 1) and simplify(Q2.T * x0) == zeros(1, 1),
   "A x0 = b y x0 ortogonal a ker(A) = col(Q2)")

# ---------------------------------------------------------------- T4-E6
# Factorización triangular de Schur compleja A = Q U Q*
print("T4-E6 · Factorización triangular de Schur compleja")
A = Matrix([[0, -4], [1, 0]])
Q = Matrix([[2 * I / sqrt(5), 1 / sqrt(5)], [1 / sqrt(5), 2 * I / sqrt(5)]])
U = Matrix([[2 * I, -3], [0, -2 * I]])
ok(simplify(Q.H * Q - eye(2)) == zeros(2, 2), "Q es unitaria: Q* Q = I_2")
ok(simplify(Q * U * Q.H - A) == zeros(2, 2), "Q U Q* = A")
ok(same_matrix(Q, [["2*I/sqrt(5)", "1/sqrt(5)"], ["1/sqrt(5)", "2*I/sqrt(5)"]]),
   "expected Q verificado")
ok(same_matrix(U, [["2*I", "-3"], ["0", "-2*I"]]),
   "expected U = [[2i, -3], [0, -2i]] verificado")

# ---------------------------------------------------------------- resumen
print()
if FAIL == 0:
    print("OK: %d/%d verificados" % (N, N))
    sys.exit(0)
print("FALLO: %d/%d incorrectos" % (FAIL, N))
sys.exit(1)
