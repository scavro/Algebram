/* Secciones 5 (viewport 320 px) y 6 (landscape) de hostil-r3, con Chrome limpio. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  let fallos = 0;
  const ok = (c, m, e) => { console.log((c ? "  ✓ " : "  ✗ ") + m + (e ? "  [" + e + "]" : "")); if (!c) fallos++; };
  try {
    console.log("== 5. viewport 320 px");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });
    for (const p of ["index.html", "temas/tema-1.html", "examenes/examen-1.html"]) {
      await cdp.goto(fileUrl(p), 1200);
      await sleep(500);
      const v = await cdp.eval(`(() => {
        const de = document.documentElement;
        const desborde = [];
        document.querySelectorAll("body *").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > window.innerWidth + 1.5 || r.left < -1.5)) {
            const cs = getComputedStyle(el);
            // excluye decorativos, capas ocultas de KaTeX y TODO lo que viva en un
            // contenedor con scroll horizontal (patrón N2: matriz y mapa mental)
            let enScroll = false;
            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
              const o = getComputedStyle(p).overflowX;
              if (o === "auto" || o === "scroll") { enScroll = true; break; }
            }
            if (!enScroll && cs.position !== "fixed" && cs.position !== "absolute" && !el.closest(".hero__cloud, .theme-head__ghost, .ghost-num, .progress-bar, .katex-mathml, .katex-html")) {
              desborde.push((typeof el.className === "string" ? el.className : el.tagName).toString().slice(0, 40) + " r=" + Math.round(r.right));
            }
          }
        });
        return {
          docOverflow: de.scrollWidth > window.innerWidth,
          scrollW: de.scrollWidth, innerW: window.innerWidth,
          desborde: desborde.slice(0, 8),
          nav: !!document.querySelector(".nav__toggle"),
        };
      })()`);
      ok(!v.docOverflow && v.desborde.length === 0, `320px ${p}: sin overflow`, `scrollW=${v.scrollW}/${v.innerW} desborde=${JSON.stringify(v.desborde)}`);
    }
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1200);
    await sleep(600);
    const mx320 = await cdp.eval(`(() => {
      const grid = document.querySelector("#X1-12 .matrix-input");
      if (!grid) return { found: false };
      return {
        found: true,
        overflowX: getComputedStyle(grid).overflowX,
        scrollable: grid.scrollWidth > grid.clientWidth,
        docOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    })()`);
    ok(mx320.found && mx320.scrollable && !mx320.docOverflow, "320px matriz X1-12 con scroll horizontal", JSON.stringify(mx320));
    await cdp.goto(fileUrl("index.html"), 1000);
    await sleep(400);
    const nav = await cdp.eval(`(() => {
      const btn = document.querySelector(".nav__toggle");
      btn.click();
      const links = document.querySelector(".nav__links");
      const r = links.getBoundingClientRect();
      return { open: document.querySelector(".nav").classList.contains("is-open"), expandido: btn.getAttribute("aria-expanded"), ancho: Math.round(r.width) };
    })()`);
    ok(nav.open && nav.expandido === "true" && nav.ancho > 100, "320px nav toggle abre menú", JSON.stringify(nav));

    console.log("== 6. landscape");
    for (const [w, h] of [[740, 360], [812, 375]]) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: true });
      for (const p of ["index.html", "temas/tema-1.html", "examenes/examen-1.html"]) {
        await cdp.goto(fileUrl(p), 1100);
        await sleep(450);
        const v = await cdp.eval(`(() => {
          const de = document.documentElement;
          const hero = document.querySelector(".hero, .theme-head");
          const hr = hero ? hero.getBoundingClientRect() : null;
          const timer = document.querySelector("#exam-timer");
          return {
            docOverflow: de.scrollWidth > window.innerWidth,
            scrollW: de.scrollWidth, innerW: window.innerWidth,
            heroH: hr ? Math.round(hr.height) : null,
            timerVisible: timer ? (timer.getBoundingClientRect().width > 0 && getComputedStyle(timer).visibility !== "hidden") : null,
          };
        })()`);
        ok(!v.docOverflow, `landscape ${w}×${h} ${p}: sin overflow`, `scrollW=${v.scrollW}/${v.innerW} heroH=${v.heroH} timer=${v.timerVisible}`);
      }
    }
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 740, height: 360, deviceScaleFactor: 1, mobile: true });
    await cdp.goto(fileUrl("temas/tema-1.html"), 1200);
    await sleep(500);
    await cdp.eval(`(async () => { document.documentElement.style.scrollBehavior = "auto"; for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,50)); } window.scrollTo(0, document.body.scrollHeight); })()`, true);
    await sleep(1500);
    const rev = await cdp.eval(`(() => {
      const rs = Array.from(document.querySelectorAll(".reveal"));
      const ocultas = rs.filter((r) => +getComputedStyle(r).opacity < 0.99).length;
      return { total: rs.length, ocultas };
    })()`);
    ok(rev.ocultas === 0, "landscape: reveal completo con scroll instantáneo", JSON.stringify(rev));
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(fallos === 0 ? "\nsecciones 5-6: VERDE" : `\nsecciones 5-6: ${fallos} fallos`);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
