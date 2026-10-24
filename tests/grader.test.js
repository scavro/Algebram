/* Tests del motor de evaluación — ejecutar: node tests/grader.test.js */
"use strict";
const Grader = require("../assets/js/grader.js");

let pass = 0,
  fail = 0;
const failures = [];

function ok(name, cond) {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(name);
    console.error("  ✗ " + name);
  }
}

function checkTrue(name, spec, answer) {
  const r = Grader.check(spec, answer);
  ok(name + " [esperaba OK]", r.ok === true);
  if (!r.ok) console.error("    motivo:", r.error || "no equivalente");
}

function checkFalse(name, spec, answer) {
  const r = Grader.check(spec, answer);
  ok(name + " [esperaba FALLO]", r.ok === false);
}

/* ---------- expr: equivalencias ---------- */
checkTrue("cuadrado perfecto", { type: "expr", expected: "x^2+2*x+1" }, "(x+1)^2");
checkTrue("reordenado", { type: "expr", expected: "x^2+2*x+1" }, "1+x^2+2*x");
checkTrue("factor común", { type: "expr", expected: "x*(x+1)" }, "x^2+x");
checkTrue("mult implícita", { type: "expr", expected: "2*x*y" }, "2xy");
checkTrue("fracción equivalente", { type: "expr", expected: "(x^2-1)/(x-1)" }, "x+1");
checkTrue("unario", { type: "expr", expected: "-x^2" }, "-(x^2)");
checkTrue("potencia negativa", { type: "expr", expected: "1/x^2" }, "x^(-2)");
checkTrue("raíz", { type: "expr", expected: "x" }, "sqrt(x)*sqrt(x)");
checkTrue("constantes pi", { type: "expr", expected: "2*pi" }, "2π");
checkTrue("decimal vs fracción", { type: "expr", expected: "1/2" }, "0.5");
checkTrue("coma decimal", { type: "expr", expected: "3.14" }, "3,14");

checkFalse("expr distinta", { type: "expr", expected: "x^2+2*x+1" }, "(x+2)^2");
checkFalse("signo cambiado", { type: "expr", expected: "x^2+2*x+1" }, "x^2-2*x+1");
checkFalse("fracción falsa", { type: "expr", expected: "(x^2-1)/(x-1)" }, "x-1");
checkFalse("expr vacía", { type: "expr", expected: "x" }, "");

/* ---------- complejos ---------- */
checkTrue("complejo suma", { type: "expr", expected: "2+3*i" }, "2+3i");
checkTrue("complejo i^2", { type: "expr", expected: "-1" }, "i^2");
checkTrue("complejo módulo", { type: "expr", expected: "5" }, "abs(3+4*i)");
checkTrue("producto complejo", { type: "expr", expected: "5*i" }, "(1+2*i)*(2+i)"); // (1+2i)(2+i)=5i
checkTrue("conjugado", { type: "expr", expected: "1-2*i" }, "conj(1+2*i)");
checkFalse("complejo malo", { type: "expr", expected: "2+3*i" }, "2+4*i");

/* ---------- numbers ---------- */
checkTrue("entero", { type: "number", expected: "42" }, "42");
checkTrue("fracción", { type: "number", expected: "1/3" }, "0.3333333333333333");
checkTrue("raíz", { type: "number", expected: "sqrt(2)" }, "1.4142135623730951");
checkTrue("exacto", { type: "number", expected: "3", exact: true }, "3");
checkFalse("exacto con decimal", { type: "number", expected: "3", exact: true }, "3.000001");
checkFalse("entero malo", { type: "number", expected: "42" }, "43");
checkFalse("numero: basura", { type: "number", expected: "42" }, "cuarenta y dos");

/* ---------- matrices ---------- */
checkTrue(
  "matriz 2x2",
  { type: "matrix", expected: [["1", "2"], ["3", "4"]] },
  "1 2; 3 4"
);
checkTrue(
  "matriz con comas",
  { type: "matrix", expected: [["1", "2"], ["3", "4"]] },
  "1,2;3,4"
);
checkTrue(
  "matriz con entradas expr",
  { type: "matrix", expected: [["1/2", "0"], ["0", "2"]] },
  "0.5, 0; 0, 2"
);
checkTrue(
  "matriz JSON",
  { type: "matrix", expected: [["1", "2"], ["3", "4"]] },
  "[[1,2],[3,4]]"
);
checkFalse("matriz dimesiones", { type: "matrix", expected: [["1", "2"], ["3", "4"]] }, "1 2 3; 4 5 6");
checkFalse("matriz entrada mala", { type: "matrix", expected: [["1", "2"], ["3", "4"]] }, "1 2; 3 5");

