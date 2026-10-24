/* Ronda 2 — smoke test de las 10 páginas: campos de respuesta (C1), KaTeX, nav,
   visibilidad de tarjetas (C2), a11y básica (M4/M5/M6), vídeo+tracks (M10). */
const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");

const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

const PAGES = [
  "index.html",
  "planificacion.html",
  "temas/tema-1.html",
  "temas/tema-2.html",
  "temas/tema-3.html",
  "temas/tema-4.html",
  "temas/tema-5.html",
  "examenes/examen-1.html",
  "examenes/examen-2.html",
  "examenes/examen-3.html",
];

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  const report = {};
  try {
    for (const p of PAGES) {
      const isExam = p.startsWith("examenes");
      await cdp.goto(fileUrl(p), 1400);
      await sleep(400);
      const r = await cdp.eval(`(() => {
        const out = {};
        const drills = Array.from(document.querySelectorAll("article.drill"));
        out.drills = drills.length;
        out.sinCampo = [];
        out.camposPorDrill = {};
        drills.forEach((d) => {
          const box = d.querySelector(".drill__answer");
          const inputs = box ? box.querySelectorAll("input, select, textarea") : [];
          out.camposPorDrill[d.id] = inputs.length;
          if (!inputs.length) out.sinCampo.push(d.id);
        });
        out.katexErrors = document.querySelectorAll(".katex-error").length;
        out.nav = !!document.querySelector(".nav");
        out.ariaLive = document.querySelectorAll("[aria-live]").length;
        // labels de multi: for/id
        const fieldLabels = Array.from(document.querySelectorAll(".drill__fields .field > label"));
        out.multiLabels = fieldLabels.map((l) => ({
          for: l.getAttribute("for"),
          forResolves: l.getAttribute("for") ? !!document.getElementById(l.getAttribute("for")) : false,
        }));
        // expr: label visible + aria-label en input
        const exprInputs = Array.from(document.querySelectorAll(".drill__answer > .field > input[type=text]"));
        out.exprInputs = exprInputs.length;
        out.exprSinLabel = exprInputs.filter((i) => {
          const lab = i.parentElement && i.parentElement.querySelector("label");
          return !(lab && lab.getAttribute("for") === i.id) && !i.getAttribute("aria-label");
        }).length;
        out.exprSinAria = exprInputs.filter((i) => !i.getAttribute("aria-label")).length;
        // feedback role/status
        const fb = document.querySelectorAll(".drill__feedback");
        out.feedback = fb.length;
        out.feedbackSinLive = Array.from(fb).filter((f) => f.getAttribute("role") !== "status" || f.getAttribute("aria-live") !== "polite").length;
        // mapa mental
        const svg = document.querySelector("[data-mindmap] svg");
        out.mindmap = svg ? {
          role: svg.getAttribute("role"),
          nodos: svg.querySelectorAll("g.mindmap__node").length,
          nodosRole: Array.from(svg.querySelectorAll("g.mindmap__node")).map((g) => g.getAttribute("role")),
          nodosAria: Array.from(svg.querySelectorAll("g.mindmap__node")).every((g) => !!g.getAttribute("aria-label")),
          tabindex: svg.querySelectorAll("g[tabindex]").length,
        } : null;
        // vídeo + track
        const vids = Array.from(document.querySelectorAll("video"));
        out.videos = vids.map((v) => ({
          src: (v.getAttribute("src") || "").split("/").pop(),
          tracks: v.querySelectorAll("track[kind=captions]").length,
          trackSrc: Array.from(v.querySelectorAll("track")).map((t) => (t.getAttribute("src") || "").split("/").pop()),
        }));
        // inputs type=number (m4-menor: tipo text para cifras)
        out.typeNumber = document.querySelectorAll("input[type=number]").length;
        // footer targets
        const fLinks = Array.from(document.querySelectorAll(".footer a"));
        out.footerTargets = fLinks.map((a) => {
          const r = a.getBoundingClientRect();
          return { t: (a.textContent || "").trim().slice(0, 18), w: Math.round(r.width), h: Math.round(r.height) };
        });
        out.footerUnder24 = out.footerTargets.filter((x) => x.h < 24).length;
        // exam
        out.examTimer = !!document.querySelector("#exam-timer");
        out.examScore = !!document.querySelector("#exam-grade");
        out.examGradeLive = (function(){ const g = document.querySelector("#exam-grade"); return g ? g.getAttribute("aria-live") : null; })();
        out.revealIn = document.querySelectorAll(".reveal.is-in").length;
        out.revealTotal = document.querySelectorAll(".reveal").length;
        out.navLinks = Array.from(document.querySelectorAll(".nav__links a")).map((a) => (a.getAttribute("href")||"").split("/").pop());
        out.pager = Array.from(document.querySelectorAll("nav.pager, nav.wrap.pager, .pager")).length;
        return out;
      })()`);
      report[p] = r;
      console.log(
        p.padEnd(24),
        "drills=" + r.drills,
        "sinCampo=" + (r.sinCampo.length ? r.sinCampo.join(",") : "0"),
        "katexErr=" + r.katexErrors,
        "nav=" + (r.nav ? 1 : 0),
        "ariaLive=" + r.ariaLive,
        "videos=" + r.videos.map((v) => v.src + ":" + v.tracks).join(" ") || "-",
        "footer<24=" + r.footerUnder24,
        "typeNumber=" + r.typeNumber
      );
      if (r.mindmap) console.log("   mindmap:", JSON.stringify({ role: r.mindmap.role, nodos: r.mindmap.nodos, rolesOK: r.mindmap.nodosRole.every((x) => x === "button"), aria: r.mindmap.nodosAria }));
      if (r.multiLabels.length) console.log("   multiLabels:", r.multiLabels.length, "forResolves:", r.multiLabels.filter((x) => x.forResolves).length);
      if (r.exprInputs) console.log("   exprInputs:", r.exprInputs, "sinAria:", r.exprSinAria, "sinLabelNiAria:", r.exprSinLabel);
    }
  } finally {
    fs.writeFileSync(path.join(__dirname, "smoke.json"), JSON.stringify(report, null, 1));
    await cdp.close();
    proc.kill();
  }
  console.log("\nOK smoke.json escrito");
})().catch((e) => {
  console.error("FALLO:", e);
  process.exit(1);
});
