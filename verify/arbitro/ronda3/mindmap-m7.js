const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.goto("file://" + path.join(ROOT, "temas/tema-1.html"), 1500);
    await sleep(700);
    const r = await cdp.eval(`(() => {
      const svg = document.querySelector("[data-mindmap] svg");
      const nodes = Array.from(svg.querySelectorAll("g.mindmap__node"));
      return nodes.slice(0, 8).map((g) => {
        const div = g.querySelector("foreignObject div");
        return {
          texto: div.textContent.trim().slice(0, 40),
          tieneKatex: !!div.querySelector(".katex"),
          fontDiv: getComputedStyle(div).fontFamily.slice(0, 22),
          fontKatex: div.querySelector(".katex") ? getComputedStyle(div.querySelector(".katex")).fontFamily.slice(0, 22) : null,
          aria: (g.getAttribute("aria-label") || "").slice(0, 40),
        };
      });
    })()`);
    console.log(JSON.stringify(r, null, 1));
    await cdp.eval(`document.querySelector("[data-mindmap]").scrollIntoView({behavior:"instant", block:"center"})`);
    await sleep(600);
    const s = await cdp.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(__dirname, "capturas", "mindmap-tema1.png"), Buffer.from(s.data, "base64"));
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
