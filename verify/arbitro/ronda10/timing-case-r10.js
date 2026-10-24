/* ÁRBITRO R10 · un caso de coste de motor en proceso hijo (para aislamiento). */
const G = require("../../../assets/js/grader.js");
const { spec, ans, label } = JSON.parse(process.argv[2]);
const t0 = process.hrtime.bigint();
let ok = null, err = null;
try {
  ok = G.check(spec, ans).ok;
} catch (e) {
  err = e.message;
}
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
console.log(JSON.stringify({ ms: Math.round(ms * 10) / 10, ok, err, label }));
