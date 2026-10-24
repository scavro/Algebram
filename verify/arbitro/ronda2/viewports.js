/* Ronda 2 — viewports 375×812 / 768×1024 / 1440×900: overflow, solapes
   (fórmulas flotantes del héroe vs título), rejas rotas + capturas. */
const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);
const SHOTS = path.join(__dirname, "capturas");
fs.mkdirSync(SHOTS, { recursive: true });

const VPS = [
  { w: 375, h: 812, name: "375x812" },
  { w: 768, h: 1024, name: "768x1024" },
  { w: 1440, h: 900, name: "1440x900" },
];
const PAGES = ["index.html", "temas/tema-1.html", "temas/tema-5.html", "examenes/examen-1.html"];

const PROBE = `(() => {
  const out = {};
  const de = document.documentElement;
  out.overflowDoc = de.scrollWidth - de.clientWidth;
  out.viewport = { w: innerWidth, h: innerHeight };
  // elementos que sobresalen del viewport horizontalmente (visibles)
  out.desbordes = [];
  document.querySelectorAll("body *").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (el.closest(".hero__cloud, .table-wrap, .mindmap, [data-mindmap], svg, .toc")) return;
    if (r.right > innerWidth + 1.5 || r.left < -1.5) {
      out.desbordes.push({
        sel: el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\\s+/).slice(0,2).join(".") : ""),
        left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
      });
    }
  });
  // solapes: fórmulas flotantes del héroe vs textos del héroe
  out.solapesHero = [];
  const hero = document.querySelector(".hero");
  if (hero) {
    const forms = Array.from(hero.querySelectorAll(".hero__formula"));
    const texts = Array.from(hero.querySelectorAll("h1, h2, .hero__title, .hero__sub, p, .kicker"));
    forms.forEach((f, i) => {
      const a = f.getBoundingClientRect();
      const cs = getComputedStyle(f);
      if (cs.display === "none" || +cs.opacity < 0.05) return;
      texts.forEach((t) => {
        const b = t.getBoundingClientRect();
        const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if (ix > 4 && iy > 4) {
          out.solapesHero.push({
            formula: i + 1, texto: t.tagName.toLowerCase() + "." + (typeof t.className === "string" ? t.className.trim().split(/\\s+/)[0] : ""),
            ix: Math.round(ix), iy: Math.round(iy), txt: t.textContent.trim().slice(0, 24),
            formulaTxt: f.textContent.trim().slice(0, 24),
          });
        }
      });
    });
    out.formulasVisibles = forms.filter((f) => getComputedStyle(f).display !== "none").length;
  }
  // rejas: filas de tablas con overflow, mindmap
  out.mindmapOverflow = document.querySelector("[data-mindmap] svg") ? document.querySelector("[data-mindmap]").scrollWidth - document.querySelector("[data-mindmap]").clientWidth : 0;
  return out;
})()`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  const res = {};
  try {
    for (const vp of VPS) {
      for (const p of PAGES) {
        await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.w < 500 });
        await cdp.goto(fileUrl(p), 1300);
        await sleep(700);
        const r = await cdp.eval(PROBE);
        res[vp.name + " " + p] = r;
        const flag = r.overflowDoc > 1 || r.desbordes.length || r.solapesHero.length;
        console.log(
          `${flag ? "⚠" : "✔"} ${vp.name} ${p.padEnd(22)} overflowDoc=${r.overflowDoc} desbordes=${r.desbordes.length} solapesHero=${r.solapesHero.length} formulas=${r.formulasVisibles ?? "-"}`
        );
        if (r.desbordes.length) console.log("   desbordes:", JSON.stringify(r.desbordes.slice(0, 6)));
        if (r.solapesHero.length) console.log("   solapes:", JSON.stringify(r.solapesHero));
        const shot = path.join(SHOTS, p.replace(/[\/.]/g, "_") + "-" + vp.name + ".png");
        await cdp.send("Page.captureScreenshot", { format: "png" }).then((s) => fs.writeFileSync(shot, Buffer.from(s.data, "base64")));
      }
    }
  } finally {
    fs.writeFileSync(path.join(__dirname, "viewports.json"), JSON.stringify(res, null, 1));
    await cdp.close();
    proc.kill();
  }
  console.log("\nOK viewports.json + capturas/");
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
