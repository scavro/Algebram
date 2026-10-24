/* Ronda 3 — diagnóstico fino de los desajustes de hostil-r3:
   (a) fórmulas KaTeX más allá de 320 px: ¿recortadas o desplazables?
   (b) reveal en landscape con scroll instantáneo (elimina el flake de smooth)
   (c) cross-page con expectativa corregida (1/15 → 7%)
   (d) temporizador con deadline entero gigante */
const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    /* (a) KaTeX a 320 px */
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });
    for (const p of ["temas/tema-1.html", "examenes/examen-1.html"]) {
      await cdp.goto(fileUrl(p), 1300);
      await sleep(600);
      const diag = await cdp.eval(`(() => {
        const out = [];
        document.querySelectorAll(".katex, math, .katex-display").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right <= window.innerWidth + 1.5) return;
          // cadena de ancestros: overflow y scroll real
          const chain = [];
          let cur = el;
          let scrollable = false;
          while (cur && cur !== document.body) {
            const cs = getComputedStyle(cur);
            chain.push((cur.className || cur.tagName).toString().slice(0, 28) + "[ox=" + cs.overflowX + "]");
            if ((cs.overflowX === "auto" || cs.overflowX === "scroll") && cur.scrollWidth > cur.clientWidth) scrollable = true;
            if (cs.overflowX === "hidden") { scrollable = false; break; }
            cur = cur.parentElement;
          }
          out.push({
            tag: el.tagName,
            cls: (el.className || "").toString().slice(0, 30),
            right: Math.round(r.right),
            w: Math.round(r.width),
            texto: (el.textContent || "").trim().slice(0, 30),
            scrollableEnAncestro: scrollable,
            cadena: chain.slice(0, 5),
          });
        });
        return { n: out.length, ejemplos: out.slice(0, 6), innerW: window.innerWidth, docScroll: document.documentElement.scrollWidth };
      })()`);
      console.log("== KaTeX >320px en " + p + ":", JSON.stringify(diag, null, 1));
      await cdp.send("Page.captureScreenshot", { format: "png" }).then((s) => {
        fs.writeFileSync(path.join(__dirname, "capturas", "R3-" + p.replace(/[\/.]/g, "_") + "-320.png"), Buffer.from(s.data, "base64"));
      });
    }

    /* (b) reveal landscape con scroll instantáneo */
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 740, height: 360, deviceScaleFactor: 1, mobile: true });
    await cdp.goto(fileUrl("temas/tema-1.html"), 1300);
    await sleep(500);
    await cdp.eval(`document.documentElement.style.scrollBehavior = "auto"`, false);
    await cdp.eval(`(async () => { for (let y = 0; y <= document.body.scrollHeight; y += 250) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise(r=>setTimeout(r,120)); } window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }); })()`, true);
    await sleep(1200);
    const rev = await cdp.eval(`(() => {
      const ds = Array.from(document.querySelectorAll("article.drill, .reveal"));
      return {
        totalDrills: document.querySelectorAll("article.drill").length,
        sinIsIn: ds.filter((d) => d.classList.contains("drill") && !d.classList.contains("is-in")).map((d) => d.id),
        opacidades: Array.from(document.querySelectorAll("article.drill")).map((d) => d.id + ":" + getComputedStyle(d).opacity).filter((x) => !x.endsWith(":1")),
      };
    })()`);
    console.log("== reveal landscape 740×360 instant:", JSON.stringify(rev));

    /* (c) cross-page con expectativa correcta */
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
    await cdp.goto(fileUrl("temas/tema-1.html"), 1200);
    await cdp.eval(`localStorage.clear()`);
    await cdp.send("Page.reload", {});
    await sleep(1300);
    await cdp.eval(`(() => {
      const card = document.getElementById("T1-N1");
      const inp = card.querySelector("input[type=text]");
      const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      const spec = window.CURSO_DATA["tema-1"].drills.find((d) => d.id === "T1-N1");
      s.call(inp, String(spec.answer.expected));
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
    })()`);
    await sleep(300);
    await cdp.goto(fileUrl("index.html"), 1200);
    const idx = await cdp.eval(`(() => {
      const l = document.querySelector('[data-theme-progress-label="tema-1"]');
      const bar = document.querySelector('[data-theme-progress="tema-1"]');
      return { label: l && l.textContent.trim(), width: bar && bar.style.width };
    })()`);
    console.log("== cross-page T1-N1:", JSON.stringify(idx), "· esperado label=1 / 15 · 7% width=7%");

    /* (d) deadline entero gigante */
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1000);
    await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem("curso-algebra-examen-examen-1", "999999999999999999999")`);
    await cdp.send("Page.reload", {});
    await sleep(1300);
    const t = await cdp.eval(`(() => {
      const el = document.querySelector("#exam-timer");
      return { timer: el.textContent, len: el.textContent.length, deadline: sessionStorage.getItem("curso-algebra-examen-examen-1") };
    })()`);
    console.log("== deadline 1e21:", JSON.stringify(t));
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
