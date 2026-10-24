/* ÁRBITRO R2 · ataque al grader — casos NUEVOS no probados en la ronda 1.
   Cubre: tipo text, exact, exprset con duplicados, multi con campos vacíos,
   matrices 1×1, inf/nan, sustracción de tolerancias, i vs variable i,
   alias de constantes y artefactos del parser. */
const G = require("../../../assets/js/grader.js");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

let fallos = 0;
function t(nombre, spec, respuesta, esperadoAcepta) {
  const r = G.check(spec, respuesta);
  const bien = r.ok === esperadoAcepta;
  if (!bien) fallos++;
  console.log(`${bien ? "✔" : "✘"} ${nombre}: grader=${r.ok ? "ACEPTA" : "RECHAZA"} (debía ${esperadoAcepta ? "aceptar" : "rechazar"})${r.error ? " [" + r.error + "]" : ""}`);
}

// ---------- carga de specs REALES ----------
const ROOT = path.join(__dirname, "..", "..", "..");
function load(file) {
  const src = fs.readFileSync(path.join(ROOT, "assets", "data", file + ".js"), "utf8");
  const sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(src, sb);
  const obj = sb.window.CURSO_DATA[Object.keys(sb.window.CURSO_DATA)[0]];
  const items = obj.drills || (obj.exam && obj.exam.questions) || [];
  const map = {};
  for (const q of items) map[q.id] = q.answer;
  return map;
}
const t1 = load("tema-1"), x1 = load("examen-1"), t4 = load("tema-4"), t5 = load("tema-5"), x3 = load("examen-3");

console.log("--- E. TIPO TEXT (secuencia de cifras) con specs REALES ---");
t("E1 T1-N2 '2220' correcto", t1["T1-N2"], "2220", true);
t("E2 T1-N2 '222*10' (R1 A17)", t1["T1-N2"], "222*10", false);
t("E3 T1-N2 '2.220e3'", t1["T1-N2"], "2.220e3", false);
t("E4 X1-1 '1211' correcto", x1["X1-1"], "1211", true);
t("E5 X1-1 '1.211e3' (R1 A16)", x1["X1-1"], "1.211e3", false);
t("E6 X1-1 '01211' con cero delante", x1["X1-1"], "01211", false);
t("E7 X1-1 '1211 ' (con espacio, trim)", x1["X1-1"], "1211 ", true);
t("E8 X1-1 '1 211' (espacio interno)", x1["X1-1"], "1 211", false);
t("E9 text vs 'abc' con 'ABC'", { type: "text", expected: "abc" }, "ABC", false);
t("E10 text vacío", { type: "text", expected: "1211" }, "", false);
t("E11 text dígitos unicode '１２１１'", x1["X1-1"], "１２１１", false);
t("E12 T1-N2 número 2220 (no string)", t1["T1-N2"], 2220, true);

console.log("--- F. EXACT ---");
t("F1 exact '2' vs '2'", { type: "number", expected: "2", exact: true }, "2", true);
t("F2 exact '2' vs '2.0000000001'", { type: "number", expected: "2", exact: true }, "2.0000000001", false);
t("F3 exact '2' vs 'sqrt(4)' (valor igual, entero)", { type: "number", expected: "2", exact: true }, "sqrt(4)", true);
t("F4 exact '2' vs '6/3'", { type: "number", expected: "2", exact: true }, "6/3", true);
t("F5 exact '2' vs '1.9999999'", { type: "number", expected: "2", exact: true }, "1.9999999", false);
t("F6 exact '2' vs '-2'", { type: "number", expected: "2", exact: true }, "-2", false);
t("F7 exact '2' vs '2+0i'", { type: "number", expected: "2", exact: true }, "2+0*i", true);
t("F8 exact '2' vs '2+i'", { type: "number", expected: "2", exact: true }, "2+i", false);
t("F9 TRAMPA API: exact con expected NO entero '1/2' vs '0.5' (imposible de aprobar)", { type: "number", expected: "1/2", exact: true }, "0.5", false);
t("F10 matriz exact '2' vs '2.0'", { type: "matrix", rows: 1, cols: 1, expected: [["2"]], exact: true }, [["2.0"]], true);
t("F11 matriz exact '2' vs '1/0'", { type: "matrix", rows: 1, cols: 1, expected: [["2"]], exact: true }, [["1/0"]], false);

