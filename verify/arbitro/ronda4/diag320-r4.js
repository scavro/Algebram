/* Diagnóstico 320 px: ¿los desbordes (SVG del mapa, inputs de matriz) están en
   contenedores con scroll (patrón N2 válido) o recortados sin acceso? */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });

    console.log("== tema-1 @320 — nodos SVG del mapa mental");
    await cdp.goto(fileUrl("temas/tema-1.html"), 1400);
    await sleep(700);
    const mm = await cdp.eval(`(() => {
      const cont = document.querySelector("[data-mindmap]");
      const svg = cont && cont.querySelector("svg");
      const cs = cont ? getComputedStyle(cont) : null;
      const svgCs = svg ? getComputedStyle(svg) : null;
      const r = svg ? svg.getBoundingClientRect() : null;
      // primer elemento con right > innerWidth
      const fuera = [];
      (svg ? svg.querySelectorAll("*") : []).forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width > 0 && b.right > window.innerWidth + 1.5) fuera.push({ tag: el.tagName, cls: String(el.getAttribute("class") || "").slice(0, 30), r: Math.round(b.right), w: Math.round(b.width) });
      });
      return {
        contOverflow: cs && { x: cs.overflowX, y: cs.overflowY, w: Math.round(cont.getBoundingClientRect().width), scrollW: cont.scrollWidth, clientW: cont.clientWidth },
        svgRect: r ? { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) } : null,
        svgViewBox: svg ? svg.getAttribute("viewBox") : null,
        svgMaxW: svgCs ? svgCs.maxWidth : null,
        svgW: svgCs ? svgCs.width : null,
        fuera: fuera.slice(0, 6),
        totalFuera: fuera.length,
        docOverflow: document.documentElement.scrollWidth > window.innerWidth,
        innerW: window.innerWidth,
      };
    })()`);
    console.log(JSON.stringify(mm, null, 1));

    console.log("== examen-1 @320 — inputs de matriz fuera de viewport");
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1400);
    await sleep(800);
    const ex = await cdp.eval(`(() => {
      const fuera = [];
      document.querySelectorAll("input").forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width > 0 && b.right > window.innerWidth + 1.5) {
          const grid = el.closest(".matrix-input");
          const gcs = grid ? getComputedStyle(grid) : null;
          fuera.push({
            id: (el.closest("article.drill") || {}).id,
            r: Math.round(b.right),
            grid: grid ? { overflowX: gcs.overflowX, scrollW: grid.scrollWidth, clientW: grid.clientWidth, scrollable: grid.scrollWidth > grid.clientWidth } : null,
          });
        }
      });
      return { fuera: fuera.slice(0, 8), total: fuera.length, docOverflow: document.documentElement.scrollWidth > window.innerWidth, scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth };
    })()`);
    console.log(JSON.stringify(ex, null, 1));
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
