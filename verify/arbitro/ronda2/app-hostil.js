/* Ronda 2 — batería hostil sobre app.js en el navegador real:
   localStorage sucio, sessionStorage corrupto, multi incompleto, entradas extremas,
   XSS, aislamiento examen/progreso, doble clic, reveal en exámenes. */
const path = require("path");
const fs = require("fs");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);

let fallos = 0;
function ok(cond, nombre, extra) {
  if (!cond) fallos++;
  console.log(`${cond ? "✔" : "✘"} ${nombre}${extra ? " :: " + extra : ""}`);
}

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    /* ---- 1. localStorage sucio ---- */
    for (const basura of ["no-es-json", "[1,2,3]", "null", "42", '{"T1-N1":"solved","X1-8":"failed"}', '{"a":', "true", '"hola"', "undefined", ""]) {
      try {
        await cdp.goto(fileUrl("index.html"), 900);
        await cdp.eval(`localStorage.setItem("curso-algebra-progreso-v1", ${JSON.stringify(basura)})`);
        await cdp.goto(fileUrl("temas/tema-1.html"), 1100);
        const st = await cdp.eval(`(() => ({
          drills: document.querySelectorAll("article.drill").length,
          katexErr: document.querySelectorAll(".katex-error").length,
          mindmap: document.querySelectorAll("[data-mindmap] svg").length,
          summary: document.querySelectorAll(".summary__item").length,
        }))()`);
        ok(st.drills === 15 && st.katexErr === 0, `localStorage=${JSON.stringify(basura)} → tema-1 sano`, `drills=${st.drills} mapa=${st.mindmap} resumen=${st.summary}`);
        if (st.drills === 15) {
          const r = await cdp.eval(`(() => {
            const card = document.querySelector("article.drill");
            const inp = card.querySelector("input[type=text]");
            if (inp) { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; s.call(inp, "1"); inp.dispatchEvent(new Event("input", { bubbles: true })); }
            Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
            return card.querySelector(".drill__feedback").textContent.trim().slice(0, 25);
          })()`);
          ok(typeof r === "string" && r.length > 0, `  comprobar con LS sucio responde`, r);
        }
      } catch (e) {
        ok(false, `localStorage=${JSON.stringify(basura)} → excepción`, e.message.slice(0, 80));
      }
    }

    /* ---- 2. sessionStorage corrupto ---- */
    for (const basura of ["abc", "-1", "0", "123abc", "NaN", "1e30", "null", "{}", "  1791931922893  ", "[]", "Infinity"]) {
      try {
        await cdp.goto(fileUrl("examenes/examen-1.html"), 800);
        await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem("curso-algebra-examen-examen-1", ${JSON.stringify(basura)})`);
        await cdp.send("Page.reload", {});
        await sleep(1200);
        const st = await cdp.eval(`(() => {
          const t = (document.querySelector("#exam-timer") || {}).textContent || "";
          const inputs = Array.from(document.querySelectorAll(".drill__answer input"));
          return {
            timer: t,
            formato: /^\\d{2}:\\d{2}:\\d{2}$/.test(t),
            drills: document.querySelectorAll("article.drill").length,
            bloqueados: inputs.filter((i) => i.disabled).length,
            totalInputs: inputs.length,
            nota: (document.querySelector("#exam-grade") || {}).textContent,
          };
        })()`);
        const sano = st.drills === 12 && (st.formato || st.timer === "00:00:00" || st.timer === "--:--:--");
        ok(sano, `sessionStorage=${JSON.stringify(basura)} → examen sano`, `timer=${st.timer} drills=${st.drills} bloqueados=${st.bloqueados}/${st.totalInputs} nota=${st.nota}`);
        if (st.timer === "00:00:00") ok(st.bloqueados === st.totalInputs, `  a 0s todo bloqueado`, `${st.bloqueados}/${st.totalInputs}`);
      } catch (e) {
        ok(false, `sessionStorage=${JSON.stringify(basura)} → excepción`, e.message.slice(0, 80));
      }
    }

    /* ---- 3. multi incompleto en UI ---- */
    await cdp.goto(fileUrl("examenes/examen-1.html"), 1100);
    await cdp.eval(`sessionStorage.clear()`);
    await cdp.send("Page.reload", {});
    await sleep(1200);
    const multi = await cdp.eval(`(() => {
      const cards = Array.from(document.querySelectorAll("article.drill"));
      const card = cards.find((c) => c.querySelectorAll(".drill__fields input[type=text]").length >= 2);
      if (!card) return { found: false };
      const inputs = Array.from(card.querySelectorAll(".drill__fields input[type=text]"));
      const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      s.call(inputs[0], "999"); inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return { found: true, id: card.id, inputs: inputs.length, fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 60), ok: card.querySelector(".drill__feedback").classList.contains("ok") };
    })()`);
    ok(multi.found && !multi.ok, `multi incompleto rechazado (${multi.id})`, multi.fb);

    /* ---- 4. entradas extremas + XSS ---- */
    await cdp.goto(fileUrl("temas/tema-1.html"), 1100);
    let alertado = false;
    await cdp.eval(`window.alert = () => { window.__alert = true; }; window.__alert = false;`, false);
    const xss = await cdp.eval(`(() => {
      const card = document.querySelector("article.drill");
      const inp = card.querySelector("input[type=text]");
      const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      const payload = "<img src=x onerror='window.__alert=true'><script>window.__alert=true<\\/script>";
      s.call(inp, payload + "x".repeat(10000));
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      const fb = card.querySelector(".drill__feedback");
      return {
        alert: window.__alert,
        hayImg: !!fb.querySelector("img"),
        hayScript: !!fb.querySelector("script"),
        textLen: fb.textContent.length,
        drills: document.querySelectorAll("article.drill").length,
      };
    })()`);
    ok(!xss.alert && !xss.hayImg && !xss.hayScript && xss.drills === 15, "payload XSS + 10k chars → sin ejecución, sin DOM inyectado", JSON.stringify(xss));

    /* ---- 5. examen no contamina localStorage (m5) ---- */
    await cdp.goto(fileUrl("examenes/examen-1.html"), 900);
    await cdp.eval(`localStorage.clear(); sessionStorage.clear()`);
    await cdp.send("Page.reload", {});
    await sleep(1200);
    await cdp.eval(`(() => {
      const card = document.querySelector("article.drill");
      const inp = card.querySelector("input[type=text]");
      if (inp) { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; s.call(inp, "zzz"); inp.dispatchEvent(new Event("input", { bubbles: true })); }
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Corregir examen").click();
    })()`);
    await sleep(300);
    const ls = await cdp.eval(`localStorage.getItem("curso-algebra-progreso-v1")`);
    ok(ls === null, "examen no escribe en curso-algebra-progreso-v1", String(ls));

    /* ---- 6. doble/triple clic en Comprobar ---- */
    const dbl = await cdp.eval(`(() => {
      const card = document.querySelector("article.drill");
      const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      btn.click(); btn.click(); btn.click();
      return { fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 20), ok: true };
    })()`);
    ok(dbl.ok, "triple clic Comprobar sin crash", dbl.fb);

    /* ---- 7. Pista / Solución ---- */
    const hints = await cdp.goto(fileUrl("temas/tema-1.html"), 1100).then(async () => {
      await sleep(400);
      return cdp.eval(`(() => {
        const card = Array.from(document.querySelectorAll("article.drill")).find((c) => c.querySelector(".drill__hint"));
        if (!card) return { found: false };
        const btn = Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Pista");
        btn.click();
        const hint = card.querySelector(".drill__hint");
        return { found: true, visible: hint.classList.contains("is-visible"), disabled: btn.disabled };
      })()`);
    });
    ok(hints.found && hints.visible && hints.disabled, "Pista se revela y desactiva botón", JSON.stringify(hints));

    /* ---- 8. reveal en exámenes (C2 allí) ---- */
    await cdp.goto(fileUrl("examenes/examen-2.html"), 1300);
    await sleep(500);
    await cdp.eval(`(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,70)); } })()`, true);
    await sleep(1100);
    const rev = await cdp.eval(`(() => {
      const ds = Array.from(document.querySelectorAll("article.drill"));
      return { total: ds.length, sinRevelar: ds.filter((d) => !d.classList.contains("is-in")).map((d) => d.id) };
    })()`);
    ok(rev.sinRevelar.length === 0, "reveal en examen-2 tras scroll", JSON.stringify(rev));

    /* ---- 9. teclado: los inputs son enfocables con Tab ---- */
    const kb = await cdp.eval(`(() => {
      const inp = document.querySelector(".drill__answer input[type=text], .drill__answer input[type=radio]");
      if (!inp) return { found: false };
      inp.focus();
      return { found: true, focus: document.activeElement === inp };
    })()`);
    ok(kb.found && kb.focus, "inputs enfocables por teclado", JSON.stringify(kb));

    /* ---- 10. temporizador nunca negativo ni NaN tras 0 ---- */
    await cdp.goto(fileUrl("examenes/examen-3.html"), 900);
    await cdp.eval(`sessionStorage.setItem("curso-algebra-examen-" + (window.CURSO_DATA["examen-3"]||{}).id, String(Date.now() - 60000));`);
    await cdp.send("Page.reload", {});
    await sleep(2500);
    const neg = await cdp.eval(`document.querySelector("#exam-timer").textContent`);
    ok(/^00:00:00$/.test(neg), "temporizador estable en 00:00:00 tras agotarse", neg);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(`\nResumen app-hostil: ${fallos} fallos`);
  process.exit(fallos ? 1 : 0);
})().catch((e) => {
  console.error("FALLO:", e);
  process.exit(1);
});
