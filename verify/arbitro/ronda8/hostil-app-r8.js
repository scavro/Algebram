/* ÁRBITRO R8 · batería hostil sobre app.js: almacenamiento corrupto
   (a) localStorage "curso-algebra-progreso-v1" con valores basura (15 casos)
   (b) sessionStorage "curso-algebra-examen-examen-1" corrupto (8 casos)
   (c) auto-sanación: corregir con storage corrupto reescribe progreso sano
   Criterio: la página debe arrancar (drills + KaTeX + secciones), sin errores
   de JS, con rótulos de progreso en formato «n / 15 · p%», y el motor de
   corrección operativo. */
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

const HEALTH = `(() => {
  const drills = document.querySelectorAll("article.drill");
  const labels = Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => l.textContent.trim());
  return {
    errs: (window.__errs || []).filter((e) => !/^error: track:/.test(e)),
    drills: drills.length,
    katex: document.querySelectorAll(".katex").length,
    katexErrors: document.querySelectorAll(".katex-error").length,
    labels,
    labelsFormatOk: labels.every((t) => /^\\d+ \\/ \\d+ · \\d+%$/.test(t)),
    revealHidden: Array.from(document.querySelectorAll(".reveal")).filter((r) => getComputedStyle(r).opacity === "0").length,
  };
})()`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR });
  try {
    /* ===== (a) localStorage corrupto ===== */
    console.log("== (a) localStorage 'curso-algebra-progreso-v1' corrupto");
    const LS_CASES = [
      ["L1  '{{{' JSON inválido", "{{{", { labelsSane: true }],
      ["L2  'null' (el N1 de la R2)", "null", { labelsSane: true }],
      ["L3  '\"x\"' string", '"x"', { labelsSane: true }],
      ["L4  '[1,2,3]' array", "[1,2,3]", { labelsSane: true }],
      ["L5  '123' número", "123", { labelsSane: true }],
      ["L6  'true' booleano", "true", { labelsSane: true }],
      ["L7  'undefined' literal", "undefined", { labelsSane: true }],
      ["L8  cadena vacía", "", { labelsSane: true }],
      ["L9  '__proto__' pollution", '{"__proto__":{"polluted":1}}', { labelsSane: true }],
      ["L10 valor anidado {a:{...}}", '{"T1-N4":{"nested":1}}', { labelsSane: true }],
      ["L11 valor booleano por id", '{"T1-N4":true}', { labelsSane: true }],
      ["L12 sano: 1 solved", '{"T1-N4":"solved"}', { labelsSane: true, expectLabel: "1 / 15 · 7%" }],
      ["L13 string de 300KB", '{"K":"' + "x".repeat(300000) + '"}', { labelsSane: true }],
      ["L14 3000 claves basura", "{" + Array.from({ length: 3000 }, (_, i) => `"K${i}":"solved"`).join(",") + "}", { labelsSane: true }],
      ["L15 claves ajenas + solved", '{"T1-N4":"solved","tema-1":"hacked"}', { labelsSane: true, expectLabel: "1 / 15 · 7%" }],
    ];
    for (const [nombre, valor, exp] of LS_CASES) {
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
        source: `try { localStorage.setItem("curso-algebra-progreso-v1", ${JSON.stringify(valor)}); } catch (e) {}`,
      });
      await cdp.goto(fileUrl("index.html"), 1600);
      await sleep(500);
      const hIndex = await cdp.eval(HEALTH);
      await cdp.goto(fileUrl("temas/tema-1.html"), 1800);
      await sleep(600);
      const hTema = await cdp.eval(HEALTH);
      const errs = hIndex.errs.concat(hTema.errs);
      const bootOk = hTema.drills === 15 && hTema.katex > 300 && hTema.katexErrors === 0;
      const labelsOk = hIndex.labels.length === 5 && hIndex.labelsFormatOk;
      const labelExp = exp.expectLabel
        ? hIndex.labels.includes(exp.expectLabel)
        : hIndex.labels.every((l) => /^0 \/ 15 · 0%$/.test(l) || /^\d+ \/ 15 · \d+%$/.test(l));
      check(bootOk && errs.length === 0 && labelsOk && labelExp,
        `${nombre}: tema-1 ${hTema.drills} drills · ${hTema.katex} fórmulas · errores JS ${errs.length} · labels ${JSON.stringify(hIndex.labels)}${exp.expectLabel ? " (esperado incl. " + exp.expectLabel + ")" : ""}${errs.length ? " · " + errs.join(" | ") : ""}`);
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR });
    }

    // auto-sanación: con LS corrupto, corregir reescribe progreso sano
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `try { localStorage.setItem("curso-algebra-progreso-v1", "{{{"); } catch (e) {}`,
    });
    await cdp.goto(fileUrl("temas/tema-1.html"), 1800);
    await sleep(700);
    const healed = await cdp.eval(`(() => {
      const card = document.getElementById("T1-N4");
      card.querySelector("input[type=text]").value = "4/11";
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click();
      const raw = localStorage.getItem("curso-algebra-progreso-v1");
      let p = null;
      try { p = JSON.parse(raw); } catch (e) { p = "PARSE-ERROR"; }
      return {
        correct: card.classList.contains("is-correct"),
        raw: String(raw).slice(0, 60),
        solved: p && p["T1-N4"],
        soloUnaClave: p && typeof p === "object" && Object.keys(p).length === 1,
      };
    })()`);
    check(healed.correct && healed.solved === "solved" && healed.soloUnaClave,
      `auto-sanación: LS '{{{' → corregir T1-N4 → ${healed.raw} (T1-N4=${healed.solved}, 1 clave)`);
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR });

    /* ===== (b) sessionStorage de deadline corrupto ===== */
    console.log("\n== (b) sessionStorage 'curso-algebra-examen-examen-1' corrupto");
    const SS_CASES = [
      ["S1  'abc' no numérico", "abc", { timer: "02", unlocked: true }],
      ["S2  'NaN'", "NaN", { timer: "02", unlocked: true }],
      ["S3  'Infinity'", "Infinity", { timer: "02", unlocked: true }],
      ["S4  '' vacío", "", { timer: "02", unlocked: true }],
      ["S5  '0' falsy", "0", { timer: "02", unlocked: true }],
      ["S6  '999999999999999999999' (clampeo R5)", "999999999999999999999", { timer: "01:59:5", unlocked: true }],
      ["S7  '-1' pasado", "-1", { timer: "00:00:00", locked: true }],
      ["S8  '1e21' (parseInt=1 → pasado)", "1e21", { timer: "00:00:00", locked: true }],
    ];
    for (const [nombre, valor, exp] of SS_CASES) {
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
        source: `try { sessionStorage.setItem("curso-algebra-examen-examen-1", ${JSON.stringify(valor)}); } catch (e) {}`,
      });
      await cdp.goto(fileUrl("examenes/examen-1.html"), 1800);
      await sleep(900);
      const r = await cdp.eval(`(() => {
        const t = (document.getElementById("exam-timer") || {}).textContent || "";
        const inputs = Array.from(document.querySelectorAll("article.drill input"));
        return {
          errs: (window.__errs || []).filter((e) => !/^error: track:/.test(e)),
          timer: t,
          locked: inputs.length > 0 && inputs.every((i) => i.disabled),
          unlocked: inputs.length > 0 && inputs.some((i) => !i.disabled),
          drills: document.querySelectorAll("article.drill").length,
          correct: (document.getElementById("exam-correct") || {}).textContent,
        };
      })()`);
      const timerOk = exp.timer === "02" ? (/^02:00:00$/.test(r.timer) || /^01:59:5\d$/.test(r.timer))
        : exp.timer === "00:00:00" ? r.timer === "00:00:00"
        : r.timer.startsWith(exp.timer);
      const lockOk = exp.locked ? r.locked : exp.unlocked ? r.unlocked : true;
      check(r.errs.length === 0 && r.drills === 12 && timerOk && lockOk,
        `${nombre}: timer=${r.timer} · bloqueado=${r.locked} · drills=${r.drills} · errores JS ${r.errs.length}${r.errs.length ? " · " + r.errs.join(" | ") : ""}`);
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR });
    }

    /* ===== (c) corrección en examen con LS corrupto ===== */
    console.log("\n== (c) examen con LS corrupto: Corregir examen operativo");
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `try { localStorage.setItem("curso-algebra-progreso-v1", "[1,2"); } catch (e) {}`,
    });
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1800);
    await sleep(800);
    const exam = await cdp.eval(`(() => {
      const D = window.CURSO_DATA["examen-1"];
      const q = D.exam.questions[0];
      const card = document.getElementById(q.id);
      const inp = card.querySelector("input[type=text]");
      if (inp) inp.value = String(q.answer.expected != null ? q.answer.expected : "");
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen");
      btn.click();
      const fb = card.querySelector(".drill__feedback");
      return {
        errs: (window.__errs || []).filter((e) => !/^error: track:/.test(e)),
        cls: card.classList.contains("is-correct") ? "correct" : card.classList.contains("is-wrong") ? "wrong" : "none",
        grade: (document.getElementById("exam-grade") || {}).textContent,
      };
    })()`);
    check(exam.errs.length === 0 && exam.cls !== "none" && exam.grade !== "—",
      `Corregir examen con LS corrupto: 1ª tarjeta=${exam.cls} · nota=${exam.grade} · errores JS ${exam.errs.length}`);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nHOSTIL-APP R8: ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
