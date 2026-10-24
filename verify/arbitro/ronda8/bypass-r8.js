/* ÁRBITRO R8 · BYPASS de la capa estructural (descubrimiento de esta ronda)
   Hallazgo: `toRationalPoly` devuelve null/lanza ante exponentes no enteros o
   exponentes negativos entre paréntesis, y `equivalentStrings` cae entonces a la
   vía numérica — la misma que la R7 demostró incapaz de cerrar la familia N9r.
   Un exploit E+Δ con Δ = log(u)+log(v)-log(u·v) (M5/M9/M10/M11 de la R7,
   declarada MAYOR) se rechaza sin veneno (fix OK) pero se ACEPTA al multiplicar
   Δ por cualquier potencia no entera bajo un «+» (p. ej. ·x^0.5).
   Cada caso: 20 runs (muestreo aleatorio interno del grader) + testigo de
   no-equivalencia numérico con G.evaluate. */
const G = require("../../../assets/js/grader.js");

let fallos = 0, n = 0;
function battery(nombre, spec, ans, esperadoAcepta, runs) {
  runs = runs || 20;
  n++;
  let acc = 0, crash = null;
  for (let i = 0; i < runs; i++) {
    try {
      if (G.check(spec, ans).ok) acc++;
    } catch (e) {
      crash = e.message;
      break;
    }
  }
  if (crash) {
    fallos++;
    console.log(`✘ ${nombre}: CRASH ${crash}`);
    return;
  }
  // para exploits: esperadoAcepta=false exige 0 aceptaciones en TODOS los runs
  const bien = esperadoAcepta ? acc === runs : acc === 0;
  if (!bien) fallos++;
  console.log(`${bien ? "✔" : "✘"} ${nombre}: ${acc}/${runs} acepta (debía ${esperadoAcepta ? runs : 0}/${runs})`);
}

const E = "5";
const DELTA = "(log(x+5)+log(y+5)-log((x+5)*(y+5)))";
const EX = { type: "expr", expected: E };
const EX4ST = { type: "expr", expected: "4-s-t" };

console.log("--- control: la familia R7 sin veneno (el fix SÍ la cierra) ---");
battery("B0  E+Δ (M5 naive)", EX, E + "+" + DELTA, false);
battery("B0b 4-s-t+Δ (M9 naive)", EX4ST, "4-s-t+" + DELTA, false);

console.log("\n--- bypass por potencia no entera bajo «+» (debería rechazar; ACEPTA = hallazgo) ---");
battery("B1  E+Δ·x^0.5", EX, E + "+" + DELTA + "*x^0.5", false);
battery("B2  E+Δ·x^(1/2)", EX, E + "+" + DELTA + "*x^(1/2)", false);
battery("B3  E+Δ·x^0.3333", EX, E + "+" + DELTA + "*x^0.3333", false);
battery("B4  E+Δ·x^y (exponente variable)", EX, E + "+" + DELTA + "*x^y", false);
battery("B5  E+Δ·2^x", EX, E + "+" + DELTA + "*2^x", false);
battery("B6  E+Δ/(x^0.5+1)", EX, E + "+" + DELTA + "/(x^0.5+1)", false);
battery("B7  E+Δ·(x+y)^(-1)", EX, E + "+" + DELTA + "*(x+y)^(-1)", false);
battery("B8  E+Δ·x^0.5 en exprset (M10)", { type: "exprset", expected: ["4", "-2"] },
  ["4+" + DELTA + "*x^0.5", "-2"], false);
battery("B9  E+Δ·x^0.5 en matriz (M11)", { type: "matrix", rows: 1, cols: 1, expected: [["1/2"]] },
  [["1/2+" + DELTA + "*x^0.5"]], false);
battery("B10 E+Δ·x^0.5 en multi", { type: "multi", fields: { a: { type: "expr", expected: "5" } } },
  { a: E + "+" + DELTA + "*x^0.5" }, false);
battery("B11 E+Δ·abs(x)^0.5", EX, E + "+" + DELTA + "*abs(x)^0.5", false);
battery("B12 E+Δ·sqrt(x)^0.3333", EX, E + "+" + DELTA + "*sqrt(x)^0.3333", false);

console.log("\n--- veneno NO funciona (controles: el fix sigue cerrando otras rutas) ---");
battery("B13 E+Δ·sqrt(x) (fn, sin ^ rara)", EX, E + "+" + DELTA + "*sqrt(x)", false);
battery("B14 E+Δ·sin(x)", EX, E + "+" + DELTA + "*sin(x)", false);
battery("B15 E+Δ·x (racional)", EX, E + "+" + DELTA + "*x", false);