console.log("--- G. EXPRSET CON DUPLICADOS ---");
t("G1 esperado ['2','2'] con '2;2'", { type: "exprset", expected: ["2", "2"] }, "2;2", true);
t("G2 esperado ['2','2'] con '2' (una vez)", { type: "exprset", expected: ["2", "2"] }, "2", false);
t("G3 esperado ['2','3'] con '2;2'", { type: "exprset", expected: ["2", "3"] }, "2;2", false);
t("G4 esperado ['2','2'] con '2;3'", { type: "exprset", expected: ["2", "2"] }, "2;3", false);
t("G5 T1-M4 con '2;2;2' (duplicados)", t1["T1-M4"], "2;2;2", false);
t("G6 T1-M4 correcto en orden alterado", t1["T1-M4"], "-1-sqrt(3)*i;2;-1+sqrt(3)*i", true);
t("G7 T1-M4 con ';2;;' (vacíos)", t1["T1-M4"], ";2;;", false);
t("G8 T1-M4 con 4 elementos", t1["T1-M4"], "2;-1+sqrt(3)*i;-1-sqrt(3)*i;0", false);

console.log("--- H. MULTI CON CAMPOS VACÍOS / FANTASMA ---");
const multiX310 = x3["X3-10"];
t("H1 X3-10 correcto", multiX310, { det2: "256", trinv: "1/4" }, true);
t("H2 X3-10 trinv vacío", multiX310, { det2: "256", trinv: "" }, false);
t("H3 X3-10 sin campo trinv", multiX310, { det2: "256" }, false);
t("H4 X3-10 answer {}", multiX310, {}, false);
t("H5 X3-10 answer null", multiX310, null, false);
t("H6 X3-10 con campo fantasma extra", multiX310, { det2: "256", trinv: "1/4", extra: "999" }, true);
t("H7 X3-10 det2 no entero con exact", multiX310, { det2: "256.0000001", trinv: "1/4" }, false);

console.log("--- I. MATRICES 1×1 ---");
t("I1 1×1 '5' vs '5'", { type: "matrix", rows: 1, cols: 1, expected: [["5"]] }, "5", true);
t("I2 1×1 '[[5]]' JSON", { type: "matrix", rows: 1, cols: 1, expected: [["5"]] }, "[[5]]", true);
t("I3 1×1 '5;5' (2 filas)", { type: "matrix", rows: 1, cols: 1, expected: [["5"]] }, "5;5", false);
t("I4 1×1 '5 5' (2 cols)", { type: "matrix", rows: 1, cols: 1, expected: [["5"]] }, "5 5", false);
t("I5 1×1 'sqrt(25)' vs '5'", { type: "matrix", rows: 1, cols: 1, expected: [["5"]] }, "sqrt(25)", true);
t("I6 1×1 vacía", { type: "matrix", rows: 1, cols: 1, expected: [["5"]] }, "", false);
t("I7 1×1 'x-y' vs '0' (R1 A10)", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [["x-y"]], false);
t("I8 vector 1×1 '3'", { type: "vector", rows: 1, cols: 1, expected: [["3"]] }, "3", true);
t("I9 matriz con fila vacía '1;;2'", { type: "matrix", rows: 3, cols: 1, expected: [["1"], ["2"], ["3"]] }, "1;;2", false);

console.log("--- J. INF / NAN / NO FINITOS ---");
t("J1 expr 'inf' vs '5'", { type: "expr", expected: "5" }, "inf", false);
t("J2 expr '1/0' vs '0'", { type: "expr", expected: "0" }, "1/0", false);
t("J3 number 'nan'", { type: "number", expected: "0" }, "nan", false);
t("J4 number '1e309' vs '1e309' (ambos infinitos)", { type: "number", expected: "1e309" }, "1e309", false);
t("J5 matriz celda 'inf' vs '1'", { type: "matrix", rows: 1, cols: 1, expected: [["1"]] }, [["inf"]], false);
t("J6 expr 'log(0)' vs '-5'", { type: "expr", expected: "-5" }, "log(0)", false);
t("J7 expr 'sqrt(-1)' vs 'i' (finito, debe aceptar)", { type: "expr", expected: "i" }, "sqrt(-1)", true);
t("J8 expr 'x*inf' vs 'x' (no finito en todo punto)", { type: "expr", expected: "x" }, "x*inf", false);
t("J9 expr '1/(x-x)+5' vs '5' (finito en ningún punto)", { type: "expr", expected: "5" }, "1/(x-x)+5", false);
t("J10 expr '5+0*(x-x)/(x-x)' vs '5' (0/0 = NaN en todo punto)", { type: "expr", expected: "5" }, "5+0*(x-x)/(x-x)", false);

