/* ÁRBITRO R9 · sonda de la familia residual B16–B19 (exponente entero grande):
   - mecanismo: toRationalPoly devuelve null para |exp| > 64 (tope anti-explosión)
     y equivalentStrings cae a la vía numérica, donde «casi 0» ≈ 0.
   - contraste con |exp| ≤ 64 (decisión estructural → rechazo).
   - superficie real: expected = 0 en el banco → respuesta gratuita «(x+y)^(-300)».
   - sondeos extra del hueco del esqueleto (0^x). */
const G = require("../../../assets/js/grader.js");

const runs = (spec, ans, n) => {
  let acc = 0;
  for (let i = 0; i < n; i++) if (G.check(spec, ans).ok) acc++;
  return acc;
};

console.log("-- mecanismo: tope de monomios |exp|>64 → vía numérica --");
const EX0 = { type: "expr", expected: "0" };
const EX411 = { type: "expr", expected: "4/11" };
for (const [e, exp] of [["64", 20], ["65", 20], ["300", 20], ["301", 20]]) {
  const acc = runs(EX0, `1/(x+y)^${e}`, exp);
  console.log(`  1/(x+y)^${e} vs 0: ${acc}/${exp} acepta (|exp|≤64 → estructural: esperado 0)`);
}
for (const [e, exp] of [["64", 20], ["65", 20], ["300", 50]]) {
  const acc = runs(EX0, `(x+y)^(-${e})`, exp);
  console.log(`  (x+y)^(-${e}) vs 0: ${acc}/${exp} acepta`);
}

console.log("\n-- impacto en drill real (T1-N4, expected 4/11): E + perturbación minúscula --");
console.log(`  4/11+(x+y)^(-300): ${runs(EX411, "4/11+(x+y)^(-300)", 50)}/50 acepta`);
console.log(`  4/11+(x^2+y^2+2)^(-200): ${runs(EX411, "4/11+(x^2+y^2+2)^(-200)", 50)}/50 acepta`);
console.log(`  (x+y)^(-300) sola (para expected 0): ${runs(EX0, "(x+y)^(-300)", 50)}/50 acepta`);

console.log("\n-- hueco de esqueleto: bases constantes con exponente variable --");
console.log(`  4/11+0^x: ${runs(EX411, "4/11+0^x", 30)}/30 acepta`);
console.log(`  4/11+(2^x-2^x) [matemáticamente 4/11]: ${runs(EX411, "4/11+(2^x-2^x)", 30)}/30 acepta`);
console.log(`  4/11+(x-x)*x^0.5 [matemáticamente 4/11]: ${runs(EX411, "4/11+(x-x)*x^0.5", 30)}/30 acepta`);