console.log("\n--- exponente negativo entre paréntesis (misma raíz: cae a vía numérica) ---");
battery("B16 '(x+y)^(-300)' vs 0 (esperado 0)", { type: "expr", expected: "0" }, "(x+y)^(-300)", false, 50);
battery("B17 '(x+y)^-300' vs 0", { type: "expr", expected: "0" }, "(x+y)^-300", false, 50);
battery("B18 '(x^2+y^2+2)^(-200)' vs 0", { type: "expr", expected: "0" }, "(x^2+y^2+2)^(-200)", false, 50);
battery("B19 '1/(x+y)^300' vs 0 (forma racional: sí debe rechazar)", { type: "expr", expected: "0" }, "1/(x+y)^300", false, 20);

console.log("\n--- SET-U · respuesta universal 0/0 (toRationalPoly: {n:0,d:0} ≡ todo) ---");
const U = "(x-x)/(x-x)";
battery("U1  U vs 5", { type: "expr", expected: "5" }, U, false, 50);
battery("U2  U vs 4/11 (drill real)", { type: "expr", expected: "4/11" }, U, false, 50);
battery("U3  U vs log(x*y)", { type: "expr", expected: "log(x*y)" }, U, false, 50);
battery("U4  U vs x+y", { type: "expr", expected: "x+y" }, U, false, 50);
battery("U5  0/(x-x) vs 5", { type: "expr", expected: "5" }, "0/(x-x)", false, 50);
battery("U6  (x-x)^2/(x-x) vs 5", { type: "expr", expected: "5" }, "(x-x)^2/(x-x)", false, 50);
battery("U7  1*(x-x)/(x-x) vs pi", { type: "expr", expected: "pi" }, "1*(x-x)/(x-x)", false, 50);
battery("U8  5+0*(x-x)/(x-x) vs 5 (J10 histórico R2)", { type: "expr", expected: "5" }, "5+0*(x-x)/(x-x)", false, 50);
battery("U9  U en las 4 celdas de T5-N5 (matriz)", { type: "matrix", rows: 2, cols: 2, expected: [["1/2", "0"], ["0", "1/4"]] },
  [[U, U], [U, U]], false, 50);
battery("U10 U duplicado en exprset", { type: "exprset", expected: ["2", "-2"] }, [U, U], false, 50);
battery("U11 U en multi (campo expr)", { type: "multi", fields: { arg: { type: "expr", expected: "5*pi/6" } } }, { arg: U }, false, 50);
battery("U12 1/(x-x) vs 5 (A6 histórico: DEBE rechazar)", { type: "expr", expected: "5" }, "1/(x-x)", false, 20);
battery("U13 x/(x-x) vs 5 (numerador no nulo: DEBE rechazar)", { type: "expr", expected: "5" }, "x/(x-x)", false, 20);

console.log("\n--- testigos de no-equivalencia (R7 §7: x=y=-6 → Δ=2πi) ---");
const w = (expr) => G.evaluate(expr, { x: { re: -6, im: 0 }, y: { re: -6, im: 0 } });
const wA = w(E + "+" + DELTA + "*x^0.5");
const wB = w(E);
const dW = Math.hypot(wA.re - wB.re, wA.im - wB.im);
console.log(`  testigo x=y=-6: E+Δ·x^0.5 = (${wA.re.toFixed(4)}, ${wA.im.toFixed(4)}) vs E = (${wB.re}, ${wB.im}) · |Δ| = ${dW.toFixed(4)}`);
if (dW < 1) {
  fallos++;
  console.log("✘ testigo inútil: las expresiones coinciden en x=y=-6");
} else {
  console.log("✔ testigo OK: las expresiones NO son equivalentes (aceptarlas = falso positivo)");
}
n++;

const wA2 = w("(x+y)^(-300)");
const dW2 = Math.hypot(wA2.re, wA2.im);
console.log(`  testigo (x+y)^(-300) en x=y=-6: (${wA2.re}, ${wA2.im}) ≠ 0 · |·| = ${dW2}`);
n++;

console.log(`\nResumen BYPASS R8: ${fallos} desajustes de ${n} casos`);
console.log("(B1-B12, B16-B18 y U1-U11 marcados ✘ = falsos positivos confirmados: rechazo esperado, aceptación real)");
process.exit(0);
