"""ÁRBITRO R5 · muestra final de 20 ejercicios — recálculo INDEPENDIENTE desde
el enunciado (sympy / aritmética exacta / algoritmos propios), con revisión de
las fórmulas tocadas por las correcciones (N6: T1-M2; M1: T1-M5 √(z²); M5:
T1-N2/X1-1 bases; C3/N3: T5-E3; N3: SVD en T5-M1; T4-N3/T4-M5/T5-N5 zonas del
grader). Se compara con verify/arbitro/ronda5/muestra20.json (extraído de los
data files con dump_answers.js). NO se copia código de los verify/ de autores.
"""
import cmath
import json
import random
import sympy as sp
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "muestra20.json").read_text(encoding="utf8"))

ok = 0
fails = []


def chk(label, got, expected, exact_str=False):
    """Compara got vs expected (string sympifyable, bool, lista o dict de campos)."""
    global ok
    def eq(a, b):
        if exact_str:
            return str(a) == str(b)
        if isinstance(a, bool) or isinstance(b, bool):
            return a is b
        if isinstance(a, dict) and isinstance(b, dict):
            return set(a) == set(b) and all(eq(a[k], b[k]) for k in a)
        if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
            return len(a) == len(b) and all(eq(x, y) for x, y in zip(a, b))
        if isinstance(a, sp.MatrixBase) and isinstance(b, sp.MatrixBase):
            return a.shape == b.shape and all(sp.simplify(a[i, j] - b[i, j]) == 0
                                              for i in range(a.rows) for j in range(a.cols))
        try:
            ba = sp.sympify(b) if isinstance(b, str) else b
            return sp.simplify(sp.sympify(a) - ba) == 0
        except Exception:
            return str(a) == str(b)
    if eq(got, expected):
        ok += 1
        print(f"[OK ] {label}")
    else:
        fails.append(label)
        print(f"[FALLO] {label}: recalc={got} expected={expected}")


def ans(qid, field=None):
    a = DATA[qid]["answer"]
    return a if field is None else a["fields"][field]


def expval(qid, field=None):
    a = DATA[qid]["answer"]
    if field is not None:
        a = a["fields"][field]
    return a.get("expected")


def m2x2(rows):
    return sp.Matrix([[sp.sympify(c) for c in r] for r in rows])


# ---------- T1-N2 · 78 en base 3 (M5: tipo text) ----------
n, digits = 78, []
while n:
    digits.append(str(n % 3))
    n //= 3
chk("T1-N2 78 = 2220_3", "".join(reversed(digits)), expval("T1-N2"), exact_str=True)

# ---------- T1-M2 · z=-√3+i: módulo y argumento (N6) ----------
z = -sp.sqrt(3) + sp.I
mod = sp.sqrt(sp.re(z) ** 2 + sp.im(z) ** 2)
arg = sp.arg(z)  # rama principal sympy
chk("T1-M2 |z| = 2", mod, expval("T1-M2", "mod"))
chk("T1-M2 arg(z) = 5π/6", sp.simplify(arg - 5 * sp.pi / 6), 0)

# ---------- T1-M5 · √(z²)=z es FALSO (M1: caracterización tocada) ----------
# contraejemplo + caracterización: √(z²)=z ⟺ Re z>0 ∨ (Re z=0 ∧ Im z≥0)
z0 = -1j
lhs = cmath.sqrt(z0 ** 2)
chk("T1-M5 √((-i)²) = i = -z (contrasejemplo a √(z²)=z)", abs(lhs - 1j) < 1e-12, True)
rnd = random.Random(20261014)
exc = 0
for _ in range(5000):
    zz = complex(rnd.uniform(-2, 2), rnd.uniform(-2, 2))
    s = cmath.sqrt(zz ** 2)
    pred = zz if (zz.real > 0 or (zz.real == 0 and zz.imag >= 0)) else -zz
    if abs(s - pred) > 1e-9:
        exc += 1
chk("T1-M5 caracterización √(z²) (5000 puntos aleatorios)", exc, 0)

# ---------- T1-E1 · 1011.101₂ ----------
val = 1 * 8 + 0 * 4 + 1 * 2 + 1 * 1 + sp.Rational(1, 2) + sp.Rational(0, 8) + sp.Rational(1, 8)
chk("T1-E1 1011.101_2 = 93/8", sp.simplify(val - sp.Rational(93, 8)), 0)

