/* Aislamiento de la sección 4 de hostil-r3 (multi con campos de matriz) para
   discriminar flake de entorno vs. bloqueo del producto. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);
const SET_NATIVE = `const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; s.call`;

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  let fallos = 0;
  const ok = (c, m, e) => { console.log((c ? "  ✓ " : "  ✗ ") + m + (e ? "  [" + e + "]" : "")); if (!c) fallos++; };
  try {
    console.log("== 4a. X1-8 multi 2 vectores exacto");
    await cdp.goto(fileUrl("examenes/examen-1.html"), 800);
    await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem("curso-algebra-examen-examen-1", String(Date.now() + 3600000))`);
    await cdp.send("Page.reload", {});
    await sleep(1100);
    const x18ok = await cdp.eval(`(() => {
      const card = document.getElementById("X1-8");
      const spec = ${JSON.stringify({ f1: [["1/sqrt(2)"], ["1/sqrt(2)"], ["0"]], f2: [["1/sqrt(6)"], ["-1/sqrt(6)"], ["2/sqrt(6)"]] })};
      const cells = Array.from(card.querySelectorAll(".drill__fields input[type=text]"));
      const vals = [].concat(spec.f1.flat(), spec.f2.flat());
      vals.forEach((v, i) => { if (cells[i]) { ${SET_NATIVE}(cells[i], v); } });
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return {
        celdas: cells.length,
        fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 40),
        ok: card.querySelector(".drill__feedback").classList.contains("ok"),
      };
    })()`);
    ok(x18ok.ok && x18ok.celdas === 6, "X1-8 exacto → correcto", JSON.stringify(x18ok));

    console.log("== 4b. una celda alterada → rechazo");
    const x18bad = await cdp.eval(`(() => {
      const card = document.getElementById("X1-8");
      const cells = Array.from(card.querySelectorAll(".drill__fields input[type=text]"));
      ${SET_NATIVE}(cells[0], "0.7071");
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return { ok: card.querySelector(".drill__feedback").classList.contains("ok"), fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 30) };
    })()`);
    ok(!x18bad.ok, "X1-8 1 celda alterada → rechazado", JSON.stringify(x18bad));

    console.log("== 4c. multi incompleto → rechazo");
    const x18parcial = await cdp.eval(`(() => {
      const card = document.getElementById("X1-8");
      const cells = Array.from(card.querySelectorAll(".drill__fields input[type=text]"));
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      cells.forEach((c) => { set.call(c, ""); });
      set.call(cells[0], "1/sqrt(2)"); set.call(cells[1], "1/sqrt(2)"); set.call(cells[2], "0");
      Array.from(card.querySelectorAll("button")).find((b) => b.textContent.trim() === "Comprobar").click();
      return { ok: card.querySelector(".drill__feedback").classList.contains("ok") };
    })()`);
    ok(!x18parcial.ok, "X1-8 solo f1 → rechazado", JSON.stringify(x18parcial));

    console.log("== 4d. T2-E4 bool + matriz 3×3 fracciones");
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
      return { celdas: cells.length, ok: card.querySelector(".drill__feedback").classList.contains("ok"), fb: card.querySelector(".drill__feedback").textContent.trim().slice(0, 40) };
    })()`);
    ok(t2ok.ok && t2ok.celdas === 9, "T2-E4 exacto → correcto", JSON.stringify(t2ok));

    console.log("== 4e. X1-12 matriz 4×4 exacta");
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
    ok(x112.ok && x112.celdas === 16, "X1-12 exacta → correcto", JSON.stringify(x112));
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(fallos === 0 ? "\nsección 4: VERDE" : `\nsección 4: ${fallos} fallos`);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
