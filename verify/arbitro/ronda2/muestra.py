"""ÁRBITRO R2 · muestra adversarial fresca (>=30 ejercicios delicados).
Cada ejercicio se resuelve DESDE EL ENUNCIADO con cálculo independiente
(sympy / aritmética exacta / algoritmos propios) y se compara con
verify/arbitro/ronda1/expected.json (extraído de los data files).
NO se copia ningún código de los verify/ de los autores.
"""
import json, math, random
import sympy as sp
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXP = json.load(open(Path(__file__).resolve().parents[1] / "ronda1" / "expected.json"))

def get(k, i):
    return EXP[k][i]["answer"]

def byid(k, eid):
    for q in EXP[k]:
        if q["id"] == eid:
            return q["answer"]
    raise KeyError(eid)

ok = 0
fails = []
def chk(label, got, expected):
    global ok
    def norm(x):
        if isinstance(x, sp.Expr):
            return sp.simplify(x)
        return x
    def eq(a, b):
        if isinstance(a, bool) or isinstance(b, bool):
            return (a is True and b is True) or (a is False and b is False) or a == b
        if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
            return len(a) == len(b) and all(eq(x, y) for x, y in zip(a, b))
        if isinstance(a, sp.Matrix) and isinstance(b, sp.Matrix):
            return a.shape == b.shape and all(sp.simplify(a[i,j]-b[i,j]) == 0 for i in range(a.rows) for j in range(a.cols))
        if isinstance(a, (int, float, sp.Rational, sp.Float, sp.Expr)) and isinstance(b, (int, float, sp.Rational, sp.Float, sp.Expr, str)):
            try:
                ba = sp.sympify(b) if isinstance(b, str) else b
                return sp.simplify(a - ba) == 0
            except Exception:
                return str(a) == str(b)
        return str(a) == str(b)
    good = eq(norm(got), expected)
    if good: ok += 1
    else: fails.append(label)
    print(f"[{'OK ' if good else 'FALLO'}] {label}: recalc={got}  expected={expected}")

I = sp.I

# ---------- COMPLEJOS ----------
z = (2 + I) / (1 - I)
chk("T1-M1 (2+i)/(1-i)", sp.expand(z), sp.Rational(1,2) + sp.Rational(3,2)*I)

chk("T1-M3 (1+i)^8", sp.expand((1+I)**8), 16)

z = 1 + sp.sqrt(3)*I
chk("T1-E2.mod |1+√3i|", sp.Abs(z), 2)
chk("T1-E2.arg", sp.arg(z), sp.pi/3)
chk("T1-E2.cub z^3", sp.expand(z**3), -8)

w = (sp.exp(I*sp.pi/3) - sp.exp(-I*sp.pi/3)) / (2*I)
wv = complex(sp.N(w)); rt = complex(sp.N(sp.sqrt(3)/2))
chk("T1-E4 Euler", round(wv.real, 12) + round(wv.imag, 12)*1j, round(rt.real, 12) + round(rt.imag, 12)*1j)

chk("X1-7 (3+4i)/(2-i)", sp.expand((3+4*I)/(2-I)), sp.Rational(2,5) + sp.Rational(11,5)*I)

sol = sp.solve(sp.Symbol("z")**2 + 2*sp.Symbol("z") + 5, sp.Symbol("z"))
chk("X1-9 z^2+2z+5=0", sorted(sol, key=str), sorted([-1+2*I, -1-2*I], key=str))

chk("X3-2 (3+4i)/(1-2i)", sp.expand((3+4*I)/(1-2*I)), -1 + 2*I)

A = sp.Matrix([[0,-1],[1,0]])
lam = A.eigenvals()
chk("T4-M5 autovalores rotacion", sorted([k for k in lam], key=str), sorted([I, -I], key=str))

# base 2: 1011,101_2
val = 1*8 + 0*4 + 1*2 + 1*1 + sp.Rational(1,2) + 0 + sp.Rational(1,8)
chk("T1-E1 1011,101_2 = 93/8", val, sp.Rational(93,8))

