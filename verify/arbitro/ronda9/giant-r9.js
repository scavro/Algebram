/* ÁRBITRO R8 · entradas gigantes / DoS sobre la capa estructural.
   Mide tiempos y resultados de polyPowInt / polyMul con (x+y)^n.
   El caso (x+y+z)^3000 se prueba FUERA con `timeout` (cuelga el proceso).
   Salida: giant-r9-math.json + stdout. */
const G = require("../../../assets/js/grader.js");
const fs = require("fs");
const path = require("path");

const out = {};

function medir(nombre, fn) {
  const t0 = Date.now();
  let extra = "";
  try {
    const r = fn();
    extra = r && r.ok === true ? "acepta" : "rechaza";
  } catch (e) {
    extra = "excepción: " + e.message;
  }
  const dt = Date.now() - t0;
  out[nombre] = { ms: dt, res: extra };
  console.log(String(dt).padStart(7) + " ms | " + extra.padEnd(8) + " | " + nombre);
}

console.log("--- overflow de coeficientes binomiales (double) ---");
for (const n of [100, 500, 800, 1000, 1024, 1100, 1500, 2000]) {
  medir("(x+y)^" + n + " vs (x+y)^" + n + " (idénticas)", () =>
    G.check({ type: "expr", expected: "(x+y)^" + n }, "(x+y)^" + n));
}
medir("(x+y)^2000 vs (x+y)^2001 (diferentes)", () =>
  G.check({ type: "expr", expected: "(x+y)^2001" }, "(x+y)^2000"));
medir("x^100000 vs x^100000 (monomio, sin overflow)", () =>
  G.check({ type: "expr", expected: "x^100000" }, "x^100000"));

console.log("--- otras cargas ---");
medir("suma de 2000 átomos log(k*x) idéntica", () => {
  const s = Array.from({ length: 2000 }, (_, k) => "log(" + (k + 1) + "*x)").join("+");
  return G.check({ type: "expr", expected: s }, s);
});
medir("1000 paréntesis anidados", () => {
  const s = "(".repeat(1000) + "x+y" + ")".repeat(1000);
  return G.check({ type: "expr", expected: "x+y" }, s);
});
medir("(x+y+z)^60 vs sí mismo (trivariable)", () =>
  G.check({ type: "expr", expected: "(x+y+z)^60" }, "(x+y+z)^60"));

fs.writeFileSync(path.join(__dirname, "giant-r9-math.json"), JSON.stringify(out, null, 1));
console.log("\n(giant-r9-math.json guardado; '(x+y+z)^3000' documentado aparte: timeout 25s)");
process.exit(0);