checkTrue("vector fila", { type: "vector", expected: [["1", "2", "3"]] }, "1,2,3");
checkTrue("vector columna", { type: "vector", expected: [["1"], ["2"]] }, "1;2");

/* ---------- choice / bool / set ---------- */
checkTrue("choice", { type: "choice", expected: 2 }, 2);
checkFalse("choice malo", { type: "choice", expected: 2 }, 1);
checkTrue("bool verdadero", { type: "bool", expected: true }, "verdadero");
checkTrue("bool falso", { type: "bool", expected: false }, "falso");
checkFalse("bool malo", { type: "bool", expected: true }, "falso");

checkTrue("set unordered", { type: "exprset", expected: ["1", "2", "3"] }, "3; 1; 2");
checkTrue("set con exprs", { type: "exprset", expected: ["1", "-1", "1/2"] }, "0.5; -1; 1");
checkFalse("set de más", { type: "exprset", expected: ["1", "2"] }, "1; 2; 3");
checkFalse("set valor malo", { type: "exprset", expected: ["1", "2"] }, "1; 5");

/* ---------- multi ---------- */
checkTrue(
  "multi campos",
  {
    type: "multi",
    fields: {
      det: { type: "number", expected: "-2" },
      tr: { type: "number", expected: "5" },
    },
  },
  { det: "-2", tr: "5" }
);
checkFalse(
  "multi campo malo",
  {
    type: "multi",
    fields: {
      det: { type: "number", expected: "-2" },
      tr: { type: "number", expected: "5" },
    },
  },
  { det: "-2", tr: "6" }
);

/* ---------- expectedOneOf ---------- */
checkTrue(
  "oneOf",
  { type: "expr", expectedOneOf: ["1", "-1"] },
  "-1"
);
checkFalse(
  "oneOf fuera",
  { type: "expr", expectedOneOf: ["1", "-1"] },
  "2"
);

/* ---------- errores de entrada ---------- */
checkFalse("paréntesis sin cerrar", { type: "expr", expected: "x" }, "(x+1");
checkFalse("símbolo raro", { type: "expr", expected: "x" }, "x@2");

/* ---------- evaluación directa ---------- */
const z = Grader.evaluate("2+3*i");
ok("evaluate complejo", Math.abs(z.re - 2) < 1e-12 && Math.abs(z.im - 3) < 1e-12);
const w = Grader.evaluate("sqrt(-1)");
ok("evaluate sqrt(-1)=i", Math.abs(w.im - 1) < 1e-9);

/* ---------- regresión: casos adversariales de la auditoría ---------- */
checkFalse("AUD: 1/(x-x) no vale para nada", { type: "expr", expected: "4/11" }, "1/(x-x)");
checkFalse("AUD: log(x-y) no vale para nada", { type: "expr", expected: "x+y" }, "log(x-y)");
checkFalse("AUD: función desconocida", { type: "expr", expected: "1" }, "hacker(3)");
checkFalse("AUD: x-y no es 0", { type: "expr", expected: "0" }, "x-y");
checkFalse("AUD: x/y no es 1", { type: "expr", expected: "1" }, "x/y");
checkFalse("AUD: x^2-y^2 no es 0", { type: "expr", expected: "0" }, "x^2-y^2");
checkFalse("AUD: sin(x)-sin(y) no es 0", { type: "expr", expected: "0" }, "sin(x)-sin(y)");
checkFalse("AUD: y^2 no es x^2", { type: "expr", expected: "x^2" }, "y^2");
checkFalse("AUD: 4-2t no es 4-s-t", { type: "expr", expected: "4-s-t" }, "4-2*t");
checkFalse("AUD: choice laxo 1abc", { type: "choice", expected: 1 }, "1abc");
checkFalse("AUD: choice laxo 2.9", { type: "choice", expected: 2 }, "2.9");
checkTrue("AUD: choice estricto '1'", { type: "choice", expected: 1 }, "1");
checkFalse("AUD: matriz celda 1e-7 vs 0 exacta", { type: "matrix", expected: [["0"]], exact: true }, "0.0000001");
checkTrue("AUD: matriz celda 0 exacta", { type: "matrix", expected: [["0"]], exact: true }, "0");
checkTrue("AUD: tipo text cifras", { type: "text", expected: "2220" }, "2220");
checkFalse("AUD: tipo text rechaza 222*10", { type: "text", expected: "2220" }, "222*10");
checkFalse("AUD: expr no acepta 222*10 para secuencia", { type: "text", expected: "1211" }, "1.211e3");
checkFalse("AUD: bool sin selección", { type: "bool", expected: true }, null);
checkFalse("AUD: choice sin selección", { type: "choice", expected: 0 }, null);
checkTrue("AUD: equivalentes multivariables", { type: "expr", expected: "x+y+z" }, "z+y+x");
checkFalse("AUD: 4-2t vs 4-s-t en multi", {
  type: "expr", expected: "4-s-t",
}, "4-2*t");

