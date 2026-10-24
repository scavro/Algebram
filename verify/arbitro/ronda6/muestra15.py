"""ÁRBITRO R6 · muestra final de 15 ejercicios — recálculo INDEPENDIENTE desde
el enunciado (sympy / aritmética exacta / algoritmos propios). Scripts frescos:
NO se copia código de verify/ de autores ni de rondas anteriores (la lista de
ejercicios es además distinta a la muestra20 de R5). Datos extraídos con
dump-r6.js → expected-r6.json.

Ejercicios: T1-N4, T1-M1, T1-M4, T2-N1, T2-M2, T2-E2, T3-N5, T3-M5, T4-N4,
T4-M3, T4-M4, T5-M3, T5-M4, X3-7, X3-10.
Zonas tocadas por R6: fracciones y complejos (parser N5r), pseudoinversa de
rango 1 (fórmula N3r), proyecciones, ajuste por mínimos cuadrados.
"""
import json
import re
from pathlib import Path

import sympy as sp

HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "expected-r6.json").read_text(encoding="utf8"))

ok, fails = 0, []
INDEX = {q["id"]: q for items in DATA.values() for q in items}


def sym(s):
    """sympify con la notación del curso: i = unidad imaginaria."""
    return sp.sympify(re.sub(r"(?<![A-Za-z])i(?![A-Za-z])", "I", str(s)))


def chk(label, got, expected):
    global ok
    def eq(a, b):
        if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
            return len(a) == len(b) and all(eq(x, y) for x, y in zip(a, b))
        if isinstance(a, sp.MatrixBase) and isinstance(b, sp.MatrixBase):
            return a.shape == b.shape and all(
                sp.simplify(a[i, j] - b[i, j]) == 0
                for i in range(a.rows) for j in range(a.cols))
        if isinstance(a, bool) or isinstance(b, bool):
            return a is b
        try:
            return sp.simplify(sym(a) - sym(b)) == 0
        except Exception:
            return str(a) == str(b)
    if eq(got, expected):
        ok += 1
        print(f"[OK ] {label}")
    else:
        fails.append(label)
        print(f"[FALLO] {label}: recalc={got} expected={expected}")


def expval(qid, field=None):
    a = INDEX[qid]["answer"]
    if field is not None:
        a = a["fields"][field]
    return a.get("expected")


# ---------- T1-N4 · 0,3636... = 36/99 = 4/11 ----------
r = sp.Rational(36, 99)
chk("T1-N4 0,36̄ = 4/11", sp.Rational(r), sp.Rational(4, 11))
chk("T1-N4 expected", sp.Rational(expval("T1-N4")), sp.Rational(4, 11))

# ---------- T1-M1 · (2+i)/(1-i) ----------
z = (2 + sp.I) / (1 - sp.I)
chk("T1-M1 (2+i)/(1-i) = 1/2+3/2 i", sp.expand(z), sp.Rational(1, 2) + sp.Rational(3, 2) * sp.I)
chk("T1-M1 expected", sp.expand(sym(expval("T1-M1"))), sp.expand(z))

# ---------- T1-M4 · raíces cúbicas de 8 ----------
roots = [2, 2 * (-sp.Rational(1, 2) + sp.sqrt(3) / 2 * sp.I), 2 * (-sp.Rational(1, 2) - sp.sqrt(3) / 2 * sp.I)]
chk("T1-M4 todas verifican z^3=8", all(sp.simplify(r ** 3 - 8) == 0 for r in roots), True)
exp = [sym(s) for s in expval("T1-M4")]
chk("T1-M4 las 3 raíces", sorted(map(str, map(sp.simplify, roots))), sorted(map(str, map(sp.simplify, exp))))

# ---------- T2-N1 · w = 3u − 2v ----------
u = sp.Matrix([2, -1, 3]); v = sp.Matrix([1, 4, -2])
w = 3 * u - 2 * v
chk("T2-N1 w = (4,-11,13)", list(w), [sp.Integer(x) for x in (4, -11, 13)])
chk("T2-N1 expected",
    sp.Matrix([[sp.sympify(c)] for c in [e for r in expval("T2-N1") for e in r]]), w)

# ---------- T2-M2 · inversa 3×3 ----------
A = sp.Matrix([[1, 2, 3], [0, 1, 4], [5, 6, 0]])
Ainv = A.inv()
chk("T2-M2 A*A^{-1}=I", sp.simplify(A * Ainv), sp.eye(3))
chk("T2-M2 expected", sp.Matrix(expval("T2-M2")), Ainv)

# ---------- T2-E2 · proyección ortogonal y perp ----------
e1, e2 = sp.Matrix([1, 0, 1]), sp.Matrix([0, 1, 1])
G = sp.Matrix([[e1.dot(e1), e1.dot(e2)], [e2.dot(e1), e2.dot(e2)]])
b = sp.Matrix([2, 1, 0])
rhs = sp.Matrix([e1.dot(b), e2.dot(b)])
c = G.LUsolve(rhs)
proj = c[0] * e1 + c[1] * e2
perp = b - proj
chk("T2-E2 proy = (1,0,1)", list(proj), [sp.Integer(1), sp.Integer(0), sp.Integer(1)])
chk("T2-E2 perp = (1,1,-1)", list(perp), [sp.Integer(1), sp.Integer(1), sp.Integer(-1)])
chk("T2-E2 perp ⊥ V", perp.dot(e1) == 0 and perp.dot(e2) == 0, True)
chk("T2-E2 expected proj", sp.Matrix(expval("T2-E2", "proj")), proj)
chk("T2-E2 expected perp", sp.Matrix(expval("T2-E2", "perp")), perp)

