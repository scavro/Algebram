/* ÁRBITRO R2 · escáner de daño colateral en el escapado de <,> dentro de TeX.
   Busca en los strings de runtime (ya parseados por JS) secuencias lt/gt/le/ge
   sueltas dentro de \(...\) o \[...\]: si aparece "lt" sin barra, el KaTeX
   renderizará las letras l·t en vez del signo "<". */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..", "..");
const files = ["tema-1", "tema-2", "tema-3", "tema-4", "tema-5", "examen-1", "examen-2", "examen-3"];

let total = 0;
function walkStr(s, where, out) {
  if (typeof s !== "string") return;
  const math = [...s.matchAll(/\\\((.*?)\\\)|\\\[(.*?)\\\]/gs)];
  for (const m of math) {
    const seg = m[1] !== undefined ? m[1] : m[2];
    // lt/gt sin barra previa (incl. casos con letra delante: j\lt → "jlt", c\gt → "cgt")
    for (const mm of seg.matchAll(/(?<![\\a-zA-Z]|lt|gt)(lt|gt)(?![a-zA-Z])/g)) {
      out.push(where + "  ::  " + seg.slice(Math.max(0, mm.index - 40), mm.index + 20).replace(/\n/g, " "));
    }
    for (const mm of seg.matchAll(/[a-zA-Z](lt|gt)(?![a-zA-Z])/g)) {
      out.push(where + "  [letra delante]  ::  " + seg.slice(Math.max(0, mm.index - 40), mm.index + 20).replace(/\n/g, " "));
    }
  }
}
function rec(o, where, out) {
  if (o == null) return;
  if (typeof o === "string") { walkStr(o, where, out); return; }
  if (Array.isArray(o)) { o.forEach((x, i) => rec(x, where + "[" + i + "]", out)); return; }
  if (typeof o === "object") for (const k of Object.keys(o)) rec(o[k], where + "." + k, out);
}
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, "assets", "data", f + ".js"), "utf8");
  const sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(src, sb);
  const obj = sb.window.CURSO_DATA[Object.keys(sb.window.CURSO_DATA)[0]];
  const out = [];
  rec(obj.drills || (obj.exam && obj.exam.questions) || [], f, out);
  rec(obj.summary, f + ".summary", out);
  rec(obj.mindmap, f + ".mindmap", out);
  for (const line of out) { console.log(line); total++; }
}
console.log("\nTOTAL ocurrencias 'lt'/'gt' sin barra dentro de TeX:", total);
