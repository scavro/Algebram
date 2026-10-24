# Auditoría adversarial · Ronda 3 — UX y motor

**Curso:** Fundamentos Algebraicos para la IA (web estática, apertura por `file://`)
**Árbitro:** auditoría independiente externa (sin participación en la autoría; R1: `arbitro-ronda1-ux.md`, R2: `arbitro-ronda2-ux.md`)
**Fecha:** 2026-10-14
**Veredicto: NO APTO** — 0 CRÍTICOS · **1 MAYOR abierto (M3)** · 1 nuevo MENOR · el grueso de menores R2 sigue igual (no reclamados)

---

## 0. Resumen ejecutivo

| Claim de la R3 | Veredicto | Hecho verificado |
|---|---|---|
| M1: `index.html` carga `assets/data/tema-1..5.js` → «0 / 15» | **CORREGIDO** | Labels «0 / 15 · 0%»; con progreso «5 / 15 · 33%» + barras; cross-page «1 / 15 · 7%» |
| M3: `.theme-head/.hero .kicker` en oro brillante; chips y «Tiempo restante» AA | **PARCIAL — el claim es falso en 2 de 3 partes** | «Tiempo restante» 4,43 → **9,68:1** ✔. Pero `.kicker` sigue en `--gold` (**3,11:1**, color medido `rgb(122,95,28)`, no `rgb(201,162,39)`) y los chips `.drill__level` siguen **3,94–4,05:1** — idénticos a la R2 |
| N1: `loadProgress()` null-safe | **CORREGIDO** | 24 valores sucios de `localStorage` (los 10 de R2 + 14 nuevos: `"[]"`, `"5"`, JSON truncados, proto-pollution, 200 KB, BOM…) → 0 fallos; con `"null"`: 15 drills, 779 fórmulas, reveal vivo |
| Extra: `.matrix-input` con scroll horizontal (N2) | **CORREGIDO** | `overflow-x: auto`, scrollWidth 382 > clientWidth 283 a 375 px; última celda visible al enfocar; sin overflow de documento |
| Extra: `aria-label` ya no pisa `choice`/`bool` (N3) | **CORREGIDO** | T2-E4: radios con `aria-label=null` y nombre «Verdadero»/«Falso» intacto |

**Con 0 CRÍTICOS pero M3 sin cerrar (la condición de la R1 —AA ≥4,5:1 en todo texto pequeño— sigue sin cumplirse: 21 textos reales bajo umbral en las 6 páginas medidas), el producto NO alcanza APTO.** El avance es real: M1 y N1 están bien cerrados y el claim de M3 solo sobrevive en su última cláusula.

---

## 1. Metodología

Mismo estándar que la R2, con harness endurecido (todo re-ejecutable con Node ≥22 y Chrome):

| Fase | Técnica |
|---|---|
| Verificación de claims | Chrome headless + CDP (cliente WebSocket propio, `cdp.js`): medición de **estilos computados y ratio WCAG en runtime** sobre texto real, relleno de inputs con setter nativo + eventos, clicks nativos, `localStorage`/`sessionStorage` manipulados, `Emulation.setDeviceMetricsOverride`, capturas `Page.captureScreenshot` |
| Batería R2 completa | Re-ejecución íntegra de `hostil-grader.js` (114 casos), `app-hostil.js` (29 escenarios), `smoke.js` (10 páginas), `interactivo.js`, `ultima-tanda.js`, `c2-diag.js`, `contraste.js`, `contraste-runtime.js`, `viewports.js`, `campos375.js`, `sondeo-fino.js`, `hero1440.js`, `shot-x112.js`, `aria-nested.js`, `mindmap-m7.js`, `scan_lt_gt.js`, `fondos.js`, `impacto-null.js` |
| Nuevos casos R3 | `hostil-r3.js` (68 comprobaciones): 14 valores nuevos de `localStorage` (incl. `"[]"`, `"5"`, JSON truncado a media palabra/array, proto-pollution, valores no-string, BOM, null byte, 200 KB), 12 valores nuevos de `sessionStorage`, **examen con F5 justo al acabar** (3 escenarios de carrera), **multi con campos de matriz** (X1-8 con 2 vectores 3×1, T2-E4 bool+matriz 3×3 con fracciones, X1-12 4×4), **viewport 320 px** (3 páginas + matriz + nav), **landscape** 740×360 y 812×375 (overflow, hero, timer, reveal) |
| Contraste | Dos vías: cálculo WCAG sobre tokens (`contraste.js`) y **medición en runtime** con fondo efectivo por composición de ancestros (`contraste-runtime.js`, 6 páginas) + mediciones puntuales (`focos-r3.js`) |
| Capturas | 12 capturas 375/768/1440 (index, tema-1, tema-5, examen-1) + 320 px + matriz X1-12 + mapa mental, en `verify/arbitro/ronda3/capturas/` |

