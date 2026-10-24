# Auditoría adversarial · Ronda 9 · Confirmación final · UX/motor

**Árbitro independiente** — Curso «Fundamentos Algebraicos para la IA» (CURSO MIMO)
Fecha: 2026-10-14 · Alcance: confirmación de cierre de los hallazgos **C1-R8**
(respuesta universal `(x-x)/(x-x)`) y **M1-R8** (perturbación `E+Δ·x^0.5`).
Desde la R8 **solo** han cambiado `assets/js/grader.js` (fail-closed de denominador
nulo · puerta de esqueleto trascendente · identidades verdaderas · const-fold) y
`tests/grader.test.js` (209/209). Protocolo de la comisión: (1) reproducir C1-R8 y
M1-R8 en un drill real y control positivo con solución; (2) smoke de las 10 páginas
(111 campos, KaTeX, nav, progreso, timer, tracks) + «Corregir examen» ≡ «Comprobar»;
(3) batería hostil de humo (multi incompleto, choice sin selección, localStorage
corrupto). **Si todo verde: APTO.**

---

## 1. Resumen ejecutivo

| Bloque del protocolo | Resultado |
|---|---|
| 1 · C1-R8 en drill real (`(x-x)/(x-x)` y familia U) → ✗ | **8/8 RECHAZA** en T1-N4 · sin solución · sin `solved` ✔ |
| 1 · M1-R8 en drill real (`E+Δ·x^0.5` y venenos) → ✗ | **11/11 RECHAZA** en T1-N4 y T1-M2 · sin `solved` ✔ |
| 1 · Respuesta correcta → ✓ con solución | **4/4** (`4/11`, `8/22`, decimal, multi) ✓ + solución + `solved` ✔ |
| 2 · Smoke 10 páginas | **0 fallos** · 111/111 campos · 4.355 fórmulas KaTeX · 0 errores JS ✔ |
| 2 · «Corregir examen» ≡ «Comprobar» | **12/12 tarjetas** · marcador 6/12 · nota 5 ✔ |
| 3 · Batería hostil de humo | **18/18** (multi incompleto ×6 · choice/bool sin selección ×2 · examen sin marcar ×2 · LS corrupto ×8) ✔ |
| Regresión del equipo (`tests/grader.test.js`) | **209/209** ✔ |

**Veredicto: APTO** — el protocolo de confirmación se cumple íntegro (0 fallos en los
3 bloques). C1-R8 y M1-R8 quedan **cerrados** en motor y en producto. Se levantan 2
reservas no bloqueantes (§7): R1, la familia residual de la vía numérica con
exponentes `|exp|>64` (incl. regresión parcial de B19) y el hueco `0^x`; R2, artefacto
de instrumentación propio, ya diagnosticado. La R1 es **deuda de cierre** respecto de
la regresión completa `B0–B19` que la R8 pedía como condición (§7, nota expresa).

---

## 2. Metodología (Ronda 9)

| Instrumento | Qué cubre |
|---|---|
| `ui-c1-m1-r9.js` | **Repro de producto** por Chrome/CDP en drills reales: familia universal 0/0 (U1–U8) y familia de veneno (B0–B8) contra T1-N4 (`expected 4/11`) con el botón «Comprobar» real; veneno y universal en multi (T1-M2); controles positivos con solución visible y persistencia `solved` |
| `repro-bypass-r9.js` | Re-ejecución sin cambios del motor de la R8 (`bypass-r8.js`): 36 casos × 20–50 runs (familias B0–B19 y U1–U13) + testigos de no-equivalencia |
| `smoke-r9.js` | Instrumento R8 sin cambios: 10 páginas — campos en los 111 drills, KaTeX, nav, progreso estático+funcional, timer (tick + clampeo), vídeos/`track`, colector de errores |
| `flujo-r9.js` | Instrumento R8 sin cambios: flujo real tema-1 + examen-1 — ✓ con solución / ✗, formas equivalentes vía UI, **«Corregir examen» ≡ «Comprobar»** tarjeta a tarjeta, marcador, «Reiniciar» |
| `hostil-ui-r9.js` | Batería hostil de humo: multi incompleto/basura (T1-M2), choice/bool sin selección (T1-N3, T1-M5, examen-1 entero), `localStorage` corrupto (8 casos representativos de los 15 de la R8) con motor operativo tras cada agresión |
| `probe-residual-r9.js` | Sonda de diagnóstico de la familia residual B16–B19 (frontera del tope `|exp|>64`), impacto en drill real y hueco de esqueleto `0^x` |
| `probe-errs-r9.js` | Sonda de diagnóstico del colector de errores (aisló el artefacto de instrumentación R2) |
| `tests/grader.test.js` (equipo) | Regresión del equipo: **209/209 OK** |

