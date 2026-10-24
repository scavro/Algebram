const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    await cdp.goto("file://" + path.join(ROOT, "temas/tema-1.html"), 1300);
    await sleep(400);
    const r = await cdp.eval(`(() => {
      function chain(el) {
        const out = [];
        let cur = el;
        while (cur && cur !== document.documentElement && out.length < 8) {
          const cs = getComputedStyle(cur);
          out.push(cur.tagName.toLowerCase() + (typeof cur.className === "string" && cur.className ? "." + cur.className.trim().split(/\\s+/)[0] : "") + " bg=" + cs.backgroundColor + " color=" + cs.color);
          cur = cur.parentElement;
        }
        return out;
      }
      const kicker = document.querySelector(".kicker");
      const chip = document.querySelector(".drill__level");
      const head = document.querySelector(".theme-head");
      return {
        kicker: chain(kicker),
        chip: chain(chip),
        themeHeadBg: head ? getComputedStyle(head).backgroundColor : null,
      };
    })()`);
    console.log(JSON.stringify(r, null, 1));
    await cdp.goto("file://" + path.join(ROOT, "examenes/examen-1.html"), 1200);
    const r2 = await cdp.eval(`(() => {
      const m = Array.from(document.querySelectorAll(".exam-toolbar .meta"))[0];
      return m ? { color: getComputedStyle(m).color, inline: m.getAttribute("style"), bg: getComputedStyle(m.closest(".exam-toolbar")).backgroundColor } : null;
    })()`);
    console.log("exam meta:", JSON.stringify(r2));
    await cdp.goto("file://" + path.join(ROOT, "planificacion.html"), 1200);
    const r3 = await cdp.eval(`(() => {
      const p = document.querySelector(".plaque__label");
      if (!p) return null;
      let cur = p, chain = [];
      while (cur && cur !== document.documentElement && chain.length < 6) {
        chain.push(cur.tagName.toLowerCase() + "." + (typeof cur.className === "string" ? cur.className.trim().split(/\\s+/)[0] : "") + " bg=" + getComputedStyle(cur).backgroundColor);
        cur = cur.parentElement;
      }
      return { color: getComputedStyle(p).color, chain };
    })()`);
    console.log("plaque:", JSON.stringify(r3, null, 1));
    await cdp.goto("file://" + path.join(ROOT, "index.html"), 1200);
    const r4 = await cdp.eval(`(() => {
      const m = Array.from(document.querySelectorAll(".meta")).find((x) => x.textContent.includes("Octubre"));
      if (!m) return null;
      let cur = m, chain = [];
      while (cur && cur !== document.documentElement && chain.length < 8) {
        chain.push(cur.tagName.toLowerCase() + "." + (typeof cur.className === "string" ? cur.className.trim().split(/\\s+/)[0] : "") + " bg=" + getComputedStyle(cur).backgroundColor);
        cur = cur.parentElement;
      }
      return { color: getComputedStyle(m).color, chain };
    })()`);
    console.log("index meta:", JSON.stringify(r4, null, 1));
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
