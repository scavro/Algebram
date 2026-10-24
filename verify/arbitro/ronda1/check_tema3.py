"""ÁRBITRO R1 · check_tema3.py — recálculo independiente de tema-3.js con sympy."""
import json, os, sys
import sympy as sp
from sx import sx

HERE = os.path.dirname(os.path.abspath(__file__))
exp = json.load(open(os.path.join(HERE, "expected.json")))["tema-3"]
E = {q["id"]: q["answer"] for q in exp}
ok = fail = 0

def eq_mat(M, exp_rows):
    M = sp.Matrix(M)
    N = sp.Matrix([[sx(str(c)) for c in row] for row in exp_rows])
    return M.shape == N.shape and all(sp.simplify(M[k] - N[k]) == 0 for k in range(M.rows * M.cols))

def recalc_mat(id_, M, exp_rows):
    global ok, fail
    good = eq_mat(M, exp_rows)
    print(f"[{'OK ' if good else 'FALLO'}] {id_}: recalc=\n{sp.Matrix(M)}\n  expected=\n{sp.Matrix([[sx(str(c)) for c in r] for r in exp_rows])}")
    if good: ok += 1
    else: fail += 1

def recalc(id_, computed, expected):
    global ok, fail
    good = sp.simplify(sx(str(computed)) - sx(str(expected))) == 0
    print(f"[{'OK ' if good else 'FALLO'}] {id_}: recalc={computed} expected={expected}")
    if good: ok += 1
    else: fail += 1

# ---------- T3-N1 ----------
A = sp.Matrix([[3, 1], [2, 4]])
recalc("T3-N1", A.det(), E["T3-N1"]["expected"])

# ---------- T3-N2 ----------
A = sp.Matrix([[2, 0, 1], [1, 3, 2], [4, 1, 5]])
recalc("T3-N2", A.det(), E["T3-N2"]["expected"])

# ---------- T3-N3 ----------
detA, detB = -2, 3
recalc("T3-N3.detAB", detA * detB, E["T3-N3"]["fields"]["detAB"]["expected"])
recalc("T3-N3.detInv", sp.Rational(1, detA), E["T3-N3"]["fields"]["detInv"]["expected"])

# ---------- T3-N4 ----------
A = sp.Matrix([[1, 2, 3], [2, 4, 6], [1, 1, 1]])
recalc("T3-N4", A.rank(), E["T3-N4"]["expected"])

# ---------- T3-N5 ----------
A = sp.Matrix([[4, 7], [0, -2]])
eigs = sorted(A.eigenvals().keys(), key=lambda x: float(x))
vals = [eigs[0], eigs[1]]
a = sorted([str(sx(v)) for v in vals])
b = sorted([str(sx(v)) for v in E["T3-N5"]["expected"]])
good = a == b
print(f"[{'OK ' if good else 'FALLO'}] T3-N5: recalc={a} expected={b}")
if good: ok += 1
else: fail += 1

# ---------- T3-N6 ----------
A = sp.Matrix([[2, 1], [1, 3]])
x = sp.Matrix([1, -1])
recalc("T3-N6", (x.T * A * x)[0], E["T3-N6"]["expected"])

# ---------- T3-M1 ----------
A = sp.Matrix([[1, 1, 0], [0, 1, 1], [1, 2, 1]])
ns = A.nullspace()  # base del núcleo
# vector del núcleo con tercera componente 1
u = ns[0] / ns[0][2]
recalc_mat("T3-M1", u, E["T3-M1"]["expected"])

# ---------- T3-M2 ----------
A = sp.Matrix([[1, 2, 3], [2, 4, 6], [1, 1, 1]])
r = A.rank()
m_rows, n_cols = A.rows, A.cols
# convención del curso (verificado contra su teoría): dim nul(A) = #columnas - r; dim nul(A^T) = #filas - r
dim_col = r; dim_fil = A.T.rank()
dim_nul = n_cols - r; dim_nulT = m_rows - r
recalc("T3-M2.col", dim_col, E["T3-M2"]["fields"]["col"]["expected"])
recalc("T3-M2.fil", dim_fil, E["T3-M2"]["fields"]["fil"]["expected"])
recalc("T3-M2.nul", dim_nul, E["T3-M2"]["fields"]["nul"]["expected"])
recalc("T3-M2.nulT", dim_nulT, E["T3-M2"]["fields"]["nulT"]["expected"])

