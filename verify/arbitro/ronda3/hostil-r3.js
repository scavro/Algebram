/* Ronda 3 — batería hostil NUEVA:
   (1) localStorage corrupto de otras formas  (2) sessionStorage manipulado (extensión)
   (3) examen con F5 justo al acabar           (4) multi con campos de matriz
   (5) viewport 320 px                         (6) modo landscape
   Además: progreso cross-page (tema → índice). */
const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

let fallos = 0, n = 0;
const T0 = Date.now();
function ok(cond, nombre, extra) {
  n++;
  if (!cond) fallos++;
  console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s] ${cond ? "✔" : "✘"} ${nombre}${extra ? " :: " + extra : ""}`);
}

const SET_NATIVE = `((inp, v) => {
  const proto = inp.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const s = Object.getOwnPropertyDescriptor(proto, "value").set;
  s.call(inp, v);
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  inp.dispatchEvent(new Event("change", { bubbles: true }));
})`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    /* ================= 1. localStorage: corruptos NUEVOS ================= */
    const basuras = [
      ["array vacio", "[]"],
      ["numero 5", "5"],
      ["string JSON 5", '"5"'],
      ["truncado a media palabra", '{"T1-N1":"solv'],
      ["array truncado", "[1,2"],
      ["proto pollution", '{"__proto__":{"polluted":true}}'],
      ["valores no-string", '{"T1-N1":null,"X1-8":123,"T1-N2":{}}'],
      ["BOM + objeto", '\ufeff{"T1-N1":"solved"}'],
      ["solo espacios", "   "],
      ["string que parece objeto", '"{\\"a\\":1}"'],
      ["gigante 200k", "x".repeat(200000)],
      ["null byte al final", '{"T1-N1":"solved"}\u0000'],
      ["true/false anidados", '{"T1-N1":true,"T1-N2":false}'],
      ["NaN literal", "NaN"],
    ];
    for (const [nombre, basura] of basuras) {
      try {
        await cdp.goto(fileUrl("index.html"), 800);
        await cdp.eval(`localStorage.setItem("curso-algebra-progreso-v1", ${JSON.stringify(basura)})`);
        await cdp.goto(fileUrl("temas/tema-1.html"), 1100);
        const st = await cdp.eval(`(() => ({
          drills: document.querySelectorAll("article.drill").length,
          katexErr: document.querySelectorAll(".katex-error").length,
          katex: document.querySelectorAll(".katex").length,
          ocultas: Array.from(document.querySelectorAll(".reveal")).filter((e) => getComputedStyle(e).opacity === "0").length,
          totalReveal: document.querySelectorAll(".reveal").length,
        }))()`);
        ok(st.drills === 15 && st.katexErr === 0 && st.katex > 100, `LS «${nombre}» → tema-1 sano`, `drills=${st.drills} katex=${st.katex} ocultas=${st.ocultas}/${st.totalReveal}`);
        const r = await cdp.eval(`(() => {
          const card = document.querySelector("article.drill");
          const inp = card.querySelector("input[type=text]");
          if (inp) { ${SET_NATIVE}(inp, "1"); }
          Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
          return card.querySelector(".drill__feedback").textContent.trim().slice(0, 20);
        })()`);
        ok(typeof r === "string" && r.length > 0, `  Comprobar responde con LS «${nombre}»`, r);
      } catch (e) {
        ok(false, `LS «${nombre}» → excepción`, e.message.slice(0, 90));
      }
    }
    // progreso válido debe respetarse pese a campos raros
    await cdp.goto(fileUrl("index.html"), 700);
    await cdp.eval(`localStorage.setItem("curso-algebra-progreso-v1", '{"T1-N1":"solved","T1-N2":"revealed","T1-N3":123,"T1-N4":null}')`);
    await cdp.goto(fileUrl("temas/tema-1.html"), 1100);
    const marcas = await cdp.eval(`(() => {
      const a = document.getElementById("T1-N1");
      const b = document.getElementById("T1-N2");
      const c = document.getElementById("T1-N3");
      return {
        n1: a ? a.className.includes("is-correct") : "no",
        n2: b ? b.className : "no",
        n3: c ? c.className.includes("is-correct") : "no",
      };
    })()`);
    ok(marcas.n1 === true && marcas.n3 === false, "progreso válido se aplica; valores no-string se ignoran", JSON.stringify(marcas));
    // cross-page: resolver T1-N1 → índice 1/15
    await cdp.eval(`(() => {
      const card = document.getElementById("T1-N1");
      const inps = Array.from(card.querySelectorAll("input[type=text]"));
      return inps.length;
    })()`);
    await cdp.eval(`(() => {
      const card = document.getElementById("T1-N1");
      const spec = (window.CURSO_DATA["tema-1"].drills.find((d) => d.id === "T1-N1") || {}).answer;
      const val = spec && spec.expected != null ? String(spec.expected) : "1";
      const inp = card.querySelector("input[type=text]");
      if (inp) { ${SET_NATIVE}(inp, val); }
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
    })()`);
    await sleep(300);
    await cdp.goto(fileUrl("index.html"), 1100);
    const idx = await cdp.eval(`(() => {
      const l = document.querySelector('[data-theme-progress-label="tema-1"]');
      const bar = document.querySelector('[data-theme-progress="tema-1"]');
      return { label: l ? l.textContent.trim() : null, width: bar ? bar.style.width : null };
    })()`);
    ok(/^1 \/ 15/.test(idx.label) && idx.width === "6%", "cross-page: resolver T1-N1 actualiza índice 1/15", JSON.stringify(idx));

    /* ================= 2. sessionStorage: extensión hostil ================= */
    const ss = [
      ["hex 0x10", "0x10"],
      ["1e-3", "1e-3"],
      ["solo espacios", "   "],
      ["boolean true", "true"],
      ["string JSON 123", '"123"'],
      ["objeto deadline", '{"deadline":123}'],
      ["menos cero", "-0"],
      ["mas 5000", "+5000"],
      ["coma decimal", "1,5"],
      ["gigante 1e21", "999999999999999999999"],
      ["con saltos de linea", "\n123\n"],
      ["doble deadline", "123 456"],
    ];
    for (const [nombre, basura] of ss) {
      try {
        await cdp.goto(fileUrl("examenes/examen-1.html"), 800);
        await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem("curso-algebra-examen-examen-1", ${JSON.stringify(basura)})`);
        await cdp.send("Page.reload", {});
        await sleep(1100);
        const st = await cdp.eval(`(() => {
          const t = (document.querySelector("#exam-timer") || {}).textContent || "";
          const inputs = Array.from(document.querySelectorAll(".drill__answer input"));
          return {
            timer: t,
            formato: /^\\d{2}:\\d{2}:\\d{2}$/.test(t),
            drills: document.querySelectorAll("article.drill").length,
            bloqueados: inputs.filter((i) => i.disabled).length,
            totalInputs: inputs.length,
          };
        })()`);
        const sano = st.drills === 12 && (st.formato || st.timer === "00:00:00");
        ok(sano, `SS «${nombre}» → examen sano`, `timer=${st.timer} drills=${st.drills} bloq=${st.bloqueados}/${st.totalInputs}`);
        if (st.timer === "00:00:00") ok(st.bloqueados === st.totalInputs, `  «${nombre}» a 0s todo bloqueado`, `${st.bloqueados}/${st.totalInputs}`);
      } catch (e) {
        ok(false, `SS «${nombre}» → excepción`, e.message.slice(0, 90));
      }
    }

    /* ================= 3. F5 justo al acabar ================= */
    // 3a. F5 cuando quedan <2 s: el tiempo NO se regala
    await cdp.goto(fileUrl("examenes/examen-1.html"), 800);
    await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem("curso-algebra-examen-examen-1", String(Date.now() + 2500))`);
    await cdp.send("Page.reload", {});
    await sleep(900);
    const tAntes = await cdp.eval(`document.querySelector("#exam-timer").textContent`);
    await cdp.send("Page.reload", {}); // F5 a ~1.5 s del final
    await sleep(700);
    const tTrasF5 = await cdp.eval(`document.querySelector("#exam-timer").textContent`);
    await sleep(2500);
    const tCero = await cdp.eval(`(() => {
      const inputs = Array.from(document.querySelectorAll(".drill__answer input"));
      return {
        timer: document.querySelector("#exam-timer").textContent,
        bloq: inputs.filter((i) => i.disabled).length,
        total: inputs.length,
        nota: document.querySelector("#exam-grade").textContent,
        btnOff: Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen").disabled,
      };
    })()`);
    const seg = (t) => { const p = String(t).split(":").map(Number); return p[0] * 3600 + p[1] * 60 + p[2]; };
    ok(seg(tAntes) <= 3 && seg(tTrasF5) < seg(tAntes) && seg(tTrasF5) >= 0, "F5 con <2 s restantes: no regala tiempo", `antes=${tAntes} trasF5=${tTrasF5}`);
    ok(tCero.timer === "00:00:00" && tCero.bloq === tCero.total && tCero.btnOff, "llega a 0: bloqueo total + auto-corrección", JSON.stringify(tCero));
    // 3b. F5 JUSTO al acabar (00:00:00): no reinicia
    await cdp.send("Page.reload", {});
    await sleep(1200);
    const tPost = await cdp.eval(`(() => {
      const inputs = Array.from(document.querySelectorAll(".drill__answer input"));
      return {
        timer: document.querySelector("#exam-timer").textContent,
        bloq: inputs.filter((i) => i.disabled).length,
        total: inputs.length,
        nota: document.querySelector("#exam-grade").textContent,
        deadline: sessionStorage.getItem("curso-algebra-examen-examen-1"),
      };
    })()`);
    ok(tPost.timer === "00:00:00" && tPost.bloq === tPost.total && tPost.nota !== "—", "F5 en 00:00:00: estado bloqueado persiste (sin reinicio)", JSON.stringify(tPost));
    // 3c. carrera: responder + F5 inmediato al agotarse
    await cdp.goto(fileUrl("examenes/examen-1.html"), 800);
    await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem("curso-algebra-examen-examen-1", String(Date.now() + 1200))`);
    await cdp.send("Page.reload", {});
    await sleep(600);
    const carrera = await cdp.eval(`(() => {
      const card = document.querySelector("article.drill");
      const inp = card.querySelector("input[type=text]");
      if (inp) { ${SET_NATIVE}(inp, "1"); }
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return true;
    })()`);
    await sleep(1400);
    await cdp.send("Page.reload", {});
    await sleep(1200);
    const trasCarrera = await cdp.eval(`(() => ({
      timer: document.querySelector("#exam-timer").textContent,
      drills: document.querySelectorAll("article.drill").length,
      nota: document.querySelector("#exam-grade").textContent,
    }))()`);
    ok(carrera && trasCarrera.drills === 12 && trasCarrera.timer === "00:00:00", "carrera responder+expirar+F5: sin crash, bloqueado", JSON.stringify(trasCarrera));

    /* ================= 4. multi con campos de matriz ================= */
    // 4a. X1-8 (multi: 2 vectores 3×1) respuesta exacta
    await cdp.goto(fileUrl("examenes/examen-1.html"), 800);
    await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem("curso-algebra-examen-examen-1", String(Date.now() + 3600000))`);
    await cdp.send("Page.reload", {});
    await sleep(1100);
    const x18ok = await cdp.eval(`(() => {
      const card = document.getElementById("X1-8");
      const spec = ${JSON.stringify({ f1: [["1/sqrt(2)"], ["1/sqrt(2)"], ["0"]], f2: [["1/sqrt(6)"], ["-1/sqrt(6)"], ["2/sqrt(6)"]] })};
      const fields = card.querySelectorAll(".drill__fields .field");
      const cells = Array.from(card.querySelectorAll(".drill__fields input[type=text]"));
      const vals = [].concat(spec.f1.flat(), spec.f2.flat());
      vals.forEach((v, i) => { if (cells[i]) { ${SET_NATIVE}(cells[i], v); } });
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return {
        campos: fields.length,
        celdas: cells.length,
        fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 40),
        ok: card.querySelector(".drill__feedback").classList.contains("ok"),
      };
    })()`);
    ok(x18ok.ok && x18ok.celdas === 6, "X1-8 multi+2 vectores: exacto → correcto", JSON.stringify(x18ok));
    // 4b. una celda alterada → rechazo
    const x18bad = await cdp.eval(`(() => {
      const card = document.getElementById("X1-8");
      const cells = Array.from(card.querySelectorAll(".drill__fields input[type=text]"));
      ${SET_NATIVE}(cells[0], "0.7071");
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return { ok: card.querySelector(".drill__feedback").classList.contains("ok"), fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 30) };
    })()`);
    ok(!x18bad.ok, "X1-8 con 1 celda alterada → rechazado", JSON.stringify(x18bad));
    // 4c. multi incompleto (solo f1)
    const x18parcial = await cdp.eval(`(() => {
      const card = document.getElementById("X1-8");
      const cells = Array.from(card.querySelectorAll(".drill__fields input[type=text]"));
      cells.forEach((c) => { ${SET_NATIVE}(c, ""); });
      ${SET_NATIVE}(cells[0], "1/sqrt(2)"); ${SET_NATIVE}(cells[1], "1/sqrt(2)"); ${SET_NATIVE}(cells[2], "0");
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return { ok: card.querySelector(".drill__feedback").classList.contains("ok") };
    })()`);
    ok(!x18parcial.ok, "X1-8 multi incompleto (solo f1) → rechazado", JSON.stringify(x18parcial));
    // 4d. T2-E4 (multi bool + matriz 3×3 con fracciones) exacto
    await cdp.goto(fileUrl("temas/tema-2.html"), 900);
    await cdp.eval(`localStorage.clear()`);
    await cdp.send("Page.reload", {});
    await sleep(1100);
    const t2ok = await cdp.eval(`(() => {
      const card = document.getElementById("T2-E4");
      const radios = Array.from(card.querySelectorAll("input[type=radio]"));
      const t = radios.find((r) => r.value === "true");
      t.checked = true; t.dispatchEvent(new Event("change", { bubbles: true }));
      const vals = ["2/7","6/7","-3/7","3/7","2/7","6/7","6/7","-3/7","-2/7"];
      const cells = Array.from(card.querySelectorAll(".drill__fields input[type=text]"));
      vals.forEach((v, i) => { if (cells[i]) { ${SET_NATIVE}(cells[i], v); } });
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return {
        celdas: cells.length,
        ok: card.querySelector(".drill__feedback").classList.contains("ok"),
        fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 40),
      };
    })()`);
    ok(t2ok.ok && t2ok.celdas === 9, "T2-E4 multi bool+matriz 3×3 fracciones → correcto", JSON.stringify(t2ok));
    // 4e. matriz X1-12 4×4 con celda fraccionaria y negativa
    await cdp.goto(fileUrl("examenes/examen-1.html"), 900);
    await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem("curso-algebra-examen-examen-1", String(Date.now() + 3600000))`);
    await cdp.send("Page.reload", {});
    await sleep(1100);
    const x112 = await cdp.eval(`(() => {
      const card = document.getElementById("X1-12");
      const vals = ["1","0","-1","-2","0","1","-3","-4","0","0","1","0","0","0","0","1"];
      const cells = Array.from(card.querySelectorAll(".drill__fields input[type=text], .matrix-input input"));
      vals.forEach((v, i) => { if (cells[i]) { ${SET_NATIVE}(cells[i], v); } });
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return { celdas: cells.length, ok: card.querySelector(".drill__feedback").classList.contains("ok"), fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 30) };
    })()`);
    ok(x112.ok && x112.celdas === 16, "X1-12 matriz 4×4 exacta → correcto", JSON.stringify(x112));

    /* ================= 5. viewport 320 px ================= */
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
            if (cs.position !== "fixed" && cs.position !== "absolute" && !el.closest(".hero__cloud, .theme-head__ghost, .ghost-num, .progress-bar")) {
              desborde.push((el.className || el.tagName).toString().slice(0, 40) + " r=" + Math.round(r.right));
            }
          }
        });
        return {
          docOverflow: de.scrollWidth > window.innerWidth,
          scrollW: de.scrollWidth,
          innerW: window.innerWidth,
          desborde: desborde.slice(0, 8),
          nav: !!document.querySelector(".nav__toggle"),
          timer: (document.querySelector("#exam-timer") || {}).textContent || null,
        };
      })()`);
      ok(!v.docOverflow && v.desborde.length === 0, `320px ${p}: sin overflow`, `scrollW=${v.scrollW}/${v.innerW} desborde=${JSON.stringify(v.desborde)}`);
    }
    // matriz a 320
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
    await cdp.send("Page.captureScreenshot", { format: "png" }).then((s) => {
      fs.writeFileSync(path.join(__dirname, "capturas", "R3-X1-12-320.png"), Buffer.from(s.data, "base64"));
    });
    // nav toggle a 320
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

    /* ================= 6. modo landscape ================= */
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
            scrollW: de.scrollWidth,
            innerW: window.innerWidth,
            heroH: hr ? Math.round(hr.height) : null,
            timerVisible: timer ? (timer.getBoundingClientRect().width > 0 && getComputedStyle(timer).visibility !== "hidden") : null,
            toolbarTop: (document.querySelector(".exam-toolbar") || {}).getBoundingClientRect ? Math.round(document.querySelector(".exam-toolbar").getBoundingClientRect().top) : null,
          };
        })()`);
        ok(!v.docOverflow, `landscape ${w}×${h} ${p}: sin overflow`, `scrollW=${v.scrollW}/${v.innerW} heroH=${v.heroH} timer=${v.timerVisible}`);
      }
    }
    // reveal + interacción en landscape
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 740, height: 360, deviceScaleFactor: 1, mobile: true });
    await cdp.goto(fileUrl("temas/tema-1.html"), 1200);
    await sleep(500);
    await cdp.eval(`(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,60)); } })()`, true);
    await sleep(900);
    const revLand = await cdp.eval(`(() => {
      const ds = Array.from(document.querySelectorAll("article.drill"));
      return { total: ds.length, sinRevelar: ds.filter((d) => !d.classList.contains("is-in")).length };
    })()`);
    ok(revLand.sinRevelar === 0, "landscape 740×360: reveal completo tras scroll", JSON.stringify(revLand));
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nResumen hostil-r3: ${n} comprobaciones, ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => {
  console.error("FALLO:", e);
  process.exit(1);
});
