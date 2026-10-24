"""ÁRBITRO R1 · check_examen1.py — recálculo independiente de examen-1.js."""
import json, os, sys
import sympy as sp
from sx import sx

HERE = os.path.dirname(os.path.abspath(__file__))
exp = json.load(open(os.path.join(HERE, "expected.json")))["examen-1"]
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

# ---------- X1-1: 101 en base 4 ----------
n = 101; restos = []
m = n
while m > 0:
    restos.append(m % 4); m //= 4
base4 = "".join(str(r) for r in reversed(restos))
assert sum(int(c) * 4**(len(base4)-1-i) for i, c in enumerate(base4)) == 101
recalc("X1-1", base4, E["X1-1"]["expected"])

# ---------- X1-2: 0.(142857) ----------
r = sp.Rational(142857, 999999)
assert r == sp.Rational(1, 7)
recalc("X1-2", r, E["X1-2"]["expected"])

# ---------- X1-3: nº de funciones A->B ----------
count = 4**3   # 64 funciones, no 12 -> la afirmación del enunciado es falsa
recalc("X1-3", int(count == 12), int(E["X1-3"]["expected"]))

# ---------- X1-4: tr(AB) ----------
A = sp.Matrix([[1, 2, 0], [0, 1, 1]]); B = sp.Matrix([[2, 0], [1, 1], [0, 2]])
recalc("X1-4", sp.trace(A * B), E["X1-4"]["expected"])

# ---------- X1-5: redondeo 0.125 -> 2 cifras (par) ----------
recalc("X1-5", sp.Rational(12, 100), E["X1-5"]["expected"])   # 0.12

# ---------- X1-6 ----------
u = sp.Matrix([1, 2, 2]); v = sp.Matrix([2, -1, 2])
cos_ = u.dot(v) / (sp.sqrt(u.dot(u)) * sp.sqrt(v.dot(v)))
recalc("X1-6", sp.simplify(cos_), E["X1-6"]["expected"])

# ---------- X1-7 ----------
w = (3 + 4*sp.I) / (2 - sp.I)
recalc("X1-7", sp.simplify(sp.expand_complex(w)), E["X1-7"]["expected"])

# ---------- X1-8: Gram-Schmidt ----------
v1 = sp.Matrix([1, 1, 0]); v2 = sp.Matrix([1, 0, 1])
f1 = v1 / sp.sqrt(v1.dot(v1))
u2 = v2 - f1.dot(v2) * f1
f2 = u2 / sp.sqrt(u2.dot(u2))
recalc_mat("X1-8.f1", f1, E["X1-8"]["fields"]["f1"]["expected"])
recalc_mat("X1-8.f2", f2, E["X1-8"]["fields"]["f2"]["expected"])

# ---------- X1-9 ----------
z = sp.Symbol("z")
rts = sp.solve(z**2 + 2*z + 5, z)
a = sorted([str(sp.expand_complex(r)) for r in rts])
b = sorted(E["X1-9"]["expected"])
good = [sp.simplify(sx(x)) for x in a] == [sp.simplify(sx(x)) for x in b]
print(f"[{'OK ' if good else 'FALLO'}] X1-9: recalc={a} expected={b}")
if good: ok += 1
else: fail += 1

# ---------- X1-10 ----------
v1 = sp.Matrix([1, 1, 0]); v2 = sp.Matrix([0, 0, 1]); w = sp.Matrix([3, 2, 1])
proj = (w.dot(v1) / v1.dot(v1)) * v1 + (w.dot(v2) / v2.dot(v2)) * v2
recalc_mat("X1-10", proj, E["X1-10"]["expected"])

# ---------- X1-11 ----------
fams = [
    [sp.Matrix([1, 1, 0]), sp.Matrix([0, 1, 1])],
    [sp.Matrix([1, 2, 2]), sp.Matrix([2, -1, 2])],
    [sp.Matrix([2, 2, 1]), sp.Matrix([2, -1, -2])],
    [sp.Matrix([3, 0, 4]), sp.Matrix([4, 0, 3])],
]
idx = [k for k, (p, q) in enumerate(fams) if p.dot(q) == 0 and p != sp.zeros(3, 1) and q != sp.zeros(3, 1)]
recalc("X1-11", idx[0], E["X1-11"]["expected"])

# ---------- X1-12 ----------
B = sp.Matrix([[1, 2], [3, 4]])
M = sp.eye(2).row_join(B).col_join(sp.zeros(2, 2).row_join(sp.eye(2)))
recalc_mat("X1-12", M.inv(), E["X1-12"]["expected"])

print(f"\nEXAMEN-1: {ok} OK, {fail} FALLOS")
sys.exit(1 if fail else 0)
