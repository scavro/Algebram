/* ============================================================
   Grader — motor de comprobación de respuestas del curso
   ------------------------------------------------------------
   - Analiza expresiones matemáticas (reales y complejas)
   - Equivalencia: normalización + muestreo numérico en ℂ
   - Tipos: expr, number, matrix, vector, bool, choice,
            exprset, multi
   Funciona en navegador (window.Grader) y en Node (tests).
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Grader = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------------- Complejos ---------------- */
  function C(re, im) {
    return { re: re, im: im || 0 };
  }
  const cAdd = (a, b) => C(a.re + b.re, a.im + b.im);
  const cSub = (a, b) => C(a.re - b.re, a.im - b.im);
  const cMul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  function cDiv(a, b) {
    const d = b.re * b.re + b.im * b.im;
    if (d === 0) return C(NaN, NaN);
    return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
  }
  function cPow(a, b) {
    if (b.im === 0 && Number.isInteger(b.re)) {
      let n = b.re,
        neg = n < 0;
      n = Math.abs(n);
      let r = C(1, 0),
        base = a;
      while (n > 0) {
        if (n & 1) r = cMul(r, base);
        base = cMul(base, base);
        n >>= 1;
      }
      return neg ? cDiv(C(1, 0), r) : r;
    }
    if (a.re === 0 && a.im === 0) {
      if (b.re > 0) return C(0, 0);
      return C(NaN, NaN);
    }
    const lr = Math.log(Math.hypot(a.re, a.im));
    const th = Math.atan2(a.im, a.re);
    const z = cMul(C(lr, th), b);
    const m = Math.exp(z.re);
    return C(m * Math.cos(z.im), m * Math.sin(z.im));
  }
  const cAbs = (a) => C(Math.hypot(a.re, a.im), 0);
  const cNeg = (a) => C(-a.re, -a.im);
  const cConj = (a) => C(a.re, -a.im);
  const cArg = (a) => C(Math.atan2(a.im, a.re), 0);
  const cRe = (a) => C(a.re, 0);
  const cIm = (a) => C(a.im, 0);
  function cSqrt(a) {
    return cPow(a, C(0.5, 0));
  }
  function cExp(a) {
    const m = Math.exp(a.re);
    return C(m * Math.cos(a.im), m * Math.sin(a.im));
  }
  function cLog(a) {
    return C(Math.log(Math.hypot(a.re, a.im)), Math.atan2(a.im, a.re));
  }
  function cSin(a) {
    return C(Math.sin(a.re) * Math.cosh(a.im), Math.cos(a.re) * Math.sinh(a.im));
  }
  function cCos(a) {
    return C(Math.cos(a.re) * Math.cosh(a.im), -Math.sin(a.re) * Math.sinh(a.im));
  }
  function cTan(a) {
    return cDiv(cSin(a), cCos(a));
  }
  // inversas por rama principal: asin z = -i·log(iz + sqrt(1-z²)), etc.
  function cAsin(z) {
    const iz = cMul(C(0, 1), z);
    const rad = cSqrt(cSub(C(1, 0), cMul(z, z)));
    return cMul(C(0, -1), cLog(cAdd(iz, rad)));
  }
  function cAcos(z) {
    return cSub(C(Math.PI / 2, 0), cAsin(z));
  }
  function cAtan(z) {
    const iz = cMul(C(0, 1), z);
    const num = cLog(cSub(C(1, 0), iz));
    const den = cLog(cAdd(C(1, 0), iz));
    return cMul(C(0, 0.5), cSub(num, den));
  }

  const FUNCS = {
    sqrt: (z) => cSqrt(z),
    exp: (z) => cExp(z),
    log: (z) => cLog(z),
    ln: (z) => cLog(z),
    abs: (z) => cAbs(z),
    arg: (z) => cArg(z),
    re: (z) => cRe(z),
    im: (z) => cIm(z),
    conj: (z) => cConj(z),
    sin: (z) => cSin(z),
    sen: (z) => cSin(z),
    cos: (z) => cCos(z),
    tan: (z) => cTan(z),
    tg: (z) => cTan(z),
    asin: (z) => cAsin(z),
    arcsin: (z) => cAsin(z),
    arcsen: (z) => cAsin(z),
    acos: (z) => cAcos(z),
    arccos: (z) => cAcos(z),
    atan: (z) => cAtan(z),
    arctan: (z) => cAtan(z),
    arctg: (z) => cAtan(z),
    sinh: (z) => C(Math.sinh(z.re) * Math.cos(z.im), Math.cosh(z.re) * Math.sin(z.im)),
    cosh: (z) => C(Math.cosh(z.re) * Math.cos(z.im), Math.sinh(z.re) * Math.sin(z.im)),
    floor: (z) => C(Math.floor(z.re), 0),
    ceil: (z) => C(Math.ceil(z.re), 0),
    round: (z) => C(Math.round(z.re), 0),
  };

  const CONSTS = {
    pi: C(Math.PI, 0),
    "π": C(Math.PI, 0),
    tau: C(2 * Math.PI, 0),
    e: C(Math.E, 0),
    "ℯ": C(Math.E, 0),
    i: C(0, 1),
    I: C(0, 1),
    j: C(0, 1),
  };

  /* ---------------- Normalización de texto ---------------- */
  // mode: 'expr' (por defecto) | 'matrix'
  function normalizeInput(s, mode) {
    if (s == null) return "";
    let t = String(s).trim();
    t = t
      .replace(/[\u2212\u2013\u2014]/g, "-")
      .replace(/[\u00d7\u00b7\u22c5]/g, "*")
      .replace(/[\u00f7\u2215]/g, "/")
      .replace(/\u03c0/g, "pi")
      .replace(/\u221a/g, "sqrt")
      .replace(/\u221e/g, "inf");
    if (mode === "matrix") {
      // conserva espacios y comas como separadores de celdas
      return t.replace(/\s+/g, " ");
    }
    t = t.replace(/\s+/g, "");
    // coma decimal (3,14) — solo entre dígitos y si no hay funciones con
    // varios argumentos (min(2,3) no es el número 2,3)
    if (!/\b(min|max)\s*\(/i.test(t)) {
      t = t.replace(/(\d),(\d)/g, "$1.$2");
    }
    return t;
  }

  // Nombres multi-letra reconocidos (funciones y constantes).
  // Cualquier otra letra es una variable de un solo símbolo (x, y, z, x1…),
  // de modo que "2xy" se interpreta como 2·x·y.
  const KNOWN_NAMES = [
    "arcsin", "arccos", "arctan", "arcsen", "arctg", "sqrt", "sinh", "cosh", "tanh",
    "floor", "round", "ceil", "conj", "asin", "acos", "atan", "sen", "tg",
    "sin", "cos", "tan", "exp", "log", "ln", "abs", "arg", "min", "max",
    "pi", "tau", "inf",
  ].sort((a, b) => b.length - a.length);

  /* ---------------- Tokenizer ---------------- */
  function tokenize(src) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (/\s/.test(ch)) {
        i++;
        continue;
      }
      if (/[0-9.]/.test(ch)) {
        let j = i + 1;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        if (j < src.length && /[eE]/.test(src[j]) && j + 1 < src.length && /[0-9+\-]/.test(src[j + 1])) {
          let k = j + 1;
          if (/[+\-]/.test(src[k])) k++;
          while (k < src.length && /[0-9]/.test(src[k])) k++;
          j = k;
        }
        const num = src.slice(i, j);
        if (isNaN(Number(num))) throw new Error("Número no válido: " + num);
        tokens.push({ t: "num", v: Number(num) });
        i = j;
        continue;
      }
      if (/[a-zA-Zα-ωΑ-Ω_]/.test(ch)) {
        let matched = null;
        for (const name of KNOWN_NAMES) {
          if (src.startsWith(name, i)) {
            const after = src[i + name.length];
            const isFunc = Object.prototype.hasOwnProperty.call(FUNCS, name);
            // Las funciones pueden ir pegadas a su argumento (senx = sen(x));
            // las constantes exigen que lo que sigue no sea una letra.
            if (isFunc || after === undefined || !/[a-zA-Zα-ωΑ-Ω_]/.test(after)) {
              matched = name;
              break;
            }
          }
        }
        if (matched) {
          tokens.push({ t: "id", v: matched });
          i += matched.length;
        } else {
          let j = i + 1;
          while (j < src.length && /[0-9]/.test(src[j])) j++;
          tokens.push({ t: "id", v: src.slice(i, j) });
          i = j;
        }
        continue;
      }
      if ("+-*/^(),!".includes(ch)) {
        tokens.push({ t: ch });
        i++;
        continue;
      }
      throw new Error("Símbolo no reconocido: '" + ch + "'");
    }
    return tokens;
  }

  /* ---------------- Parser (AST) ---------------- */
  // AST: {k:'num',v} | {k:'var',v} | {k:'fn',f,args} | {k:'bin',op,l,r} | {k:'neg',x}
  function parse(src) {
    const tokens = tokenize(src);
    let p = 0;
    const peek = () => tokens[p];
    const next = () => tokens[p++];
    const expect = (t) => {
      const tk = next();
      if (!tk || tk.t !== t) throw new Error("Se esperaba '" + t + "'");
      return tk;
    };

    function startsPrimary(tk) {
      return tk && (tk.t === "num" || tk.t === "id" || tk.t === "(");
    }

    function parseExpr() {
      let node = parseTerm();
      while (peek() && (peek().t === "+" || peek().t === "-")) {
        const op = next().t;
        const r = parseTerm();
        node = { k: "bin", op, l: node, r };
      }
      return node;
    }

    function parseTerm() {
      let node = parseUnary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === "*" || tk.t === "/")) {
          const op = next().t;
          node = { k: "bin", op, l: node, r: parseUnary() };
        } else if (startsPrimary(tk)) {
          // multiplicación implícita: 2x, 3(x+1), x y
          node = { k: "bin", op: "*", l: node, r: parseUnary() };
        } else break;
      }
      return node;
    }

    function parseUnary() {
      const tk = peek();
      if (tk && tk.t === "-") {
        next();
        return { k: "neg", x: parseUnary() };
      }
      if (tk && tk.t === "+") {
        next();
        return parseUnary();
      }
      return parsePower();
    }

    function parsePower() {
      const base = parsePostfix();
      if (peek() && peek().t === "^") {
        next();
        const exp = parseUnary(); // asociativo a la derecha, admite -x
        return { k: "bin", op: "^", l: base, r: exp };
      }
      return base;
    }

    function parsePostfix() {
      let node = parsePrimary();
      while (peek() && peek().t === "!") {
        next();
        node = { k: "fn", f: "fact", args: [node] };
      }
      return node;
    }

    function parsePrimary() {
      const tk = next();
      if (!tk) throw new Error("Expresión incompleta");
      if (tk.t === "num") return { k: "num", v: tk.v };
      if (tk.t === "id") {
        const name = tk.v;
        if (peek() && peek().t === "(") {
          next();
          const args = [];
          if (peek() && peek().t === ")") {
            next();
          } else {
            args.push(parseExpr());
            while (peek() && peek().t === ",") {
              next();
              args.push(parseExpr());
            }
            expect(")");
          }
          return { k: "fn", f: name, args };
        }
        // aplicación implícita: senx, log2, sqrt3 → f(x)
        if (Object.prototype.hasOwnProperty.call(FUNCS, name) && startsPrimary(peek())) {
          return { k: "fn", f: name, args: [parsePostfix()] };
        }
        return { k: "var", v: name };
      }
      if (tk.t === "(") {
        const node = parseExpr();
        expect(")");
        return node;
      }
      throw new Error("Token inesperado: " + tk.t);
    }

    const ast = parseExpr();
    if (p !== tokens.length) throw new Error("Sobra contenido en la expresión");
    return ast;
  }

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) return NaN;
    let r = 1;
    for (let k = 2; k <= n; k++) r *= k;
    return r;
  }

  /* ---------------- Evaluación ---------------- */
  function evalAST(node, env, consts) {
    switch (node.k) {
      case "num":
        return C(node.v, 0);
      case "var": {
        const name = node.v;
        if (env && Object.prototype.hasOwnProperty.call(env, name)) return env[name];
        if (consts && Object.prototype.hasOwnProperty.call(consts, name)) return consts[name];
        if (Object.prototype.hasOwnProperty.call(CONSTS, name)) return CONSTS[name];
        throw new Error("Variable sin asignar: " + name);
      }
      case "neg":
        return cNeg(evalAST(node.x, env, consts));
      case "bin": {
        const l = evalAST(node.l, env, consts);
        const r = evalAST(node.r, env, consts);
        switch (node.op) {
          case "+":
            return cAdd(l, r);
          case "-":
            return cSub(l, r);
          case "*":
            return cMul(l, r);
          case "/":
            return cDiv(l, r);
          case "^":
            return cPow(l, r);
        }
        throw new Error("Operador desconocido");
      }
      case "fn": {
        const f = node.f;
        if (f === "fact") {
          const z = evalAST(node.args[0], env, consts);
          return C(factorial(z.re), 0);
        }
        if (f === "min" || f === "max") {
          const vals = node.args.map((a) => evalAST(a, env, consts).re);
          return C(Math[f].apply(null, vals), 0);
        }
        const fn = FUNCS[f];
        if (!fn) throw new Error("Función desconocida: " + f);
        if (node.args.length !== 1) throw new Error("La función " + f + " espera 1 argumento");
        return fn(evalAST(node.args[0], env, consts));
      }
    }
    throw new Error("Nodo AST inválido");
  }

  /* ---------------- Equivalencia ---------------- */
  function parseExprString(s) {
    return parse(normalizeInput(s));
  }

  function freeVars(ast, out) {
    out = out || new Set();
    if (!ast) return out;
    if (ast.k === "var") {
      if (!Object.prototype.hasOwnProperty.call(CONSTS, ast.v)) out.add(ast.v);
    } else if (ast.k === "neg") freeVars(ast.x, out);
    else if (ast.k === "bin") {
      freeVars(ast.l, out);
      freeVars(ast.r, out);
    } else if (ast.k === "fn") ast.args.forEach((a) => freeVars(a, out));
    return out;
  }

  function isFiniteC(z) {
    return Number.isFinite(z.re) && Number.isFinite(z.im);
  }

  function nearlyEqual(a, b, tol) {
    if (!isFiniteC(a) || !isFiniteC(b)) return false;
    const diff = Math.hypot(a.re - b.re, a.im - b.im);
    const scale = Math.max(1, Math.hypot(a.re, a.im), Math.hypot(b.re, b.im));
    return diff <= tol * scale;
  }

  function sameComplex(a, b, tol) {
    return nearlyEqual(a, b, tol || 1e-9);
  }

  // ¿son equivalentes dos expresiones? Muestreo aleatorio en ℂ con valores
  // DISTINTOS por variable y por intento (imposible de engañar con un
  // polinomio anulador conocido de antemano).
  function equivalentExprs(astA, astB, vars, tol) {
    tol = tol || 1e-6;
    const vs = Array.from(new Set([...freeVars(astA), ...freeVars(astB)]));
    if (vs.length === 0) {
      let a, b;
      try {
        a = evalAST(astA, null, null);
        b = evalAST(astB, null, null);
      } catch (e) {
        return false;
      }
      if (!isFiniteC(a) || !isFiniteC(b)) return false;
      return nearlyEqual(a, b, tol);
    }
    // Semilla nueva en cada llamada: los puntos de muestreo no son públicos.
    const seed = Math.random() * 1000 + 0.12345;
    // Región de muestreo ANCHA: |Im| llega a ±9 (muy por encima de π) para que
    // identidades de rama tipo log(exp(v))=v (solo válida en |Im v|<π) queden
    // detectadas en la inmensa mayoría de los puntos.
    const pointFor = (k, t) => {
      const h1 = Math.sin(seed + 12.9898 * (k + 1) + 78.233 * (t + 1)) * 43758.5453;
      const h2 = Math.sin(seed + 39.3468 * (k + 1) + 11.135 * (t + 1)) * 24634.6345;
      const re = ((h1 - Math.floor(h1)) * 8.4) - 4.2;
      const im = ((h2 - Math.floor(h2)) * 18.0) - 9.0;
      // evita valores exactamente nulos o enteros pequeños
      return C(re < 0 ? re - 0.37 : re + 0.37, im < 0 ? im - 0.21 : im + 0.21);
    };
    // Puntos-sonda FIJOS que rompen las identidades de rama (log(x)+log(y) vs
    // log(xy), sqrt(xy) vs sqrt(x)sqrt(y), …). Se evalúan siempre; si detectan
    // una diferencia, las expresiones NO son equivalentes (sin depender del azar).
    const PROBES = [
      C(-2.37, -5.11), // tercer cuadrante, Im < −π
      C(1.23, 4.2), // Im > π
      C(-3.1, 0.4), // semiplano izquierdo
      C(0.7, -7.3), // Im < −π
      C(-1.7, 2.6), // segundo cuadrante, Im ≈ π
    ];
    let compared = 0;
    let probeIndex = 0;
    const trials = Math.max(16, vs.length + 12) + PROBES.length;
    for (let t = 0; t < trials; t++) {
      const env = {};
      if (t < PROBES.length) {
        for (let k = 0; k < vs.length; k++) env[vs[k]] = PROBES[t];
      } else {
        for (let k = 0; k < vs.length; k++) {
          env[vs[k]] = pointFor(k, t + probeIndex); // valor distinto para cada variable
        }
        probeIndex++;
      }
      let a, b;
      try {
        a = evalAST(astA, env, null);
        b = evalAST(astB, env, null);
      } catch (e) {
        continue;
      }
      if (!isFiniteC(a) || !isFiniteC(b)) continue;
      compared++;
      if (!nearlyEqual(a, b, tol)) return false;
    }
    // Exigir al menos TRES puntos comparados con éxito: impide el exploit
    // «1/(x−x) aprueba cualquier cosa» (expresiones no finitas en todo punto).
    return compared >= 3;
  }

  /* ---------------- Equivalencia estructural (normalización algebraica) ----------------
     Convierte cada expresión en una fracción de polinomios sobre «átomos»
     (subexpresiones trascendentes: log(x), sin(y), sqrt(z), …). Dos expresiones
     son equivalentes si y solo si la diferencia cruzada de numeradores y
     denominadores es el polinomio nulo. Esto rechaza DE FORMA DETERMINISTA las
     identidades falsas de rama (log x + log y vs log(xy), …) y acepta todas las
     transformaciones algebraicas (desarrollos, factorizaciones, orden de términos).
     ----------------------------------------------------------------------------------- */

  function polyNew() {
    return new Map(); // clave de monomio (JSON de [[var,exp],…]) → {re, im}
  }
  function monoKey(factors) {
    // factors: Map de var→exp o array de [var, exp] → clave canónica (JSON)
    const arr = [];
    const push = (v, e) => {
      if (e !== 0 && Number.isFinite(e)) arr.push([String(v), e]);
    };
    if (factors instanceof Map) factors.forEach((e, v) => push(v, e));
    else factors.forEach(([v, e]) => push(v, e));
    arr.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    return JSON.stringify(arr);
  }
  function varKey(v) {
    return monoKey([[v, 1]]);
  }
  function monoCombine(k1, k2) {
    const map = new Map();
    JSON.parse(k1).forEach(([v, e]) => map.set(v, (map.get(v) || 0) + e));
    JSON.parse(k2).forEach(([v, e]) => map.set(v, (map.get(v) || 0) + e));
    return monoKey(map);
  }
  function polySet(p, key, coef) {
    if (!Number.isFinite(coef.re) || !Number.isFinite(coef.im)) {
      throw new Error("coeficiente no finito");
    }
    const cur = p.get(key);
    if (cur) {
      const s = cAdd(cur, coef);
      if (Math.hypot(s.re, s.im) < 1e-12) p.delete(key);
      else p.set(key, s);
    } else if (Math.hypot(coef.re, coef.im) >= 1e-12) {
      p.set(key, coef);
    }
    return p;
  }
  function polyAddTo(p, q, scale) {
    q.forEach((coef, key) => polySet(p, key, scale ? cMul(coef, scale) : coef));
    return p;
  }
  function polyMul(a, b) {
    const out = polyNew();
    a.forEach((ca, ka) => {
      b.forEach((cb, kb) => {
        polySet(out, monoCombine(ka, kb), cMul(ca, cb));
      });
    });
    return out;
  }
  function polyPowInt(a, n) {
    if (n < 0) throw new Error("exponente negativo en polinomio");
    let out = polyNew();
    out.set("[]", C(1, 0));
    let base = a;
    while (n > 0) {
      if (n & 1) out = polyMul(out, base);
      base = polyMul(base, base);
      n >>= 1;
    }
    return out;
  }
  function polyIsZero(p, tol) {
    tol = tol || 1e-8;
    for (const coef of p.values()) {
      if (!Number.isFinite(coef.re) || !Number.isFinite(coef.im)) return false;
      if (Math.hypot(coef.re, coef.im) > tol) return false;
    }
    return true;
  }
  function polySub(a, b) {
    const out = polyNew();
    polyAddTo(out, a);
    polyAddTo(out, b, C(-1, 0));
    return out;
  }

  // sustituciones de identidades verdaderas de la rama principal
  function rewriteTrueIdentities(node) {
    if (!node || typeof node !== "object") return node;
    if (node.k === "bin" && node.op === "^") {
      const r = node.r;
      const two = r && r.k === "num" && Math.abs(r.v - 2) < 1e-12;
      const half = r && r.k === "num" && Math.abs(r.v - 0.5) < 1e-12;
      const l = rewriteTrueIdentities(node.l);
      if (two && l.k === "fn" && l.f === "sqrt" && l.args.length === 1) {
        return rewriteTrueIdentities(l.args[0]); // (sqrt u)^2 = u
      }
      if (two && l.k === "fn" && l.f === "cos" && l.args.length === 1) {
        // cos(u)^2 = 1 - sen(u)^2  (identidad pitagórica)
        return {
          k: "bin", op: "-",
          l: { k: "num", v: 1 },
          r: { k: "bin", op: "^", l: { k: "fn", f: "sin", args: [l.args[0]] }, r: { k: "num", v: 2 } },
        };
      }
      if (two && l.k === "fn" && l.f === "cosh" && l.args.length === 1) {
        // cosh(u)^2 = 1 + sinh(u)^2
        return {
          k: "bin", op: "+",
          l: { k: "num", v: 1 },
          r: { k: "bin", op: "^", l: { k: "fn", f: "sinh", args: [l.args[0]] }, r: { k: "num", v: 2 } },
        };
      }
      if (half) return { k: "fn", f: "sqrt", args: [l] }; // u^(1/2) = sqrt(u)
      return { k: "bin", op: "^", l, r: rewriteTrueIdentities(node.r) };
    }
    if (node.k === "fn" && (node.f === "exp") && node.args.length === 1) {
      const inner = rewriteTrueIdentities(node.args[0]);
      if (inner.k === "fn" && (inner.f === "log" || inner.f === "ln") && inner.args.length === 1) {
        return rewriteTrueIdentities(inner.args[0]); // exp(log u) = u
      }
      return { k: "fn", f: "exp", args: [inner] };
    }
    if (node.k === "fn" && node.f === "conj" && node.args.length === 1) {
      const inner = rewriteTrueIdentities(node.args[0]);
      if (inner.k === "fn" && inner.f === "conj") return inner.args[0]; // conj(conj u) = u
      if (inner.k === "bin" && (inner.op === "*" || inner.op === "+")) {
        return {
          k: "bin", op: inner.op,
          l: { k: "fn", f: "conj", args: [inner.l] },
          r: { k: "fn", f: "conj", args: [inner.r] },
        };
      }
      return { k: "fn", f: "conj", args: [inner] };
    }
    if (node.k === "bin" && node.op === "*") {
      const l = rewriteTrueIdentities(node.l);
      const r = rewriteTrueIdentities(node.r);
      if (l.k === "fn" && r.k === "fn" && l.f === "sqrt" && r.f === "sqrt" &&
          l.args.length === 1 && r.args.length === 1 &&
          serializeAST(l.args[0]) === serializeAST(r.args[0])) {
        return l.args[0]; // sqrt(u)*sqrt(u) = u
      }
      return { k: "bin", op: "*", l, r };
    }
    if (node.k === "neg") return { k: "neg", x: rewriteTrueIdentities(node.x) };
    if (node.k === "fn") return { k: "fn", f: node.f, args: node.args.map(rewriteTrueIdentities) };
    if (node.k === "bin") {
      return { k: "bin", op: node.op, l: rewriteTrueIdentities(node.l), r: rewriteTrueIdentities(node.r) };
    }
    return node;
  }

  const FN_ALIASES = {
    sen: "sin", tg: "tan", arcsen: "asin", arctg: "atan",
    arcsin: "asin", arccos: "acos", arctan: "atan", ln: "log",
    senh: "sinh", coseno: "cos",
  };

  function serializeAST(node) {
    // plegado de cualquier subexpresión constante (1/2 ≡ 0.5, min(2,3) ≡ 3)
    if (node && typeof node === "object" && node.k !== undefined && freeVars(node, new Set()).size === 0) {
      try {
        const z = evalAST(node, null, null);
        return "c" + z.re.toFixed(10) + "," + z.im.toFixed(10);
      } catch (e) {
        /* sigue con la forma estructural */
      }
    }
    switch (node.k) {
      case "num": {
        let z;
        try {
          z = evalAST(node, null, null);
        } catch (e) {
          z = C(node.v, 0);
        }
        return "c" + z.re.toFixed(10) + "," + z.im.toFixed(10);
      }
      case "var": {
        if (Object.prototype.hasOwnProperty.call(CONSTS, node.v)) {
          const z = evalAST(node, null, null);
          return "c" + z.re.toFixed(10) + "," + z.im.toFixed(10);
        }
        return node.v;
      }
      case "neg":
        return "-(" + serializeAST(node.x) + ")";
      case "bin": {
        const l = serializeAST(node.l);
        const r = serializeAST(node.r);
        if (node.op === "+" || node.op === "*") {
          // operadores conmutativos: orden canónico de factores/sumandos
          return "(" + node.op + [l, r].sort().join(" ") + ")";
        }
        if (node.op === "/" && node.r && freeVars(node.r, new Set()).size === 0) {
          // x/c ≡ x·(1/c)
          try {
            const z = evalAST(node.r, null, null);
            const inv = cDiv(C(1, 0), z);
            return "(*" + [l, "c" + inv.re.toFixed(10) + "," + inv.im.toFixed(10)].sort().join(" ") + ")";
          } catch (e) {
            /* forma estructural */
          }
        }
        return "(" + l + node.op + r + ")";
      }
      case "fn":
        return (FN_ALIASES[node.f] || node.f) + "(" + node.args.map(serializeAST).join(",") + ")";
    }
    return "?";
  }

  // Esqueleto trascendente: multiconjunto de átomos no algebraicos.
  // Dos expresiones solo pueden compararse numéricamente si coinciden en esqueleto.
  function atomSkeleton(node, out) {
    out = out || [];
    if (!node || typeof node !== "object") return out;
    const isConst = (n) => freeVars(n, new Set()).size === 0;
    if (node.k === "fn" && !isConst(node)) {
      out.push("@" + serializeAST(node));
    }
    if (node.k === "bin" && node.op === "^" && !isConst(node.l)) {
      const e = node.r;
      let integerExp = e.k === "num" && Number.isInteger(e.v);
      if (!integerExp && isConst(e)) {
        try {
          const ez = evalAST(e, null, null);
          integerExp = ez.im === 0 && Number.isInteger(ez.re);
        } catch (err) {
          integerExp = false;
        }
      }
      if (!integerExp) out.push("**" + serializeAST(node));
    }
    if (node.k === "neg") atomSkeleton(node.x, out);
    else if (node.k === "bin") {
      atomSkeleton(node.l, out);
      atomSkeleton(node.r, out);
    } else if (node.k === "fn") node.args.forEach((a) => atomSkeleton(a, out));
    return out;
  }

  // Expr → { n: Poly, d: Poly } | null (null = no soportado → vía numérica)
  function toRationalPoly(node) {
    const cache = new Map();
    function isConst(n) {
      return freeVars(n, new Set()).size === 0;
    }
    function constCoef(n) {
      return evalAST(n, null, null);
    }
    function go(n) {
      if (isConst(n)) {
        const c = constCoef(n);
        if (!isFiniteC(c)) throw new Error("constante no finita");
        const p = polyNew();
        p.set("[]", c);
        return { n: p, d: null };
      }
      const ser = serializeAST(n);
      if (cache.has(ser)) return cache.get(ser);
      let out;
      switch (n.k) {
        case "var": {
          const p = polyNew();
          p.set(varKey(n.v), C(1, 0));
          out = { n: p, d: null };
          break;
        }
        case "neg": {
          const a = go(n.x);
          out = { n: polyScale(a.n, C(-1, 0)), d: a.d };
          break;
        }
        case "bin": {
          const a = go(n.l);
          const b = go(n.r);
          if (n.op === "+") out = addRat(a, b);
          else if (n.op === "-") out = addRat(a, { n: polyScale(b.n, C(-1, 0)), d: b.d });
          else if (n.op === "*") out = mulRat(a, b);
          else if (n.op === "/") out = mulRat(a, { n: b.d || constPoly(1), d: b.n });
          else if (n.op === "^") {
            const e = n.r;
            let ev = null;
            if (e.k === "num") ev = e.v;
            else if (isConst(e)) {
              const ez = constCoef(e);
              if (ez.im === 0 && Number.isInteger(ez.re)) ev = ez.re; // admite -(n)
            }
            if (ev === null || !Number.isInteger(ev) || Math.abs(ev) > 64) return null;
            if (ev === 0) out = { n: constPoly(1), d: null };
            else if (ev > 0) out = powRat(a, ev);
            else {
              // exponente entero negativo: recíproco de la potencia
              out = powRat({ n: a.d || constPoly(1), d: a.n }, -ev);
            }
          } else return null;
          break;
        }
        case "fn": {
          // átomo trascendente (argumento no constante)
          const p = polyNew();
          p.set(varKey("@" + ser), C(1, 0));
          out = { n: p, d: null };
          break;
        }
        default:
          return null;
      }
      if (out && out.d && polyIsZero(out.d)) {
        throw new Error("denominador nulo");
      }
      cache.set(ser, out);
      return out;
    }
    function constPoly(c) {
      const p = polyNew();
      p.set("[]", typeof c === "number" ? C(c, 0) : c);
      return p;
    }
    function polyScale(p, c) {
      const out = polyNew();
      p.forEach((coef, key) => polySet(out, key, cMul(coef, c)));
      return out;
    }
    function addRat(a, b) {
      const an = a.n,
        ad = a.d;
      const bn = b.n,
        bd = b.d;
      if (!ad && !bd) return { n: polyAddTo(polyAddTo(polyNew(), an), bn), d: null };
      const d1 = ad || constPoly(1);
      const d2 = bd || constPoly(1);
      return {
        n: polyAddTo(polyAddTo(polyNew(), polyMul(an, d2)), polyMul(bn, d1)),
        d: polyMul(d1, d2),
      };
    }
    function mulRat(a, b) {
      return {
        n: polyMul(a.n, b.n),
        d: a.d || b.d ? polyMul(a.d || constPoly(1), b.d || constPoly(1)) : null,
      };
    }
    function powRat(a, k) {
      return {
        n: polyPowInt(a.n, k),
        d: a.d ? polyPowInt(a.d, k) : null,
      };
    }
    return go(node);
  }

  function structurallyEqual(astA, astB) {
    try {
      const a = toRationalPoly(rewriteTrueIdentities(astA));
      const b = toRationalPoly(rewriteTrueIdentities(astB));
      if (!a || !b) return null; // sin decidir → vía numérica
      const d1 = a.d || null,
        d2 = b.d || null;
      const cross = polySub(
        polyMul(a.n, d2 || (() => {
          const p = polyNew();
          p.set("[]", C(1, 0));
          return p;
        })()),
        polyMul(b.n, d1 || (() => {
          const p = polyNew();
          p.set("[]", C(1, 0));
          return p;
        })())
      );
      return polyIsZero(cross);
    } catch (e) {
      return null;
    }
  }

  function equivalentStrings(sa, sb, tol) {
    try {
      const na = normalizeInput(sa);
      const nb = normalizeInput(sb);
      if (na === nb && na !== "") return true; // idénticas: sin riesgo de rama
      const a = parseExprString(sa);
      const b = parseExprString(sb);
      const structural = structurallyEqual(a, b);
      if (structural !== null) return structural;
      // Vía numérica SOLO si el esqueleto trascendente coincide: impide que una
      // perturbación con exponentes no enteros (u otras formas no soportadas)
      // reabra las identidades falsas de rama.
      const sa1 = atomSkeleton(a).sort().join("|");
      const sb1 = atomSkeleton(b).sort().join("|");
      if (sa1 !== sb1) return false;
      return equivalentExprs(a, b, null, tol);
    } catch (e) {
      return false;
    }
  }

  /* ---------------- Parseo de matrices ---------------- */
  function parseMatrixText(text) {
    // "1 2; 3 4" | "1,2;3,4" | "[[1,2],[3,4]]"
    let t = normalizeInput(text, "matrix");
    if (t.startsWith("[[")) {
      try {
        const arr = JSON.parse(t.replace(/;/g, ","));
        return arr.map((row) => (Array.isArray(row) ? row.map((x) => String(x)) : [String(row)]));
      } catch (e) {
        throw new Error("Matriz no válida");
      }
    }
    const rows = t.split(";");
    return rows.map((row) => {
      const r = row.trim();
      if (r === "") return [];
      if (r.includes(",")) return r.split(",").map((c) => c.trim()).filter((c) => c !== "");
      return r.split(/\s+/).filter(Boolean).map(String);
    });
  }

  function matrixDims(m) {
    const rows = m.length;
    const cols = rows ? m[0].length : 0;
    for (const r of m) if (r.length !== cols) throw new Error("Filas de distinta longitud");
    return { rows, cols };
  }

  function equivalentMatrices(a, b, tol, exact) {
    const da = matrixDims(a);
    const db = matrixDims(b);
    if (da.rows !== db.rows || da.cols !== db.cols) return false;
    for (let r = 0; r < da.rows; r++) {
      for (let c = 0; c < da.cols; c++) {
        const s = String(a[r][c]);
        const e = String(b[r][c]);
        if (exact) {
          if (normalizeInput(s) !== normalizeInput(e) && !numberMatches(s, e, 0, true)) return false;
        } else if (!equivalentStrings(s, e, tol)) return false;
      }
    }
    return true;
  }

  /* ---------------- Comparación de números ---------------- */
  function numberMatches(student, expected, tol, exact) {
    let z;
    try {
      z = evalAST(parseExprString(student), null, null);
    } catch (e) {
      return false;
    }
    let w;
    try {
      w =
        typeof expected === "number"
          ? C(expected, 0)
          : evalAST(parseExprString(String(expected)), null, null);
    } catch (e) {
      return false;
    }
    if (exact) {
      return Number.isInteger(z.re) && Math.abs(z.im) < 1e-12 && z.re === w.re;
    }
    return nearlyEqual(z, w, tol || 1e-6);
  }

  /* ---------------- Conjuntos (p. ej. autovalores) ---------------- */
  function parseSet(text) {
    return String(text)
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s !== "");
  }

  function equivalentSets(studentList, expectedList, tol) {
    if (studentList.length !== expectedList.length) return false;
    const used = new Array(expectedList.length).fill(false);
    for (const s of studentList) {
      let found = false;
      for (let k = 0; k < expectedList.length; k++) {
        if (used[k]) continue;
        if (equivalentStrings(s, String(expectedList[k]), tol)) {
          used[k] = true;
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  /* ---------------- API principal ---------------- */
  /**
   * check(spec, answer) -> { ok, error? }
   * spec.answer o spec esperado:
   *  { type:'expr', expected:'...', vars:[...], tol? }
   *  { type:'number', expected:'2/3', tol?, exact? }
   *  { type:'matrix'|'vector', rows?, cols?, expected:[[...]] }
   *  { type:'bool', expected:true }
   *  { type:'choice', expected: 0 }
   *  { type:'exprset', expected:['1','2'] }
   *  { type:'multi', fields:{ id: subSpec } }  // answer = {id: value}
   *  { expectedOneOf: [...] } // cualquiera de varias formas válidas
   */
  function check(spec, answer) {
    if (!spec || !spec.type) return { ok: false, error: "Falta el tipo de respuesta" };
    const tol = spec.tol || 1e-6;
    const type = spec.type;

    try {
      if (type === "multi") {
        const fields = spec.fields || {};
        const keys = Object.keys(fields);
        if (!answer || typeof answer !== "object") return { ok: false, error: "Faltan campos" };
        for (const k of keys) {
          const sub = fields[k];
          const res = check(sub, answer[k]);
          if (!res.ok) return { ok: false, error: res.error || "Campo '" + k + "' incorrecto" };
        }
        return { ok: true };
      }

      if (type === "choice") {
        const raw = String(answer == null ? "" : answer).trim();
        if (!/^\d+$/.test(raw)) return { ok: false, error: "Selecciona una opción" };
        return { ok: parseInt(raw, 10) === spec.expected };
      }

      if (type === "bool") {
        const s = String(answer == null ? "" : answer).trim().toLowerCase();
        const truthy = s === "true" || s === "verdadero" || s === "v" || s === "1" || s === "sí" || s === "si";
        const falsy = s === "false" || s === "falso" || s === "f" || s === "0" || s === "no";
        const val = truthy ? true : falsy ? false : null;
        if (val === null) return { ok: false, error: "Selecciona verdadero o falso" };
        return { ok: val === spec.expected };
      }

      if (type === "text") {
        const raw = String(answer == null ? "" : answer).trim().replace(/\s+/g, " ");
        const exp = String(spec.expected == null ? "" : spec.expected).trim().replace(/\s+/g, " ");
        return { ok: raw === exp };
      }

      if (type === "exprset") {
        let student;
        if (Array.isArray(answer)) student = answer.map((x) => normalizeInput(String(x)));
        else student = parseSet(normalizeInput(answer));
        const expected = (spec.expected || []).map(String);
        return { ok: equivalentSets(student, expected, tol) };
      }

      if (type === "matrix" || type === "vector") {
        let studentM;
        if (Array.isArray(answer)) {
          studentM = answer.map((row) => (Array.isArray(row) ? row.map(String) : [String(row)]));
        } else {
          studentM = parseMatrixText(String(answer));
        }
        const expectedM = (spec.expected || []).map((row) => row.map(String));
        const ds = matrixDims(studentM);
        const de = matrixDims(expectedM);
        if (ds.rows !== de.rows || ds.cols !== de.cols) {
          return { ok: false, error: "Dimensiones incorrectas (se espera " + de.rows + "×" + de.cols + ")" };
        }
        return { ok: equivalentMatrices(studentM, expectedM, tol, spec.exact) };
      }

      if (type === "number") {
        const raw = String(answer == null ? "" : answer).trim();
        if (raw === "") return { ok: false, error: "Respuesta vacía" };
        const candidates = spec.expectedOneOf || [spec.expected];
        for (const cand of candidates) {
          if (numberMatches(raw, cand, tol, spec.exact)) return { ok: true };
        }
        return { ok: false };
      }

      if (type === "expr") {
        const raw = String(answer == null ? "" : answer).trim();
        if (raw === "") return { ok: false, error: "Respuesta vacía" };
        const candidates = spec.expectedOneOf || [spec.expected];
        for (const cand of candidates) {
          if (equivalentStrings(raw, String(cand), tol)) return { ok: true };
        }
        return { ok: false };
      }

      return { ok: false, error: "Tipo no soportado: " + type };
    } catch (e) {
      return { ok: false, error: e.message || "No se pudo interpretar la respuesta" };
    }
  }

  /** Evalúa una expresión a {re,im} (para tests y demos). */
  function evaluate(str, env) {
    const e = {};
    if (env) for (const k of Object.keys(env)) e[k] = C(env[k].re !== undefined ? env[k].re : env[k], env[k].im || 0);
    return evalAST(parseExprString(str), e, null);
  }

  return {
    check,
    evaluate,
    parse: parseExprString,
    normalize: normalizeInput,
    equivalent: equivalentStrings,
    parseMatrix: parseMatrixText,
  };
});
