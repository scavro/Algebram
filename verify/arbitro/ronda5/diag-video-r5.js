/* R5 — adjudicación de los eventos `error` de recursos en páginas con vídeo
   (tema-2/4/5): ¿fallo real del producto o artefacto del headless/file://?
   Registra target+URL de cada error y el estado real de <video>/<track>. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => {
      window.__errEvents = [];
      window.addEventListener("error", (e) => {
        const t = e.target || {};
        window.__errEvents.push({
          tag: t.tagName || "?",
          src: t.src || t.currentSrc || t.href || "",
          msg: e.message || null,
          isErrEvent: !!e.message,
        });
      }, true);
      return 1;
    })()`,
  });
  try {
    for (const p of ["temas/tema-2.html", "temas/tema-4.html", "temas/tema-5.html"]) {
      await cdp.goto(fileUrl(p), 2500);
      await sleep(1500);
      const r = await cdp.eval(`(() => ({
        errEvents: window.__errEvents,
        videos: Array.from(document.querySelectorAll("video")).map((v) => ({
          src: (v.getAttribute("src") || "").split("/").pop(),
          currentSrc: (v.currentSrc || "").split("/").pop(),
          networkState: v.networkState,
          readyState: v.readyState,
          error: v.error ? { code: v.error.code, msg: v.error.message } : null,
          duration: isFinite(v.duration) ? v.duration : String(v.duration),
          tracks: Array.from(v.querySelectorAll("track")).map((t) => ({
            src: (t.getAttribute("src") || "").split("/").pop(),
            readyState: t.track ? t.track.readyState : null,
            cues: t.track && t.track.cues ? t.track.cues.length : null,
            mode: t.track ? t.track.mode : null,
          })),
        })),
      }))()`);
      console.log(`\n== ${p}`);
      console.log("  errEvents:", JSON.stringify(r.errEvents, null, 1));
      for (const v of r.videos) console.log("  video:", JSON.stringify(v));
    }
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
