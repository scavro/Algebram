/* ÁRBITRO R9 · batería hostil de humo sobre la UI (CDP/Chrome):
   (a) multi incompleto: campos parciales o vacíos en T1-M2 → ✗ sin crash
   (b) choice sin selección: «Comprobar» y «Corregir examen» sin marcar → ✗
   (c) localStorage corrupto: muestra representativa de la batería R8 →
       la página arranca sana (drills + KaTeX + labels «n / 15 · p%») y el
       motor de corrección sigue operativo.
   Criterio: cero errores de JS, cero crashes, feedback ✗ visible y motor
   operativo tras cada agresión. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");

const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

let fallos = 0;
function check(ok, msg) {
  if (!ok) fallos++;
  console.log(`  ${ok ? "✔" : "✘"} ${msg}`);
}

const COLLECTOR = `(() => {
  window.__errs = [];
  window.addEventListener("error", (e) => {
    const t = e.target || {};
    const where = t.tagName ? t.tagName.toLowerCase() + ":" + ((t.src || t.currentSrc || t.href || "").split("/").pop() || "?") : (e.message || e.type);
    window.__errs.push("error: " + where);
  }, true);
  window.addEventListener("unhandledrejection", (e) => window.__errs.push("rejection: " + String(e.reason).slice(0, 120)));
  const ce = console.error;
  console.error = function (...a) { window.__errs.push("console.error: " + a.map(String).join(" ").slice(0, 120)); ce.apply(console, a); };
  return 1;
})()`;

const HELPERS = `(() => {
  window.__f = {
    errs() { return (window.__errs || []).filter((e) => !/^error: track:/.test(e)); },
    state(id) {
      const card = document.getElementById(id);
      const fb = card.querySelector(".drill__feedback");
      const sol = card.querySelector(".drill__solution");
      return {
        cls: card.classList.contains("is-correct") ? "correct" : card.classList.contains("is-wrong") ? "wrong" : "none",
        fbVisible: !!fb && fb.classList.contains("is-visible"),
        fbText: fb ? fb.textContent.trim().slice(0, 50) : "",
        solVisible: !!sol && sol.classList.contains("is-visible"),
      };
    },
    comprobar(id) {
      const card = document.getElementById(id);
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click();
      return window.__f.state(id);
    },
    setInputs(id, values) {
      const card = document.getElementById(id);
      const inputs = card.querySelectorAll(".drill__answer input[type=text]");
      inputs.forEach((inp, i) => { inp.value = values[i] != null ? values[i] : ""; });
      return inputs.length;
    },
    clearRadios(id) {
      const card = document.getElementById(id);
      card.querySelectorAll("input[type=radio]").forEach((r) => { r.checked = false; });
      return 1;
    },
    health() {
      return {
        errs: window.__f.errs(),
        drills: document.querySelectorAll("article.drill").length,
        katex: document.querySelectorAll(".katex").length,
        katexErrors: document.querySelectorAll(".katex-error").length,
        labels: Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => l.textContent.trim()),
      };
    },
  };
  return 1;
})()`;

const HEALTH_MIN = `(() => ({
  errs: (window.__errs || []).filter((e) => !/^error: track:/.test(e)),
  drills: document.querySelectorAll("article.drill").length,
  katexErrors: document.querySelectorAll(".katex-error").length,
}))()`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR });
  try {
    /* ===== (a) multi incompleto ===== */
    console.log("== (a) multi incompleto (T1-M2: mod=2 exact · arg=5*pi/6)");
    await cdp.goto(fileUrl("temas/tema-1.html"), 2000);
    await sleep(800);
    await cdp.eval(HELPERS);
    const casosMulti = [
      ["M-a solo mod correcto, arg vacío", ["2", ""]],
      ["M-b solo arg correcto, mod vacío", ["", "5*pi/6"]],
      ["M-c ambos vacíos", ["", ""]],
      ["M-d mod correcto, arg basura", ["2", "zzz-###"]],
    ];
    for (const [nombre, vals] of casosMulti) {
      const st = await cdp.eval(`(window.__f.setInputs("T1-M2", ${JSON.stringify(vals)}), window.__f.comprobar("T1-M2"))`);
      const errs = await cdp.eval(`window.__f.errs()`);
      check(st.cls === "wrong" && st.fbVisible && /^✗/.test(st.fbText) && errs.length === 0,
        `${nombre} → ${st.cls} "${st.fbText.slice(0, 24)}" · JS-errs=${errs.length}`);
    }
    const stM2ok = await cdp.eval(`(window.__f.setInputs("T1-M2", ["2", "5*pi/6"]), window.__f.comprobar("T1-M2"))`);
    check(stM2ok.cls === "correct" && stM2ok.solVisible,
      `M-e recuperación multi correcta (2 · 5π/6) → ${stM2ok.cls} con solución`);
    // multi malformado extremo: basura en todos los campos
    const stM2x = await cdp.eval(`(window.__f.setInputs("T1-M2", ["(((", "***"]), window.__f.comprobar("T1-M2"))`);
    check(stM2x.cls === "wrong" && stM2x.fbVisible, `M-f multi basura "((( · ***" → ${stM2x.cls} sin crash`);

    /* ===== (b) choice sin selección ===== */
    console.log("\n== (b) choice sin selección");
    await cdp.eval(`window.__f.clearRadios("T1-N3")`);
    const stCh = await cdp.eval(`window.__f.comprobar("T1-N3")`);
    const errsCh = await cdp.eval(`window.__f.errs()`);
    check(stCh.cls === "wrong" && stCh.fbVisible && /Selecciona/.test(stCh.fbText) && errsCh.length === 0,
      `T1-N3 «Comprobar» sin marcar → ${stCh.cls} "${stCh.fbText.slice(0, 30)}" · JS-errs=${errsCh.length}`);
    const stBool = await cdp.eval(`(window.__f.clearRadios("T1-M5"), window.__f.comprobar("T1-M5"))`);
    check(stBool.cls === "wrong" && stBool.fbVisible && /Selecciona/.test(stBool.fbText),
      `T1-M5 bool sin marcar → ${stBool.cls} "${stBool.fbText.slice(0, 30)}"`);

    // examen: «Corregir examen» con todo sin marcar
    console.log("== (b2) examen-1 «Corregir examen» sin ninguna selección");
    await cdp.goto(fileUrl("examenes/examen-1.html"), 2000);
    await sleep(900);
    await cdp.eval(HELPERS);
    await cdp.eval(`(() => {
      document.querySelectorAll("input[type=radio]").forEach((r) => { r.checked = false; });
      document.querySelectorAll("input[type=text]").forEach((i) => { i.value = ""; });
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen");
      btn.click();
      return 1;
    })()`);
    await sleep(300);
    const ex = await cdp.eval(`(() => {
      const ids = window.CURSO_DATA["examen-1"].exam.questions.map((q) => q.id);
      const states = ids.map((id) => window.__f.state(id));
      return {
        errs: window.__f.errs(),
        nCorrect: states.filter((s) => s.cls === "correct").length,
        nWrong: states.filter((s) => s.cls === "wrong").length,
        fbOk: states.every((s) => s.cls === "wrong" && s.fbVisible && /^✗/.test(s.fbText)),
        score: (document.getElementById("exam-correct") || {}).textContent,
        total: (document.getElementById("exam-total") || {}).textContent,
        grade: (document.getElementById("exam-grade") || {}).textContent,
      };
    })()`);
    check(ex.nCorrect === 0 && ex.nWrong === 12 && ex.fbOk && ex.errs.length === 0,
      `examen-1 sin marcar → 12/12 ✗ · 0 ✓ · feedback ✗ en todas · JS-errs=${ex.errs.length}`);
    check(ex.score === "0" && ex.total === "12" && ex.grade === "0",
      `marcador sin marcar: ${ex.score}/${ex.total} · nota ${ex.grade}`);

    /* ===== (c) localStorage corrupto (muestra representativa R8) ===== */
    console.log("\n== (c) localStorage 'curso-algebra-progreso-v1' corrupto");
    const LS_CASES = [
      ["L1  '{{{' JSON inválido", "{{{"],
      ["L2  'null'", "null"],
      ["L4  '[1,2,3]' array", "[1,2,3]"],
      ["L7  'undefined' literal", "undefined"],
      ["L9  '__proto__' pollution", '{"__proto__":{"polluted":1}}'],
      ["L10 valor anidado", '{"T1-N4":{"nested":1}}'],
      ["L12 sano: 1 solved", '{"T1-N4":"solved"}'],
      ["L15 claves ajenas + solved", '{"T1-N4":"solved","tema-1":"hacked"}'],
    ];
    for (const [nombre, valor] of LS_CASES) {
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
        source: `try { localStorage.setItem("curso-algebra-progreso-v1", ${JSON.stringify(valor)}); } catch (e) {}`,
      });
      await cdp.goto(fileUrl("index.html"), 1800);
      await sleep(600);
      const hIndex = await cdp.eval(`(() => {
        const h = ${HEALTH_MIN};
        h.labelsIndex = Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => l.textContent.trim());
        return h;
      })()`);
      await cdp.goto(fileUrl("temas/tema-1.html"), 2000);
      await sleep(800);
      await cdp.eval(HELPERS);
      const hTema = await cdp.eval(`window.__f.health()`);
      const stDrv = await cdp.eval(`(window.__f.setInputs("T1-N4", ["4/11"]), window.__f.comprobar("T1-N4"))`);
      const labelsSane = (hIndex.labelsIndex || []).every((t) => /^\d+ \/ \d+ · \d+%$/.test(t))
        && (hTema.labels || []).every((t) => /^\d+ \/ \d+ · \d+%$/.test(t));
      const errs = hIndex.errs.length + hTema.errs.length;
      check(errs === 0 && hTema.drills === 15 && hTema.katexErrors === 0
        && labelsSane && hIndex.labelsIndex.length > 0 && stDrv.cls === "correct",
        `${nombre} → boots OK · drills tema=${hTema.drills} · katex=${hTema.katex} · labels idx=${hIndex.labelsIndex.length} OK=${labelsSane} · T1-N4→${stDrv.cls} · JS-errs=${errs}`);
    }
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nHOSTIL-UI R9: ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
