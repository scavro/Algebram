# Auditoría adversarial · Ronda 5 — UX y motor (verificación final)

**Curso:** Fundamentos Algebraicos para la IA (web estática, apertura por `file://`)
**Árbitro:** auditoría independiente externa (sin participación en la autoría; R1–R4: `arbitro-ronda1..4-ux.md`)
**Fecha:** 2026-10-14
**Veredicto: APTO** — 0 CRÍTICOS · **M3 CERRADO** (2/2 instancias ≥ 4,5:1 verificadas en runtime) · 0 runs de texto bajo umbral en las 10 páginas (7.695 runs) · smoke 10/10 verde · grader hostil 113/114 (único fallo = N6, menor conocido y aplazado en R4)

---

## 0. Resumen ejecutivo

El claim de la R5 afirma dos reglas nuevas. **Ambas son ciertas y cierran las 2 instancias que bloqueaban APTO:**

| Claim | Instancia | R4 | R5 (runtime) | Veredicto |
|---|---|---|---|---|
| `.theme-card--night .meta { color: var(--cream) }` | index · «Octubre 2026 → Enero 2027» (tarjeta noche de `#temas`) | **3,09:1** | fg `rgb(236,228,207)` = `--cream` sobre bg `rgb(20,18,9)` = **14,79:1** | **CERRADO** |
| `.nav--night .nav__brand-mark, .hero .nav__brand-mark, .theme-head .nav__brand-mark { color: var(--gold-bright) }` | index · «Archivo» (nav `nav--night` transparente sobre el héroe) | **2,62:1** | fg `rgb(201,162,39)` = `--gold-bright` sobre bg `rgb(21,19,9)` = **7,69:1** (estilo 7,75) | **CERRADO** |

Sin regresiones: `.nav__brand-mark` de las 9 páginas interiores sigue en `--gold` sobre papel = **6,12:1** (la regla nueva no les afecta, correcto); las 3 metas de tarjetas de exámenes ya estaban en crema y siguen en **14,79:1**.

**Con 0 CRÍTICOS, M3 cerrado y N11 cerrado (R4), se cumplen por primera vez todas las condiciones de APTO de la serie: AA ≥4,5:1 en todo texto pequeño (0/7.695 runs bajo umbral) y sin regresiones de motor.** Los 9 menores/notas de las rondas anteriores (N4, N6, N7, N8, N9, N10, m4, m7, nota del timer) siguen vivos pero fueron declarados **no bloqueantes** por la propia condición de reparación mínima de la R4 y no han empeorado.

---

## 1. Metodología

Mismo instrumento calibrado en R4 (cero falsos positivos en ambas direcciones), re-ejecutado íntegro:

