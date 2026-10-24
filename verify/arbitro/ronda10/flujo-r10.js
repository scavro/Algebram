/* ÁRBITRO R10 · flujo real de corrección (CDP), protocolo del árbitro:
   - tema: respuesta correcta → ✓ CON SOLUCIÓN visible y solved; incorrecta → ✗
   - examen: «Corregir examen» coincide con «Comprobar» tarjeta a tarjeta */
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
  const D = window.CURSO_DATA || {};
  function findDrill(id) {
    for (const k of Object.keys(D)) {
      const d = D[k];
      const list = d.drills || (d.exam && d.exam.questions) || [];
      for (const q of list) if (q.id === id) return q;
    }
    return null;
  }
  function okValue(spec) {
    if (!spec) return "";
    if (spec.type === "exprset") return (spec.expected || []).join("; ");
    if (spec.expectedOneOf) return String(spec.expectedOneOf[0]);
    return String(spec.expected == null ? "" : spec.expected);
  }
  function fillNode(root, spec, mode) {
    if (!root || !spec) return;
    if (spec.type === "multi") {
      const keys = Object.keys(spec.fields || {});
      const wrap = root.querySelector(".drill__fields") || root;
      const boxes = Array.from(wrap.querySelectorAll(":scope > .field"));
      keys.forEach((k, i) => fillNode(boxes[i], spec.fields[k], mode));
      return;
    }
    if (spec.type === "matrix" || spec.type === "vector") {
      const inputs = Array.from(root.querySelectorAll("input[type=text]"));
      const exp = spec.expected || [[]];
      const cols = exp[0].length;
      inputs.forEach((inp, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        inp.value = mode === "ok" ? String(exp[r][c]) : "999";
      });
      return;
    }
    if (spec.type === "choice" || spec.type === "bool") {
      const radios = Array.from(root.querySelectorAll("input[type=radio]"));
      let want;
      if (mode === "ok") want = spec.type === "choice" ? String(spec.expected) : (spec.expected ? "true" : "false");
      else want = spec.type === "choice" ? String((spec.expected + 1) % Math.max(radios.length, 2)) : (spec.expected ? "false" : "true");
      radios.forEach((r) => { r.checked = (r.value === want); });
      return;
    }
    const inp = root.querySelector("input[type=text]");
    if (inp) inp.value = mode === "ok" ? okValue(spec) : "999-basura";
  }
  window.__f = {
    findDrill,
    fill(id, mode) {
      const q = findDrill(id);
      const card = document.getElementById(id);
      fillNode(card.querySelector(".drill__answer"), q.answer, mode);
    },
    state(id) {
      const card = document.getElementById(id);
      const fb = card.querySelector(".drill__feedback");
      const sol = card.querySelector(".drill__solution");
      return {
        cls: card.classList.contains("is-correct") ? "correct" : card.classList.contains("is-wrong") ? "wrong" : "none",
        fbText: (fb ? fb.textContent.trim() : "").slice(0, 24),
        fbOk: !!fb && fb.classList.contains("ok") && fb.classList.contains("is-visible"),
        fbBad: !!fb && fb.classList.contains("bad") && fb.classList.contains("is-visible"),
        solVisible: !!sol && sol.classList.contains("is-visible"),
      };
    },
    comprobar(id) {
      const card = document.getElementById(id);
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click();
      return window.__f.state(id);
    },
    progress(id) {
      try { return (JSON.parse(localStorage.getItem("curso-algebra-progreso-v1") || "{}") || {})[id] || null; }
      catch (e) { return "ERR:" + e.message; }
    },
  };
  return 1;
})()`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  try {
    /* ============ TEMA-1: ✓ con solución + solved / ✗ ============ */
    console.log("== tema-1: flujo de corrección");
    await cdp.goto(fileUrl("temas/tema-1.html"), 1800);
    await sleep(700);
    await cdp.eval(HELPERS);

    let st = await cdp.eval(`(window.__f.fill("T1-N4","bad"), window.__f.comprobar("T1-N4"))`);
    check(st.cls === "wrong" && st.fbBad && st.fbText.startsWith("✗") && !st.solVisible,
      `T1-N4 incorrecta → ✗ sin solución  [${st.cls} · "${st.fbText.slice(0, 16)}"]`);
    st = await cdp.eval(`(window.__f.fill("T1-N4","ok"), window.__f.comprobar("T1-N4"))`);
    check(st.cls === "correct" && st.fbOk && st.fbText.startsWith("✓") && st.solVisible,
      `T1-N4 correcta ("4/11") → ✓ CON SOLUCIÓN visible  [${st.cls} · "${st.fbText.slice(0, 16)}"]`);
    check((await cdp.eval(`window.__f.progress("T1-N4")`)) === "solved", "progreso T1-N4 = 'solved' en localStorage");

    st = await cdp.eval(`(window.__f.fill("T1-M2","ok"), window.__f.comprobar("T1-M2"))`);
    check(st.cls === "correct" && st.fbOk && st.solVisible, `T1-M2 multi correcta → ✓ con solución`);
    st = await cdp.eval(`(window.__f.fill("T1-M2","bad"), window.__f.comprobar("T1-M2"))`);
    check(st.cls === "wrong" && st.fbBad, `T1-M2 multi incorrecta → ✗`);

    /* ============ EXAMEN-1: «Corregir examen» ≡ «Comprobar» ============ */
    console.log("\n== examen-1: Corregir examen vs Comprobar");
    await cdp.eval(`(sessionStorage.removeItem("curso-algebra-examen-examen-1"), 1)`);
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1800);
    await sleep(800);
    await cdp.eval(HELPERS);
    const ids = await cdp.eval(`window.CURSO_DATA["examen-1"].exam.questions.map((q) => q.id)`);
    check(ids.length === 12, `examen-1 tiene 12 preguntas (${ids.length})`);

    const plan = ids.map((id, i) => ({ id, mode: i % 2 === 0 ? "ok" : "bad" }));

    const porTarjeta = {};
    for (const p of plan) {
      await cdp.eval(`window.__f.fill(${JSON.stringify(p.id)}, ${JSON.stringify(p.mode)})`);
      porTarjeta[p.id] = await cdp.eval(`window.__f.comprobar(${JSON.stringify(p.id)})`);
    }
    const nOkCard = Object.values(porTarjeta).filter((s) => s.cls === "correct").length;
    check(nOkCard === 6, `paso 1 (Comprobar×12): 6 ✓ / 6 ✗  (${nOkCard} correctas)`);

    await cdp.eval(`(sessionStorage.removeItem("curso-algebra-examen-examen-1"), 1)`);
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1800);
    await sleep(800);
    await cdp.eval(HELPERS);
    for (const p of plan) {
      await cdp.eval(`window.__f.fill(${JSON.stringify(p.id)}, ${JSON.stringify(p.mode)})`);
    }
    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen");
      btn.click();
      return 1;
    })()`);
    await sleep(300);
    const trasCorregir = await cdp.eval(`(() => {
      const out = {};
      const ids = ${JSON.stringify(ids)};
      for (const id of ids) out[id] = window.__f.state(id);
      return out;
    })()`);
    let coinciden = 0, divergentes = [];
    for (const p of plan) {
      const a = porTarjeta[p.id], b = trasCorregir[p.id];
      if (a.cls === b.cls) coinciden++;
      else divergentes.push(`${p.id}: comprobar=${a.cls} corregir=${b.cls}`);
    }
    check(coinciden === 12 && divergentes.length === 0,
      `«Corregir examen» ≡ «Comprobar» en 12/12 tarjetas${divergentes.length ? " · DIVERGEN " + divergentes.join("; ") : ""}`);

    const score = await cdp.eval(`({
      correct: document.getElementById("exam-correct").textContent.trim(),
      total: document.getElementById("exam-total").textContent.trim(),
      grade: document.getElementById("exam-grade").textContent.trim(),
    })`);
    check(score.correct === "6" && score.total === "12" && score.grade === "5",
      `marcador tras Corregir examen: ${score.correct}/${score.total} · nota ${score.grade}`);

    const sols = await cdp.eval(`Array.from(document.querySelectorAll(".drill__solution")).filter((s) => s.classList.contains("is-visible")).length`);
    check(sols === 12, `soluciones reveladas tras Corregir examen: ${sols}/12`);

    const fbBad = await cdp.eval(`(() => {
      const ids = ${JSON.stringify(ids)};
      let bad = [];
      for (const id of ids) {
        const s = window.__f.state(id);
        const ok = s.cls === "correct" ? s.fbText.startsWith("✓") : s.fbText.startsWith("✗");
        if (!ok) bad.push(id + ":" + s.fbText.slice(0, 16));
      }
      return bad;
    })()`);
    check(fbBad.length === 0, `feedback ✓/✗ coherente por tarjeta${fbBad.length ? " · " + fbBad.join(", ") : ""}`);

    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Reiniciar");
      btn.click();
      return 1;
    })()`);
    await sleep(1200);
    const reset = await cdp.eval(`({
      timer: (document.getElementById("exam-timer") || {}).textContent,
      correct: (document.getElementById("exam-correct") || {}).textContent,
      anyCorrect: document.querySelectorAll(".drill.is-correct").length,
    })`);
    check(reset.anyCorrect === 0 && reset.correct === "0" && /^\d{2}:\d{2}:\d{2}$/.test(reset.timer || ""),
      `«Reiniciar» → 0 marcadas, marcador 0/12, timer reiniciado (${reset.timer})`);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nFLUJO R10: ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
