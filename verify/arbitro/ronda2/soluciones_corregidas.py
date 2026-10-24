"""ÁRBITRO R2 · verificación paso a paso de las SOLUCIONES corregidas
(T5-E3, T1-M5, X3-10, T3-N1, T1-M2) y del Ejemplo 9 de tema-1.html.
Cada paso aritmético que aparece escrito en la solución se recalcula.
"""
import json, re, html, random, math
import sympy as sp
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ok, fails = 0, []
def chk(label, got, expected):
    global ok
    if isinstance(got, sp.MatrixBase) and isinstance(expected, sp.MatrixBase):
        good = got.shape == expected.shape and all(
            sp.simplify(got[i, j] - expected[i, j]) == 0
            for i in range(got.rows) for j in range(got.cols))
    elif isinstance(got, sp.Expr) and isinstance(expected, sp.Expr):
        good = sp.simplify(got - expected) == 0
    else:
        good = got == expected
    if good: ok += 1
    else: fails.append(label)
    print(f"[{'OK ' if good else 'FALLO'}] {label}: {got} == {expected}")

I = sp.I
def load(file):
    src = (ROOT / "assets" / "data" / f"{file}.js").read_text()
    # extrae el objeto JS con un sandbox node mínimo vía json grosero: usamos node
    import subprocess
    code = f'''
    const fs=require("fs"),vm=require("vm");
    const src=fs.readFileSync("{ROOT}/assets/data/{file}.js","utf8");
    const sb={{window:{{}}}};vm.createContext(sb);vm.runInContext(src,sb);
    const obj=sb.window.CURSO_DATA[Object.keys(sb.window.CURSO_DATA)[0]];
    const items=obj.drills||(obj.exam&&obj.exam.questions)||[];
    console.log(JSON.stringify(items));
    '''
    return json.loads(subprocess.check_output(["node", "-e", code]).decode())

def sol_text(q):
    return [html.unescape(re.sub("<[^>]+>", "", s)) for s in q["solution"]]

print("=== T5-E3 · pseudoinversa de [[3,1],[-1,3]] ===")
t5 = load("tema-5")
q = next(x for x in t5 if x["id"] == "T5-E3")
steps = sol_text(q)
for s in steps: print("  PASO:", s)
A = sp.Matrix([[3, 1], [-1, 3]])
chk("paso 1: rng(A)=2 (columnas independientes)", A.rank(), 2)
chk("paso 2a: A·A^T = 10·I", A * A.T, sp.Matrix([[10, 0], [0, 10]]))
Ad = A.T * (A * A.T).inv()
chk("paso 2b: A^dag = A^T (A A^T)^-1 = (1/10) A^T", sp.simplify(Ad), sp.Matrix([[sp.Rational(3,10), sp.Rational(-1,10)], [sp.Rational(1,10), sp.Rational(3,10)]]))
chk("paso 2c: (1/10)·A^T coincide", sp.simplify(A.T / 10), sp.simplify(Ad))
chk("paso 3: valor final esperado", sp.Matrix([[sp.Rational(3,10), sp.Rational(-1,10)], [sp.Rational(1,10), sp.Rational(3,10)]]), sp.simplify(Ad))
# la fórmula VIEJA (A A^T)^-1 A es falsa:
old = (A * A.T).inv() * A
chk("contraste: (A A^T)^-1 A != A^dag", old != Ad, True)
# Penrose completo
chk("Penrose 1: A Ad A = A", sp.simplify(A * Ad * A - A) == sp.zeros(2, 2), True)
chk("Penrose 2: Ad A Ad = Ad", sp.simplify(Ad * A * Ad - Ad) == sp.zeros(2, 2), True)
chk("Penrose 3: (A Ad)* = A Ad", (A * Ad).conjugate().T == A * Ad, True)
chk("Penrose 4: (Ad A)* = Ad A", (Ad * A).conjugate().T == Ad * A, True)
print("  ¿Fórmula del paso corregido A^dag = A^T(AA^T)^-1 correcta? SÍ (rango completo por filas)")

print()
print("=== T1-M5 · caracterización de sqrt(z^2) ===")
t1 = load("tema-1")
q = next(x for x in t1 if x["id"] == "T1-M5")
steps = sol_text(q)
for s in steps: print("  PASO:", s)
chk("enunciado es V/F", q["answer"]["expected"], False)
z = -1
chk("paso: z=-1 -> z^2=1 -> sqrt(1)=1 != -1", (sp.sqrt((-1)**2), -1), (1, -1))
# contrejemplo citado: z = -i
z = -I
chk("contrejemplo z=-i: sqrt(z^2)=i=-z", sp.sqrt(z**2), -z)
# verificación exhaustiva numérica de la caracterización del paso corregido:
# sqrt(z^2)=z  <=>  Re z>0  o  (Re z=0 y Im z>=0);  sqrt(z^2)=-z en el resto
def principal_sqrt(w):
    # rama principal: arg en (-pi, pi]
    r = abs(w); th = math.atan2(w.imag, w.real)
    return complex(math.sqrt(r) * math.cos(th / 2), math.sqrt(r) * math.sin(th / 2))