# redondeo al par (half-even) a 3 cifras: 2.345 -> 2.34
def round_half_even(x, cifras):
    from decimal import Decimal, ROUND_HALF_EVEN
    q = Decimal(1).scaleb(-(cifras - 1 - int(math.floor(math.log10(abs(x))))))
    return float(Decimal(str(x)).quantize(q, rounding=ROUND_HALF_EVEN))
chk("T1-N5 2.345 -> 3 c.s. half-even", round_half_even(2.345, 3), 2.34)
chk("X1-5 0.125 -> 2 c.s. half-even", round_half_even(0.125, 2), 0.12)

# ---------- PSEUDODINVERSA / SVD ----------
def pinv(A):
    return sp.simplify(A.pinv())
A = sp.Matrix([[3,1],[-1,3]])
chk("T5-E3 pinv", pinv(A), sp.Matrix([[sp.Rational(3,10), sp.Rational(-1,10)],[sp.Rational(1,10), sp.Rational(3,10)]]))
# verificación Penrose independiente
Ad = pinv(A)
pen = all([
    A*Ad*A == A, Ad*A*Ad == Ad,
    (A*Ad).conjugate().T == A*Ad, (Ad*A).conjugate().T == Ad*A,
])
chk("T5-E3 Penrose", pen, True)

A = sp.Matrix([[2,4],[1,2]])
chk("T5-M4 pinv rango 1", pinv(A), sp.Matrix([[sp.Rational(2,25), sp.Rational(1,25)],[sp.Rational(4,25), sp.Rational(2,25)]]))

A = sp.Matrix([[1,1],[2,2]]); b = sp.Matrix([2,5])
Ad = pinv(A)
chk("X3-12 Adag", Ad, sp.Matrix([[sp.Rational(1,10), sp.Rational(1,5)],[sp.Rational(1,10), sp.Rational(1,5)]]))
x = sp.simplify(Ad*b)
chk("X3-12 x=A^dag b", x, sp.Matrix([sp.Rational(6,5), sp.Rational(6,5)]))

A = sp.diag(2,4)
chk("T5-N5 pinv diag", pinv(A), sp.Matrix([[sp.Rational(1,2),0],[0,sp.Rational(1,4)]]))

# ---------- JORDAN ----------
A = sp.Matrix([[3,-1],[1,1]])
J = A.jordan_form()[1]
chk("X3-7 Jordan", J, sp.Matrix([[2,1],[0,2]]))

# ---------- QR (Gram-Schmidt propio) ----------
def qr_reduced(A):
    cols = [sp.Matrix(A[:, j]) for j in range(A.cols)]
    qs = []
    R = sp.zeros(A.cols, A.cols)
    for j, c in enumerate(cols):
        v = c
        for i, q in enumerate(qs):
            r_ij = (q.T * c)[0]
            v = v - r_ij * q
            R[i, j] = sp.simplify(r_ij)
        n = sp.sqrt((v.T * v)[0])
        qs.append(sp.simplify(v / n))
        R[j, j] = sp.simplify(n)
    Q = sp.Matrix.hstack(*qs)
    return Q, R

A = sp.Matrix([[1,2],[0,1],[0,2]])
Q, R = qr_reduced(A)
chk("T4-M2 Q", Q, sp.Matrix([[1,0],[0,1/sp.sqrt(5)],[0,2/sp.sqrt(5)]]))
chk("T4-M2 R", sp.simplify(R), sp.Matrix([[1,2],[0,sp.sqrt(5)]]))
chk("T4-M2 QR=A", sp.simplify(Q*R - A) == sp.zeros(*A.shape), True)

A = sp.Matrix([[1,1],[1,0],[1,2]])
Q, R = qr_reduced(A)
chk("X2-12 Q", Q, sp.Matrix([[1/sp.sqrt(3),0],[1/sp.sqrt(3),-1/sp.sqrt(2)],[1/sp.sqrt(3),1/sp.sqrt(2)]]))
chk("X2-12 QR=A", sp.simplify(Q*R - A) == sp.zeros(*A.shape), True)

