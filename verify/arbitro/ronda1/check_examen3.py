"""ÁRBITRO R1 · check_examen3.py — recálculo independiente de examen-3.js."""
import json, os, sys
import sympy as sp
from sx import sx

HERE = os.path.dirname(os.path.abspath(__file__))
exp = json.load(open(os.path.join(HERE, "expected.json")))["examen-3"]
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

l = sp.Symbol("l")

# ---------- X3-1 ----------
A = sp.Matrix([[25, 15], [15, 18]])
a = sp.sqrt(A[0, 0]); b_ = A[1, 0] / a; c = sp.sqrt(A[1, 1] - b_**2)
L = sp.Matrix([[a, 0], [b_, c]])
assert sp.simplify(L * L.T - A) == sp.zeros(2)
recalc_mat("X3-1", L, E["X3-1"]["expected"])

# ---------- X3-2 ----------
z = (3 + 4*sp.I) / (1 - 2*sp.I)
recalc("X3-2", sp.simplify(sp.expand_complex(z)), E["X3-2"]["expected"])

# ---------- X3-3 ----------
A = sp.Matrix([[1, 2], [3, 4]]); B = sp.Matrix([[0, 1], [1, 0]])
res = (A * B).T == A.T * B.T   # False
recalc("X3-3", int(bool(res)), int(E["X3-3"]["expected"]))

# ---------- X3-4 ----------
recalc("X3-4", 2**3 * (-2), E["X3-4"]["expected"])

# ---------- X3-5 ----------
A = sp.Matrix([[2, 4, 2], [4, 9, 6], [2, 6, 9]])
# LDL^T por eliminación (sin intercambios)
n = 3
L = sp.eye(n); D = sp.zeros(n); U = A.copy()
for j in range(n):
    D[j, j] = U[j, j]
    for i in range(j + 1, n):
        m_ = U[i, j] / U[j, j]
        L[i, j] = m_
        U[i, :] = U[i, :] - m_ * U[j, :]
assert sp.simplify(L * D * L.T - A) == sp.zeros(3)
recalc_mat("X3-5.L", L, E["X3-5"]["fields"]["L"]["expected"])
recalc_mat("X3-5.D", D, E["X3-5"]["fields"]["D"]["expected"])

# ---------- X3-6 ----------
# A = [[1,0],[1,1],[1,2],[1,3]], incógnitas (n, m)
A = sp.Matrix([[1, 0], [1, 1], [1, 2], [1, 3]])
y = sp.Matrix([0, 2, 2, 4])
xsol = (A.T * A).inv() * A.T * y   # (n, m)
recalc("X3-6.m", xsol[1], E["X3-6"]["fields"]["m"]["expected"])
recalc("X3-6.n", xsol[0], E["X3-6"]["fields"]["n"]["expected"])

# ---------- X3-7 ----------
A = sp.Matrix([[3, -1], [1, 1]])
multiplicities = A.eigenvals()   # {2: 2}
assert multiplicities == {2: 2}
mgeo = len((A - 2*sp.eye(2)).nullspace())
J = sp.Matrix([[2, 1], [0, 2]]) if mgeo == 1 else sp.diag(2, 2)
# comprobación por similitud
v1 = (A - 2*sp.eye(2)).nullspace()[0]
# autovector generalizado: (A-2I)v2 = v1
v2 = sp.Matrix([1, 0])  # (A-2I)(1,0) = (1,1) = v1  (verificado abajo)
assert sp.simplify((A - 2*sp.eye(2)) * v2 - v1) == sp.zeros(2, 1)
W = sp.Matrix.hstack(v1, v2)
assert sp.simplify(W.inv() * A * W - J) == sp.zeros(2)
recalc_mat("X3-7", J, E["X3-7"]["expected"])

# ---------- X3-8 ----------
A = sp.Matrix([[1, 1, 1], [2, 1, 3], [3, 2, 4]])
C = sp.Matrix([[1, 1, 1, 1], [2, 1, 3, 3], [3, 2, 4, sp.Symbol("k")]])
# rango(A) = 2; compatibilidad <=> k = 4
k_val = sp.solve(sp.Symbol("k") - 3 - 1, sp.Symbol("k"))[0]  # k-3 = 1
assert A.rank() == 2
recalc("X3-8", k_val, E["X3-8"]["expected"])

# ---------- X3-9 ----------
A = sp.Matrix([[2, 2], [2, -1]])
rts = sorted(sp.solve((A - l*sp.eye(2)).det(), l), key=lambda x: float(x))  # -2, 3
v1 = (A - rts[0]*sp.eye(2)).nullspace()[0]; v1 = v1 / sp.sqrt(v1.dot(v1))
v2 = (A - rts[1]*sp.eye(2)).nullspace()[0]; v2 = v2 / sp.sqrt(v2.dot(v2))
# primera componente positiva
if v1[0] < 0: v1 = -v1
if v2[0] < 0: v2 = -v2
Q = sp.Matrix.hstack(v1, v2)
Lam = sp.diag(rts[0], rts[1])
assert sp.simplify(Q * Lam * Q.T - A) == sp.zeros(2)
recalc_mat("X3-9.Q", Q, E["X3-9"]["fields"]["Q"]["expected"])
recalc_mat("X3-9.Lam", Lam, E["X3-9"]["fields"]["Lam"]["expected"])

# ---------- X3-10 ----------
eigs = [2, 2, -1, 4]
det2 = sp.prod([e**2 for e in eigs])
trinv = sum(sp.Rational(1, e) for e in eigs)
recalc("X3-10.det2", det2, E["X3-10"]["fields"]["det2"]["expected"])
recalc("X3-10.trinv", trinv, E["X3-10"]["fields"]["trinv"]["expected"])
# contraste adversarial del paso escrito en la solución del data:
prod_written = -2 * 2 * (-1) * 4   # tal como está tipografiado: = 16
print(f"   [contraste] producto tipografiado (-2·2·(-1)·4) = {prod_written}; "
      f"el producto real de autovalores (2·2·(-1)·4) = {2*2*(-1)*4}")

# ---------- X3-11 ----------
x, y, z = sp.symbols("x y z")
q = 2*x**2 + 2*y**2 + 2*z**2 - 2*x*y - 2*x*z - 2*y*z
sos = (x-y)**2 + (y-z)**2 + (z-x)**2
assert sp.expand(q - sos) == 0
A = sp.Matrix([[2, -1, -1], [-1, 2, -1], [-1, -1, 2]])
rts = sorted(sp.solve((A - l*sp.eye(3)).det(), l), key=lambda x: float(x))  # 0, 3, 3
psd = all(r >= 0 for r in rts) and any(r == 0 for r in rts)
recalc("X3-11", 1 if psd else -1, E["X3-11"]["expected"])

# ---------- X3-12 ----------
u = sp.Matrix([1, 2]); v = sp.Matrix([1, 1])
A = u * v.T
Adag = (v * u.T) / (u.dot(u) * v.dot(v))
assert sp.simplify(A * Adag * A - A) == sp.zeros(2)
assert sp.simplify(Adag * A * Adag - Adag) == sp.zeros(2)
b = sp.Matrix([2, 5])
xv = Adag * b
recalc_mat("X3-12.Adag", Adag, E["X3-12"]["fields"]["Adag"]["expected"])
recalc_mat("X3-12.x", xv, E["X3-12"]["fields"]["x"]["expected"])

print(f"\nEXAMEN-3: {ok} OK, {fail} FALLOS")
sys.exit(1 if fail else 0)
