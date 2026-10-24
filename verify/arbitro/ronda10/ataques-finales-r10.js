/* ÁRBITRO R10 · ataques finales NUEVOS contra el motor post-fix. N=200 runs/caso.
   Grupos:
     G1_RAMA   identidades de rama compuestas con las reglas nuevas (log(c·u) /
               √(c·u) con c negativo o complejo) — falsas → RECHAZAR; y
               composiciones VERDADERAS de las reglas → ACEPTAR
     G2_POW    (u^a)^b con |a|>1, potencias en bordes ±4096/±4097
     G3_TAN    tan en singularidades y mezclas
     G4_CX     re/im/conj combinados (certificados con descomposición a+bi)
     G5_DOS    monomios en el borde (3999/4001 términos) y DoS (a+b+c+d+e)^4096
   Cada caso lleva su certificación sympy (sympy-ataques-r10.py).
   Salida: ataques-finales-r10-math.json + stdout. */
const G = require("../../../assets/js/grader.js");
const fs = require("fs");
const path = require("path");

const N = 200;
const E = (expected) => ({ type: "expr", expected });
const spec5 = { type: "expr", expected: "5" };
const ACEPTAR = true, RECHAZAR = false;

const CASES = {
  G1_RAMA: [
    /* ---- falsas de rama con c negativo/complejo: deben RECHAZAR ---- */
    ["K1 'log(-4*x)' vs 'log(4*x)+i*pi' — FALSA (depende de arg x)",
      E("log(4*x)+i*pi"), "log(-4*x)", RECHAZAR],
    ["K2 'log(-4*x)' vs 'log(4*x)-i*pi' — FALSA", E("log(4*x)-i*pi"), "log(-4*x)", RECHAZAR],
    ["K3 'log(-2*x)' vs 'log(2)+log(x)+i*pi' — FALSA",
      E("log(2)+log(x)+i*pi"), "log(-2*x)", RECHAZAR],
    ["K4 'log(2i*x)' vs 'log(2)+log(x)+i*pi/2' — FALSA (c complejo)",
      E("log(2)+log(x)+i*pi/2"), "log(2i*x)", RECHAZAR],
    ["K5 'log(-x)' vs 'log(x)+i*pi' — FALSA", E("log(x)+i*pi"), "log(-x)", RECHAZAR],
    ["K6 'log(-4*x)' vs 'log(4*x)' — FALSA (cambio de signo)", E("log(4*x)"), "log(-4*x)", RECHAZAR],
    ["K7 'sqrt(-4*x)' vs '2*sqrt(x)' — FALSA (rama)", E("2*sqrt(x)"), "sqrt(-4*x)", RECHAZAR],
    ["K8 'sqrt(-4*x)' vs '2*i*sqrt(x)' — FALSA (signo ±i según arg)", E("2*i*sqrt(x)"),
      "sqrt(-4*x)", RECHAZAR],
    ["K9 'sqrt(-9*x)' vs '3*sqrt(x)' — FALSA", E("3*sqrt(x)"), "sqrt(-9*x)", RECHAZAR],
    ["K10 'log(-4*x)' vs 'log(4)+log(x)' — FALSA", E("log(4)+log(x)"), "log(-4*x)", RECHAZAR],
    /* ---- composiciones VERDADERAS de las reglas nuevas ---- */
    ["K11 'sqrt(-4*x)' vs '2*sqrt(-x)' — VERDADERA (−4x = 4(−x), 4>0)",
      E("2*sqrt(-x)"), "sqrt(-4*x)", ACEPTAR],
    ["K12 'sqrt(-9*x)' vs '3*sqrt(-x)' — VERDADERA", E("3*sqrt(-x)"), "sqrt(-9*x)", ACEPTAR],
    ["K13 'log(2*x)+log(3)' vs 'log(6*x)' — VERDADERA (6>0)", E("log(6*x)"),
      "log(2*x)+log(3)", ACEPTAR],
    ["K14 'log(2*(3*x))' vs 'log(6*x)' — VERDADERA (compuesta anidada)", E("log(6*x)"),
      "log(2*(3*x))", ACEPTAR],
    ["K15 'log(4*x)/2' vs 'log(2*sqrt(x))' — VERDADERA", E("log(2*sqrt(x))"),
      "log(4*x)/2", ACEPTAR],
    ["K16 'log(4*x)' vs 'log(4)+log(x)' — control (c>0, regla reclamada)",
      E("log(4)+log(x)"), "log(4*x)", ACEPTAR],
  ],
  G2_POW: [
    ["W1 '(x^2)^3' vs 'x^6' — VERDADERA (enteros)", E("x^6"), "(x^2)^3", ACEPTAR],
    ["W2 '(x^3)^2' vs 'x^6' — VERDADERA (enteros)", E("x^6"), "(x^3)^2", ACEPTAR],
    ["W3 '(x^2)^(1/2)' vs 'x' — FALSA (rama)", E("x"), "(x^2)^(1/2)", RECHAZAR],
    ["W4 '(x^4)^(1/2)' vs 'x^2' — FALSA (rama: x=i → 1 vs −1)", E("x^2"),
      "(x^4)^(1/2)", RECHAZAR],
    ["W5 '(x^2)^(1/3)' vs 'x^(2/3)' — FALSA (rama)", E("x^(2/3)"), "(x^2)^(1/3)", RECHAZAR],
    ["W6 '(x^(1/2))^4' vs 'x^2' — VERDADERA (|a|≤1, b entero)", E("x^2"),
      "(x^(1/2))^4", ACEPTAR],
    ["W7 '(x^(1/3))^3' vs 'x' — VERDADERA", E("x"), "(x^(1/3))^3", ACEPTAR],
    ["W8 '(x^(2/3))^(3/2)' vs 'x' — VERDADERA (b no entero; sin wrap de arg)",
      E("x"), "(x^(2/3))^(3/2)", ACEPTAR],
    /* ---- bordes ±4096 ---- */
    ["W9 'x^4096' vs 'x^4095*x' — VERDADERA (borde k=4096)", E("x^4095*x"), "x^4096", ACEPTAR],
    ["W10 'x^(-4096)' vs '1/x^4096' — VERDADERA (borde)", E("1/x^4096"), "x^(-4096)", ACEPTAR],
    ["W11 'x^(-4096)' vs 'x^(-4095)' — FALSA (borde, anti-grind)",
      E("x^(-4095)"), "x^(-4096)", RECHAZAR],
    ["W12 'x^4096' vs 'x^4095' — FALSA (borde)", E("x^4095"), "x^4096", RECHAZAR],
    ["W13 '5+x^(-4096)' vs '5' — FALSA (borde, anti-grind N16r)", spec5, "5+x^(-4096)", RECHAZAR],
    /* ---- bordes ±4097 (fuera del rango reclamado |k|≤4096) ---- */
    ["W14 'x^(-4097)' vs 'x^(-4096)' — FALSA (fuera de rango, anti-grind)",
      E("x^(-4096)"), "x^(-4097)", RECHAZAR],
    ["W15 '5+x^(-4097)' vs '5' — FALSA (fuera de rango)", spec5, "5+x^(-4097)", RECHAZAR],
    ["W16 'x^4097' vs 'x^4098' — FALSA (fuera de rango)", E("x^4098"), "x^4097", RECHAZAR],
    ["W17 'x^4097' vs 'x^4096*x' — VERDADERA (fuera de rango)", E("x^4096*x"), "x^4097", ACEPTAR],
    ["W18 'x^(-4097)' vs '1/x^4097' — VERDADERA (fuera de rango)",
      E("1/x^4097"), "x^(-4097)", ACEPTAR],
  ],
  G3_TAN: [
    ["U1 'tan(x)*cos(x)' vs 'sin(x)' — VERDADERA (meromorfa)", E("sin(x)"),
      "tan(x)*cos(x)", ACEPTAR],
    ["U2 'sin(x)/cos(x)' vs 'tan(x)+2*pi*i' — FALSA", E("tan(x)+2*pi*i"),
      "sin(x)/cos(x)", RECHAZAR],
    ["U3 'sin(x)/cos(y)' vs 'tan(x)' — FALSA", E("tan(x)"), "sin(x)/cos(y)", RECHAZAR],
    ["U4 'tan(x)' vs 'sin(x)*cos(x)' — FALSA", E("sin(x)*cos(x)"), "tan(x)", RECHAZAR],
    ["U5 'tan(pi/4)' vs 1 — VERDADERA (constante)", E("1"), "tan(pi/4)", ACEPTAR],
    ["U6 '5+tan(x)-sin(x)/cos(x)' vs 5 — VERDADERA (tan≡sin/cos)", spec5,
      "5+tan(x)-sin(x)/cos(x)", ACEPTAR],
    ["U7 '5+tan(x)-sin(x)/cos(x)' vs 6 — FALSA", E("6"),
      "5+tan(x)-sin(x)/cos(x)", RECHAZAR],
    ["U8 'tan(x)+tan(-x)' vs 0 — VERDADERA (tan impar)", E("0"), "tan(x)+tan(-x)", ACEPTAR],
    ["U9 '5+tan(x)-tan(x)' vs 5 — VERDADERA", spec5, "5+tan(x)-tan(x)", ACEPTAR],
  ],
  G4_CX: [
    ["C1 're(x)+i*im(x)' vs 'x' — VERDADERA (z=Re z + i Im z)", E("x"),
      "re(x)+i*im(x)", ACEPTAR],
    ["C2 'conj(re(x))' vs 're(x)' — VERDADERA (Re z ∈ R)", E("re(x)"), "conj(re(x))", ACEPTAR],
    ["C3 'abs(x)^2' vs 're(x)^2+im(x)^2' — VERDADERA", E("re(x)^2+im(x)^2"),
      "abs(x)^2", ACEPTAR],
    ["C4 're(x*y)' vs 're(x)*re(y)-im(x)*im(y)' — VERDADERA",
      E("re(x)*re(y)-im(x)*im(y)"), "re(x*y)", ACEPTAR],
    ["C5 'conj(x*y)' vs 'conj(x)*conj(y)' — control (HIST-V3)",
      E("conj(x)*conj(y)"), "conj(x*y)", ACEPTAR],
    ["C6 'abs(x+y)' vs 'abs(x)+abs(y)' — FALSA (desigualdad triangular)",
      E("abs(x)+abs(y)"), "abs(x+y)", RECHAZAR],
    ["C7 'im(x*y)' vs 're(x)*im(y)+im(x)*re(y)' — VERDADERA",
      E("re(x)*im(y)+im(x)*re(y)"), "im(x*y)", ACEPTAR],
    ["C8 'conj(x)^2' vs 'conj(x^2)' — VERDADERA (residual T9 del corpus)",
      E("conj(x^2)"), "conj(x)^2", ACEPTAR],
  ],
  G5_DOS: [
    ["M1 suma 3999 monomios vs reordenada — VERDADERA",
      { type: "expr", expected: null }, null, ACEPTAR],
    ["M2 suma 4001 monomios vs reordenada — VERDADERA",
      { type: "expr", expected: null }, null, ACEPTAR],
    ["M3 '(a+b+c+d+e)^15' vs '^14*(a+b+c+d+e)' — VERDADERA (3876 monomios ≤4000)",
      E("(a+b+c+d+e)^14*(a+b+c+d+e)"), "(a+b+c+d+e)^15", ACEPTAR],
    ["M4 '(a+b+c+d+e)^16' vs '^15*(a+b+c+d+e)' — VERDADERA (4845 monomios >4000)",
      E("(a+b+c+d+e)^15*(a+b+c+d+e)"), "(a+b+c+d+e)^16", ACEPTAR],
    ["M5 '(a+b+c+d+e)^16' vs '^15*(a+b+c+d+e)+1' — FALSA",
      E("(a+b+c+d+e)^15*(a+b+c+d+e)+1"), "(a+b+c+d+e)^16", RECHAZAR],
    ["M6 '(a+b+c+d+e)^4096' vs '^4095*(a+b+c+d+e)' — DoS VERDADERA",
      E("(a+b+c+d+e)^4095*(a+b+c+d+e)"), "(a+b+c+d+e)^4096", ACEPTAR, 50],
    ["M7 '(a+b+c+d+e)^4096' vs '^4096+1' — DoS FALSA",
      E("(a+b+c+d+e)^4096+1"), "(a+b+c+d+e)^4096", RECHAZAR],
    ["M8 '(a+b+c+d+e)^4096' vs 0 — DoS FALSA",
      { type: "expr", expected: "0" }, "(a+b+c+d+e)^4096", RECHAZAR],
    ["M9 '(a+b+c+d+e)^4096' idénticas — fast-path",
      E("(a+b+c+d+e)^4096"), "(a+b+c+d+e)^4096", ACEPTAR],
    ["M10 '((x+y+z)^64+x)^64' vs '^63*((x+y+z)^64+x)' — DoS anidada VERDADERA",
      E("((x+y+z)^64+x)^63*((x+y+z)^64+x)"), "((x+y+z)^64+x)^64", ACEPTAR, 50],
    /* ---- ventana FP residual: tolerancia relativa del fallback tras la
       explosión >4000 monomios (E ≡ E+δ errático a magnitudes enormes) ---- */
    ["M11 '(a+b+c+d+e)^15' vs '^15+1' — FALSA (ventana relativa)",
      E("(a+b+c+d+e)^15+1"), "(a+b+c+d+e)^15", RECHAZAR],
    ["M12 '(a+b+c+d+e)^16' vs '^16+1000' — FALSA (ventana relativa)",
      E("(a+b+c+d+e)^16+1000"), "(a+b+c+d+e)^16", RECHAZAR],
    ["M13 'x^100' vs 'x^100+1' — control FALSA (vía estructural, seguro)",
      E("x^100+1"), "x^100", RECHAZAR],
  ],
};

