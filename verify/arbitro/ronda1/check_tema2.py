"""ÁRBITRO R1 · check_tema2.py — recálculo independiente de tema-2.js con sympy."""
import json, os, sys
import sympy as sp
from sx import sx

HERE = os.path.dirname(os.path.abspath(__file__))
exp = json.load(open(os.path.join(HERE, "expected.json")))["tema-2"]
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
    (globals().__setitem__('ok', ok+1) if good else globals().__setitem__('fail', fail+1))

def recalc(id_, computed, expected):
    global ok, fail
    good = sp.simplify(sx(str(computed)) - sx(str(expected))) == 0
    print(f"[{'OK ' if good else 'FALLO'}] {id_}: recalc={computed} expected={expected}")
    if good: ok += 1
    else: fail += 1

# ---------- T2-N1: w = 3u - 2v, u=(2,-1,3), v=(1,4,-2) ----------
u = sp.Matrix([2, -1, 3]); v = sp.Matrix([1, 4, -2])
w = 3*u - 2*v
recalc_mat("T2-N1", w, E["T2-N1"]["expected"])

# ---------- T2-N2: AB ----------
A = sp.Matrix([[1, 2, 0], [3, 1, 2]]); B = sp.Matrix([[2, 1], [0, 3], [1, 1]])
recalc_mat("T2-N2", A * B, E["T2-N2"]["expected"])

# ---------- T2-N3: C = A^T B y tr(C) ----------
A = sp.Matrix([[1, 2], [3, 4]]); B = sp.Matrix([[5, 6], [7, 8]])
C = A.T * B
recalc_mat("T2-N3.prod", C, E["T2-N3"]["fields"]["prod"]["expected"])
recalc("T2-N3.tr", sp.trace(C), E["T2-N3"]["fields"]["tr"]["expected"])

# ---------- T2-N4: ||u|| y d(u,v) ----------
u = sp.Matrix([2, 3, 6]); v = sp.Matrix([1, 2, 2])
norm = sp.sqrt(sum(x**2 for x in u))                 # 7
dist = sp.sqrt(sum(x**2 for x in (u - v)))           # 3*sqrt(2)
recalc("T2-N4.norm", norm, E["T2-N4"]["fields"]["norm"]["expected"])
recalc("T2-N4.dist", sp.simplify(dist), E["T2-N4"]["fields"]["dist"]["expected"])

# ---------- T2-N5: Q ortogonal? ----------
Q = sp.Matrix([[3, 4], [4, -3]]) / 5
res = sp.simplify(Q.T * Q) == sp.eye(2)
recalc("T2-N5", int(bool(res)), int(E["T2-N5"]["expected"]))

# ---------- T2-N6: A^{-1} ----------
A = sp.Matrix([[2, 5], [1, 3]])
recalc_mat("T2-N6", A.inv(), E["T2-N6"]["expected"])

# ---------- T2-M1: XY por bloques ----------
A = sp.Matrix([[1, 2], [0, 1]]); B = sp.Matrix([[1], [0]])
C = sp.Matrix([[0, 1]]); D = sp.Matrix([[1]])
E2 = sp.Matrix([[3, 1], [1, 2]]); F = sp.Matrix([[2, 5]])
X = A.row_join(B).col_join(C.row_join(D))
Y = E2.col_join(F)
recalc_mat("T2-M1", X * Y, E["T2-M1"]["expected"])

# ---------- T2-M2: A^{-1} 3x3 ----------
A = sp.Matrix([[1, 2, 3], [0, 1, 4], [5, 6, 0]])
assert A.det() == 1
recalc_mat("T2-M2", A.inv(), E["T2-M2"]["expected"])

# ---------- T2-M3: primer paso Gram-Schmidt ----------
v1 = sp.Matrix([1, 1, 0]); v2 = sp.Matrix([2, 0, 1])
u2 = v2 - (v1.dot(v2) / v1.dot(v1)) * v1
recalc_mat("T2-M3", u2, E["T2-M3"]["expected"])

# ---------- T2-M4: proyección ortogonal ----------
A = sp.Matrix([[1, 0], [1, 1], [0, 1]])
w = sp.Matrix([3, 0, 3])
proj = A * (A.T * A).inv() * A.T * w
recalc_mat("T2-M4", proj, E["T2-M4"]["expected"])

# ---------- T2-M5: coordenadas en base ----------
W = sp.Matrix.hstack(sp.Matrix([1, 0, 0]), sp.Matrix([1, 1, 0]), sp.Matrix([0, 1, 1]))
u = sp.Matrix([2, 3, 1])
c = W.LUsolve(u)
recalc_mat("T2-M5", c, E["T2-M5"]["expected"])

# ---------- T2-E1: A^{-1} ----------
A = sp.Matrix([[2, 5, 7], [6, 3, 4], [5, -2, -3]])
assert A.det() == -1
recalc_mat("T2-E1", A.inv(), E["T2-E1"]["expected"])

# ---------- T2-E2: proyección y complemento ----------
A = sp.Matrix([[1, 0], [0, 1], [1, 1]])
w = sp.Matrix([2, 1, 0])
proj = A * (A.T * A).inv() * A.T * w
perp = w - proj
recalc_mat("T2-E2.proj", proj, E["T2-E2"]["fields"]["proj"]["expected"])
recalc_mat("T2-E2.perp", perp, E["T2-E2"]["fields"]["perp"]["expected"])

# ---------- T2-E3: cuál es ortogonal (choice) ----------
choices = [
    sp.Matrix([[1, 1], [0, 1]]),
    sp.Matrix([[0, -1], [1, 0]]),
    sp.Matrix([[1, 1], [1, -1]]),
    sp.Matrix([[2, 0], [0, 2]]),
]
idx = [k for k, M in enumerate(choices) if M.T * M == sp.eye(2)]
recalc("T2-E3", idx[0], E["T2-E3"]["expected"])

# ---------- T2-E4: Q ortogonal e inversa ----------
Q = sp.Matrix([[2, 3, 6], [6, 2, -3], [-3, 6, -2]]) / 7
orth = sp.simplify(Q.T * Q) == sp.eye(3)
recalc("T2-E4.orth", int(bool(orth)), int(E["T2-E4"]["fields"]["orth"]["expected"]))
recalc_mat("T2-E4.inv", Q.inv(), E["T2-E4"]["fields"]["inv"]["expected"])

print(f"\nTEMA-2: {ok} OK, {fail} FALLOS")
sys.exit(1 if fail else 0)