Se contrasta con los artefactos del lado matemático de la misma ronda
(`ataques-nuevos-r9.js`, `ataques-estructurales-r9.js`, `equivalentes-r9.js`,
`bateria-hostil-r9.js`, `giant-r9.js`, `dos-uno-r9.js`, `sympy-*.py`), cuyas familias
D_NULL/D_SKEL confirman de forma independiente los cierres C1/M1 y cuya familia
«residual N16» reproduce la reserva R1 de este informe (§7).

---

## 3. Punto 1a — C1-R8: respuesta universal `(x-x)/(x-x)` → **CERRADO**

En el drill real T1-N4 («fracción irreducible de 0,36…», `expected: "4/11"`), con el
botón «Comprobar» real (`ui-c1-m1-r9.js`):

| Respuesta escrita (familia U de la R8) | R8 | R9 (UI real) |
|---|---|---|
| `(x-x)/(x-x)` | ACEPTA ✘ | **RECHAZA** ✔ · progreso `failed` |
| `0/(x-x)` | ACEPTA ✘ | **RECHAZA** ✔ |
| `(x-x)^2/(x-x)` | ACEPTA ✘ | **RECHAZA** ✔ |
| `1*(x-x)/(x-x)` | ACEPTA ✘ | **RECHAZA** ✔ |
| `5+0*(x-x)/(x-x)` (J10 histórico R2) | ACEPTA ✘ | **RECHAZA** ✔ |
| `((x-x)*(x-x))/(x-x)` | ACEPTA ✘ | **RECHAZA** ✔ |
| `1/(x-x)` (A6 histórico) | RECHAZA ✔ | **RECHAZA** ✔ |
| `x/(x-x)` | RECHAZA ✔ | **RECHAZA** ✔ |

Motor (`repro-bypass-r9.js`, 50 runs/caso): **U1–U13 a 0/50 acepta** (en R8: U1–U11 a
50/50 acepta). Incluye la universal contra `expr`, matriz (T5-N5), `exprset` y `multi`,
y su versión en multi por UI (T1-M2 con ambos campos `(x-x)/(x-x)` → ✗). Corrobora el
lado matemático: `ataques-nuevos-r9.js` (D_NULL, 20 casos × 200 runs) **0/200 en las
20 variantes** de denominador nulo. Ninguna pervive como `solved`; el feedback es ✗ sin
solución visible. **C1-R8 cerrado** por fail-closed de denominador nulo:
`toRationalPoly` lanza `denominador nulo` y la vía numérica exige ≥3 puntos finitos,
que 0/0 nunca aporta.

---

## 4. Punto 1b — M1-R8: perturbación `E+Δ·x^0.5` → **CERRADO**

Con `Δ = log(x+5)+log(y+5)−log((x+5)(y+5))` (falso fuera de la rama principal; testigo
x=y=−6: `E+Δ·x^0.5` vale −10,39 ≠ E), en T1-N4 vía «Comprobar» real:

| Respuesta escrita (familia B de la R8) | R8 | R9 (UI real) |
|---|---|---|
| `4/11+Δ` (naive M5) | RECHAZA ✔ | **RECHAZA** ✔ |
| **`4/11+Δ·x^0.5`** (el bypass de la R8) | **ACEPTA ✘** | **RECHAZA** ✔ |
| `4/11+Δ·x^(1/2)` · `4/11+Δ·x^0.3333` | ACEPTA ✘ | **RECHAZA** ✔ · ✔ |
| `4/11+Δ·x^y` · `4/11+Δ·2^x` | ACEPTA ✘ | **RECHAZA** ✔ · ✔ |
| `4/11+Δ/(x^0.5+1)` · `4/11+Δ·(x+y)^(-1)` | ACEPTA ✘ | **RECHAZA** ✔ · ✔ |
| `1/2+Δ·x^0.5` (E erróneo + veneno) | RECHAZA ✔ | **RECHAZA** ✔ |
| `5*pi/6+Δ·x^0.5` en campo multi (T1-M2) | ACEPTA ✘ | **RECHAZA** ✔ |

