/* ÁRBITRO R10 · smoke de las 10 páginas (protocolo del árbitro):
   recuento de campos de respuesta, KaTeX sin errores, nav, progreso, timer,
   tracks de vídeo CON SUS SUBTÍTULOS + errores de runtime + tiempo de carga.

   El número de campos y el de subtítulos ya no están cableados: se calculan
   desde los ficheros de datos y desde el HTML, de modo que la comprobación
   siga siendo válida cuando se añada o se retire contenido. */
const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");

const ROOT = path.join(__dirname, "..", "..", "..");
const BASE_URL = process.env.CURSO_BASE_URL || "";
const pageUrl = (p) => BASE_URL
  ? new URL(p, BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/").href
  : "file://" + path.join(ROOT, p);

/* ---- recuento esperado de campos, leído de los datos ----
   Se replica la regla de app.js: un "multi" suma los campos de sus
   apartados, una matriz/vector da rows×cols, una "choice" da sus opciones,
   un "bool" da 2 y el resto, 1. */
function nInputs(spec) {
  const t = spec.type;
  if (t === "multi") return Object.values(spec.fields || {}).reduce((a, f) => a + nInputs(f), 0);
  if (t === "matrix" || t === "vector") {
    const rows = spec.rows || (spec.expected && spec.expected.length) || 2;
    const cols = spec.cols || (spec.expected && spec.expected[0] && spec.expected[0].length) || 2;
    return rows * cols;
  }
  if (t === "choice") return (spec.choices || []).length;
  if (t === "bool") return 2;
  return 1; // expr, number, text, exprset
}

function camposEsperados() {
  let total = 0;
  const dir = path.join(ROOT, "assets", "data");
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".js")) continue;
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    const g = global;
    g.window = g.window || {};
    delete require.cache[require.resolve(path.join(dir, f))];
    require(path.join(dir, f));
    const d = (g.window.CURSO_DATA || {})[f.replace(/\.js$/, "")];
    if (!d) continue;
    const q = (d.exam && d.exam.questions) || d.drills || [];
    total += q.reduce((a, x) => a + nInputs(x.answer || {}), 0);
  }
  return total;
}

/* ---- número de <track> de subtítulos declarado en el HTML ---- */
function subtitulosEsperados() {
  let total = 0;
  for (const f of fs.readdirSync(path.join(ROOT, "temas"))) {
    if (!f.endsWith(".html")) continue;
    const src = fs.readFileSync(path.join(ROOT, "temas", f), "utf8");
    total += (src.match(/<track\b/gi) || []).length;
  }
  return total;
}