/* ---------- regresión ronda 5: rama de log/exp y funciones implícitas ---------- */
checkTrue("AUD: senx = sen(x)", { type: "expr", expected: "sin(x)" }, "senx");
checkTrue("AUD: sen x = sin(x)", { type: "expr", expected: "sin(x)" }, "sen x");
checkTrue("AUD: tg(0)=0", { type: "number", expected: "0" }, "tg(0)");
checkTrue("AUD: log(2)+log(3)=log(6)", { type: "expr", expected: "log(6)" }, "log(2)+log(3)");
checkFalse("AUD: log(exp(x))-x no es 0 globalmente", { type: "expr", expected: "0" }, "log(exp(x))-x");
checkFalse("AUD: exploit esperado+log(exp(v))-v", { type: "expr", expected: "4-s-t" }, "4-s-t+log(exp(x))-x");
checkFalse("AUD: log(exp(4-s-t)) no es 4-s-t", { type: "expr", expected: "4-s-t" }, "log(exp(4-s-t))");
for (let r = 0; r < 25; r++) {
  const res = Grader.check({ type: "expr", expected: "0" }, "log(exp(x))-x");
  ok("AUD estabilidad run " + r + " (debe fallar siempre)", res.ok === false);
}

/* ---------- regresión ronda 6: ramas de log/sqrt y trig inversa ---------- */
checkFalse("AUD: log(x)+log(y) no es log(xy) globalmente", { type: "expr", expected: "log(x*y)" }, "log(x)+log(y)");
checkFalse("AUD: sqrt(x)*sqrt(y) no es sqrt(xy) globalmente", { type: "expr", expected: "sqrt(x*y)" }, "sqrt(x)*sqrt(y)");
checkFalse("AUD: exploit rama esperado+log(u)+log(v)-log(uv)", { type: "expr", expected: "4-s-t" }, "4-s-t+log(s)+log(t)-log(s*t)");
for (let r = 0; r < 40; r++) {
  const a = Grader.check({ type: "expr", expected: "log(x*y)" }, "log(x)+log(y)");
  const b = Grader.check({ type: "expr", expected: "0" }, "log(x)+log(y)-log(x*y)");
  ok("AUD estabilidad-rama " + r, a.ok === false && b.ok === false);
}
checkTrue("AUD: asin(0)=0", { type: "number", expected: "0" }, "asin(0)");
checkTrue("AUD: arcsen(1)=pi/2", { type: "expr", expected: "pi/2" }, "arcsen(1)");
checkTrue("AUD: atan(1)=pi/4", { type: "expr", expected: "pi/4" }, "atan(1)");
checkTrue("AUD: acos(1)=0", { type: "number", expected: "0" }, "arccos(1)");

/* ---------- regresión ronda 7: cierre estructural (determinista) ---------- */
checkFalse("AUD: exploit desplazado log(x+5)+log(y+5)-log((x+5)(y+5))", { type: "expr", expected: "4-s-t" }, "4-s-t+log(x+5)+log(y+5)-log((x+5)*(y+5))");
checkFalse("AUD: log(x)+log(y) vs log(x*y) estructural", { type: "expr", expected: "log(x*y)" }, "log(x)+log(y)");
checkFalse("AUD: sqrt(xy) vs sqrt(x)sqrt(y) estructural", { type: "expr", expected: "sqrt(x*y)" }, "sqrt(x)*sqrt(y)");
checkFalse("AUD: log(exp(x))-x con exponente negativo forzado", { type: "expr", expected: "0" }, "log(exp(x))-x+(x-x)*x^(-1)");
checkFalse("AUD: 2log(x+3.5)-log((x+3.5)^2) no es 0", { type: "expr", expected: "0" }, "2*log(x+3.5)-log((x+3.5)^2)");
checkTrue("AUD: x*x^(-1) = 1", { type: "expr", expected: "1" }, "x*x^(-1)");
checkTrue("AUD: (x^2-1)/(x-1) = x+1 (vía estructural)", { type: "expr", expected: "x+1" }, "(x^2-1)/(x-1)");
for (let r = 0; r < 30; r++) {
  const res = Grader.check({ type: "expr", expected: "4-s-t" }, "4-s-t+log(x+5)+log(y+5)-log((x+5)*(y+5))");
  ok("AUD estabilidad-estructural " + r, res.ok === false);
}

