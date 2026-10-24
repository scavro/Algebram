/* ÁRBITRO R8 · batería hostil sobre grader.js (humo + regresión del contrato R2)
   (a) batería R2/R5 íntegra (114 casos, expectativas SIN tocar: fidelidad del instrumento)
   (b) SET-S: entradas basura contra la NUEVA capa estructural (sin crash / sin bucle)
   (c) SET-H: multi incompleto / specs malformados (familia N6)
   (d) SET-CONSISTENCIA: los 111 drills del banco deben auto-corregirse + timing
   (e) SET-R7: la familia M1–M12 de la R7 debe rechazar de forma determinista
   Criterio: ACEPTA/RECHAZA vs criterio matemático. ✘ = desajuste del grader. */
const path = require("path");
const fs = require("fs");
const G = require("../../../assets/js/grader.js");

let fallos = 0, n = 0;
function check(ok, msg) {
  if (!ok) fallos++;
  console.log(`  ${ok ? "✔" : "✘"} ${msg}`);
}
function t(nombre, spec, respuesta, esperadoAcepta) {
  n++;
  let r;
  try {
    r = G.check(spec, respuesta);
  } catch (e) {
    fallos++;
    console.log(`✘ ${nombre}: CRASH ${e.message}`);
    return;
  }
  const bien = r.ok === esperadoAcepta;
  if (!bien) fallos++;
  console.log(`${bien ? "✔" : "✘"} ${nombre}: grader=${r.ok ? "ACEPTA" : "RECHAZA"} (debía ${esperadoAcepta ? "aceptar" : "rechazar"})${r.error ? " [" + r.error + "]" : ""}`);
}

console.log("--- R1-A. falsos positivos (debe RECHAZAR) ---");
t("A1 'x-y' vs 0", { type: "expr", expected: "0" }, "x-y", false);
t("A2 'x^2-y^2' vs 0", { type: "expr", expected: "0" }, "x^2-y^2", false);
t("A3 'sin(x)-sin(y)' vs 0", { type: "expr", expected: "0" }, "sin(x)-sin(y)", false);
t("A4 '4-2*t' vs '4-s-t'", { type: "expr", expected: "4-s-t" }, "4-2*t", false);
t("A5 '4-s-t+(s-t)' vs '4-s-t'", { type: "expr", expected: "4-s-t" }, "4-s-t+(s-t)", false);
t("A6 '1/(x-x)' vs 5", { type: "expr", expected: "5" }, "1/(x-x)", false);
t("A7 'log(x-x)' vs 3", { type: "expr", expected: "3" }, "log(x-x)", false);
t("A8 '1/(x-y)' vs '2/(x-y)'", { type: "expr", expected: "2/(x-y)" }, "1/(x-y)", false);
t("A9 'y^2' vs 'x^2'", { type: "expr", expected: "x^2" }, "y^2", false);
t("A10 matriz celda 'x-y' vs '0'", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [["x-y"]], false);
t("A11 '1e-7' vs 0 (matrix) — tolerancia 1e-6 del motor, diseño", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [["0.0000001"]], true);
t("A12 '0.0001' vs number 0", { type: "number", expected: "0" }, "0.0001", false);
t("A13 choice '1abc' == 1", { type: "choice", expected: 1 }, "1abc", false);
t("A14 choice '2.9' == 2", { type: "choice", expected: 2 }, "2.9", false);
t("A15 bool '1' -> true", { type: "bool", expected: true }, "1", true);

