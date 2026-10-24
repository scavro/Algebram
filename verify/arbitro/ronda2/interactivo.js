/* Ronda 2 — verificación interactiva: C2 (reveal), C3 (coherencia examen),
   M1 (progreso índice), M7 (temporizador), estados choice (m1). */
const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");

const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);
const EXPECTED = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "ronda1", "expected.json"), "utf8"));

// Construye un plan de relleno a partir de la spec `answer`
function fillPlan(spec, value) {
  // devuelve lista de acciones {kind, ...}
  if (!spec || !spec.type) return [];
  if (spec.type === "multi") {
    const out = [];
    Object.keys(spec.fields || {}).forEach((k) => {
      out.push(...fillPlan(spec.fields[k], (value || {})[k]));
    });
    return out;
  }
  if (spec.type === "choice") return [{ kind: "radio", value: String(spec.expected) }];
  if (spec.type === "bool") return [{ kind: "radio", value: spec.expected ? "true" : "false" }];
  if (spec.type === "matrix" || spec.type === "vector") {
    const cells = [];
    (spec.expected || []).forEach((row) => row.forEach((c) => cells.push(String(c))));
    return [{ kind: "cells", cells }];
  }
  if (spec.type === "exprset") return [{ kind: "text", text: (spec.expected || []).join(";") }];
  return [{ kind: "text", text: String(spec.expected == null ? "" : spec.expected) }];
}