| Fase | Técnica |
|---|---|
| Contraste en runtime | `contraste-r5.js` (mismo diseño que `contraste-r4.js`): Chrome headless + CDP, estilos computados (`getComputedStyle`, con composición alfa) + **fondo real muestreado por píxeles** (texto transparente, captura por viewport, mediana + peor píxel del rect) + fondo por composición de ancestros como contraste cruzado. Ratio WCAG; umbral **4,5:1** (texto pequeño) / 3:1 (≥24 px o ≥18,66 px bold) |
| Cobertura | **7.695 runs de texto en las 10 páginas** (R4: 3.633 en 6) · claims medidos de forma dirigida (`--claims-only`, 14 runs) y también dentro del barrido |
| Smoke | `smoke-r5.js`: 10 páginas — campos de respuesta, KaTeX sin errores, nav, progreso (estático + funcional con `localStorage`), timer (tick + clampeo de deadline absurdo), tracks de vídeo (+ existencia de los `.vtt` en disco) y captura de errores de JS con `Page.addScriptToEvaluateOnNewDocument` |
| Grader hostil | `hostil-grader-r5.js` (batería R2 íntegra: 114 casos) |
| Adjudicaciones | `diag-video-r5.js` (target de cada evento `error`), `diag-track-http-r5.js` (control http://), `chip-diag.js` (mapa de píxeles del chip «Medio», re-ejecutado) |
| Flakiness | 0 timeouts en esta ronda; todas las ejecuciones completas |

Las 2 reglas del claim existen literalmente en `assets/css/components.css:524-526` (meta) y `components.css:67-71` (brand-mark), y `components.css` se carga después de `base.css` en las 10 páginas. Los `@media` (860/720 px) solo tocan layout, no color: los ratios son independientes del viewport.

---

## 2. Tabla de contrastes medidos (runtime)

### 2.1 Estado de las 2 instancias reclamadas — 14/14 OK

| # | Página / contexto | fg | bg | ratio (píxel / estilo) | R4 | Estado |
|---|---|---|---|---|---|---|
| A | **index · «Octubre 2026 → Enero 2027»** (`.theme-card--night .meta` en `#temas`) | **rgb(236,228,207) = `--cream`** | rgb(20,18,9) = #141209 | **14,79 / 14,79** | 3,09 | **CERRADO** |
| A | index · «120 minutos sugeridos» ×3 (tarjetas de exámenes) | rgb(236,228,207) | rgb(20,18,9) | **14,79 / 14,79** | 14,79 | OK (ya lo estaba vía `.section--night .meta`) |
| B | **index · «Archivo»** (`.nav__brand-mark` en nav `nav--night` transparente sobre el héroe) | **rgb(201,162,39) = `--gold-bright`** | rgb(21,19,9) | **7,69 / 7,75** | 2,62 | **CERRADO** |
| B | interior ×9 (planificacion, tema-1…5, examen-1…3) | rgb(109,85,24) = `--gold` | rgb(243,238,226) | **6,12 / 6,18** | 6,12 | sin regresión (la regla nueva no aplica: nav clara) |

Notas de exactitud (cero falsos positivos en ambos sentidos):
- Claim A: **no existe ninguna `.theme-card--night .meta` fuera del index** (las 4 tarjetas noche del curso están en `index.html:165-203`) — la exigencia «en index y en una página interior» se satisface midiendo las 4 instancias reales del index + confirmando 0 instancias en las 9 interiores.
- Claim B: el selector `.theme-head .nav__brand-mark` del claim **no tiene instancias** (la nav nunca está dentro de `.theme-head`); es un selector defensivo extra sobre el par que la R4 pidió (`.hero .nav__brand-mark, .nav--night .nav__brand-mark`), sin efecto secundario. El índice del index (`aria-label=null`) es el residual N9 conocido, no un fallo de contraste.

### 2.2 Familias del protocolo (mismas que R4) — 887/887 OK

| Familia | Instancias | Rangos medidos (fg sobre bg) | Bajo umbral |
|---|---|---|---|
| `.kicker` | 28 | 7,49 (héroe) · 7,75 (noche) · 5,54 (tinte) · 6,12 (papel) | 0 |
| `.meta` | 112 | **14,79** (tarjeta noche ×4, la fallada en R4 incluida) · 5,23 · 6,12 · 4,73 · 9,68 («Tiempo restante» @0.8) | 0 |
| `.chip` | 27 | 7,75 (`.chip--gold`) · 14,79 (crema ×18) | 0 |
| `.plaque__label` | 191 | 5,28–6,45 (dorada) · 5,28–5,62 (`.plaque--ia` `--ok`) | 0 |
| `.field label` | 150 | 5,23 · 5,90 | 0 |
| `th` | 14 | 4,73 | 0 |
| `.drill__id` | 111 | 4,73 | 0 |
| `.footer__colophon` | 20 | 6,21 (crema @0.62) | 0 |
| `.exam-score span` | 9 | 14,79 | 0 |
| `.btn--ghost` | 225 | 8,25 («Pista») · 8,01 («Reiniciar», crema @0.72) | 0 |

### 2.3 Familias M3 históricas / residuales — 129/129 OK

| Familia | Instancias | Rangos | Bajo umbral |
|---|---|---|---|
| `.drill__level` | 111 | «Normal» 4,82 ×42 · «Medio» 4,57 ×37 · «Examen» 4,81 ×32 | 0 |
| `.nav__brand-mark` | 10 | 7,69 (index) · 6,12 ×9 | 0 |
| `.exam-toolbar__timer` | 3 | 7,75 | 0 |
| `.hero__stat span` / `.hero__scroll` | 5 | 5,80–6,00 | 0 |

### 2.4 Barrido completo de texto

**6.679 runs restantes en las 10 páginas: 0 bajo umbral.** (105 runs eran texto grande con umbral 3:1 — todos con ratio ≥ al exigido; el resto, texto pequeño a 4,5:1.)

**Total: 7.695 runs · 0 bajo umbral · 2 filas en rojo de la R4 → 0.**

---

## 3. Smoke test de las 10 páginas — **0 fallos**

| Comprobación | Resultado |
|---|---|
| Errores de JS (window.onerror / unhandledrejection / console.error) | **0/10 páginas** |
| KaTeX sin errores | **4.355 fórmulas renderizadas · 0 `.katex-error`** en 10/10 |
| Nav | 10/10 con `.nav` + 4 links (index sin `aria-label` = residual N9, ya catalogado) |
| Campos de respuesta | **111/111 drills con campo** (15×5 temas + 12×3 exámenes), 0 sin campo |
| Progreso | index: 5 barras / 5 labels con formato `n / 15 · p%` ✔ · **funcional**: tras marcar 5/15 de tema-1 en `localStorage` → label «5 / 15 · 33%» + barra al 33% ✔ · barra de lectura en 10/10 ✔ |
| Timer | examen-1: formato `HH:MM:SS`, **tiqueta** (01:59:56 → 01:59:54) ✔ · deadline `1e21` **clampeado a 01:59:57** + reescrito finito en `sessionStorage` ✔ (misma regla `app.js:624-627` verificada en R4) |
| Tracks de vídeo | 6 vídeos (tema-2/4/5) con **6 `<track kind="captions" default>`** y 6 `.vtt` en disco; vídeos cargan (`readyState 4`, duración real, `mediaError 0`) |

---

## 4. Grader hostil de humo — **113/114**

`hostil-grader-r5.js` (batería R2 íntegra): **113/114**. El único desajuste es **H18** (`multi` con `fields:null` auto-aprueba) = **N6**, hallazgo **MENOR conocido desde R2** y declarado **no bloqueante** en la condición de reparación de la R4. **Ningún fallo nuevo.** (Los casos A1–A15 de falsos positivos, B de falsos negativos, C4/C5, e I/J de entradas extremas: todos en verde.)

---

## 5. Hallazgos residuales vivos (no bloqueantes)

Sin cambios respecto a la R4 — 9 menores/notas que la R4 declaró aplazables y que esta ronda no ha tocado (el fix es de 2 reglas de color). Re-observados en R5: **N6** (H18 del grader) y **N9** (nav del index sin `aria-label`, visible en el smoke). No re-expandidos por no ser objeto del protocolo R5: N4, N7, N8, N10, m4, m7 y la nota del `role="timer"`. **Ninguno es MAYOR ni CRÍTICO; no cambian el veredicto.**

---

## 6. Falsos positivos descartados (cero tolerancia)

1. **Chip «Medio» con peor píxel a 4,483:1** (umbral 4,5): re-ejecutado `chip-diag.js` sobre tema-1 → mapa de 660 píxeles con **1 solo píxel «X»** (interior, rodeado de píxeles 4,5–4,6) sobre fondo plano `--paper-2`; mediana 4,57:1, diseño 4,62:1. Ruido de rasterización ±1 LSB de la captura, no un color de fondo distinto. **No es hallazgo** (idéntico a la adjudicación de la R4).
2. **Eventos `error` de `<track>` en tema-2/4/5** (2 por página): el smoke los detecta como errores de *recurso*. `diag-video-r5.js` muestra que el target son los `.vtt` (`cues: 0`) mientras los **MP4 cargan bien**. Control `diag-track-http-r5.js`: sirviendo el mismo curso por `http://`, **los mismos tracks cargan sin errores** (3–4 cues con texto correcto: «Una matriz es una aplicación lineal.», etc.). Es la **restricción conocida de Chrome: los text tracks se fetchan en modo CORS y `file://` es un origen opaco** — afecta a cualquier WebVTT válido, no al marcado del producto (M10: 6 `<track>` + 6 VTT válidos + 6 MP4, cerrado en R2 y sigue cerrado). **No es hallazgo del producto**; nota de plataforma, no regresión (el fix de R5 es solo CSS).
3. **«sin errores de runtime» del smoke en su primera pasada**: clasificado mal por mi propio recolector (eventos `error` de recursos sin `message` se etiquetaban como `error: error`); el recolector se enriqueció con `e.target` y se separó JS de recurso. Error del instrumento, no del producto. Además, un `return` suelto fuera de función en el script de smoke rompió la primera ejecución (corregido; ninguna conclusión se apoyó en esa pasada).

---

## 7. Veredicto

### **APTO**

- **0 CRÍTICOS** — los cinco de la R1 siguen cerrados.
- **M3: CERRADO.** Las 2 instancias que bloqueaban APTO quedan en **14,79:1** y **7,69:1** (≥ 4,5 exigido), medidas por estilos computados y por píxeles en runtime. El claim es cierto y completo.
- **AA ≥4,5:1 en todo texto pequeño: cumplido por primera vez en la serie** — 7.695 runs en las 10 páginas, **0 bajo umbral** (familias del protocolo + barrido completo; el doble de cobertura que la R4).
- **Sin regresiones de motor**: smoke 10/10 en verde (campos 111/111, KaTeX 4.355 sin errores, nav, progreso estático+funcional, timer con tick y clampeo, 6 vídeos con captions) y grader hostil **113/114** sin fallos nuevos.
- **Condiciones de APTO de la R4 cumplidas**: la reparación mínima pedida (2 reglas) se aplicó y se verificó; los 9 menores restantes pueden aplazarse (así se acordó en R4) y ninguno empeora.

### Cierre de la serie

Con este veredicto se cierra el circuito de auditoría adversarial de UX/motor: **APTO**. Los pendientes no bloqueantes (N4, N6, N7, N8, N9, N10, m4, m7, nota del timer) quedan como backlog de pulido documentado en las actas de R1–R4.

---

## 8. Anexo — artefactos de verificación

Todo en `verify/arbitro/ronda5/` (re-ejecutable con Node ≥22 y Chrome; `cdp.js` con perfil/puerto únicos por lanzamiento):

| Archivo | Qué hace |
|---|---|
| `cdp.js` / `lib-png.js` | Cliente CDP y decoder PNG sin dependencias (mismos que R4) |
| `contraste-r5.js` / `.log` / `.json` / `contraste-r5-claims.log` | Claims dirigidos (14 runs) + tabla del protocolo + barrido (10 páginas, 7.695 runs) |
| `smoke-r5.js` / `.log` / `.json` | Smoke 10 páginas + progreso funcional + timer (tick y clampeo) |
| `hostil-grader-r5.js` / `.log` | 114 casos de grader (113/114, solo H18=N6) |
| `diag-video-r5.js` / `.log` | Target real de los eventos `error` (TRACK, no JS) + estado de `<video>`/`<track>` |
| `diag-track-http-r5.js` / `.log` | Control http://: tracks cargan (3–4 cues) → el fallo file:// es restricción de Chrome |
| `chip-diag-r5.log` | Mapa de píxeles del chip «Medio» (re-adjudica el 4,483:1 como ruido) |
