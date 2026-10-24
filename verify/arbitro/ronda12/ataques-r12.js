/* verify/arbitro/ronda12/ataques-r12.js — Ronda 12: catálogo de ataques
   sobre las fichas nuevas de los temas 4 y 5 (ampliación del 2026-10-21).

   Cada caso es una identidad:
     · FN  — identidad VERDADERA que el motor NO debe rechazar.
     · FP  — identidad FALSA que el motor NO debe aceptar.
   La especificación se toma del banco real (assets/data/tema-4.js, tema-5.js),
   no se copia a mano: así el arnés no puede quedar obsoleto.

   Uso:
     node verify/arbitro/ronda12/ataques-r12.js           → informe (exit 0)
     node verify/ar_bitro/ronda12/ataques-r12.js --check   → exit 1 si hay discrepancias

   Los casos marcados `abierto: true` son cuestiones de CONTRATO pendientes de
   dictamen. Desde el dictamen de H-2 (R12, §3 del informe) ya no queda ninguno:
   los dos casos que lo planteaban se han reclasificado como `CON` con el
   veredicto que el dictamen les asignó.

   En esta fase NO se toca assets/js/grader.js: el motor está auditado y en
   verde. Un hallazgo solo se cierra con certificación SymPy.
*/
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..", "..");
const Grader = require(path.join(RAIZ, "assets", "js", "grader.js"));

/* ---------- carga del banco ---------- */
function cargarBanco() {
  const ctx = { window: {} };
  ctx.window.CURSO_DATA = {};
  vm.createContext(ctx);
  for (const f of ["tema-4.js", "tema-5.js"]) {
    const p = path.join(RAIZ, "assets", "data", f);
    vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
  }
  const mapa = {};
  for (const key of ["tema-4", "tema-5"]) {
    for (const d of ctx.window.CURSO_DATA[key].drills) mapa[d.id] = d;
  }
  return mapa;
}

/* ---------- construcción de respuestas ---------- */
function valorEsperado(spec) {
  switch (spec.type) {
    case "matrix":
    case "vector":
      return spec.expected.map((f) => f.map(String));
    case "exprset":
      return spec.expected.map(String);
    case "choice":
      return String(spec.expected);
    default:
      return String(spec.expected);
  }
}

// Respuesta completa de un drill, con los campos indicados sustituidos.
function construirRespuesta(drill, cambios) {
  const a = drill.answer;
  if (a.type !== "multi") {
    if (!cambios || !("valor" in cambios)) return valorEsperado(a);
    return cambios.valor;
  }
  const resp = {};
  for (const [k, sub] of Object.entries(a.fields)) resp[k] = valorEsperado(sub);
  for (const [k, v] of Object.entries(cambios || {})) {
    if (k === "valor") continue;
    resp[k] = v;
  }
  return resp;
}

