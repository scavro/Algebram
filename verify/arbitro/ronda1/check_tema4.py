"""ÁRBITRO R1 · check_tema4.py — recálculo independiente de tema-4.js con sympy."""
import json, os, sys
import sympy as sp
from sx import sx

HERE = os.path.dirname(os.path.abspath(__file__))
exp = json.load(open(os.path.join(HERE, "expected.json")))["tema-4"]
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

# ---------- T4-N1 ----------
A = sp.Matrix([[1, 1, 1], [2, -1, 1], [1, 2, -1]]); b = sp.Matrix([6, 3, 2])
x = A.LUsolve(b)
recalc_mat("T4-N1", x, E["T4-N1"]["expected"])

# ---------- T4-N2 ----------
# x+y=1, 2x+2y=3 -> incompatible (choice 2)
A = sp.Matrix([[1, 1], [2, 2]]); C = sp.Matrix([[1, 1, 1], [2, 2, 3]])
compat = A.rank() == C.rank()
recalc("T4-N2", 2 if not compat else -1, E["T4-N2"]["expected"])

# ---------- T4-N3 ----------
# x = 4 - s - t
s, t = sp.symbols("s t")
x_expr = 4 - s - t
recalc("T4-N3", x_expr.subs({s: 1, t: 1}), sx(E["T4-N3"]["expected"]).subs({sp.Symbol("s"): 1, sp.Symbol("t"): 1}))
# además comparación simbólica literal
from sympy.parsing.sympy_parser import parse_expr
ok_sym = sp.simplify(x_expr - parse_expr("4-s-t")) == 0
print(f"[{'OK ' if ok_sym else 'FALLO'}] T4-N3 simbólico: 4-s-t coincide")
if ok_sym: ok += 1
else: fail += 1

# ---------- T4-N4 ----------
a = sp.Matrix([1, 1]); b = sp.Matrix([3, 1])
proj = (a.dot(b) / a.dot(a)) * a
recalc_mat("T4-N4", proj, E["T4-N4"]["expected"])

# ---------- T4-N5 ----------
# x+2y=3, 2x+4y=7 -> incompatible -> False
A = sp.Matrix([[1, 2], [2, 4]]); C = sp.Matrix([[1, 2, 3], [2, 4, 7]])
res = A.rank() == C.rank()  # False
recalc("T4-N5", int(bool(res)), int(E["T4-N5"]["expected"]))

# ---------- T4-N6 ----------
A = sp.Matrix([[1, 0], [1, 1], [1, 2]])
recalc_mat("T4-N6", A.T * A, E["T4-N6"]["expected"])

# ---------- T4-M1 ----------
A = sp.Matrix([[2, 1], [4, 3]])
l21 = A[1, 0] / A[0, 0]
U = sp.Matrix([[A[0, 0], A[0, 1]], [0, A[1, 1] - l21 * A[0, 1]]])
recalc("T4-M1.l21", l21, E["T4-M1"]["fields"]["l21"]["expected"])
recalc_mat("T4-M1.U", U, E["T4-M1"]["fields"]["U"]["expected"])

# ---------- T4-M2 ----------
A = sp.Matrix([[1, 2], [0, 1], [0, 2]])
# Gram-Schmidt (columnas) con diagonal de R positiva
c1 = A[:, 0]; c2 = A[:, 1]
r11 = sp.sqrt(c1.dot(c1))
q1 = c1 / r11
r12 = q1.dot(c2)
u = c2 - r12 * q1
r22 = sp.sqrt(u.dot(u))
q2 = u / r22
Q = sp.Matrix.hstack(q1, q2)
R = sp.Matrix([[r11, r12], [0, r22]])
recalc_mat("T4-M2.Q", Q, E["T4-M2"]["fields"]["Q"]["expected"])
recalc_mat("T4-M2.R", R, E["T4-M2"]["fields"]["R"]["expected"])
assert sp.simplify(Q * R - A) == sp.zeros(3, 2)