### Flakiness del protocolo (transparencia)

- Chrome/CDP es flaky en este equipo: hubo timeouts de `Page.navigate`/`Page.enable`. **Ninguna acusación se basa en un timeout**: el harness de la R3 usa perfil de usuario **único por lanzamiento**, puerto CDP por PID, reintento ×3 en métodos idempotentes y timeout de conexión WS. Con eso, todas las pruebas se reprodujeron de principio a fin (2 ejecuciones largas completas + re-ejecuciones puntuales).
- Un primer intento con **dos Chrome en paralelo** sobre el mismo puerto falseó 13 casos (colisión de puerto, no del producto) — descartado y re-ejecutado en serie.

### Falsos positivos del propio banco, descartados (cero tolerancia)

1. `hostil-r3.js` marcaría «cross-page 1/15» esperando `width=6%`: la app redondea `Math.round(1/15·100)=7` y muestra «1 / 15 · 7%». **La app es correcta; el assert era erróneo.** Re-verificado en `diag-r3.js`.
2. Desbordes «math r=345…» a 320 px: son nodos del **MathML de KaTeX** (`.katex-mathml`, capa accesible oculta visualmente con `overflow:hidden`), no texto visible. Repetido excluyéndolos: **0 elementos visibles con `right > innerWidth`** y **0 `.katex-html`** desbordados a 320 px. `viewports.js` arrastra los mismos falsos positivos en sus listas crudas (`math`/`semantics`/`mrow` + `skip-link` fuera de pantalla por diseño).
3. «Reveal 2/15 sin revelar en landscape»: `scroll-behavior: smooth` fagocita `scrollTo` programático (el mismo artefacto que la R2 ya documentó). Con scroll instantáneo: **15/15 reveladas, 0 opacidades ≠ 1**.

---

## 2. Verificación de las correcciones afirmadas

### M1 — progreso del índice → **CORREGIDO**

- `index.html:282-286` carga los 5 data files (`tema-1..5.js`) antes de `app.js`; `updateThemeProgress()` (`app.js:63-77`) compone label y barra desde `D[theme].drills`.
- Reproducción (`interactivo.js` → `M1`):
  - sin progreso: `["tema-1=0 / 15 · 0%", … ×5]` (ya no «0 / 0 · 0%»);
  - con 5 ejercicios `solved` por tema: `«5 / 15 · 33%»` y `bar.style.width="33%"` en las 5 tarjetas (en la R2: labels congelados «0 / 15» y `width=""`);
  - cross-page (`hostil-r3.js`/`diag-r3.js`): resolver T1-N1 en el tema → índice `«1 / 15 · 7%»`, barra 7 %.
- Sin regresión: `smoke.json` sin errores JS; KaTeX del índice renderizado.

### M3 — familia de textos < AA → **PARCIAL (claim parcialmente falso)**

El claim afirma cuatro cosas; la medición en runtime (estilos computados, fondo efectivo por ancestros) dice:

