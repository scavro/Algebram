#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verificación del Tema III — Matrices y tensores como aplicaciones lineales
o multilineales.

Recalcula con SymPy cada respuesta de los ejercicios (assets/data/tema-3.js)
desde el enunciado y la compara con el `expected` declarado (constantes de
este script). Verifica además los ejemplos numerados de la teoría
(temas/tema-tema-3.html) y las propiedades del determinante que se usan.

Uso:  python3 verify/tema-3-verify.py
Sale con código 0 e imprime «OK: N/N verificados» si todo cuadra.
"""

import sys

from sympy import Matrix, Rational, expand, simplify, sqrt, symbols

TOTAL = 0
OK = 0
FAILS = []


def check(nombre, cond, detalle=""):
    """Registra una comprobación booleana."""
    global TOTAL, OK
    TOTAL += 1
    if cond:
        OK += 1
    else:
        FAILS.append(f"{nombre}: {detalle}")
        print(f"✗ FALLA {nombre} {detalle}")


def eq(a, b):
    """Igualdad exacta tras simplificar (expresiones o números)."""
    return simplify(a - b) == 0


def eq_set(d_eigs, esperado):
    """Compara {autovalor: multiplicidad} con un conjunto de valores."""
    return set(d_eigs.keys()) == set(esperado)


def proporcional(v, w):
    """¿Existe λ ≠ 0 con v = λ w?"""
    v, w = Matrix(v), Matrix(w)
    lam = None
    for k in range(v.shape[0]):
        if w[k] != 0:
            lam = simplify(v[k] / w[k])
            break
    if lam is None:
        return v == Matrix.zeros(v.shape[0], 1)
    return simplify(v - lam * w) == Matrix.zeros(v.shape[0], 1)


# =============================================================================
# PROPIEDADES DEL DETERMINANTE (base de las soluciones)
# =============================================================================
A_gen = Matrix([[1, 2, 3], [4, 5, 7], [0, 1, 2]])
B_gen = Matrix([[2, 0, 1], [1, 3, 2], [4, 1, 5]])
check("propiedad det(AB)=det(A)det(B)", eq((A_gen * B_gen).det(), A_gen.det() * B_gen.det()))
check("propiedad det(2A)=2^n det(A) n=3", eq((2 * A_gen).det(), 8 * A_gen.det()))
check("propiedad det(A^T)=det(A)", eq(A_gen.T.det(), A_gen.det()))
check(
    "propiedad det(A^{-1})=1/det(A)",
    eq(A_gen.inv().det(), 1 / A_gen.det()),
    f"det(A)={A_gen.det()}",
)
check(
    "dos columnas iguales ⇒ det=0",
    Matrix([[1, 1], [2, 2]]).det() == 0,
)
check(
    "det(A+B)≠det(A)+det(B) en general (contrajemplo)",
    Matrix([[1, 2], [3, 4]]).det() + Matrix([[2, 0], [1, 1]]).det()
    != (Matrix([[1, 2], [3, 4]]) + Matrix([[2, 0], [1, 1]])).det(),
)

# =============================================================================
# EJERCICIOS (expected = constantes de assets/data/tema-3.js)
# =============================================================================

# --- T3-N1: determinante 2x2 -------------------------------------------------
A = Matrix([[3, 1], [2, 4]])
check("T3-N1 det(2x2)", eq(A.det(), 10), f"obtenido {A.det()}, esperado 10")

# --- T3-N2: determinante 3x3 por la primera fila -----------------------------
A = Matrix([[2, 0, 1], [1, 3, 2], [4, 1, 5]])
desarrollo = 2 * Matrix([[3, 2], [1, 5]]).det() - 0 * Matrix([[1, 2], [4, 5]]).det() + 1 * Matrix(
    [[1, 3], [4, 1]]
).det()
check("T3-N2 det(3x3) por la primera fila", eq(A.det(), 15) and eq(desarrollo, 15),
      f"obtenido {A.det()}, desarrollo {desarrollo}, esperado 15")

# --- T3-N3: det(AB) y det(A^-1) a partir de det(A)=-2, det(B)=3 --------------
detA, detB = -2, 3
detAB_esperado = -6
detAinv_esperado = Rational(-1, 2)
check("T3-N3 det(AB)=det(A)det(B)", eq(detA * detB, detAB_esperado),
      f"{detA}*{detB}≠{detAB_esperado}")
check("T3-N3 det(A^-1)=1/det(A)", eq(1 / Rational(detA), detAinv_esperado))
# comprobación con matrices concretas de esos determinantes
Ac = Matrix([[detA, 0, 0], [0, 1, 0], [0, 0, 1]])
Bc = Matrix([[detB, 0, 0], [0, 1, 0], [0, 0, 1]])
check("T3-N3 (instancia concreta)", eq((Ac * Bc).det(), detAB_esperado) and eq(Ac.inv().det(), detAinv_esperado))

# --- T3-N4: rango -------------------------------------------------------------
A = Matrix([[1, 2, 3], [2, 4, 6], [1, 1, 1]])
check("T3-N4 rng(A)", A.rank() == 2, f"obtenido {A.rank()}, esperado 2")

# --- T3-N5: autovalores de matriz triangular ---------------------------------
A = Matrix([[4, 7], [0, -2]])
check("T3-N5 autovalores {4,-2}", eq_set(A.eigenvals(), [4, -2]), f"{A.eigenvals()}")

# --- T3-N6: forma cuadrática en un vector ------------------------------------
A = Matrix([[2, 1], [1, 3]])
x = Matrix([1, -1])
check("T3-N6 x^T A x", eq((x.T * A * x)[0], 3), f"obtenido {(x.T * A * x)[0]}, esperado 3")

# --- T3-M1: vector del núcleo -------------------------------------------------
A = Matrix([[1, 1, 0], [0, 1, 1], [1, 2, 1]])
nul = A.nullspace()
v_esp = Matrix([1, -1, 1])
check("T3-M1 dim ker(A)=1", len(nul) == 1, f"{nul}")
check("T3-M1 (1,-1,1) ∈ ker(A)", simplify(A * v_esp) == Matrix.zeros(3, 1))
check("T3-M1 ker(A)=⟨(1,-1,1)⟩", proporcional(nul[0], v_esp), f"base {nul[0].T}")
# unicidad: única solución con tercera componente 1
check(
    "T3-M1 única con tercera componente 1",
    proporcional(nul[0], v_esp) and v_esp[2] == 1,
)

# --- T3-M2: cuatro subespacios y teorema del rango ---------------------------
A = Matrix([[1, 2, 3], [2, 4, 6], [1, 1, 1]])
r, m, n = A.rank(), A.shape[1], A.shape[0]
dim_col, dim_fil = len(A.columnspace()), len(A.T.columnspace())
dim_nul, dim_nulT = len(A.nullspace()), len(A.T.nullspace())
check("T3-M2 dim col(A)=2", dim_col == 2, f"{dim_col}")
check("T3-M2 dim fil(A)=2", dim_fil == 2, f"{dim_fil}")
check("T3-M2 dim nul(A)=1", dim_nul == 1, f"{dim_nul}")
check("T3-M2 dim nul(A^T)=1", dim_nulT == 1, f"{dim_nulT}")
check("T3-M2 teorema del rango: r+nul(A)=m", r + dim_nul == m, f"{r}+{dim_nul}≠{m}")
check("T3-M2 teorema del rango: r+nul(A^T)=n", r + dim_nulT == n, f"{r}+{dim_nulT}≠{n}")
check("T3-M2 col(A) ⊥ nul(A^T)", all(
    simplify(u.dot(v)) == 0
    for u in A.columnspace()
    for v in A.T.nullspace()
))

# --- T3-M3: multiplicidades algebraica y geométrica --------------------------
A = Matrix([[2, 1, 0], [0, 2, 0], [0, 0, 3]])
eigs = A.eigenvals()          # {autovalor: multiplicidad algebraica}
check("T3-M3 autovalores {2,3}", eq_set(eigs, [2, 3]), f"{eigs}")
check("T3-M3 multiplicidad algebraica de 2 es 2", eigs[2] == 2, f"{eigs}")
vs2 = [vs for (val, mult, vs) in A.eigenvects() if val == 2][0]
check("T3-M3 multiplicidad geométrica de 2 es 1", len(vs2) == 1, f"dim E_2 = {len(vs2)}")
check("T3-M3 geométrica ≤ algebraica", len(vs2) <= eigs[2])

# --- T3-M4: bool (simétrica ⇒ autovalores reales) ----------------------------
sim1 = Matrix([[2, 1], [1, 2]])
sim2 = Matrix([[1, 2], [2, 3]])
sim3 = Matrix([[0, -1], [-1, 0]])
reales = all(v.is_real for M in (sim1, sim2, sim3) for v in M.eigenvals())
check("T3-M4 autovalores de simétricas reales", reales)
no_sim = Matrix([[1, -1], [1, 1]])   # autovalores 1 ± i
check("T3-M4 la hipótesis de simetría es necesaria",
      not all(v.is_real for v in no_sim.eigenvals()),
      f"{no_sim.eigenvals()}")

# --- T3-M5: matriz simétrica de una forma cuadrática ------------------------
x1, x2, x3 = symbols("x1 x2 x3")
X = Matrix([x1, x2, x3])
f = x1**2 + 2 * x1 * x2 + 6 * x1 * x3 + 2 * x2**2 + 4 * x2 * x3 + 3 * x3**2
A = Matrix([[1, 1, 3], [1, 2, 2], [3, 2, 3]])
check("T3-M5 A simétrica", A == A.T)
check("T3-M5 x^T A x = f(x)", expand((X.T * A * X)[0] - f) == 0,
      f"obtenido {expand((X.T * A * X)[0])}")
# recuperación de las entradas con a_ij = [f(e_i+e_j)-f(e_i)-f(e_j)]/2
def fval(v):
    return f.subs({x1: v[0], x2: v[1], x3: v[2]})

ok_coef = True
for i in range(3):
    for j in range(3):
        ei = [1 if k == i else 0 for k in range(3)]
        ej = [1 if k == j else 0 for k in range(3)]
        suma = [ei[k] + ej[k] for k in range(3)]
        aij = (fval(suma) - fval(ei) - fval(ej)) / 2
        ok_coef = ok_coef and (aij == A[i, j])
check("T3-M5 coeficientes a_ij = [f(e_i+e_j)-f(e_i)-f(e_j)]/2", ok_coef)

# --- T3-E1: determinante 4x4 por bloques ------------------------------------
D = Matrix([[1, 2, 3, 4], [3, 4, 5, 6], [0, 0, 2, 1], [0, 0, 1, 2]])
A11, A22 = D[:2, :2], D[2:, 2:]
check("T3-E1 det(bloques) = det(A11)det(A22)", eq(D.det(), A11.det() * A22.det()),
      f"{D.det()} vs {A11.det()*A22.det()}")
check("T3-E1 det(D)=-6", eq(D.det(), -6), f"obtenido {D.det()}")

# --- T3-E2: mayor autovalor y autovector de una simétrica 3x3 ----------------
A = Matrix([[2, 1, 1], [1, 2, 1], [1, 1, 2]])
eigs = A.eigenvals()
check("T3-E2 autovalores {4,1}", eq_set(eigs, [4, 1]), f"{eigs}")
lam_max = 4
check("T3-E2 mayor autovalor = 4", max(eigs) == lam_max, f"{eigs}")
v = Matrix([1, 1, 1])
check("T3-E2 A v = 4 v", simplify(A * v - lam_max * v) == Matrix.zeros(3, 1))
espacio = [vs for (val, mult, vs) in A.eigenvects() if val == lam_max][0]
check("T3-E2 ⟨(1,1,1)⟩ = E_4", len(espacio) == 1 and proporcional(espacio[0], v),
      f"base {espacio[0].T}")
check("T3-E2 primera componente 1", v[0] == 1)

# --- T3-E3: cuatro subespacios de una 3x4 ------------------------------------
A = Matrix([[1, 0, 1, 1], [0, 1, 1, 2], [1, 1, 2, 3]])
r, m, n = A.rank(), A.shape[1], A.shape[0]
dim_col, dim_fil = len(A.columnspace()), len(A.T.columnspace())
dim_nul, dim_nulT = len(A.nullspace()), len(A.T.nullspace())
check("T3-E3 dim col(A)=2", dim_col == 2, f"{dim_col}")
check("T3-E3 dim fil(A)=2", dim_fil == 2, f"{dim_fil}")
check("T3-E3 dim nul(A)=2", dim_nul == 2, f"{dim_nul}")
check("T3-E3 dim nul(A^T)=1", dim_nulT == 1, f"{dim_nulT}")
check("T3-E3 teorema del rango: r+nul(A)=m", r + dim_nul == m, f"{r}+{dim_nul}≠{m}")
check("T3-E3 teorema del rango: r+nul(A^T)=n", r + dim_nulT == n, f"{r}+{dim_nulT}≠{n}")

# --- T3-E4: opción múltiple sobre propiedades del determinante --------------
P = Matrix([[1, 2], [3, 4]])
Q = Matrix([[2, 0], [1, 1]])
# (i) det(A+B)=det(A)+det(B)  → falsa
check("T3-E4 det(A+B)≠det(A)+det(B) (falsa)",
      (P + Q).det() != P.det() + Q.det(),
      f"{(P+Q).det()} ≠ {P.det()}+{Q.det()}")
# (ii) det(AB)=det(A)det(B)  → verdadera (respuesta correcta)
check("T3-E4 det(AB)=det(A)det(B) (verdadera)",
      eq((P * Q).det(), P.det() * Q.det()))
# (iii) det(2A)=2 det(A)  → falsa en general
check("T3-E4 det(2A)≠2det(A) (falsa)",
      (2 * P).det() != 2 * P.det(),
      f"{(2*P).det()} ≠ {2*P.det()}")
# (iv) det(A+B)=det(A)det(B)  → falsa
check("T3-E4 det(A+B)≠det(A)det(B) (falsa)",
      (P + Q).det() != P.det() * Q.det())

# =============================================================================
# EJEMPLOS NUMERADOS DE LA TEORÍA (temas/tema-3.html)
# =============================================================================

# Ejemplo 3.1 — aplicación lineal f(x)=Ax
A = Matrix([[1, 2, 0], [0, -1, 3]])
x = Matrix([2, -1, 3])
check("Ejemplo 3.1 f(x)=Ax", (A * x) == Matrix([0, 10]), f"{(A*x).T}")

# Ejemplo 3.2 — la composición es el producto
F = Matrix([[1, 1], [0, 1]])
G = Matrix([[2, 0], [0, 3]])
check("Ejemplo 3.2 matriz del compuesto = G F", G * F == Matrix([[2, 2], [0, 3]]))
check("Ejemplo 3.2 g(f(x)) = (GF)x", G * (F * Matrix([1, 2])) == (G * F) * Matrix([1, 2]))

# Ejemplo 3.3 — forma bilineal y coeficientes a_ij = g(e_i, e_j)
Bm = Matrix([[1, 2], [3, 4]])
u, w = Matrix([2, -1]), Matrix([3, 1])
g = (u.T * Bm * w)[0]
g_exp = 2 * 3 + 2 * 2 * 1 + 3 * (-1) * 3 + 4 * (-1) * 1
check("Ejemplo 3.3 g(u,v)=u^T B v", eq(g, g_exp), f"{g} vs {g_exp}")
coef = Matrix(2, 2, lambda i, j: (
    Matrix([1 if k == i else 0 for k in range(2)]).T * Bm * Matrix([1 if k == j else 0 for k in range(2)])
)[0])
check("Ejemplo 3.3 recuperación de la matriz (a_ij = g(e_i,e_j))", coef == Bm)

# Ejemplo 3.4 — triangular: producto de la diagonal
A = Matrix([[2, 0, 0], [5, 1, 0], [7, 3, -1]])
check("Ejemplo 3.4 det triangular", eq(A.det(), 2 * 1 * (-1)), f"{A.det()}")

# Ejemplo 3.5 — determinante por bloques
D = Matrix([[1, 2, 3, 4], [3, 4, 5, 6], [0, 0, 2, 0], [0, 0, 1, 3]])
check("Ejemplo 3.5 det([[A,C],[0,B]]) = det(A)det(B)",
      eq(D.det(), Matrix([[1, 2], [3, 4]]).det() * Matrix([[2, 0], [1, 3]]).det()),
      f"{D.det()}")

# Ejemplo 3.6 — volumen: |det| y fórmula de Gram
A2 = Matrix([[3, 1], [2, 4]])
check("Ejemplo 3.6 área = |det|", abs(A2.det()) == 10, f"{abs(A2.det())}")
A32 = Matrix([[1, 0], [1, 1], [0, 1]])
gram = A32.T * A32
check("Ejemplo 3.6 área = sqrt(det(A^T A))", eq(sqrt(gram.det()), sqrt(3)),
      f"{sqrt(gram.det())}")
check("Ejemplo 3.6 A^T A = [[2,1],[1,2]]", gram == Matrix([[2, 1], [1, 2]]))

# Ejemplo 3.7 — los cuatro subespacios de A=[[1,2],[3,6]]
A = Matrix([[1, 2], [3, 6]])
check("Ejemplo 3.7 col(A)=⟨(1,3)⟩",
      len(A.columnspace()) == 1 and proporcional(A.columnspace()[0], Matrix([1, 3])))
check("Ejemplo 3.7 fil(A)=⟨(1,2)⟩",
      len(A.T.columnspace()) == 1 and proporcional(A.T.columnspace()[0], Matrix([1, 2])))
check("Ejemplo 3.7 nul(A)=⟨(-2,1)⟩",
      len(A.nullspace()) == 1 and proporcional(A.nullspace()[0], Matrix([-2, 1])))
check("Ejemplo 3.7 nul(A^T)=⟨(-3,1)⟩",
      len(A.T.nullspace()) == 1 and proporcional(A.T.nullspace()[0], Matrix([-3, 1])))

# Ejemplo 3.8 — núcleo generalizado de la nilpotente de Jordan
J = Matrix([[0, 1, 0], [0, 0, 1], [0, 0, 0]])
check("Ejemplo 3.8 dims 1,2,3",
      (len(J.nullspace()), len((J**2).nullspace()), len((J**3).nullspace())) == (1, 2, 3))
check("Ejemplo 3.8 ker J^3 = R^3 = ker J^4", (J**3) == Matrix.zeros(3, 3))

# Ejemplo 3.9 — autovalores de [[2,1],[1,2]]
A = Matrix([[2, 1], [1, 2]])
lam = symbols("lam")
check("Ejemplo 3.9 P_A = (λ-3)(λ-1)",
      expand(A.charpoly(lam).as_expr() - (lam - 3) * (lam - 1)) == 0,
      f"{A.charpoly(lam).as_expr()}")
check("Ejemplo 3.9 autovectores (1,1),(1,-1)",
      simplify(A * Matrix([1, 1]) - 3 * Matrix([1, 1])) == Matrix.zeros(2, 1)
      and simplify(A * Matrix([1, -1]) - Matrix([1, -1])) == Matrix.zeros(2, 1))

# Ejemplo 3.10 — matriz simétrica de la forma cuadrática
f2 = 2 * x1**2 + 2 * x1 * x2 + 4 * x1 * x3 + 3 * x2**2 + 6 * x2 * x3 + 5 * x3**2
A = Matrix([[2, 1, 2], [1, 3, 3], [2, 3, 5]])
check("Ejemplo 3.10 x^T A x = f(x)", expand((X.T * A * X)[0] - f2) == 0,
      f"obtenido {expand((X.T * A * X)[0])}")
check("Ejemplo 3.10 A simétrica", A == A.T)

# =============================================================================
# RESUMEN
# =============================================================================
print()
if FAILS:
    print(f"FALLAN {len(FAILS)} de {TOTAL}:")
    for f_ in FAILS:
        print("  -", f_)
    sys.exit(1)
print(f"OK: {OK}/{TOTAL} verificados")
sys.exit(0)