/* sumas generadas para M1/M2 */
const v3999 = Array.from({ length: 3999 }, (_, i) => "x" + (i + 1));
const v4001 = Array.from({ length: 4001 }, (_, i) => "y" + (i + 1));
CASES.G5_DOS[0][1] = { type: "expr", expected: v3999.slice().reverse().join("+") };
CASES.G5_DOS[0][2] = v3999.join("+");
CASES.G5_DOS[0][4] = 50;
CASES.G5_DOS[1][1] = { type: "expr", expected: v4001.slice().reverse().join("+") };
CASES.G5_DOS[1][2] = v4001.join("+");
CASES.G5_DOS[1][4] = 50;

const out = {};
let fpTotal = 0, fnTotal = 0, casosTotal = 0;
for (const [grupo, casos] of Object.entries(CASES)) {
  console.log("--- " + grupo + " (" + casos.length + " casos) ---");
  for (const [nombre, spec, resp, esperaAcepta, nOverride] of casos) {
    const nRuns = nOverride || N;
    let acepta = 0;
    const t0 = Date.now();
    for (let i = 0; i < nRuns; i++) {
      let r;
      try { r = G.check(spec, resp); } catch (e) { r = { ok: false }; }
      if (r.ok === true) acepta++;
    }
    const ms = Date.now() - t0;
    const esFP = !esperaAcepta && acepta > 0;
    const esFN = esperaAcepta && acepta < nRuns;
    if (esFP) fpTotal++;
    if (esFN) fnTotal++;
    casosTotal++;
    out[nombre] = { grupo, acepta, n: nRuns, esperaAcepta, falsoPositivo: esFP, falsoNegativo: esFN, ms };
    console.log((esFP ? "FP!!" : esFN ? "FN!!" : "OK  ") + " | " +
      String(acepta).padStart(4) + "/" + nRuns + " | " + String(ms).padStart(6) + " ms | " + nombre);
  }
}
fs.writeFileSync(path.join(__dirname, "ataques-finales-r10-math.json"),
  JSON.stringify({ N, casos: out }, null, 1));
console.log("\nRESUMEN: FP=" + fpTotal + " FN=" + fnTotal + " de " + casosTotal +
  " (N=" + N + " runs/caso; DoS pesado N=50).");
process.exit(0);