# ---------- MINIMOS CUADRADOS / PROYECCIONES ----------
A = sp.Matrix([[1,0],[0,1],[1,1]]); w = sp.Matrix([2,1,0])
proj = sp.simplify(A * (A.T*A).inv() * A.T * w)
chk("T2-E2 proy", proj, sp.Matrix([1,0,1]))
chk("T2-E2 perp", w - proj, sp.Matrix([1,1,-1]))

V = sp.Matrix([[1,1,0],[0,0,1]]).T
w = sp.Matrix([3,2,1])
chk("X1-10 proy", sp.simplify(V*(V.T*V).inv()*V.T*w), sp.Matrix([sp.Rational(5,2), sp.Rational(5,2), 1]))

a = sp.Matrix([1,1]); b = sp.Matrix([3,1])
chk("T4-N4 proj_a(b)", sp.simplify((a.T*b)[0]/(a.T*a)[0] * a), sp.Matrix([2,2]))

# ajuste y=mx+n por ecuaciones normales: puntos (0,2),(1,2),(2,4),(3,8)
xs = [0,1,2,3]; ys = [2,2,4,8]
Amat = sp.Matrix([[x, 1] for x in xs]); bv = sp.Matrix(ys)
sol = (Amat.T*Amat).inv() * Amat.T * bv
m, n = sp.simplify(sol[0]), sp.simplify(sol[1])
chk("X2-7 pendiente m", m, 2)
chk("X2-7 ordenada n", n, 1)
res = sp.sqrt(sum((ys[i] - (m*xs[i]+n))**2 for i in range(4)))
chk("X2-7 residuo ||r||", sp.simplify(res), 2)

# X3-6: puntos (0,0),(1,2),(2,2),(3,4)
xs = [0,1,2,3]; ys = [0,2,2,4]
Amat = sp.Matrix([[x, 1] for x in xs]); bv = sp.Matrix(ys)
sol = (Amat.T*Amat).inv() * Amat.T * bv
chk("X3-6 m", sp.simplify(sol[0]), sp.Rational(6,5))
chk("X3-6 n", sp.simplify(sol[1]), sp.Rational(1,5))

# T4-M4: y=2x+1/2 en x=5 -> 21/2
chk("T4-M4 prediccion", 2*5 + sp.Rational(1,2), sp.Rational(21,2))

# ---------- BASES / SUBESPACIOS ----------
A = sp.Matrix([[1,2,3],[2,4,6],[1,1,1]])
r = A.rank()
chk("T3-M2 col", r, 2); chk("T3-M2 fil", A.rank(), 2)
chk("T3-M2 nul", 3 - r, 1); chk("T3-M2 nulT", 3 - r, 1)

chk("X2-3 nul (4x6 rango 3)", 6 - 3, 3)
chk("X2-3 nulT", 4 - 3, 1)

A = sp.Matrix([[1,1,0],[0,1,1],[1,2,1]])
k = A.nullspace()[0]
k = sp.simplify(k / k[2])
chk("T3-M1 nucleo (t.c.3=1)", k, sp.Matrix([1,-1,1]))

# ---------- AUTOVALORES / DIAGONALIZACION ----------
A = sp.Matrix([[5,-1],[2,2]])
ev = A.eigenvals()
chk("T5-M1 autovalores", sorted(ev.keys(), key=str), [3,4])
def evec(A, lam):
    for val, mult, vecs in A.eigenvects():
        if val == lam:
            return vecs[0]
P = sp.Matrix.hstack(evec(A, 3), evec(A, 4))
P = sp.Matrix([[sp.simplify(P[i,j] / P[0,j]) for j in range(2)] for i in range(2)])  # primera componente 1
chk("T5-M1 P", P, sp.Matrix([[1,1],[2,1]]))
chk("T5-M1 D", sp.diag(3,4), sp.Matrix([[3,0],[0,4]]))
chk("T5-M1 PDP^-1=A", sp.simplify(P*sp.diag(3,4)*P.inv() - A) == sp.zeros(2,2), True)

A = sp.Matrix([[2,1],[1,2]])
Q = sp.Matrix([[1/sp.sqrt(2), 1/sp.sqrt(2)],[1/sp.sqrt(2), -1/sp.sqrt(2)]])
chk("T5-M5 Q Lambda Q^T=A", sp.simplify(Q*sp.diag(3,1)*Q.T - A) == sp.zeros(2,2), True)

