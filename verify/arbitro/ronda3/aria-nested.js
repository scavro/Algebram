const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  try {
    for (const p of ["temas/tema-2.html", "examenes/examen-1.html", "examenes/examen-2.html"]) {
      await cdp.goto("file://" + path.join(ROOT, p), 1300);
      await sleep(500);
      const r = await cdp.eval(`(() => {
        const out = [];
        document.querySelectorAll(".drill__fields .field").forEach((f) => {
          const radios = f.querySelectorAll("input[type=radio]");
          if (!radios.length) return;
          const lab = f.querySelector("label");
          out.push({
            campo: lab ? lab.textContent.trim().slice(0, 20) : "?",
            drill: (f.closest("article.drill")||{id:"?"}).id,
            radios: Array.from(radios).map((r) => ({
              aria: r.getAttribute("aria-label"),
              labelTexto: (r.closest("label") ? r.closest("label").textContent.trim() : "").slice(0, 14),
            })),
          });
        });
        return out;
      })()`);
      console.log("== " + p);
      r.forEach((x) => console.log("  ", JSON.stringify(x)));
    }
    // ¿markChoiceFeedback marca choice/bool anidados en multi?
    await cdp.goto("file://" + path.join(ROOT, "examenes/examen-1.html"), 1300);
    await sleep(600);
    const mark = await cdp.eval(`(() => {
      // busca una tarjeta multi con choice/bool anidado; si no hay, usa un choice de nivel superior y un multi cualquiera
      const cards = Array.from(document.querySelectorAll("article.drill"));
      const multi = cards.find((c) => c.querySelector(".drill__fields .choices"));
      if (!multi) return { hayMultiConChoice: false };
      const btn = Array.from(multi.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar");
      // elige radio y corrige
      const radio = multi.querySelector(".drill__fields .choices input[type=radio]");
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
      btn.click();
      const labels = Array.from(multi.querySelectorAll(".drill__fields .choice")).map((l) => l.className);
      return { hayMultiConChoice: true, id: multi.id, labelsTrasCorregir: labels };
    })()`);
    console.log("markChoiceFeedback en multi anidado:", JSON.stringify(mark));
  } finally {
    await cdp.close();
    proc.kill();
  }
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
