/* ÁRBITRO R7 · trigonometría inversa — evaluación del grader (ronda 7 claim N5r-a).
   Casos del protocolo: asin(0), arcsen(1), atan(1), arccos(1), asin(2) (complejo).
   Además: rejilla real + compleja, alias (arcsin/arcsen/asin, arccos/acos,
   arctan/arctg/atan) y consistencia entre alias. Salida: trig-r7.json
   (la comparación con sympy/mpmath se hace en trig-r7.py). */
const G = require("../../../assets/js/grader.js");
const fs = require("fs");
const path = require("path");

const pts = [
  ["0", 0, 0], ["1", 1, 0], ["-1", -1, 0], ["0.5", 0.5, 0], ["2", 2, 0],
  ["-2", -2, 0], ["0.3", 0.3, 0], ["-0.7", -0.7, 0], ["1.5", 1.5, 0],
  ["2i", 0, 2], ["-2i", 0, -2], ["0.5i", 0, 0.5],
  ["0.5+0.5i", 0.5, 0.5], ["-1+2i", -1, 2], ["3-2i", 3, -2],
  ["-0.3+1.2i", -0.3, 1.2], ["2.5-1.5i", 2.5, -1.5], ["-3+0.1i", -3, 0.1],
];

function lit(re, im) {
  return String(re) + (im < 0 ? "" : "+") + im + "i";
}

const out = { puntos: [], alias: [], protocolo: [] };

/* --- rejilla de valores vs (sympy en trig-r7.py) --- */
for (const [label, re, im] of pts) {
  const z = lit(re, im);
  const row = { z: label };
  for (const [fn, name] of [["asin", "asin"], ["acos", "acos"], ["atan", "atan"]]) {
    const v = G.evaluate(name + "(" + z + ")");
    row[name] = { re: v.re, im: v.im };
  }
  out.puntos.push(row);
}

/* --- alias: cada alias debe dar exactamente el valor de la canónica --- */
const aliasPairs = [
  ["asin", ["arcsin", "arcsen"]],
  ["acos", ["arccos"]],
  ["atan", ["arctan", "arctg"]],
];
let aliasFail = 0;
for (const [z] of pts) {
  for (const [canon, als] of aliasPairs) {
    const v0 = G.evaluate(canon + "(" + z + ")");
    for (const a of als) {
      const v = G.evaluate(a + "(" + z + ")");
      const d = Math.hypot(v.re - v0.re, v.im - v0.im);
      const ok = d < 1e-12;
      if (!ok) aliasFail++;
      out.alias.push({ z, canon, alias: a, delta: d, ok });
    }
  }
}

/* --- casos nombrados del protocolo, vía G.check --- */
function chk(label, spec, resp) {
  let ok = false, err = null;
  try { ok = G.check(spec, resp).ok === true; } catch (e) { err = e.message; }
  out.protocolo.push({ label, spec, resp, ok, err });
  console.log((ok ? "OK   " : "FALLO") + " | " + label +
    " | check(" + resp + ") → " + ok + (err ? " (" + err + ")" : ""));
}
chk("asin(0)=0", { type: "number", expected: "0" }, "asin(0)");
chk("arcsen(1)=pi/2", { type: "expr", expected: "pi/2" }, "arcsen(1)");
chk("atan(1)=pi/4", { type: "expr", expected: "pi/4" }, "atan(1)");
chk("arccos(1)=0", { type: "number", expected: "0" }, "arccos(1)");
chk("asin(2)=pi/2-i*ln(2+sqrt(3)) (complejo)",
  { type: "expr", expected: "pi/2-i*log(2+sqrt(3))" }, "asin(2)");
chk("arcsin(0.5)=pi/6", { type: "expr", expected: "pi/6" }, "arcsin(0.5)");
chk("acos(0.5)=pi/3", { type: "expr", expected: "pi/3" }, "acos(0.5)");
chk("arctg(1)=pi/4 (alias)", { type: "expr", expected: "pi/4" }, "arctg(1)");
chk("atan(2i)=pi/2+i*log(3)/2 (complejo, rama principal)",
  { type: "expr", expected: "pi/2+i*log(3)/2" }, "atan(2i)");

fs.writeFileSync(path.join(__dirname, "trig-r7.json"), JSON.stringify(out, null, 1));
const okP = out.protocolo.filter((x) => x.ok).length;
console.log("\nProtocolo trig: " + okP + "/" + out.protocolo.length +
  " · alias inconsistentes: " + aliasFail + " · puntos: " + out.puntos.length);
console.log("Detalle: verify/arbitro/ronda7/trig-r7.json (comparar en trig-r7.py)");