# ---------- T3-N5 · autovalores de [[4,7],[0,-2]] ----------
A = sp.Matrix([[4, 7], [0, -2]])
eigs = sorted(A.eigenvals().keys(), key=lambda z: -z)
chk("T3-N5 autovalores 4, -2", sorted(map(str, eigs)), ["-2", "4"])
chk("T3-N5 expected", sorted(map(str, map(sym, expval("T3-N5")))), sorted(map(str, eigs)))

# ---------- T3-M5 · matriz de la forma cuadrática ----------
# f = x1² + 2x1x2 + 6x1x3 + 2x2² + 4x2x3 + 3x3²
xs = sp.symbols("x1:4")
f = xs[0] ** 2 + 2 * xs[0] * xs[1] + 6 * xs[0] * xs[2] + 2 * xs[1] ** 2 + 4 * xs[1] * xs[2] + 3 * xs[2] ** 2
M = sp.Matrix([[1, 1, 3], [1, 2, 2], [3, 2, 3]])
xvec = sp.Matrix(xs)
chk("T3-M5 f = x^T A x", sp.expand((xvec.T * M * xvec)[0] - f), 0)
chk("T3-M5 A simétrica", M == M.T, True)
chk("T3-M5 expected", sp.Matrix(expval("T3-M5")), M)

# ---------- T4-N4 · proyección de b sobre a ----------
a = sp.Matrix([1, 1]); b = sp.Matrix([3, 1])
p = a.dot(b) / a.dot(a) * a
chk("T4-N4 proj = (2,2)", list(p), [sp.Integer(2), sp.Integer(2)])
chk("T4-N4 expected", sp.Matrix(expval("T4-N4")), p)

# ---------- T4-M3 · mínimos cuadrados y = m x + n ----------
X = sp.Matrix([[0, 1], [1, 1], [2, 1], [3, 1]])
yv = sp.Matrix([1, 2, 4, 7])
sol = (X.T * X).LUsolve(X.T * yv)
m, n = sol
chk("T4-M3 m = 2, n = 1/2", [m, n], [sp.Integer(2), sp.Rational(1, 2)])
chk("T4-M3 residual ⊥ columnas", all(sp.simplify(u) == 0 for u in X.T * (X * sol - yv)), True)
chk("T4-M3 expected m", sp.sympify(expval("T4-M3", "m")), m)
chk("T4-M3 expected n", sp.sympify(expval("T4-M3", "n")), n)

# ---------- T4-M4 · predicción y(5) = 2*5 + 1/2 ----------
chk("T4-M4 y(5) = 21/2", 2 * 5 + sp.Rational(1, 2), sp.Rational(21, 2))
chk("T4-M4 expected", sp.sympify(expval("T4-M4")), sp.Rational(21, 2))

# ---------- T5-M3 · valores singulares de [[1,3],[3,1]] ----------
A = sp.Matrix([[1, 3], [3, 1]])
sig = sorted([sp.sqrt(z) for z in (A.T * A).eigenvals().keys()], key=lambda z: -z)
chk("T5-M3 σ = 4, 2", sig, [sp.Integer(4), sp.Integer(2)])
chk("T5-M3 expected", [sym(s) for s in expval("T5-M3")], sig)

# ---------- T5-M4 · pseudoinversa de rango 1 (fórmula N3r) ----------
# A = x y^T con x=(2,1), y=(1,2)  ⇒  A† = y x^T / (‖x‖²‖y‖²)
x, y = sp.Matrix([2, 1]), sp.Matrix([1, 2])
A = x * y.T
Ad = y * x.T / ((x.dot(x)) * (y.dot(y)))
chk("T5-M4 AA†A = A", A * Ad * A, A)
chk("T5-M4 A†AA† = A†", Ad * A * Ad, Ad)
chk("T5-M4 (AA†)^T = AA†", (A * Ad).T, A * Ad)
chk("T5-M4 (A†A)^T = A†A", (Ad * A).T, Ad * A)
chk("T5-M4 expected", sp.Matrix(expval("T5-M4")), Ad)

# ---------- X3-7 · forma canónica de Jordan de [[3,-1],[1,1]] ----------
A = sp.Matrix([[3, -1], [1, 1]])
lam = sp.symbols("lam")
char = sp.Poly(A.charpoly(lam).as_expr(), lam)
chk("X3-7 pol.car. = (λ-2)²", sp.factor(char.as_expr()), (lam - 2) ** 2)
rk = (A - 2 * sp.eye(2)).rank()
J = sp.Matrix([[2, 1], [0, 2]])
chk("X3-7 defecto geométrico 1 ⇒ bloque Jordan 2×2", rk, 1)
chk("X3-7 expected", sp.Matrix(expval("X3-7")), J)

# ---------- X3-10 · det(A²) y tr(A⁻¹) ----------
dets = [2, 2, -1, 4]
detA = dets[0] * dets[1] * dets[2] * dets[3]
chk("X3-10 det(A²) = 256", detA ** 2, 256)
chk("X3-10 tr(A⁻¹) = Σ 1/λ = 1/4",
    sum(sp.Rational(1, z) for z in dets), sp.Rational(1, 4))
chk("X3-10 expected det2", sp.sympify(expval("X3-10", "det2")), 256)
chk("X3-10 expected trinv", sp.sympify(expval("X3-10", "trinv")), sp.Rational(1, 4))

print(f"\n{ok} OK, {len(fails)} FALLOS")
if fails:
    print("Fallos:", fails)
raise SystemExit(1 if fails else 0)
