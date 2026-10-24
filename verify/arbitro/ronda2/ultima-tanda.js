/* Última tanda: reduced-motion en runtime, recursos fallidos, tipografía,
   y C3 (Comprobar vs Corregir) en exámenes 2 y 3. */
const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);
const EXPECTED = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "ronda1", "expected.json"), "utf8"));

const FILL_JS = `((card, plan) => {
  const setNative = (inp, v) => {
    const proto = inp.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(inp, v);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const texts = Array.from(card.querySelectorAll(".drill__answer input[type=text]"));
  const radios = Array.from(card.querySelectorAll(".drill__answer input[type=radio]"));
  let ti = 0;
  for (const act of plan) {
    if (act.kind === "text") { if (texts[ti]) setNative(texts[ti], act.text); ti++; }
    else if (act.kind === "cells") { for (const c of act.cells) { if (texts[ti]) setNative(texts[ti], c); ti++; } }
    else if (act.kind === "radio") {
      const r = radios.find((x) => x.value === act.value);
      if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); }
    }
  }
})`;

const PLAN_OF = `(spec) => {
  if (!spec || !spec.type) return [];
  if (spec.type === "multi") { const out = []; Object.keys(spec.fields || {}).forEach((k) => out.push(...window.__planOf(spec.fields[k]))); return out; }
  if (spec.type === "choice") return [{ kind: "radio", value: String(spec.expected) }];
  if (spec.type === "bool") return [{ kind: "radio", value: spec.expected ? "true" : "false" }];
  if (spec.type === "matrix" || spec.type === "vector") {
    const cells = [];
    (spec.expected || []).forEach((row) => row.forEach((c) => cells.push(String(c))));
    return [{ kind: "cells", cells }];
  }
  if (spec.type === "exprset") return [{ kind: "text", text: (spec.expected || []).join(";") }];
  return [{ kind: "text", text: String(spec.expected == null ? "" : spec.expected) }];
}`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    /* ---- reduced-motion ---- */
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await cdp.goto(fileUrl("index.html"), 1300);
    await sleep(500);
    const rm = await cdp.eval(`(() => {
      const f = document.querySelector(".hero__formula");
      const fill = document.querySelector(".progress-bar__fill");
      const cs = f ? getComputedStyle(f) : null;
      return {
        match: matchMedia("(prefers-reduced-motion: reduce)").matches,
        formulaAnim: cs ? cs.animationDuration + " / iter=" + cs.animationIterationCount : null,
        formulaAnimName: cs ? cs.animationName : null,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      };
    })()`);
    console.log("reduced-motion:", JSON.stringify(rm));
    await cdp.send("Emulation.setEmulatedMedia", { features: [] });

    /* ---- recursos fallidos + tipografía ---- */
    await cdp.goto(fileUrl("temas/tema-1.html"), 1500);
    await sleep(600);
    const res = await cdp.eval(`(() => {
      const fails = performance.getEntriesByType("resource").filter((r) => r.responseStatus >= 400 || (r.duration === 0 && r.transferSize === 0 && !r.name.startsWith("file:")));
      const names = performance.getEntriesByType("resource").map((r) => r.name.split("/").pop());
      return {
        recursos: names.length,
        fallidos: fails.map((f) => f.name.split("/").pop()),
        fonts: {
          fraunces: document.fonts.check("16px Fraunces"),
          inter: document.fonts.check("16px Inter"),
          mono: document.fonts.check("16px 'IBM Plex Mono'"),
        },
        bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 40),
        h1Font: (() => { const h = document.querySelector("h1, .theme-head h1"); return h ? getComputedStyle(h).fontFamily.slice(0, 40) : null; })(),
      };
    })()`);
    console.log("recursos/tipografía:", JSON.stringify(res, null, 1));

    /* ---- C3 en examen-2 y examen-3 ---- */
    for (const ex of ["examen-2", "examen-3"]) {
      await cdp.goto(fileUrl("examenes/" + ex + ".html"), 1300);
      await cdp.eval(`window.__fill = ${FILL_JS}; window.__planOf = ${PLAN_OF};`, false);
      const specs = EXPECTED[ex].map((q) => ({ id: q.id, answer: q.answer }));
      const perCard = await cdp.eval(`(() => {
        const specs = ${JSON.stringify(specs)};
        const results = [];
        for (const s of specs) {
          const card = document.getElementById(s.id);
          window.__fill(card, window.__planOf(s.answer));
          Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
          const fb = card.querySelector(".drill__feedback");
          results.push({ id: s.id, ok: fb.classList.contains("ok"), txt: fb.textContent.trim().slice(0, 24) });
        }
        return results;
      })()`);
      await cdp.eval(`Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen").click()`);
      await sleep(400);
      const global = await cdp.eval(`(() => {
        const cards = Array.from(document.querySelectorAll("article.drill"));
        return {
          correctos: document.querySelector("#exam-correct").textContent,
          nota: document.querySelector("#exam-grade").textContent,
          tarjetas: cards.map((c) => ({ id: c.id, ok: c.classList.contains("is-correct") })),
        };
      })()`);
      const contrad = global.tarjetas.filter((t) => {
        const pc = perCard.find((x) => x.id === t.id);
        return pc && pc.ok !== t.ok;
      });
      console.log(`${ex}: perCard=${perCard.filter((x) => x.ok).length}/${perCard.length} global=${global.correctos}/${global.tarjetas.length} nota=${global.nota} contradicciones=${contrad.length}`);
      if (perCard.filter((x) => !x.ok).length) console.log("   fallos tarjeta:", JSON.stringify(perCard.filter((x) => !x.ok)));
      if (contrad.length) console.log("   contradicciones:", JSON.stringify(contrad));
    }

    /* ---- m5 refuerzo: progreso de tema intacto tras examen ---- */
    await cdp.goto(fileUrl("temas/tema-1.html"), 1200);
    await cdp.eval(`localStorage.clear()`);
    await cdp.goto(fileUrl("temas/tema-1.html"), 1200);
    await cdp.eval(`(() => {
      const card = document.querySelector("article.drill");
      const inp = card.querySelector("input[type=text]");
      if (inp) { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; s.call(inp, "9"); inp.dispatchEvent(new Event("input", { bubbles: true })); }
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
    })()`);
    const lsTema = await cdp.eval(`localStorage.getItem("curso-algebra-progreso-v1")`);
    console.log("progreso tras comprobar en tema:", lsTema);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log("\nOK última tanda");
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
