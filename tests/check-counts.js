#!/usr/bin/env node
/* Comprueba los recuentos visibles antes de que app.js los calcule. */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "assets", "data");
global.window = {};

const counts = {};
for (const file of fs.readdirSync(DATA).sort()) {
  if (!file.endsWith(".js")) continue;
  require(path.join(DATA, file));
  const key = file.replace(/\.js$/, "");
  const data = global.window.CURSO_DATA[key];
  counts[key] = ((data && data.drills) || (data && data.exam && data.exam.questions) || []).length;
}
counts.curso = Object.values(counts).reduce((sum, n) => sum + n, 0);

const pages = [
  "index.html",
  ...fs.readdirSync(path.join(ROOT, "temas")).filter((f) => f.endsWith(".html")).map((f) => "temas/" + f),
  ...fs.readdirSync(path.join(ROOT, "examenes")).filter((f) => f.endsWith(".html")).map((f) => "examenes/" + f),
];
const errors = [];
let checked = 0;

for (const page of pages) {
  const html = fs.readFileSync(path.join(ROOT, page), "utf8");
  const countPattern = /<([a-z0-9]+)\b[^>]*data-count="([^"]+)"[^>]*>([^<]*)<\/\1>/gi;
  for (const match of html.matchAll(countPattern)) {
    const [, , key, actual] = match;
    const tag = match[0];
    const suffix = (tag.match(/data-count-suffix="([^"]*)"/) || [])[1] || "";
    const expected = String(counts[key]) + suffix;
    checked++;
    if (!(key in counts) || actual !== expected) {
      errors.push(`${page}: data-count="${key}" muestra «${actual}»; esperado «${expected}»`);
    }
  }

  const progressPattern = /<span\b[^>]*data-theme-progress-label="([^"]+)"[^>]*>([^<]*)<\/span>/gi;
  for (const match of html.matchAll(progressPattern)) {
    const [, key, actual] = match;
    const expected = `0 / ${counts[key]}`;
    checked++;
    if (!(key in counts) || actual !== expected) {
      errors.push(`${page}: progreso de "${key}" muestra «${actual}»; esperado «${expected}»`);
    }
  }
}

if (errors.length) {
  errors.forEach((error) => console.error("✗ " + error));
  process.exit(1);
}
console.log(`OK: ${checked} recuentos visibles coinciden con los datos (${counts.curso} ejercicios).`);