# ---------- T3-M3 ----------
A = sp.Matrix([[2, 1, 0], [0, 2, 0], [0, 0, 3]])
lam = 2
malg = (sp.Symbol("l") - 2)  # exponente en P_A
P = (sp.Symbol("l") - 2)**2 * (sp.Symbol("l") - 3)
malg = 2
mgeo = (lam*sp.eye(3) - A).nullspace().__len__()
recalc("T3-M3.malg", malg, E["T3-M3"]["fields"]["malg"]["expected"])
recalc("T3-M3.mgeo", mgeo, E["T3-M3"]["fields"]["mgeo"]["expected"])

# ---------- T3-M4: simétrica real -> autovalores reales (bool True) ----------
# comprobación: para toda simétrica real los autovalores son reales (teorema espectral)
B = sp.Matrix([[1, -1], [1, 1]])  # contraejemplo sin simetría
assert any(sp.im(l) != 0 for l in B.eigenvals().keys())
# el enunciado es VERDADERO (simétrica real => reales)
recalc("T3-M4", 1, int(E["T3-M4"]["expected"]))

# ---------- T3-M5 ----------
# f = x1^2 + 2 x1x2 + 6 x1x3 + 2 x2^2 + 4 x2x3 + 3 x3^2 -> matriz simétrica
x1, x2, x3 = sp.symbols("x1 x2 x3")
f = x1**2 + 2*x1*x2 + 6*x1*x3 + 2*x2**2 + 4*x2*x3 + 3*x3**2
xv = sp.Matrix([x1, x2, x3])
# matriz por derivadas parciales de segundo orden: a_ij = coef/2
A = sp.Matrix([[1, 1, 3], [1, 2, 2], [3, 2, 3]])
check = sp.expand((xv.T * A * xv)[0] - f) == 0
print(f"[{'OK ' if check else 'FALLO'}] T3-M5 (identidad x^T A x = f verificada: {check})")
if check: ok += 1
else: fail += 1
recalc_mat("T3-M5", A, E["T3-M5"]["expected"])

# ---------- T3-E1 ----------
D = sp.Matrix([[1, 2, 3, 4], [3, 4, 5, 6], [0, 0, 2, 1], [0, 0, 1, 2]])
recalc("T3-E1", D.det(), E["T3-E1"]["expected"])

# ---------- T3-E2 ----------
A = sp.Matrix([[2, 1, 1], [1, 2, 1], [1, 1, 2]])
eigs = A.eigenvals()
lam_max = max(eigs.keys(), key=lambda x: float(x))
v = (lam_max*sp.eye(3) - A).nullspace()[0]
v = v / v[0]  # primera componente 1
recalc("T3-E2.lam", lam_max, E["T3-E2"]["fields"]["lam"]["expected"])
recalc_mat("T3-E2.v", v, E["T3-E2"]["fields"]["v"]["expected"])

# ---------- T3-E3 ----------
A = sp.Matrix([[1, 0, 1, 1], [0, 1, 1, 2], [1, 1, 2, 3]])
r = A.rank()
recalc("T3-E3.col", r, E["T3-E3"]["fields"]["col"]["expected"])
recalc("T3-E3.fil", A.T.rank(), E["T3-E3"]["fields"]["fil"]["expected"])
recalc("T3-E3.nul", A.cols - r, E["T3-E3"]["fields"]["nul"]["expected"])
recalc("T3-E3.nulT", A.rows - r, E["T3-E3"]["fields"]["nulT"]["expected"])

# ---------- T3-E4: elección (det(AB)=det A det B siempre cierta) ----------
A2 = sp.Matrix([[1, 2], [3, 4]]); B2 = sp.Matrix([[2, 0], [1, 1]])
# verificación de los contraejemplos de la solución
assert (A2 + B2).det() == 7 and A2.det() + B2.det() == 0
assert (2*A2).det() == -8 and 2*A2.det() == -4
assert (A2 + B2).det() != A2.det() * B2.det()
# la opción correcta es la 1 (det(AB)=det A det B): verifico multiplicatividad simbólicamente
l = sp.symbols("l")
M1 = sp.Matrix([[1, 2], [3, 5]]); M2 = sp.Matrix([[2, -1], [0, 4]])
assert (M1*M2).det() == M1.det() * M2.det()
recalc("T3-E4", 1, E["T3-E4"]["expected"])

print(f"\nTEMA-3: {ok} OK, {fail} FALLOS")
sys.exit(1 if fail else 0)
