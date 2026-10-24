# Auditoría adversarial · Ronda 2 — UX y motor

**Curso:** Fundamentos Algebraicos para la IA (web estática, apertura por `file://`)
**Árbitro:** auditoría independiente externa (no participó en la autoría; Ronda 1: `arbitro-ronda1-ux.md`)
**Fecha:** 2026-10-13
**Veredicto: NO APTO** — 0 CRÍTICOS · **3 MAYORES abiertos** (2 de la R1 sin cerrar + 1 nuevo) · 9 MENORES nuevos (+ `m4` y `m7` de la R1 sin corregir)

---

## 1. Metodología

### Herramientas y reproducción real

| Fase | Técnica |
|---|---|
| Motor de ejercicios | `node` ejecutando `assets/js/grader.js` (UMD) — batería hostil **nueva** de 114 casos (`verify/arbitro/ronda2/hostil-grader.js`): regresión de la R1 (A/B/C) + ataques **nuevos** a las correcciones C4/C5 (no finitos, colisión de muestreo, polinomio anulador, multi incompleto, extremos) |
| Interactividad real | Chrome 155 headless + CDP (cliente WebSocket propio sobre el `WebSocket` global de Node 24, sin dependencias — `cdp.js`): clicks nativos en «Comprobar»/«Corregir examen»/«Pista»/«Reiniciar», relleno de inputs con setter nativo + eventos, `sessionStorage`/`localStorage` manipulados, `Emulation.setDeviceMetricsOverride`, capturas `Page.captureScreenshot` |
| Smoke 10 páginas | `smoke.js`: campos por drill, `.katex-error`, nav, aria-live, labels `for`/id, mapa mental, vídeo+tracks, dianas del pie, `input[type=number]` |
| Reveal (C2) | `c2-diag.js`: scroll **instantáneo** tarjeta a tarjeta ×3 viewports con espera de transición (1,1 s). Nota de honestidad: mi primer barrido con `scrollIntoView` liso (`scroll-behavior: smooth`) dio falsos negativos por temporización; con scroll instantáneo no hay fallo alguno |
| Exámenes (C3) | `interactivo.js` + `ultima-tanda.js`: los 3 exámenes rellenados con las 36 respuestas `expected` del banco por UI, «Comprobar» tarjeta a tarjeta vs «Corregir examen», comparación de estado por tarjeta y nota |
| Temporizador (M7) | F5 con deadline comparada; deadline en pasado; valores corruptos de `sessionStorage` (11); «Reiniciar» |
| Almacenamiento sucio | `app-hostil.js`: 10 valores de `localStorage` + 11 de `sessionStorage`, XSS con payload `<img onerror>`+10k chars, multi incompleto, triple clic, aislamiento examen/progreso |
| Viewports | **375×812 / 768×1024 / 1440×900** sobre index, tema-1, tema-5, examen-1 (`viewports.js`, 12 capturas en `verify/arbitro/ronda2/capturas/`); barrido de desbordes por elemento, solapes héroe×título muestreados en 4 instantes del `drift`, sondeo fino de campos de respuesta a 375 en las 8 páginas con drills (`campos375.js`) |
| Contraste | Dos vías: cálculo WCAG sobre tokens de `base.css` (`contraste.js`) y **medición en runtime** sobre todo el texto visible con fondo efectivo por composición de ancestros, en 6 páginas, con secciones reveladas (`contraste-runtime.js`) |
| Estáticos | Escaneo TeX de los 8 data files (delimitadores con `<`/`>` crudos), VTT validados, MP4s en disco, estructura nav/pager/footer entre las 10 páginas, `prefers-reduced-motion` emulado vía CDP, `document.fonts.check` |

Se reintentaron los timeouts de Chrome (protocolo flaky): `Page.navigate`/`Runtime.evaluate` fallaron 3 veces en total; tras limpiar procesos huérfanos **todos** los casos se reprodujeron. Ninguna acusación se basa en un timeout.

