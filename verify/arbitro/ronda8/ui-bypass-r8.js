/* ÁRBITRO R8 · prueba de producto del bypass: la respuesta «E+Δ·x^0.5»
   (exploit de rama de la familia M5/M9 de la R7) se acepta como ✓ en un drill
   REAL a través del botón «Comprobar» de la UI. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");

const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

let fallos = 0;
function check(ok, msg) {
  if (!ok) fallos++;
  console.log(`  ${ok ? "✔" : "✘"} ${msg}`);
}

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  try {
    await cdp.goto(fileUrl("temas/tema-1.html"), 1800);
    await sleep(700);
    const r = await cdp.eval(`(() => {
      const DELTA = "(log(x+5)+log(y+5)-log((x+5)*(y+5)))";
      const out = {};
      const card = document.getElementById("T1-N4"); // expected 4/11
      const inp = card.querySelector("input[type=text]");
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");

      inp.value = "4/11+" + DELTA;
      btn.click();
      out.naive = card.classList.contains("is-correct") ? "ACEPTA" : "RECHAZA";

      inp.value = "4/11+" + DELTA + "*x^0.5";
      btn.click();
      out.veneno = card.classList.contains("is-correct") ? "ACEPTA" : "RECHAZA";

      inp.value = "1/2+(log(x+5)+log(y+5)-log((x+5)*(y+5)))*x^0.5"; // E erróneo + veneno
      btn.click();
      out.venenoEquivocado = card.classList.contains("is-correct") ? "ACEPTA" : "RECHAZA";

      inp.value = "(x+y)^(-300)"; // vs 4/11 — debe rechazar
      btn.click();
      out.basura = card.classList.contains("is-correct") ? "ACEPTA" : "RECHAZA";

      inp.value = "(x-x)/(x-x)"; // respuesta universal 0/0 — debe rechazar
      btn.click();
      out.universal = card.classList.contains("is-correct") ? "ACEPTA" : "RECHAZA";

      out.progress = localStorage.getItem("curso-algebra-progreso-v1");
      return out;
    })()`);
    console.log(`  · T1-N4 «4/11+Δ» (M5 naive)        → ${r.naive}`);
    console.log(`  · T1-N4 «4/11+Δ·x^0.5» (bypass)    → ${r.veneno}`);
    console.log(`  · T1-N4 «1/2+Δ·x^0.5» (E erróneo)  → ${r.venenoEquivocado}`);
    console.log(`  · T1-N4 «(x+y)^(-300)» (basura)    → ${r.basura}`);
    console.log(`  · T1-N4 «(x-x)/(x-x)» (universal)  → ${r.universal}`);
    check(r.naive === "RECHAZA", "el exploit naive M5 se rechaza en la UI (fix operativo)");
    check(r.veneno === "RECHAZA",
      `el exploit con veneno ·x^0.5 se RECHAZA en la UI (esperado por seguridad; ACEPTA = bypass de producto: ${r.veneno})`);
    check(r.venenoEquivocado === "RECHAZA",
      `respuesta matemáticamente incorrecta «1/2+Δ·x^0.5» ${r.venenoEquivocado} en la UI`);
    check(r.basura === "RECHAZA", "entrada basura «(x+y)^(-300)» se rechaza en la UI");
    check(r.universal === "RECHAZA",
      `respuesta universal «(x-x)/(x-x)» ${r.universal} en la UI (ACEPTA = cualquier pregunta se aprueba con 0/0)`);
    check(/solved/.test(r.progress || "") === false || r.universal === "RECHAZA",
      `progreso tras la sonda: ${String(r.progress).slice(0, 60)}`);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nUI-BYPASS R8: ${fallos} fallos`);
  process.exit(0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