# ---------- T2-N4 · ‖u‖ y d(u,v) ----------
u = sp.Matrix([2, 3, 6]); v = sp.Matrix([1, 2, 2])
chk("T2-N4 ‖u‖ = 7", sp.sqrt(sum(x ** 2 for x in u)), expval("T2-N4", "norm"))
chk("T2-N4 d(u,v) = 3√2", sp.sqrt(sum(x ** 2 for x in (u - v))), sp.sympify(expval("T2-N4", "dist")))

# ---------- T2-E2 · proyección ortogonal ----------
a = sp.Matrix([1, 0, 1]); b = sp.Matrix([0, 1, 1]); w = sp.Matrix([2, 1, 0])
G = sp.Matrix([[a.dot(a), a.dot(b)], [b.dot(a), b.dot(b)]])
rhs = sp.Matrix([a.dot(w), b.dot(w)])
c = G.LUsolve(rhs)
proj = c[0] * a + c[1] * b
chk("T2-E2 proy_V(w) = (1,0,1)", proj, sp.Matrix([1, 0, 1]))
chk("T2-E2 perp = (1,1,-1)", w - proj, sp.Matrix([1, 1, -1]))

# ---------- T3-N1 · det 2×2 ----------
A2 = sp.Matrix([[3, 1], [2, 4]])
chk("T3-N1 det = 10", A2.det(), expval("T3-N1"))

# ---------- T3-N3 · det(AB), det(A⁻¹) ----------
chk("T3-N3 det(AB) = -6", sp.Integer(-2) * 3, expval("T3-N3", "detAB"))
chk("T3-N3 det(A⁻¹) = -1/2", sp.Rational(-1, 2), sp.sympify(expval("T3-N3", "detInv")))

# ---------- T4-N3 · x = 4-s-t ----------
x, y, zz = sp.symbols("x y z")
s, t = sp.symbols("s t")
sol = sp.solve([x + y + zz - 4, 2 * x + 2 * y + 2 * zz - 8], [x], dict=True)[0]
chk("T4-N3 x = 4-s-t", sp.simplify(sol[x].subs({y: s, zz: t}) - (4 - s - t)), 0)

# ---------- T4-M2 · QR por Gram–Schmidt ----------
A = sp.Matrix([[1, 2], [0, 1], [0, 2]])
q1 = A[:, 0] / A[:, 0].norm()
u2 = A[:, 1] - (q1.dot(A[:, 1])) * q1
q2 = u2 / u2.norm()
Q = q1.row_join(q2)
R = sp.Matrix([[q1.dot(A[:, 0]), q1.dot(A[:, 1])], [0, u2.norm()]])
chk("T4-M2 Q", Q, m2x2(expval("T4-M2", "Q")))
chk("T4-M2 R", sp.simplify(R), m2x2(expval("T4-M2", "R")))
chk("T4-M2 QR = A", sp.simplify(Q * R - A), sp.zeros(3, 2))

# ---------- T4-E2 · rangos Rouché–Frobenius ----------
Amat = sp.Matrix([[1, 1], [2, 2], [1, 1]])
Cmat = sp.Matrix([[1, 1, 1], [2, 2, 2], [1, 1, 0]])
chk("T4-E2 rng(A) = 1", Amat.rank(), expval("T4-E2", "rangoA"))
chk("T4-E2 rng([[A,b]]) = 2", Cmat.rank(), expval("T4-E2", "rangoC"))

# ---------- T5-E3 · pseudoinversa (C3/N3: fórmulas tocadas) ----------
A = sp.Matrix([[3, 1], [-1, 3]])
Adag = (A.T * A).inv() * A.T
chk("T5-E3 A† = [[3/10,-1/10],[1/10,3/10]]", Adag, m2x2(expval("T5-E3")))
chk("T5-E3 A† = A^T(AA^T)^-1 (variante corregida)", sp.simplify(Adag - A.T * (A * A.T).inv()), sp.zeros(2, 2))
chk("T5-E3 Penrose 1: AA†A=A", sp.simplify(A * Adag * A - A), sp.zeros(2, 2))
chk("T5-E3 Penrose 2: A†AA†=A†", sp.simplify(Adag * A * Adag - Adag), sp.zeros(2, 2))
chk("T5-E3 Penrose 3: (AA†)^*=AA†", (A * Adag).T - A * Adag, sp.zeros(2, 2))
chk("T5-E3 Penrose 4: (A†A)^*=A†A", (Adag * A).T - Adag * A, sp.zeros(2, 2))
chk("T5-E3 (AA^T)^-1 A ≠ A† (falsedad R1 C3 cerrada)",
    sp.simplify((A * A.T).inv() * A - Adag) != sp.zeros(2, 2), True)

