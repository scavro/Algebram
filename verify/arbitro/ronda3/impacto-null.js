/* Impacto del crash loadProgress()=null en una página de tema */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    for (const v of ["null", "[]"]) {
      await cdp.goto(fileUrl("temas/tema-1.html"), 1000);
      await cdp.eval(`localStorage.setItem("curso-algebra-progreso-v1", ${JSON.stringify(v)})`);
      await cdp.goto(fileUrl("temas/tema-1.html"), 1300);
      await sleep(600);
      const st = await cdp.eval(`(() => {
        const reveals = Array.from(document.querySelectorAll(".reveal"));
        return {
          valorLS: localStorage.getItem("curso-algebra-progreso-v1"),
          drills: document.querySelectorAll("article.drill").length,
          katexSpan: document.querySelectorAll(".katex").length,
          erroresJS: window.__err || null,
          revealTotal: reveals.length,
          revealOpacos: reveals.filter((r) => getComputedStyle(r).opacity === "0").length,
          texCrudo: (document.body.innerText.match(/\\\\\\(|\\\\\\[/g) || []).length,
        };
      })()`);
      console.log("LS=" + JSON.stringify(v), JSON.stringify(st));
    }
    // ¿y el índice con "null"?
    await cdp.goto(fileUrl("index.html"), 900);
    await cdp.eval(`localStorage.setItem("curso-algebra-progreso-v1", "null")`);
    await cdp.goto(fileUrl("index.html"), 1200);
    const ix = await cdp.eval(`(() => ({
      labels: Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => l.textContent.trim()),
      katex: document.querySelectorAll(".katex").length,
      heroVisible: getComputedStyle(document.querySelector(".hero") || document.body).opacity,
    }))()`);
    console.log("index LS=null:", JSON.stringify(ix));
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
