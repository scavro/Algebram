/* ÁRBITRO R9 · reproducción de producto de los hallazgos C1-R8 y M1-R8
   sobre drills REALES vía el botón «Comprobar» de la UI (CDP/Chrome):

   - C1-R8 · respuesta universal (x-x)/(x-x) (0/0 sin definir) y familia U:
     debe → ✗ en el drill real T1-N4 (expected 4/11), SIN solución visible
     y SIN persistir "solved".
   - M1-R8 · perturbación E+Δ·x^0.5 (Δ = log(u)+log(v)-log(u·v), falsa fuera
     de la rama principal) y venenos afines: debe → ✗.
   - Control positivo: la respuesta correcta → ✓ CON solución visible y
     progreso "solved". */
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
        fb: fb && fb.classList.contains("is-visible") ? fb.textContent.trim().slice(0, 40) : "",
        solVisible: !!sol && sol.classList.contains("is-visible"),
        progress: prog,
      };
    },
  };
  return 1;
})()`;

const DELTA = "(log(x+5)+log(y+5)-log((x+5)*(y+5)))";

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  try {
    console.log("== tema-1 · T1-N4 (expr, expected 4/11) — drill real");
    await cdp.goto(fileUrl("temas/tema-1.html"), 2000);
    await sleep(800);
    await cdp.eval(HELPERS);

    /* ===== C1-R8 · familia universal 0/0 ===== */
    console.log("\n-- C1-R8 · respuesta universal (0/0 sin definir) --");
    const U = [
      ["U1  (x-x)/(x-x)", "(x-x)/(x-x)"],
      ["U2  0/(x-x)", "0/(x-x)"],
      ["U3  (x-x)^2/(x-x)", "(x-x)^2/(x-x)"],
      ["U4  1*(x-x)/(x-x)", "1*(x-x)/(x-x)"],
      ["U5  5+0*(x-x)/(x-x)", "5+0*(x-x)/(x-x)"],
      ["U6  ((x-x)*(x-x))/(x-x)", "((x-x)*(x-x))/(x-x)"],
      ["U7  1/(x-x)", "1/(x-x)"],
      ["U8  x/(x-x)", "x/(x-x)"],
    ];
    for (const [nombre, ans] of U) {
      const r = await cdp.eval(`(window.__f.set("T1-N4", ${JSON.stringify(ans)}), window.__f.comprobar("T1-N4"))`);
      check(r.cls === "RECHAZA" && !r.solVisible && r.progress !== "solved",
        `T1-N4 «${ans}» → ${r.cls}${r.solVisible ? " + SOLUCIÓN VISIBLE" : ""} · progreso=${r.progress}`);
    }

    /* ===== M1-R8 · perturbación con veneno E+Δ·x^0.5 ===== */
    console.log("\n-- M1-R8 · perturbación E+Δ·x^0.5 y venenos afines --");
    const B = [
      ["B0  E+Δ (naive M5)", "4/11+" + DELTA],
      ["B1  E+Δ·x^0.5", "4/11+" + DELTA + "*x^0.5"],
      ["B2  E+Δ·x^(1/2)", "4/11+" + DELTA + "*x^(1/2)"],
      ["B3  E+Δ·x^0.3333", "4/11+" + DELTA + "*x^0.3333"],
      ["B4  E+Δ·x^y", "4/11+" + DELTA + "*x^y"],
      ["B5  E+Δ·2^x", "4/11+" + DELTA + "*2^x"],
      ["B6  E+Δ/(x^0.5+1)", "4/11+" + DELTA + "/(x^0.5+1)"],
      ["B7  E+Δ·(x+y)^(-1)", "4/11+" + DELTA + "*(x+y)^(-1)"],
      ["B8  1/2+Δ·x^0.5 (E erróneo)", "1/2+" + DELTA + "*x^0.5"],
    ];
    for (const [nombre, ans] of B) {
      const r = await cdp.eval(`(window.__f.set("T1-N4", ${JSON.stringify(ans)}), window.__f.comprobar("T1-N4"))`);
      check(r.cls === "RECHAZA" && !r.solVisible && r.progress !== "solved",
        `T1-N4 «${nombre}» → ${r.cls}${r.solVisible ? " + SOLUCIÓN VISIBLE" : ""} · progreso=${r.progress}`);
    }

    /* ===== M1-R8 también en multi (T1-M2: mod=2 exact, arg=5*pi/6) ===== */
    console.log("\n-- M1-R8 · veneno en campo multi (T1-M2) --");
    const rMulti = await cdp.eval(`(window.__f.setMulti("T1-M2", ["2", "5*pi/6+" + ${JSON.stringify(DELTA)} + "*x^0.5"]), window.__f.comprobar("T1-M2"))`);
    check(rMulti.cls === "RECHAZA" && !rMulti.solVisible && rMulti.progress !== "solved",
      `T1-M2 «5*pi/6+Δ·x^0.5» → ${rMulti.cls} · progreso=${rMulti.progress}`);
    const rMultiU = await cdp.eval(`(window.__f.setMulti("T1-M2", ["(x-x)/(x-x)", "(x-x)/(x-x)"]), window.__f.comprobar("T1-M2"))`);
    check(rMultiU.cls === "RECHAZA" && rMultiU.progress !== "solved",
      `T1-M2 universal 0/0 en ambos campos → ${rMultiU.cls} · progreso=${rMultiU.progress}`);

    /* ===== control positivo: correcta → ✓ CON solución ===== */
    console.log("\n-- control positivo --");
    const rOK = await cdp.eval(`(window.__f.set("T1-N4", "4/11"), window.__f.comprobar("T1-N4"))`);
    check(rOK.cls === "ACEPTA" && rOK.solVisible && rOK.progress === "solved" && /^✓/.test(rOK.fb),
      `T1-N4 «4/11» → ${rOK.cls} con solución visible · progreso=${rOK.progress} · "${rOK.fb}"`);
    const rEq = await cdp.eval(`(window.__f.set("T1-N4", "8/22"), window.__f.comprobar("T1-N4"))`);
    check(rEq.cls === "ACEPTA" && rEq.progress === "solved", `T1-N4 «8/22» ≡ 4/11 → ${rEq.cls}`);
    const rDec = await cdp.eval(`(window.__f.set("T1-N4", "0.36363636363636365"), window.__f.comprobar("T1-N4"))`);
    check(rDec.cls === "ACEPTA", `T1-N4 «0.36363636363636365» → ${rDec.cls}`);

    const rM2 = await cdp.eval(`(window.__f.setMulti("T1-M2", ["2", "5*pi/6"]), window.__f.comprobar("T1-M2"))`);
    check(rM2.cls === "ACEPTA" && rM2.solVisible && rM2.progress === "solved",
      `T1-M2 correcta (2 · 5π/6) → ${rM2.cls} con solución · progreso=${rM2.progress}`);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nUI-C1-M1 R9: ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