/* ---------- regresión ronda 8: 0/0, fallback forzado, identidades verdaderas ---------- */
checkFalse("AUD: (x-x)/(x-x) no vale para nada", { type: "expr", expected: "4/11" }, "(x-x)/(x-x)");
checkFalse("AUD: 0/(x-x) no vale", { type: "expr", expected: "0" }, "0/(x-x)");
checkFalse("AUD: 1/(x-x)-1/(x-x) no vale", { type: "expr", expected: "0" }, "1/(x-x)-1/(x-x)");
checkFalse("AUD: 5+0*(x-x)/(x-x) no es 5", { type: "expr", expected: "5" }, "5+0*(x-x)/(x-x)");
checkFalse("AUD: (x-x)/(x-x) en matriz", { type: "matrix", expected: [["1"]] }, "(x-x)/(x-x)");
checkFalse("AUD: perturbación x^(3/2)", { type: "expr", expected: "4-s-t" }, "4-s-t+x^(3/2)-x^(3/2)");
checkFalse("AUD: perturbación Δ·x^0.5", { type: "expr", expected: "4-s-t" }, "4-s-t+(log(x+5)+log(y+5)-log((x+5)*(y+5)))*x^0.5");
checkFalse("AUD: perturbación x^z-x^z", { type: "expr", expected: "0" }, "log(x)+log(y)-log(x*y)+(x-x)^x");
checkTrue("AUD: x^(-20) = 1/x^20", { type: "expr", expected: "1/x^20" }, "x^(-20)");
checkTrue("AUD: min(2,3)=2", { type: "number", expected: "2" }, "min(2,3)");
checkTrue("AUD: max(2,3)=3", { type: "number", expected: "3" }, "max(2,3)");
checkTrue("AUD: exp(log(x))=x", { type: "expr", expected: "x" }, "exp(log(x))");
checkTrue("AUD: conj(x*y)=conj(x)conj(y)", { type: "expr", expected: "conj(x)*conj(y)" }, "conj(x*y)");
checkTrue("AUD: cos^2+sin^2=1", { type: "expr", expected: "1" }, "cos(x)^2+sin(x)^2");
checkTrue("AUD: cosh^2-sinh^2=1", { type: "expr", expected: "1" }, "cosh(x)^2-sinh(x)^2");
checkTrue("AUD: log(x+y)=log(y+x)", { type: "expr", expected: "log(x+y)" }, "log(y+x)");
checkTrue("AUD: log(x/2)=log(0.5x)", { type: "expr", expected: "log(x/2)" }, "log(0.5*x)");
checkTrue("AUD: idénticas grandes", { type: "expr", expected: "(x+y)^60" }, "(x+y)^60");
checkFalse("AUD: potencias distintas", { type: "expr", expected: "(x+y)^60" }, "(x+y)^61");

