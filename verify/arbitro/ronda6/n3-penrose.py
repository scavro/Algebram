"""ÁRBITRO R6 · N3r — verificación simbólica/numérica de la demo de Prop 5.21
tras la corrección a V_r^*, U_r^* (tema-5.html §5.10 l.454 y demo l.464).

Se reconstruye SVD compacta sobre ℂ con numpy (independiente del curso) y se
comprueba EXACTAMENTE (aritmética racional en sympy cuando el caso es exacto,
y numéricamente con error acotado en el caso general):

  (1) La cadena de la demo:  AA†A = U_r Σ_r (V_r^* V_r) Σ_r^{-1} (U_r^* U_r) Σ_r V_r^* = A
  (2) A†AA† = A†
  (3) (AA†)^* = AA†   y   (A†A)^* = A†A
  (4) P = U_r U_r^* hermítica e idempotente;  A†A = V_r V_r^* hermítica e idempotente
  (5) A* A A† = A*   (ecuaciones normales de la última línea de la demo)
  (6) CONTRASTE: la fórmula antigua A† = V_r Σ_r^{-1} U_r^⊤ FALLA las 4
      ecuaciones de Penrose sobre ℂ (y demostrar que el cambio era necesario).
  (7) Contraste: U_r U_r^⊤ no hermítica ni idempotente sobre ℂ.
  (8) σ_i = sqrt(λ_i(A^* A)) en un caso exacto.
  (9) Lectura literal de los emplazamientos corregidos en tema-5.html/schema.md.
"""
import numpy as np
import sympy as sp

np.random.seed(20261014 + 6)
ok, fails = 0, []


def chk(label, cond, detail=""):
    global ok
    if cond:
        ok += 1
        print(f"[OK ] {label}")
    else:
        fails.append(label)
        print(f"[FALLO] {label} {detail}")


def conjT(M):
    return M.conj().T


def is_herm(M, tol=1e-10):
    return np.allclose(M, conjT(M), atol=tol)


def is_idem(M, tol=1e-10):
    return np.allclose(M @ M, M, atol=tol)


def penrose(A, Ad, tol=1e-9):
    """4 ecuaciones de Moore-Penrose."""
    r1 = np.allclose(Ad @ A @ Ad, Ad, atol=tol)
    r2 = np.allclose(A @ Ad @ A, A, atol=tol)
    r3 = is_herm(A @ Ad, tol)
    r4 = is_herm(Ad @ A, tol)
    return r1 and r2 and r3 and r4


def compact_svd(A):
    """SVD compacta A = U_r Σ_r V_r^* (numpy)."""
    U, s, Vh = np.linalg.svd(A, full_matrices=False)
    r = int(np.sum(s > 1e-12 * max(s[0], 1.0)))
    return U[:, :r], np.diag(s[:r]), Vh[:r, :].conj().T  # V_r


# ---------- (9) lectura de los emplazamientos corregidos ----------
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
html = (ROOT / "temas" / "tema-5.html").read_text(encoding="utf8")
schema = (ROOT / "docs" / "schema.md").read_text(encoding="utf8")

chk("§5.10 usa A = U_r Σ_r V_r^*",
    "A = U_{r}\\Sigma_{r}V_{r}^{*}" in html and "U_{r}\\Sigma_{r}V_{r}^{\\top}" not in html)
chk("§5.10 usa A† = V_r Σ_r^{-1} U_r^*",
    "A^{\\dagger} = V_{r}\\Sigma_{r}^{-1}U_{r}^{*}" in html)
chk("demo Prop 5.21 sustituye con V_r^*, U_r^*",
    "Sustituyendo \\(A = U_{r}\\Sigma_{r}V_{r}^{*}\\) y \\(A^{\\dagger} = V_{r}\\Sigma_{r}^{-1}U_{r}^{*}\\)" in html)
chk("demo: cadena V_r^*V_r y U_r^*U_r (válida en ℂ)",
    "V_{r}^{*}V_{r}" in html and "U_{r}^{*}U_{r}" in html
    and "V_{r}^{\\top}V_{r}" not in html and "U_{r}^{\\top}U_{r}" not in html)
chk("sin restos V^⊤ / U^⊤ con Σ_r en tema-5.html",
    "Sigma_{r}V_{r}^{\\top}" not in html and "Sigma_{r}^{-1}U_{r}^{\\top}" not in html)
chk("schema.md §5: A=UΣV^* con nota V^*=V^⊤ real",
    "SVD \\(A=U\\Sigma V^{*}\\) (con \\(V^{*}=V^{\\top}\\) en el caso real)" in schema)
chk("schema.md sin V^⊤ en SVD",
    "U\\Sigma V^{\\top}" not in schema)
chk("conclusión demo: P=U_rU_r^* y A†A=V_rV_r^*",
    "P = U_{r}U_{r}^{*}" in html and "A^{\\dagger}A = V_{r}V_{r}^{*}" in html)

