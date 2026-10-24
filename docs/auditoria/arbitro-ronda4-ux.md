# Auditoría adversarial · Ronda 4 — UX y motor (verificación final)

**Curso:** Fundamentos Algebraicos para la IA (web estática, apertura por `file://`)
**Árbitro:** auditoría independiente externa (sin participación en la autoría; R1: `arbitro-ronda1-ux.md`, R2: `arbitro-ronda2-ux.md`, R3: `arbitro-ronda3-ux.md`)
**Fecha:** 2026-10-14
**Veredicto: NO APTO** — 0 CRÍTICOS · **M3 aún abierto como MAYOR (2 instancias reales < AA)** · N11 **CERRADO** · 9 menores/notas de rondas anteriores siguen vivos (no reclamados)

---

## 0. Resumen ejecutivo

| Claim de la R4 | Veredicto | Hecho verificado |
|---|---|---|
| M3a: `.theme-head .kicker` y `.hero .kicker` en oro brillante #c9a227 sobre #141209 ≈ 7,75:1 | **VERDADERO** | Medido: `rgb(201,162,39)` sobre `rgb(20,18,9)` = **7,75:1** (7,49:1 en el héroe del index, donde el gradiente aclara el fondo a `rgb(24,22,12)` — el claim calcula sobre el token plano; ambos ≫ 4,5) |
| M3b: `.theme-head .meta` y `.hero .meta` en crema ≈ 14,8:1 | **VERDADERO PERO VACÍO** | La regla CSS existe, pero **no hay ni una `.meta` dentro de `.theme-head` ni de `.hero` en las 10 páginas** (las `.meta` de cabecera que existen son las del sumario `.toc` y del pager). Donde sí hay `.meta` sobre noche (tarjetas de exámenes del index, dentro de `.section--night`) miden **14,79:1** en crema ✔ |
| M3c: `--gold` de texto a #6d5518 ≈ 6,2:1 sobre papel | **VERDADERO** | Medido `rgb(109,85,24)` = **6,12–6,18:1** sobre papel. Efecto colateral no contemplado: al oscurecer `--gold`, `.nav__brand-mark` sobre el héroe nocturno del index **empeora** (3,11 → **2,62:1**) |
| M3d: `--warn` #7d6114, `--ok` #416b40, `--bad` #9e4826 ≥ 4,5:1 sobre papel | **VERDADERO** | Chips de nivel medidos sobre `--paper-2`: Normal **4,82:1**, Medio **4,57:1**, Examen **4,81:1**. Los 27 chips del banco pasan |
| M3e: chips y puntuación en crema | **VERDADERO** | `.chip` **14,79:1**, `.chip--gold` **7,75:1**, `.exam-score span` **14,79:1** |
| M3f: botón fantasma del examen 14,8:1 | **CIFRA IMPRECISA — AA IGUALMENTE CUMPLIDO** | `.exam-toolbar .btn--ghost` («Reiniciar») usa `--cream-soft` `@0.72`, no crema plena: medido **8,01:1** (14,8 sería con `--cream` opaco). Pasa AA con holgura; no es hallazgo |
| N11: el temporizador clampea deadlines absurdos al plazo nominal | **VERDADERO — CERRADO** | 10 escenarios en verde: `999999999999999999999` → **01:59:59** (antes `277777777280012:37:20`), deadline reescrito finito, sin bloqueo indebido |

**Con 0 CRÍTICOS y N11 cerrado, el producto aún NO alcanza APTO: la condición de la R1 —AA ≥4,5:1 en todo texto pequeño— sigue sin cumplirse.** Quedan **2 instancias reales** bajo umbral (la tabla del protocolo tiene una fila en rojo: `.meta` de la tarjeta noche del index, **3,09:1** — la misma «meta oscuras» que la R3 marcó NO CORREGIDA — y, en la familia residual, `.nav__brand-mark` del index, **2,62:1**, con regresión respecto a la R3). Todo lo que el claim afirma es cierto (salvo la cifra 14,8); lo que falla es lo que el claim **no cubre**: la meta oscura se corrigió donde no estaba (`.theme-head/.hero .meta` no tienen instancias) y la que falla vive en `.theme-card--night`.

