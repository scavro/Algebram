"""ÁRBITRO R1 · check_tema1.py — recálculo independiente de cada ejercicio de tema-1.js
con aritmética exacta / sympy, contrastado con answer.expected extraído del data.
Nada de aquí copia los verify/ de los autores: los cálculos se escriben desde el enunciado."""
import json, os, sys
import sympy as sp
from sx import sx

HERE = os.path.dirname(os.path.abspath(__file__))
exp = json.load(open(os.path.join(HERE, "expected.json")))["tema-1"]
E = {q["id"]: q["answer"] for q in exp}

ok = fail = 0
def recalc(id_, computed, expected, note=""):
    """compara el valor recalculado con el expected del data (texto)."""
    global ok, fail
    try:
        good = sp.simplify(sx(str(computed)) - sx(str(expected))) == 0
    except Exception:
        good = str(computed).strip() == str(expected).strip()
    status = "OK " if good else "FALLO"
    if good: ok += 1
    else: fail += 1
    print(f"[{status}] {id_}: recalc={computed}  expected={expected} {note}")
    return good

def recalc_set(id_, computed_list, expected_list):
    global ok, fail
    a = sorted([str(sp.simplify(sx(x))) for x in computed_list])
    b = sorted([str(sp.simplify(sx(x))) for x in expected_list])
    good = a == b
    status = "OK " if good else "FALLO"
    if good: ok += 1
    else: fail += 1
    print(f"[{status}] {id_}: recalc={a}  expected={b}")
    return good

# ---------- T1-N1: 1101101_2 a base diez ----------
digits = [1,1,0,1,1,0,1]  # de la izquierda (2^6) a la derecha (2^0)
val = sum(d * 2**(6-i) for i, d in enumerate(digits))
recalc("T1-N1", val, E["T1-N1"]["expected"])

# ---------- T1-N2: 78 en base 3 ----------
n = 78
restos = []
m = n
while m > 0:
    restos.append(m % 3); m //= 3
base3 = "".join(str(r) for r in reversed(restos))  # "2220"
# comprobación posicional
val2 = sum(int(c) * 3**(len(base3)-1-i) for i, c in enumerate(base3))
assert val2 == 78
recalc("T1-N2", base3, E["T1-N2"]["expected"])

# ---------- T1-N3: tipo de función (choice) ----------
# f(1)=a, f(2)=b, f(3)=a sobre {a,b}: inyectiva? sobreyectiva?
img = {"a", "b"}
f = {1: "a", 2: "b", 3: "a"}
iny = len(set(f.values())) == len(f)          # False
sob = set(f.values()) == img                   # True
choice = 1 if (sob and not iny) else -1
recalc("T1-N3", choice, E["T1-N3"]["expected"])

# ---------- T1-N4: 0.(36) periódico ----------
r = sp.Rational(36, 99)   # 99r = 36
r = sp.Rational(36, 99).limit_denominator()
assert r == sp.Rational(4, 11)
recalc("T1-N4", r, E["T1-N4"]["expected"])

# ---------- T1-N5: redondeo 2.345 -> 3 cifras significativas (par más cercano) ----------
# candidatos 2.34 y 2.35; 2.345 exactamente en medio; última cifra par: 2.34
round_half_even = sp.Rational(234, 100)  # 2.34
recalc("T1-N5", round_half_even, E["T1-N5"]["expected"])

# ---------- T1-N6: (3+4i)(2-i) ----------
i = sp.I
z = (3 + 4*i) * (2 - i)
recalc("T1-N6", sp.expand(z), E["T1-N6"]["expected"])

# ---------- T1-M1: (2+i)/(1-i) ----------
z = (2 + i) / (1 - i)
z = sp.simplify(z)
a, b = sp.re(sp.expand(z)), sp.im(sp.expand(z))
recalc("T1-M1", sp.simplify(a + sp.I*b), E["T1-M1"]["expected"])

# ---------- T1-M2: |z| y arg(z) con z = -sqrt(3) + i ----------
z = -sp.sqrt(3) + sp.I
mod = sp.sqrt(sp.re(z)**2 + sp.im(z)**2)          # 2
arg = sp.arg(z)                                    # 5*pi/6 (rama principal)
recalc("T1-M2.mod", mod, E["T1-M2"]["fields"]["mod"]["expected"])
recalc("T1-M2.arg", sp.simplify(arg), E["T1-M2"]["fields"]["arg"]["expected"])

# ---------- T1-M3: (1+i)^8 ----------
recalc("T1-M3", sp.expand((1 + sp.I)**8), E["T1-M3"]["expected"])

# ---------- T1-M4: raíces cúbicas de 8 ----------
roots = sp.roots(sp.Symbol("x")**3 - 8, sp.Symbol("x"))
# sympy da raíces simbólicas; mejor: 2*exp(2*pi*I*k/3)
x = sp.Symbol("x")
sols = [sp.expand_complex(2 * sp.exp(2*sp.pi*sp.I*k/3)) for k in range(3)]
sols = [sp.simplify(sp.re(s) + sp.I*sp.im(s)) for s in sols]
recalc_set("T1-M4", sols, E["T1-M4"]["expected"])

# ---------- T1-M5: ¿sqrt(z^2)=z para todo z? (bool) ----------
# contraejemplo z=-1: sqrt(1)=1 != -1 -> False
z0 = -1
sqrt_z2 = sp.sqrt(z0**2)   # 1
res = (sqrt_z2 == z0)      # False
recalc("T1-M5", int(bool(res)), int(E["T1-M5"]["expected"]))

# ---------- T1-E1: 1011.101_2 ----------
val = 1*8 + 0*4 + 1*2 + 1 + sp.Rational(1,2) + sp.Rational(1,8)  # 11 + 5/8
val = 8 + 2 + 1 + sp.Rational(5, 8)
assert val == sp.Rational(93, 8)
recalc("T1-E1", val, E["T1-E1"]["expected"])

# ---------- T1-E2: z=1+sqrt(3)i -> |z|, arg, z^3 ----------
z = 1 + sp.sqrt(3)*sp.I
mod = sp.sqrt(1 + 3)                       # 2
arg = sp.arg(z)                            # pi/3
z3 = sp.expand_complex(z**3)               # -8
recalc("T1-E2.mod", mod, E["T1-E2"]["fields"]["mod"]["expected"])
recalc("T1-E2.arg", sp.simplify(arg), E["T1-E2"]["fields"]["arg"]["expected"])
recalc("T1-E2.cub", sp.simplify(z3), E["T1-E2"]["fields"]["cub"]["expected"])

# ---------- T1-E3: raíces cuartas de 16 ----------
sols = [sp.expand_complex(2 * sp.exp(2*sp.pi*sp.I*k/4)) for k in range(4)]
sols = [sp.simplify(sp.re(s) + sp.I*sp.im(s)) for s in sols]
recalc_set("T1-E3", sols, E["T1-E3"]["expected"])

# ---------- T1-E4: (e^{i pi/3} - e^{-i pi/3})/(2i) ----------
w = (sp.exp(sp.I*sp.pi/3) - sp.exp(-sp.I*sp.pi/3)) / (2*sp.I)
recalc("T1-E4", sp.simplify(sp.re(w)), E["T1-E4"]["expected"])

print(f"\nTEMA-1: {ok} OK, {fail} FALLOS")
sys.exit(1 if fail else 0)