/* ---------- regresión ronda 9: identidades verdaderas + bordes ---------- */
checkTrue("AUD: sqrt(4x)=2sqrt(x)", { type: "expr", expected: "2*sqrt(x)" }, "sqrt(4*x)");
checkTrue("AUD: log(4x)=log(4)+log(x)", { type: "expr", expected: "log(4)+log(x)" }, "log(4*x)");
checkTrue("AUD: log(sqrt(x))=log(x)/2", { type: "expr", expected: "log(x)/2" }, "log(sqrt(x))");
checkTrue("AUD: (sqrt(x))^4=x^2", { type: "expr", expected: "x^2" }, "(sqrt(x))^4");
checkTrue("AUD: min(x,y)=min(y,x)", { type: "expr", expected: "min(x,y)" }, "min(y,x)");
checkTrue("AUD: max(x,y)=max(y,x)", { type: "expr", expected: "max(x,y)" }, "max(y,x)");
checkTrue("AUD: x^(3/2)=x*sqrt(x)", { type: "expr", expected: "x*sqrt(x)" }, "x^(3/2)");
checkTrue("AUD: x^(2/3)=(x^(1/3))^2", { type: "expr", expected: "(x^(1/3))^2" }, "x^(2/3)");
checkTrue("AUD: x^(-1/2)=1/sqrt(x)", { type: "expr", expected: "1/sqrt(x)" }, "x^(-1/2)");
checkTrue("AUD: tan=sin/cos", { type: "expr", expected: "sin(x)/cos(x)" }, "tan(x)");
checkTrue("AUD: |x|^2=x*conj(x)", { type: "expr", expected: "x*conj(x)" }, "abs(x)^2");
checkTrue("AUD: conj(x-y)=conj(x)-conj(y)", { type: "expr", expected: "conj(x)-conj(y)" }, "conj(x-y)");
checkTrue("AUD: re(x)^2+im(x)^2=x*conj(x)", { type: "expr", expected: "x*conj(x)" }, "re(x)^2+im(x)^2");
checkTrue("AUD: log(x/c)=log(x)-log(c) vía serialize", { type: "expr", expected: "log(x)-log(2)" }, "log(x/2)");
checkFalse("AUD: log(x*x) no es 2log(x) globalmente", { type: "expr", expected: "2*log(x)" }, "log(x*x)");
checkFalse("AUD: 5+x^(-300) no es 5", { type: "expr", expected: "5" }, "5+x^(-300)");
checkFalse("AUD: x^(-65) no es x^(-64)", { type: "expr", expected: "x^(-64)" }, "x^(-65)");
checkFalse("AUD: 0^x no es 1", { type: "expr", expected: "1" }, "0^x");
checkTrue("AUD: idénticas potencia grande", { type: "expr", expected: "(x+y)^300" }, "(x+y)^300");

