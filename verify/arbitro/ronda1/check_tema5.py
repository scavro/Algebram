"""ÁRBITRO R1 · check_tema5.py — recálculo independiente de tema-5.js con sympy."""
import json, os, sys
import sympy as sp
from sx import sx

HERE = os.path.dirname(os.path.abspath(__file__))
exp = json.load(open(os.path.join(HERE, "expected.json")))["tema-5"]
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

def recalc_set(id_, computed_list, expected_list):
    global ok, fail
    a = sorted([str(sp.simplify(sx(x))) for x in computed_list])
    b = sorted([str(sp.simplify(sx(x))) for x in expected_list])
    good = a == b
    print(f"[{'OK ' if good else 'FALLO'}] {id_}: recalc={a} expected={b}")
    if good: ok += 1
    else: fail += 1

l = sp.Symbol("l")

# ---------- T5-N1 ----------
A = sp.Matrix([[4, 1], [2, 3]])
rts = sp.solve((l*sp.eye(2) - A).det(), l)
recalc_set("T5-N1", rts, E["T5-N1"]["expected"])

# ---------- T5-N2 ----------
A = sp.Matrix([[3, 1], [0, 3]])
malg = 2
mgeo = len((3*sp.eye(2) - A).nullspace())
diagable = (mgeo == malg)  # False
recalc("T5-N2", int(diagable), int(E["T5-N2"]["expected"]))

# ---------- T5-N3 ----------
A = sp.Matrix([[4, 2], [2, 5]])
a = sp.sqrt(A[0, 0]); b_ = A[1, 0] / a; c = sp.sqrt(A[1, 1] - b_**2)
L = sp.Matrix([[a, 0], [b_, c]])
assert sp.simplify(L * L.T - A) == sp.zeros(2)
recalc_mat("T5-N3", L, E["T5-N3"]["expected"])

# ---------- T5-N4 ----------
A = sp.Matrix([[2, 3], [3, 2]])
rts = sorted(sp.solve((l*sp.eye(2) - A).det(), l), key=lambda x: float(x))
indef = (rts[0] < 0 < rts[1])  # 5 y -1
choice = 2 if indef else -1
recalc("T5-N4", choice, E["T5-N4"]["expected"])

# ---------- T5-N5 ----------
A = sp.diag(2, 4)
recalc_mat("T5-N5", A.inv(), E["T5-N5"]["expected"])  # invertible: daga = inversa

# ---------- T5-N6 ----------
A = sp.Matrix([[2, 1], [1, 2]])
sig = sp.sqrt(max(A.eigenvals().keys(), key=lambda x: float(x))**2)
recalc("T5-N6", sig, E["T5-N6"]["expected"])

# ---------- T5-M1 ----------
A = sp.Matrix([[5, -1], [2, 2]])
rts = sorted(sp.solve((l*sp.eye(2) - A).det(), l), key=lambda x: float(x))  # 3, 4
lam1, lam2 = rts
v1 = (lam1*sp.eye(2) - A).nullspace()[0]; v1 = v1 / v1[0]
v2 = (lam2*sp.eye(2) - A).nullspace()[0]; v2 = v2 / v2[0]
P = sp.Matrix.hstack(v1, v2)
D = sp.diag(lam1, lam2)
assert sp.simplify(P * D * P.inv() - A) == sp.zeros(2)
recalc_mat("T5-M1.P", P, E["T5-M1"]["fields"]["P"]["expected"])
recalc_mat("T5-M1.D", D, E["T5-M1"]["fields"]["D"]["expected"])

# ---------- T5-M2 ----------
A = sp.Matrix([[2, 4], [4, 10]])
m21 = A[1, 0] / A[0, 0]
L = sp.Matrix([[1, 0], [m21, 1]])
Uraw = sp.Matrix([[A[0, 0], A[0, 1]], [0, A[1, 1] - m21 * A[0, 1]]])
D = sp.diag(Uraw[0, 0], Uraw[1, 1])
U = D.inv() * Uraw          # unitriangular
assert U == L.T             # A simétrica
assert sp.simplify(L * D * U - A) == sp.zeros(2)
recalc_mat("T5-M2.L", L, E["T5-M2"]["fields"]["L"]["expected"])
recalc_mat("T5-M2.D", D, E["T5-M2"]["fields"]["D"]["expected"])

# ---------- T5-M3 ----------
A = sp.Matrix([[1, 3], [3, 1]])
eigs = sorted((A.T * A).eigenvals().keys(), key=lambda x: float(x))
sigs = sorted([sp.sqrt(e) for e in eigs], key=lambda x: -float(x))  # decreciente
recalc_set("T5-M3", sigs, E["T5-M3"]["expected"])

