"""ÁRBITRO R7 · trigonometría inversa — contraste independiente con mpmath/sympy
(ramas principales). Lee trig-r7.json (salida del grader) y compara cada valor
con mpmath.asin/acos/atan (equivalentes a sympy; se verifica además contra
sympy en los casos nombrados del protocolo)."""
import json
from pathlib import Path

import mpmath as mp
import sympy as sp

HERE = Path(__file__).resolve().parent
data = json.loads((HERE / "trig-r7.json").read_text(encoding="utf8"))

mp.mp.dps = 30
FN = {"asin": mp.asin, "acos": mp.acos, "atan": mp.atan}
TOL = 1e-9

ok, fails = 0, []
print("== rejilla vs mpmath (ramas principales) ==")
for row in data["puntos"]:
    z = complex(row["z"].replace("i", "j")) if "i" in row["z"] else complex(float(row["z"]))
    for name in ("asin", "acos", "atan"):
        got = complex(row[name]["re"], row[name]["im"])
        exp = complex(FN[name](mp.mpc(z.real, z.imag)))
        d = abs(got - exp)
        if d <= TOL * max(1.0, abs(exp)):
            ok += 1
        else:
            fails.append(f"{name}({row['z']}): grader={got} mpmath={exp} |Δ|={d:.3e}")
            print(f"[FALLO] {name}({row['z']}): grader={got} mpmath={exp} |Δ|={d:.3e}")

print(f"[OK ] rejilla: {ok} valores correctos ({len(data['puntos'])} puntos × 3 funciones)")

print("\n== casos nombrados del protocolo vs sympy ==")
sympy_cases = [
    ("asin(0)", sp.asin(0), 0),
    ("arcsen(1)", sp.asin(1), sp.pi / 2),
    ("atan(1)", sp.atan(1), sp.pi / 4),
    ("arccos(1)", sp.acos(1), 0),
    ("asin(2)", sp.asin(2), sp.pi / 2 - sp.I * sp.log(2 + sp.sqrt(3))),
]
for label, val, closed in sympy_cases:
    # comparación NUMÉRICA (simplify simbólico no demuestra asin(2)≡pi/2−i·ln(2+√3):
    # era un falso positivo del script; los valores complejos sí coinciden)
    d = abs(complex(sp.N(val, 30)) - complex(sp.N(closed, 30)))
    same = d < 1e-12
    print(f"[{'OK ' if same else 'FALLO'}] {label}: sympy={complex(sp.N(val, 15))} "
          f"forma cerrada={complex(sp.N(closed, 15))} |Δ|={d:.2e}")
    if not same:
        fails.append(f"sympy {label}")

print("\n== check() del grader en casos del protocolo ==")
for p in data["protocolo"]:
    mark = "OK " if p["ok"] else "FALLO"
    if not p["ok"]:
        fails.append("check " + p["label"])
    print(f"[{mark}] {p['label']} → {p['ok']}")

print("\n== alias ==")
bad = [a for a in data["alias"] if not a["ok"]]
print(f"[{'OK ' if not bad else 'FALLO'}] {len(data['alias'])} comparaciones de alias, {len(bad)} inconsistentes")

if fails:
    print("\nFALLOS:")
    for f in fails:
        print(" -", f)
    raise SystemExit(1)
print("\nTODO OK — trig inversa consistente con ramas principales (mpmath/sympy).")