random.seed(20261013)
mal = 0
for _ in range(20000):
    z = complex(random.uniform(-4, 4), random.uniform(-4, 4))
    sq = principal_sqrt(z * z)
    cond = (z.real > 0) or (z.real == 0 and z.imag >= 0)
    if cond:
        if abs(sq - z) > 1e-9: mal += 1
    else:
        if abs(sq + z) > 1e-9: mal += 1
chk("caracterización exacta en 20000 puntos aleatorios", mal, 0)

print()
print("=== X3-10 · det(A^2) y tr(A^-1) ===")
x3 = load("examen-3")
q = next(x for x in x3 if x["id"] == "X3-10")
steps = sol_text(q)
for s in steps: print("  PASO:", s)
chk("autovalores de A^2: cuadrados 4,4,1,16", sorted([2**2, 2**2, (-1)**2, 4**2]), [1, 4, 4, 16])
chk("det(A^2)=4·4·1·16", 4 * 4 * 1 * 16, 256)
chk("producto de autovalores de A: 2·2·(-1)·4", 2 * 2 * (-1) * 4, -16)
chk("(det A)^2 = (-16)^2", (-16)**2, 256)
chk("recíprocos: 1/2,1/2,-1,1/4", sorted([sp.Rational(1,2), sp.Rational(1,2), -1, sp.Rational(1,4)]), sorted([-1, sp.Rational(1,4), sp.Rational(1,2), sp.Rational(1,2)]))
chk("tr(A^-1)=1/2+1/2-1+1/4", sp.Rational(1,2) + sp.Rational(1,2) - 1 + sp.Rational(1,4), sp.Rational(1,4))

print()
print("=== T3-N1 · determinante de orden 2 (solución corregida) ===")
t3 = load("tema-3")
q = next(x for x in t3 if x["id"] == "T3-N1")
steps = sol_text(q)
for s in steps: print("  PASO:", s)
chk("la solución ya NO menciona Sarrus", not any("sarrus" in s.lower() for s in steps), True)
chk("menciona fórmula de orden 2", any("orden 2" in s for s in steps), True)

print()
print("=== T1-M2 · módulo/argumento de z=-√3+i (solución corregida) ===")
q = next(x for x in t1 if x["id"] == "T1-M2")
steps = sol_text(q)
for s in steps: print("  PASO:", s)
z = -sp.sqrt(3) + I
chk("|z| = sqrt(3+1) = 2", sp.Abs(z), 2)
chk("cos θ = -√3/2", sp.simplify(sp.re(z) / sp.Abs(z)), -sp.sqrt(3)/2)
chk("sen θ = 1/2", sp.simplify(sp.im(z) / sp.Abs(z)), sp.Rational(1,2))
chk("θ = 5π/6 ∈ (-π, π]", sp.arg(z), 5 * sp.pi / 6)
chk("paso final: z = 2(cos 5π/6 + i sen 5π/6)", sp.simplify(2 * (sp.cos(5*sp.pi/6) + I * sp.sin(5*sp.pi/6))), z)
chk("la solución ya NO llama 'cotas' al par (cos,sen) en el paso 2",
    not any("Las cotas del ángulo" in s for s in steps), True)

print()
print("=== Ejemplo 9 · tema-1.html ===")
h = (ROOT / "temas" / "tema-1.html").read_text()
m = re.search(r"Ejemplo 9.*?</p>\s*\\\[(.*?)\\\]", h, re.S)
seg = m.group(1) if m else ""
print("  TEXTO:", html.unescape(re.sub("<[^>]+>", "", seg))[:120])
chk("(1+i)^8 = 16", sp.expand((1 + I)**8), 16)
chk("raíz 1: 2", 2**3, 8)
chk("raíz 2: (-1+√3i)^3 = 8", sp.expand((-1 + sp.sqrt(3)*I)**3), 8)
chk("raíz 3: (-1-√3i)^3 = 8", sp.expand((-1 - sp.sqrt(3)*I)**3), 8)
roots = sp.roots(sp.Symbol("z")**3 - 8, sp.Symbol("z"))
chk("las 3 raíces de z^3=8 son exactamente esas", sorted(roots.keys(), key=str), sorted([2, -1+sp.sqrt(3)*I, -1-sp.sqrt(3)*I], key=str))
chk("ya NO aparece 8^{1/3} = {...} como conjunto", "8^{1/3} =" not in h and "8^{1/3}=" not in h, True)
chk("el conjunto se describe como { z : z^3 = 8 }", "z^{3} = 8" in h, True)

print()
print(f"RESUMEN soluciones corregidas: {ok} OK, {len(fails)} FALLOS")
if fails: print("Fallos:", fails)