Motor (`repro-bypass-r9.js`): **B0–B15 a 0/20 acepta** (en R8: B1–B12 a 18–20/20
acepta), incluidos venenos en `exprset` (B8), matriz (B9) y `multi` (B10), y los
controles sin potencia rara (B13–B15). Corrobora el lado matemático: D_SKEL
(14 casos de identidades de rama × 200 runs) **0/200 en todas**, incluidos los
forzados de fallback (`x^(3/2)-x^(3/2)`, `x^z-x^z`). El mecanismo de cierre es la
**puerta de esqueleto trascendente**: `structural === null` solo delega en la vía
numérica si el multiconjunto de átomos trascendentes coincide, y `Δ·x^0.5` aporta
átomos (`@log(…)`, `**x^0.5`) que `4/11` no tiene. **M1-R8 cerrado en su repro de la
R9.** Reserva R1 (§7): la familia B16–B19 de la misma raíz numérica sigue parcialmente
viva, fuera del repro acotado por la comisión.

---

## 5. Punto 2 — Smoke 10 páginas + «Corregir examen» ≡ «Comprobar»: **0 fallos**

| Chequeo | Resultado |
|---|---|
| Errores de JS | **0/10 páginas** (los `error: track:` de temas 2/4/5 son carga diferida de `.vtt` que sí existen en disco — mismo patrón que R5/R8) |
| KaTeX | **4.355 fórmulas · 0 `.katex-error`** en 10/10 (idéntico total a la R5/R8) |
| Nav | 10/10 con `.nav` + 4 links (index sin `aria-label` = residual N9 conocido) |
| Campos de respuesta | **111/111 drills con campo** (15×5 temas + 12×3 exámenes) |
| Progreso | 5 barras / 5 labels `n / 15 · p%` ✔ · **funcional**: 5/15 de tema-1 → «5 / 15 · 33%» + barra 33% ✔ · barra de lectura 10/10 ✔ |
| Timer | tick `01:59:56 → 01:59:54` ✔ · deadline `1e21` clampeado a `01:59:56` y reescrito finito en `sessionStorage` ✔ |
| Vídeos/tracks | 6 vídeos (temas 2/4/5) · 6 `captions` · 6 `.vtt` en disco · `mediaError 0` |

**«Corregir examen» ≡ «Comprobar»** (`flujo-r9.js`, examen-1, patrón par/impar
6 ✓ / 6 ✗):

| Chequeo | Resultado |
|---|---|
| Equivalencia tarjeta a tarjeta | **12/12** idénticas entre «Comprobar»×12 y «Corregir examen» (0 divergentes) |
| Marcador / nota | `6/12 · nota 5` (esperado) |
| Soluciones reveladas | 12/12 tras «Corregir examen» |
| Feedback ✓/✗ | coherente con la clase en 12/12 |
| «Reiniciar» | 0 marcadas · 0/12 · timer `01:59:59` |

Flujo de tema (controles positivos del protocolo): `4/11` → **✓ con solución visible**
y `solved` persistido; `8/22` ≡ 4/11 ✓ (capa estructural); decimal de doble precisión
✓; `0.8660254` y `sin(pi/3)` para `sqrt(3)/2` ✓ (tolerancia de constantes preservada);
`0.36363636363636365` ✓; multi correcta (2 · 5π/6) ✓ con solución.

---

## 6. Punto 3 — Batería hostil de humo: **18/18**

| Grupo | Casos | Resultado |
|---|---|---|
| (a) multi incompleto (T1-M2) | solo `mod`; solo `arg`; ambos vacíos; `mod`+arg basura; basura total `((( · ***`; recuperación | 6/6 → ✗ con feedback ✗ visible, 0 errores JS; la recuperación correcta sigue → ✓ con solución |
| (b) choice/bool sin selección | T1-N3 «Comprobar» sin marcar; T1-M5 bool sin marcar; examen-1 «Corregir examen» sin nada marcado (2 chequeos: tarjetas + marcador) | 4/4 → ✗ con «Selecciona una opción / verdadero o falso»; examen: 12/12 ✗, 0 ✓, marcador `0/12 · nota 0`, 0 errores JS |
| (c) `localStorage` corrupto | `{{{` · `null` · `[1,2,3]` · `undefined` · `__proto__` · valor anidado · sano · claves ajenas | 8/8 → boots sanos (15 drills, 779 fórmulas, labels `n / 15 · p%`), 0 errores JS y **motor operativo**: `4/11` → ✓ tras cada agresión |

*(Nota: la primera pasada de (c) reportó 8 fallos falsos por un artefacto del propio
instrumento — ver R2 en §7 y `probe-errs-r9.log`. Con el artefacto corregido, 8/8.)*