console.log("--- K. SUSTRACCIÓN DE TOLERANCIAS ---");
t("K1 expr '1+1e-9' vs '1'", { type: "expr", expected: "1" }, "1+1e-9", true);
t("K2 number '0' vs '5e-7' (tol 1e-6 absoluta cerca de 0)", { type: "number", expected: "0" }, "5e-7", true);
t("K3 number '0' vs '2e-6'", { type: "number", expected: "0" }, "2e-6", false);
t("K4 expr '1000000+0.4' vs '1000000' (tol relativa: error absoluto 0,4)", { type: "expr", expected: "1000000" }, "1000000+0.4", true);
t("K5 expr '1000000+2' vs '1000000'", { type: "expr", expected: "1000000" }, "1000000+2", false);
t("K6 X3-10 trinv '0.2500002' vs '1/4'", multiX310, { det2: "256", trinv: "0.2500002" }, true);
t("K7 X3-10 trinv '0.250002' vs '1/4'", multiX310, { det2: "256", trinv: "0.250002" }, false);
t("K7b X3-10 trinv '0.250001' vs '1/4' (borde exacto de la tolerancia)", multiX310, { det2: "256", trinv: "0.250001" }, true);
t("K8 T1-N5 redondeo '2.3400004' vs '2.34'", t1["T1-N5"], "2.3400004", true);
t("K9 T1-N5 redondeo '2.35' vs '2.34'", t1["T1-N5"], "2.35", false);

console.log("--- L. i VS VARIABLE i / ALIAS DE CONSTANTES ---");
t("L1 expr 'i' vs 'i' (unidad imaginaria)", { type: "expr", expected: "i" }, "i", true);
t("L2 expr 'j' vs 'i' (alias j=I)", { type: "expr", expected: "i" }, "j", true);
t("L3 expr 'I' vs 'i' (alias I)", { type: "expr", expected: "i" }, "I", true);
t("L4 expr 'x*i' vs 'x*i'", { type: "expr", expected: "x*i" }, "x*i", true);
t("L5 expr 'x*i' vs 'x*I'", { type: "expr", expected: "x*i" }, "x*I", true);
t("L6 expr 'e' vs 'exp(1)'", { type: "expr", expected: "exp(1)" }, "e", true);
t("L7 expr 'n' vs 'n' (variable)", { type: "expr", expected: "n" }, "n", true);
t("L8 expr 'i' vs '1' (no aceptar)", { type: "expr", expected: "1" }, "i", false);
t("L9 expr '2i' vs '2*i' (R1 B2)", { type: "expr", expected: "2*i" }, "2i", true);
t("L10 expr 'i*i' vs '-1'", { type: "expr", expected: "-1" }, "i*i", true);

console.log("--- M. PARSER / SINTAXIS NUEVA ---");
t("M1 'sin x' vs 'sin(x)' (sin paréntesis)", { type: "expr", expected: "sin(x)" }, "sin x", false);
t("M2 'sin(x)' vs 'sin(x)'", { type: "expr", expected: "sin(x)" }, "sin(x)", true);
t("M3 'sinx' vs 'sin(x)'", { type: "expr", expected: "sin(x)" }, "sinx", false);
t("M4 '2x' vs '2*x' (implícita)", { type: "expr", expected: "2*x" }, "2x", true);
t("M5 '-2^2' vs '-4' (R1 B13)", { type: "expr", expected: "-4" }, "-2^2", true);
t("M6 '2^3^2' derecha: 2^(3^2)=512", { type: "number", expected: "512", exact: true }, "2^3^2", true);
t("M7 'x y' vs 'x*y' (espacio = producto)", { type: "expr", expected: "x*y" }, "x y", true);
t("M8 'π' vs 'pi' (R1 B6)", { type: "expr", expected: "pi" }, "π", true);
t("M9 choice '01' con expected 1", { type: "choice", expected: 1 }, "01", true);
t("M10 choice '+1'", { type: "choice", expected: 1 }, "+1", false);
t("M11 choice '1\\n' con salto de línea", { type: "choice", expected: 1 }, "1\n", true);
t("M12 bool 'SÍ' mayúsculas+acento", { type: "bool", expected: true }, "SÍ", true);
t("M13 bool '0.0'", { type: "bool", expected: true }, "0.0", false);
t("M14 bool 'yes'", { type: "bool", expected: true }, "yes", false);

