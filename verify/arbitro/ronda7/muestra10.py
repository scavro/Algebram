"""ÁRBITRO R7 · muestra de 10 ejercicios — recálculo INDEPENDIENTE desde el
enunciado con sympy (aritmética exacta). Script fresco; la lista es distinta a
la muestra15 de R6: T1-M2, T1-E3, T2-N4, T2-E1, T3-E2, T4-E3, T5-M5, T5-E3,
X1-9, X2-10 (polares, raíces complejas, inversa 3×3, LU con permutación,
teorema espectral, pseudoinversa, sistema paramétrico).
Datos extraídos con dump-r7.js → expected-r7.json."""
import json
from pathlib import Path

import sympy as sp

HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "expected-r7.json").read_text(encoding="utf8"))
INDEX = {q["id"]: q for items in DATA.values() for q in items}

ok, fails = 0, []


def chk(label, got, expected):
    global ok
    def eq(a, b):
        if isinstance(a, sp.MatrixBase) and isinstance(b, sp.MatrixBase):
            return a.shape == b.shape and all(
                sp.simplify(a[i, j] - b[i, j]) == 0
                for i in range(a.rows) for j in range(a.cols))
        if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
            return len(a) == len(b) and all(eq(x, y) for x, y in zip(a, b))
        try:
            return sp.simplify(sp.sympify(a) - sp.sympify(b)) == 0
        except Exception:
            return str(a) == str(b)
    if eq(got, expected):
        ok += 1
        print(f"[OK ] {label}")
    else:
        fails.append(label)
        print(f"[FALLO] {label}: recalc={got} expected={expected}")


def ans(qid, field=None):
    a = INDEX[qid]["answer"]
    if field is not None:
        a = a["fields"][field]
    return a.get("expected")


def to_matrix(rows):
    return sp.Matrix([[sp.Rational(str(c)) for c in row] for row in rows])


# ---------- T1-M2 · z = -√3 + i: |z|=2, arg=5π/6 ----------
z = -sp.sqrt(3) + sp.I
chk("T1-M2 |z|", sp.sqrt(sp.re(z)**2 + sp.im(z)**2), sp.Integer(ans("T1-M2", "mod")))
arg = sp.arg(z)  # rama principal (-π, π]
chk("T1-M2 arg(z)", sp.simplify(arg - sp.Rational(5, 6) * sp.pi), 0)

# ---------- T1-E3 · raíces cuartas de 16 ----------
roots = [sp.Integer(2) * sp.exp(sp.I * sp.pi * k / 2) for k in range(4)]
roots = [sp.simplify(sp.expand_complex(r)) for r in roots]
def canon(s):
    return sp.simplify(sp.sympify(str(s).replace("i", "I")))
chk("T1-E3 raíces cuartas de 16",
    sorted([canon(r) for r in roots], key=str),
    sorted([canon(r) for r in ans("T1-E3")], key=str))

# ---------- T2-N4 · ||u||=7, d(u,v)=3√2 ----------
u = sp.Matrix([2, 3, 6]); v = sp.Matrix([1, 2, 2])
chk("T2-N4 ||u||", sp.sqrt((u.T * u)[0]), sp.Integer(ans("T2-N4", "norm")))
d = u - v
chk("T2-N4 d(u,v)", sp.sqrt((d.T * d)[0]), sp.sympify(str(ans("T2-N4", "dist")).replace("sqrt", "sqrt")))

# ---------- T2-E1 · inversa 3×3 ----------
A = sp.Matrix([[2, 5, 7], [6, 3, 4], [5, -2, -3]])
chk("T2-E1 A^{-1}", A.inv(), to_matrix(ans("T2-E1")))

# ---------- T3-E2 · mayor autovalor y autovector ----------
A = sp.Matrix([[2, 1, 1], [1, 2, 1], [1, 1, 2]])
eigs = A.eigenvects()
lam_max = max(ev for ev, _, _ in eigs)
vec = None
for ev, _, vs in eigs:
    if ev == lam_max:
        w = vs[0]
        if w[0] != 0:
            vec = w / w[0]