---

## 7. Hallazgos (no bloqueantes bajo el protocolo R9)

### R1 · **MENOR (deuda de cierre)** — familia residual de la vía numérica: `E+(x+y)^(-300)` y hueco `0^x`

**Qué**: con la respuesta correcta `E` conocida, `E+(x+y)^(-300)` (o
`E+(x²+y²+2)^(-200)`, `E+0^x`) se acepta como ✓ pese a no ser equivalente a `E`.
Muestreo (`probe-residual-r9.js`):

| Caso | Aceptación R9 | Diagnóstico |
|---|---|---|
| `1/(x+y)^64` vs 0 · `(x+y)^(-64)` vs 0 | 0/20 · 0/20 | `|exp|≤64` → decisión **estructural** → rechazo ✔ |
| `1/(x+y)^65` · `(x+y)^(-65)` vs 0 | 11/20 · 12/20 | `|exp|>64` → `toRationalPoly` → `null` → **vía numérica** ✘ |
| `(x+y)^(-300)` · `1/(x+y)^300` vs 0 | 36/50 · 17/20 | ídem ✘ (B16/B19) |
| `4/11+(x+y)^(-300)` en T1-N4 | **34/50** | impacto en drill real ✘ |
| `4/11+(x²+y²+2)^(-200)` en T1-N4 | **48/50** | ídem ✘ |
| `4/11+0^x` | **30/30** | hueco de esqueleto: `0^x` tiene base constante y no genera átomo ✘ |
| `4/11+(2^x-2^x)` · `4/11+(x-x)·x^0.5` | 30/30 · 30/30 | **aceptación correcta**: son matemáticamente `4/11` (la puerta no sobre-rechaza) ✔ |

**Mecanismo**: el tope anti-explosión `|exp|>64` de `toRationalPoly` (recomendación
M2-R8, presente en este parche) devuelve `null`; `equivalentStrings` cae a la vía
numérica con tolerancia `1e-6`, donde «minúsculo ≈ 0». Es la **misma raíz del
fallback numérico** que la R7/R8 llamaron familia N9r, en su variante de tolerancia
(no de reglas de rama). La extracción de exponentes `neg` del parche habría cerrado
B16–B18 estructuralmente, pero el tope la vuelve a esquivar para `|exp|>64`.
**Regresión colateral**: B19 (`1/(x+y)^300` vs 0) pasaba en la R8 de **0/20** (forma
racional decidida estructuralmente con `polyPowInt(300)`) a **16–17/20** acepta.

**Radiación real**: ningún `expected` escalar del banco es `0`; hay 5 celdas `"0"` en
matrices/vectores (T2-M5, T4), pero su aprovechamiento exige conocer el resto de la
celda y escribir `0` es más corto que el exploit. El valor como trampa es, por tanto,
**despreciable**; el valor como violación de contrato de equivalencia, real pero
acotado: aceptación probabilística (55–96 %), grindable, persiste `solved`. Por eso
**MENOR** y no MAYOR (la MAYOR de la N9r se apoyaba en identidades falsas de rama,
no en perturbaciones ε).

**Reproducción independiente (lado matemático, misma ronda)**: `ataques-nuevos-r9.js`
la nombra **«residual N16»** y registra **9 FP a 117–175/200** — `x^(-65)`,
`x^(-300)`, `5+x^(-300)`, `4-s-t+x^(-300)` **sobre el drill real T4-N3**,
`(x+y)^(-300)`, exprset T4-M5 `i+x^(-300);-i` y celdas de matriz T5-N5 `+x^(-300)`
(L8 `x^(-65)` vs `x^(-64)`: 158/200). Dos árbitros independientes convergen en el
mismo hallazgo y en la misma frontera (`|exp|>64`).

**Divergencia expresa con la R8**: la condición de cierre 2 de la R8 pedía «regresión
B0–B19 a 0 desajustes». Ese criterio estricto **no se cumple** (B16–B19 abiertos). La
comisión de la R9 acotó el repro de M1 al token `·x^0.5`, que sí queda cerrado; el
veredicto APTO se emite bajo ese protocolo. Si la comisión prefiere el criterio
estricto, R1 se eleva a MAYOR y el veredicto sería NO APTO hasta cerrarla.

