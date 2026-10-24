/* Ronda 4 — contraste AA medido en runtime (estilos computados + fondo real por
   píxeles con texto oculto). Protocolo: .kicker, .meta, .chip, .plaque__label,
   .field label, th, .drill__id, .footer__colophon, .exam-score span, .btn--ghost
   sobre index, tema-1, planificacion, examen-1 + barrido completo de texto.

   Fondo efectivo: captura de viewport con TODO el texto transparente y
   muestreo del rect del nodo de texto (mediana de píxeles + peor píxel).
   Elementos dentro de nav sticky/toolbar se miden a scroll 0 (posición natural). */
const fs = require("fs");
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const { decodePNG } = require("./lib-png");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

const LISTED = [
  ["kicker", ".kicker"],
  ["meta", ".meta"],
  ["chip", ".chip"],
  ["plaque__label", ".plaque__label"],
  ["field label", ".field label"],
  ["th", "th"],
  ["drill__id", ".drill__id"],
  ["footer__colophon", ".footer__colophon"],
  ["exam-score span", ".exam-score span"],
  ["btn--ghost", ".btn--ghost"],
];
const EXTRA = [
  ["drill__level", ".drill__level"],
  ["nav__brand-mark", ".nav__brand-mark"],
  ["exam-toolbar__timer", ".exam-toolbar__timer"],
  ["hero__stat span", ".hero__stat span"],
  ["hero__scroll", ".hero__scroll"],
];

const COLECTA = `(() => {
  function parse(c) {
    const m = String(c).match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x));
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function over(fg, bg) {
    const a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
  }
  function bgOf(el) {
    let cur = el, acc = null;
    while (cur && cur !== document.documentElement) {
      const cs = getComputedStyle(cur);
      const c = parse(cs.backgroundColor);
      if (c && c[3] > 0) {
        acc = acc ? over(acc, c) : c;
        if (acc[3] >= 0.999) return acc;
      }
      cur = cur.parentElement;
    }
    return acc || [255, 255, 255, 1];
  }
  function stickyAncestor(el) {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const pos = getComputedStyle(cur).position;
      if (pos === "sticky" || pos === "fixed") return true;
      cur = cur.parentElement;
    }
    return false;
  }
  const LISTED = __LISTED__;
  const EXTRA = __EXTRA__;
  const famOf = (el) => {
    for (const [name, sel] of LISTED.concat(EXTRA)) if (el.closest(sel)) return name;
    return "sweep";
  };
  const EXCL = ".hero__cloud, .hero__formula, script, style, .skip-link, .katex-mathml, .katex-html, .sr-only, .ghost-num, .theme-head__ghost, .progress-bar";
  const runs = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.replace(/\\s+/g, " ").trim();
    if (!t) continue;
    const el = n.parentElement;
    if (!el) continue;
    if (el.closest(EXCL)) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity < 0.1) continue;
    const rev = el.closest(".reveal");
    if (rev && +getComputedStyle(rev).opacity < 0.1) continue;
    const fg = parse(cs.color);
    if (!fg || fg[3] === 0) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) continue;
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    runs.push({
      family: famOf(el),
      sel: el.tagName.toLowerCase() + (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\\s+/).join(".") : ""),
      text: t.slice(0, 42),
      fg,
      px, bold,
      large: px >= 24 || (bold && px >= 18.66),
      rect: { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height },
      bgStyle: bgOf(el),
      sticky: stickyAncestor(el),
    });
  }
  return runs;
})()`.replace("__LISTED__", JSON.stringify(LISTED)).replace("__EXTRA__", JSON.stringify(EXTRA));