# ---------- (1)–(7) sobre ℂ ----------
print("\n-- casos complejos aleatorios (5 matrices 3×4, 4×2, 2×3 de rango completo/defectuoso) --")
shapes = [(3, 4), (4, 2), (2, 3), (3, 3), (5, 2)]
for idx, (m, n) in enumerate(shapes):
    A = (np.random.randn(m, n) + 1j * np.random.randn(m, n))
    if idx == 3:
        A[:, 2] = A[:, 0] + 1j * A[:, 1]  # rango defectuoso
    Ur, Sr, Vr = compact_svd(A)
    r = Ur.shape[1]
    SigInv = np.diag(1.0 / np.diag(Sr))
    Ad = Vr @ SigInv @ conjT(Ur)          # fórmula corregida: U_r^*
    Ad_old = Vr @ SigInv @ Ur.T           # fórmula antigua: U_r^⊤

    P = Ur @ conjT(Ur)
    Q = Vr @ conjT(Vr)
    chk(f"[{m}×{n} r={r}] (1) cadena AA†A = A", np.allclose(Ad @ A @ Ad, Ad, atol=1e-9)
        and np.allclose(A @ Ad @ A, A, atol=1e-9))
    chk(f"[{m}×{n} r={r}] (1b) AA†A = U_r Σ_r (V_r^*V_r) Σ_r^-1 (U_r^*U_r) Σ_r V_r^*",
        np.allclose(Vr.conj().T @ Vr, np.eye(r), atol=1e-9)
        and np.allclose(Ur.conj().T @ Ur, np.eye(r), atol=1e-9))
    chk(f"[{m}×{n} r={r}] (2) A†AA† = A†", np.allclose(Ad @ A @ Ad, Ad, atol=1e-9))
    chk(f"[{m}×{n} r={r}] (3) (AA†)^*=AA† y (A†A)^*=A†A", penrose(A, Ad))
    chk(f"[{m}×{n} r={r}] (4) P=U_rU_r^* hermítica e idempotente",
        is_herm(P) and is_idem(P) and np.allclose(A @ Ad, P, atol=1e-9))
    chk(f"[{m}×{n} r={r}] (4b) A†A=V_rV_r^* hermítica e idempotente",
        is_herm(Q) and is_idem(Q) and np.allclose(Ad @ A, Q, atol=1e-9))
    chk(f"[{m}×{n} r={r}] (5) A*AA† = A* (normales)", np.allclose(conjT(A) @ A @ Ad, conjT(A), atol=1e-9))
    chk(f"[{m}×{n} r={r}] (6) CONTRASTE U_r^⊤ FALLA Penrose", not penrose(A, Ad_old))
    chk(f"[{m}×{n} r={r}] (7) U_rU_r^⊤ no hermítica", not is_herm(Ur @ Ur.T))

# ---------- (1) exacto en sympy (demo línea a línea) ----------
print("\n-- caso exacto sympy: cadena de la demo Prop 5.21 --")
a, b = sp.I, 1 - sp.I
A = sp.Matrix([[a, 0, b], [0, b, 0]])  # 2×3 compleja de rango 2
# SVD exacta vía A^*A
AtA = A.conjugate().T * A
lam = [sp.nsimplify(z) for z in AtA.eigenvals().keys() if sp.re(z) > 0]
lam.sort(key=lambda z: (float(sp.re(z)), float(sp.im(z))))
print("  λ(A^*A) =", lam)
sig = [sp.sqrt(z) for z in lam]
Sr = sp.diag(*sig)
# V_r: autovectores de A^*A (ortonormalizados)
vecs = []
for z in lam:
    v = (AtA - z * sp.eye(3)).nullspace()
    vecs += v
# Gram-Schmidt exacto
def gs(vs):
    out = []
    for v in vs:
        w = v
        for u in out:
            w = w - (u.conjugate().T * v)[0] * u
        nrm = sp.sqrt((w.conjugate().T * w)[0])
        out.append(sp.simplify(w / nrm))
    return out
Vr = sp.Matrix.hstack(*gs(vecs))
Ur = sp.simplify(A * Vr * Sr.inv())
Ad = sp.simplify(Vr * Sr.inv() * Ur.conjugate().T)
chk("(1) sympy A = U_r Σ_r V_r^*", sp.simplify(A - Ur * Sr * Vr.conjugate().T) == sp.zeros(*A.shape))
chk("(1b) sympy V_r^*V_r = I", sp.simplify(Vr.conjugate().T * Vr - sp.eye(Vr.cols)) == sp.zeros(Vr.cols))
chk("(1c) sympy U_r^*U_r = I", sp.simplify(Ur.conjugate().T * Ur - sp.eye(Ur.cols)) == sp.zeros(Ur.cols))
chk("(2) sympy AA†A = A", sp.simplify(A * Ad * A - A) == sp.zeros(*A.shape))
chk("(2b) sympy A†AA† = A†", sp.simplify(Ad * A * Ad - Ad) == sp.zeros(*Ad.shape))
chk("(3) sympy (AA†)^* = AA†", sp.simplify((A * Ad).conjugate().T - A * Ad) == sp.zeros(A.rows))
chk("(3b) sympy (A†A)^* = A†A", sp.simplify((Ad * A).conjugate().T - Ad * A) == sp.zeros(Ad.rows))
Ad_old = Vr * Sr.inv() * Ur.T
chk("(6) sympy V_rΣ_r^-1U_r^⊤ FALLA Penrose",
    sp.simplify(A * Ad_old * A - A) != sp.zeros(*A.shape)
    or sp.simplify(Ad_old * A * Ad_old - Ad_old) != sp.zeros(*Ad_old.shape))
chk("(5) sympy A*AA† = A*", sp.simplify(A.conjugate().T * A * Ad - A.conjugate().T) == sp.zeros(*A.conjugate().T.shape))

# ---------- (8) σ_i = sqrt(λ_i(A^*A)) ----------
A2 = sp.Matrix([[2, 0], [0, 3]])
eigs = sorted([sp.sqrt(sp.re(z)) for z in (A2.conjugate().T * A2).eigenvals().keys()], key=lambda z: -z)
chk("(8) σ_i = sqrt(λ_i(A^*A)) = {3, 2}", eigs == [sp.Integer(3), sp.Integer(2)])

print(f"\n{ok} OK, {len(fails)} FALLOS")
if fails:
    print("Fallos:", fails)
raise SystemExit(1 if fails else 0)