# ---------- T4-M3 ----------
X = sp.Matrix([0, 1, 2, 3]); y = sp.Matrix([1, 2, 4, 7])
A = sp.Matrix.hstack(X, sp.ones(4, 1))
xsol = (A.T * A).inv() * A.T * y
m_, n_ = xsol[0], xsol[1]
recalc("T4-M3.m", m_, E["T4-M3"]["fields"]["m"]["expected"])
recalc("T4-M3.n", n_, E["T4-M3"]["fields"]["n"]["expected"])

# ---------- T4-M4 ----------
# y = 2x + 1/2 en x=5 -> 21/2
recalc("T4-M4", 2*5 + sp.Rational(1, 2), E["T4-M4"]["expected"])

# ---------- T4-M5 ----------
A = sp.Matrix([[0, -1], [1, 0]])
l = sp.Symbol("l")
P = (l*sp.eye(2) - A).det()
rts = sp.solve(P, l)
a = sorted([str(sx(r)) for r in rts]); b = sorted(str(sx(x)) for x in E["T4-M5"]["expected"])
good = a == b
print(f"[{'OK ' if good else 'FALLO'}] T4-M5: recalc={a} expected={b}")
if good: ok += 1
else: fail += 1

# ---------- T4-E1 ----------
A = sp.Matrix([[0, 1, 1], [1, 0, 1], [1, 1, 0]]); b = sp.Matrix([5, 4, 3])
x = A.LUsolve(b)
recalc_mat("T4-E1", x, E["T4-E1"]["expected"])

# ---------- T4-E2 ----------
A = sp.Matrix([[1, 1], [2, 2], [1, 1]]); C = sp.Matrix([[1, 1, 1], [2, 2, 2], [1, 1, 0]])
recalc("T4-E2.rangoA", A.rank(), E["T4-E2"]["fields"]["rangoA"]["expected"])
recalc("T4-E2.rangoC", C.rank(), E["T4-E2"]["fields"]["rangoC"]["expected"])

# ---------- T4-E3 ----------
A = sp.Matrix([[0, 1, 1], [1, 0, 1], [1, 1, 0]])
# intercambio F1<->F2 y Gauss: P A = L U
P = sp.Matrix([[0, 1, 0], [1, 0, 0], [0, 0, 1]])
PA = P * A
l31 = PA[2, 0] / PA[0, 0]
row = PA[2, :] - l31 * PA[0, :]
l32 = row[1] / PA[1, 1]
U = sp.Matrix([[PA[0, 0], PA[0, 1], PA[0, 2]],
               [PA[1, 0], PA[1, 1], PA[1, 2]],
               [0, 0, row[2] - l32 * PA[1, 2]]])
L = sp.Matrix([[1, 0, 0], [0, 1, 0], [l31, l32, 1]])
assert sp.simplify(L * U - PA) == sp.zeros(3)
assert sp.simplify(P * L * U - A) == sp.zeros(3)   # P² = I: PLU = A
recalc_mat("T4-E3.L", L, E["T4-E3"]["fields"]["L"]["expected"])
recalc_mat("T4-E3.U", U, E["T4-E3"]["fields"]["U"]["expected"])

# ---------- T4-E4 ----------
X = sp.Matrix([0, 1, 2]); y = sp.Matrix([3, 1, 5])
A = sp.Matrix.hstack(X, sp.ones(3, 1))
xsol = (A.T * A).inv() * A.T * y
m_, n_ = xsol[0], xsol[1]
pred = m_ * 4 + n_
recalc("T4-E4.m", m_, E["T4-E4"]["fields"]["m"]["expected"])
recalc("T4-E4.n", n_, E["T4-E4"]["fields"]["n"]["expected"])
recalc("T4-E4.pred", pred, E["T4-E4"]["fields"]["pred"]["expected"])

print(f"\nTEMA-4: {ok} OK, {fail} FALLOS")
sys.exit(1 if fail else 0)
