const G = require("../../../assets/js/grader.js");
const casos = {
  1: ["(x+y+z)^64 vs (x+y+z)^63*(x+y+z)", { type: "expr", expected: "(x+y+z)^63*(x+y+z)" }, "(x+y+z)^64"],
  2: ["(x+y+z)^64 vs (x^2+y^2+z^2+2*x*y+2*x*z+2*y*z)^32", { type: "expr", expected: "(x^2+y^2+z^2+2*x*y+2*x*z+2*y*z)^32" }, "(x+y+z)^64"],
  3: ["((x+y+z)^64+x)^64 vs ...^63*...", { type: "expr", expected: "((x+y+z)^64+x)^63*((x+y+z)^64+x)" }, "((x+y+z)^64+x)^64"],
  4: ["(x+y+z+w)^64 vs ^63*(x+y+z+w)", { type: "expr", expected: "(x+y+z+w)^63*(x+y+z+w)" }, "(x+y+z+w)^64"],
  5: ["(a+b+c+d+e)^64 vs ^63*(...)", { type: "expr", expected: "(a+b+c+d+e)^63*(a+b+c+d+e)" }, "(a+b+c+d+e)^64"],
  6: ["(x+y+z)^32 vs ((x+y+z)^16)^2", { type: "expr", expected: "((x+y+z)^16)^2" }, "(x+y+z)^32"],
  7: ["x^64*y^64*z^64 vs (x*y*z)^64", { type: "expr", expected: "(x*y*z)^64" }, "x^64*y^64*z^64"],
  8: ["(x+y+z)^64 vs 0", { type: "expr", expected: "0" }, "(x+y+z)^64"],
};
const k = Number(process.argv[2]);
const [nombre, spec, resp] = casos[k];
const t0 = Date.now();
let res = "?";
try { res = G.check(spec, resp).ok === true ? "acepta" : "rechaza"; } catch (e) { res = "excepción: " + e.message; }
console.log(String(Date.now() - t0).padStart(7) + " ms | " + res.padEnd(8) + " | " + nombre);
process.exit(0);