const CAMPOS_ESPERADOS = camposEsperados();
const SUBS_ESPERADOS = subtitulosEsperados();

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
  let campos = 0;
  let subsVistos = 0;
  try {
    for (const p of PAGES) {
      console.log(`\n== ${p}`);
      const t0 = Date.now();
      await cdp.goto(pageUrl(p), 1500);
      await sleep(500);
      // Tiempo de carga real de la página (evento load), medido por el
      // navegador. El wall-clock del script incluye el arranque en frío de
      // Chrome, que no depende del sitio (unos 2 s en este entorno).
      const nav = await cdp.eval(`(() => {
        const n = performance.getEntriesByType("navigation")[0];
        return n ? { load: Math.round(n.loadEventEnd - n.startTime), dcl: Math.round(n.domContentLoadedEventEnd - n.startTime) } : null;
      })()`);
      const loadMs = nav ? nav.load : Date.now() - t0;
      const r = await cdp.eval(`(() => {
        const out = {};
        out.errs = window.__errs || [];
        const drills = Array.from(document.querySelectorAll("article.drill"));
        out.drills = drills.length;
        out.campos = 0;
        out.sinCampo = [];
        drills.forEach((d) => {
          const box = d.querySelector(".drill__answer");
          const inputs = box ? box.querySelectorAll("input, select, textarea") : [];
          out.campos += inputs.length;
          if (!inputs.length) out.sinCampo.push(d.id || "?");
        });
        out.katexErrors = document.querySelectorAll(".katex-error").length;
        out.katexSpans = document.querySelectorAll(".katex").length;
        out.nav = !!document.querySelector(".nav");
        out.navLabel = (function () { const n = document.querySelector("nav.nav"); return n ? n.getAttribute("aria-label") : null; })();
        out.navLinks = document.querySelectorAll(".nav__links a").length;
        out.progressBars = document.querySelectorAll("[data-theme-progress]").length;
        out.progressLabels = Array.from(document.querySelectorAll("[data-theme-progress-label]")).map((l) => ({
          theme: l.getAttribute("data-theme-progress-label"), text: l.textContent.trim(),
        }));
        out.readingBar = !!document.querySelector(".progress-bar__fill");
        const t = document.querySelector("#exam-timer");
        out.timer = t ? t.textContent.trim() : null;
        out.videos = Array.from(document.querySelectorAll("video")).map((v) => ({
          src: (v.getAttribute("src") || "").split("/").pop(),
          tracks: Array.from(v.querySelectorAll("track")).map((tr) => ({
            kind: tr.getAttribute("kind"),
            src: tr.getAttribute("src") || "",
            vtt: tr.getAttribute("data-vtt") || "",
            readyState: tr.readyState,
            cues: tr.track ? tr.track.cues.length : 0,
            mode: tr.track ? tr.track.mode : "",
          })),
        }));
        out.mediaError = Array.from(document.querySelectorAll("video")).filter((v) => v.error).length;
        return out;
      })()`);
      r.loadMs = loadMs;
      report[p] = r;
      campos += r.campos;

      check(loadMs < 2000, `carga + render listo en ${loadMs} ms (<2000 ms, evento load)`);
      check(r.errs.length === 0,
        `sin errores de JS (${r.errs.length}${r.errs.length ? " · recurso: " + r.errs.join(" | ") : ""})`);
      check(r.katexErrors === 0, `KaTeX: ${r.katexSpans} fórmulas renderizadas · ${r.katexErrors} .katex-error`);
      check(r.nav && r.navLinks >= 4, `nav presente (${r.navLinks} links · aria-label=${JSON.stringify(r.navLabel)})`);
      if (r.drills) check(r.sinCampo.length === 0, `campos de respuesta: ${r.drills} drills · ${r.campos} inputs · sin campo: ${r.sinCampo.length ? r.sinCampo.join(",") : "0"}`);
      else console.log(`  · 0 drills (página sin ejercicios)`);
      if (r.videos.length) {
        // Cada vídeo debe tener sus subtítulos cargados de verdad: cues > 0 y
        // la pista en modo visible. Bajo file:// el <track> con src="...vtt"
        // se queda en readyState 3 con 0 cues; por eso van incrustados como
        // URI data: (scripts/build_subtitulos.py).
        const sinTrack = r.videos.filter((v) => !v.tracks.some((t) => t.kind === "captions" && t.src));
        const sinCues = [];
        const noVisible = [];
        for (const v of r.videos) for (const t of v.tracks) {
          if (!t.cues) sinCues.push(v.src + "/" + (t.vtt || "?"));
          else if (t.mode !== "showing") noVisible.push(v.src + "/" + (t.vtt || "?") + " (modo " + t.mode + ")");
        }
        const sinDataUri = r.videos.flatMap((v) =>
          v.tracks.filter((t) => !t.src.startsWith("data:text/vtt")).map((t) => v.src + "/" + (t.vtt || "?"))
        );
        check(sinTrack.length === 0 && sinCues.length === 0 && noVisible.length === 0 && sinDataUri.length === 0 && r.mediaError === 0,
          `tracks de vídeo: ${r.videos.length} vídeos · subtítulos cargados (${r.videos.reduce((a, v) => a + v.tracks.length, 0)} pistas)` +
          `${sinCues.length ? " · SIN CUES: " + sinCues.join(", ") : ""}` +
          `${noVisible.length ? " · NO VISIBLE: " + noVisible.join(", ") : ""}` +
          `${sinDataUri.length ? " · NO INCRUSTADO: " + sinDataUri.join(", ") : ""}` +
          ` · mediaError=${r.mediaError}`);
        subsVistos += r.videos.reduce((a, v) => a + v.tracks.filter((t) => t.cues > 0).length, 0);
      }
      if (r.progressLabels.length) {
        const malas = r.progressLabels.filter((l) => !/^\d+ \/ \d+ · \d+%$/.test(l.text));
        check(r.progressBars === r.progressLabels.length && malas.length === 0,
          `progreso estático: ${r.progressBars} barras / ${r.progressLabels.length} labels · formato OK`);
      }
      if (r.readingBar !== undefined) check(r.readingBar, "barra de lectura (.progress-bar__fill) presente");
    }
    check(campos === CAMPOS_ESPERADOS,
      `TOTAL campos de respuesta en 10 páginas: ${campos} (esperado ${CAMPOS_ESPERADOS}, leído de assets/data)`);
    check(subsVistos === SUBS_ESPERADOS,
      `TOTAL pistas de subtítulo cargadas: ${subsVistos} (esperado ${SUBS_ESPERADOS}, leído del HTML)`);

    // ---- progreso funcional (index): localStorage → labels y barras ----
    console.log("\n== progreso funcional (index)");
    await cdp.goto(pageUrl("index.html"), 1500);
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
      await cdp.goto(pageUrl("examenes/examen-1.html"), 1600);
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
    const output = process.env.SMOKE_OUTPUT || path.join(__dirname, "smoke-r10.json");
    fs.writeFileSync(output, JSON.stringify(report, null, 1));
    await cdp.close();
    proc.kill();
  }
  console.log(`\nSMOKE R10: ${fallos} fallos · ${campos} campos · ${subsVistos} subtítulos cargados`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
