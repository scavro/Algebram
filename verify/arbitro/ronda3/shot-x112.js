const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    await cdp.goto("file://" + path.join(ROOT, "examenes/examen-1.html"), 1500);
    await sleep(800);
    await cdp.eval(`document.getElementById("X1-12").scrollIntoView({behavior:"instant", block:"center"}); document.querySelectorAll(".reveal").forEach((r)=>r.classList.add("is-in"));`);
    await sleep(1200);
    const s = await cdp.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(__dirname, "capturas", "X1-12-375-recorte.png"), Buffer.from(s.data, "base64"));
    console.log("guardada X1-12-375-recorte.png");
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
