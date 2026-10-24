const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const SOLAPE = `(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return { err: "sin hero", ready: document.readyState };
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
  return { solapes, visibles: forms.filter((f) => getComputedStyle(f).display !== "none").length };
})()`;
async function evalRetry(cdp, expr, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { return await cdp.eval(expr); }
    catch (e) { if (i === tries - 1) throw e; await sleep(800); }
  }
}
(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const espera of [600, 2200, 4200, 6200, 8200]) {
      await cdp.goto("file://" + path.join(ROOT, "index.html"), 1000);
      await sleep(espera);
      const h = await evalRetry(cdp, SOLAPE);
      console.log(`1440 espera=${espera}ms:`, JSON.stringify(h));
    }
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    for (const espera of [600, 2200, 4200]) {
      await cdp.goto("file://" + path.join(ROOT, "index.html"), 1000);
      await sleep(espera);
      const h = await evalRetry(cdp, SOLAPE);
      console.log(`375 espera=${espera}ms:`, JSON.stringify(h));
    }
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