console.log("--- R1-B. falsos negativos (debe ACEPTAR) ---");
t("B1 '1/2' vs '0.5'", { type: "expr", expected: "0.5" }, "1/2", true);
t("B2 '2i' vs '2*i'", { type: "expr", expected: "2*i" }, "2i", true);
t("B3 '0,5' vs '1/2'", { type: "expr", expected: "1/2" }, "0,5", true);
t("B4 '(2+11i)/5' vs '2/5+11/5*i'", { type: "expr", expected: "2/5+11/5*i" }, "(2+11i)/5", true);
t("B5 'sqrt(3)/2' vs '3^0.5/2'", { type: "expr", expected: "sqrt(3)/2" }, "3^0.5/2", true);
t("B6 'π/3' vs 'pi/3'", { type: "expr", expected: "pi/3" }, "π/3", true);
t("B7 '−2' vs '-2' exact", { type: "number", expected: "-2", exact: true }, "\u22122", true);
t("B8 matriz '1/2' vs '0.5'", { type: "matrix", rows: 1, cols: 1, expected: [["0.5"]] }, [["1/2"]], true);
t("B9 matriz 'sqrt(4)' vs '2'", { type: "matrix", rows: 1, cols: 1, expected: [["2"]] }, [["sqrt(4)"]], true);
t("B10 exprset '2;-2' vs ['4','-2']", { type: "exprset", expected: ["4", "-2"] }, "-2;4", true);
t("B11 '1e3' vs 1000 exact", { type: "number", expected: "1000", exact: true }, "1e3", true);
t("B12 '5!' vs 120 exact", { type: "number", expected: "120", exact: true }, "5!", true);
t("B13 '-2^2' vs '-4'", { type: "expr", expected: "-4" }, "-2^2", true);
t("B14 '2sqrt(3)' vs '2*sqrt(3)'", { type: "expr", expected: "2*sqrt(3)" }, "2sqrt(3)", true);
t("B15 bool 'Sí' -> true", { type: "bool", expected: true }, "Sí", true);
t("B16 bool 'falso' -> false", { type: "bool", expected: false }, "falso", true);
t("B17 '3,14' vs '3.14'", { type: "number", expected: "3.14" }, "3,14", true);
t("B18 multi correcto", { type: "multi", fields: { a: { type: "number", expected: "2", exact: true }, b: { type: "number", expected: "3", exact: true } } }, { a: "2", b: "3" }, true);
t("B19 'sqrt(2)/2' vs '1/sqrt(2)'", { type: "expr", expected: "sqrt(2)/2" }, "1/sqrt(2)", true);
t("B20 'i^2' vs '-1'", { type: "expr", expected: "-1" }, "i^2", true);
t("B21 '(1+i)^2' vs '2i'", { type: "expr", expected: "2*i" }, "(1+i)^2", true);
t("B22 'sqrt(3)/2' vs decimal (tol)", { type: "expr", expected: "sqrt(3)/2" }, "0.8660254037844386", true);

console.log("--- R1-C. signo/dimensión (debe RECHAZAR) ---");
t("C1 '11' vs 10", { type: "expr", expected: "10" }, "11", false);
t("C2 '-2i' vs '2i'", { type: "expr", expected: "2*i" }, "-2*i", false);
t("C3 vector 2 vs 3", { type: "vector", rows: 3, cols: 1, expected: [["1"], ["2"], ["3"]] }, [["1"], ["2"]], false);
t("C4 matriz transpuesta", { type: "matrix", rows: 2, cols: 2, expected: [["1", "2"], ["3", "4"]] }, [["1", "3"], ["2", "4"]], false);
t("C5 '-1/2' vs '1/2'", { type: "expr", expected: "1/2" }, "-1/2", false);
t("C6 exprset cambiado", { type: "exprset", expected: ["4", "-2"] }, "4;2", false);
t("C7 bool invertido", { type: "bool", expected: true }, "false", false);
t("C8 choice equivocado", { type: "choice", expected: 1 }, "2", false);
t("C9 '4/2' exact vs 3", { type: "number", expected: "3", exact: true }, "4/2", false);

console.log("--- D. ataques a C4 (no finitos / no evaluables) ---");
t("D1 'hacker(3)' vs 1", { type: "expr", expected: "1" }, "hacker(3)", false);
t("D2 '1/(x-y)' vs todo (contrarrespuesta universal)", { type: "expr", expected: "x^2+1" }, "1/(x-y)", false);
t("D3 'log(x-y)' vs 2", { type: "expr", expected: "2" }, "log(x-y)", false);
t("D4 '1/0' vs 5", { type: "expr", expected: "5" }, "1/0", false);
t("D5 'x/0' vs x", { type: "expr", expected: "x" }, "x/0", false);
t("D6 'fact(x)' vs 0 (NaN en todo punto)", { type: "expr", expected: "0" }, "fact(x)", false);
t("D7 'sqrt(-1-x^2-y^2)' vs 0 (rama no finita)", { type: "expr", expected: "0" }, "1/(x-x-x+x)", false);
t("D8 'exp(1000)*x' vs 1 (overflow a Inf)", { type: "expr", expected: "1" }, "exp(1000)*x", false);
t("D9 '9^9^9' vs 0 (overflow)", { type: "expr", expected: "0" }, "9^9^9", false);
t("D10 celda matriz '1/(x-x)' vs '3'", { type: "matrix", rows: 1, cols: 1, expected: [["3"]] }, [["1/(x-x)"]], false);
t("D11 number '1/(x-x)' vs 7", { type: "number", expected: "7" }, "1/(x-x)", false);
t("D12 exprset '1/(x-x);2' vs ['1','2']", { type: "exprset", expected: ["1", "2"] }, "1/(x-x);2", false);