### Lo verificado y limpio (para no acusar sin base)

- **111/111 ejercicios con campo de respuesta** (75 drills de tema + 36 preguntas de examen): 0 sin input en las 10 páginas.
- **0 × `.katex-error`** en las 10 páginas (779 fórmulas solo en tema-1); sin overflow horizontal del documento en los 3 viewports.
- **Batería grader: 111/114 casos conformes**; los 3 desajustes son residuales teóricos (ver N5/N6), **sin impacto en el banco** (0 `multi` sin `fields`; máximo 2 variables libres en 70 respuestas con variables).
- **36/36 preguntas de examen: «Comprobar» ≡ «Corregir examen»** (0 contradicciones; nota 10 con todo correcto en los 3 exámenes).
- Temporizador: sobrevive F5, bloquea y auto-corrige a 0, «Reiniciar» limpia la sesión; nunca negativo ni `NaN` con 11 valores corruptos.
- `sessionStorage` corrupto: 11/11 valores tratados sanamente (basura → cronómetro nuevo; pasado → auto-corrección y bloqueo).
- XSS: payload `<img onerror>` + `<script>` + 10k chars → sin ejecución, sin DOM inyectado (`esc()` cubre el camino de error).
- Modo examen **no** escribe en `curso-algebra-progreso-v1` (m5 cerrado).
- Tipografías Fraunces / Inter / IBM Plex Mono cargadas; `prefers-reduced-motion` neutraliza `drift`/`drip` (0.001 s) y `scroll-behavior: auto`.
- Dianas del pie ≥24 px en las 10 páginas; 0 `input[type=number]`; 6 MP4 + 6 VTT + 6 `<track kind="captions">` presentes y coherentes.

---

## 2. Verificación de las correcciones afirmadas

### Tabla de correcciones (R1 → R2)

