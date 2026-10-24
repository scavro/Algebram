/* ÁRBITRO R5 · N2 — auditoría de escapes \lt/\gt en los 8 data files.
   Regla R2/m5: en JS la barra simple "\lt" se elimina en runtime (queda "lt"
   y KaTeX dibuja letras). Fix exigido: "\\lt" (barra doble en el fuente) para
   que el runtime contenga "\lt" (operador KaTeX). */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..", "..");
const files = ["tema-1", "tema-2", "tema-3", "tema-4", "tema-5", "examen-1", "examen-2", "examen-3"];

let fallos = 0, totFix = 0, totBug = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, "assets", "data", f + ".js"), "utf8");
  const fix = (src.match(/\\\\lt|\\\\gt/g) || []).length;          // 2 barras (fix)
  const bug = (src.match(/(?<!\\)\\lt|(?<!\\)\\gt/g) || []).length; // 1 barra suelta (bug R2)
  totFix += fix; totBug += bug;
  // runtime
  const sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(src, sb);
  const dump = JSON.stringify(sb.window.CURSO_DATA);
  const rtOp = (dump.match(/\\lt|\\gt/g) || []).length;         // operadores KaTeX correctos
  const rtBare = [...dump.matchAll(/(?<![a-zA-Z\\])lt(?![a-zA-Z])|(?<![a-zA-Z\\])gt(?![a-zA-Z])/g)].length; // letras sueltas
  const ok = bug === 0 && rtBare === 0 && fix === rtOp;
  if (!ok) fallos++;
  console.log(`${ok ? "[OK ]" : "[FALLO]"} ${f}.js: fuente fix=${fix} bug=${bug} | runtime \\op=${rtOp} lt/gt-desnudos=${rtBare}`);
}
console.log(`\nTOTAL: fix(\\\\lt/\\\\gt)=${totFix}  bug(\\lt suelto)=${totBug}`);
if (totFix !== 31 || totBug !== 0) fallos++;
console.log(fallos === 0
  ? "N2 OK: los 31 tokens son barra doble; runtime con operadores \\lt/\\gt; 0 letras sueltas."
  : "N2 FALLO: quedan escapes corruptos.");
process.exit(fallos ? 1 : 0);