chk("T3-E2 mayor autovalor", lam_max, sp.Integer(ans("T3-E2", "lam")))
chk("T3-E2 autovector (1ª comp. 1)", vec, to_matrix(ans("T3-E2", "v")))

# ---------- T4-E3 · PLU (swap filas 1↔2) ----------
A = sp.Matrix([[0, 1, 1], [1, 0, 1], [1, 1, 0]])
P = sp.Matrix([[0, 1, 0], [1, 0, 0], [0, 0, 1]])
PA = P * A
L = sp.Matrix([[1, 0, 0], [0, 1, 0], [1, 1, 1]])
U = sp.Matrix([[1, 0, 1], [0, 1, 1], [0, 0, -2]])
chk("T4-E3 verificación PA = L·U (reconstrucción)", L * U, PA)
chk("T4-E3 L", L, to_matrix(ans("T4-E3", "L")))
chk("T4-E3 U", U, to_matrix(ans("T4-E3", "U")))

# ---------- T5-M5 · A = Q Λ Qᵀ (teorema espectral) ----------
s2 = sp.sqrt(2) / 2
Q = sp.Matrix([[s2, s2], [s2, -s2]])
Lam = sp.Matrix([[3, 0], [0, 1]])
A = sp.Matrix([[2, 1], [1, 2]])
chk("T5-M5 verificación A = QΛQᵀ", sp.simplify(Q * Lam * Q.T), A)
gotQ = sp.Matrix([[sp.sympify(str(c).replace("sqrt", "sqrt")) for c in row]
                  for row in ans("T5-M5", "Q")])
chk("T5-M5 Q vs esperado", Q, gotQ)
chk("T5-M5 Λ", Lam, to_matrix(ans("T5-M5", "Lam")))

# ---------- T5-E3 · pseudoinversa de A invertible = A⁻¹ ----------
A = sp.Matrix([[3, 1], [-1, 3]])
pinv = A.inv()
chk("T5-E3 A⁺ (=A⁻¹) y verificación de Penrose",
    (pinv, A * pinv * A == A, pinv * A * pinv == pinv,
     (A * pinv).T == A * pinv, (pinv * A).T == pinv * A),
    (to_matrix(ans("T5-E3")), True, True, True, True))

# ---------- X1-9 · z² + 2z + 5 = 0 ----------
z = sp.symbols("z")
rts = sp.solve(z**2 + 2 * z + 5, z)
chk("X1-9 raíces de z²+2z+5",
    sorted([sp.expand_complex(r) for r in rts], key=str),
    sorted([sp.sympify(str(s).replace("i", "I")) for s in ans("X1-9")], key=str))

# ---------- X2-10 · sistema paramétrico: α=7, β=5 ----------
a, b = sp.symbols("alpha beta")
A = sp.Matrix([[1, 1, 1], [2, 3, 4], [3, 5, a]])
Aug = sp.Matrix([[1, 1, 1, 1], [2, 3, 4, 3], [3, 5, a, b]])
# condición de compatible indeterminado: rango(A) = rango(A|b) = 2
# tras eliminación, la 3ª fila de [A|b] debe ser 0 0 0 | 0
f3 = sp.expand(Aug[2, :] - 3 * Aug[0, :] - 2 * (Aug[1, :] - 2 * Aug[0, :]))
sol = sp.solve([f3[2], f3[3]], [a, b], dict=True)
rankA = A.subs({a: 7}).rank()
rankAug = Aug.subs({a: 7, b: 5}).rank()
chk("X2-10 α=7, β=5 (único par con rango(A)=rango(A|b)=2)",
    (sol[0][a], sol[0][b], rankA, rankAug),
    (sp.Integer(ans("X2-10", "alpha")), sp.Integer(ans("X2-10", "beta")), 2, 2))

print(f"\nRESUMEN: {ok} comprobaciones OK · {len(fails)} fallos")
if fails:
    print("Fallos:", fails)
    raise SystemExit(1)
print("Muestra R7 (10 ejercicios) recalculada de forma independiente: TODO OK")
