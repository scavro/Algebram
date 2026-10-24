"""ÁRBITRO R1 · check_examen2.py — recálculo independiente de examen-2.js."""
import json, os, sys
import sympy as sp
from sx import sx

HERE = os.path.dirname(os.path.abspath(__file__))
exp = json.load(open(os.path.join(HERE, "expected.json")))["examen-2"]
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

# ---------- X2-1: det(2 A^T A) ----------
detA = -2
detATA = detA**2
res = 2**3 * detATA
recalc("X2-1", res, E["X2-1"]["expected"])

# ---------- X2-2 ----------
A = sp.Matrix([[2, -3], [3, 6], [6, -2]])
vol = sp.sqrt((A.T * A).det())
recalc("X2-2", vol, E["X2-2"]["expected"])

# ---------- X2-3 ----------
# A 4x6 de rango 3: dim nul = 6-3, dim nul(A^T) = 4-3
recalc("X2-3.nul", 6 - 3, E["X2-3"]["fields"]["nul"]["expected"])
recalc("X2-3.nulT", 4 - 3, E["X2-3"]["fields"]["nulT"]["expected"])

# ---------- X2-4 ----------
A = sp.Matrix([[1, 1, 1], [2, -1, 1], [1, 2, -1]]); b = sp.Matrix([4, 8, -3])
x = A.LUsolve(b)
recalc_mat("X2-4", x, E["X2-4"]["expected"])

# ---------- X2-5 ----------
A = sp.Matrix([[2, 1], [0, 2]])
mgeo = len((2*sp.eye(2) - A).nullspace())
recalc("X2-5", int(mgeo == 2), int(E["X2-5"]["expected"]))

# ---------- X2-6 ----------
P = sp.Matrix([[0, 1, 0], [1, 0, 0], [0, 0, 1]])
L = sp.Matrix([[1, 0, 0], [2, 1, 0], [3, 1, 1]])
U = sp.Matrix([[1, 2, 3], [0, 4, 5], [0, 0, 6]])
A = P * L * U
recalc("X2-6", A.det(), E["X2-6"]["expected"])

# ---------- X2-7 ----------
X = sp.Matrix([0, 1, 2, 3]); y = sp.Matrix([2, 2, 4, 8])
A = sp.Matrix.hstack(X, sp.ones(4, 1))
xsol = (A.T * A).inv() * A.T * y
m_, n_ = xsol[0], xsol[1]
resid = y - A * xsol
recalc("X2-7.m", m_, E["X2-7"]["fields"]["m"]["expected"])
recalc("X2-7.n", n_, E["X2-7"]["fields"]["n"]["expected"])
recalc("X2-7.res", sp.sqrt(resid.dot(resid)), E["X2-7"]["fields"]["res"]["expected"])

# ---------- X2-8 ----------
l = sp.Symbol("l")
A = sp.Matrix([[3, 1, 0], [1, 3, 0], [0, 0, 1]])
rts = sp.solve((l*sp.eye(3) - A).det(), l)
a = sorted([str(r) for r in rts]); b = sorted(E["X2-8"]["expected"])
good = a == b
print(f"[{'OK ' if good else 'FALLO'}] X2-8: recalc={a} expected={b}")
if good: ok += 1
else: fail += 1

# ---------- X2-9 ----------
A = sp.Matrix([[1, 2, 0], [2, 1, 0], [0, 0, 3]])
rts = sorted(sp.solve((l*sp.eye(3) - A).det(), l), key=lambda x: float(x))
indef = (rts[0] < 0 < rts[-1])
recalc("X2-9", 3 if indef else -1, E["X2-9"]["expected"])

# ---------- X2-10 ----------
# tras Gauss: fila3 = (0, 0, alpha-7, beta-5); indeterminado <=> alpha=7 y beta=5
alpha, beta = 7, 5
recalc("X2-10.alpha", alpha, E["X2-10"]["fields"]["alpha"]["expected"])
recalc("X2-10.beta", beta, E["X2-10"]["fields"]["beta"]["expected"])

# ---------- X2-11 ----------
A = sp.Matrix([[2, -1, 0], [1, 2, 0], [0, 0, 3]])
detU = A.det()   # Q unitaria => det U = det A
recalc("X2-11", detU, E["X2-11"]["expected"])

# ---------- X2-12 ----------
A = sp.Matrix([[1, 1], [1, 0], [1, 2]])
c1 = A[:, 0]; c2 = A[:, 1]
r11 = sp.sqrt(c1.dot(c1)); q1 = c1 / r11
r12 = q1.dot(c2)
u = c2 - r12 * q1
r22 = sp.sqrt(u.dot(u)); q2 = u / r22
Q = sp.Matrix.hstack(q1, q2)
R = sp.Matrix([[r11, r12], [0, r22]])
assert sp.simplify(Q * R - A) == sp.zeros(3, 2)
recalc_mat("X2-12.Q", Q, E["X2-12"]["fields"]["Q"]["expected"])
recalc_mat("X2-12.R", R, E["X2-12"]["fields"]["R"]["expected"])

print(f"\nEXAMEN-2: {ok} OK, {fail} FALLOS")
sys.exit(1 if fail else 0)
