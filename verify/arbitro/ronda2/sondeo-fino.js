/* Sondeo fino: matrix-input a 375, KaTeX ancho (clip vs scroll), héroe ×3 instantes */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    /* --- matrix/vector inputs a 375 --- */
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1400);
    await sleep(600);
    const mx = await cdp.eval(`(() => {
      const out = [];
      document.querySelectorAll(".matrix-input").forEach((grid, gi) => {
        const r = grid.getBoundingClientRect();
        let scrollAncestor = null, cur = grid.parentElement;
        while (cur && cur !== document.body) {
          const cs = getComputedStyle(cur);
          if (/auto|scroll|hidden/.test(cs.overflowX)) { scrollAncestor = cur.tagName.toLowerCase() + "." + (typeof cur.className === "string" ? cur.className.trim().split(/\\s+/)[0] : "") + " ox=" + cs.overflowX; break; }
          cur = cur.parentElement;
        }
        const inputs = Array.from(grid.querySelectorAll("input")).map((i) => {
          const ir = i.getBoundingClientRect();
          return { left: Math.round(ir.left), right: Math.round(ir.right), visiblePx: Math.round(Math.min(ir.right, innerWidth) - Math.max(ir.left, 0)) };
        });
        out.push({
          grid: gi, drillId: grid.closest("article.drill") ? grid.closest("article.drill").id : "?",
          left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
          cortado: r.right > innerWidth + 1,
          scrollAncestor,
          inputs,
          inputsCortados: inputs.filter((i) => i.visiblePx < 40).length,
        });
      });
      return { viewport: innerWidth, grids: out.filter((g) => g.cortado) };
    })()`);
    console.log("=== matrix-input 375 ===");
    console.log(JSON.stringify(mx, null, 1));

    /* --- ¿inputs de matrices alcanzables? tab+focus del último input --- */
    const reach = await cdp.eval(`(() => {
      const grid = Array.from(document.querySelectorAll(".matrix-input")).find((g) => g.getBoundingClientRect().right > innerWidth + 1);
      if (!grid) return { found: false };
      const last = grid.querySelectorAll("input")[grid.querySelectorAll("input").length - 1];
      last.focus();
      const r = last.getBoundingClientRect();
      return { found: true, drill: grid.closest("article.drill").id, focusOk: document.activeElement === last, rect: { l: Math.round(r.left), r: Math.round(r.right) }, viewport: innerWidth, cortadoPx: Math.round(r.right - innerWidth) };
    })()`);
    console.log("focus último input matriz:", JSON.stringify(reach));

    /* --- KaTeX ancho: ¿clip o scroll? --- */
    for (const p of ["temas/tema-1.html", "temas/tema-5.html"]) {
      await cdp.goto(fileUrl(p), 1300);
      await sleep(500);
      const kx = await cdp.eval(`(() => {
        const out = [];
        document.querySelectorAll(".katex-display, .katex").forEach((k) => {
          const r = k.getBoundingClientRect();
          if (r.right <= innerWidth + 1 || r.width < 2) return;
          let cur = k.parentElement, scrollAncestor = null;
          while (cur && cur !== document.body) {
            const cs = getComputedStyle(cur);
            if (/auto|scroll|hidden/.test(cs.overflowX)) { scrollAncestor = cur.tagName.toLowerCase() + "." + (typeof cur.className === "string" ? cur.className.trim().split(/\\s+/)[0] : "") + " ox=" + cs.overflowX; break; }
            cur = cur.parentElement;
          }
          out.push({ w: Math.round(r.width), right: Math.round(r.right), cortadoPx: Math.round(r.right - innerWidth), scrollAncestor, display: k.classList.contains("katex-display") ? "display" : "inline", txt: k.textContent.trim().slice(0, 30) });
        });
        // dedup por right aproximado
        return { total: out.length, conScroll: out.filter((o) => o.scrollAncestor).length, sinScroll: out.filter((o) => !o.scrollAncestor).slice(0, 8) };
      })()`);
      console.log(`=== KaTeX ancho ${p} @375 ===`, JSON.stringify(kx, null, 1));
    }

    /* --- héroe index: 3 instantes del drift --- */
    await cdp.goto(fileUrl("index.html"), 1300);
    for (const t of [0, 2500, 5000]) {
      await sleep(t === 0 ? 600 : 2500);
      const h = await cdp.eval(`(() => {
        const hero = document.querySelector(".hero");
        const forms = Array.from(hero.querySelectorAll(".hero__formula"));
        const texts = Array.from(hero.querySelectorAll("h1, h2, .hero__title, .hero__sub, p, .kicker"));
        const solapes = [];
        forms.forEach((f, i) => {
          const a = f.getBoundingClientRect();
          if (getComputedStyle(f).display === "none") return;
          texts.forEach((t2) => {
            const b = t2.getBoundingClientRect();
            const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            if (ix > 2 && iy > 2) solapes.push({ f: i + 1, t: t2.tagName + "." + (typeof t2.className === "string" ? t2.className.split(" ")[0] : ""), ix: Math.round(ix), iy: Math.round(iy) });
          });
        });
        return { w: innerWidth, solapes, visibles: forms.filter((f) => getComputedStyle(f).display !== "none").length };
      })()`);
      console.log(`héroe instante +${t}ms:`, JSON.stringify(h));
    }
    // y a 1440
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.goto(fileUrl("index.html"), 1300);
    for (const t of [0, 3000, 6000]) {
      await sleep(t === 0 ? 600 : 3000);
      const h = await cdp.eval(`(() => {
        const hero = document.querySelector(".hero");
        const forms = Array.from(hero.querySelectorAll(".hero__formula"));
        const texts = Array.from(hero.querySelectorAll("h1, h2, .hero__title, .hero__sub, p, .kicker"));
        const solapes = [];
        forms.forEach((f, i) => {
          const a = f.getBoundingClientRect();
          if (getComputedStyle(f).display === "none") return;
          texts.forEach((t2) => {
            const b = t2.getBoundingClientRect();
            const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            if (ix > 2 && iy > 2) solapes.push({ f: i + 1, t: t2.tagName + "." + (typeof t2.className === "string" ? t2.className.split(" ")[0] : ""), ix: Math.round(ix), iy: Math.round(iy) });
          });
        });
        return { w: innerWidth, solapes };
      })()`);
      console.log(`héroe 1440 instante +${t}ms:`, JSON.stringify(h));
    }
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