/* ---------- catálogo de ataques ---------- */
// clase: "FN" (identidad verdadera, no debe rechazar) | "FP" (falsa, no debe aceptar)
//         | "TOL" (tolerancia deliberada: el motor DEBE aceptarlo)
// debe:  "acepta" | "rechaza"
// abierto: true → cuestión de contrato sin veredicto; no cuenta como discrepancia
// clase "CON" → la identidad es válida en matemáticas, pero el enunciado fija un
//                representante, luego el rechazo del motor es lo correcto
const CASOS = [
  // ---------------------------------------------------------------- T4-N7
  {
    ficha: "T4-N7", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: [["1", "-1", "-5"], ["0", "0.5", "2"], ["0", "0", "-1"]] },
    por: "0.5 y 1/2 son el mismo racional; la celda debe compararse en Q.",
    sympy: "sp.Rational(1,2) == sp.Rational('0.5')",
  },
  {
    ficha: "T4-N7", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { valor: [["1", "-1", "-5"], ["0", "2/4", "2"], ["0", "0", "-1"]] },
    por: "2/4 es la misma fracción que 1/2.",
    sympy: "sp.Rational(2,4) == sp.Rational(1,2)",
  },
  {
    ficha: "T4-N7", caso: "FN-03", clase: "FN", debe: "acepta",
    cambios: { valor: [["1", "(-1)", "-5"], ["0", "1/2", "2"], ["0", "0", "-1"]] },
    por: "El paréntesis no cambia el valor; debe normalizarse.",
    sympy: "sp.Integer(-1) == sp.Integer(-1)",
  },
  {
    ficha: "T4-N7", caso: "FN-04", clase: "FN", debe: "acepta",
    cambios: { valor: [["1", "-1", "-5.0"], ["0", "1/2", "2"], ["0", "0", "-1"]] },
    por: "-5.0 es el mismo real que -5.",
    sympy: "sp.Float('-5.0') == sp.Integer(-5)",
  },
  {
    ficha: "T4-N7", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: [["1", "-1", "-5"], ["0", "2", "2"], ["0", "0", "-1"]] },
    por: "Error de recíproco: b22 = 1/u22 = 1/2, no 2. Con 2, la fila 2 no anula la 2.ª columna de U.",
    sympy: "sp.Matrix([[1,-1,-5],[0,2,2],[0,0,-1]]).inv() != U.inv()",
  },
  {
    ficha: "T4-N7", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: [["1", "-1", "5"], ["0", "1/2", "2"], ["0", "0", "-1"]] },
    por: "Signo de b13: la fila 1 debe anular la 3.ª columna de U (-1,4,-1); con 5 no lo hace.",
    sympy: "sp.Matrix([[1,-1,5],[0,sp.Rational(1,2),2],[0,0,-1]])*U != sp.eye(3)",
  },
  {
    ficha: "T4-N7", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { valor: [["1", "-1", "-4"], ["0", "1/2", "2"], ["0", "0", "-1"]] },
    por: "b13 = -(u12·b23 + u13·b33)/u11 = -(2·2 + (-1)(-1)) = -5, no -4.",
    sympy: "sp.Matrix([[1,-1,-4],[0,sp.Rational(1,2),2],[0,0,-1]])*U != sp.eye(3)",
  },
  {
    ficha: "T4-N7", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { valor: [["1", "0", "0"], ["-1", "1/2", "0"], ["-5", "2", "-1"]] },
    por: "La inversa de una triangular superior es triangular superior: la transpuesta no vale.",
    sympy: "sp.Matrix([[1,0,0],[-1,sp.Rational(1,2),0],[-5,2,-1]])*U != sp.eye(3)",
  },
  {
    ficha: "T4-N7", caso: "FP-05", clase: "FP", debe: "rechaza",
    cambios: { valor: [["-1", "-1", "-5"], ["0", "1/2", "2"], ["0", "0", "-1"]] },
    por: "Signo global: U⁻¹ no es -U⁻¹ (det U = -2 ≠ 0 y U⁻¹U = I exige b11 = 1).",
    sympy: "sp.Matrix([[-1,-1,-5],[0,sp.Rational(1,2),2],[0,0,-1]])*U != sp.eye(3)",
  },

  // ---------------------------------------------------------------- T4-M6
  {
    ficha: "T4-M6", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { Q1: [["sqrt(2)/2", "0"], ["0", "1"], ["sqrt(2)/2", "0"]] },
    por: "√2/2 = 1/√2: la misma q1 con otra forma algebraica.",
    sympy: "sp.sqrt(2)/2 == 1/sp.sqrt(2)",
  },
  {
    ficha: "T4-M6", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { R1: [["sqrt(2)", "sqrt(8)", "sqrt(2)"], ["0", "0", "1"]] },
    por: "√8 = 2√2: la misma entrada r12.",
    sympy: "sp.sqrt(8) == 2*sp.sqrt(2)",
  },
  {
    ficha: "T4-M6", caso: "FN-03", clase: "FN", debe: "acepta",
    cambios: { Q2: [["1/sqrt(2)"], ["0"], ["-sqrt(2)/2"]] },
    por: "-√2/2 = -1/√2 en la tercera entrada de q2.",
    sympy: "-sp.sqrt(2)/2 == -1/sp.sqrt(2)",
  },
  {
    ficha: "T4-M6", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { Q1: [["1/sqrt(2)", "0"], ["0", "1"], ["-1/sqrt(2)", "0"]] },
    por: "Con q1 = (1/√2,0,-1/√2) la primera columna sale de col(C): los pivotes r11 y r13 se anulan y R1 pierde su rango.",
    sympy: "sp.Matrix([sp.sqrt(2)/2,0,-sp.sqrt(2)/2]).dot(sp.Matrix([1,0,1])) == 0 and sp.Matrix([sp.sqrt(2)/2,0,-sp.sqrt(2)/2]).dot(sp.Matrix([1,1,1])) == 0",
  },
  {
    ficha: "T4-M6", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { Q2: [["-1/sqrt(2)"], ["0"], ["1/sqrt(2)"]] },
    por: "q2 debe tener la primera entrada positiva (enunciado).",
    sympy: "sp.sqrt(2)/2 > 0",
  },
  {
    ficha: "T4-M6", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { R1: [["sqrt(2)", "2*sqrt(2)", "sqrt(2)"], ["0", "0", "-1"]] },
    por: "El pivote r23 debe ser positivo: r23 = q2ᵀc3 = 1; con -1 el pivote es negativo.",
    sympy: "sp.Matrix([0,1,0]).dot(sp.Matrix([1,1,1])) == 1 and sp.Matrix([0,-1,0]).dot(sp.Matrix([1,1,1])) == -1",
  },
  {
    ficha: "T4-M6", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { Q1: [["1/sqrt(2)", "0"], ["0", "-1"], ["1/sqrt(2)", "0"]] },
    por: "q2 = (0,-1,0) invierte el pivote r23; el enunciado fija la base por Gram–Schmidt.",
    sympy: "sp.Matrix([0,-1,0]).dot(sp.Matrix([1,1,1])) == -1",
  },
  {
    ficha: "T4-M6", caso: "FP-05", clase: "FP", debe: "rechaza",
    cambios: { R1: [["-sqrt(2)", "2*sqrt(2)", "sqrt(2)"], ["0", "0", "1"]] },
    por: "Los pivotes de R1 son positivos: r11 = √2 > 0.",
    sympy: "sp.sqrt(2) > 0",
  },

  // ---------------------------------------------------------------- T4-M7
  {
    ficha: "T4-M7", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { p3: "2.8" },
    por: "14/5 = 2.8: el decimal exacto es la misma respuesta.",
    sympy: "sp.Rational('2.8') == sp.Rational(14,5)",
  },
  {
    ficha: "T4-M7", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { err2: "0.8" },
    por: "4/5 = 0.8: el decimal exacto es la misma respuesta.",
    sympy: "sp.Rational('0.8') == sp.Rational(4,5)",
  },
  {
    ficha: "T4-M7", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { p2: "0.0000001" },
    por: "p2 vale exactamente 0: un residuo de 1e-7 no es la respuesta (H-1: el campo no lleva exact:true).",
    sympy: "sp.Rational(0) != sp.Float('0.0000001')",
  },
  {
    ficha: "T4-M7", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { p1: "2.0000001" },
    por: "p1 vale exactamente 2 (H-1).",
    sympy: "sp.Integer(2) != sp.Float('2.0000001')",
  },
  {
    // Tras H-1, p3 y err2 conservan la tolerancia por defecto de `number`
    // (1e-6 relativa) porque 14/5 y 4/5 no son enteros: un decimal a seis
    // decimales es una aproximación admisible, no un residuo. Se reclasifican
    // de FP a TOL (tolerancia deliberada): el motor DEBE aceptarlos.
    ficha: "T4-M7", caso: "TOL-01", clase: "TOL", debe: "acepta",
    cambios: { p3: "2.800001" },
    por: "p3 = 14/5 con un residuo de 1e-6: tolerado a propósito, porque 14/5 no es un entero y el campo `number` aprueba por aproximación.",
    sympy: "abs(sp.Float('2.800001') - sp.Rational(14,5)) <= sp.Float('1e-6')*abs(sp.Rational(14,5))",
  },
  {
    ficha: "T4-M7", caso: "TOL-02", clase: "TOL", debe: "acepta",
    cambios: { err2: "0.8000005" },
    por: "err2 = 4/5 con un residuo de 5e-7: mismo criterio que TOL-01.",
    sympy: "abs(sp.Float('0.8000005') - sp.Rational(4,5)) <= sp.Float('1e-6')*abs(sp.Rational(4,5))",
  },

  // ---------------------------------------------------------------- T4-E5
  {
    ficha: "T4-E5", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { x0: [["0.33333333"], ["4/3"], ["5/3"]] },
    por: "1/3 con 8 decimales: error 3.3e-9, dentro del umbral de la celda.",
    sympy: "abs(sp.Float('0.33333333') - sp.Rational(1,3)) < sp.Float('1e-8')",
  },
  {
    ficha: "T4-E5", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { norm2: "4.666666666666667" },
    por: "14/3 = 4.666…: el decimal de 16 cifras es la misma respuesta.",
    sympy: "abs(sp.Rational('4.666666666666667') - sp.Rational(14,3)) < sp.Rational(1,10**15)",
  },
  {
    ficha: "T4-E5", caso: "FN-03", clase: "CON", debe: "rechaza",
    cambios: { x0: [["0.333333"], ["1.3333333"], ["1.6666667"]] },
    por: "1/3, 4/3 y 5/3 con 6–7 decimales: error < 1e-6 (la tolerancia del campo `number`), pero la celda decide con 1e-8. H-2 dictaminado en R12: la celda es una igualdad de entradas EXACTAS, luego el rechazo es lo correcto; quien quiera una aproximación usa un campo `number`.",
    sympy: "abs(sp.Float('0.333333') - sp.Rational(1,3)) < sp.Float('1e-6')",
  },
  {
    ficha: "T4-E5", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { x0: [["1/3 + 1/sqrt(3)"], ["4/3 + 1/sqrt(3)"], ["5/3 - 1/sqrt(3)"]] },
    por: "Es x0 + t·Q2 con t ≠ 0: solución compatible pero NO de mínima norma.",
    sympy: "sp.Matrix([sp.Rational(1,3)+1/sp.sqrt(3), sp.Rational(4,3)+1/sp.sqrt(3), sp.Rational(5,3)-1/sp.sqrt(3)]).dot(sp.Matrix([sp.Rational(1,3)+1/sp.sqrt(3), sp.Rational(4,3)+1/sp.sqrt(3), sp.Rational(5,3)-1/sp.sqrt(3)])) != sp.Rational(14,3)",
  },
  {
    ficha: "T4-E5", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { x0: [["2/3"], ["4/3"], ["5/3"]] },
    por: "No satisface Ax = b: la primera ecuación da 4/3 ≠ 2.",
    sympy: "sp.Matrix([[1,0,1],[0,1,1]])*sp.Matrix([sp.Rational(2,3),sp.Rational(4,3),sp.Rational(5,3)]) != sp.Matrix([2,3])",
  },
  {
    ficha: "T4-E5", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { norm2: "sqrt(14/3)" },
    por: "Es ‖x0‖2, no ‖x0‖2²: el enunciado pide el cuadrado de la norma.",
    sympy: "sp.sqrt(sp.Rational(14,3)) != sp.Rational(14,3)",
  },
  {
    ficha: "T4-E5", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { x0: [["1/3", "4/3", "5/3"]] },
    por: "Vector como fila: el banco espera una columna 3×1.",
    sympy: "sp.Matrix([[sp.Rational(1,3),sp.Rational(4,3),sp.Rational(5,3)]]).shape == (1,3)",
  },

  // ---------------------------------------------------------------- T4-E6
  {
    ficha: "T4-E6", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { Q: [["2i/sqrt(5)", "1/sqrt(5)"], ["1/sqrt(5)", "2i/sqrt(5)"]] },
    por: "2i/√5 con multiplicación implícita: la misma entrada.",
    sympy: "2*sp.I/sp.sqrt(5) == 2*sp.I/sp.sqrt(5)",
  },
  {
    ficha: "T4-E6", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { Q: [["-2*i/(-sqrt(5))", "1/sqrt(5)"], ["1/sqrt(5)", "2*i/sqrt(5)"]] },
    por: "-2i/(-√5) = 2i/√5: la misma entrada con el signo reescrito.",
    sympy: "-2*sp.I/(-sp.sqrt(5)) == 2*sp.I/sp.sqrt(5)",
  },
  {
    ficha: "T4-E6", caso: "FN-03", clase: "FN", debe: "acepta",
    cambios: { U: [["2*i", "-3"], ["0", "-2i"]] },
    por: "-2i sin asterisco: la misma entrada.",
    sympy: "sp.simplify(-2*sp.I + 2*sp.I) == 0",
  },
  {
    ficha: "T4-E6", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { U: [["2*i", "3"], ["0", "-2*i"]] },
    por: "Signo del término fuera de la diagonal: u₁*Av = -3, no +3.",
    sympy: "(sp.Matrix([[2*sp.I/sp.sqrt(5),1/sp.sqrt(5)],[1/sp.sqrt(5),2*sp.I/sp.sqrt(5)]]).conjugate().T*sp.Matrix([[0,-4],[1,0]])*sp.Matrix([[2*sp.I/sp.sqrt(5),1/sp.sqrt(5)],[1/sp.sqrt(5),2*sp.I/sp.sqrt(5)]]))[0,1] == -3",
  },
  {
    ficha: "T4-E6", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { U: [["2*i", "-3"], ["0", "2*i"]] },
    por: "El segundo autovalor es -2i (traza = 0): u22 = -2i.",
    sympy: "sp.trace(sp.Matrix([[0,-4],[1,0]])) == 0",
  },
  {
    ficha: "T4-E6", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { Q: [["-2*i/sqrt(5)", "1/sqrt(5)"], ["1/sqrt(5)", "-2*i/sqrt(5)"]] },
    por: "Es Q̄: el enunciado fija la primera columna u = (2i,1)/√5.",
    sympy: "sp.conjugate(sp.Matrix([2*sp.I/sp.sqrt(5),1/sp.sqrt(5)])) != sp.Matrix([2*sp.I/sp.sqrt(5),1/sp.sqrt(5)])",
  },
  {
    ficha: "T4-E6", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { U: [["-6*i/5", "17/5"], ["-8/5", "-6*i/5"]] },
    por: "Es QᵀAQ (traspuesta sin conjugar) en vez de Q*AQ: el error típico al olvidar la conjugación.",
    sympy: "sp.Matrix([[2*sp.I/sp.sqrt(5),1/sp.sqrt(5)],[1/sp.sqrt(5),2*sp.I/sp.sqrt(5)]]).T*sp.Matrix([[0,-4],[1,0]])*sp.Matrix([[2*sp.I/sp.sqrt(5),1/sp.sqrt(5)],[1/sp.sqrt(5),2*sp.I/sp.sqrt(5)]]) == sp.Matrix([[-6*sp.I/5,sp.Rational(17,5)],[sp.Rational(-8,5),-6*sp.I/5]])",
  },

  // ---------------------------------------------------------------- T5-N7
  {
    ficha: "T5-N7", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { d1: "2.0" },
    por: "2.0 es el entero 2: con exact:true el motor exige entero, y 2.0 lo es.",
    sympy: "sp.Float('2.0') == sp.Integer(2)",
  },
  {
    ficha: "T5-N7", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { d2: "3.0", d3: "4.0" },
    por: "Igual que FN-01 en los otros dos menores.",
    sympy: "sp.Float('3.0') == sp.Integer(3) and sp.Float('4.0') == sp.Integer(4)",
  },
  {
    ficha: "T5-N7", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { d1: "2.0000001" },
    por: "El menor vale 2 exactamente; aquí `exact:true` sí protege (referencia del patrón correcto).",
    sympy: "sp.Integer(2) != sp.Float('2.0000001')",
  },
  {
    ficha: "T5-N7", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { d2: "3", d3: "3" },
    por: "det A = 4, no 3.",
    sympy: "sp.Matrix([[2,-1,0],[-1,2,-1],[0,-1,2]]).det() == 4",
  },
  {
    ficha: "T5-N7", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { d2: "2.9999999" },
    por: "El menor principal 2×2 vale 3 exactamente.",
    sympy: "sp.Matrix([[2,-1],[-1,2]]).det() == 3",
  },
  {
    ficha: "T5-N7", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { d1: "3", d2: "2", d3: "4" },
    por: "Menores intercambiados: Δ1 = 2 y Δ2 = 3.",
    sympy: "sp.Matrix([[2,-1,0],[-1,2,-1],[0,-1,2]])[0,0] == 2 and sp.Matrix([[2,-1],[-1,2]]).det() == 3",
  },

  // ---------------------------------------------------------------- T5-M6
  {
    ficha: "T5-M6", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: [["3.0", "1"], ["1", "3"]] },
    por: "3.0 = 3 en la celda.",
    sympy: "sp.Float('3.0') == sp.Integer(3)",
  },
  {
    ficha: "T5-M6", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: [["3", "-1"], ["-1", "3"]] },
    por: "Su cuadrado es [[10,-6],[-6,10]] ≠ A: falla X² = A.",
    sympy: "sp.Matrix([[3,-1],[-1,3]])**2 != sp.Matrix([[10,6],[6,10]])",
  },
  {
    ficha: "T5-M6", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: [["4", "0"], ["0", "2"]] },
    por: "Son las raíces de los autovalores sin volver a la base ortonormal: su cuadrado es [[16,0],[0,4]].",
    sympy: "sp.Matrix([[4,0],[0,2]])**2 != sp.Matrix([[10,6],[6,10]])",
  },
  {
    ficha: "T5-M6", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { valor: [["-3", "-1"], ["-1", "-3"]] },
    por: "La raíz cuadrada simétrica definida positiva es única: la negativa no lo es.",
    sympy: "all(v > 0 for v in sp.Matrix([[-3,-1],[-1,-3]]).eigenvals().values())",
  },
  {
    ficha: "T5-M6", caso: "FP-04", clase: "CON", debe: "rechaza",
    cambios: { valor: [["3", "1"], ["1", "3.0000001"]] },
    por: "La celda rechaza un residuo de 1e-7 (umbral 1e-8) mientras un campo `number` lo aceptaría (1e-6). H-2 dictaminado en R12: la raíz cuadrada definida positiva es única y exacta, luego el rechazo es lo correcto; la celda es la vía de las entradas exactas.",
    sympy: "sp.Integer(3) != sp.Float('3.0000001')",
  },

  // ---------------------------------------------------------------- T5-E5
  {
    ficha: "T5-E5", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { dim: "2.0" },
    por: "2.0 es el entero 2 con exact:true.",
    sympy: "sp.Float('2.0') == sp.Integer(2)",
  },
  {
    ficha: "T5-E5", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { dim: "3" },
    por: "dim ker(A-2I) = 2; 3 es la multiplicidad ALGEBRAICA (el error clásico).",
    sympy: "3 - (sp.Matrix([[3,1,0],[-1,1,0],[0,0,2]])-2*sp.eye(3)).rank() == 2",
  },
  {
    ficha: "T5-E5", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { dim: "1" },
    por: "Un solo bloque de Jordan daría dim = 1, pero la cadena de Jordan tiene dos bloques (2 y 1).",
    sympy: "3 - (sp.Matrix([[3,1,0],[-1,1,0],[0,0,2]])-2*sp.eye(3)).rank() == 2",
  },
  {
    ficha: "T5-E5", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { J: [["2", "0", "0"], ["0", "2", "1"], ["0", "0", "2"]] },
    por: "Es una forma de Jordan válida pero con los bloques en orden contrario: el enunciado exige de mayor a menor tamaño.",
    sympy: "3 - (sp.Matrix([[2,0,0],[0,2,1],[0,0,2]])-2*sp.eye(3)).rank() == 2",
  },
  {
    ficha: "T5-E5", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { J: [["2", "1", "0"], ["0", "2", "1"], ["0", "0", "2"]] },
    por: "Un solo bloque de tamaño 3: entonces dim ker = 1 y la matriz no es semejante a A.",
    sympy: "3 - (sp.Matrix([[2,1,0],[0,2,1],[0,0,2]])-2*sp.eye(3)).rank() == 1",
  },
  {
    ficha: "T5-E5", caso: "FP-05", clase: "FP", debe: "rechaza",
    cambios: { J: [["2", "0", "0"], ["0", "2", "0"], ["0", "0", "2"]] },
    por: "La matriz diagonal es diagonalizable: A no lo es (cadena de Jordan de tamaño 2).",
    sympy: "sp.Matrix([[2,0,0],[0,2,0],[0,0,2]]).is_diagonal() and 3 - (sp.Matrix([[3,1,0],[-1,1,0],[0,0,2]])-2*sp.eye(3)).rank() == 2",
  },
  {
    ficha: "T5-E5", caso: "FP-06", clase: "FP", debe: "rechaza",
    cambios: { J: [["2", "2", "0"], ["0", "2", "0"], ["0", "0", "2"]] },
    por: "La forma canónica de Jordan lleva superdiagonal de unos, no de doses.",
    sympy: "sp.Matrix([[2,2,0],[0,2,0],[0,0,2]])[0,1] == 2",
  },

  // ---------------------------------------------------------------- T5-E6
  {
    ficha: "T5-E6", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { sigmas: "3;6" },
    por: "El conjunto de valores singulares no es ordenado.",
    sympy: "sorted(sp.Matrix([[1,4],[2,2],[2,-4]]).singular_values()) == [3,6]",
  },
  {
    ficha: "T5-E6", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { sigmas: "6; 3" },
    por: "Separador con espacios: el motor normaliza el conjunto.",
    sympy: "sorted(sp.Matrix([[1,4],[2,2],[2,-4]]).singular_values()) == [3,6]",
  },
  {
    ficha: "T5-E6", caso: "FN-03", clase: "FN", debe: "acepta",
    cambios: { pinv: [["0.111111111", "2/9", "2/9"], ["1/9", "1/18", "-1/9"]] },
    por: "1/9 con 9 decimales: error 1.1e-10, dentro del umbral de la celda.",
    sympy: "abs(sp.Float('0.111111111') - sp.Rational(1,9)) < sp.Float('1e-8')",
  },
  {
    ficha: "T5-E6", caso: "FN-04", clase: "FN", debe: "acepta",
    cambios: { pinv: [["1/9", "2/9", "2/9"], ["1/9", "0.0555555556", "-1/9"]] },
    por: "1/18 con 10 decimales: error 4.4e-11.",
    sympy: "abs(sp.Float('0.0555555556') - sp.Rational(1,18)) < sp.Float('1e-8')",
  },
  {
    ficha: "T5-E6", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { sigmas: "6;3;3" },
    por: "Sólo hay dos valores singulares: el repetido denota la multiplicidad del autovalor 0 (rango 2 de una matriz 3×2).",
    sympy: "len(sp.Matrix([[1,4],[2,2],[2,-4]]).singular_values()) == 2",
  },
  {
    ficha: "T5-E6", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { sigmas: "6;2" },
    por: "AᵀA = diag(9,36) → σ = 3 y 6, no 2.",
    sympy: "sp.Matrix([[1,4],[2,2],[2,-4]]).T*sp.Matrix([[1,4],[2,2],[2,-4]]) == sp.diag(9,36)",
  },
  {
    ficha: "T5-E6", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { pinv: [["1/9", "1/9"], ["2/9", "1/18"], ["2/9", "-1/9"]] },
    por: "La pseudoinversa de una matriz 3×2 es 2×3: la transpuesta no vale.",
    sympy: "sp.Matrix([[1,4],[2,2],[2,-4]]).pinv().shape == (2,3)",
  },
  {
    ficha: "T5-E6", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { pinv: [["1/9", "2/9", "2/9"], ["1/9", "1/18", "1/9"]] },
    por: "Signo: (A†)_{23} = -1/9 (componente 3 de la 2.ª columna de A, que es -4).",
    sympy: "sp.Matrix([[1,4],[2,2],[2,-4]]).pinv()[1,2] == sp.Rational(-1,9)",
  },
  {
    ficha: "T5-E6", caso: "FP-05", clase: "FP", debe: "rechaza",
    cambios: { pinv: [["0.1", "2/9", "2/9"], ["1/9", "1/18", "-1/9"]] },
    por: "0.1 no es 1/9: error 0.0111, muy por encima de cualquier tolerancia.",
    sympy: "sp.Rational(1,9) != sp.Float('0.1')",
  },
  /* ------------------------------------------------------------ T5-N8
     Ficha añadida al cerrar el punto 4: forma cuadrática semidefinida
     positiva (autovalor nulo), A = [[1,1],[1,1]].
     Campos: tipo (choice), nulo (number exacto), vec (vector 2×1). */
  {
    ficha: "T5-N8", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { vec: [["1/sqrt(2)"], ["-1/sqrt(2)"]] },
    por: "1/√2 = √2/2: la misma primera componente del autovector unitario.",
    sympy: "1/sp.sqrt(2) == sp.sqrt(2)/2",
  },
  {
    ficha: "T5-N8", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { vec: [["0.7071067811865476"], ["-0.7071067811865476"]] },
    por: "El decimal de 16 cifras de √2/2 es la misma entrada (residuo 5·10⁻¹⁷ < 10⁻⁸).",
    sympy: "abs(sp.Float('0.7071067811865476') - sp.sqrt(2)/2) < sp.Float('1e-15')",
  },
  {
    ficha: "T5-N8", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { tipo: "0" },
    por: "«Definida positiva» es falso: q(1,-1) = 0, luego la forma tiene autovalor nulo y no es definida.",
    sympy: "min(sp.Matrix([[1,1],[1,1]]).eigenvals().keys()) == 0 and (sp.Matrix([1,-1]).T*sp.Matrix([[1,1],[1,1]])*sp.Matrix([1,-1]))[0,0] == 0",
  },
  {
    ficha: "T5-N8", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { tipo: "2" },
    por: "«Indefinida» es falso: todos los autovalores (0 y 2) son no negativos; hay un nulo, luego es semidefinida.",
    sympy: "all(v >= 0 for v in sp.Matrix([[1,1],[1,1]]).eigenvals().keys())",
  },
  {
    ficha: "T5-N8", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { nulo: "2" },
    por: "El autovalor nulo es 0; el 2 es el otro autovalor (λ²−2λ = 0).",
    sympy: "sorted(sp.Matrix([[1,1],[1,1]]).eigenvals().keys()) == [0,2] and min(sp.Matrix([[1,1],[1,1]]).eigenvals().keys()) == 0",
  },
  {
    ficha: "T5-N8", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { vec: [["1"], ["-1"]] },
    por: "El vector (1,−1) es autovector, pero no es unitario: ‖v‖² = 2.",
    sympy: "sp.Matrix([1,-1]).dot(sp.Matrix([1,-1])) == 2",
  },
  {
    ficha: "T5-N8", caso: "FP-05", clase: "FP", debe: "rechaza",
    cambios: { vec: [["sqrt(2)/2"], ["sqrt(2)/2"]] },
    por: "(√2/2, √2/2) no es autovector de A: A·v = (√2, √2)ᵀ ≠ 0.",
    sympy: "sp.Matrix([[1,1],[1,1]])*sp.Matrix([sp.sqrt(2)/2, sp.sqrt(2)/2]) != sp.zeros(2,1)",
  },
  {
    ficha: "T5-N8", caso: "FP-06", clase: "FP", debe: "rechaza",
    cambios: { vec: [["0.707107"], ["-0.707107"]] },
    por: "0.707107 no es √2/2: el residuo es 2,1·10⁻⁷, por encima del umbral de la celda (10⁻⁸).",
    sympy: "sp.Float('0.707107') != sp.sqrt(2)/2 and abs(sp.Float('0.707107') - sp.sqrt(2)/2) > sp.Float('1e-8')",
  },
  {
    ficha: "T5-N8", caso: "CON-01", clase: "CON", debe: "rechaza",
    cambios: { vec: [["-sqrt(2)/2"], ["sqrt(2)/2"]] },
    por: "El vector con el signo invertido es un autovector unitario perfectamente válido, pero el enunciado fija la convención «primera componente positiva»; el rechazo es lo correcto (mismo caso que las sondas S1-01/S2-01).",
    sympy: "sp.Matrix([-sp.sqrt(2)/2, sp.sqrt(2)/2]).dot(sp.Matrix([-sp.sqrt(2)/2, sp.sqrt(2)/2])) == 1 and sp.Matrix([-sp.sqrt(2)/2, sp.sqrt(2)/2])[0] < 0",
  },

  /* ------------------------------------------------------------ T5-M7
     Ficha añadida al cerrar el punto 4: LDLᵀ con pivote nulo,
     A = [[0,1],[1,2]]. Campos: sin_perm (choice), pivote (number exacto),
     con_perm (choice). */
  {
    ficha: "T5-M7", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { pivote: "0.0" },
    por: "0.0 y 0 son el mismo valor; el pivote del primer paso es a₁₁ = 0.",
    sympy: "sp.Float('0.0') == 0 and sp.Matrix([[0,1],[1,2]])[0,0] == 0",
  },
  {
    ficha: "T5-M7", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { sin_perm: "0" },
    por: "«Sí admite LDLᵀ sin permutar» es falso: d₁ = a₁₁ = 0 y l₂₁ = a₂₁/d₁ queda indefinido.",
    sympy: "sp.Matrix([[0,1],[1,2]])[0,0] == 0 and sp.Matrix([[0,1],[1,2]])[1,0] != 0",
  },
  {
    ficha: "T5-M7", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { sin_perm: "2" },
    por: "«No admite LDLᵀ ni siquiera permutando» es falso: con P = [[0,1],[1,0]] se tiene PAPᵀ = [[2,1],[1,0]], con d₁ = 2 ≠ 0.",
    sympy: "sp.Matrix([[0,1],[1,0]])*sp.Matrix([[0,1],[1,2]])*sp.Matrix([[0,1],[1,0]]) == sp.Matrix([[2,1],[1,0]])",
  },
  {
    ficha: "T5-M7", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { pivote: "2" },
    por: "El pivote del primer paso (sin permutar) es a₁₁ = 0, no 2.",
    sympy: "sp.Matrix([[0,1],[1,2]])[0,0] == 0",
  },
  {
    ficha: "T5-M7", caso: "FP-04", clase: "FP", debe: "rechaza",
    cambios: { con_perm: "1" },
    por: "«No admite LDLᵀ con ninguna permutación» es falso: L = [[1,0],[1/2,1]] y D = diag(2,−1/2) dan LDLᵀ = PAPᵀ = [[2,1],[1,0]].",
    sympy: "sp.Matrix([[1,0],[sp.Rational(1,2),1]])*sp.diag(2,sp.Rational(-1,2))*sp.Matrix([[1,sp.Rational(1,2)],[0,1]]) == sp.Matrix([[2,1],[1,0]])",
  },

];

