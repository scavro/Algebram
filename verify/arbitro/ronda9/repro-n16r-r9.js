/* Reproducción mínima del residual N16 (|k|>64 → fallback numérico con
   esqueletos vacíos → tolerancia ≡0/≡E). N=200. */
const G = require("../../../assets/js/grader.js");
const N = 200;
const casos = [
  ["5+x^(-300) vs 5 (spec '5')", { type: "expr", expected: "5" }, "5+x^(-300)"],
  ["x^(-65) vs x^(-64)", { type: "expr", expected: "x^(-64)" }, "x^(-65)"],
  ["x^(-300) vs 0", { type: "expr", expected: "0" }, "x^(-300)"],
];
for (const [nombre, spec, resp] of casos) {
  let a = 0;
  for (let i = 0; i < N; i++) if (G.check(spec, resp).ok === true) a++;
  console.log(String(a).padStart(4) + "/" + N + " acepta | " + nombre);
}
process.exit(0);