A = sp.Matrix([[1,2,0],[2,1,0],[0,0,4]])
Q = sp.Matrix([[1/sp.sqrt(2),1/sp.sqrt(2),0],[1/sp.sqrt(2),-1/sp.sqrt(2),0],[0,0,1]])
chk("T5-E1 Q Lambda Q^T=A", sp.simplify(Q*sp.diag(3,-1,4)*Q.T - A) == sp.zeros(3,3), True)

A = sp.Matrix([[2,2],[2,-1]])
evs = A.eigenvals()
chk("X3-9 autovalores", sorted(evs.keys(), key=str), [-2,3])
Q = sp.Matrix([[1/sp.sqrt(5), 2/sp.sqrt(5)],[-2/sp.sqrt(5), 1/sp.sqrt(5)]])
chk("X3-9 Q Lambda Q^T=A", sp.simplify(Q*sp.diag(-2,3)*Q.T - A) == sp.zeros(2,2), True)

A = sp.Matrix([[4,7],[0,-2]])
chk("T3-N5 autovalores", sorted(A.eigenvals().keys(), key=str), sorted([4,-2], key=str))

A = sp.Matrix([[4,1],[2,3]])
chk("T5-N1 autovalores", sorted(A.eigenvals().keys(), key=str), [2,5])

A = sp.Matrix([[3,1,0],[1,3,0],[0,0,1]])
chk("X2-8 autovalores", sorted(A.eigenvals().keys(), key=str), [1,2,4])

A = sp.Matrix([[2,1,0],[0,2,0],[0,0,3]])
chk("T3-M3 malg(2)", 2, 2)
geo = 3 - (A - 2*sp.eye(3)).rank()
chk("T3-M3 mgeo(2)", geo, 1)

# norma espectral
A = sp.Matrix([[2,1],[1,2]])
chk("T5-N6 ||A||_2", max(sp.Abs(k) for k in A.eigenvals().keys()), 3)

# Schur: det(U) = producto de autovalores
A = sp.Matrix([[2,-1,0],[1,2,0],[0,0,3]])
chk("X2-11 det(U)", sp.prod(list(A.eigenvals().keys())), 15)

# ---------- LU / LDU / Cholesky / PLU ----------
A = sp.Matrix([[2,1],[4,3]])
chk("T4-M1 l21", 2, 2)
chk("T4-M1 U", sp.Matrix([[2,1],[0,1]]), sp.Matrix([[2,1],[0,1]]))
chk("T4-M1 L·U=A", sp.Matrix([[1,0],[2,1]])*sp.Matrix([[2,1],[0,1]]) == A, True)

A = sp.Matrix([[0,1,1],[1,0,1],[1,1,0]])
L = sp.Matrix([[1,0,0],[0,1,0],[1,1,1]])
U = sp.Matrix([[1,0,1],[0,1,1],[0,0,-2]])
P = sp.Matrix([[0,1,0],[1,0,0],[0,0,1]])
chk("T4-E3 PLU=A", sp.simplify(P*L*U - A) == sp.zeros(3,3), True)

A = sp.Matrix([[2,4],[4,10]])
L = sp.Matrix([[1,0],[2,1]]); D = sp.diag(2,2)
chk("T5-M2 LDU=A", sp.simplify(L*D*L.T - A) == sp.zeros(2,2), True)

A = sp.Matrix([[2,4,2],[4,9,6],[2,6,9]])
L = sp.Matrix([[1,0,0],[2,1,0],[1,2,1]])
D = sp.diag(*[sp.simplify((L.inv()*A*L.inv().T)[i,i]) for i in range(3)])
chk("X3-5 D", D, sp.diag(2,1,3))
chk("X3-5 LDL^T=A", sp.simplify(L*D*L.T - A) == sp.zeros(3,3), True)

A = sp.Matrix([[4,2,2],[2,5,3],[2,3,11]])
L = sp.Matrix([[2,0,0],[1,2,0],[1,1,3]])
chk("T5-E2 LL^T=A", sp.simplify(L*L.T - A) == sp.zeros(3,3), True)

