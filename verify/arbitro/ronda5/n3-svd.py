"""ÁRBITRO R5 · N3 — SVD/pseudoinversa sobre ℂ.
(1) Auditoría de emplazamientos: dónde queda V^{⊤} (falso sobre K⊇ℂ) y dónde V^{*}.
    tema-5.js se escanea en RUNTIME (strings ya unescaped); html/md en crudo.
(2) Verificación simbólica INDEPENDIENTE de las fórmulas afirmadas:
    A = UΣV*,  A† = VΣ⁻¹U*,  σi = sqrt(λi(A*A)),  P = UrUr*,  A†A = VrVr*,
    contraste con la fórmula antigua VΣ⁻¹U^{⊤} (FALLA Penrose sobre ℂ) y el
    contraejemplo de hermiticidad/idempotencia de UrUr^{⊤}.
"""
import json
import re
import subprocess
import sympy as sp
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ok = 0
fails = []


def chk(label, cond, detail=""):
    global ok
    if cond:
        ok += 1
        print(f"[OK ] {label} {detail}")
    else:
        fails.append(label)
        print(f"[FALLO] {label} {detail}")


# ---------- (1) emplazamientos ----------
print("=== (1) Emplazamientos con V^top / V^* ===")
RE_TOP = re.compile(r"U[\\]+Sigma V\^\{?[\\]?top\}?|U_\{?r\}[\\]+Sigma_\{?r\}V_\{?r\}\^\{?[\\]?top\}?|V[\\]+Sigma\^\{?-1\}?U\^\{?[\\]?top\}?|V_\{?r\}[\\]+Sigma_\{?r\}\^\{?-1\}?U_\{?r\}\^\{?[\\]?top\}?|U_\{?r\}U_\{?r\}\^\{?[\\]?top\}?|V_\{?r\}V_\{?r\}\^\{?[\\]?top\}?")
RE_OK = re.compile(r"U[\\]+Sigma V\^\{\*\}|V[\\]+Sigma\^\{-1\}U\^\{\*\}|U_\{?r\}?U_\{?r\}?\^\{\*\}|V_\{?r\}?V_\{?r\}?\^\{\*\}|sigma_\{?i\}?[\\]*=*[\\]*sqrt\{?\\*lambda")

def scan(label, txt):
    n_top = n_ok = 0
    for rx, tag in ((RE_TOP, "V^top(FALSO sobre C)"), (RE_OK, "V^*(corregido)")):
        for m in rx.finditer(txt):
            line = txt[:m.start()].count("\n") + 1
            s = max(0, m.start() - 55)
            print(f"  [{tag}] {label}:{line}: ...{txt[s:m.end()+25]}...".replace("\n", " "))
            if tag.startswith("V^top"):
                n_top += 1
            else:
                n_ok += 1
    return n_top, n_ok

# tema-5.js en runtime
js = subprocess.run(
    ["node", "-e", """
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('assets/data/tema-5.js','utf8');
const sb={window:{}};vm.createContext(sb);vm.runInContext(src,sb);
console.log(JSON.stringify(sb.window.CURSO_DATA));
"""], capture_output=True, text=True, cwd=ROOT).stdout
scan("tema-5.js(runtime)", js)
scan("tema-5.html", (ROOT / "temas/tema-5.html").read_text(encoding="utf8"))
scan("schema.md", (ROOT / "docs/schema.md").read_text(encoding="utf8"))

# ---------- (2) verificación simbólica ----------
print("\n=== (2) Verificación simbólica sobre ℂ ===")
I = sp.I
sqrt2 = sp.sqrt(2)

U = sp.Matrix([[1, I], [I, 1]]) / sqrt2
chk("U = 1/√2[[1,i],[i,1]] es unitaria: U U* = I", sp.simplify(U * U.conjugate().T) == sp.eye(2))
P = U * U.T  # U U^{top} (fórmula antigua)
chk("U U^top NO hermítica (contrasejemplo N3)", sp.simplify(P.conjugate().T - P) != sp.zeros(2))
chk("U U^top NO idempotente (contrasejemplo N3)", sp.simplify(P * P - P) != sp.zeros(2))
Pstar = U * U.conjugate().T
chk("U U* hermítica e idempotente (fórmula corregida)",
    sp.simplify(Pstar.conjugate().T - Pstar) == sp.zeros(2) and sp.simplify(Pstar * Pstar - Pstar) == sp.zeros(2))

# V unitaria COMPLEJA genuina (no simétrica): 1/√2[[1,1],[i,-i]]
V = sp.Matrix([[1, 1], [I, -I]]) / sqrt2
chk("V = 1/√2[[1,1],[i,-i]] es unitaria: V V* = I", sp.simplify(V * V.conjugate().T) == sp.eye(2))
Sig = sp.diag(3, 1)
A = U * Sig * V.conjugate().T
Adag = V * Sig.inv() * U.conjugate().T          # fórmula corregida: V Σ⁻¹ U*
Adag_old = V * Sig.inv() * U.T                   # fórmula antigua: V Σ⁻¹ U^top

def penrose(M, A):
    return (sp.simplify(A * M * A - A) == sp.zeros(*A.shape)
            and sp.simplify(M * A * M - M) == sp.zeros(*M.shape)
            and sp.simplify((A * M).conjugate().T - A * M) == sp.zeros(*A.shape)
            and sp.simplify((M * A).conjugate().T - M * A) == sp.zeros(*M.shape))

chk("A = UΣV* (definición corregida)", sp.simplify(U * Sig * V.conjugate().T - A) == sp.zeros(2))
chk("A† = VΣ⁻¹U* cumple las 4 ecuaciones de Penrose", penrose(Adag, A))
chk("A† = VΣ⁻¹U^top (antigua) FALLA Penrose sobre ℂ", not penrose(Adag_old, A))

Pcol = U * U.conjugate().T
chk("P = UrUr* es proyección sobre col(A): P·A = A", sp.simplify(Pcol * A - A) == sp.zeros(2))
chk("A†A = VrVr* hermítica e idempotente",
    sp.simplify((Adag * A).conjugate().T - Adag * A) == sp.zeros(2)
    and sp.simplify((Adag * A) ** 2 - Adag * A) == sp.zeros(2))
chk("A†A = VrVr* coincide con V V*", sp.simplify(Adag * A - V * V.conjugate().T) == sp.zeros(2))

# σi = sqrt(λi(A*A)): con A = UΣV* unitario ⇒ A*A = V Σ² V*, λ = {9,1}, σ = {3,1}
AstarA = sp.simplify(A.conjugate().T * A)
eigs = sorted(AstarA.eigenvals().keys(), key=lambda e: -sp.re(sp.N(e, 15)))
chk("λ(A*A) = {9,1}", [sp.simplify(e) for e in eigs], [sp.Integer(9), sp.Integer(1)])
chk("σi = sqrt(λi(A*A)) = {3,1} = diag(Σ)", [sp.sqrt(sp.simplify(e)) for e in eigs], [sp.Integer(3), sp.Integer(1)])

print(f"\nRESUMEN N3: {ok} OK, {len(fails)} FALLOS {fails if fails else ''}")
raise SystemExit(1 if fails else 0)