console.log("--- E. ataques a C5 (variables en distinto punto) ---");
t("E1 'x/y' vs 1", { type: "expr", expected: "1" }, "x/y", false);
t("E2 'x-y' vs 0 (ya A1, refuerzo)", { type: "expr", expected: "0" }, "x-y", false);
t("E3 'sin(x)-sin(y)' vs 0", { type: "expr", expected: "0" }, "sin(x)-sin(y)", false);
t("E4 'x^3-y^3' vs 0", { type: "expr", expected: "0" }, "x^3-y^3", false);
t("E5 'x1-x2' vs 0", { type: "expr", expected: "0" }, "x1-x2", false);
t("E6 'x+0*y' vs 'x' (debe aceptar: sí son iguales)", { type: "expr", expected: "x" }, "x+0*y", true);
t("E7 'x-x' vs 0 (debe aceptar: identidad)", { type: "expr", expected: "0" }, "x-x", true);
t("E8 '(x+y)-(y+x)' vs 0 (identidad)", { type: "expr", expected: "0" }, "(x+y)-(y+x)", true);
t("E9 'x*y' vs 'y*x' (conmutatividad)", { type: "expr", expected: "y*x" }, "x*y", true);
t("E10 'cos(x)^2+sin(x)^2' vs 1 (identidad trig)", { type: "expr", expected: "1" }, "cos(x)^2+sin(x)^2", true);
t("E11 'x^2-y^2' vs '(x-y)(x+y)'", { type: "expr", expected: "(x-y)*(x+y)" }, "x^2-y^2", true);
t("E12 'tan(x)' vs 'sin(x)/cos(x)'", { type: "expr", expected: "sin(x)/cos(x)" }, "tan(x)", true);

console.log("--- F. colisión de muestreo con ≥9 variables (hardening C5) ---");
t("F1 '(a1-a9)+(a2-a2)+(a3-a3)+(a4-a4)+(a5-a5)+(a6-a6)+(a7-a7)+(a8-a8)' vs 0", { type: "expr", expected: "0" }, "(a1-a9)+(a2-a2)+(a3-a3)+(a4-a4)+(a5-a5)+(a6-a6)+(a7-a7)+(a8-a8)", false);
t("F2 'a1-a2' vs 0 (2 vars, sin colisión)", { type: "expr", expected: "0" }, "a1-a2", false);
t("F3 'a-b+c-d+e-f+g-h+i-i' vs 0 (NO es identidad: debe rechazar)", { type: "expr", expected: "0" }, "a-b+c-d+e-f+g-h+i-i", false);
t("F4 '(a1-a9)*0' vs 0 (identidad real)", { type: "expr", expected: "0" }, "(a1-a9)*0", true);

console.log("--- G. polinomio que se anula en los puntos de muestreo ---");
const P = [
  "(x-(0.371+0.217i))", "(x-(-1.283+0.619i))", "(x-(2.117-0.733i))", "(x-(-0.519-1.341i))",
  "(x-(1.618+1.173i))", "(x-(-2.271+0.451i))", "(x-(0.829-2.137i))", "(x-(3.041-0.617i))",
];
const poly = P.join("*");
t("G1 polinomio(x)=0 en los 8 puntos vs expected 0", { type: "expr", expected: "0" }, poly, false);
t("G2 polinomio+5 vs expected 5", { type: "expr", expected: "5" }, poly + "+5", false);

