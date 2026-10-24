/* Ronda 2 — contraste WCAG 2.1 sobre los tokens ACTUALES de base.css/components.css */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..", "..");

function parseHex(h) {
  h = h.trim();
  if (h.startsWith("#")) {
    const v = h.slice(1);
    if (v.length === 3) return [parseInt(v[0] + v[0], 16), parseInt(v[1] + v[1], 16), parseInt(v[2] + v[2], 16), 1];
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16), 1];
  }
  const m = h.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(",").map((x) => parseFloat(x));
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  return null;
}
function over(fg, bg) {
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
}
function lum(c) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
function ratio(fg, bg) {
  const a = lum(fg),
    b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// tokens de base.css (verificados por lectura)
const T = {
  paper: parseHex("#f4efe3"),
  paper2: parseHex("#ebe4d2"),
  paper3: parseHex("#e2d9c3"),
  night: parseHex("#141209"),
  night2: parseHex("#1e1b10"),
  ink: parseHex("#1c1910"),
  inkSoft: parseHex("#4c452f"),
  inkMute: parseHex("#6b6248"),
  cream: parseHex("#ece4cf"),
  creamSoft: parseHex("rgba(236,228,207,0.72)"),
  creamMute: parseHex("rgba(236,228,207,0.62)"),
  gold: parseHex("#7a5f1c"),
  goldBright: parseHex("#c9a227"),
  goldPale: parseHex("#d9c98a"),
  ok: parseHex("#4d7a4b"),
  bad: parseHex("#b0522c"),
  warn: parseHex("#8a6a1e"),
};

const casos = [
  // [nombre, fg, bg, umbral AA (4.5 texto normal)]
  ["ink-mute sobre paper (.meta, th, .drill__id)", T.inkMute, T.paper],
  ["ink-mute sobre paper-2 (th, .drill__head)", T.inkMute, T.paper2],
  ["ink-mute sobre paper-3", T.inkMute, T.paper3],
  ["gold sobre paper (.kicker, .plaque__label)", T.gold, T.paper],
  ["gold sobre paper-2", T.gold, T.paper2],
  ["warn sobre paper (chip Medio)", T.warn, T.paper],
  ["ok sobre paper (chip Fácil/OK)", T.ok, T.paper],
  ["bad sobre paper (chip Difícil)", T.bad, T.paper],
  ["ink-soft sobre paper", T.inkSoft, T.paper],
  ["ink sobre paper", T.ink, T.paper],
  ["cream-soft sobre night (footer, exam-toolbar ghost)", over(T.creamSoft, T.night), T.night],
  ["cream-mute sobre night (.footer__colophon)", over(T.creamMute, T.night), T.night],
  ["cream sobre night", T.cream, T.night],
  ["gold-bright sobre night (timer, footer h4)", T.goldBright, T.night],
  ["night sobre gold-bright (btn--gold)", T.night, T.goldBright],
  ["night sobre gold-pale (btn hover)", T.night, T.goldPale],
  ["paper sobre ink (btn)", T.paper, T.ink],
  ["cream-soft sobre night-2", over(T.creamSoft, T.night2), T.night2],
  ["cream-mute sobre night-2", over(T.creamMute, T.night2), T.night2],
];

let fallos = 0;
console.log("Umbral AA texto normal: 4.5:1 · texto grande (≥24px / ≥18.66px bold): 3:1\n");
for (const [nombre, fg, bg] of casos) {
  const r = ratio(fg, bg);
  const ok = r >= 4.5;
  if (!ok) fallos++;
  console.log(`${ok ? "✔" : "✘"} ${r.toFixed(2)}:1  ${nombre}`);
}

// chips: font-size de .drill__level y .small?
const comp = fs.readFileSync(path.join(ROOT, "assets/css/components.css"), "utf8");
const sizeChip = (comp.match(/\.drill__level \{[^}]*font-size: ([^;]+);/s) || [])[1];
const sizeMeta = (comp.match(/\.meta \{[^}]*font-size: ([^;]+);/s) || [])[1];
console.log(`\nReferencia de tamaños: .drill__level font-size=${sizeChip} · .meta font-size=${sizeMeta}`);
console.log(`\nResumen contraste: ${fallos} por debajo de 4.5:1`);
