/* Diagnóstico de píxeles extremos en chips .drill__level (¿artefacto de borde
   o fondo real?) — cero falsos positivos en ambas direcciones. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const { decodePNG } = require("./lib-png");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

function lum(c) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
function ratio(fg, bg) {
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.goto(fileUrl("temas/tema-1.html"), 1500);
    await cdp.eval(`document.querySelectorAll(".reveal").forEach((r) => r.classList.add("is-in")); 1`);
    await sleep(1400);
    const info = await cdp.eval(`(() => {
      const chips = Array.from(document.querySelectorAll(".drill__level")).filter((c) => c.textContent.trim().startsWith("Medio"));
      const c = chips[0];
      const n = c.firstChild;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return {
        rect: { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height },
        color: cs.color,
        pad: cs.padding, border: cs.border, radius: cs.borderRadius,
        total: chips.length,
      };
    })()`);
    console.log("chip Medio:", JSON.stringify(info));
    await cdp.eval(`(() => {
      const s = document.createElement("style");
      s.id = "x4bg";
      s.textContent = "body.x4bg *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}";
      document.head.appendChild(s);
      document.body.classList.add("x4bg");
      return 1;
    })()`);
    await sleep(200);
    const sy = Math.max(0, Math.round(info.rect.y + info.rect.h / 2 - 450));
    await cdp.eval(`(() => { window.scrollTo({ top: ${sy}, left: 0, behavior: "instant" }); return window.scrollY; })()`);
    await sleep(60);
    const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
    const img = decodePNG(Buffer.from(shot.data, "base64"));
    const x0 = Math.round(info.rect.x), y0 = Math.round(info.rect.y - sy);
    const w = Math.round(info.rect.w), h = Math.round(info.rect.h);
    console.log(`rect viewport: x=${x0} y=${y0} w=${w} h=${h}`);
    const fg = info.color.match(/\d+/g).slice(0, 3).map(Number);
    // mapa de ratios por píxel (solo luminancia del fondo)
    let minAll = Infinity, minEro = Infinity, cntBajo = 0, cntBajoEro = 0, total = 0, totalEro = 0;
    for (let y = y0; y < y0 + h; y++) {
      let fila = "";
      for (let x = x0; x < x0 + w; x++) {
        const p = img.rgb(x, y);
        const rr = ratio(fg, p);
        const ero = x > x0 && x < x0 + w - 1 && y > y0 && y < y0 + h - 1;
        total++;
        if (ero) totalEro++;
        if (rr < minAll) minAll = rr;
        if (ero && rr < minEro) minEro = rr;
        if (rr < 4.5) cntBajo++;
        if (ero && rr < 4.5) cntBajoEro++;
        fila += rr < 4.5 ? "X" : rr < 4.6 ? "o" : ".";
      }
      console.log("  " + fila + `   (y=${y})`);
    }
    console.log(`min global: ${minAll.toFixed(3)}:1 · min erosionado (sin borde 1px): ${minEro.toFixed(3)}:1`);
    console.log(`píxeles <4.5: ${cntBajo}/${total} · erosionados <4.5: ${cntBajoEro}/${totalEro}`);
    await cdp.eval(`document.body.classList.remove("x4bg"); document.getElementById("x4bg").remove();`);
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