| Texto | R2 | R3 (medido) | Estado |
|---|---|---|---|
| «Tiempo restante» (inline `rgba(236,228,207,0.8)` en `app.js:546`) | 4,43:1 | **9,68:1** | **CORREGIDO** |
| `.hero/.theme-head .kicker` sobre `--night` | 3,11:1 | **3,11:1** — `color: rgb(122, 95, 28)` = `--gold` #7a5f1c | **NO CORREGIDO** |
| chips `.drill__level` Normal/Medio/Examen | 3,94 / 3,98 / 4,05 | **3,94 / 3,98 / 4,05** | **NO CORREGIDO** |
| `.meta` de `.theme-card` oscuras (index) | 3,09:1 | **3,09:1** | **NO CORREGIDO** |
| `.plaque__label` («Lectura práctica», planificación) | 4,32:1 | **4,32:1** | **NO CORREGIDO** |
| `.nav__brand-mark` «Archivo» sobre el héroe (index) | (familia kicker) | **3,11:1** | **NO CORREGIDO** |

- **El claim «`.theme-head .kicker` y `.hero .kicker` en oro brillante» no se reproduce**: no existe regla CSS `.theme-head .kicker`/`.hero .kicker` en `base.css`/`components.css` ni en los `<style>`/`<head>` de las páginas; la única regla nocturna es `.section--night .kicker { color: var(--gold-bright) }` (`base.css:264`) y **ni `.hero` ni `.theme-head` llevan la clase `section--night`**. El oro brillante (`--gold-bright` #c9a227 = `rgb(201,162,39)`, que daría 7,75:1 sobre `--night`) **no llega a los kickers de cabecera en ninguna de las 10 páginas**. Evidencia: `focos-r3.log`, `contraste-runtime.log`.
- El claim «chips con contraste AA» tampoco se reproduce: `--ok/--warn/--bad` (`#4d7a4b`, `#8a6a1e`, `#b0522c`) siguen sin endurecer y miden 3,94–4,05:1 sobre `.drill__head`.
- Condición de APTO de la R1 («AA ≥4,5:1 en todos los textos pequeños»): **no cumplida** — 21 instancias de texto real bajo umbral (kicker ×6 páginas medidas, brand ×1, meta oscuras ×1, chips ×9, plaque ×1; más 5 watermarks `.ghost-num` decorativos descartados, `aria-hidden` + `color:transparent`).

### N1 — `localStorage` corrupto → **CORREGIDO**

- `app.js:42-48`: `return p && typeof p === "object" && !Array.isArray(p) ? p : {};` dentro de `try/catch`. El camino `"null"` (y cualquier basura) queda neutralizado.
- Reproducción (`app-hostil.js`, 10 valores de R2 → **0 fallos**; `hostil-r3.js`, 14 valores nuevos → **0 fallos**): `"[]"`, `"5"`, `'"5"'`, `'{"T1-N1":"solv'` (truncado), `"[1,2"`, `'{"__proto__":…}'`, valores `null/123/{}/true/false`, BOM, espacios, string-que-parece-objeto, 200 KB, null byte, `NaN`. En todos: 15 drills, 779 fórmulas, 0 `.katex-error`, «Comprobar» responde.
- `impacto-null.js` confirma el síntoma de la R2 erradicado: con `LS="null"` → `drills=15, katexSpan=779, texCrudo=0, revealOpacos=44/44` (se revelan al scrollear).
- Progreso válido se respeta y los valores no-string se ignoran: `{"T1-N1":"solved","T1-N2":"revealed","T1-N3":123,"T1-N4":null}` → T1-N1 `is-correct`, T1-N3 sin marca.
- `sessionStorage` (23 valores entre R2 y R3): 0 crashes; el modelo «basura → cronómetro nuevo; pasado → auto-corrección y bloqueo» se mantiene (ver N11 para el residuo de formato).

### Extra — `.matrix-input` con scroll (cierra N2) → **CORREGIDO**

- `components.css:801-810`: `max-width: 100%; overflow-x: auto`.
- Reproducción (`focos-r3.js`, X1-12 a 375 px): `overflowX:auto`, `scrollWidth=382 > clientWidth=283`, scroll horizontal operativo, última celda visible al enfocar (`lastVisibleTrasFocus:true`), sin desborde de tarjeta ni del documento. A 320 px: también scrollable y `docOverflow:false`. Capturas `R3-X1-12-375-matriz.png`, `R3-X1-12-320.png`.
- Nota: los inputs conservan `width: 5.2rem` fijo (la segunda mitad de la sugerencia de la R2, «inputs fluidos», no se aplicó); con scroll funcional el efecto práctico del hallazgo queda cerrado.

### Extra — `aria-label` no pisa `choice`/`bool` (cierra N3) → **CORREGIDO**

- `app.js:275-281`: el `aria-label` del fix M4 solo se aplica a `input[type=text/number], select, textarea`; en `choice`/`bool` el label de campo se des-asocia (`lab.removeAttribute("for")`) y cada opción conserva su nombre.
- Reproducción (`aria-nested.js` + `focos-r3.js`, T2-E4): radios con `aria-label=null`, `labelTexto=«Verdadero»/«Falso»` intactos (en la R2 la primera radio se anunciaba «¿Es Q ortogonal?»). Único caso del banco; verificado también en exámenes (sin regresión en 113 labels: 0 `for` rotos que importen — el único label sin `for` es el pie de campo bool, por diseño del fix).
- Residual relacionado **N4 sigue abierto** (no reclamado): `markChoiceFeedback` no marca `is-right`/`is-wrong` en `choice`/`bool` anidados en multi — reproducido en T2-E4 tras corregir: `.choice` y `.choice.is-selected` sin `is-wrong`.

---

## 3. Nuevos hallazgos (batería R3)

### MENOR

| # | Hallazgo | Archivo | Qué ocurre | Reproducción | Corrección propuesta |
|---|---|---|---|---|---|
| **N11** | `sessionStorage` con deadline entero gigante → temporizador con formato roto `277777777280012:37:20` | `app.js` (formateo del countdown) | `parseInt("999999999999999999999")` = 1e21 (finito, futuro) → resta sin clampear y `HH:MM:SS` con 15 dígitos de horas. Sin crash, sin bloqueo indebido, examen operativo; impacto cosmético de almacenamiento sucio. Diseño cliente del timer ya consignado en R2 (manipulable por el usuario) | `hostil-r3.js` §2 (caso «gigante 1e21») → `diag-r3.js` §d: `timer="277777777280012:37:20", len=21` | Limitar el remaining a `[0, 2h]`: si `deadline-Date.now() > 2h` o `< 0`, tratar como sesión nueva/caducada según regla actual |

**Hallazgo nuevo de endurecimiento del motor (positivo, no reclamado en el claim):** N5 de la R2 (muestreo fijo de 8 puntos) **ha sido corregido** — `grader.js:418-429` usa `seed = Math.random()` por llamada; la batería G1/G2 (polinomio anulador sobre los puntos) ahora **rechaza**. `hostil-grader.js`: **113/114 conformes** (solo H18 = N6, `multi` con `fields:null` auto-aprueba, sigue abierto — 0 casos en el banco).

### Regresiones: **ninguna**

Smoke de las 10 páginas idéntico a la R2 en lo bueno: **111/111 drills con campo de respuesta** (75 de tema + 36 de examen), **0 × `.katex-error`**, nav en 10/10, `aria-live` en feedback/nota, mapa mental con `role/aria-label`, 0 `input[type=number]`, dianas del pie ≥24 px, 6 MP4 + 6 WebVTT + 6 `<track kind="captions" default>`. Exámenes 2 y 3: 12/12 «Comprobar» ≡ «Corregir examen», nota 10, 0 contradicciones. Temporizador: F5 conserva deadline, a 0 s bloquea 38/38 y auto-corrige, «Reiniciar» limpia sesión. Modo examen no escribe en `curso-algebra-progreso-v1`. `prefers-reduced-motion` neutraliza `drift`/`scroll-behavior`. Fuentes Fraunces/Inter/IBM Plex Mono cargadas. TeX sin `<`/`>` crudos (0 ocurrencias).

### Nuevos casos hostiles — resultado

| Caso | Resultado |
|---|---|
| `localStorage` `"[]"`, `"5"`, truncados, proto-pollution, BOM, 200 KB, null byte… (14) | 0 fallos (boot sano + Comprobar responde) |
| `sessionStorage` `0x10`, `1e-3`, espacios, `"true"`, `'"123"'`, objeto, `-0`, `+5000`, `1,5`, saltos de línea, doble deadline… (12) | 0 fallos funcionales;1 residuo de formato (N11) |
| **F5 justo al acabar** (3 carreras: reload con <2 s, reload en 00:00:00, responder+expirar+F5) | 0 fallos: no regala tiempo (`00:00:02 → F5 → 00:00:01 → 00:00:00` bloqueado con nota), el estado caducado persiste tras F5, sin crash |
| **Multi con campos de matriz** (X1-8 2×3×1, T2-E4 bool+3×3 fracciones, X1-12 4×4) | Exacto → ✓ correcto en los 3; 1 celda alterada → ✗; multi incompleto → ✗ |
| **Viewport 320 px** (index, tema-1, examen-1, matriz, nav) | 0 overflow de documento, 0 desbordes **visibles** (ver falso positivo #2), matriz con scroll, nav toggle operativo |
| **Landscape** 740×360 / 812×375 (3 páginas) | 0 overflow; hero dimensionado; timer visible en examen; reveal 15/15 con scroll instantáneo |

---

## 4. Batería — resumen numérico

| Batería | Casos | Conformes | Desajustes |
|---|---|---|---|
| `hostil-grader.js` (R2 íntegra) | 114 | 113 | H18 (N6, menor, sin impacto en banco) |
| `app-hostil.js` (R2 íntegra) | 29 escenarios | 29 | 0 (N1 cerrado) |
| `hostil-r3.js` (nueva) | 68 | 67* | N11 (menor) — *las 5 marcas iniciales se depuraron: 1 assert erróneo, 2 falsos positivos MathML, 1 flake de scroll suave |
| Coherencia de examen (36 preguntas × 2 métodos) | 72 | 72 | 0 |
| Reveal (c2-diag, 3 viewports) | 45 tarjetas | 45 | 0 |
| Contraste runtime (6 páginas) | texto íntegro | — | 21 textos reales < AA (M3) |
| Viewports 375/768/1440 + 320 + landscape | 12 + 9 combinaciones | overflow doc 0 | N7 persiste (héroe 1440, menor) |

---

## 5. Estado del resto de hallazgos R2 (no reclamados)

| # | Hallazgo | Estado R3 |
|---|---|---|
| N4 | `is-right/is-wrong` en `choice`/`bool` anidados en multi | **Abierto** (reproducido en T2-E4) |
| N5 | Muestreo fijo del grader | **CORREGIDO** (semilla aleatoria por llamada; G1/G2 rechazan) |
| N6 | `multi` con `fields:null` auto-aprueba | **Abierto** (H18; 0 casos en el banco) |
| N7 | Héroe 1440: fórmulas 3 y 5 solapan kicker/h1 | **Abierto** (5 instantes del drift: `ix≈108×14` y `103×36`) |
| N8 | Footer inconsistente entre páginas | **Abierto** (3 colofones distintos) |
| N9 | Nav del index sin `aria-label` | **Abierto** (`index.html:30`) |
| N10 | `aria-label` del mapa con TeX crudo | **Abierto** (`\(\mathbb{N}\)` en tema-1) |
| m4 | Pager con 3 estructuras | **Abierto** (tema-1 «Volver», tema-2..5 «Anterior/Siguiente», exámenes otra) |
| m7 | Tipografía mezclada en nodos del mapa | **Abierto** (1 nodo con KaTeX serif en caja Inter) |
| (nota) | Timer sin `role="timer"`/`aria-live="off"` | Abierto (nota de la R2) |

---

## 6. Veredicto

### **NO APTO**

**0 CRÍTICOS** — los cinco críticos de la R1 siguen cerrados y reproducidos (111/111 campos, reveal, corrección de examen justa, corrector resistente).

**1 MAYOR abierto** (APTO exige 0):

1. **M3 (R1 → R2 → R3, solo parcialmente corregido):** la condición de APTO de la R1 —AA ≥4,5:1 en todo texto pequeño— **no se cumple**. El único extremo del claim que se reproduce es «Tiempo restante» (9,68:1). Los kickers de cabecera de las 10 páginas siguen midiendo **3,11:1** con `--gold` (el «oro brillante» afirmado no existe en el CSS de esas cabeceras: ni `.hero` ni `.theme-head` son `.section--night`), los chips **3,94–4,05:1**, `.meta` de las tarjetas oscuras **3,09:1** y `.plaque__label` **4,32:1**. Es un fallo de una línea por regla (2-4 tokens), pero mientras siga abierto el producto no cumple su propio criterio de accesibilidad tipográfica.

**1 MENOR nuevo (N11):** formato del temporizador con deadlines gigantes.

El trabajo de esta ronda es sólido y hay que reconocerlo: **M1 y N1 están perfectamente cerrados** (el índice ya mide progreso real cross-page y el motor resiste 24 formas de almacenamiento corrupto), N2 y N3 quedan bien resueltos, N5 se cerró además sin ser reclamado, y la batería de exámenes, temporizador y responsive no muestra **ninguna regresión**. Pero el claim de M3 se afirma en términos que la medición desmiente de forma inequívoca (mismo ratio, mismo color computado que en la R2), y sin M3 no hay APTO.

### Orden de reparación recomendado (ronda 4)

1. **M3** — añadir `.theme-head .kicker, .hero .kicker, .hero .nav__brand-mark { color: var(--gold-bright) }` (y `::before`), endurecer `--ok/--warn/--bad` un paso (o chips con `color-mix` sobre crema), `--cream-mute` para `.theme-card--night .meta`, y `--ok` más oscuro en `.plaque__label`. Verificación: `contraste-runtime.js` a 0.
2. **N11** — clampear el remaining del timer a `[0, 2h]`.
3. Menores a elegir: N4 (marcas recursivas), N6 (guard `fields` vacío), N7–N10, m4/m7.

### Condiciones mínimas para APTO en ronda 4

- 0 CRÍTICOS y 0 MAYORES (cerrar M3 de verdad: **runtime AA ≥4,5:1 en todo texto < 18,66 px bold / 24 px**, no solo tokens).
- Baterías en verde: `hostil-grader.js`, `app-hostil.js`, `hostil-r3.js`, `contraste-runtime.js`.
- Smoke 10 páginas sin regresiones.

---

## 7. Anexo — artefactos de verificación

Todo en `verify/arbitro/ronda3/` (re-ejecutables con Node ≥22 y Chrome; `cdp.js` con perfil/puerto únicos por lanzamiento):

| Archivo | Qué hace |
|---|---|
| `cdp.js` | Cliente CDP con reintentos y perfil efímero |
| `hostil-grader.js` | Batería del grader (114 casos) — 113/114 |
| `app-hostil.js` / `app-hostil.log` | Almacenamiento sucio R2 íntegra — 0 fallos |
| `hostil-r3.js` / `hostil-r3.log` | Batería nueva R3 (68 casos) |
| `focos-r3.js` / `focos-r3.log` | Ratios exactos M3 + N2 + N3/N4 |
| `diag-r3.js` / `diag-r3.log` | Depuración de falsos positivos (MathML, cross-page, timer 1e21) |
| `smoke.js` / `smoke.json` | Smoke de las 10 páginas |
| `interactivo.js` / `interactivo.json` | C2/C3/M1/M7/m1/M5 |
| `ultima-tanda.js` | Exámenes 2–3, reduced-motion, fuentes, m5 |
| `c2-diag.js` | Reveal a 3 viewports (scroll instantáneo) |
| `contraste.js`, `contraste-runtime.js`, `fondos.js` | AA por tokens y en runtime |
| `viewports.js` / `viewports.json`, `campos375.js`, `sondeo-fino.js`, `hero1440.js`, `shot-x112.js` | Overflow/solapes 375–768–1440, matrices, héroe |
| `aria-nested.js`, `mindmap-m7.js`, `scan_lt_gt.js`, `impacto-null.js` | N3/N4, m7/N10, TeX, impacto N1 |
| `capturas/` | 12 capturas 375/768/1440 + 320 px + matriz + mapa mental |
