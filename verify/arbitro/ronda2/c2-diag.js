/* C2 — diagnóstico fino del reveal: scroll instantáneo, espera de transición,
   alturas vs threshold 0.08, y tarjetas altas en viewport móvil. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    for (const vp of [{ w: 780, h: 437 }, { w: 375, h: 812 }, { w: 360, h: 640 }]) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.w < 500 });
      await cdp.goto(fileUrl("temas/tema-1.html"), 1500);
      await sleep(800);
      // scroll instantáneo tarjeta por tarjeta, esperando transición
      const rows = [];
      const n = await cdp.eval(`document.querySelectorAll("article.drill").length`);
      for (let i = 0; i < n; i++) {
        await cdp.eval(`document.querySelectorAll("article.drill")[${i}].scrollIntoView({behavior:"instant", block:"center"})`);
        await sleep(1100);
        rows.push(await cdp.eval(`(() => {
          const d = document.querySelectorAll("article.drill")[${i}];
          const r = d.getBoundingClientRect();
          return { id: d.id, isin: d.classList.contains("is-in"), op: +getComputedStyle(d).opacity.slice(0,5), h: Math.round(r.height) };
        })()`));
      }
      const failed = rows.filter((r) => !r.isin || r.op < 0.99);
      console.log(`VP ${vp.w}x${vp.h}: reveladas=${rows.length - failed.length}/${rows.length} fallos=`, JSON.stringify(failed));
      // barrido de alturas: ¿alguna tarjeta supera el umbral del threshold 0.08?
      const maxH = await cdp.eval(`Math.max(...Array.from(document.querySelectorAll("article.drill")).map((d) => d.getBoundingClientRect().height))`);
      console.log(`   alturaMax=${Math.round(maxH)}px · root efectivo=${Math.round(vp.h * 0.92)}px · ratio mínimo alcanzable=${(vp.h * 0.92 / maxH).toFixed(3)} (threshold=0.08)`);
    }
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
