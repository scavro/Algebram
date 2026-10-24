/* Ronda 4 — N11: el temporizador debe clampear deadlines absurdos al plazo
   nominal. Repro R3: sessionStorage "999999999999999999999" → timer
   277777777280012:37:20 (21 chars). Debe quedar en ~02:00:00 y deadline finito. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const ROOT = path.join(__dirname, "..", "..", "..");
const fileUrl = (p) => "file://" + path.join(ROOT, p);
const KEY = "curso-algebra-examen-examen-1";

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  let fallos = 0, avisos = 0;
  const ok = (cond, msg, extra) => {
    console.log((cond ? "  ✓ " : "  ✗ ") + msg + (extra ? "  [" + extra + "]" : ""));
    if (!cond) fallos++;
  };
  const nota = (msg, extra) => console.log("  · " + msg + (extra ? "  [" + extra + "]" : ""));

  const cargar = async (valor) => {
    await cdp.goto(fileUrl("examenes/examen-1.html"), 700);
    await cdp.eval(`sessionStorage.clear();` + (valor === undefined ? "" : `sessionStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(valor)});`) + `1`);
    await cdp.send("Page.reload", {});
    await sleep(1200);
    return cdp.eval(`(() => {
      const t = (document.querySelector("#exam-timer") || {}).textContent || "";
      return {
        timer: t,
        deadline: sessionStorage.getItem(${JSON.stringify(KEY)}),
        formato: /^\\d{2}:\\d{2}:\\d{2}$/.test(t),
        len: t.length,
        bloqueados: Array.from(document.querySelectorAll(".drill__answer input")).filter((i) => i.disabled).length,
        inputs: document.querySelectorAll(".drill__answer input").length,
        grade: (document.querySelector("#exam-grade") || {}).textContent,
      };
    })()`);
  };
  const horas = (t) => {
    const [h, m, s] = t.split(":").map((x) => parseInt(x, 10));
    return h * 3600 + m * 60 + s;
  };

  try {
    console.log("== N11-a sesión limpia");
    let r = await cargar(undefined);
    ok(r.formato, "formato HH:MM:SS", `timer=${r.timer}`);
    ok(Math.abs(horas(r.timer) - 7200) <= 3, "arranque ≈ plazo nominal 120 min", `timer=${r.timer}`);

    console.log("== N11-b deadline gigante 1e21 (repro de la R3)");
    r = await cargar("999999999999999999999");
    ok(r.formato && r.len === 8, "formato HH:MM:SS de 8 chars (antes 21)", `timer=${r.timer} len=${r.len}`);
    ok(Math.abs(horas(r.timer) - 7200) <= 3, "clampeado al plazo nominal ≈ 02:00:00 (antes 277777777280012:37:20)", `timer=${r.timer}`);
    const dl = parseInt(r.deadline || "", 10);
    ok(Number.isFinite(dl) && dl > Date.now() && dl <= Date.now() + 7200 * 1000 + 5000, "deadline reescrito como finito dentro del plazo", `deadline=${r.deadline}`);
    ok(r.inputs > 0 && r.bloqueados === 0, "examen operativo (sin bloqueo indebido)", `${r.bloqueados}/${r.inputs}`);

    console.log("== N11-c deadline entero finito enorme (Date.now()+1e15)");
    r = await cargar(String(Date.now() + 1e15));
    ok(r.formato && Math.abs(horas(r.timer) - 7200) <= 3, "clampeado a 02:00:00", `timer=${r.timer}`);

    console.log("== N11-d 10 h (> 2× nominal = 4 h → clampea)");
    r = await cargar(String(Date.now() + 10 * 3600 * 1000));
    ok(r.formato && Math.abs(horas(r.timer) - 7200) <= 3, "clampeado a 02:00:00", `timer=${r.timer}`);

    console.log("== N11-e 4 h 30 min (justo por encima del umbral → clampea)");
    r = await cargar(String(Date.now() + 4.5 * 3600 * 1000));
    ok(r.formato && Math.abs(horas(r.timer) - 7200) <= 3, "clampeado a 02:00:00", `timer=${r.timer}`);

    console.log("== N11-f 3 h (≤ 2× nominal → se respeta, no es deadline absurdo)");
    r = await cargar(String(Date.now() + 3 * 3600 * 1000));
    ok(r.formato, "formato HH:MM:SS", `timer=${r.timer}`);
    ok(Math.abs(horas(r.timer) - 10800) <= 3, "se respeta (≈ 03:00:00): el umbral de clampeo es > 2× nominal", `timer=${r.timer}`);
    nota("regla implementada: clampea si deadline > ahora + 2×plazo (4 h para este examen)");

    console.log("== N11-g 3 h 59 min (justo por debajo del umbral)");
    r = await cargar(String(Date.now() + 3.9 * 3600 * 1000));
    ok(Math.abs(horas(r.timer) - 3.9 * 3600) <= 3, "se respeta (≈ 03:54:00)", `timer=${r.timer}`);

    console.log("== N11-h deadline pasado");
    r = await cargar(String(Date.now() - 60 * 1000));
    ok(r.timer === "00:00:00", "timer a 0", `timer=${r.timer}`);
    ok(r.bloqueados === r.inputs && r.inputs > 0, "todo bloqueado + auto-corrección", `${r.bloqueados}/${r.inputs} nota=${r.grade}`);

    console.log("== N11-i basura no numérica");
    r = await cargar("abc");
    ok(r.formato && Math.abs(horas(r.timer) - 7200) <= 3, "sesión nueva ≈ 02:00:00", `timer=${r.timer}`);

    console.log("== N11-j deadline válido se respeta (F5 no regala tiempo)");
    await cdp.goto(fileUrl("examenes/examen-1.html"), 700);
    await cdp.eval(`sessionStorage.clear(); sessionStorage.setItem(${JSON.stringify(KEY)}, String(Date.now() + 125 * 1000)); 1`);
    await cdp.send("Page.reload", {});
    await sleep(1100);
    let t1 = await cdp.eval(`document.querySelector("#exam-timer").textContent`);
    await cdp.send("Page.reload", {});
    await sleep(1100);
    let t2 = await cdp.eval(`document.querySelector("#exam-timer").textContent`);
    ok(horas(t1) <= 125 && horas(t2) < horas(t1), "F5 conserva deadline (no regala tiempo)", `${t1} → ${t2}`);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(fallos === 0 ? "\nN11: TODO EN VERDE" : `\nN11: ${fallos} fallos`);
  process.exit(fallos === 0 ? 0 : 2);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
