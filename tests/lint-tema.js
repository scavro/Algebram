/* ============================================================
   lint-tema.js — validador universal de un tema del curso
   Uso: node tests/lint-tema.js temas/tema-N.html assets/data/tema-N.js
   Comprueba:
   1. Estructura HTML (secciones obligatorias, scripts, clases)
   2. Matemáticas en \( \) y no $
   3. Esquema del data (summary, mindmap, niveles y mínimos de drills, ids)
   4. Autocorrección: Grader acepta cada `expected` y rechaza falsos
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const Grader = require("../assets/js/grader.js");

const [htmlPath, dataPath] = process.argv.slice(2);
if (!htmlPath || !dataPath) {
  console.error("Uso: node tests/lint-tema.js <tema.html> <tema.js>");
  process.exit(2);
}

let errors = 0;
let warnings = 0;
function err(msg) {
  errors++;
  console.error("✗ " + msg);
}
function warn(msg) {
  warnings++;
  console.error("⚠ " + msg);
}

/* ---------- 1. HTML ---------- */
const html = fs.readFileSync(htmlPath, "utf8");
const isExamPage = html.includes("data-exam");
const mustContain = [
  'data-theme=',
  "katex.min.js",
  "auto-render.min.js",
  "grader.js",
  "app.js",
  "fonts.css",
  "base.css",
  "components.css",
  "class=\"footer\"",
  "skip-link",
].concat(
  isExamPage
    ? ["data-exam"]
    : [
        'id="resumen"',
        'id="mapa"',
        'id="ejercicios"',
        "data-summary",
        "data-mindmap",
        "data-drills",
      ]
);
for (const m of mustContain) {
  if (!html.includes(m)) err("HTML: falta «" + m + "»");
}
// clases flexibles (admite variantes con "reveal" u otras)
if (!isExamPage && !/class="[^"]*\bmindmap\b/.test(html)) err('HTML: falta la clase "mindmap"');
if (!/class="[^"]*\bpager\b/.test(html)) err('HTML: falta la clase "pager"');

// matemáticas: prohibido $ … $ salvo escaped (los delimitadores válidos son \( \) y \[ \])
const dollarMath = html.match(/(?<![\\$])\$(?!\$)[^$<>\n]+\$(?![\\$])/g) || [];
if (dollarMath.length) {
  err("HTML: usa \\( \\) en lugar de $ para matemáticas. Ejemplos: " + dollarMath.slice(0, 3).join(" | "));
}

/* Subtítulos de las animaciones.
   Bajo file:// (doble clic) un <track src="...vtt"> no carga: el origen opaco
   bloquea la lectura. Los subtítulos van incrustados como URI data: por
   scripts/build_subtitulos.py; aquí se comprueba que sigue siendo así. */