// JS que se inyecta: __fill(card, plan) rellena la tarjeta según el plan
const FILL_JS = `((card, plan) => {
  const setNative = (inp, v) => {
    const proto = inp.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(inp, v);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const texts = Array.from(card.querySelectorAll(".drill__answer input[type=text]"));
  const radios = Array.from(card.querySelectorAll(".drill__answer input[type=radio]"));
  let ti = 0;
  for (const act of plan) {
    if (act.kind === "text") { if (texts[ti]) setNative(texts[ti], act.text); ti++; }
    else if (act.kind === "cells") {
      for (const c of act.cells) { if (texts[ti]) setNative(texts[ti], c); ti++; }
    } else if (act.kind === "radio") {
      const r = radios.find((x) => x.value === act.value);
      if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); }
    }
  }
})`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  const res = {};
  try {
    /* ---------------- C2: reveal al hacer scroll ---------------- */
    await cdp.goto(fileUrl("temas/tema-1.html"), 1500);
    await sleep(600);
    const c2before = await cdp.eval(`(() => {
      const d = document.querySelector("article.drill");
      return { opacity: getComputedStyle(d).opacity, isin: d.classList.contains("is-in") };
    })()`);
    // scroll al último drill y al primero
    await cdp.eval(`document.querySelectorAll("article.drill")[14].scrollIntoView({block:"center"})`);
    await sleep(900);
    const c2last = await cdp.eval(`(() => {
      const d = document.querySelectorAll("article.drill")[14];
      return { opacity: getComputedStyle(d).opacity, isin: d.classList.contains("is-in") };
    })()`);
    await cdp.eval(`document.querySelectorAll("article.drill")[0].scrollIntoView({block:"center"})`);
    await sleep(900);
    const c2first = await cdp.eval(`(() => {
      const d = document.querySelectorAll("article.drill")[0];
      return { opacity: getComputedStyle(d).opacity, isin: d.classList.contains("is-in") };
    })()`);
    // recorrido completo: todos los drills se revelan al recorrer la página
    await cdp.eval(`(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,80)); } })()`, true);
    await sleep(1000);
    const c2all = await cdp.eval(`(() => {
      const ds = Array.from(document.querySelectorAll("article.drill"));
      return {
        total: ds.length,
        viewport: { w: innerWidth, h: innerHeight },
        sinRevelar: ds.filter((d) => !d.classList.contains("is-in") || getComputedStyle(d).opacity !== "1").map((d) => {
          const r = d.getBoundingClientRect();
          return { id: d.id, h: Math.round(r.height), w: Math.round(r.width), opacity: getComputedStyle(d).opacity, isin: d.classList.contains("is-in") };
        }),
        alturas: ds.map((d) => d.id + ":" + Math.round(d.getBoundingClientRect().height)),
      };
    })()`);
    res.C2 = { before: c2before, last: c2last, first: c2first, trasScrollCompleto: c2all };
    console.log("C2:", JSON.stringify(res.C2));

    /* ---------------- C3: coherencia Comprobar vs Corregir examen ---------------- */
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1500);
    await sleep(700);
    await cdp.eval(`window.__fill = ${FILL_JS}`, false);
    const q1 = EXPECTED["examen-1"];
    // 1) Rellenar TODO con respuestas correctas, comprobar tarjeta por tarjeta
    const perCard = await cdp.eval(`(() => {
      const fill = window.__fill;
      const specs = ${JSON.stringify(q1.map((q) => ({ id: q.id, answer: q.answer })))};
      const results = [];
      for (const s of specs) {
        const card = document.getElementById(s.id);
        // plan se reconstruye en el navegador con la spec
        const planOf = (spec) => {
          if (!spec || !spec.type) return [];
          if (spec.type === "multi") {
            const out = [];
            Object.keys(spec.fields || {}).forEach((k) => out.push(...planOf(spec.fields[k])));
            return out;
          }
          if (spec.type === "choice") return [{ kind: "radio", value: String(spec.expected) }];
          if (spec.type === "bool") return [{ kind: "radio", value: spec.expected ? "true" : "false" }];
          if (spec.type === "matrix" || spec.type === "vector") {
            const cells = [];
            (spec.expected || []).forEach((row) => row.forEach((c) => cells.push(String(c))));
            return [{ kind: "cells", cells }];
          }
          if (spec.type === "exprset") return [{ kind: "text", text: (spec.expected || []).join(";") }];
          return [{ kind: "text", text: String(spec.expected == null ? "" : spec.expected) }];
        };
        fill(card, planOf(s.answer));
        const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
        btn.click();
        const fb = card.querySelector(".drill__feedback");
        results.push({ id: s.id, ok: fb.classList.contains("ok"), txt: fb.textContent.trim().slice(0, 30) });
      }
      return results;
    })()`);
    const notaTrasComprobar = await cdp.eval(`document.querySelector("#exam-grade").textContent`);
    // 2) Ahora "Corregir examen"
    await cdp.eval(`Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen").click()`);
    await sleep(500);
    const global = await cdp.eval(`(() => {
      const cards = Array.from(document.querySelectorAll("article.drill"));
      return {
        correctos: document.querySelector("#exam-correct").textContent,
        nota: document.querySelector("#exam-grade").textContent,
        tarjetas: cards.map((c) => ({ id: c.id, ok: c.classList.contains("is-correct"), bad: c.classList.contains("is-wrong") })),
      };
    })()`);
    res.C3 = {
      perCardOK: perCard.filter((x) => x.ok).length + "/" + perCard.length,
      perCardFails: perCard.filter((x) => !x.ok),
      notaTrasComprobar,
      trasCorregirExamen: global.correctos + "/" + global.tarjetas.length + " nota=" + global.nota,
      contradicciones: global.tarjetas.filter((t) => {
        const pc = perCard.find((x) => x.id === t.id);
        return pc && pc.ok !== t.ok;
      }),
    };
    console.log("C3:", JSON.stringify(res.C3, null, 1));

    /* ---------------- C3b: multi con matrices (X1-8) tarjeta vs global ---------------- */
    // reset y solo X1-8 correcto
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1200);
    await sleep(600);
    await cdp.eval(`window.__fill = ${FILL_JS}`, false);
    const x18 = q1.find((q) => q.id === "X1-8") || q1.filter((q) => q.answer && q.answer.type === "multi")[0];
    const c3b = await cdp.eval(`(() => {
      const fill = window.__fill;
      const spec = ${JSON.stringify(x18 ? x18.answer : null)};
      const planOf = (spec) => {
        if (!spec || !spec.type) return [];
        if (spec.type === "multi") { const out = []; Object.keys(spec.fields || {}).forEach((k) => out.push(...planOf(spec.fields[k]))); return out; }
        if (spec.type === "choice") return [{ kind: "radio", value: String(spec.expected) }];
        if (spec.type === "bool") return [{ kind: "radio", value: spec.expected ? "true" : "false" }];
        if (spec.type === "matrix" || spec.type === "vector") { const cells = []; (spec.expected || []).forEach((row) => row.forEach((c) => cells.push(String(c)))); return [{ kind: "cells", cells }]; }
        return [{ kind: "text", text: String(spec.expected == null ? "" : spec.expected) }];
      };
      const card = document.getElementById(${JSON.stringify(x18 ? x18.id : "")});
      fill(card, planOf(spec));
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click();
      return card.querySelector(".drill__feedback").className + " | " + card.querySelector(".drill__feedback").textContent.trim().slice(0, 40);
    })()`);
    await cdp.eval(`Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen").click()`);
    await sleep(400);
    const c3bGlobal = await cdp.eval(`(() => {
      const card = document.getElementById(${JSON.stringify(x18 ? x18.id : "")});
      return card.className + " | nota=" + document.querySelector("#exam-grade").textContent + " | fb=" + card.querySelector(".drill__feedback").textContent.trim().slice(0, 40);
    })()`);
    res.C3b = { id: x18 && x18.id, tarjeta: c3b, global: c3bGlobal };
    console.log("C3b (multi/matriz):", JSON.stringify(res.C3b, null, 1));

    /* ---------------- M1: progreso del índice ---------------- */
    await cdp.goto(fileUrl("index.html"), 1200);
    await sleep(400);
    const m1vacio = await cdp.eval(`(() => {
      return Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => l.getAttribute("data-theme-progress-label") + "=" + l.textContent.trim());
    })()`);
    // inyecta progreso en localStorage con ids reales del banco
    const ids = {};
    Object.keys(EXPECTED).forEach((k) => (ids[k] = EXPECTED[k].slice(0, 5).map((q) => q.id)));
    await cdp.eval(`localStorage.setItem("curso-algebra-progreso-v1", ${JSON.stringify("{}")}); 
      (() => { const p = {}; ${Object.entries(ids).map(([k, v]) => v.map((id) => `p[${JSON.stringify(id)}]="solved";`).join("")).join("\n")} localStorage.setItem("curso-algebra-progreso-v1", JSON.stringify(p)); })()`);
    await cdp.goto(fileUrl("index.html"), 1200);
    await sleep(500);
    const m1progreso = await cdp.eval(`(() => {
      const bars = Array.from(document.querySelectorAll("[data-theme-progress]"));
      return {
        labels: Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => l.getAttribute("data-theme-progress-label") + "=" + l.textContent.trim()),
        widths: bars.map((b) => b.getAttribute("data-theme-progress") + "=" + b.style.width),
      };
    })()`);
    res.M1 = { sinProgreso: m1vacio, conProgreso5de15: m1progreso };
    console.log("M1:", JSON.stringify(res.M1, null, 1));

    /* ---------------- M7: temporizador persistente ---------------- */
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1300);
    await sleep(700);
    const t1 = await cdp.eval(`document.querySelector("#exam-timer").textContent`);
    const dl1 = await cdp.eval(`sessionStorage.getItem("curso-algebra-examen-examen-1")`);
    await sleep(2200);
    const t2 = await cdp.eval(`document.querySelector("#exam-timer").textContent`);
    // F5
    await cdp.send("Page.reload", {});
    await sleep(1400);
    const t3 = await cdp.eval(`document.querySelector("#exam-timer").textContent`);
    const dl3 = await cdp.eval(`sessionStorage.getItem("curso-algebra-examen-examen-1")`);
    res.M7_F5 = { t1, t2, trasF5: t3, deadlineMisma: dl1 === dl3, noReseteado: t3 !== "02:00:00" && t3 !== "01:59:59" && t3 !== "02:00:00" };
    // ¿el valor baja respecto al inicial?
    res.M7_F5.conserva = (t1 !== "02:00:00" || t3 !== "02:00:00" || dl1 === dl3);
    console.log("M7 F5:", JSON.stringify(res.M7_F5));

    // deadline en el pasado → auto-corrección a 0 y bloqueo
    await cdp.eval(`sessionStorage.setItem("curso-algebra-examen-examen-1", String(Date.now() - 5000))`);
    await cdp.send("Page.reload", {});
    await sleep(1500);
    const t0 = await cdp.eval(`(() => {
      const inputs = Array.from(document.querySelectorAll(".drill__answer input"));
      return {
        timer: document.querySelector("#exam-timer").textContent,
        inputs: inputs.length,
        deshabilitados: inputs.filter((i) => i.disabled).length,
        btnCorregirDeshabilitado: Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen").disabled,
        nota: document.querySelector("#exam-grade").textContent,
        correctos: document.querySelector("#exam-correct").textContent,
      };
    })()`);
    res.M7_cero = t0;
    console.log("M7 a 0s:", JSON.stringify(t0));

    // Reiniciar limpia sesión
    await cdp.eval(`Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Reiniciar").click()`);
    await sleep(1500);
    const tReset = await cdp.eval(`(() => ({
      timer: document.querySelector("#exam-timer").textContent,
      deadline: sessionStorage.getItem("curso-algebra-examen-examen-1"),
      inputsDeshabilitados: Array.from(document.querySelectorAll(".drill__answer input")).filter((i) => i.disabled).length,
    }))()`);
    res.M7_reset = tReset;
    console.log("M7 Reiniciar:", JSON.stringify(tReset));

    /* ---------------- m1: estados is-selected/is-right/is-wrong ---------------- */
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1200);
    await sleep(600);
    const m1states = await cdp.eval(`(() => {
      // encuentra la primera pregunta choice/bool
      const specs = ${JSON.stringify(q1.map((q) => ({ id: q.id, answer: q.answer })))};
      const findChoice = (spec, id) => {
        if (!spec) return null;
        if (spec.type === "choice" || spec.type === "bool") return { id, spec };
        if (spec.type === "multi") {
          for (const k of Object.keys(spec.fields || {})) {
            const r = findChoice(spec.fields[k], id);
            if (r) return r;
          }
        }
        return null;
      };
      const target = specs.map((s) => findChoice(s.answer, s.id)).find(Boolean);
      if (!target) return { found: false };
      const card = document.getElementById(target.id);
      const labels = Array.from(card.querySelectorAll(".choice"));
      const radios = labels.map((l) => l.querySelector("input"));
      // elige una opción (la incorrecta si es posible)
      const spec = target.spec;
      let pick = radios.find((r, i) => {
        const v = spec.type === "choice" ? parseInt(r.value, 10) : r.value === "true";
        return v !== spec.expected;
      });
      if (!pick) pick = radios[0];
      pick.checked = true;
      pick.dispatchEvent(new Event("change", { bubbles: true }));
      const trasElegir = labels.map((l) => l.className);
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click();
      const trasCorregir = labels.map((l) => l.className);
      return { found: true, id: target.id, type: target.spec.type, trasElegir, trasCorregir };
    })()`);
    res.m1_estados = m1states;
    console.log("m1 estados choice:", JSON.stringify(m1states, null, 1));

    /* ---------------- M5: aria-live en nota y feedback (runtime) ---------------- */
    const m5 = await cdp.eval(`(() => {
      const fb = document.querySelector(".drill__feedback");
      const grade = document.querySelector("#exam-grade");
      const correct = document.querySelector("#exam-correct");
      const total = document.querySelector("#exam-total");
      const timer = document.querySelector("#exam-timer");
      return {
        feedback: { role: fb.getAttribute("role"), live: fb.getAttribute("aria-live") },
        grade: { live: grade.getAttribute("aria-live") },
        correct: { live: correct.getAttribute("aria-live") },
        total: { live: total.getAttribute("aria-live") },
        timer: { live: timer.getAttribute("aria-live"), role: timer.getAttribute("role") },
      };
    })()`);
    res.M5 = m5;
    console.log("M5 runtime:", JSON.stringify(m5));
  } finally {
    fs.writeFileSync(path.join(__dirname, "interactivo.json"), JSON.stringify(res, null, 1));
    await cdp.close();
    proc.kill();
  }
  console.log("\nOK interactivo.json");
})().catch((e) => {
  console.error("FALLO:", e);
  process.exit(1);
});
