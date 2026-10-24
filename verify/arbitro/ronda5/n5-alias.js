/* ÁRBITRO R5 · N5 — alias sen/tg y funciones sin paréntesis (tokenizer). */
const G = require("../../../assets/js/grader.js");
let fallos = 0;
function t(nombre, spec, respuesta, esperadoAcepta) {
  const r = G.check(spec, respuesta);
  const bien = r.ok === esperadoAcepta;
  if (!bien) fallos++;
  console.log(`${bien ? "[OK ]" : "[FALLO]"} ${nombre}: grader=${r.ok ? "ACEPTA" : "RECHAZA"} (debía ${esperadoAcepta ? "aceptar" : "rechazar"})`);
}
console.log("--- alias sen/tg (afirmación del equipo: CORREGIDO) ---");
t("A1 sen(x) vs sin(x)", { type: "expr", expected: "sin(x)" }, "sen(x)", true);
t("A2 tg(x) vs tan(x)", { type: "expr", expected: "tan(x)" }, "tg(x)", true);
t("A3 sen(0.5) vs sin(0.5)", { type: "expr", expected: "sin(0.5)" }, "sen(0.5)", true);
t("A4 tg(pi/4) vs 1", { type: "expr", expected: "1" }, "tg(pi/4)", true);
t("A5 sen(pi/6) vs 1/2", { type: "expr", expected: "1/2" }, "sen(pi/6)", true);
t("A6 arcsen? sin(x) control", { type: "expr", expected: "sin(x)" }, "sin(x)", true);
console.log("--- funciones sin paréntesis (parte NO afirmada de N5) ---");
// criterio matemático: senx/sin x/sen x denotan sen(x) -> el grader DEBERÍA aceptar.
// El criterio del curso (propuesta de cierre de N5) era "admitir identificador de
// función seguido de letra". Si rechaza, queda el falso negativo documentado en N5.
t("B1 'sen x' vs sin(x)", { type: "expr", expected: "sin(x)" }, "sen x", true);
t("B2 'senx' vs sin(x)", { type: "expr", expected: "sin(x)" }, "senx", true);
t("B3 'sinx' vs sin(x)", { type: "expr", expected: "sin(x)" }, "sinx", true);
t("B4 'sin x' vs sin(x)", { type: "expr", expected: "sin(x)" }, "sin x", true);
t("B5 'cosx' vs cos(x)", { type: "expr", expected: "cos(x)" }, "cosx", true);
console.log("\nResumen N5: " + fallos + " desajustes frente al criterio matemático");
process.exit(0);