/* ---------- barrido y sondas ---------- */
// Casos del barrido de las 14 fichas restantes y sondas sintéticas de las
// familias de riesgo. Viven en un archivo aparte para que el catálogo de las
// nueve fichas nuevas siga legible.
const BARRIDO = require("./casos-barrido-r12.js");

/* ---------- ejecución ---------- */
function main() {
  const banco = cargarBanco();
  const modoCheck = process.argv.includes("--check");
  let ok = 0;
  const fallos = [];
  const abiertos = [];
  const todos = CASOS.concat(BARRIDO);

  console.log("RONDA 12 — catálogo de ataques sobre las fichas de los temas 4 y 5");
  console.log("Línea base: veredicto OBSERVADO del motor en esta versión.\n");

  for (const c of todos) {
    let spec, respuesta, etiqueta;
    if (c.sonda) {
      // Sonda sintética: la especificación la propone el caso, no el banco.
      spec = c.spec;
      respuesta = c.entrada;
      etiqueta = `Sonda ${c.caso} [${c.clase}]`;
    } else {
      const drill = banco[c.ficha];
      if (!drill) {
        console.log(`  ??  ${c.ficha}: ficha no encontrada en el banco`);
        fallos.push(`${c.ficha} ${c.caso}: ficha inexistente`);
        continue;
      }
      spec = drill.answer;
      respuesta = construirRespuesta(drill, c.cambios);
      etiqueta = `${c.ficha} ${c.caso} [${c.clase}]`;
    }
    let res;
    try {
      res = Grader.check(spec, respuesta);
    } catch (e) {
      res = { ok: false, error: String(e && e.message) };
    }
    const observado = res.ok ? "acepta" : "rechaza";
    const coincide = observado === c.debe;
    if (c.abierto) {
      abiertos.push({ etiqueta, observado, esperado: c.debe, por: c.por });
      console.log(`  ?   ${etiqueta} — observado: ${observado} (cuestión abierta, no cuenta)`);
      continue;
    }
    if (coincide) {
      ok++;
      console.log(`  OK  ${etiqueta} — ${observado}`);
    } else {
      const tipo = c.clase || (c.debe === "acepta" ? "FN" : "FP");
      const debido = c.debe === "acepta" ? "debía aceptar" : "debía rechazar";
      fallos.push(`${etiqueta}: el motor ${observado} y ${debido} (${tipo})`);
      console.log(`  X   ${etiqueta} — observado: ${observado}, esperado: ${c.debe}  <-- ${tipo}`);
      console.log(`       ${c.por}`);
    }
  }

  console.log("");
  console.log(`Casos cerrados: ${ok}/${todos.length - abiertos.length} con el veredicto esperado.`);
  if (abiertos.length) {
    console.log(`Casos abiertos de contrato (H-2): ${abiertos.length}`);
    for (const a of abiertos) console.log(`  - ${a.etiqueta}: observado ${a.observado}, en juego: ${a.esperado}`);
  }
  if (fallos.length) {
    console.log(`Discrepancias: ${fallos.length}`);
    for (const f of fallos) console.log(`  - ${f}`);
  } else {
    console.log("Discrepancias: 0");
  }
  console.log("");
  console.log("Recordatorio: en esta fase NO se modifica assets/js/grader.js. Cada hallazgo se");
  console.log("cierra con la certificación SymPy correspondiente antes de tocar el motor.");

  if (modoCheck && fallos.length) return 1;
  return 0;
}

process.exit(main());
