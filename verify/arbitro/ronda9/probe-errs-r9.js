/* Sondea el origen real de los errores contados por hostil-ui-r9 (artefacto del
   colector apilado vs error real de la página). */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

const COLLECTOR = `(() => {
  window.__errs = [];
  window.addEventListener("error", (e) => {
    const t = e.target || {};
    const where = t.tagName ? t.tagName.toLowerCase() + ":" + ((t.src || t.currentSrc || t.href || "").split("/").pop() || "?") : (e.message || e.type);
    window.__errs.push("error: " + where);
  }, true);
  window.addEventListener("unhandledrejection", (e) => window.__errs.push("rejection: " + String(e.reason).slice(0, 120)));
  const ce = console.error;
  console.error = function (...a) { window.__errs.push("console.error: " + a.map(String).join(" ").slice(0, 120)); ce.apply(console, a); };
  return 1;
})()`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR });
  try {
    await cdp.goto(fileUrl("temas/tema-1.html"), 2000);
    await sleep(800);
    const a = await cdp.eval("window.__errs");
    console.log("1 colector · tema-1:", JSON.stringify(a));
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: COLLECTOR + `try { localStorage.setItem("curso-algebra-progreso-v1", "{{{"); } catch (e) {}`,
    });
    await cdp.goto(fileUrl("index.html"), 1800);
    await sleep(600);
    const b = await cdp.eval("window.__errs");
    console.log("2 colectores · index:", JSON.stringify(b));
    await cdp.goto(fileUrl("temas/tema-1.html"), 2000);
    await sleep(800);
    const c = await cdp.eval("window.__errs");
    console.log("2 colectores · tema-1:", JSON.stringify(c));
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
