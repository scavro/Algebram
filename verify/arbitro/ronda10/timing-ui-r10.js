/* ÁRBITRO R10 · tiempos de producto vía UI (CDP): latencia del botón
   «Comprobar» en drills reales con respuestas normales y adversariales.
   Criterio: ninguna respuesta puede tardar >2 s en comprobarse.
   Los casos pesados van AL FINAL (congelan el hilo de render). */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");

const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

let fallos = 0;
function check(ok, msg) {
  if (!ok) fallos++;
  console.log(`  ${ok ? "✔" : "✘"} ${msg}`);
}

const HELPERS = `(() => {
  window.__f = {
    time(id, value) {
      const card = document.getElementById(id);
      card.querySelector("input[type=text]").value = value;
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      const t0 = performance.now();
      btn.click();
      const ms = performance.now() - t0;
      const cls = card.classList.contains("is-correct") ? "ACEPTA" : card.classList.contains("is-wrong") ? "RECHAZA" : "none";
      return { ms: Math.round(ms * 10) / 10, cls };
    },
  };
  return 1;
})()`;

const poly = (n) => Array.from({ length: n }, (_, i) => "x^" + (i + 1)).join("+");

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  try {
    console.log("== tema-1 · T1-N4 — latencia de «Comprobar»");
    await cdp.goto(fileUrl("temas/tema-1.html"), 2000);
    await sleep(800);
    await cdp.eval(HELPERS);

    const casos = [
      ["respuesta correcta 4/11", "4/11"],
      ["equivalente 8/22", "8/22"],
      ["basura", "999-basura"],
      ["veneno C1 (x-x)/(x-x)", "(x-x)/(x-x)"],
      ["veneno M1 4/11+Δ·x^0.5", "4/11+(log(x+5)+log(y+5)-log((x+5)*(y+5)))*x^0.5"],
      ["veneno R1 4/11+x^(-65)", "4/11+x^(-65)"],
      ["veneno R1 4/11+0^x", "4/11+0^x"],
    ];
    for (const [label, ans] of casos) {
      const r = await cdp.eval(`window.__f.time("T1-N4", ${JSON.stringify(ans)})`);
      check(r.ms <= 2000, `«Comprobar» ${label}: ${r.ms} ms → ${r.cls}`);
    }

    /* casos M2 documentados (R9: 7,6–13,6 s en motor) */
    console.log("\n== casos polinómicos documentados (M2-R8) vía UI --");
    for (const [label, ans] of [
      ["(x+y+z)^64 (respuesta)", "(x+y+z)^64"],
      ["(x+y+z)^64+1", "(x+y+z)^64+1"],
    ]) {
      const r = await cdp.eval(`window.__f.time("T1-N4", ${JSON.stringify(ans)})`);
      check(r.ms <= 2000, `«Comprobar» ${label}: ${r.ms} ms → ${r.cls}`);
    }

    /* casos densos (hipótesis de elusión del tope POLY_MAX_TERMS) — al final */
    console.log("\n== casos densos univariantes vía UI (pueden congelar el render) --");
    for (const [label, ans] of [
      ["(Σ500)^8", "(" + poly(500) + ")^8"],
      ["(Σ2000)^2", "(" + poly(2000) + ")^2"],
    ]) {
      const t0 = Date.now();
      let r = null, err = null;
      try {
        r = await cdp.eval(`window.__f.time("T1-N4", ${JSON.stringify(ans)})`);
      } catch (e) {
        err = e.message;
      }
      const wall = Date.now() - t0;
      if (r) check(r.ms <= 2000, `«Comprobar» ${label}: ${r.ms} ms (wall ${wall} ms) → ${r.cls}`);
      else check(false, `«Comprobar» ${label}: ERROR ${err} (wall ${wall} ms)`);
    }

    /* examen: «Corregir examen» con una respuesta pesada en una tarjeta */
    console.log("\n== examen-1 · «Corregir examen» con respuesta pesada --");
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1800);
    await sleep(800);
    await cdp.eval(HELPERS);
    const t0 = Date.now();
    const rEx = await cdp.eval(`(() => {
      const D = window.CURSO_DATA["examen-1"];
      const id = D.exam.questions[0].id;
      const card = document.getElementById(id);
      const inp = card.querySelector("input[type=text]");
      if (!inp) return { ms: 0, cls: "sin-input" };
      inp.value = ${JSON.stringify("(" + poly(500) + ")^8")};
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen");
      const t0 = performance.now();
      btn.click();
      return { ms: Math.round((performance.now() - t0) * 10) / 10, cls: "corregido" };
    })()`);
    const wall = Date.now() - t0;
    check(rEx.ms <= 2000, `«Corregir examen» con 1 respuesta pesada: ${rEx.ms} ms (wall ${wall} ms)`);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nTIMING-UI R10: ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