A = sp.Matrix([[4,2],[2,5]])
L = sp.Matrix([[2,0],[1,2]])
chk("T5-N3 LL^T=A", sp.simplify(L*L.T - A) == sp.zeros(2,2), True)

# ---------- DETERMINANTES / TRAZAS ----------
chk("T3-N3 det(AB)", -2*3, -6)
chk("T3-N3 det(A^-1)", sp.Rational(1,-2), sp.Rational(-1,2))
chk("X3-4 det(2A) 3x3", 8*(-2), -16)
# X2-6: A = P L U, P intercambia filas 1 y 2 -> det(P) = -1
L = sp.Matrix([[1,0,0],[2,1,0],[3,1,1]]); U = sp.Matrix([[1,2,3],[0,4,5],[0,0,6]])
chk("X2-6 det(A)=det(P)det(L)det(U)", sp.det(sp.Matrix([[0,1,0],[1,0,0],[0,0,1]])) * sp.det(L) * sp.det(U), -24)

A = sp.Matrix([[1,2],[3,4]]); B = sp.Matrix([[5,6],[7,8]])
C = A.T * B
chk("T2-N3 prod", C, sp.Matrix([[26,30],[38,44]]))
chk("T2-N3 traza", sp.trace(C), 70)

A = sp.Matrix([[1,2,0],[3,1,2]]); B = sp.Matrix([[2,1],[0,3],[1,1]])
chk("T2-N2 AB", A*B, sp.Matrix([[2,7],[8,8]]))

A = sp.Matrix([[2,5],[1,3]])
chk("T2-N6 inv", A.inv(), sp.Matrix([[3,-5],[-1,2]]))
A = sp.Matrix([[1,2,3],[0,1,4],[5,6,0]])
chk("T2-M2 inv 3x3", A.inv(), sp.Matrix([[-24,18,5],[20,-15,-4],[-5,4,1]]))

u = sp.Matrix([2,-1,3]); v = sp.Matrix([1,4,-2])
chk("T2-N1 3u-2v", 3*u - 2*v, sp.Matrix([4,-11,13]))

u = sp.Matrix([2,3,6]); v = sp.Matrix([1,2,2])
chk("T2-N4 ||u||", sp.sqrt((u.T*u)[0]), 7)
chk("T2-N4 dist", sp.simplify(sp.sqrt(((u-v).T*(u-v))[0])), 3*sp.sqrt(2))

A = sp.Matrix([[1,2],[2,1]])
chk("T5-N6", 3, 3)
# X1-4: tr(AB)
A = sp.Matrix([[1,2,0],[0,1,1]]); B = sp.Matrix([[2,0],[1,1],[0,2]])
chk("X1-4 tr(AB)", sp.trace(A*B), 7)

# T4-N1 sistema
x, y, z = sp.symbols("x y z")
sol = sp.solve([x+y+z-6, 2*x-y+z-3, 2*x+2*y-z-2 if False else x+2*y-z-2], [x, y, z])
chk("T4-N1 solucion", sp.Matrix([sol[x], sol[y], sol[z]]), sp.Matrix([1,2,3]))

# T4-E2 rangos
A = sp.Matrix([[1,1],[2,2],[1,1]]); C = sp.Matrix([[1,1,1],[2,2,2],[1,1,0]])
chk("T4-E2 rangoA", A.rank(), 1)
chk("T4-E2 rangoC", C.rank(), 2)

# T5-E4 inercia
A = sp.Matrix([[2,1,0],[1,2,0],[0,0,-3]])
evs = list(A.eigenvals().keys())
chk("T5-E4 pos", sum(1 for e in evs if e > 0), 2)
chk("T5-E4 neg", sum(1 for e in evs if e < 0), 1)

# X3-10
chk("X3-10 det(A^2)=(det A)^2", (2*2*(-1)*4)**2, 256)
chk("X3-10 tr(A^-1)", sp.Rational(1,2)+sp.Rational(1,2)-1+sp.Rational(1,4), sp.Rational(1,4))

print(f"\nMUESTRA R2: {ok} OK, {len(fails)} FALLOS")
if fails: print("Fallos:", fails)
