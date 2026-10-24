/* Ronda 5 — smoke test de las 10 páginas (protocolo del árbitro):
   campos de respuesta, KaTeX sin errores, nav, progreso, timer, tracks de
   vídeo + errores de runtime. Además: verificación funcional de progreso
   (labels/barras reactivos a localStorage) y del timer (tick + clampeo de
   deadline absurdo). */
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

const COLLECTOR = `(() => {
  window.__errs = [];
  window.addEventListener("error", (e) => {
    const t = e.target || {};
    const where = t.tagName ? t.tagName.toLowerCase() + ":" + ((t.src || t.currentSrc || t.href || "").split("/").pop() || "?") : (e.message || e.type);
    window.__errs.push("error: " + where);
  }, true);
  window.addEventListener("unhandledrejection", (e) => window.__errs.push("rejection: " + String(e.reason).slice(0, 120)));
  const ce = console.error;
  console.error = function (...a) { window.__errs.push("console.error: " + a.map(String).join(" ").slice(0, 120)); ce.apply(console, a); };
  return 1;
})()`;

let fallos = 0;
function check(ok, msg) {
  if (!ok) fallos++;
  console.log(`  ${ok ? "✔" : "✘"} ${msg}`);
}

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR });
  const report = {};
  try {
    for (const p of PAGES) {
      const isExam = p.startsWith("examenes");
      console.log(`\n== ${p}`);
      await cdp.goto(fileUrl(p), 1500);
      await sleep(500);
      const r = await cdp.eval(`(() => {
        const out = {};
        out.errs = window.__errs || [];
        const drills = Array.from(document.querySelectorAll("article.drill"));
        out.drills = drills.length;
        out.sinCampo = [];
        drills.forEach((d) => {
          const box = d.querySelector(".drill__answer");
          const inputs = box ? box.querySelectorAll("input, select, textarea") : [];
          if (!inputs.length) out.sinCampo.push(d.id || "?");
        });
        out.katexErrors = document.querySelectorAll(".katex-error").length;
        out.katexSpans = document.querySelectorAll(".katex").length;
        out.nav = !!document.querySelector(".nav");
        out.navLabel = (function () { const n = document.querySelector("nav.nav"); return n ? n.getAttribute("aria-label") : null; })();
        out.navLinks = document.querySelectorAll(".nav__links a").length;
        // progreso
        out.progressBars = document.querySelectorAll("[data-theme-progress]").length;
        out.progressLabels = Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => ({
          theme: l.getAttribute("data-theme-progress-label"), text: l.textContent.trim(),
        }));
        out.readingBar = !!document.querySelector(".progress-bar__fill");
        // timer
        const t = document.querySelector("#exam-timer");
        out.timer = t ? t.textContent.trim() : null;
        // vídeo + tracks
        out.videos = Array.from(document.querySelectorAll("video")).map((v) => ({
          src: (v.getAttribute("src") || "").split("/").pop(),
          tracks: Array.from(v.querySelectorAll("track")).map((tr) => ({
            kind: tr.getAttribute("kind"), src: tr.getAttribute("src") || "",
          })),
        }));
        out.mediaError = Array.from(document.querySelectorAll("video")).filter((v) => v.error).length;
        return out;
      })()`);
      report[p] = r;

      check(r.errs.filter((e) => !/^error: track:/.test(e)).length === 0,
        `sin errores de JS (${r.errs.filter((e) => !/^error: track:/.test(e)).length}${r.errs.length ? " · recurso: " + r.errs.join(" | ") : ""})`);
      check(r.katexErrors === 0, `KaTeX: ${r.katexSpans} fórmulas renderizadas · ${r.katexErrors} .katex-error`);
      check(r.nav && r.navLinks >= 4, `nav presente (${r.navLinks} links · aria-label=${JSON.stringify(r.navLabel)})`);
      if (r.drills) check(r.sinCampo.length === 0, `campos de respuesta: ${r.drills} drills · sin campo: ${r.sinCampo.length ? r.sinCampo.join(",") : "0"}`);
      else console.log(`  · 0 drills (página sin ejercicios)`);
      if (r.videos.length) {
        const sinTrack = r.videos.filter((v) => !v.tracks.some((t) => t.kind === "captions" && t.src));
        const faltaFichero = [];
        for (const v of r.videos) for (const t of v.tracks) if (t.src) {
          const abs = path.join(ROOT, path.dirname(p), t.src);
          if (!fs.existsSync(abs)) faltaFichero.push(t.src);
        }
        check(sinTrack.length === 0 && faltaFichero.length === 0 && r.mediaError === 0,
          `tracks de vídeo: ${r.videos.length} vídeos · captions OK · .vtt en disco OK · mediaError=${r.mediaError}`);
      }
      if (r.progressLabels.length) {
        const malas = r.progressLabels.filter((l) => !/^\d+ \/ \d+ · \d+%$/.test(l.text));
        check(r.progressBars === r.progressLabels.length && malas.length === 0,
          `progreso estático: ${r.progressBars} barras / ${r.progressLabels.length} labels · formato OK`);
      }
      if (r.readingBar !== undefined) check(r.readingBar, "barra de lectura (.progress-bar__fill) presente");
    }

    // ---- progreso funcional (index): localStorage → labels y barras ----
    console.log("\n== progreso funcional (index)");
    await cdp.goto(fileUrl("index.html"), 1500);
    await sleep(600);
    const prog = await cdp.eval(`(() => {
      const p = JSON.parse(localStorage.getItem("curso-algebra-progreso-v1") || "{}");
      const D = window.CURSO_DATA || {};
      const ids = ((D["tema-1"] && D["tema-1"].drills) || []).slice(0, 5).map((d) => d.id);
      ids.forEach((id) => (p[id] = "solved"));
      localStorage.setItem("curso-algebra-progreso-v1", JSON.stringify(p));
      location.reload();
      return ids.length;
    })()`);
    await sleep(1800);
    const progAfter = await cdp.eval(`(() => Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => ({
      theme: l.getAttribute("data-theme-progress-label"), text: l.textContent.trim(),
      bar: (document.querySelector('[data-theme-progress="' + l.getAttribute("data-theme-progress-label") + '"]') || { style: {} }).style.width || "0%",
    })))()`);
    const t1 = progAfter.find((x) => x.theme === "tema-1");
    check(prog === 5 && t1 && /^5 \/ 15 · 33%$/.test(t1.text) && t1.bar === "33%",
      `label+barra tras resolver 5/15 de tema-1 → "${t1 && t1.text}" barra=${t1 && t1.bar}`);
    await cdp.eval(`(localStorage.removeItem("curso-algebra-progreso-v1"), 1)`);

    // ---- timer: tick + clampeo de deadline absurdo (examen-1) ----
    console.log("\n== timer (examen-1): tick y clampeo");
    const setDead = async (val) => {
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
        source: `try { sessionStorage.setItem("curso-algebra-examen-examen-1", ${JSON.stringify(val)}); } catch (e) {}`,
      });
      await cdp.goto(fileUrl("examenes/examen-1.html"), 1600);
      await sleep(1200);
      return cdp.eval(`(() => {
        const t = document.querySelector("#exam-timer");
        return t ? t.textContent.trim() : null;
      })()`);
    };
    const tick0 = await setDead(String(Date.now() + 120 * 60000));
    await sleep(2100);
    const tick1 = await cdp.eval(`document.querySelector("#exam-timer").textContent.trim()`);
    const toSec = (s) => { const [h, m, x] = s.split(":").map(Number); return h * 3600 + m * 60 + x; };
    check(/^\d{2}:\d{2}:\d{2}$/.test(tick0 || "") && /^\d{2}:\d{2}:\d{2}$/.test(tick1 || "") && toSec(tick1) < toSec(tick0),
      `tick: ${tick0} → ${tick1} (decrece)`);
    const clamped = await setDead("999999999999999999999");
    check(/^01:59:5\d$/.test(clamped || ""),
      `deadline 1e21 clampeado → ${clamped} (esperado ≈01:59:5x)`);
    const deadRaw = await cdp.eval(`sessionStorage.getItem("curso-algebra-examen-examen-1")`);
    check(deadRaw && isFinite(+deadRaw) && +deadRaw < Date.now() + 4 * 3600 * 1000,
      `deadline reescrito finito en sessionStorage (${deadRaw})`);
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COLLECTOR });
  } finally {
    fs.writeFileSync(path.join(__dirname, "smoke-r5.json"), JSON.stringify(report, null, 1));
    await cdp.close();
    proc.kill();
  }
  console.log(`\nSMOKE R5: ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