console.log("--- H. multi incompleto / extremos de tipos ---");
t("H1 multi sin campo b", { type: "multi", fields: { a: { type: "number", expected: "2" }, b: { type: "number", expected: "3" } } }, { a: "2" }, false);
t("H2 multi con null", { type: "multi", fields: { a: { type: "number", expected: "2" } } }, { a: null }, false);
t("H3 multi con undefined", { type: "multi", fields: { a: { type: "expr", expected: "1" } } }, { a: undefined }, false);
t("H4 multi con campos extras (ignorar)", { type: "multi", fields: { a: { type: "number", expected: "2" } } }, { a: "2", zzz: "basura" }, true);
t("H5 multi respuesta no-objeto", { type: "multi", fields: { a: { type: "number", expected: "2" } } }, "2", false);
t("H6 choice null → mensaje", { type: "choice", expected: 0 }, null, false);
t("H7 bool null → mensaje", { type: "bool", expected: true }, null, false);
t("H8 bool '' → mensaje", { type: "bool", expected: true }, "", false);
t("H9 text con espacios extra", { type: "text", expected: "1211" }, "  1211  ", true);
t("H10 text mayúsculas", { type: "text", expected: "verdadero" }, "Verdadero", false);
t("H11 exprset duplicados", { type: "exprset", expected: ["1", "2"] }, "1;1", false);
t("H12 exprset de más", { type: "exprset", expected: ["1"] }, "1;2", false);
t("H13 number expectedOneOf", { type: "number", expectedOneOf: ["1/2", "0.5"] }, "0,5", true);
t("H14 expr expectedOneOf", { type: "expr", expectedOneOf: ["pi/2", "90"] }, "3,14159265358979/2", true);
t("H15 spec vacío", {}, "x", false);
t("H16 spec null", null, "x", false);
t("H17 tipo inventado", { type: "unicornio", expected: "1" }, "1", false);
t("H18 multi fields null", { type: "multi", fields: null }, {}, false);

console.log("--- I. entradas extremas (no crash / no bucle) ---");
t("I1 10k caracteres", { type: "expr", expected: "1" }, "1+".repeat(5000) + "1", false);
t("I2 9999 paréntesis", { type: "expr", expected: "1" }, "(".repeat(9999) + "1" + ")".repeat(9999), false);
t("I3 '<script>'", { type: "expr", expected: "1" }, "<script>alert(1)</script>", false);
t("I4 objeto", { type: "expr", expected: "1" }, { toString: () => "x-y" }, false);
t("I5 array", { type: "expr", expected: "1" }, [1, 2, 3], false);
t("I6 null", { type: "expr", expected: "1" }, null, false);
t("I7 undefined", { type: "expr", expected: "1" }, undefined, false);
t("I8 '2..3' número inválido", { type: "number", expected: "2" }, "2..3", false);
t("I9 'x^^2'", { type: "expr", expected: "x^2" }, "x^^2", false);
t("I10 '999999!'", { type: "number", expected: "1" }, "999999!", false);
t("I11 matriz '[[1,2],[3]'", { type: "matrix", expected: [["1"]] }, "[[1,2],[3]", false);
t("I12 matriz '1 2; 3'", { type: "matrix", expected: [["1"]] }, "1 2; 3", false);
t("I13 matrix desde objeto", { type: "matrix", expected: [["1"]] }, { fila: 1 }, false);
t("I14 emoji", { type: "expr", expected: "1" }, "🧮", false);
t("I15 string gigante en text", { type: "text", expected: "a" }, "x".repeat(100000), false);

console.log("--- J. exactitud de números ---");
t("J1 exact '2.0' vs 2", { type: "number", expected: "2", exact: true }, "2.0", true);
t("J2 exact '2.0000001' vs 2", { type: "number", expected: "2", exact: true }, "2.0000001", false);
t("J3 exact '4/2' vs 2", { type: "number", expected: "2", exact: true }, "4/2", true);
t("J4 exact '-0' vs 0", { type: "number", expected: "0", exact: true }, "-0", true);
t("J5 exact '1e3' vs 1000", { type: "number", expected: "1000", exact: true }, "1e3", true);

