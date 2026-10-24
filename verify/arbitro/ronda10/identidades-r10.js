/* ÁRBITRO R10 · batería adversarial de la capa NUEVA (identidades verdaderas
   ampliadas + esqueleto + tope |exp|≤4096 + POLY_MAX_TERMS):
   - falsos positivos: identidades FALSAS de rama no deben aceptarse nunca
   - falsos negativos tolerados (fail-closed): identidades verdaderas no soportadas
   - frontera residual |exp|>4096 y huecos de esqueleto (0^x)
   Cada caso corre 20 runs (muestreo aleatorio interno del grader). */
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
  const bien = esperadoAcepta ? acc === runs : acc === 0;
  if (!bien) fallos++;
  console.log(`${bien ? "✔" : "✘"} ${nombre}: ${acc}/${runs} acepta (debía ${esperadoAcepta ? runs : 0}/${runs})`);
}

const EX411 = { type: "expr", expected: "4/11" };
const EX0 = { type: "expr", expected: "0" };
const DELTA = "(log(x+5)+log(y+5)-log((x+5)*(y+5)))";

console.log("--- venenos de rondas 8–9 (deben seguir cerrados) ---");
battery("C1-R8 (x-x)/(x-x) vs 4/11", EX411, "(x-x)/(x-x)", false, 50);
battery("C1-R8 5+0*(x-x)/(x-x) vs 5", { type: "expr", expected: "5" }, "5+0*(x-x)/(x-x)", false, 50);
battery("M1-R8 4/11+Δ·x^0.5", EX411, "4/11+" + DELTA + "*x^0.5", false);
battery("M1-R8 4/11+Δ·x^(1/2)", EX411, "4/11+" + DELTA + "*x^(1/2)", false);
battery("R1 4/11+x^(-65)", EX411, "4/11+x^(-65)", false, 50);
battery("R1 4/11+x^(-300)", EX411, "4/11+x^(-300)", false, 50);
battery("R1 4/11+(x+y)^(-300)", EX411, "4/11+(x+y)^(-300)", false, 50);
battery("R1 4/11+1/x^300", EX411, "4/11+1/x^300", false, 50);
battery("R1 (x+y)^(-300) vs 0 (gratuito)", EX0, "(x+y)^(-300)", false, 50);
battery("R1 0^x vs 1", { type: "expr", expected: "1" }, "0^x", false, 50);
battery("R1 4/11+0^x", EX411, "4/11+0^x", false, 50);
battery("R1 4/11+(x-x)*x^0.5 [identidad verdadera: 0·x^0.5=0]", EX411, "4/11+(x-x)*x^0.5", true, 50);

console.log("\n--- frontera residual |exp|>4096 (numérica, sin fail-closed) ---");
for (const e of [4097, 5000, 10000]) {
  battery(`R1' 4/11+x^(-${e})`, EX411, `4/11+x^(-${e})`, false, 50);
}
for (const e of [4097, 5000]) {
  battery(`R1' (x+y)^(-${e}) vs 0`, EX0, `(x+y)^(-${e})`, false, 50);
}
battery("R1' x^(-5000) vs 0", EX0, "x^(-5000)", false, 50);

console.log("\n--- identidades FALSAS de rama (la nueva capa no debe abrirlas) ---");
battery("log(x)+log(y) vs log(x*y)", { type: "expr", expected: "log(x*y)" }, "log(x)+log(y)", false);
battery("sqrt(x)*sqrt(y) vs sqrt(x*y)", { type: "expr", expected: "sqrt(x*y)" }, "sqrt(x)*sqrt(y)", false);
battery("log(exp(x))-x vs 0", EX0, "log(exp(x))-x", false);
battery("sqrt(x^2) vs x", { type: "expr", expected: "x" }, "sqrt(x^2)", false);
battery("(x^2)^0.5 vs x", { type: "expr", expected: "x" }, "(x^2)^0.5", false);
battery("log(x*x) vs 2*log(x)", { type: "expr", expected: "2*log(x)" }, "log(x*x)", false);
battery("sqrt(x*y*z) vs sqrt(x)sqrt(y)sqrt(z)", { type: "expr", expected: "sqrt(x)*sqrt(y)*sqrt(z)" }, "sqrt(x*y*z)", false);
battery("exp(x)*exp(y) vs exp(x+y) [FN tolerado]", { type: "expr", expected: "exp(x+y)" }, "exp(x)*exp(y)", false);
battery("tan(x)·cos(x) vs 0", EX0, "tan(x)*cos(x)", false);
battery("conj(x)^2 vs x*conj(x)", { type: "expr", expected: "x*conj(x)" }, "conj(x)^2", false);
battery("E+Δ·sqrt(x) (M1 sin ^ raro)", EX411, "4/11+" + DELTA + "*sqrt(x)", false);
battery("E+Δ·sin(x)", EX411, "4/11+" + DELTA + "*sin(x)", false);

console.log("\n--- identidades VERDADERAS nuevas (deben aceptarse; FN = fail-closed) ---");
battery("tan=sin/cos", { type: "expr", expected: "sin(x)/cos(x)" }, "tan(x)", true);
battery("|x|^2=x·conj(x)", { type: "expr", expected: "x*conj(x)" }, "abs(x)^2", true);
battery("x^(3/2)=x·sqrt(x)", { type: "expr", expected: "x*sqrt(x)" }, "x^(3/2)", true);
battery("x^(-1/2)=1/sqrt(x)", { type: "expr", expected: "1/sqrt(x)" }, "x^(-1/2)", true);
battery("(sqrt x)^4=x^2", { type: "expr", expected: "x^2" }, "(sqrt(x))^4", true);
battery("log(sqrt(x))=log(x)/2", { type: "expr", expected: "log(x)/2" }, "log(sqrt(x))", true);
battery("x^0.5·x^0.5=x", { type: "expr", expected: "x" }, "x^0.5*x^0.5", true);
battery("min(x,y)=min(y,x)", { type: "expr", expected: "min(x,y)" }, "min(y,x)", true);
battery("re(x)^2+im(x)^2=x·conj(x)", { type: "expr", expected: "x*conj(x)" }, "re(x)^2+im(x)^2", true);
battery("cos^2+sin^2=1", { type: "expr", expected: "1" }, "cos(x)^2+sin(x)^2", true);
battery("(x+y)^300 idéntica", { type: "expr", expected: "(x+y)^300" }, "(x+y)^300", true);
battery("x^(-65) vs x^(-65) idéntica", { type: "expr", expected: "x^(-65)" }, "x^(-65)", true);

console.log("\n--- matrices/multi con la capa nueva (rechazo de venenos) ---");
battery("matriz U", { type: "matrix", expected: [["1/2", "0"], ["0", "1/4"]] }, [["(x-x)/(x-x)", "0"], ["0", "1/4"]], false, 50);
battery("matriz 1/4+x^(-65)", { type: "matrix", expected: [["1/2", "0"], ["0", "1/4"]] }, [["1/2", "0"], ["0", "1/4+x^(-65)"]], false, 50);
battery("multi E+Δ·x^0.5", { type: "multi", fields: { a: { type: "expr", expected: "5" } } }, { a: "5+" + DELTA + "*x^0.5" }, false, 50);
battery("exprset U", { type: "exprset", expected: ["2", "-2"] }, ["(x-x)/(x-x)", "(x-x)/(x-x)"], false, 50);

console.log(`\nResumen IDENTIDADES R10: ${fallos} desajustes de ${n} casos`);
process.exit(fallos ? 1 : 0);
