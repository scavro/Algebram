/* ÁRBITRO R7 — extractor fresco de answer.expected desde los data files.
   Solo extrae datos; la matemática se recalcula en muestra10.py. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..", "..", "..");
const DATA = path.join(ROOT, "assets", "data");
const files = [
  "tema-1.js", "tema-2.js", "tema-3.js", "tema-4.js", "tema-5.js",
  "examen-1.js", "examen-2.js", "examen-3.js",
];

const out = {};
for (const f of files) {
  const src = fs.readFileSync(path.join(DATA, f), "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: f });
  const key = Object.keys(sandbox.window.CURSO_DATA)[0];
  const obj = sandbox.window.CURSO_DATA[key];
  const items = obj.drills || (obj.exam && obj.exam.questions) || [];
  out[key] = items.map((q) => ({
    id: q.id, level: q.level, answer: q.answer, statement: q.statement,
  }));
}
fs.writeFileSync(path.join(__dirname, "expected-r7.json"), JSON.stringify(out, null, 1));
console.log("OK dump R7:", Object.keys(out).map((k) => k + "=" + out[k].length).join(", "));
