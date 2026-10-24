/* ÁRBITRO R6 · N5r — parser: aplicación implícita y alias.
   Protocolo R6.3: senx, sen x, log2, tg(1), sqrt4.
   Más: alias sen/tg/arcsen (claim del equipo), sinónimos y contraste hostil
   (la aplicación implícita NO debe crear falsos positivos). */
const G = require("../../../assets/js/grader.js");

function eq(a, b) {
  try { return G.equivalent(a, b) === true; } catch (e) { return "ERR:" + e.message; }
}
function ev(s) {
  try { return JSON.stringify(G.evaluate(s)); } catch (e) { return "ERR:" + e.message; }
}

let ok = 0, fails = [];
function chk(label, got, want) {
  const good = got === want;
  if (good) ok++; else fails.push(label);
  console.log((good ? "OK   " : "FALLO") + " | " + label + " → " + got + (good ? "" : " (esperado " + want + ")"));
}

console.log("== lista explícita protocolo R6.3 (N5r) ==");
chk("senx ≡ sin(x)", eq("senx", "sin(x)"), true);
chk("sen x ≡ sin(x)", eq("sen x", "sin(x)"), true);
chk("log2 ≡ log(2)", eq("log2", "log(2)"), true);
chk("tg(1) ≡ tan(1)", eq("tg(1)", "tan(1)"), true);
chk("sqrt4 ≡ 2", eq("sqrt4", "2"), true);

console.log("\n== aplicación implícita general ==");
chk("sinx ≡ sin(x)", eq("sinx", "sin(x)"), true);
chk("cosx ≡ cos(x)", eq("cosx", "cos(x)"), true);
chk("logx ≡ log(x)", eq("logx", "log(x)"), true);
chk("expx ≡ exp(x)", eq("expx", "exp(x)"), true);
chk("sqrtx ≡ sqrt(x)", eq("sqrtx", "sqrt(x)"), true);
chk("absx ≡ abs(x)", eq("absx", "abs(x)"), true);
chk("conjx ≡ conj(x)", eq("conjx", "conj(x)"), true);
chk("tg1 ≡ tan(1)", eq("tg1", "tan(1)"), true);
chk("senx^2 ≡ sin(x)^2", eq("senx^2", "sin(x)^2"), true);
chk("log2x ≡ log(2)*x", eq("log2x", "log(2)*x"), true);

console.log("\n== alias claim del equipo: sen / tg / arcsen ==");
chk("sen(x) ≡ sin(x)", eq("sen(x)", "sin(x)"), true);
chk("tg(x) ≡ tan(x)", eq("tg(x)", "tan(x)"), true);
chk("arcsen(1) ≡ pi/2", eq("arcsen(1)", "pi/2"), true);
chk("arcsen(0.5) ≡ pi/6", eq("arcsen(0.5)", "pi/6"), true);

console.log("\n== resto de familia inversa (KNOWN_NAMES sin FUNCS) ==");
chk("arcsin(1) ≡ pi/2", eq("arcsin(1)", "pi/2"), true);
chk("asin(1) ≡ pi/2", eq("asin(1)", "pi/2"), true);
chk("acos(0) ≡ pi/2", eq("acos(0)", "pi/2"), true);
chk("atan(1) ≡ pi/4", eq("atan(1)", "pi/4"), true);
chk("arctan(1) ≡ pi/4", eq("arctan(1)", "pi/4"), true);
chk("arccos(0) ≡ pi/2", eq("arccos(0)", "pi/2"), true);

console.log("\n== evaluación directa (diagnóstico) ==");
for (const s of ["senx", "log2", "sqrt4", "arcsen(1)", "asin(1)", "atan(1)"]) {
  console.log("  " + s.padEnd(12) + "→ " + ev(s));
}

console.log("\n== contraste hostil: la aplicación implícita NO debe crear falsos positivos ==");
chk("senx ≢ sin(y)", eq("senx", "sin(y)"), false);
chk("log2 ≢ log(3)", eq("log2", "log(3)"), false);
chk("sqrt4 ≢ -2", eq("sqrt4", "-2"), false);
chk("tg1 ≢ tan(2)", eq("tg1", "tan(2)"), false);
chk("senx ≢ x", eq("senx", "x"), false);
chk("log2x ≢ log(2x)", eq("log2x", "log(2x)"), false);
chk("arcsen(1) ≢ 1", eq("arcsen(1)", "1"), false);

console.log("\n== regresión sintáctica (no debe haberse roto) ==");
chk("2x ≡ 2*x", eq("2x", "2*x"), true);
chk("pix ≡ pi*x", eq("pix", "pi*x"), true);
chk("xy ≡ x*y", eq("xy", "x*y"), true);
chk("2sqrt(3) ≡ 2*sqrt(3)", eq("2sqrt(3)", "2*sqrt(3)"), true);
chk("5! ≡ 120", eq("5!", "120"), true);
chk("3,14 ≡ 3.14", eq("3,14", "3.14"), true);
chk("ln(x) ≡ log(x)", eq("ln(x)", "log(x)"), true);

console.log("\n" + ok + " OK, " + fails.length + " FALLOS");
if (fails.length) console.log("Fallos: " + JSON.stringify(fails));