/* ================= SET-S · basura contra la capa estructural ================= */
console.log("\n--- SET-S. entradas basura / explosión polinómica acotada (sin crash) ---");
const t0 = (f) => { const a = Date.now(); const r = f(); return [r, Date.now() - a]; };
function tS(nombre, spec, respuesta, esperadoAcepta, maxMs) {
  n++;
  let r, ms;
  try {
    [r, ms] = t0(() => G.check(spec, respuesta));
  } catch (e) {
    fallos++;
    console.log(`✘ ${nombre}: CRASH ${e.message}`);
    return;
  }
  const bien = r.ok === esperadoAcepta && (!maxMs || ms <= maxMs);
  if (!bien) fallos++;
  console.log(`${bien ? "✔" : "✘"} ${nombre}: grader=${r.ok ? "ACEPTA" : "RECHAZA"} (debía ${esperadoAcepta ? "aceptar" : "rechazar"}) ${ms}ms${maxMs ? " (máx " + maxMs + "ms)" : ""}${r.error ? " [" + r.error + "]" : ""}`);
}
tS("S1 '(((x)))' vs x", { type: "expr", expected: "x" }, "(((x)))", true, 200);
tS("S2 '(x+y)^2' vs 'x^2+2xy+y^2' (desarrollo)", { type: "expr", expected: "x^2+2*x*y+y^2" }, "(x+y)^2", true, 200);
tS("S3 'sin(x)*sin(x)' vs 'sin(x)^2' (átomos)", { type: "expr", expected: "sin(x)^2" }, "sin(x)*sin(x)", true, 200);
tS("S4 'log(x)*log(y)' vs 'log(y)*log(x)'", { type: "expr", expected: "log(y)*log(x)" }, "log(x)*log(y)", true, 200);
tS("S5 'sqrt(x)^2' vs x (identidad verdadera)", { type: "expr", expected: "x" }, "sqrt(x)^2", true, 200);
tS("S6 'x^(1/2)' vs 'sqrt(x)'", { type: "expr", expected: "sqrt(x)" }, "x^(1/2)", true, 200);
tS("S7 'x^(-2)' vs '1/x^2'", { type: "expr", expected: "1/x^2" }, "x^(-2)", true, 200);
tS("S8 '1/(1+1/(1+1/x))' vs forma racional equivalente", { type: "expr", expected: "(x+1)/(2*x+1)" }, "1/(1+1/(1+1/x))", true, 300);
tS("S9 '(x+y+z)^20' vs 1 (expansión 231 monomios)", { type: "expr", expected: "1" }, "(x+y+z)^20", false, 3000);
tS("S10 '(x+y)^2000' vs 1 (expansión 2001 monomios)", { type: "expr", expected: "1" }, "(x+y)^2000", false, 4000);
tS("S11 '(x+y)^(-300)' vs 0 (recíproco)", { type: "expr", expected: "0" }, "(x+y)^(-300)", false, 4000);
tS("S12 multi con valores objeto/array", { type: "multi", fields: { a: { type: "expr", expected: "1" } } }, { a: { x: 1 } }, false, 200);
tS("S13 multi con todos los campos vacíos", { type: "multi", fields: { a: { type: "expr", expected: "1" }, b: { type: "expr", expected: "2" } } }, { a: "", b: "" }, false, 200);
tS("S14 expr con 5000 términos '1+1+…' vs 5000", { type: "expr", expected: "5000" }, "1+".repeat(4999) + "1", true, 2000);
tS("S15 'x-x' vs 0 tras capa estructural", { type: "expr", expected: "0" }, "x-x", true, 200);
tS("S16 matriz celda con '(x+y)^3' vs desarrollo", { type: "matrix", rows: 1, cols: 1, expected: [["x^3+3*x^2*y+3*x*y^2+y^3"]] }, [["(x+y)^3"]], true, 300);
tS("S17 exprset con expresiones largas equivalentes", { type: "exprset", expected: ["x+y", "x*y"] }, ["y+x", "y*x"], true, 300);
tS("S18 'NaN' / 'Infinity' literales", { type: "expr", expected: "1" }, "NaN+Infinity", false, 200);
tS("S19 unicode homógrafo 'х' (cirílico) vs 'x'", { type: "expr", expected: "x" }, "х", false, 200);
tS("S20 null bytes y escapes", { type: "expr", expected: "1" }, "\\x00\\n\\t", false, 200);

/* ================= SET-H · specs multi malformados (familia N6) ================= */
console.log("\n--- SET-H. multi/specs malformados (N6: debe RECHAZAR salvo H4/B18) ---");
t("H19 multi fields {} (objeto vacío)", { type: "multi", fields: {} }, {}, false);
t("H20 multi fields 0", { type: "multi", fields: 0 }, {}, false);
t("H21 multi fields 'basura'", { type: "multi", fields: "basura" }, {}, false);
t("H22 multi fields {a:null} con respuesta {}", { type: "multi", fields: { a: null } }, {}, false);
t("H23 spec {type:'multi'} sin fields", { type: "multi" }, {}, false);

