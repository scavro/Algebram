# -*- coding: utf-8 -*-
"""ÁRBITRO R8 · recálculo independiente de 10 ejercicios con sympy 1.11.
Compara el resultado simbólico con el `answer.expected` del curso (extraído
de verify/arbitro/ronda7/expected-r7.json). Salida: sympy-r9-math.json + stdout."""
import json, re, sys, pathlib
import sympy as sp

EXPECT = json.load(open(pathlib.Path(__file__).parent / ".." / "ronda7" / "expected-r7.json"))
def spec(qid):
    for items in EXPECT.values():
        for q in items:
            if q["id"] == qid:
                return q["answer"]
    raise KeyError(qid)

ok = 0; fail = 0; detalle = {}

def check(qid, obtenido, esperado):
    """compara sp.Expr / listas / strings canónicamente"""
    global ok, fail
    def canon(x):
        if isinstance(x, sp.Expr):
            return sp.simplify(x)
        return x
    if isinstance(esperado, list):
        bien = all(sp.simplify(sp.sympify(str(a)) - sp.sympify(str(b))) == 0
                   for a, b in zip(obtenido, esperado)) and len(obtenido) == len(esperado)
    else:
        bien = sp.simplify(sp.sympify(str(obtenido)) - sp.sympify(str(esperado))) == 0
    detalle[qid] = {"obtenido": str(obtenido), "esperado": str(esperado), "ok": bool(bien)}
    print(("OK  " if bien else "FALLO") + f" | {qid}: obtenido={obtenido} esperado={esperado}")
    ok += bien; fail += (not bien)

I = sp.I
pi = sp.pi

# T1-N6 · (3+4i)(2−i) = 10+5i
z = (3 + 4*I) * (2 - I)
check("T1-N6", sp.expand(z), sp.sympify(spec("T1-N6")["expected"]).subs(sp.Symbol("i"), I))

# T1-M1 · (2+i)/(1−i) = 1/2 + 3/2 i
z = (2 + I) / (1 - I)
check("T1-M1", sp.simplify(z), sp.Rational(1, 2) + sp.Rational(3, 2)*I)

# T1-M2 · z = −√3 + i → |z| = 2, arg = 5π/6
z = -sp.sqrt(3) + I
check("T1-M2-mod", sp.Abs(z), 2)
check("T1-M2-arg", sp.arg(z), 5*pi/6)

# T1-M3 · (1+i)^8 = 16
check("T1-M3", sp.expand((1 + I)**8), 16)

# T1-M4 · raíces cúbicas de 8: 2, −1±√3 i
rts = [sp.expand(r) for r in sp.roots(sp.Symbol("z")**3 - 8)]
esperado = [2, -1 + sp.sqrt(3)*I, -1 - sp.sqrt(3)*I]
bien = all(any(sp.simplify(a - b) == 0 for b in esperado) for a in rts) and len(rts) == 3
detalle["T1-M4"] = {"obtenido": str(rts), "esperado": str(esperado), "ok": bool(bien)}
print(("OK  " if bien else "FALLO") + f" | T1-M4: obtenido={rts} esperado={esperado}")
ok += bien; fail += (not bien)

# T2-N2 · AB con A 2×3, B 3×2 = [[2,7],[8,8]]
A = sp.Matrix([[1, 2, 0], [3, 1, 2]])
B = sp.Matrix([[2, 1], [0, 3], [1, 1]])
M = A * B
esp = sp.Matrix([[2, 7], [8, 8]])
bien = M == esp
detalle["T2-N2"] = {"obtenido": str(M.tolist()), "esperado": str(esp.tolist()), "ok": bool(bien)}
print(("OK  " if bien else "FALLO") + f" | T2-N2: obtenido={M.tolist()} esperado={esp.tolist()}")
ok += bien; fail += (not bien)