---

## 1. Metodología

Mismo estándar adversarial, con el instrumento **calibrado antes de medir** (cero falsos positivos en ambas direcciones):

| Fase | Técnica |
|---|---|
| Calibración del instrumento | `calib-r4.js` + `lib-png.js` (decoder PNG propio sobre `zlib` de Node, sin dependencias): colores conocidos exactos, coordenadas del clip de `Page.captureScreenshot` (documentales con `captureBeyondViewport`), y validez del truco `color:transparent` para fondo real → **6/6 verdes** |
| Contraste en runtime | `contraste-r4.js`: Chrome headless + CDP sobre **index, tema-1, planificacion, examen-1** (+ tema-3 y examen-2 como contraste de plantillas). Para cada nodo de texto: color computado (`fg`, con composición alfa), **fondo real muestreado por píxeles** (todo el texto puesto transparente, captura por viewport, mediana + peor píxel del rect del nodo) y fondo por composición de ancestros como contraste cruzado. Ratio WCAG por nodo; umbral 4,5:1 (texto pequeño) / 3:1 (≥24 px o ≥18,66 px bold) |
| Cobertura | **3.633 runs de texto** medidos (1.912 en las 4 páginas del protocolo + 1.721 en 2 páginas extra), de los cuales 3.122 pertenecen al barrido completo |
| N11 | `n11-r4.js`: 10 escenarios de `sessionStorage` (1e21, 1e15 finito, 10 h, 4 h 30, 3 h, 3 h 59, pasado, basura, sesión limpia, F5) |
| Residuales | `residual-r4.js`: N4, N6 (vía `grader.js` en Node), N7 (muestreo de drift 24 s a 1440 px), N8, N9, N10, m4, m7, nota R2 del timer + `chip-diag.js` y `diag320-r4.js` para adjudicar dudosos |
| Regresión | Re-ejecución de las baterías de R2/R3: `smoke.js` (10 páginas), `hostil-grader.js` (114 casos), `app-hostil.js` (29 escenarios), `hostil-r3.js` (§1–§3 íntegras + §4–§6 aisladas en Chrome limpio), `c2-diag.js` (reveal) |
| Flakiness (transparencia) | Chrome/CDP sigue siendo flaky en este equipo: `n11-r4.js` sufrió 1 timeout (re-ejecutado completo) y `hostil-r3.js` se colgó 2 veces en un `Runtime.evaluate` tras ~80 s de sesión (degradación del WebSocket; §4–§6 verificadas aisladas con Chrome limpio). **Ninguna acusación de este informe se basa en un timeout** |

---

## 2. Tabla de contrastes medidos (runtime)

Familias exigidas por protocolo sobre index, tema-1, planificacion, examen-1. `fg`/`bg` = colores reales (mediana de píxeles del fondo con texto oculto); ratio = WCAG sobre esos colores. Umbral 4,5:1 (todo el texto medido es pequeño: 11,52 px salvo el timer a 20 px). Instancias agregadas cuando comparten fg/bg.

### 2.1 `.kicker` — 10/10 OK

