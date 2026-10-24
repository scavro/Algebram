/* ÁRBITRO R10 · DoS / coste de la capa estructural con el tope |k|≤64.
   Cada caso se ejecuta con un timeout externo (ver shell). Formato:
   nombre, fn */
const G = require("../../../assets/js/grader.js");
const casos = [
  ["(x+y+z)^64 vs (x+y+z)^63*(x+y+z)", () => G.check({ type: "expr", expected: "(x+y+z)^63*(x+y+z)" }, "(x+y+z)^64")],
  ["(x+y+z)^64 vs (x^2+y^2+z^2+2*x*y+2*x*z+2*y*z)^32", () => G.check({ type: "expr", expected: "(x^2+y^2+z^2+2*x*y+2*x*z+2*y*z)^32" }, "(x+y+z)^64")],
  ["((x+y+z)^64+x)^64 vs ((x+y+z)^64+x)^63*((x+y+z)^64+x)", () => G.check({ type: "expr", expected: "((x+y+z)^64+x)^63*((x+y+z)^64+x)" }, "((x+y+z)^64+x)^64")],
  ["(x+y+z+w)^64 vs (x+y+z+w)^63*(x+y+z+w)", () => G.check({ type: "expr", expected: "(x+y+z+w)^63*(x+y+z+w)" }, "(x+y+z+w)^64")],
  ["(a+b+c+d+e)^64 vs (a+b+c+d+e)^63*(a+b+c+d+e)", () => G.check({ type: "expr", expected: "(a+b+c+d+e)^63*(a+b+c+d+e)" }, "(a+b+c+d+e)^64")],
  ["(x+y+z)^32 vs ((x+y+z)^16)^2", () => G.check({ type: "expr", expected: "((x+y+z)^16)^2" }, "(x+y+z)^32")],
  ["x^64*y^64*z^64 vs (x*y*z)^64", () => G.check({ type: "expr", expected: "(x*y*z)^64" }, "x^64*y^64*z^64")],
  ["(x+y+z)^64 vs 0 (distintas)", () => G.check({ type: "expr", expected: "0" }, "(x+y+z)^64")],
];
for (const [nombre, fn] of casos) {
  const t0 = Date.now();
  let res = "?";
  try { res = fn().ok === true ? "acepta" : "rechaza"; } catch (e) { res = "excepción: " + e.message; }
  console.log(String(Date.now() - t0).padStart(7) + " ms | " + res.padEnd(8) + " | " + nombre);
}
process.exit(0);