function lum(c) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
function ratio(fg, bg) {
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function over(fg, bg) {
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
}
const rgbStr = (c) => "rgb(" + c.slice(0, 3).map((v) => Math.round(v)).join(", ") + ")";

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  const paginas = process.argv.includes("--only-extra")
    ? ["temas/tema-3.html", "examenes/examen-2.html"]
    : ["index.html", "temas/tema-1.html", "planificacion.html", "examenes/examen-1.html"];
  const extras = process.argv.includes("--extra") ? ["temas/tema-3.html", "examenes/examen-2.html"] : [];
  const filas = [];
  const VH = 900, VW = 1280;
  try {
    for (const p of paginas.concat(extras)) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: VW, height: VH, deviceScaleFactor: 1, mobile: false });
      await cdp.goto(fileUrl(p), 1500);
      await cdp.eval(`(() => {
        document.querySelectorAll(".reveal").forEach((r) => r.classList.add("is-in"));
        document.querySelectorAll(".drill__hint, .drill__solution").forEach((r) => r.classList.add("is-visible"));
        return 1;
      })()`).catch(() => 0);
      await sleep(1500);

      const runs = await cdp.eval(COLECTA);
      const docH = await cdp.eval("document.documentElement.scrollHeight");
      await cdp.eval(`(() => {
        const s = document.createElement("style");
        s.id = "x4bg";
        s.textContent = "body.x4bg *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}";
        document.head.appendChild(s);
        document.body.classList.add("x4bg");
        return 1;
      })()`);
      await sleep(200);

      const sampleRun = (run, img, sy) => {
        const x0 = Math.round(run.rect.x);
        const y0 = Math.round(run.rect.y - sy);
        const px = [];
        for (let y = Math.max(0, y0); y < Math.min(img.height, y0 + Math.round(run.rect.h)); y += 2) {
          for (let x = Math.max(0, x0); x < Math.min(img.width, x0 + Math.round(run.rect.w)); x += 2) {
            px.push(img.rgb(x, y));
          }
        }
        if (!px.length) return null;
        const med = [0, 1, 2].map((i) => {
          const s = px.map((q) => q[i]).sort((a, b) => a - b);
          return s[Math.floor(s.length / 2)];
        });
        let minR = Infinity, maxR = -Infinity;
        for (const q of px) {
          const f = run.fg[3] < 1 ? over(run.fg, q) : run.fg;
          const rr = ratio(f, q);
          if (rr < minR) minR = rr;
          if (rr > maxR) maxR = rr;
        }
        return { bgPix: med, spread: { min: +minR.toFixed(2), max: +maxR.toFixed(2) } };
      };
      const inside = (run, sy) => {
        const y0 = run.rect.y - sy;
        return y0 >= 1 && y0 + run.rect.h <= VH - 1 && run.rect.x >= 1 && run.rect.x + run.rect.w <= VW - 1;
      };

      const muestreo = runs.map(() => ({ bgPix: null, spread: null }));
      const pend = runs.map((_, i) => i);
      const capturar = async () => {
        const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
        return decodePNG(Buffer.from(shot.data, "base64"));
      };
      // pasada a scroll 0: sticky + todo lo visible
      {
        await cdp.eval(`(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); return window.scrollY; })()`);
        await sleep(40);
        const img = await capturar();
        for (let k = pend.length - 1; k >= 0; k--) {
          const i = pend[k];
          if (runs[i].sticky || inside(runs[i], 0)) {
            const s = sampleRun(runs[i], img, 0);
            if (s) { muestreo[i] = s; pend.splice(k, 1); }
          }
        }
      }
      // lotes por posición de scroll
      for (let sy = 0; sy <= Math.max(0, docH - VH); sy += 620) {
        if (!pend.length) break;
        const quedan = pend.some((i) => !runs[i].sticky && inside(runs[i], sy));
        if (!quedan) continue;
        await cdp.eval(`(() => { window.scrollTo({ top: ${sy}, left: 0, behavior: "instant" }); return window.scrollY; })()`);
        await sleep(40);
        const img = await capturar();
        for (let k = pend.length - 1; k >= 0; k--) {
          const i = pend[k];
          if (runs[i].sticky) continue;
          if (inside(runs[i], sy)) {
            const s = sampleRun(runs[i], img, sy);
            if (s) { muestreo[i] = s; pend.splice(k, 1); }
          }
        }
      }
      // restos: captura individual centrada
      for (const i of pend) {
        const run = runs[i];
        const sy = run.sticky ? 0 : Math.max(0, Math.min(docH - VH, Math.round(run.rect.y + run.rect.h / 2 - VH / 2)));
        await cdp.eval(`(() => { window.scrollTo({ top: ${sy}, left: 0, behavior: "instant" }); return window.scrollY; })()`);
        await sleep(40);
        const img = await capturar();
        const s = sampleRun(run, img, sy);
        if (s) muestreo[i] = s;
      }

      runs.forEach((run, i) => {
        const { bgPix, spread } = muestreo[i];
        const bg = bgPix || run.bgStyle.slice(0, 3);
        const fg = run.fg[3] < 1 ? over(run.fg, bg) : run.fg;
        const rt = ratio(fg, bg);
        const rtStyle = ratio(run.fg[3] < 1 ? over(run.fg, run.bgStyle.slice(0, 3)) : run.fg, run.bgStyle.slice(0, 3));
        const umbral = run.large ? 3 : 4.5;
        filas.push({
          page: p,
          family: run.family,
          sel: run.sel,
          text: run.text,
          fg: rgbStr(run.fg) + (run.fg[3] < 1 ? ` @${run.fg[3]}` : ""),
          bg: rgbStr(bg),
          bgStyle: rgbStr(run.bgStyle),
          ratio: +rt.toFixed(2),
          ratioStyle: +rtStyle.toFixed(2),
          worst: spread ? spread.min : null,
          best: spread ? spread.max : null,
          px: +run.px.toFixed(2),
          bold: run.bold,
          large: run.large,
          umbral,
          ok: rt >= umbral - 0.005,
          sticky: run.sticky,
        });
      });
      await cdp.eval(`document.body.classList.remove("x4bg"); const s=document.getElementById("x4bg"); if (s) s.remove(); window.scrollTo({top:0,behavior:"instant"});`);
      console.log(`== ${p}: ${runs.length} runs medidos`);
  fs.writeFileSync(path.join(__dirname, process.argv.includes("--only-extra") ? "contraste-r4-extra.json" : "contraste-r4.json"), JSON.stringify(filas, null, 1));
    }
  } finally {
    await cdp.close();
    proc.kill();
  }
  fs.writeFileSync(path.join(__dirname, process.argv.includes("--only-extra") ? "contraste-r4-extra.json" : "contraste-r4.json"), JSON.stringify(filas, null, 1));

  const FAMS = LISTED.map((l) => l[0]);
  console.log("\n===== TABLA DEL PROTOCOLO (familias exigidas) =====");
  for (const f of FAMS) {
    const rows = filas.filter((r) => r.family === f);
    if (!rows.length) {
      console.log(`\n[${f}] — sin instancias en las páginas medidas`);
      continue;
    }
    console.log(`\n[${f}] ${rows.length} instancias`);
    for (const r of rows) {
      console.log(`  ${r.ok ? "OK  " : "FALLA"} ${String(r.ratio).padStart(5)}:1 (peor px ${r.worst ?? "-"} · estilo ${r.ratioStyle} · umbral ${r.umbral}) ${r.page} ${r.sel} ${r.px}px${r.bold ? " bold" : ""} fg=${r.fg} bg=${r.bg} :: "${r.text}"`);
    }
  }
  console.log("\n===== EXTRA (familias M3 históricas / residuales) =====");
  for (const f of EXTRA.map((e) => e[0])) {
    const rows = filas.filter((r) => r.family === f);
    if (!rows.length) continue;
    console.log(`\n[${f}] ${rows.length} instancias`);
    for (const r of rows) {
      console.log(`  ${r.ok ? "OK  " : "FALLA"} ${String(r.ratio).padStart(5)}:1 (peor px ${r.worst ?? "-"} · umbral ${r.umbral}) ${r.page} ${r.sel} ${r.px}px fg=${r.fg} bg=${r.bg} :: "${r.text}"`);
    }
  }
  console.log("\n===== BARRIDO COMPLETO (resto de texto) =====");
  const sweep = filas.filter((r) => r.family === "sweep");
  const sweepBad = sweep.filter((r) => !r.ok);
  console.log(`runs sweep: ${sweep.length} · bajo umbral: ${sweepBad.length}`);
  for (const r of sweepBad) {
    console.log(`  FALLA ${String(r.ratio).padStart(5)}:1 (peor px ${r.worst ?? "-"} · umbral ${r.umbral}) ${r.page} ${r.sel} ${r.px}px fg=${r.fg} bg=${r.bg} :: "${r.text}"`);
  }
  const listedBad = filas.filter((r) => r.family !== "sweep" && !r.ok);
  console.log(`\nRESUMEN: ${filas.length} runs · familia exigida/extra bajo umbral: ${listedBad.length} · sweep bajo umbral: ${sweepBad.length}`);
  process.exit(listedBad.length + sweepBad.length === 0 ? 0 : 2);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
