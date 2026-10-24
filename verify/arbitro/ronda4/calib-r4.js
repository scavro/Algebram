/* Calibración del instrumento de la R4 (cero falsos positivos):
   (1) decoder PNG contra colores conocidos
   (2) sistema de coordenadas del clip de Page.captureScreenshot (captureBeyondViewport)
   (3) truco color:transparent para fondo efectivo
   Si algo falla aquí, ninguna medición de contraste es fiable. */
const path = require("path");
const { launch, CDP, sleep } = require("./cdp");
const { decodePNG } = require("./lib-png");
const ROOT = path.join(__dirname, "..", "..", "..");

const HTML = `data:text/html,` + encodeURIComponent(`<!doctype html><html><head><style>
  body { margin:0; background:#ffffff; }
  .caja { width:300px; height:120px; margin:0; padding:20px; font:30px sans-serif; }
  #c1 { background:#ff0000; color:#000000; }
  #c2 { background:#00ff00; color:#000000; margin-top:2600px; }
  #c3 { background:#0000ff; color:#ffffff; }
</style></head><body>
  <div class="caja" id="c1">ROJO texto negro</div>
  <div class="caja" id="c2">VERDE a 2600px</div>
  <div class="caja" id="c3">AZUL texto blanco</div>
</body></html>`);

(async () => {
  const { proc, wsUrl } = await launch();
  const cdp = await CDP.connect(wsUrl);
  let fallos = 0;
  const ok = (cond, msg, extra) => {
    console.log((cond ? "  ✓ " : "  ✗ ") + msg + (extra ? "  [" + extra + "]" : ""));
    if (!cond) fallos++;
  };
  try {
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.navigate", { url: HTML });
    await sleep(600);

    /* ---------- (1)+(2) colores conocidos y coordenadas ---------- */
    const rects = await cdp.eval(`(() => {
      const r = {};
      for (const id of ["c1","c2","c3"]) {
        const b = document.getElementById(id).getBoundingClientRect();
        r[id] = { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height };
      }
      return { rects: r, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth };
    })()`);

    // captura de página completa (banda) con clip en coordenadas de documento
    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: rects.docW, height: Math.min(rects.docH, 4000), scale: 1 },
    });
    const img = decodePNG(Buffer.from(shot.data, "base64"));
    console.log(`  imagen: ${img.width}x${img.height} (doc ${rects.docW}x${rects.docH})`);
    ok(img.width === rects.docW, "ancho del clip = ancho de documento", `${img.width}`);

    const centro = (id) => {
      const r = rects.rects[id];
      return img.rgb(Math.round(r.x + r.w / 2), Math.round(r.y + r.h / 2));
    };
    ok(JSON.stringify(centro("c1")) === "[255,0,0]", "píxel c1 = rojo puro", JSON.stringify(centro("c1")));
    ok(JSON.stringify(centro("c2")) === "[0,255,0]", "píxel c2 (y≈2600) = verde puro → clip en coords de documento", JSON.stringify(centro("c2")));
    ok(JSON.stringify(centro("c3")) === "[0,0,255]", "píxel c3 = azul puro", JSON.stringify(centro("c3")));

    /* ---------- (2b) clip por elemento ---------- */
    const r2 = rects.rects.c2;
    const shot2 = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: r2.x, y: r2.y, width: r2.w, height: r2.h, scale: 1 },
    });
    const img2 = decodePNG(Buffer.from(shot2.data, "base64"));
    const px2 = img2.rgb(Math.round(img2.width / 2), Math.round(img2.height / 2));
    ok(JSON.stringify(px2) === "[0,255,0]", "clip por elemento c2 = verde puro", JSON.stringify(px2));

    /* ---------- (3) fondo con texto oculto ---------- */
    // c3: fondo azul, texto blanco. Ocultando el texto, el área debe ser azul puro.
    await cdp.eval(`(() => {
      const s = document.createElement("style");
      s.id = "x4-bg";
      s.textContent = "body.x4bg *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}";
      document.head.appendChild(s);
      document.body.classList.add("x4bg");
    })()`);
    await sleep(150);
    const shot3 = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: rects.rects.c3.x, y: rects.rects.c3.y, width: rects.rects.c3.w, height: rects.rects.c3.h, scale: 1 },
    });
    const img3 = decodePNG(Buffer.from(shot3.data, "base64"));
    // área de texto: dentro del padding (20px), mitad inferior del recuadro
    let suma = [0, 0, 0], n = 0;
    for (let y = 40; y < img3.height - 10; y++) {
      for (let x = 30; x < img3.width - 30; x++) {
        const p = img3.rgb(x, y);
        suma = [suma[0] + p[0], suma[1] + p[1], suma[2] + p[2]];
        n++;
      }
    }
    const med = suma.map((v) => Math.round(v / n));
    ok(JSON.stringify(med) === "[0,0,255]", "texto oculto → el área muestreada es el fondo puro (azul)", JSON.stringify(med));
    await cdp.eval(`document.body.classList.remove("x4bg"); document.getElementById("x4-bg").remove();`);
  } finally {
    await cdp.close();
    proc.kill();
  }
  console.log(fallos === 0 ? "\nCALIBRACIÓN OK — instrumento válido" : `\nCALIBRACIÓN FALLIDA (${fallos})`);
  process.exit(fallos === 0 ? 0 : 1);
})().catch((e) => (console.error("FALLO:", e), process.exit(1)));