/* ---------- regresión ronda 10: FP ventana relativa · FN identidades · DoS ---------- */
// FN G1_RAMA (certificadas con sympy: verify/sympy-fix-r10.py)
checkTrue("R10: sqrt(-4x)=2sqrt(-x)", { type: "expr", expected: "2*sqrt(-x)" }, "sqrt(-4*x)");
checkTrue("R10: sqrt(-9x)=3sqrt(-x)", { type: "expr", expected: "3*sqrt(-x)" }, "sqrt(-9*x)");
checkTrue("R10: log(2*(3x))=log(6x)", { type: "expr", expected: "log(6*x)" }, "log(2*(3*x))");
checkTrue("R10: log(4x)/2=log(2sqrt(x))", { type: "expr", expected: "log(2*sqrt(x))" }, "log(4*x)/2");
checkTrue("R10: log(x+y+z)=log(z+y+x)", { type: "expr", expected: "log(z+y+x)" }, "log(x+y+z)");
// FN G2_POW
checkTrue("R10: (x^(2/3))^(3/2)=x", { type: "expr", expected: "x" }, "(x^(2/3))^(3/2)");
checkTrue("R10: x^4097=x^4096*x", { type: "expr", expected: "x^4096*x" }, "x^4097");
checkTrue("R10: x^(-4097)=1/x^4097", { type: "expr", expected: "1/x^4097" }, "x^(-4097)");
// FN G3_TAN
checkTrue("R10: tan(x)+tan(-x)=0", { type: "expr", expected: "0" }, "tan(x)+tan(-x)");
// FN G4_CX
checkTrue("R10: conj(re(x))=re(x)", { type: "expr", expected: "re(x)" }, "conj(re(x))");
checkTrue("R10: re(xy)=re x re y - im x im y", { type: "expr", expected: "re(x)*re(y)-im(x)*im(y)" }, "re(x*y)");
checkTrue("R10: im(xy)=re x im y + im x re y", { type: "expr", expected: "re(x)*im(y)+im(x)*re(y)" }, "im(x*y)");
checkTrue("R10: conj(x)^2=conj(x^2)", { type: "expr", expected: "conj(x^2)" }, "conj(x)^2");
// FN G5_DOS (sumas grandes: antes O(n²) + stack overflow; y DoS)
const v3999 = Array.from({ length: 3999 }, (_, i) => "x" + (i + 1));
const v4001 = Array.from({ length: 4001 }, (_, i) => "y" + (i + 1));
checkTrue("R10: suma 3999 reordenada", { type: "expr", expected: v3999.slice().reverse().join("+") }, v3999.join("+"));
checkTrue("R10: suma 4001 reordenada", { type: "expr", expected: v4001.slice().reverse().join("+") }, v4001.join("+"));
checkTrue("R10: (a+b+c+d+e)^16=^15*(…)", { type: "expr", expected: "(a+b+c+d+e)^15*(a+b+c+d+e)" }, "(a+b+c+d+e)^16");
checkTrue("R10: (a+b+c+d+e)^4096=^4095*(…)", { type: "expr", expected: "(a+b+c+d+e)^4095*(a+b+c+d+e)" }, "(a+b+c+d+e)^4096");
checkTrue("R10: ((x+y+z)^64+x)^64=^63*(…) DoS", { type: "expr", expected: "((x+y+z)^64+x)^63*((x+y+z)^64+x)" }, "((x+y+z)^64+x)^64");
// FP ventana relativa (E ≡ E+δ con |E| enorme): deben RECHAZAR de forma estable
checkFalse("R10: ^16 ≠ ^15*(…)+1", { type: "expr", expected: "(a+b+c+d+e)^15*(a+b+c+d+e)+1" }, "(a+b+c+d+e)^16");
checkFalse("R10: ^15 ≠ ^15+1", { type: "expr", expected: "(a+b+c+d+e)^15+1" }, "(a+b+c+d+e)^15");
checkFalse("R10: ^16 ≠ ^16+1000", { type: "expr", expected: "(a+b+c+d+e)^16+1000" }, "(a+b+c+d+e)^16");
checkFalse("R10: 4/11+(x²+y²+2)^(-200) ≠ 4/11", { type: "expr", expected: "4/11" }, "4/11+(x^2+y^2+2)^(-200)");
checkFalse("R10: 5+x^(-4096) ≠ 5", { type: "expr", expected: "5" }, "5+x^(-4096)");
checkFalse("R10: 5+x^(-4097) ≠ 5", { type: "expr", expected: "5" }, "5+x^(-4097)");
for (let r = 0; r < 20; r++) {
  ok("R10 estabilidad-FP " + r, Grader.check({ type: "expr", expected: "(a+b+c+d+e)^15+1" }, "(a+b+c+d+e)^15").ok === false);
}
// controles negativos de rama: deben seguir RECHAZANDO
checkFalse("R10: sqrt(-4x) ≠ 2sqrt(x)", { type: "expr", expected: "2*sqrt(x)" }, "sqrt(-4*x)");
checkFalse("R10: sqrt(-x) ≠ i*sqrt(x)", { type: "expr", expected: "i*sqrt(x)" }, "sqrt(-x)");
checkFalse("R10: log(-4x) ≠ log(4x)", { type: "expr", expected: "log(4*x)" }, "log(-4*x)");
checkFalse("R10: log(-4x) ≠ log(4x)+i*pi", { type: "expr", expected: "log(4*x)+i*pi" }, "log(-4*x)");
checkFalse("R10: (x^2)^(1/2) ≠ x", { type: "expr", expected: "x" }, "(x^2)^(1/2)");
checkFalse("R10: (x^4)^(1/2) ≠ x^2", { type: "expr", expected: "x^2" }, "(x^4)^(1/2)");
checkFalse("R10: (x^2)^(1/3) ≠ x^(2/3)", { type: "expr", expected: "x^(2/3)" }, "(x^2)^(1/3)");
checkFalse("R10: abs(x+y) ≠ abs(x)+abs(y)", { type: "expr", expected: "abs(x)+abs(y)" }, "abs(x+y)");
checkFalse("R10: tan(x) ≠ sin(x)*cos(x)", { type: "expr", expected: "sin(x)*cos(x)" }, "tan(x)");
// N13r: coma decimal solo fuera de argumentos de min/max
checkTrue("R10: min(2,3)+0,5 = 2.5", { type: "expr", expected: "2.5" }, "min(2,3)+0,5");
checkFalse("R10: min(2,3) ≠ 2.3", { type: "expr", expected: "2.3" }, "min(2,3)");

/* ---------- resumen ---------- */
console.log("\n== Grader tests ==");
console.log("Pasaron: " + pass + " · Fallaron: " + fail);
if (fail > 0) {
  console.log("Fallos:\n - " + failures.join("\n - "));
  process.exit(1);
}
console.log("TODO OK");
