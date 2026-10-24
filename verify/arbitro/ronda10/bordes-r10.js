/* ÁRBITRO R10 · bordes de las claims N13/N14/N16 y nota NEW-F4. N=200 */
const G = require("../../../assets/js/grader.js");
const N = 200;
function run(nombre, spec, resp, esperado) {
  let a = 0;
  for (let i = 0; i < N; i++) { try { if (G.check(spec, resp).ok === true) a++; } catch (e) {} }
  const tag = esperado === true ? (a === N ? "OK " : "FN!!") : (a > 0 ? "FP!!" : "OK ");
  console.log(tag + " | " + String(a).padStart(4) + "/" + N + " | " + nombre);
}
run("min(2,3)+0,5 vs 3.5 — N13 desactiva coma decimal con min/max (¿parsea?)",
  { type: "expr", expected: "3.5" }, "min(2,3)+0,5", true);
run("min(2,3)+1/2 vs 2.5 — forma fraccionaria sí parsea",
  { type: "expr", expected: "2.5" }, "min(2,3)+1/2", true);
run("(x+y)^1024 vs ((x+y)^512)^2 — VERDADERA gigante (N14 residual)",
  { type: "expr", expected: "((x+y)^512)^2" }, "(x+y)^1024", true);
run("x^100000 vs x^99999*x — VERDADERA gigante",
  { type: "expr", expected: "x^99999*x" }, "x^100000", true);
run("x^65 vs x^63*x^2 — VERDADERA (65>64, numérica)",
  { type: "expr", expected: "x^63*x^2" }, "x^65", true);
run("'x!' vs 'fact(x)' — control notación (fact no escribible)",
  { type: "expr", expected: "fact(x)" }, "x!", false);
run("5+x^(-65) vs 5 en matriz 1x1", { type: "matrix", rows: 1, cols: 1, expected: [["5"]] },
  [["5+x^(-65)"]], false);
run("x^(-300) vs 0 con variable y (dos vars)", { type: "expr", expected: "0" }, "x^(-300)+0*y", false);
run("5+0*x^(-300) vs 5 — VERDADERA (0·x^k = 0)", { type: "expr", expected: "5" }, "5+0*x^(-300)", true);
process.exit(0);