# ---------- T5-M4 ----------
u = sp.Matrix([2, 1]); v = sp.Matrix([1, 2])
A = u * v.T
assert A == sp.Matrix([[2, 4], [1, 2]])
Adag = (v * u.T) / (u.dot(u) * v.dot(v))
# ecuaciones de Penrose
assert sp.simplify(A * Adag * A - A) == sp.zeros(2)
assert sp.simplify(Adag * A * Adag - Adag) == sp.zeros(2)
assert (A * Adag) == (A * Adag).T
assert (Adag * A) == (Adag * A).T
recalc_mat("T5-M4", Adag, E["T5-M4"]["expected"])

# ---------- T5-M5 ----------
A = sp.Matrix([[2, 1], [1, 2]])
rts = sorted(sp.solve((l*sp.eye(2) - A).det(), l), key=lambda x: float(x))  # 1, 3
q1 = sp.Matrix([1, 1]) / sp.sqrt(2)   # para lambda=3
q2 = sp.Matrix([1, -1]) / sp.sqrt(2)  # para lambda=1
Q = sp.Matrix.hstack(q1, q2)
Lam = sp.diag(3, 1)
assert sp.simplify(Q * Lam * Q.T - A) == sp.zeros(2)
recalc_mat("T5-M5.Q", Q, E["T5-M5"]["fields"]["Q"]["expected"])
recalc_mat("T5-M5.Lam", Lam, E["T5-M5"]["fields"]["Lam"]["expected"])

# ---------- T5-E1 ----------
A = sp.Matrix([[1, 2, 0], [2, 1, 0], [0, 0, 4]])
rts = sorted(sp.solve((l*sp.eye(3) - A).det(), l), key=lambda x: float(x))  # -1, 3, 4
q3 = sp.Matrix([1, 1, 0]) / sp.sqrt(2)   # lambda 3
qm1 = sp.Matrix([1, -1, 0]) / sp.sqrt(2) # lambda -1
q4 = sp.Matrix([0, 0, 1])                # lambda 4
Q = sp.Matrix.hstack(q3, qm1, q4)
Lam = sp.diag(3, -1, 4)
assert sp.simplify(Q * Lam * Q.T - A) == sp.zeros(3)
recalc_mat("T5-E1.Q", Q, E["T5-E1"]["fields"]["Q"]["expected"])
recalc_mat("T5-E1.Lam", Lam, E["T5-E1"]["fields"]["Lam"]["expected"])

# ---------- T5-E2 ----------
A = sp.Matrix([[4, 2, 2], [2, 5, 3], [2, 3, 11]])
n = 3
L = sp.zeros(n)
for j in range(n):
    L[j, j] = sp.sqrt(A[j, j] - sum(L[j, k]**2 for k in range(j)))
    for i in range(j + 1, n):
        L[i, j] = (A[i, j] - sum(L[i, k] * L[j, k] for k in range(j))) / L[j, j]
assert sp.simplify(L * L.T - A) == sp.zeros(3)
recalc_mat("T5-E2", L, E["T5-E2"]["expected"])

# ---------- T5-E3 ----------
A = sp.Matrix([[3, 1], [-1, 3]])
# A invertible: A^daga = A^{-1}
Adag = A.inv()
assert sp.simplify(A * Adag * A - A) == sp.zeros(2)
# COMPROBACIÓN ADVERSARIAL de la solución escrita: (AA^T)^{-1} A  ==?  A^daga
lhs = (A * A.T).inv() * A
print("   [contraste] (AA^T)^-1 A =", sp.Matrix(lhs), " ; A^daga =", sp.Matrix(Adag),
      " ; coincide:", sp.simplify(lhs - Adag) == sp.zeros(2))
recalc_mat("T5-E3", Adag, E["T5-E3"]["expected"])

# ---------- T5-E4 ----------
A = sp.Matrix([[2, 1, 0], [1, 2, 0], [0, 0, -3]])
rts = sp.solve((l*sp.eye(3) - A).det(), l)
npos = sum(1 for r in rts if r > 0); nneg = sum(1 for r in rts if r < 0)
recalc("T5-E4.pos", npos, E["T5-E4"]["fields"]["pos"]["expected"])
recalc("T5-E4.neg", nneg, E["T5-E4"]["fields"]["neg"]["expected"])

print(f"\nTEMA-5: {ok} OK, {fail} FALLOS")
sys.exit(1 if fail else 0)