console.log("--- N. SPECS REALES: CIERRE R1 + regresiones ---");
t("N1 T4-N3 '4-2*t' vs '4-s-t' (R1 C2)", t4["T4-N3"], "4-2*t", false);
t("N2 T4-N3 '4-s-t' correcto", t4["T4-N3"], "4-s-t", true);
t("N3 T5-E3 celda '3/10' correcta", t5["T5-E3"], [["3/10", "-1/10"], ["1/10", "3/10"]], true);
t("N4 T5-E3 matriz transpuesta errónea (1/10·A)", t5["T5-E3"], [["3/10", "1/10"], ["-1/10", "3/10"]], false);
t("N5 X3-12 Adag correcto", x3["X3-12"], { Adag: [["1/10", "1/5"], ["1/10", "1/5"]], x: [["6/5"], ["6/5"]] }, true);
t("N6 X3-12 x erróneo", x3["X3-12"], { Adag: [["1/10", "1/5"], ["1/10", "1/5"]], x: [["6/5"], ["5/6"]] }, false);
t("N7 T4-M5 exprset 'i;-i' con 'i; -i' (espacios)", t4["T4-M5"], "i; -i", true);
t("N8 T4-M5 exprset 'I;-j' (alias I y j del imaginario)", t4["T4-M5"], "I;-j", true);
t("N8b T4-M5 exprset 'i;j' (j=+i, no vale para -i)", t4["T4-M5"], "i;j", false);
t("N8c T4-M5 exprset 'i;-J' (J mayúscula NO es alias: es variable libre)", t4["T4-M5"], "i;-J", false);
t("N9 T5-N5 con punto decimal '0.5 0;0 0.25'", t5["T5-N5"], "0.5 0;0 0.25", true);
t("N9b T5-N5 con COMA decimal '0,5 0;0 0,25' (schema.md promete coma válida)", t5["T5-N5"], "0,5 0;0 0,25", true);

console.log("--- O. EXPLOIT DE MUESTREO (puntos fijos públicos) ---");
// El grader evalúa en 8 puntos COMPLEJOS fijos hardcodeados (grader.js:416-425).
// Un polinomio que se anule exactamente en esos 8 puntos hace que CUALQUIER
// respuesta falsa pase la comparación (compared=8, todas iguales).
const P = [
  "0.371+0.217i", "-1.283+0.619i", "2.117-0.733i", "-0.519-1.341i",
  "1.618+1.173i", "-2.271+0.451i", "0.829-2.137i", "3.041-0.617i",
];
const vanish = P.map((p) => "(x-(" + p + "))").join("*");
t("O1 polinomio anulador en los 8 puntos vs '5' (debe rechazar)", { type: "expr", expected: "5" }, "5+" + vanish, false);
t("O2 el mismo polinomio vs '0' (debe rechazar)", { type: "expr", expected: "0" }, vanish, false);
// Variante multivariable: con >=9 variables libres, env[k]=points[(k+t)%8] hace
// que las variables de índice k y k+8 reciban SIEMPRE el mismo valor.
const alias = "4-s-t+0*(v1+v2+v3+v4+v5+v6)+(s-v7)";
t("O3 alias de variables por wrap-around vs '4-s-t' (T4-N3)", t4["T4-N3"], alias, false);
// Celda de matriz con el exploit
t("O4 celda matriz con polinomio anulador vs '0'", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [[vanish]], false);
// exprset con el exploit: i+vanish ≡ i en los 8 puntos
t("O5 exprset T4-M5 con 'i+polinomio anulador' como 'i'", t4["T4-M5"], "i+(" + vanish + ");-i", false);

console.log("\nResumen R2: " + fallos + " desajustes frente al criterio matemático");
process.exit(fallos ? 1 : 0);
