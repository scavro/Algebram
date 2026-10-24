/* ÁRBITRO R10 · reproducción de producto de los venenos de las rondas 8–9
   sobre drills REALES vía el botón «Comprobar» de la UI (CDP/Chrome):

   - C1-R8 · respuesta universal (x-x)/(x-x) y familia U → debe ✗
   - M1-R8 · perturbación E+Δ·x^0.5 y afines → debe ✗
   - R1    · E+x^(-65), (x+y)^(-300), 1/x^300 → debe ✗
   - R1    · 0^x / 4/11+0^x → debe ✗
   - Control positivo: respuesta correcta → ✓ CON solución visible y "solved". */
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
    set(id, value) {
      const card = document.getElementById(id);
      card.querySelector("input[type=text]").value = value;
      return 1;
    },
    setMulti(id, values) {
      const card = document.getElementById(id);
      const inputs = card.querySelectorAll(".drill__answer input[type=text]");
      values.forEach((v, i) => { if (v != null) inputs[i].value = v; });
      return 1;
    },
    setMatrix(id, cells) {
      const card = document.getElementById(id);
      const inputs = card.querySelectorAll(".drill__answer input[type=text]");
      cells.forEach((v, i) => { inputs[i].value = v; });
      return 1;
    },
    comprobar(id) {
      const card = document.getElementById(id);
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click();
      const fb = card.querySelector(".drill__feedback");
      const sol = card.querySelector(".drill__solution");
      let prog = null;
      try { prog = (JSON.parse(localStorage.getItem("curso-algebra-progreso-v1") || "{}") || {})[id] || null; }
      catch (e) { prog = "ERR:" + e.message; }
      return {
        cls: card.classList.contains("is-correct") ? "ACEPTA" : card.classList.contains("is-wrong") ? "RECHAZA" : "none",
        fb: fb && fb.classList.contains("is-visible") ? fb.textContent.trim().slice(0, 24) : "",
        solVisible: !!sol && sol.classList.contains("is-visible"),
        progress: prog,
      };
    },
  };
  return 1;
})()`;

const DELTA = "(log(x+5)+log(y+5)-log((x+5)*(y+5)))";
const U = "(x-x)/(x-x)";

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  try {
    console.log("== tema-1 · T1-N4 (expr, expected 4/11) + T1-M2 (multi) — drills reales");
    await cdp.goto(fileUrl("temas/tema-1.html"), 2000);
    await sleep(800);
    await cdp.eval(HELPERS);

    const rechazo = (r, etiqueta) =>
      check(r.cls === "RECHAZA" && !r.solVisible && r.progress !== "solved",
        `T1-N4 «${etiqueta}» → ${r.cls}${r.solVisible ? " + SOLUCIÓN VISIBLE (¡fuga!)" : ""} · progreso=${r.progress}`);

    /* ===== C1-R8 · familia universal 0/0 ===== */
    console.log("\n-- C1-R8 · (x-x)/(x-x) y familia U --");
    for (const ans of [U, "0/(x-x)", "1/(x-x)", "x/(x-x)", "1*(x-x)/(x-x)", "5+0*(x-x)/(x-x)", "(x-x)^2/(x-x)"]) {
      const r = await cdp.eval(`(window.__f.set("T1-N4", ${JSON.stringify(ans)}), window.__f.comprobar("T1-N4"))`);
      rechazo(r, ans);
    }

    /* ===== M1-R8 · perturbación E+Δ·x^0.5 ===== */
    console.log("\n-- M1-R8 · Δ·x^0.5 y afines --");
    for (const ans of [
      "4/11+" + DELTA + "*x^0.5",
      "4/11+" + DELTA + "*x^(1/2)",
      "4/11+" + DELTA + "*x^0.3333",
      "4/11+" + DELTA,
      "4/11+" + DELTA + "*sqrt(x)",
    ]) {
      const r = await cdp.eval(`(window.__f.set("T1-N4", ${JSON.stringify(ans)}), window.__f.comprobar("T1-N4"))`);
      rechazo(r, ans.slice(0, 40));
    }

    /* ===== R1 · E+x^(-65) y familia residual ===== */
    console.log("\n-- R1 · E+x^(-65) / (x+y)^(-300) / 1/x^300 --");
    for (const ans of [
      "4/11+x^(-65)",
      "4/11+x^(-300)",
      "4/11+(x+y)^(-300)",
      "4/11+1/x^300",
      "4/11+(x^2+y^2+2)^(-200)",
    ]) {
      const r = await cdp.eval(`(window.__f.set("T1-N4", ${JSON.stringify(ans)}), window.__f.comprobar("T1-N4"))`);
      rechazo(r, ans);
    }

    /* ===== R1 · 0^x ===== */
    console.log("\n-- R1 · 0^x y huecos de esqueleto --");
    for (const ans of ["0^x", "4/11+0^x", "4/11+(2^x-2^x)", "4/11+(x-x)*x^0.5"]) {
      const r = await cdp.eval(`(window.__f.set("T1-N4", ${JSON.stringify(ans)}), window.__f.comprobar("T1-N4"))`);
      rechazo(r, ans);
    }

    /* ===== C1/M1 en multi (T1-M2) y matriz real (T5-N5) ===== */
    console.log("\n-- venenos en T1-M2 (multi) --");
    let r = await cdp.eval(`(window.__f.setMulti("T1-M2", ["${U}", "5*pi/6+" + ${JSON.stringify(DELTA)} + "*x^0.5"]), window.__f.comprobar("T1-M2"))`);
    check(r.cls === "RECHAZA" && !r.solVisible && r.progress !== "solved",
      `T1-M2 «U / 5π/6+Δ·x^0.5» → ${r.cls} · progreso=${r.progress}`);
    r = await cdp.eval(`(window.__f.setMulti("T1-M2", ["2", "5*pi/6+x^(-65)"]), window.__f.comprobar("T1-M2"))`);
    check(r.cls === "RECHAZA" && r.progress !== "solved",
      `T1-M2 «2 / 5π/6+x^(-65)» → ${r.cls} · progreso=${r.progress}`);

    console.log("\n-- venenos en T5-N5 (matriz 2×2 real) --");
    await cdp.goto(fileUrl("temas/tema-5.html"), 2000);
    await sleep(800);
    await cdp.eval(HELPERS);
    r = await cdp.eval(`(window.__f.setMatrix("T5-N5", ["${U}", "${U}", "${U}", "1/4+" + ${JSON.stringify(DELTA)} + "*x^0.5"]), window.__f.comprobar("T5-N5"))`);
    check(r.cls === "RECHAZA" && !r.solVisible && r.progress !== "solved",
      `T5-N5 «U,U,U, 1/4+Δ·x^0.5» → ${r.cls} · progreso=${r.progress}`);
    r = await cdp.eval(`(window.__f.setMatrix("T5-N5", ["1/2", "0", "0", "1/4+x^(-65)"]), window.__f.comprobar("T5-N5"))`);
    check(r.cls === "RECHAZA" && r.progress !== "solved",
      `T5-N5 «1/2,0,0, 1/4+x^(-65)» → ${r.cls} · progreso=${r.progress}`);

    /* ===== control positivo: correcta → ✓ CON solución + solved ===== */
    console.log("\n-- control positivo --");
    await cdp.goto(fileUrl("temas/tema-1.html"), 2000);
    await sleep(800);
    await cdp.eval(HELPERS);
    const rOK = await cdp.eval(`(window.__f.set("T1-N4", "4/11"), window.__f.comprobar("T1-N4"))`);
    check(rOK.cls === "ACEPTA" && rOK.solVisible && rOK.progress === "solved" && /^✓/.test(rOK.fb),
      `T1-N4 «4/11» → ${rOK.cls} con solución visible · progreso=${rOK.progress} · "${rOK.fb}"`);
    const rEq = await cdp.eval(`(window.__f.set("T1-N4", "8/22"), window.__f.comprobar("T1-N4"))`);
    check(rEq.cls === "ACEPTA" && rEq.progress === "solved", `T1-N4 «8/22» ≡ 4/11 → ${rEq.cls}`);
    const rDec = await cdp.eval(`(window.__f.set("T1-N4", "0.36363636363636365"), window.__f.comprobar("T1-N4"))`);
    check(rDec.cls === "ACEPTA", `T1-N4 «0.36363636363636365» ≡ 4/11 → ${rDec.cls}`);
    const rM2 = await cdp.eval(`(window.__f.setMulti("T1-M2", ["2", "5*pi/6"]), window.__f.comprobar("T1-M2"))`);
    check(rM2.cls === "ACEPTA" && rM2.solVisible && rM2.progress === "solved",
      `T1-M2 correcta (2 · 5π/6) → ${rM2.cls} con solución · progreso=${rM2.progress}`);
    await cdp.eval(`(window.__f.set("T1-N4", "basura-999"), window.__f.comprobar("T1-N4"))`);
    const rBad = await cdp.eval(`window.__f.comprobar("T1-N4")`);
    check(rBad.cls === "RECHAZA" && !rBad.solVisible, `T1-N4 basura → ${rBad.cls} sin solución`);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nUI-POISON R10: ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
