/* R5 — control: ¿los <track> cargan por http://? (adjudicación de los eventos
   error de TRACK observados bajo file://). Si por http cargan (cues>0), el
   fallo file:// es la restricción de CORS de Chrome para text tracks, no un
   defecto del marcado. */
const path = require("path");
const http = require("http");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".vtt": "text/vtt", ".mp4": "video/mp4", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json" };

(async () => {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split("?")[0]);
    const abs = path.join(ROOT, rel === "/" ? "index.html" : rel);
    if (!abs.startsWith(ROOT) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
      res.writeHead(404); res.end("nope"); return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(abs)] || "application/octet-stream", "Access-Control-Allow-Origin": "*" });
    fs.createReadStream(abs).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => { window.__errEvents = []; window.addEventListener("error", (e) => { const t = e.target || {}; window.__errEvents.push(t.tagName + ":" + ((t.src||t.currentSrc||"").split("/").pop()||"?")); }, true); return 1; })()`,
  });
  try {
    for (const p of ["temas/tema-2.html", "temas/tema-5.html"]) {
      await cdp.goto(`http://127.0.0.1:${port}/${p}`, 2500);
      await sleep(2000);
      const r = await cdp.eval(`(() => ({
        errEvents: window.__errEvents,
        tracks: Array.from(document.querySelectorAll("video track")).map((t) => ({
          src: (t.getAttribute("src") || "").split("/").pop(),
          readyState: t.track.readyState,
          cues: t.track.cues ? t.track.cues.length : null,
          firstCue: t.track.cues && t.track.cues[0] ? t.track.cues[0].text.slice(0, 40) : null,
        })),
      }))()`);
      console.log(`\n== http://${p}`);
      console.log("  errEvents:", JSON.stringify(r.errEvents));
      for (const t of r.tracks) console.log("  track:", JSON.stringify(t));
    }
  } finally {
    await cdp.close();
    proc.kill();
    server.close();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