const tracks = html.match(/<track\b[^>]*>/gi) || [];
for (const t of tracks) {
  if (!/src="data:text\/vtt/i.test(t))
    err("HTML: el <track> no lleva el subtítulo incrustado como URI data: (ejecuta scripts/build_subtitulos.py)");
  if (!/data-vtt="[^"]+\.vtt"/i.test(t))
    err("HTML: el <track> no conserva el nombre del .vtt en data-vtt (ejecuta scripts/build_subtitulos.py)");
}

/* Recuentos de ejercicios: si el HTML los declara, deben venir calculados
   desde los datos (data-count), no escritos a mano. */
const conteosFijos = html.match(/<span class="chip">\d+ ejercicios interactivos<\/span>/g) || [];
for (const c of conteosFijos) {
  err('HTML: recuento de ejercicios escrito a mano (' + c + '). Usa data-count para que no quede obsoleto.');
}

/* ---------- 2. DATA ---------- */
global.window = {};
require(path.resolve(dataPath));
const data = (global.window.CURSO_DATA || {})[
  path.basename(dataPath).replace(/\.js$/, "")
];
if (!data) {
  err("DATA: no se encontró window.CURSO_DATA['" + path.basename(dataPath).replace(/\.js$/, "") + "']");
  finish();
}

/* ---------- 3. Esquema ---------- */
if (!isExamPage) {
  if (!Array.isArray(data.summary) || !data.summary.length) err("DATA: summary vacío");
  else {
    data.summary.forEach((b, i) => {
      if (!b.h) err("DATA: summary[" + i + "].h vacío");
      if (!Array.isArray(b.items) || !b.items.length) err("DATA: summary[" + i + "].items vacío");
    });
  }
  if (!data.mindmap || !data.mindmap.label) err("DATA: mindmap sin label");
  (function countNodes(n, depth) {
    if (!n) return 0;
    if (depth > 4) warn("DATA: mindmap con profundidad > 4 en «" + n.label + "»");
    let c = 1;
    (n.children || []).forEach((ch) => (c += countNodes(ch, depth + 1)));
    return c;
  })(data.mindmap, 0);
}

const drills = data.drills || (data.exam && data.exam.questions) || [];
if (!Array.isArray(drills) || !drills.length) err("DATA: drills/questions vacío");

if (data.exam) {
  if (!data.exam.minutes || data.exam.minutes < 1) err("DATA: exam.minutes inválido");
  if (drills.length < 10 || drills.length > 14) err("DATA: el examen debe tener 10–14 preguntas (hay " + drills.length + ")");
}

const counts = { normal: 0, medio: 0, examen: 0 };
const ids = new Set();
drills.forEach((d, i) => {
  if (!d.id) err("DATA: drills[" + i + "] sin id");
  if (ids.has(d.id)) err("DATA: id duplicado " + d.id);
  ids.add(d.id);
  if (!counts[d.level] && counts[d.level] !== 0) err("DATA: " + d.id + " nivel inválido «" + d.level + "»");
  else counts[d.level]++;
  if (!d.statement || d.statement.length < 10) err("DATA: " + d.id + " statement corto/ausente");
  if (!Array.isArray(d.solution) || d.solution.length < 1) err("DATA: " + d.id + " sin solution");
  if (!d.answer || !d.answer.type) err("DATA: " + d.id + " sin answer.type");
  const math = (d.statement || "") + (d.solution || []).join("");
  if (/(?<![\\$])\$(?!\$)/.test(math)) err("DATA: " + d.id + " usa $ en vez de \\( \\)");
});

const total = drills.length;
const isExam = data.exam != null;
/* Reparto por nivel. El esquema original fijaba 6 normal / 5 medio / 4 examen;
   las ampliaciones de cobertura elevaron los temas 4 y 5 a 7/7/6 y 8/7/6.
   Se valida la ESTRUCTURA (los tres niveles presentes y en proporción
   decreciente) en vez de un número rígido, y se avisa (no se falla) cuando
   el reparto no coincide con el declarado para ese tema. */
const REPARTO_ESPERADO = {
  "tema-1": { normal: 6, medio: 5, examen: 4 },
  "tema-2": { normal: 6, medio: 5, examen: 4 },
  "tema-3": { normal: 6, medio: 5, examen: 4 },
  "tema-4": { normal: 7, medio: 7, examen: 6 },
  "tema-5": { normal: 8, medio: 7, examen: 6 },
};
if (!isExam) {
  for (const nivel of ["normal", "medio", "examen"]) {
    if (counts[nivel] === 0) err("DATA: no hay ejercicios de nivel '" + nivel + "'");
  }
  if (counts.normal < counts.medio) err("DATA: hay menos ejercicios 'normal' (" + counts.normal + ") que 'medio' (" + counts.medio + ")");
  if (counts.medio < counts.examen) err("DATA: hay menos ejercicios 'medio' (" + counts.medio + ") que 'examen' (" + counts.examen + ")");
  if (total < 15) err("DATA: un tema debe tener al menos 15 ejercicios (hay " + total + ")");
  const clave = path.basename(dataPath).replace(/\.js$/, "");
  const esperado = REPARTO_ESPERADO[clave];
  if (esperado) {
    for (const nivel of ["normal", "medio", "examen"]) {
      if (counts[nivel] !== esperado[nivel])
        warn("DATA: " + clave + " tiene " + counts[nivel] + " ejercicios '" + nivel + "' (esperados " + esperado[nivel] + ")");
    }
  }
} else {
  if (total !== 12) warn("DATA: el examen tiene " + total + " preguntas (esperadas 12)");
}

/* ---------- 4. Autocorrección del grader ---------- */
function selfCheck(d) {
  const spec = d.answer;
  try {
    let okRes, badRes;
    if (spec.type === "multi") {
      const good = {};
      const bad = {};
      Object.keys(spec.fields).forEach((k) => {
        const f = spec.fields[k];
        // exprset: el esperado es una lista → se pasa como texto "a;b;c"
        good[k] = f.type === "exprset" && Array.isArray(f.expected) ? f.expected.join(";") : f.expected;
        bad[k] = "__basura__";
      });
      okRes = Grader.check(spec, good);
      badRes = Grader.check(spec, bad);
    } else if (spec.type === "matrix" || spec.type === "vector") {
      okRes = Grader.check(spec, spec.expected);
      const badM = spec.expected.map((r) => r.map((c, j) => (j === 0 ? String(c) + "+1" : c)));
      badRes = Grader.check(spec, badM);
    } else if (spec.type === "exprset") {
      okRes = Grader.check(spec, spec.expected.join(";"));
      badRes = Grader.check(spec, spec.expected.concat(["999"]).join(";"));
    } else if (spec.type === "choice") {
      okRes = Grader.check(spec, spec.expected);
      badRes = Grader.check(spec, (spec.expected + 1) % (spec.choices || [1, 2]).length);
    } else if (spec.type === "bool") {
      okRes = Grader.check(spec, spec.expected);
      badRes = Grader.check(spec, !spec.expected);
    } else {
      okRes = Grader.check(spec, spec.expected);
      badRes = Grader.check(spec, "__no_es_una_respuesta__");
    }
    if (!okRes.ok) err("GRADER: " + d.id + " no acepta su propia respuesta expected («" + JSON.stringify(spec.expected) + "»): " + (okRes.error || "no equivalente"));
    if (badRes.ok) err("GRADER: " + d.id + " acepta una respuesta basura");
  } catch (e) {
    err("GRADER: " + d.id + " lanzó excepción: " + e.message);
  }
}
drills.forEach(selfCheck);

function finish() {
  const n = data && (data.drills || (data.exam && data.exam.questions)) ? (data.drills || data.exam.questions).length : 0;
  console.log("\n== lint " + path.basename(htmlPath) + " ==");
  console.log("Errores: " + errors + " · Avisos: " + warnings + " · Ejercicios: " + n);
  if (errors > 0) process.exit(1);
  console.log("OK");
}
finish();
