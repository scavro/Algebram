const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const PAGES = ["temas/tema-1.html","temas/tema-2.html","temas/tema-3.html","temas/tema-4.html","temas/tema-5.html","examenes/examen-1.html","examenes/examen-2.html","examenes/examen-3.html"];
const PROBE = `(() => {
  const out = [];
  document.querySelectorAll(".drill__answer input, .drill__answer select, .drill__answer textarea").forEach((i) => {
    const r = i.getBoundingClientRect();
    if (r.width < 2) return;
    const vis = Math.min(r.right, innerWidth) - Math.max(r.left, 0);
    if (vis < r.width - 1) out.push({ drill: (i.closest("article.drill")||{id:"?"}).id, vis: Math.round(vis), w: Math.round(r.width), tipo: i.type });
  });
  const grids = [];
  document.querySelectorAll(".matrix-input").forEach((g) => {
    const r = g.getBoundingClientRect();
    if (r.right > innerWidth + 1) grids.push({ drill: (g.closest("article.drill")||{id:"?"}).id, right: Math.round(r.right), w: Math.round(r.width) });
  });
  return { inputsCortados: out.length, detalle: out.slice(0, 10), gridsCortados: grids };
})()`;
async function evalRetry(cdp, expr, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try { return await cdp.eval(expr); }
    catch (e) { if (i === tries - 1) return { err: e.message.slice(0, 60) }; await sleep(1500); }
  }
}
(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    for (const p of PAGES) {
      await cdp.goto("file://" + path.join(ROOT, p), 1500);
      await sleep(800);
      const r = await evalRetry(cdp, PROBE);
      console.log(p.padEnd(24), JSON.stringify(r));
    }
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
