/* Ronda 2 — contraste AA en runtime: recorre el texto VISIBLE real, resuelve
   el fondo efectivo (ancestros) y calcula WCAG. Captura también chips. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

const AUDIT = `(() => {
  function parse(c) {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x));
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function over(fg, bg) {
    const a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
  }
  function lum(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  function ratio(fg, bg) {
    const a = lum(fg), b = lum(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  function bgOf(el) {
    let cur = el, acc = null;
    while (cur && cur !== document.documentElement) {
      const cs = getComputedStyle(cur);
      const c = parse(cs.backgroundColor);
      if (c && c[3] > 0) {
        acc = acc ? over(acc, c) : c;
        if (acc[3] >= 0.999) return acc;
      }
      cur = cur.parentElement;
    }
    return acc || [255, 255, 255, 1];
  }
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.trim();
    if (!t) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity < 0.1) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (el.closest(".hero__cloud, .katex, script, style")) continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const bg = bgOf(el);
    const eff = fg[3] < 1 ? over(fg, bg) : fg;
    const rt = ratio(eff, bg);
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = px >= 24 || (bold && px >= 18.66);
    const umbral = large ? 3 : 4.5;
    if (rt < umbral - 0.005) {
      out.push({
        txt: t.slice(0, 28),
        sel: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).slice(0, 2).join(".") : ""),
        color: cs.color, fontSize: cs.fontSize, ratio: +rt.toFixed(2), umbral,
      });
    }
  }
  // dedup por selector+color
  const seenKey = new Set();
  return out.filter((o) => {
    const k = o.sel + o.color + o.fontSize;
    if (seenKey.has(k)) return false;
    seenKey.add(k);
    return true;
  });
})()`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  const paginas = ["index.html", "temas/tema-1.html", "temas/tema-3.html", "temas/tema-5.html", "examenes/examen-1.html", "planificacion.html"];
  let total = 0;
  try {
    for (const p of paginas) {
      await cdp.goto(fileUrl(p), 1300);
      await sleep(400);
      // revela todo (para medir también secciones .reveal)
      await cdp.eval(`document.querySelectorAll(".reveal").forEach((r) => r.classList.add("is-in")); document.querySelectorAll(".drill__hint, .drill__solution").forEach((r) => r.classList.add("is-visible"));`);
      await sleep(200);
      const fails = await cdp.eval(AUDIT);
      total += fails.length;
      console.log(`\n== ${p} — ${fails.length} casos bajo umbral ==`);
      fails.forEach((f) => console.log(`  ${f.ratio}:1 (min ${f.umbral}) ${f.sel} ${f.fontSize} color=${f.color} :: "${f.txt}"`));
    }
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nTOTAL runtime bajo umbral AA: ${total}`);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