| # | Hallazgo R1 | Estado | Reproducción / evidencia |
|---|---|---|---|
| **C1** | ~85 % de ejercicios sin campo de respuesta | **CORREGIDO** | `app.js:425` `answerBox.appendChild(ctl.dom)`. Runtime: 111/111 drills con ≥1 control (smoke de las 10 páginas; `sinCampo=0`). El fix no duplica: `multi` ya no hace `appendChild` propio |
| **C2** | Tarjetas con `opacity: 0` para siempre | **CORREGIDO** | `initReveal()` tras renderizar (`app.js:667`). `c2-diag.js`: 15/15 tarjetas de tema-1 reveladas a 780×437, 375×812 y 360×640; 12/12 en examen-2. Alturas máx. 724 px — por debajo del umbral del `threshold: 0.08` (margen ≥0,81) |
| **C3** | «Corregir examen» contradice a «Comprobar» | **CORREGIDO** | `gradeAll` usa `get` por tarjeta (`app.js:566, 593`). Los 3 exámenes con respuestas exactas del banco: per-card 12/12 ✓, global 12/12, nota 10, **0 contradicciones**. Repro de R1 (`X1-8`, multi con dos vectores 3×1): tarjeta ✓ y global ✓ (nota 0,83 con solo esa) |
| **C4** | No finitos/no evaluables ≡ cualquier cosa | **CORREGIDO** | `compared >= 2` (`grader.js:446`). Nueva batería D1–D12: `1/(x-y)`, `hacker(3)`, `log(x-y)`, `1/0`, `fact(x)`, `9^9^9`, `exp(1000)*x`, celdas de matriz y `exprset` → **todos rechazados** |
| **C5** | Variables todas en el mismo punto | **CORREGIDO** | `env[vs[k]] = points[(k+t)%8]` (`grader.js:431`). E1–E5 (`x−y`, `x/y`, `sin x−sin y`, `x³−y³`, `x1−x2` vs 0/1) rechazados; E6–E12 (identidades reales: `x−x`, `(x+y)−(y+x)`, `cos²+sin²`, `tan`) aceptadas |
| **M1** | Progreso del índice «0 / 0 · 0%» y barra vacía | **NO CORREGIDO** | El claim *«index.html carga los 5 data files»* es **falso**: `index.html:279-282` solo carga katex/grader/app. Sí está el guard de `updateThemeProgress` (`app.js:67`, ya no escribe «0 / 0 · 0%»), pero el síntoma de fondo persiste: con 5 ejercicios `solved` en `localStorage`, los labels se quedan **«0 / 15» estáticos** y las 5 barras **vacías** (`width=""`). Reproducción: `interactivo.js` → `M1.conProgreso5de15` |
| **M2** | «Reiniciar» ilegible (1,96:1) | **CORREGIDO** | `.exam-toolbar .btn--ghost` con `--cream-soft` (`components.css:910-913`): **8,01:1** en runtime sobre la barra `--night` (visible en `capturas/X1-12-375-recorte.png`) |
| **M3** | Familia de textos < AA | **PARCIAL** | Tokens endurecidos y verificados en runtime: `--ink-mute` sobre papel 5,28:1, `--gold` sobre papel 5,26:1, `--cream-mute` sobre night 6,21:1. **Quedan textos reales bajo AA** (ver detalle abajo) |
| **M4** | Labels multi sin `for`; expr sin label | **CORREGIDO** | 113 labels `.drill__fields` con `for`→id resoluble (100 %, smoke 10 páginas); 38 inputs expr con `aria-label` (0 sin). Residual fino en N3 |
| **M5** | Feedback y nota sin `aria-live` | **CORREGIDO** | `role="status"` + `aria-live="polite"` en `.drill__feedback` (todas las tarjetas); `aria-live="polite"` en `#exam-grade` y `#exam-correct`. (El temporizador sigue sin `role="timer"`/`aria-live="off"` ni aviso a 5 min que proponía R1 — no reclamado en el claim; queda como nota) |
| **M6** | Mapa mental oculto a AT | **CORREGIDO** | SVG `role="group"` + `aria-label`; 85 nodos en los 5 temas con `role="button"` y `aria-label` (smoke). Residual del label TeX crudo en N10 |
| **M7** | Temporizador cosmético; F5 regala tiempo | **CORREGIDO** | `sessionStorage` por examen (`app.js:572-586`): F5 conserva la deadline (01:59:48 → 01:59:46 → tras F5 01:59:44, deadline idéntica). A 0 s: 38/38 inputs deshabilitados, «Corregir examen» deshabilitado, auto-corrección con nota 0. «Reiniciar» borra la clave y relanza a 01:59:59 con inputs habilitados |
| **M8** | `<`/`>` crudos en TeX | **CORREGIDO** | Escaneo de los 8 data files: **0** delimitadores TeX con `<`/`>` crudos (uso de `\lt`/`\gt` verificado en los sumatorios señalados) |
| **M9** | Nav global solo en index | **CORREGIDO** | `class="nav…"` presente en 10/10 páginas con los 4 enlaces (Inicio/Temas/Exámenes/Planificación) |
| **M10** | 6 vídeos sin subtítulos | **CORREGIDO** | 6 `<track kind="captions" srclang="es" default>` + 6 WebVTT válidos (cabecera + cues) + 6 MP4 en disco |
| **m1** | Estados `is-selected/is-right/is-wrong` sin aplicar | **PARCIAL** | En `choice`/`bool` de nivel superior funciona (reproducido en `X1-3`: `is-selected` al elegir; `is-wrong`/`is-right` al corregir). **No** se marca en `choice`/`bool` **anidados en multi** (N4) |
| **m2** | Dianas del pie < 24 px | **CORREGIDO** | `.footer a { min-height: 24px }` — runtime: 0 enlaces por debajo de 24 px en las 10 páginas |
| **m3** | Foco sin outline en forced-colors | **CORREGIDO** | `outline: 2px solid transparent; outline-offset: 2px` en `.field *:focus` y `.matrix-input input:focus` (patrón correcto para forced-colors) |
| **m4** | Pager con 3 estructuras | **NO CORREGIDO** | Siguen las 3: `tema-1` = `nav.wrap > div.pager` (prev: «**Volver**»), `tema-2..5` = `nav.pager`, exámenes = `nav.wrap.pager` («Anterior»/«Siguiente»). La redacción pedida («Anterior»/«Siguiente» uniforme) no se unificó |
| **m5** | Exámenes contaminan `localStorage` | **CORREGIDO** | Tras «Comprobar» + «Corregir examen» en modo examen: `curso-algebra-progreso-v1` = `null`. En modo tema escribe `{"T1-N1":"failed"}` (correcto) |
| **m6** | Fórmulas del héroe chocan a 375 | **CORREGIDO (móvil)** | `@media (max-width:860px)` oculta `nth-child(n+3)`. 375: 2 fórmulas, **0 solapes** con título/kicker en 3 instantes del drift. Residual a desktop en N7 |
| **m7** | Mezcla tipográfica en nodos del mapa | **NO CORREGIDO** | tema-1: 4 nodos con `\(\mathbb{N}\)` etc. se renderizan con KaTeX_Main (serif) dentro de cajas Inter 12,5 px (`tieneKatex: true`, `fontKatex: "KaTeX_Main, Times New…"`) — el síntoma de R1 intacto |
| **m8** | `choice`/`bool` sin selección sin mensaje | **CORREGIDO** | «Selecciona una opción» / «Selecciona verdadero o falso» (batería H6–H8) |
| **(menor)** | Tipo `text` para cifras | **CORREGIDO** | 0 `input[type=number]` en el DOM; matrices/expr con `type="text"` |

