/* Ronda 3 — focos de las correcciones afirmadas: M3 (ratios exactos), N2 (matriz),
   N3/N4 (aria y marcas en multi anidado). Evidencia numérica para el informe. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

const MEDICION = `(() => {
  function parse(c) {
    const m = String(c).match(/rgba?\\(([^)]+)\\)/);
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
  function medir(el) {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    const bg = bgOf(el);
    const eff = fg[3] < 1 ? over(fg, bg) : fg;
    return {
      texto: (el.textContent || "").trim().slice(0, 40),
      color: cs.color,
      bg: "rgb(" + bg.slice(0, 3).map(Math.round).join(",") + ")",
      ratio: Math.round(ratio(eff, bg) * 100) / 100,
      px: cs.fontSize,
      selector: el.className || el.tagName,
    };
  }
  const out = {};
  out.kickerHero = medir(document.querySelector(".hero .kicker, .theme-head .kicker"));
  out.kickerCualquiera = Array.from(document.querySelectorAll(".kicker")).map(medir);
  out.brand = medir(document.querySelector(".nav__brand-mark"));
  out.chips = Array.from(document.querySelectorAll(".drill__level")).slice(0, 6).map(medir);
  out.tiempoRestante = medir(Array.from(document.querySelectorAll(".exam-toolbar .meta")).find((e) => /Tiempo/.test(e.textContent)));
  out.metaOscuras = Array.from(document.querySelectorAll(".theme-card--night .meta, .theme-card .meta")).slice(0, 8).map(medir);
  out.plaque = Array.from(document.querySelectorAll(".plaque__label")).map(medir);
  return out;
})()`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    /* ---- A. M3: ratios exactos por página ---- */
    for (const p of ["index.html", "temas/tema-1.html", "examenes/examen-1.html", "planificacion.html"]) {
      await cdp.goto(fileUrl(p), 1300);
      await sleep(500);
      const m = await cdp.eval(MEDICION);
      console.log("== M3 " + p);
      if (m.kickerHero) console.log("   kicker cabecera:", JSON.stringify(m.kickerHero));
      if (m.brand) console.log("   nav__brand-mark:", JSON.stringify(m.brand));
      m.chips.slice(0, 3).forEach((c) => console.log("   chip:", JSON.stringify(c)));
      if (m.tiempoRestante) console.log("   Tiempo restante:", JSON.stringify(m.tiempoRestante));
      m.metaOscuras.slice(0, 3).forEach((c) => console.log("   meta:", JSON.stringify(c)));
      m.plaque.forEach((c) => console.log("   plaque__label:", JSON.stringify(c)));
    }

    /* ---- B/C/D. tema-2 T2-E4: N3 (aria) + N4 (marcas en multi anidado) ---- */
    await cdp.goto(fileUrl("temas/tema-2.html"), 1400);
    await sleep(600);
    const t2 = await cdp.eval(`(() => {
      const card = document.getElementById("T2-E4");
      if (!card) return { found: false };
      const out = { found: true };
      // N3: nombres accesibles de los radios del bool anidado
      const radios = Array.from(card.querySelectorAll(".drill__fields input[type=radio]"));
      out.radios = radios.map((r) => ({
        aria: r.getAttribute("aria-label"),
        labelTexto: (r.closest("label") ? r.closest("label").textContent.trim() : "").slice(0, 16),
        value: r.value,
      }));
      // N4: elegir el bool MAL (para que se marque is-wrong) y el texto bien
      const boolRadios = radios.filter((r) => r.value === "true" || r.value === "false");
      const pick = boolRadios.find((r) => r.value === "false"); // respuesta esperada es true → wrong
      if (pick) { pick.checked = true; pick.dispatchEvent(new Event("change", { bubbles: true })); }
      const inv = card.querySelector(".drill__fields input[type=text]");
      if (inv) {
        const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        s.call(inv, "Q^T"); // probablemente incorrecto también
        inv.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click();
      out.choicesTrasCorregir = Array.from(card.querySelectorAll(".drill__fields .choice")).map((l) => ({
        cls: l.className,
        txt: l.textContent.trim().slice(0, 12),
      }));
      out.feedback = card.querySelector(".drill__feedback").textContent.trim().slice(0, 60);
      out.tipoBool = !!card.querySelector(".drill__fields .choices");
      return out;
    })()`);
    console.log("== N3/N4 T2-E4:", JSON.stringify(t2, null, 1));

    /* ---- B'. N2: matriz 4x4 de X1-12 a 375 px ---- */
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1400);
    await sleep(600);
    const mx = await cdp.eval(`(() => {
      const card = document.getElementById("X1-12");
      if (!card) return { found: false };
      const grid = card.querySelector(".matrix-input");
      const cs = getComputedStyle(grid);
      const inputs = Array.from(grid.querySelectorAll("input"));
      const last = inputs[inputs.length - 1];
      last.focus();
      const rLast = last.getBoundingClientRect();
      const rGrid = grid.getBoundingClientRect();
      return {
        found: true,
        overflowX: cs.overflowX,
        maxWidth: cs.maxWidth,
        scrollWidth: grid.scrollWidth,
        clientWidth: grid.clientWidth,
        scrollable: grid.scrollWidth > grid.clientWidth,
        desbordeTarjeta: card.getBoundingClientRect().width < grid.scrollWidth && cs.overflowX !== "auto" && cs.overflowX !== "scroll",
        lastVisibleTrasFocus: rLast.right <= rGrid.right + 2 && rLast.left >= rGrid.left - 2,
        lastRect: { l: Math.round(rLast.left), r: Math.round(rLast.right) },
        gridRect: { l: Math.round(rGrid.left), r: Math.round(rGrid.right) },
        docOverflow: document.documentElement.scrollWidth > window.innerWidth,
        innerW: window.innerWidth,
      };
    })()`);
    console.log("== N2 matriz X1-12 @375:", JSON.stringify(mx, null, 1));
    await cdp.send("Page.captureScreenshot", { format: "png" }).then((s) => {
      require("fs").writeFileSync(path.join(__dirname, "capturas", "R3-X1-12-375-matriz.png"), Buffer.from(s.data, "base64"));
    });
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