/* ================= SET-CONSISTENCIA · los 111 drills del banco ================= */
console.log("\n--- SET-CONSISTENCIA. auto-corrección de los 111 drills + timing ---");
const DATA_DIR = path.join(__dirname, "..", "..", "..", "assets", "data");
global.window = {};
for (const f of fs.readdirSync(DATA_DIR).filter((x) => x.endsWith(".js"))) {
  eval(fs.readFileSync(path.join(DATA_DIR, f), "utf8"));
}
const D = global.window.CURSO_DATA;
let totalDrills = 0, autoOk = 0, autoFail = [], slowest = { ms: 0 };
function studentAnswer(spec) {
  if (!spec) return null;
  const t = spec.type;
  if (t === "multi") {
    const out = {};
    for (const k of Object.keys(spec.fields || {})) out[k] = studentAnswer(spec.fields[k]);
    return out;
  }
  if (t === "matrix" || t === "vector") return spec.expected.map((row) => row.map(String));
  if (t === "exprset") return (spec.expected || []).map(String);
  if (t === "choice") return spec.expected;
  if (t === "bool") return spec.expected ? "true" : "false";
  return String(spec.expectedOneOf ? spec.expectedOneOf[0] : spec.expected);
}
for (const k of Object.keys(D)) {
  const list = D[k].drills || (D[k].exam && D[k].exam.questions) || [];
  for (const q of list) {
    totalDrills++;
    const spec = q.answer || {};
    const a = Date.now();
    let r;
    try {
      r = G.check(spec, studentAnswer(spec));
    } catch (e) {
      r = { ok: false, error: "CRASH " + e.message };
    }
    const ms = Date.now() - a;
    if (ms > slowest.ms) slowest = { ms, id: q.id };
    if (r.ok) autoOk++;
    else autoFail.push(q.id + (r.error ? " [" + r.error + "]" : ""));
  }
}
check(autoOk === 111 && totalDrills === 111,
  `auto-consistencia: ${autoOk}/${totalDrills} drills aceptan su propia respuesta esperada${autoFail.length ? " · FALLOS " + autoFail.join(", ") : ""}`);
check(slowest.ms < 250, `timing: drill más lento ${slowest.id} = ${slowest.ms}ms (máx 250ms)`);

console.log(`  · total drills del banco: ${totalDrills}`);
console.log(`  · timing: más lento = ${slowest.id} ${slowest.ms}ms`);

/* ================= SET-R7 · la familia M1–M12 debe rechazar SIEMPRE ================= */
console.log("\n--- SET-R7. exploits de rama (R7 §7): rechazo determinista ×10 runs ---");
const R7 = [
  ["M1  E+2log(x+3.5)-log((x+3.5)^2)", { type: "expr", expected: "5" }, "5+2*log(x+3.5)-log((x+3.5)^2)"],
  ["M5  E+log(x+5)+log(y+5)-log((x+5)(y+5))", { type: "expr", expected: "5" }, "5+log(x+5)+log(y+5)-log((x+5)*(y+5))"],
  ["M7  sqrt((x+5)(y+5)) vs sqrt(x+5)sqrt(y+5)", { type: "expr", expected: "sqrt((x+5)*(y+5))" }, "sqrt(x+5)*sqrt(y+5)"],
  ["M9  exploit universal sobre T4-N3", { type: "expr", expected: "4-s-t" }, "4-s-t+log(x+5)+log(y+5)-log((x+5)*(y+5))"],
  ["M10 exploit sobre T4-M5 (exprset)", { type: "exprset", expected: ["4", "-2"] }, ["4+log(x+5)+log(y+5)-log((x+5)*(y+5))", "-2"]],
  ["M11 exploit sobre T5-N5 (matriz)", { type: "matrix", rows: 2, cols: 2, expected: [["1/2", "0"], ["0", "1/4"]] }, [["1/2+log(x+5)+log(y+5)-log((x+5)*(y+5))", "0"], ["0", "1/4"]]],
  ["M12 E+log(exp((x+5)/20))-(x+5)/20", { type: "expr", expected: "5" }, "5+log(exp((x+5)/20))-(x+5)/20"],
];
let r7Fallos = 0, r7Runs = 0;
for (const [nombre, spec, ans] of R7) {
  let accepted = 0;
  for (let i = 0; i < 10; i++) {
    r7Runs++;
    if (G.check(spec, ans).ok) accepted++;
  }
  if (accepted !== 0) { r7Fallos++; fallos++; }
  console.log(`${accepted === 0 ? "✔" : "✘"} ${nombre}: aceptado en ${accepted}/10 runs (debía 0/10)`);
}
n += R7.length;

console.log(`\nResumen R8: ${fallos} desajustes de ${n} casos (batería R2 + S + H + R7; consistencia 111 aparte)`);
console.log(`SET-R7: ${r7Runs} runs, ${r7Fallos} casos con falso positivo`);
process.exit(fallos ? 1 : 0);