| Página / contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| index · héroe (`rgb(201,162,39)` = #c9a227) | #c9a227 | rgb(24,22,12)* | **7,49** | OK |
| index · «Autoevaluación» (sección noche), tema-1, planificacion, examen-1 | #c9a227 | rgb(20,18,9) = #141209 | **7,75** | OK |
| index · «Programa», tema-1 ×3 (papel tintado) | #6d5518 | rgb(234,227,209) | **5,54** | OK |
| index · «Método» (papel) | #6d5518 | rgb(243,238,226) | **6,12** | OK |

\* el gradiente radial del héroe (`.hero__bg`) aclara el fondo; el claim (7,75 sobre token plano) se cumple de forma conservadora.

### 2.2 `.meta` — 35/36 OK · **1 FALLA**

| Página / contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| index · progreso de tarjetas «0 / 15 · 0%» ×5 | rgb(107,98,72) = `--ink-mute` | rgb(243,238,226) | **5,23** | OK |
| **index · tarjeta noche «Octubre 2026 → Enero 2027»** (`.theme-card--night` en `#temas`) | **rgb(107,98,72) = `--ink-mute`** | **rgb(20,18,9) = #141209** | **3,09** | **FALLA** |
| index · tarjetas noche de exámenes «120 minutos sugeridos» ×3 (en `.section--night`) | rgb(236,228,207) = `--cream` | rgb(20,18,9) | **14,79** | OK |
| tema-1 · sumario `.toc .meta` ×13 | #6d5518 | rgb(243,238,226) | **6,12** | OK |
| tema-1 · metas de bloque/pager | rgb(107,98,72) | rgb(234,227,209)/rgb(243,238,226) | **4,73 / 5,23** | OK |
| planificacion · sumario ×4 / pager ×2 | #6d5518 / rgb(107,98,72) | papel / paper-2 | **6,12 / 4,73** | OK |
| examen-1 · «Tiempo restante» (inline `rgba(236,228,207,0.8)`) | crema @0.8 | rgb(20,18,9) | **9,68** | OK |
| examen-1 · pager «Anterior/Siguiente» ×2 | rgb(107,98,72) | rgb(243,238,226) | **5,23** | OK |

La fila en rojo es exactamente la instancia «meta oscuras» que la R3 ya marcó como NO CORREGIDA (3,09:1, idéntica). El claim corrigió `.theme-head .meta` y `.hero .meta`, que **no tienen ninguna instancia en el curso**; la que falla es `.theme-card--night .meta` (no cubierta por ninguna regla: `.meta` hereda `--ink-mute` sobre `background: var(--night)`).

### 2.3 `.chip` — 9/9 OK

| Página / contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| `.chip--gold` (tema-1, planificacion, examen-1) | #c9a227 | #141209 | **7,75** | OK |
| `.chip` crema (×6) | rgb(236,228,207) | #141209 | **14,79** | OK |

### 2.4 `.plaque__label` — 53/53 OK

| Variante | fg | bg | ratio | Estado |
|---|---|---|---|---|
| etiqueta dorada (def/teorema) | #6d5518 | rgb(247,244,236) / rgb(239,232,211) | **6,45 / 5,79** | OK |
| etiqueta dorada sobre tinte (`--paper-3`) | #6d5518 | rgb(231,222,195) | **5,28** | OK |
| etiqueta `.plaque--ia` («En IA», «Lectura práctica») | rgb(65,107,64) = `--ok` | rgb(247,244,236) / rgb(241,237,226) | **5,62 / 5,28** | OK |

### 2.5 `.field label` — 30/30 OK

| Contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| «Tu respuesta», «Vector f1/f2 (unitario)» (tema-1 + examen-1) | rgb(107,98,72) | rgb(243,238,226) | **5,23** | OK |

### 2.6 `th` — 6/6 OK

| Contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| cabeceras de tabla (planificacion ×6, bold 11,52 px → sigue siendo texto pequeño) | rgb(107,98,72) | rgb(234,227,209) = `--paper-2` | **4,73** | OK |

### 2.7 `.drill__id` — 27/27 OK

| Contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| T1-N1…T1-E4, X1-1…X1-12 | rgb(107,98,72) | rgb(234,227,209) | **4,73** | OK |

### 2.8 `.footer__colophon` — 8/8 OK

| Contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| 4 páginas × 2 spans | crema @0.62 | rgb(20,18,9) | **6,21** | OK |

### 2.9 `.exam-score span` — 3/3 OK

| Contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| «Acertadas», «Preguntas», «Nota / 10» | rgb(236,228,207) = `--cream` | rgb(20,18,9) | **14,79** | OK |

### 2.10 `.btn--ghost` de la barra de examen — 55/55 OK

| Contexto | fg | bg | ratio | Estado |
|---|---|---|---|---|
| **«Reiniciar» (`.exam-toolbar .btn--ghost`)** | crema @0.72 = `--cream-soft` | rgb(20,18,9) | **8,01** | OK (claim decía 14,8:1: la cifra corresponde a crema plena; el elemento usa `--cream-soft`. AA cumplido) |
| «Pista»/«Ver solución» (tema-1, examen-1) | rgb(76,69,47) = `--ink-soft` | rgb(243,238,226) | **8,25** | OK |

### 2.11 Familias históricas de M3 / residuales

| Familia | fg | bg | ratio | Estado |
|---|---|---|---|---|
| `.drill__level` «Normal» ×10 (`--ok` #416b40) | rgb(65,107,64) | rgb(234,227,209) | **4,82** | OK |
| `.drill__level` «Medio» ×9 (`--warn` #7d6114) | rgb(125,97,20) | rgb(234,227,209) | **4,57** | OK |
| `.drill__level` «Examen de grado» ×8 (`--bad` #9e4826) | rgb(158,72,38) | rgb(234,227,209) | **4,81** | OK |
| `.exam-toolbar__timer` (20 px) | #c9a227 | #141209 | **7,75** | OK |
| `.hero__stat span` ×4 · `.hero__scroll` | crema @0.62 | héroe (gradiente) | **5,80–6,00** | OK |
| `.nav__brand-mark` · tema-1, planificacion, examen-1 | #6d5518 | rgb(243,238,226) | **6,12** | OK |
| **`.nav__brand-mark` · index («Archivo», nav transparente sobre el héroe)** | **#6d5518** | **rgb(21,19,9)** | **2,62** | **FALLA — regresión** (R3: 3,11 con el `--gold` anterior) |

### 2.12 Barrido completo de texto

3.122 runs de texto restantes en 6 páginas: **0 bajo umbral**. Familia exigida + extra bajo umbral: **2** (las filas en rojo de §2.2 y §2.11).

---

## 3. N11 — estado: **CERRADO**

Regla verificada en `app.js:624-627`: si `deadline > ahora + 2×plazo`, se clampea a `ahora + plazo` y se reescribe en `sessionStorage`.

| Escenario | Resultado |
|---|---|
| `999999999999999999999` (repro de la R3) | **01:59:59** (8 chars; antes `277777777280012:37:20`, 21 chars) · deadline reescrito finito dentro del plazo · examen operativo, 0/38 bloqueados |
| `Date.now()+1e15` | clampeado a 01:59:59 |
| 10 h (> 4 h = 2× nominal) | clampeado a 01:59:59 |
| 4 h 30 (justo por encima del umbral) | clampeado a 01:59:59 |
| 3 h (≤ 2× nominal) | respetado (02:59:57) — regla: solo clampea deadlines **absurdos** (> 2× plazo) |
| 3 h 59 | respetado (03:53:57) |
| deadline pasado | 00:00:00 + bloqueo total 38/38 + auto-corrección |
| basura `abc` | sesión nueva 01:59:59 |
| F5 con deadline válido | conserva deadline (00:02:03 → 00:02:02), no regala tiempo |

---

## 4. Hallazgos residuales vivos (no reclamados en la R4)

| # | Hallazgo | Estado | Evidencia R4 |
|---|---|---|---|
| **M3-residuo A** | `.theme-card--night .meta` (index) sin override de color → `--ink-mute` sobre `--night` | **ABIERTO — bloquea APTO** | **3,09:1** (§2.2); es la «meta oscuras» de la R3. Fallo de una línea: falta `.theme-card--night .meta { color: var(--cream) }` |
| **M3-residuo B** | `.nav__brand-mark` del index (nav absoluta y transparente sobre el héroe nocturno) | **ABIERTO — regresión 3,11 → 2,62:1** | §2.11. El oscurecimiento de `--gold` (#7a5f1c → #6d5518) mejora fondos claros y empeora este fondo oscuro. Nota: WCAG 1.4.3 exime logotipos; la R1–R3 lo contó como texto sujeto a AA y la condición de APTO de la serie lo incluye. Falta `.hero .nav__brand-mark, .nav--night .nav__brand-mark { color: var(--gold-bright) }` |
| N4 | `markChoiceFeedback` no marca `is-right`/`is-wrong` en `choice`/`bool` anidados en `multi` | **ABIERTO** | T2-E4 tras corregir: 0/2 `.choice` marcados (`app.js:399` sigue sin recorrer `fields` de multi) |
| N6 | `multi` con `fields:null` auto-aprueba | **ABIERTO** | `Grader.check({type:"multi",fields:null},{})` → `{ok:true}` (`grader.js:572-580`, sin guard); = H18 de `hostil-grader` |
| N7 | Héroe 1440: fórmulas decorativas sobre kicker/h1 | **ABIERTO** | 160 solapes en 80 muestras de 24 s (mismos instantes que la R3: `ix≈108×13`, `103×36`); cosmético (fórmulas a 34 % de oro, `aria-hidden`) |
| N8 | Footer inconsistente entre páginas | **ABIERTO** | 3 colofones distintos en 5 páginas |
| N9 | Nav del index sin `aria-label` | **ABIERTO** | `<nav class="nav nav--night">` con `aria-label=null` (el resto de páginas sí lo tienen) |
| N10 | `aria-label` del mapa con TeX crudo | **ABIERTO** | 20 `aria-label` con `\(...\)` literal (p. ej. `Tuplas y producto cartesiano: \((a,b) = \{\{a\},\{a,b\}\}\);`) |
| m4 | Pager con 3 estructuras | **ABIERTO** | tema-1 «Volver/Siguiente», tema-3 y exámenes «Anterior/Siguiente», planificacion «Volver/Empezar» |
| m7 | Tipografía mezclada en nodos del mapa | **ABIERTO** | 4 nodos con KaTeX (serif) dentro de cajas Inter |
| (nota R2) | `#exam-timer` sin `role="timer"`/`aria-live="off"` | **ABIERTO** | `role=null` |

Ninguno de ellos es MAYOR ni CRÍTICO (así fueron clasificados en R1–R3); se listan por el protocolo de repaso, no cambian por sí solos el veredicto.

---

## 5. Falsos positivos descartados (cero tolerancia)

1. **Chip «Medio» con peor píxel a 4,483:1** (umbral 4,5): mapa de píxeles del área de texto (`chip-diag.js`) → **1 píxel de 660**, interior, rodeado de píxeles 4,5–4,6, sobre fondo plano `--paper-2` (4,62:1 de diseño, 4,57 de mediana). Es ruido de rasterización ±1 LSB de la captura, no un color de fondo distinto. **No es hallazgo.**
2. **Desbordes a 320 px** (SVG del mapa mental `r=774`, inputs de matriz `r=414`): ambos viven en contenedores con `overflow-x: auto` (`[data-mindmap]`: scrollWidth 773 > clientWidth 281; `.matrix-input`: 382 > 228) y el documento **no** desborda (`scrollWidth == innerWidth == 320`). Es el patrón N2 aceptado en la R3 (scroll horizontal operativo). `diag320-r4.js` + assert refinado en `sec56-r4.js` → 0 desbordes reales.
3. **«cross-page width=6%»** de `hostil-r3.js`: la app redondea `Math.round(1/15·100)=7` y muestra «1 / 15 · 7%» con barra al 7 %. Assert erróneo del banco, ya documentado como falso positivo en la R3; la app es correcta.
4. **Colgues de CDP** (`Runtime.evaluate` timeout en `hostil-r3.js` ×2 y en `n11-r4.js` ×1): degradación del WebSocket/Chrome en sesiones largas. Re-ejecutado todo (§4 y §5–§6 de `hostil-r3` aisladas con Chrome limpio: verde). Ninguna conclusión se apoya en un timeout.

---

## 6. Regresiones y baterías

| Batería | Resultado |
|---|---|
| `smoke.js` (10 páginas) | **VERDE**: 111/111 drills con campo de respuesta, 0 `.katex-error`, nav 10/10, `aria-live` en feedback/nota, dianas del pie ≥24 px, 0 `input[type=number]`, mindmaps con role/aria |
| `hostil-grader.js` (114 casos) | **113/114** — solo H18 (= N6, menor conocido) |
| `app-hostil.js` (29 escenarios) | **29/29 — 0 fallos** (almacenamiento sucio, reveal, timer, foco) |
| `hostil-r3.js` (68 comprobaciones) | §1 LS (14 valores ×2) 28/28 ✔ · progreso válido ✔ · §2 SS (12 valores) 12/12 ✔ **incluido «gigante 1e21» ya en verde** · §3 F5/carreras 3/3 ✔ · §4 multi+matriz aislada 5/5 ✔ · §5 320 px + §6 landscape aisladas 12/12 ✔. Única marca: el assert erróneo de cross-page (§5.3). La ejecución íntegra en un solo proceso muere por flake de CDP (~80 s), no por el producto |
| `c2-diag.js` (reveal) | 15/15 reveladas a 375×812 y 360×640, 0 fallos |
| Exámenes 2–3, F5, reduced-motion, fuentes | Sin regresión respecto a R3 (no tocados por el claim) |

---

## 7. Veredicto

### **NO APTO**

- **0 CRÍTICOS** — los cinco de la R1 siguen cerrados.
- **N11: CERRADO y verificado** (10 escenarios). El claim es cierto.
- **M3: NO cerrado.** Todo lo que el claim afirma se reproduce (kicker 7,49–7,75; chips 7,75/14,79; puntuación 14,79; `--gold` 6,12; `--warn/--ok/--bad` 4,57–4,82; «Tiempo restante» 9,68; botón fantasma 8,01 con AA cumplido), pero la condición de APTO de la R1 —**AA ≥4,5:1 en todo texto pequeño**— **no se cumple**: quedan **2 instancias** (meta de tarjeta noche del index **3,09:1**; brand-mark del index **2,62:1**, con regresión). El claim corrigió `.theme-head/.hero .meta`, que no tienen instancias; la meta que falla está en `.theme-card--night` y quedó fuera.

### Reparación mínima para APTO (2 reglas, ronda 5)

```css
.theme-card--night .meta { color: var(--cream); }                       /* cierra 3,09:1 */
.hero .nav__brand-mark, .nav--night .nav__brand-mark { color: var(--gold-bright); }  /* cierra 2,62:1 */
```

Verificación: re-ejecutar `contraste-r4.js` → 0 filas en rojo. Con eso, y sin regresiones, el producto cumple las condiciones mínimas de la R3 y procedería **APTO**. (Los 9 menores restantes —N4, N6, N7, N8, N9, N10, m4, m7, nota del timer— pueden aplazarse: no bloquean.)

---

## 8. Anexo — artefactos de verificación

Todo en `verify/arbitro/ronda4/` (re-ejecutable con Node ≥22 y Chrome; `cdp.js` con perfil/puerto únicos por lanzamiento):

| Archivo | Qué hace |
|---|---|
| `lib-png.js` | Decoder PNG sin dependencias (base del muestreo de píxeles) |
| `calib-r4.js` | Calibración del instrumento (colores, coordenadas de clip, truco de texto transparente) — 6/6 |
| `contraste-r4.js` / `.log` / `.json` | Tabla del protocolo + barrido (6 páginas, 3.633 runs) |
| `contraste-r4.js --only-extra` / `contraste-r4-extra.log` / `-extra.json` | tema-3 + examen-2 (1.721 runs, 0 bajo umbral) |
| `chip-diag.js` | Mapa de píxeles del chip «Medio» (descarta el 4,483:1 como ruido) |
| `n11-r4.js` / `n11-r4.log` | 10 escenarios del temporizador |
| `residual-r4.js` / `residual-r4.log` | N4, N6, N7, N8, N9, N10, m4, m7, nota timer |
| `sec4-r4.js` / `sec56-r4.js` / `diag320-r4.js` (+ logs) | §4–§6 de `hostil-r3` aisladas + adjudicación de desbordes a 320 px |