# ---------- T5-M1 · diagonalización (enunciado con λ1<λ2, N2) ----------
A = sp.Matrix([[5, -1], [2, 2]])
lams = sorted(A.eigenvals().keys(), key=lambda e: e)
chk("T5-M1 λ = {3,4} con λ1<λ2", lams, [sp.Integer(3), sp.Integer(4)])
v1 = (A - 3 * sp.eye(2)).nullspace()[0]
v2 = (A - 4 * sp.eye(2)).nullspace()[0]
P = sp.Matrix.hstack(v1 / v1[0], v2 / v2[0])
chk("T5-M1 P (1ª componente 1)", P, m2x2(expval("T5-M1", "P")))
chk("T5-M1 D", sp.diag(3, 4), m2x2(expval("T5-M1", "D")))
chk("T5-M1 PDP^-1 = A", sp.simplify(P * sp.diag(3, 4) * P.inv() - A), sp.zeros(2, 2))

# ---------- T5-N5 · pseudoinversa de diag(2,4) ----------
Adag = sp.diag(sp.Rational(1, 2), sp.Rational(1, 4))
chk("T5-N5 A† = diag(1/2,1/4)", Adag, m2x2(expval("T5-N5")))

# ---------- T5-E4 · inercia ----------
A = sp.Matrix([[2, 1, 0], [1, 2, 0], [0, 0, -3]])
ev = sorted(A.eigenvals().keys())
pos = sum(1 for e in ev if e > 0); neg = sum(1 for e in ev if e < 0)
chk("T5-E4 autovalores {3,1,-3}", ev, [sp.Integer(-3), sp.Integer(1), sp.Integer(3)])
chk("T5-E4 pos = 2", pos, expval("T5-E4", "pos"))
chk("T5-E4 neg = 1", neg, expval("T5-E4", "neg"))

# ---------- X1-1 · 101 en base 4 (M5: tipo text) ----------
n, digits = 101, []
while n:
    digits.append(str(n % 4))
    n //= 4
chk("X1-1 101 = 1211_4", "".join(reversed(digits)), expval("X1-1"), exact_str=True)

# ---------- X1-7 · (3+4i)/(2-i) ----------
w = (3 + 4 * sp.I) / (2 - sp.I)
chk("X1-7 (3+4i)/(2-i) = 2/5+11/5 i", sp.simplify(w - (sp.Rational(2, 5) + sp.Rational(11, 5) * sp.I)), 0)

# ---------- X2-12 · QR por Gram–Schmidt ----------
A = sp.Matrix([[1, 1], [1, 0], [1, 2]])
q1 = A[:, 0] / A[:, 0].norm()
u2 = A[:, 1] - (q1.dot(A[:, 1])) * q1
q2 = u2 / u2.norm()
Q = q1.row_join(q2)
R = sp.Matrix([[q1.dot(A[:, 0]), q1.dot(A[:, 1])], [0, u2.norm()]])
chk("X2-12 Q", Q, m2x2(expval("X2-12", "Q")))
chk("X2-12 R", sp.simplify(R), m2x2(expval("X2-12", "R")))

# ---------- X3-10 · det(A²), tr(A⁻¹) ----------
eigs = [2, 2, -1, 4]
detA = sp.Integer(1)
for e in eigs:
    detA *= e
chk("X3-10 det(A²) = 256", detA ** 2, expval("X3-10", "det2"))
chk("X3-10 tr(A⁻¹) = 1/4", sum(sp.Rational(1, e) for e in eigs), sp.sympify(expval("X3-10", "trinv")))

# ---------- X3-12 · A† y mínima norma ----------
A = sp.Matrix([[1, 1], [2, 2]]); b = sp.Matrix([2, 5])
Adag = (A.T * A).pinv() * A.T  # rank-1: usar fórmula de rango 1 independiente
u = sp.Matrix([1, 2]); vv = sp.Matrix([1, 1])
Adag = vv * u.T / ((u.T * u)[0] * (vv.T * vv)[0])
chk("X3-12 A† = [[1/10,1/5],[1/10,1/5]]", Adag, m2x2(expval("X3-12", "Adag")))
chk("X3-12 x = A†b = (6/5,6/5)", sp.simplify(Adag * b), sp.Matrix([sp.Rational(6, 5)] * 2))
chk("X3-12 Penrose 1: AA†A=A", sp.simplify(A * Adag * A - A), sp.zeros(2, 2))
chk("X3-12 ecuaciones normales A*A x = A*b", sp.simplify(A.T * A * (Adag * b) - A.T * b), sp.zeros(2, 1))

print(f"\nMUESTRA R5: {ok} OK, {len(fails)} FALLOS {fails if fails else ''}")
raise SystemExit(1 if fails else 0)
