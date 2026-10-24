/* ============================================================
   App — renderizado del curso: KaTeX, ejercicios, mapas,
   resúmenes, progreso y modo examen
   ============================================================ */
(function () {
  "use strict";

  const D = (window.CURSO_DATA = window.CURSO_DATA || {});
  const G = window.Grader;

  /* ---------------- Utilidades ---------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let uid = 0;
  const nextId = (p) => (p || "f") + "-" + ++uid + "-" + Math.random().toString(36).slice(2, 6);

  /* ---------------- KaTeX ---------------- */
  function renderMath(root) {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(root || document.body, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
      strict: false,
    });
  }

  /* ---------------- Progreso ---------------- */
  const PROGRESS_KEY = "curso-algebra-progreso-v1";
  function loadProgress() {
    try {
      const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return p && typeof p === "object" && !Array.isArray(p) ? p : {};
    } catch (e) {
      return {};
    }
  }
  function saveProgress(p) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
    } catch (e) {
      /* almacenamiento no disponible */
    }
  }
  function markProgress(id, status) {
    const p = loadProgress();
    p[id] = status;
    saveProgress(p);
    updateThemeProgress();
  }
  function updateThemeProgress() {
    const p = loadProgress();
    $$("[data-theme-progress]").forEach((bar) => {
      const theme = bar.getAttribute("data-theme-progress");
      const drills = (D[theme] && D[theme].drills) || [];
      if (!drills.length) return; // sin datos cargados: no tocar el rótulo
      const done = drills.filter((d) => p[d.id] === "solved").length;
      const pct = Math.round((done / drills.length) * 100);
      bar.style.width = pct + "%";
      const label = $('[data-theme-progress-label="' + theme + '"]');
      if (label) label.textContent = done + " / " + drills.length + " · " + pct + "%";
    });
  }

  /* ---------------- Recuentos declarativos ----------------
     Los números que el HTML anuncia (cuántos ejercicios tiene un tema, cuántos
     hay en todo el curso) se calculan aquí desde los datos, de modo que no
     puedan quedar obsoletos cuando se añada o se retire un ejercicio.

     <span data-count="tema">              → total de ejercicios de ese tema
     <span data-count="curso">             → total de ejercicios de todo el curso
     <span data-count="tema" data-count-suffix=" ejercicios interactivos">
  */
  function initCounts() {
    const totalCurso = Object.keys(D).reduce((acc, k) => {
      const d = D[k] || {};
      const drills = d.drills || (d.exam && d.exam.questions) || [];
      return acc + drills.length;
    }, 0);

    $$("[data-count]").forEach((el) => {
      const que = el.getAttribute("data-count");
      const sufijo = el.getAttribute("data-count-suffix") || "";
      let n = null;
      if (que === "curso") {
        n = totalCurso;
      } else if (D[que]) {
        const d = D[que];
        n = (d.drills || (d.exam && d.exam.questions) || []).length;
      }
      if (n === null) return;
      el.textContent = n + sufijo;
    });
  }

  /* ---------------- Barra de lectura ---------------- */
  function initReadingBar() {
    const fill = $(".progress-bar__fill");
    if (!fill) return;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Navegación móvil ---------------- */
  function initNav() {
    const nav = $(".nav");
    const toggle = $(".nav__toggle");
    if (nav && toggle) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  /* ---------------- Reveal on scroll ---------------- */
  let revealObserver = null;
  function observeReveal(nodes) {
    const items = Array.from(nodes || []);
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("is-in"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              revealObserver.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
    }
    items.forEach((i) => {
      if (!i.classList.contains("is-in")) revealObserver.observe(i);
    });
  }
  function initReveal() {
    observeReveal($$(".reveal"));
  }

  /* ---------------- Resumen ---------------- */
  function renderSummary(container, data) {
    if (!container || !data) return;
    const grid = el("div", "summary__grid");
    data.forEach((block) => {
      const item = el("div", "summary__item");
      item.appendChild(el("h4", null, esc(block.h)));
      const ul = el("ul");
      block.items.forEach((it) => {
        ul.appendChild(el("li", null, it)); // items admiten \(TeX\)
      });
      item.appendChild(ul);
      grid.appendChild(item);
    });
    container.appendChild(grid);
  }

  /* ---------------- Mapa mental (árbol → SVG) ---------------- */
  function renderMindmap(container, tree) {
    if (!container || !tree) return;
    const NODE_W = 200,
      NODE_H = 52,
      GAP_X = 300,
      GAP_Y = 74;

    let leafCount = 0;
    function measure(node) {
      if (!node.children || !node.children.length) {
        node._y = leafCount++ * GAP_Y;
        node._leaves = 1;
      } else {
        node.children.forEach(measure);
        node._leaves = node.children.reduce((s, c) => s + c._leaves, 0);
        node._y = (node.children[0]._y + node.children[node.children.length - 1]._y) / 2;
      }
    }
    measure(tree);
    function depthNodes(node, depth, out) {
      node._x = depth * GAP_X;
      out.push(node);
      (node.children || []).forEach((c) => depthNodes(c, depth + 1, out));
    }
    const nodes = [];
    depthNodes(tree, 0, nodes);
    const W = Math.max.apply(null, nodes.map((n) => n._x)) + NODE_W + 60;
    const H = leafCount * GAP_Y + 40;

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", "100%");
    svg.setAttribute("role", "group");
    svg.setAttribute("aria-label", "Mapa mental interactivo del tema");

    nodes.forEach((n) => {
      (n.children || []).forEach((c) => {
        const x1 = n._x + NODE_W,
          y1 = n._y + NODE_H / 2 + 10,
          x2 = c._x,
          y2 = c._y + NODE_H / 2 + 10;
        const path = document.createElementNS(ns, "path");
        path.setAttribute(
          "d",
          "M" + x1 + "," + y1 + " C" + (x1 + GAP_X * 0.42) + "," + y1 + " " + (x2 - GAP_X * 0.42) + "," + y2 + " " + x2 + "," + y2
        );
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(154,123,40,0.4)");
        path.setAttribute("stroke-width", "1.2");
        svg.appendChild(path);
      });
    });

    nodes.forEach((n) => {
      const g = document.createElementNS(ns, "g");
      g.setAttribute("class", "mindmap__node");
      g.setAttribute("transform", "translate(" + (n._x + 20) + "," + (n._y + 10) + ")");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", n.label + ": " + String(n.detail || "").replace(/<[^>]+>/g, ""));

      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("width", NODE_W);
      rect.setAttribute("height", NODE_H);
      rect.setAttribute("rx", "8");
      rect.setAttribute("fill", n === tree ? "rgba(201,162,39,0.16)" : "#fffdf6");
      rect.setAttribute("stroke", n === tree ? "#9a7b28" : "rgba(28,25,16,0.18)");
      rect.setAttribute("stroke-width", "1");
      g.appendChild(rect);

      const fo = document.createElementNS(ns, "foreignObject");
      fo.setAttribute("width", NODE_W);
      fo.setAttribute("height", NODE_H);
      const div = document.createElement("div");
      div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      div.style.cssText =
        "width:100%;height:100%;display:flex;align-items:center;justify-content:center;" +
        "font-family:Inter,sans-serif;font-size:12.5px;line-height:1.25;text-align:center;" +
        "padding:4px 8px;box-sizing:border-box;color:#1c1910;";
      div.textContent = n.label;
      fo.appendChild(div);
      g.appendChild(fo);

      const showDetail = () => {
        const det = $(".mindmap__detail", container);
        if (det) {
          det.innerHTML = "<b>" + esc(n.label) + "</b>" + (n.detail || "");
          renderMath(det);
        }
      };
      g.addEventListener("click", showDetail);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showDetail();
        }
      });
      svg.appendChild(g);
    });

    container.innerHTML = "";
    container.appendChild(svg);
    const detail = el("div", "mindmap__detail", "<b>Mapa mental</b>Pulsa un nodo para ver su detalle.");
    container.appendChild(detail);
  }

  /* ---------------- Ejercicios ---------------- */
  const LEVEL_LABEL = { normal: "Normal", medio: "Medio", examen: "Examen de grado" };

  function buildAnswerUI(spec) {
    // Devuelve {dom, get}; quien llama inserta `dom` en el árbol.
    const type = spec.type;

    if (type === "multi") {
      const wrap = el("div", "drill__fields");
      const getters = {};
      const fields = spec.fields || {};
      Object.keys(fields).forEach((key) => {
        const f = fields[key];
        const box = el("div", "field");
        const id = nextId("in");
        const lab = el("label", null, esc((spec.labels && spec.labels[key]) || key));
        lab.setAttribute("for", id);
        const ctl = buildAnswerUI(f);
        // asocia el primer control con el label (solo campos de texto:
        // en choice/bool el label del control es su propia opción)
        const first = ctl.dom.querySelector("input[type='text'], input[type='number'], select, textarea");
        if (first) {
          if (!first.id) first.id = id;
          else lab.setAttribute("for", first.id);
          first.setAttribute("aria-label", (spec.labels && spec.labels[key]) || key);
        } else {
          lab.removeAttribute("for");
        }
        box.appendChild(lab);
        box.appendChild(ctl.dom);
        getters[key] = ctl.get;
        wrap.appendChild(box);
      });
      return {
        dom: wrap,
        get: () => {
          const out = {};
          Object.keys(getters).forEach((k) => (out[k] = getters[k]()));
          return out;
        },
      };
    }

    if (type === "matrix" || type === "vector") {
      const rows = spec.rows || (spec.expected && spec.expected.length) || 2;
      const cols =
        spec.cols ||
        (spec.expected && spec.expected[0] && spec.expected[0].length) ||
        2;
      const grid = el("div", "matrix-input");
      grid.style.gridTemplateColumns = "repeat(" + cols + ", auto)";
      grid.setAttribute("role", "group");
      grid.setAttribute("aria-label", "Matriz de respuesta " + rows + " por " + cols);
      const inputs = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          const inp = document.createElement("input");
          inp.type = "text";
          inp.autocomplete = "off";
          inp.setAttribute("aria-label", "Entrada fila " + (r + 1) + " columna " + (c + 1));
          grid.appendChild(inp);
          row.push(inp);
        }
        inputs.push(row);
      }
      return {
        dom: grid,
        get: () => inputs.map((row) => row.map((i) => i.value)),
      };
    }

    if (type === "choice") {
      const wrap = el("div", "choices");
      const choices = spec.choices || [];
      const name = nextId("ch");
      choices.forEach((txt, idx) => {
        const lab = el("label", "choice");
        const inp = document.createElement("input");
        inp.type = "radio";
        inp.name = name;
        inp.value = String(idx);
        lab.appendChild(inp);
        lab.appendChild(el("span", null, txt));
        inp.addEventListener("change", () => {
          $$(".choice", wrap).forEach((c) => c.classList.remove("is-selected"));
          lab.classList.add("is-selected");
        });
        wrap.appendChild(lab);
      });
      return {
        dom: wrap,
        get: () => {
          const sel = wrap.querySelector("input:checked");
          return sel ? parseInt(sel.value, 10) : null;
        },
      };
    }

    if (type === "bool") {
      const wrap = el("div", "choices");
      const name = nextId("bl");
      ["Verdadero", "Falso"].forEach((txt, idx) => {
        const lab = el("label", "choice");
        const inp = document.createElement("input");
        inp.type = "radio";
        inp.name = name;
        inp.value = idx === 0 ? "true" : "false";
        lab.appendChild(inp);
        lab.appendChild(el("span", null, txt));
        inp.addEventListener("change", () => {
          $$(".choice", wrap).forEach((c) => c.classList.remove("is-selected"));
          lab.classList.add("is-selected");
        });
        wrap.appendChild(lab);
      });
      return {
        dom: wrap,
        get: () => {
          const sel = wrap.querySelector("input:checked");
          return sel ? sel.value : null;
        },
      };
    }

    // expr / number / exprset / text → campo de texto
    const wrap = el("div", "field");
    const id = nextId("in");
    const label = el("label", null, esc(spec.fieldLabel || "Tu respuesta"));
    label.setAttribute("for", id);
    const inp = document.createElement("input");
    inp.type = "text";
    inp.id = id;
    inp.autocomplete = "off";
    inp.spellcheck = false;
    inp.placeholder = spec.placeholder || "";
    inp.setAttribute("aria-label", spec.fieldLabel || "Tu respuesta");
    wrap.appendChild(label);
    wrap.appendChild(inp);
    return { dom: wrap, get: () => inp.value };
  }

  function markChoiceFeedback(card, spec, answer) {
    if (!spec || (spec.type !== "choice" && spec.type !== "bool")) return;
    const labels = $$(".choice", card);
    labels.forEach((lab) => {
      lab.classList.remove("is-right", "is-wrong");
      const inp = lab.querySelector("input");
      if (!inp) return;
      const val = spec.type === "choice" ? parseInt(inp.value, 10) : inp.value === "true";
      if (val === spec.expected) lab.classList.add("is-right");
      else if (inp.checked) lab.classList.add("is-wrong");
    });
  }

  function createDrill(drill, opts) {
    opts = opts || {};
    const card = el("article", "drill reveal");
    card.id = drill.id;
    card.setAttribute("data-drill", drill.id);

    const head = el("div", "drill__head");
    head.appendChild(el("span", "drill__id", esc(drill.id)));
    const lvl = el("span", "drill__level", LEVEL_LABEL[drill.level] || drill.level);
    lvl.setAttribute("data-level", drill.level);
    head.appendChild(lvl);
    card.appendChild(head);

    const body = el("div", "drill__body");
    const statement = el("div", "drill__statement", drill.statement || "");
    body.appendChild(statement);

    const answerBox = el("div", "drill__answer");
    const ctl = buildAnswerUI(drill.answer || { type: "expr" });
    answerBox.appendChild(ctl.dom);
    body.appendChild(answerBox);

    const actions = el("div", "drill__actions");
    const btnCheck = el("button", "btn", "Comprobar");
    btnCheck.type = "button";
    const btnHint = el("button", "btn btn--ghost", "Pista");
    btnHint.type = "button";
    const btnSol = el("button", "btn btn--ghost", "Ver solución");
    btnSol.type = "button";
    actions.appendChild(btnCheck);
    if (drill.hint) actions.appendChild(btnHint);
    if (drill.solution) actions.appendChild(btnSol);
    body.appendChild(actions);

    const feedback = el("div", "drill__feedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    body.appendChild(feedback);

    if (drill.hint) {
      const hint = el("div", "drill__hint", drill.hint);
      body.appendChild(hint);
      btnHint.addEventListener("click", () => {
        hint.classList.add("is-visible");
        btnHint.disabled = true;
      });
    }

    if (drill.solution) {
      const sol = el("div", "drill__solution");
      sol.appendChild(el("h5", null, "Solución detallada"));
      const steps = el("ol", "sol-steps");
      drill.solution.forEach((s) => steps.appendChild(el("li", null, s)));
      sol.appendChild(steps);
      body.appendChild(sol);
      btnSol.addEventListener("click", () => {
        sol.classList.add("is-visible");
        renderMath(sol);
        if (opts.track !== false) {
          markProgress(drill.id, loadProgress()[drill.id] === "solved" ? "solved" : "revealed");
        }
      });
    }

    const grade = () => {
      const answer = ctl.get();
      const res = G.check(drill.answer || {}, answer);
      feedback.classList.remove("ok", "bad", "is-visible");
      card.classList.remove("is-correct", "is-wrong");
      markChoiceFeedback(card, drill.answer, answer);
      if (res.ok) {
        card.classList.add("is-correct");
        feedback.classList.add("ok", "is-visible");
        feedback.innerHTML = "✓ Correcto. " + (drill.successMsg || "Revisa la solución detallada.");
        const sol = $(".drill__solution", card);
        if (sol) {
          sol.classList.add("is-visible");
          renderMath(sol);
        }
        if (opts.track !== false) markProgress(drill.id, "solved");
      } else {
        card.classList.add("is-wrong");
        feedback.classList.add("bad", "is-visible");
        feedback.innerHTML =
          "✗ Aún no es correcto." +
          (res.error ? " <span class='small'>" + esc(res.error) + "</span>" : "") +
          " Comprueba el planteamiento o pide una pista.";
        if (opts.track !== false) markProgress(drill.id, "failed");
      }
      renderMath(feedback);
      return res;
    };

    btnCheck.addEventListener("click", grade);

    card.appendChild(body);
    return { card, get: ctl.get, grade };
  }

  function renderDrills(container, drills) {
    if (!container || !drills) return;
    const levels = [
      ["normal", "Nivel Normal", "Cálculo directo y comprensión básica."],
      ["medio", "Nivel Medio", "Varios pasos y razonamiento combinado."],
      ["examen", "Nivel Examen de grado", "Tipo pregunta de examen de la UNED."],
    ];
    const progress = loadProgress();
    levels.forEach(([key, title, desc]) => {
      const list = drills.filter((d) => d.level === key);
      if (!list.length) return;
      const h = el("div", "level-head");
      h.appendChild(el("h3", null, esc(title)));
      h.appendChild(el("span", "meta", list.length + " ejercicios · " + esc(desc)));
      container.appendChild(h);
      const grid = el("div", "drills");
      list.forEach((d) => {
        const built = createDrill(d, { track: true });
        if (progress[d.id] === "solved") {
          built.card.classList.add("is-correct");
        }
        grid.appendChild(built.card);
      });
      container.appendChild(grid);
    });
  }

  /* ---------------- Modo examen ---------------- */
  function initExam(container, data) {
    if (!container || !data || !data.exam) return;
    const exam = data.exam;
    const examId = data.id || "examen";

    const toolbar = el("div", "exam-toolbar");
    const timerBox = el("div");
    timerBox.innerHTML =
      "<div class='meta' style='color:rgba(236,228,207,0.8)'>Tiempo restante</div>" +
      "<div class='exam-toolbar__timer' id='exam-timer'>--:--:--</div>";
    const actions = el("div", "drill__actions");
    const btnGrade = el("button", "btn btn--gold", "Corregir examen");
    btnGrade.type = "button";
    const btnReset = el("button", "btn btn--ghost", "Reiniciar");
    btnReset.type = "button";
    actions.appendChild(btnGrade);
    actions.appendChild(btnReset);
    toolbar.appendChild(timerBox);
    toolbar.appendChild(actions);
    container.appendChild(toolbar);

    const score = el("div", "exam-score");
    score.innerHTML =
      "<div><b id='exam-correct' aria-live='polite'>0</b><span>Acertadas</span></div>" +
      "<div><b id='exam-total'>0</b><span>Preguntas</span></div>" +
      "<div><b id='exam-grade' aria-live='polite'>—</b><span>Nota / 10</span></div>";
    container.appendChild(score);

    const drillsWrap = el("div", "drills");
    container.appendChild(drillsWrap);
    const cards = exam.questions.map((q) => {
      const built = createDrill(q, { track: false });
      drillsWrap.appendChild(built.card);
      return { card: built.card, drill: q, get: built.get };
    });
    renderMath(container);
    $("#exam-total").textContent = String(cards.length);

    // Temporizador persistente: sobrevive a F5 y bloquea al llegar a 0
    const DEADLINE_KEY = "curso-algebra-examen-" + examId;
    let deadline = null;
    try {
      deadline = parseInt(sessionStorage.getItem(DEADLINE_KEY) || "", 10) || null;
    } catch (e) {
      deadline = null;
    }
    if (!deadline || isNaN(deadline)) {
      deadline = Date.now() + (exam.minutes || 120) * 60000;
      try {
        sessionStorage.setItem(DEADLINE_KEY, String(deadline));
      } catch (e) {
        /* sin sessionStorage */
      }
    }
    const timerEl = $("#exam-timer");
    let finished = false;

    const gradeAll = () => {
      let correct = 0;
      const total = cards.length;
      cards.forEach(({ card, drill, get }) => {
        const res = G.check(drill.answer || {}, get());
        const fb = $(".drill__feedback", card);
        const sol = $(".drill__solution", card);
        fb.classList.remove("ok", "bad", "is-visible");
        card.classList.remove("is-correct", "is-wrong");
        markChoiceFeedback(card, drill.answer, get());
        if (res.ok) {
          correct++;
          card.classList.add("is-correct");
          fb.classList.add("ok", "is-visible");
          fb.innerHTML = "✓ Correcto.";
        } else {
          card.classList.add("is-wrong");
          fb.classList.add("bad", "is-visible");
          fb.innerHTML = "✗ Incorrecto." + (res.error ? " <span class='small'>" + esc(res.error) + "</span>" : "");
        }
        if (sol) sol.classList.add("is-visible");
        renderMath(card);
      });
      const nota = Math.round((correct / cards.length) * 10 * 100) / 100;
      $("#exam-correct").textContent = String(correct);
      $("#exam-grade").textContent = String(nota);
    };

    const tick = () => {
      if (deadline > Date.now() + (exam.minutes || 120) * 60000 * 2) {
        deadline = Date.now() + (exam.minutes || 120) * 60000; // clampear deadlines absurdos
        try {
          sessionStorage.setItem(DEADLINE_KEY, String(deadline));
        } catch (e) {
          /* ignore */
        }
      }
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
      const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
      const s = String(remaining % 60).padStart(2, "0");
      if (timerEl) timerEl.textContent = h + ":" + m + ":" + s;
      if (remaining <= 0 && !finished) {
        finished = true;
        $$("input", container).forEach((i) => (i.disabled = true));
        btnGrade.disabled = true;
        gradeAll();
      }
    };
    tick();
    setInterval(tick, 1000);

    btnGrade.addEventListener("click", gradeAll);

    btnReset.addEventListener("click", () => {
      try {
        sessionStorage.removeItem(DEADLINE_KEY);
      } catch (e) {
        /* ignore */
      }
      window.location.reload();
    });
  }

  /* ---------------- Arranque ---------------- */
  function boot() {
    initReadingBar();
    initNav();

    const body = document.body;
    const themeId = body.getAttribute("data-theme");

    if (themeId && D[themeId]) {
      const data = D[themeId];
      const sum = $("[data-summary]");
      if (sum) renderSummary(sum, data.summary);
      const mm = $("[data-mindmap]");
      if (mm) renderMindmap(mm, data.mindmap);
      const drillsBox = $("[data-drills]");
      if (drillsBox) renderDrills(drillsBox, data.drills);
      const examBox = $("[data-exam]");
      if (examBox) initExam(examBox, data);
    }

    renderMath(document);
    initReveal(); // SIEMPRE después de renderizar drills/examen
    updateThemeProgress();
    initCounts();

    // navegación activa
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$(".nav__links a").forEach((a) => {
      const href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
      if (href && href === path) a.setAttribute("aria-current", "page");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