### Detalle de M3 (PARCIAL) — contrastes AA en runtime, texto real

| Texto | Ratio | Umbral | Dónde |
|---|---|---|---|
| `.kicker` (`--gold` #7a5f1c) sobre cabecera `--night` | **3,11:1** | 4,5 | **Las 10 páginas** (titulares de tema/examen/index/planificación) |
| `.meta` (`--ink-mute`) sobre `.theme-card` `--night` | **3,09:1** | 4,5 | Rejilla de temas del index («Octubre 2026 → Enero 2027») |
| `.drill__level[data-level=normal]` (`--ok`) sobre `.drill__head` | **3,94:1** | 4,5 | Chips «Normal» en todas las tarjetas |
| `.drill__level[data-level=medio]` (`--warn`) | **3,98:1** | 4,5 | Chips «Medio» |
| `.drill__level[data-level=examen]` (`--bad`) | **4,05:1** | 4,5 | Chips «Examen de grado» |
| «Tiempo restante» (inline `rgba(236,228,207,0.5)` en `app.js:541`) | **4,43:1** | 4,5 | Barra de examen, 3 exámenes |
| `.plaque__label` (`--ok` sobre placa clara) | **4,32:1** | 4,5 | `planificacion.html` |

(El watermark `.ghost-num` con `color: transparent` se descarta como decorativo.) El endurecimiento de tokens arregló los casos sobre papel que condenó la R1; oscurecer `--gold` empeoró además su uso sobre `--night` (3,11:1). Condición de APTO de la R1 —«AA ≥4,5:1 en todos los textos pequeños»— **no cumplida**.

---

## 3. Nuevos hallazgos (batería hostil R2)

### MAYOR

| # | Hallazgo | Archivo | Qué ocurre | Reproducción | Corrección propuesta |
|---|---|---|---|---|---|
| **N1** | **`localStorage` con JSON `null` anula todo el motor de la página: 0 ejercicios, 0 fórmulas, secciones invisibles** | `app.js:42-47` (`loadProgress`), `app.js:512` | `JSON.parse("null")` devuelve `null` **sin lanzar**, y el `catch` no lo cubre. `renderDrills` hace `progress[d.id]` sobre `null` → `TypeError` que aborta `boot()` **antes** de `renderMath(document)` e `initReveal()`. Impacto total en cualquier página de tema: desaparecen los drills, **ninguna fórmula KaTeX se renderiza** (0 de 779) y las 29 secciones `.reveal` quedan con `opacity: 0` para siempre. También rompe `markProgress` al corregir. Los demás valores sucios (`"no-es-json"`, `[]`, `42`, `"true"`, `{"a":`, …) se resuelven bien: **solo `null`** dispara la ruta | `app-hostil.js`: `localStorage.setItem("curso-algebra-progreso-v1", "null")` → abrir `temas/tema-1.html` → `document.querySelectorAll("article.drill").length === 0`, `.katex === 0`, `texCrudo === 609`. Con `"[]"`: 15 drills, 779 fórmulas | En `loadProgress`, devolver objeto solo si el parse es objeto plano: `const v = JSON.parse(...); return (v && typeof v === "object" && !Array.isArray(v)) ? v : {};` |

### MENOR

| # | Hallazgo | Archivo | Qué ocurre | Reproducción | Corrección propuesta |
|---|---|---|---|---|---|
| **N2** | Columna derecha de matrices 4×4 recortada a 375 px (efecto secundario del fix C1) | `components.css` (`.matrix-input` / `.matrix-input input { width: 5.2rem }`) | `X1-12` (examen-1): rejilla de 386 px con `overflow: hidden` en la tarjeta; la 4.ª columna se ve **44 de 83 px** sin scroll visible. Al enfocar, el navegador auto-desplaza (mitigación teclado) | `campos375.js` + `capturas/X1-12-375-recorte.png`. Único caso en las 8 páginas con drills | `.matrix-input { max-width: 100%; overflow-x: auto }` e inputs con `width: 100%; min-width: 2.5rem` |
| **N3** | El `aria-label` del fix M4 pisa el nombre de las opciones en `choice`/`bool` anidados | `app.js:278` | En `T2-E4` (multi con bool «¿Es Q ortogonal?») la radio **«Verdadero»** se anuncia como «¿Es Q ortogonal?» (la 2.ª, «Falso», sí conserva nombre). Es el único caso del banco | `aria-nested.js`: `radios[0].aria = "¿Es Q ortogonal?"`, `labelTexto = "Verdadero"` | No aplicar `aria-label` cuando el control es `radio`/`checkbox` con label envolvente; o solo en `input[type=text]` |
| **N4** | `is-right`/`is-wrong` no se aplican a `choice`/`bool` anidados en multi | `app.js:393-404` | `markChoiceFeedback` sale temprano si `spec.type` es `multi`; el bool de `T2-E4` nunca recibe marca tras corregir (residual de m1) | `aria-nested.js` / código: la rama multi no itera subcampos | Recorrer `spec.fields` recursivamente |
| **N5** | Muestreo fijo: un polinomio construido sobre los 8 puntos de `grader.js:416-425` se acepta como 0 | `grader.js:416-425` | `(x−c₀)…(x−c₇)` con los `cᵢ` = constantes de muestreo evalúa a 0 en todos los puntos → `check({type:'expr', expected:'0'}, poly)` → **ok:true** (batería G1/G2). **Sin valor práctico de trampa**: exige leer el código del grader y conocer la respuesta esperada (con lo que bastaría escribirla) y ninguna pregunta del banco usa 0 variables… máx. 2 variables libres. Cualquier corrector por muestreo en cliente comparte esta propiedad | `hostil-grader.js` G1/G2 | Muestreo aleatorio por intento (semilla), como proponía R1; o puntos derivados de un hash del intento |
| **N6** | `multi` con `fields: null` acepta cualquier respuesta | `grader.js:570` | `Object.keys(null ‖ {})` → 0 claves → `return { ok: true }`. Un typo en los datos auto-aprobaría la pregunta. **0 casos en el banco** (32 `multi`, todos con `fields`) | `hostil-grader.js` H18 | Guard: si `fields` no tiene claves, `{ ok:false, error:"Especificación incompleta" }` |
| **N7** | Héroe a 1440: fórmulas flotantes solapan kicker y título | `components.css:274-276` | El fix de m6 solo oculta a ≤860 px. A 1440×900 la fórmula 3 (`A=UΣV⊤`) solapa `.kicker` (108×15 px) y la 5 (`det(A)≠0`) el `h1` (103×36 px) de forma **persistente** durante el drift (4 instantes muestreados). Decorativo al 34 % de opacidad | `hero1440.js` | Reposicionar las fórmulas 3 y 5 en el tercio superior o ampliar el ocultado; o `mix-blend-mode`/opacidad por defecto más baja |
| **N8** | Footer inconsistente entre páginas (acabado) | `index.html` vs interiores | index: 4 columnas (con «Temas») + colofón «Cada resultado verificado con SymPy»; temas: 3 columnas + «Verificado con SymPy · errores → revisar con el árbitro»; planificación/exámenes: 3 columnas + «Verificado con SymPy». Las páginas interiores no enlazan temas hermanos desde el pie | Comparación estática de los 4 footers | Unificar columnas y colofón |
| **N9** | Nav del index sin `aria-label` | `index.html:30` | Las 9 interiores tienen `aria-label="Navegación principal"`; el index no (además lleva estilos inline justificados por el héroe) | `grep`/inspección | Añadir el `aria-label` |
| **N10** | `aria-label` del mapa mental contiene TeX crudo | `app.js:208` | Los nodos anuncian literalmente `\((u_i)_{i \in I}\)`, `\(\mathbb{N}\)…` (4 nodos de tema-1) | `mindmap-m7.js` (`aria` del nodo) | Limpiar TeX del `aria-label` (el detalle ya pasa por `replace(/<[^>]+>/g,"")`, pero no por unstrip de `\(...\)`) |

**Nota de diseño (no hallazgo):** la tolerancia numérica `tol: 1e-6` acepta `1e-7 ≈ 0` (batería A11). Es el compromiso estándar para comparar expresiones con coma flotante (`sqrt(3)/2 ≈ 0,866…` lo necesita); se documenta para que no se confunda con un agujero.

---

## 4. Batería hostil — resumen numérico

| Batería | Casos | Conformes | Desajustes |
|---|---|---|---|
| `hostil-grader.js` (R1-regresión + nueva) | 114 | 111 | G1/G2 (N5), H18 (N6) |
| `app-hostil.js` (LS 10 + SS 11 + UI 8) | 29 escenarios | 28 | LS `"null"` (N1) |
| Contraste runtime (6 páginas) | ~texto íntegro | — | 7 combinaciones (M3) |
| Coherencia de examen (36 preguntas ×2 métodos) | 72 | 72 | 0 |
| Viewports (12 combinaciones + sondeo 375) | — | doc overflow 0 | N2 (1 ejercicio), N7 (héroe 1440) |

---

## 5. Veredicto

### **NO APTO**

**0 CRÍTICOS** — los cinco críticos de la R1 (C1–C5) están **corregidos y reproducidos**: el bucle «intenta → corrige → aprende» existe en las 111 preguntas, las tarjetas se revelan, las notas de examen son justas y el corrector resiste la batería hostil.

**3 MAYORES abiertos** (APTO exige 0):

1. **M1 (R1, sin corregir):** el progreso del índice sigue roto. El claim «index.html carga los 5 data files» es falso (`index.html:279-282`); solo se añadió el guard que evita el «0 / 0 · 0%». Un alumno con ejercicios resueltos ve «0 / 15» y barras vacías en la portada.
2. **M3 (R1, parcial):** la condición de APTO de la R1 (AA ≥4,5:1 en todo texto pequeño) no se cumple: `.kicker` a 3,11:1 en las cabeceras de las 10 páginas, `.meta` de las tarjetas oscuras del index a 3,09:1, chips 3,94–4,05:1, «Tiempo restante» 4,43:1.
3. **N1 (nuevo):** un solo valor corrupto en `localStorage` (`"null"`) deja una página de tema sin ejercicios, sin renderizar 779 fórmulas y con 29 secciones invisibles — el mismo síntoma que los críticos C1+C2, con disparador más exigente pero arreglo de una línea.

Con dos hallazgos R1 sin cerrar y una regresión de robustez del motor, el producto **no** está en condiciones de uso docente real, pese a que el avance de esta ronda es enorme: los cinco críticos están cerrados, el temporizador ya mide, la accesibilidad estructural está resuelta y el acabado editorial base sigue siendo notable.

### Orden de reparación recomendado (ronda 3)

1. **N1** — `loadProgress` con validación de objeto (1 línea; desbloquea el resto de pruebas con almacenamiento sucio).
2. **M1** — cargar los data de temas (o un JSON de totales) en `index.html` y componer label/barra con el progreso real.
3. **M3** — token de texto para fondos `--night` (`--gold-bright`/`--cream-soft` en `.kicker` y `.theme-card .meta`), oscurecer `--ok/--warn/--bad` un paso (o chips sobre fondo crema con color mixto), `--cream-mute` en «Tiempo restante» (`app.js:541`).
4. **N2** — `.matrix-input` con scroll o inputs fluidos (1 ejercicio afectado, pero es una respuesta de examen).
5. **N3/N4** — naming de radios y marcas recursivas en multi (1 caso cada uno).
6. **N5/N6** — muestreo aleatorio por intento y guard de `fields` vacío (endurecimiento del motor).
7. Menores de acabado: m4 (pager único «Anterior/Siguiente»), m7 (labels del mapa sin TeX mezclado), N7–N10 (héroe 1440, footer, aria-labels).

### Condiciones mínimas para APTO en ronda 3

- 0 CRÍTICOS y 0 MAYORES abiertos (cerrar M1, M3 y N1).
- Batería hostil en verde (mismos scripts: `hostil-grader.js`, `app-hostil.js`, `contraste-runtime.js`).
- Smoke 10 páginas sin regresiones (111/111 campos, `.katex-error` = 0, reveal completo).
- Contraste AA ≥4,5:1 en todo texto < 18,66 px bold / 24 px (runtime, no solo tokens).

---

## 6. Anexo — artefactos de verificación

Todo en `verify/arbitro/ronda2/` (re-ejecutables con Node ≥22 y Chrome):

| Archivo | Qué hace |
|---|---|
| `cdp.js` | Cliente CDP mínimo (WebSocket global de Node) |
| `smoke.js` / `smoke.json` | Smoke de las 10 páginas |
| `interactivo.js` / `interactivo.json` | C2, C3 (examen-1), M1, M7, m1, M5 |
| `ultima-tanda.js` | C3 en exámenes 2–3, reduced-motion, fuentes, m5 |
| `c2-diag.js` | Reveal a 3 viewports con scroll instantáneo |
| `hostil-grader.js` | Batería hostil del grader (114 casos) |
| `app-hostil.js` | Almacenamiento sucio, XSS, extremos de UI |
| `impacto-null.js` | Impacto del crash `loadProgress=null` |
| `viewports.js` / `viewports.json` + `capturas/` | Overflow/solapes a 375/768/1440 (12 capturas) |
| `sondeo-fino.js`, `campos375.js`, `hero1440.js`, `shot-x112.js` | Matrices recortadas, héroe ×instantes, captura X1-12 |
| `contraste.js`, `contraste-runtime.js`, `fondos.js` | AA por tokens y en runtime con fondos efectivos |
| `aria-nested.js`, `mindmap-m7.js` | N3/N4 y m7 |