# T2-M2 · inversa de [[1,2,3],[0,1,4],[5,6,0]]
A = sp.Matrix([[1, 2, 3], [0, 1, 4], [5, 6, 0]])
M = A.inv()
esp = sp.Matrix([[-24, 18, 5], [20, -15, -4], [-5, 4, 1]])
bien = M == esp
detalle["T2-M2"] = {"obtenido": str(M.tolist()), "esperado": str(esp.tolist()), "ok": bool(bien)}
print(("OK  " if bien else "FALLO") + f" | T2-M2: obtenido={M.tolist()} esperado={esp.tolist()}")
ok += bien; fail += (not bien)

# T4-N3 · x+y+z=4, 2x+2y+2z=8 → x = 4−s−t (y=s, z=t)
s, t = sp.symbols("s t")
sol = sp.linsolve((sp.Symbol("x") + s + t - 4, 2*sp.Symbol("x") + 2*s + 2*t - 8), sp.Symbol("x"))
obtenido = list(sol)[0][0]
esp = 4 - s - t
bien = sp.simplify(obtenido - esp) == 0
detalle["T4-N3"] = {"obtenido": str(obtenido), "esperado": str(esp), "ok": bool(bien)}
print(("OK  " if bien else "FALLO") + f" | T4-N3: obtenido={obtenido} esperado={esp}")
ok += bien; fail += (not bien)

# T5-E3 · pinv de [[3,1],[-1,3]] = [[3/10,-1/10],[1/10,3/10]]
A = sp.Matrix([[3, 1], [-1, 3]])
M = A.pinv()
esp = sp.Matrix([[sp.Rational(3, 10), sp.Rational(-1, 10)],
                 [sp.Rational(1, 10), sp.Rational(3, 10)]])
bien = M == esp
detalle["T5-E3"] = {"obtenido": str(M.tolist()), "esperado": str(esp.tolist()), "ok": bool(bien)}
print(("OK  " if bien else "FALLO") + f" | T5-E3: obtenido={M.tolist()} esperado={esp.tolist()}")
ok += bien; fail += (not bien)

# X3-10 · A 4×4 invertible, autovalores 2,2,−1,4 → det(A²)=256, tr(A⁻¹)=1/4
eigs = [2, 2, -1, 4]
detA = sp.prod(eigs)
det2 = detA**2
trinv = sum(sp.Rational(1, e) for e in eigs)
esp_det2 = spec("X3-10")["fields"]["det2"]["expected"]
esp_trinv = spec("X3-10")["fields"]["trinv"]["expected"]
bien = det2 == int(esp_det2) and sp.simplify(trinv - sp.sympify(esp_trinv)) == 0
detalle["X3-10"] = {"obtenido": f"det2={det2}, trinv={trinv}",
                    "esperado": f"det2={esp_det2}, trinv={esp_trinv}", "ok": bool(bien)}
print(("OK  " if bien else "FALLO") + f" | X3-10: obtenido=det2={det2},trinv={trinv} " +
      f"esperado=det2={esp_det2},trinv={esp_trinv}")
ok += bien; fail += (not bien)

# T1-E4 · (e^{iπ/3} − e^{−iπ/3})/(2i) = sin(π/3) = √3/2
w = sp.expand_complex((sp.exp(I*pi/3) - sp.exp(-I*pi/3)) / (2*I))
bien = sp.simplify(w - sp.sqrt(3)/2) == 0 or abs(complex(w - sp.sqrt(3)/2)) < 1e-12
detalle["T1-E4"] = {"obtenido": str(sp.simplify(w)), "esperado": "sqrt(3)/2", "ok": bool(bien)}
print(("OK  " if bien else "FALLO") + f" | T1-E4: obtenido={sp.simplify(w)} esperado=sqrt(3)/2")
ok += bien; fail += (not bien)

json.dump({"ok": int(ok), "fail": int(fail), "detalle": detalle},
          open(pathlib.Path(__file__).parent / "sympy-r9-math.json", "w"), indent=1, ensure_ascii=False)
print(f"\nRESUMEN sympy: {ok} OK · {fail} FALLOS (10 ejercicios, 11 comprobaciones)")
sys.exit(1 if fail else 0)