**Fix recomendado (1 línea)**: en `equivalentStrings`, `structural === null` →
rechazo (fail-closed), dejando la vía numérica solo como falsificador o para
constantes puras — la prescripción alternativa que la R8 ya redactó. Verificado que
no rompe el contrato documentado: `0.8660254 ≈ sqrt(3)/2`, `sin(pi/3)` y
`0.36363636363636365` deciden por la vía estructural/fold de constantes.

### R2 · **MENOR (instrumentación)** — artefacto del colector de errores de `hostil-ui-r9`

La primera pasada de (c) reportó `JS-errs=2,4,…,16` crecientes. `probe-errs-r9.js`
probó que las páginas están limpias (1 colector → `[]`): el bug era del instrumento,
que concatenaba `COLLECTOR + "try{…}"` produciendo `})()try{` → `SyntaxError` en el
script inyectado. Corregido; 8/8 en verde. Sin impacto en el producto.

### Contraste con el lado matemático (mismo parche, no bloqueante para este protocolo)

- **Sobre-rechazo de identidades verdaderas** (FN=11 en `ataques-nuevos-r9` +
  `equivalentes-r9`): `tan(x) ≡ sin(x)/cos(x)`, `x^(3/2) ≡ x·sqrt(x)`,
  `x^(-1/2) ≡ 1/sqrt(x)`, `abs(x)^2 ≡ x·conj(x)`, `min/max` conmutativos, etc. — se
  rechazan a 0/200. Es la clase **N14-R8** (MENOR, ya aplazada y remitida al árbitro
  matemático en la R8); su informe de la R9 la adjudica.
- **Carga polinómica residual** (`dos-uno-r9.js`): `(x+y+z)^64` tarda 7,6–13,6 s y 3
  casos terminan en TIMEOUT/CUELGE (exit 124) — clase **M2-R8** (MENOR preexistente);
  el tope `|exp|>64` mitiga pero no elimina el grado 64 trivariable. El mismo tope es
  el que abre la reserva R1.

---

## 8. Veredicto

Con los tres bloques del protocolo en verde (repro C1 ✔ · repro M1 ✔ · control
positivo con solución ✔ · smoke 10 páginas ✔ · «Corregir examen» ≡ «Comprobar» ✔ ·
batería hostil ✔) y la regresión del equipo en **209/209**:

> **VEREDICTO: APTO** — C1-R8 y M1-R8 quedan cerrados en motor y en producto
> (confirmado de forma independiente por el lado matemático de la ronda: D_NULL/D_SKEL
> a 0/200). Reservas no bloqueantes: **R1** (familia residual `E+x^(-65…)`/`(x+y)^(-300)`/`0^x`,
> MENOR, deuda de cierre B0–B19 con fix fail-closed de una línea; reproducida por dos
> árbitros) y **R2** (artefacto del instrumento, ya corregido). Recomendación: aplicar
> el fail-closed de R1 en un parche posterior y re-ejecutar `repro-bypass-r9.js`
> (criterio: B0–B19 a 0).

### Reproducción

```sh
node tests/grader.test.js                          # 209/209
node verify/arbitro/ronda9/repro-bypass-r9.js      # 36 casos · 4 desajustes (solo B16–B19 = R1)
node verify/arbitro/ronda9/ui-c1-m1-r9.js          # repro UI C1/M1 + controles · 0 fallos
node verify/arbitro/ronda9/smoke-r9.js             # 10 páginas · 0 fallos
node verify/arbitro/ronda9/flujo-r9.js             # tema + examen · 0 fallos
node verify/arbitro/ronda9/hostil-ui-r9.js         # batería hostil de humo · 0 fallos
node verify/arbitro/ronda9/probe-residual-r9.js    # sonda R1 (frontera |exp|>64 · 0^x)
node verify/arbitro/ronda9/probe-errs-r9.js        # sonda R2 (artefacto del colector)
```

---

## 9. Anexo — artefactos de verificación

Todo en `verify/arbitro/ronda9/` (re-ejecutable con Node ≥22 y Chrome; `cdp.js`
re-exporta el cliente de la R8): instrumentos `ui-c1-m1-r9.js`, `repro-bypass-r9.js`
(copia fiel de `bypass-r8.js`), `smoke-r9.js` y `flujo-r9.js` (copias fieles de los
instrumentos R8), `hostil-ui-r9.js`, `probe-residual-r9.js`, `probe-errs-r9.js`;
logs `.log` y `smoke-r9.json` junto a cada instrumento; snapshot del motor auditado
en `grader-r9-snapshot.js` (idéntico a `assets/js/grader.js` en el momento de la
auditoría).
