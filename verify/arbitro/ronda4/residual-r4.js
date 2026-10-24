/* Ronda 4 — repaso de hallazgos abiertos de rondas anteriores (no reclamados):
   N4 (marcas en choice/bool anidados en multi), N6 (multi fields:null),
   N7 (héroe 1440: fórmulas sobre kicker/h1), N8 (colofones), N9 (nav index),
   N10 (aria del mapa con TeX crudo), m4 (pager), m7 (tipografía del mapa),
   nota R2 (timer sin role="timer"). */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  let fallos = 0;
  const estado = (abierto, etiqueta, extra) => {
    console.log(`  ${abierto ? "ABIERTO " : "cerrado "} ${etiqueta}${extra ? "  [" + extra + "]" : ""}`);
    if (abierto) fallos++;
  };
  try {
    /* ---- N4: marcas is-right/is-wrong en choice/bool anidados en multi (T2-E4) ---- */
    console.log("== N4 — multi anidado con bool (T2-E4)");
    await cdp.goto(fileUrl("temas/tema-2.html"), 1500);
    await sleep(800);
    const n4 = await cdp.eval(`(() => {
      const card = document.getElementById("T2-E4");
      if (!card) return { found: false };
      const radios = Array.from(card.querySelectorAll(".drill__fields input[type=radio]"));
      const pick = radios.find((r) => r.value === "false"); // respuesta real es true → wrong
      if (pick) { pick.checked = true; pick.dispatchEvent(new Event("change", { bubbles: true })); }
      const txt = card.querySelector(".drill__fields input[type=text]");
      if (txt) {
        const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        s.call(txt, "ZZZ");
        txt.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click();
      return {
        found: true,
        choices: Array.from(card.querySelectorAll(".drill__fields .choice")).map((l) => ({
          cls: l.className,
          txt: l.textContent.trim().slice(0, 12),
        })),
        feedback: card.querySelector(".drill__feedback").textContent.trim().slice(0, 50),
      };
    })()`);
    if (!n4.found) {
      console.log("  ✗ T2-E4 no encontrado");
      fallos++;
    } else {
      const conMarca = n4.choices.filter((c) => /is-right|is-wrong/.test(c.cls));
      estado(conMarca.length === 0, "N4: choice/bool anidados sin is-right/is-wrong tras corregir", `marcados=${conMarca.length}/${n4.choices.length} fb="${n4.feedback}"`);
    }

    /* ---- N6: multi con fields:null auto-aprueba (grader) ---- */
    console.log("== N6 — grader multi fields:null");
    const G = require(path.join(ROOT, "assets", "js", "grader.js"));
    const r6 = G.check({ type: "multi", fields: null }, {});
    const r6b = G.check({ type: "multi", fields: {} }, {});
    estado(r6.ok === true, "N6: fields:null devuelve ok:true (auto-aprueba)", JSON.stringify(r6) + " · fields:{}=" + JSON.stringify(r6b));

    /* ---- N7: héroe 1440 — fórmulas sobre kicker/h1 durante el drift ---- */
    console.log("== N7 — solapes héroe 1440 (muestreo 24 s)");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.goto(fileUrl("index.html"), 1500);
    await sleep(600);
    const n7 = await cdp.eval(`(() => {
      window.__n7 = { muestras: 0, solapes: [] };
      const k = document.querySelector(".hero .kicker");
      const h = document.querySelector(".hero__title");
      const fxs = Array.from(document.querySelectorAll(".hero__formula"));
      const cajas = [["kicker", k], ["h1", h]];
      const inter = (a, b) => a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const tick = () => {
        window.__n7.muestras++;
        for (const [nombre, el] of cajas) {
          const r1 = el.getBoundingClientRect();
          for (const f of fxs) {
            const r2 = f.getBoundingClientRect();
            if (inter(r1, r2)) window.__n7.solapes.push({ t: nombre, f: f.textContent.trim().slice(0, 18), ix: Math.round(Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left)), iy: Math.round(Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top)) });
          }
        }
      };
      window.__n7i = setInterval(tick, 300);
      return fxs.length;
    })()`);
    await sleep(24000);
    const n7r = await cdp.eval(`(() => { clearInterval(window.__n7i); return window.__n7; })()`);
    estado(n7r.solapes.length > 0, "N7: fórmulas decorativas sobre texto del héroe en 1440", `fórmulas=${n7} muestras=${n7r.muestras} solapes=${n7r.solapes.length} ej=${JSON.stringify(n7r.solapes.slice(0, 3))}`);

    /* ---- N8/N9/N10/m4/m7/nota — recorrido de páginas ---- */
    console.log("== N8 — colofones del pie");
    const colofones = {};
    for (const p of ["index.html", "temas/tema-1.html", "temas/tema-3.html", "examenes/examen-1.html", "planificacion.html"]) {
      await cdp.goto(fileUrl(p), 1100);
      await sleep(300);
      colofones[p] = await cdp.eval(`(() => {
        const f = document.querySelector(".footer__colophon");
        return f ? f.textContent.replace(/\\s+/g, " ").trim().slice(0, 120) : null;
      })()`);
    }
    const distintos = new Set(Object.values(colofones)).size;
    estado(distintos > 1, "N8: colofones distintos entre páginas", `${distintos} variantes en 5 páginas`);
    for (const [p, t] of Object.entries(colofones)) console.log(`     · ${p}: "${t}"`);

    console.log("== N9 — aria-label del nav del index");
    await cdp.goto(fileUrl("index.html"), 1100);
    const n9 = await cdp.eval(`(() => {
      const navs = Array.from(document.querySelectorAll("nav"));
      return navs.map((n) => ({ cls: n.className, aria: n.getAttribute("aria-label") }));
    })()`);
    const navSin = n9.filter((n) => /(^|\s)nav(\s|$)/.test(n.cls) && !n.aria);
    estado(navSin.length > 0, "N9: <nav class=\"nav\"> del index sin aria-label", JSON.stringify(n9));

    console.log("== N10 — aria-label del mapa mental con TeX crudo");
    await cdp.goto(fileUrl("temas/tema-1.html"), 1400);
    await sleep(700);
    const n10 = await cdp.eval(`(() => {
      const crudo = (s) => !s ? false : (s.indexOf("\\\\(") >= 0 || s.indexOf("\\\\[") >= 0 || s.indexOf("\\\\mathbb") >= 0 || s.indexOf("\\\\frac") >= 0 || s.indexOf("\\\\lambda") >= 0);
      const out = [];
      document.querySelectorAll("[data-mindmap] [aria-label], [data-mindmap] [role=img], [data-mindmap] [role=group], [data-mindmap] title, [data-mindmap] .mm-node, [data-mindmap] [class*=node]").forEach((e) => {
        const al = e.getAttribute && e.getAttribute("aria-label");
        const tt = e.textContent || "";
        if (crudo(al)) out.push({ tag: e.tagName, al: al.slice(0, 60) });
        else if (!al && crudo(tt) && tt.length < 80) out.push({ tag: e.tagName, txt: tt.slice(0, 60) });
      });
      const mapa = document.querySelector("[data-mindmap] [role=img], [data-mindmap]");
      return { crudos: out.slice(0, 6), ariaMapa: mapa ? (mapa.getAttribute("aria-label") || "").slice(0, 80) : null, total: out.length, crudoAriaMapa: crudo(mapa ? mapa.getAttribute("aria-label") : "") };
    })()`);
    estado(n10.total > 0 || n10.crudoAriaMapa, "N10: TeX crudo en accesibilidad del mapa", `total=${n10.total} ariaMapa="${n10.ariaMapa}" ej=${JSON.stringify(n10.crudos.slice(0, 3))}`);

    console.log("== m7 — tipografía de nodos del mapa");
    const m7 = await cdp.eval(`(() => {
      const nodos = Array.from(document.querySelectorAll("[data-mindmap] .mm-node, [data-mindmap] g.node, [data-mindmap] [class*=node]")).slice(0, 60);
      const fams = {};
      let conKatex = 0;
      nodos.forEach((n) => {
        const f = getComputedStyle(n).fontFamily.split(",")[0].replace(/"/g, "");
        fams[f] = (fams[f] || 0) + 1;
        if (n.querySelector(".katex")) conKatex++;
      });
      return { fams, conKatex, total: nodos.length };
    })()`);
    estado(Object.keys(m7.fams).length > 1 || m7.conKatex > 0, "m7: familias tipográficas mezcladas / KaTeX dentro de nodos Inter", JSON.stringify(m7));

    console.log("== m4 — estructuras del pager");
    const m4 = {};
    for (const p of ["temas/tema-1.html", "temas/tema-3.html", "examenes/examen-1.html", "planificacion.html"]) {
      await cdp.goto(fileUrl(p), 1000);
      await sleep(300);
      m4[p] = await cdp.eval(`(() => {
        const navs = Array.from(document.querySelectorAll(".pager"));
        return navs.map((n) => Array.from(n.children).map((c) => c.className + ":" + (c.querySelector(".meta") ? c.querySelector(".meta").textContent.trim() : c.textContent.trim().slice(0, 12))));
      })()`);
    }
    const formas = new Set(Object.values(m4).map((x) => JSON.stringify(x)));
    estado(formas.size > 1, "m4: pager con estructuras distintas", `${formas.size} formas en 4 páginas`);
    for (const [p, t] of Object.entries(m4)) console.log(`     · ${p}: ${JSON.stringify(t)}`);

    console.log("== nota R2 — role del temporizador");
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1300);
    await sleep(500);
    const nt = await cdp.eval(`(() => {
      const t = document.querySelector("#exam-timer");
      return { role: t && t.getAttribute("role"), live: t && t.getAttribute("aria-live") };
    })()`);
    estado(nt.role !== "timer", "nota R2: #exam-timer sin role=\"timer\"", JSON.stringify(nt));
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nResidual: ${fallos} hallazgos antiguos aún vivos`);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
