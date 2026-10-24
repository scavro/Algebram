# Auditoría adversarial · Ronda 8 · Confirmación final · UX/motor

**Árbitro independiente** — Curso «Fundamentos Algebraicos para la IA» (CURSO MIMO)
Fecha: 2026-10-14 · Alcance: confirmación UX/motor tras el cierre APTO de la R5
(`docs/auditoria/arbitro-ronda5-ux.md`). Desde la R5 **solo** han cambiado
`assets/js/grader.js` (nueva capa de equivalencia estructural, prescrita por la R7
matemática) y `tests/grader.test.js`. Protocolo: (1) smoke de las 10 páginas,
(2) flujo real de corrección en un tema y un examen, (3) batería hostil de humo al
grader (entradas basura, multi incompleto) y a `app.js` (localStorage corrupto).

---

## 1. Metodología (Ronda 8)

| Instrumento | Qué cubre |
|---|---|
| `smoke-r8.js` | 10 páginas con Chrome headless/CDP: campos en los 111 drills, KaTeX sin errores, nav, progreso del índice (estático + funcional), timer de exámenes (tick + clampeo), vídeos con `<track>`; colector de errores de JS/recurso |
| `flujo-r8.js` | Flujo real de corrección en tema-1 y examen-1 por CDP: correcta → ✓ **con solución**; incorrecta → ✗; equivalente estructural vía UI; «Corregir examen» ≡ «Comprobar» tarjeta a tarjeta; marcador; «Reiniciar» |
| `hostil-grader-r8.js` | Batería R2/R5 íntegra (114 casos, expectativas sin tocar) + SET-S basura contra la capa estructural + SET-H multi malformado + SET-CONSISTENCIA de los 111 drills + SET-R7 (familia M1–M12 ×10) |
| `bypass-r8.js` | Búsqueda de **falsos positivos de la capa estructural**: exploits de rama con «veneno» (B), exponentes negativos (B16–B19) y respuesta universal 0/0 (U), 20–50 runs/caso, con testigos de no-equivalencia |
| `ui-bypass-r8.js` | Prueba de producto de los exploits por el botón «Comprobar» real (T1-N4) |
| `dos-poly-r8.js` | Explosión polinómica de la capa estructural (procesos hijos con timeout) |
| `hostil-app-r8.js` | `localStorage` corrupto (15 casos), `sessionStorage` de deadline corrupto (8), auto-sanación, «Corregir examen» con storage sucio |
| `tests/grader.test.js` (equipo) | Regresión del equipo: **190/190 OK** |

Se contrasta además con los artefactos del lado matemático de la misma ronda
(`ataques-estructurales-r8.js`, `bateria-hostil-r8.js`, `equivalentes-r8.js`,
`giant-r8.js`), cuyas familias S_UNIV / S_FALLBACK reproducen de forma independiente
los hallazgos C1-R8 y M1-R8 de este informe.

---

## 2. Punto 1 — Smoke de las 10 páginas: **0 fallos**

| Chequeo | Resultado |
|---|---|
| Errores de JS (window.onerror / unhandledrejection / console.error) | **0/10 páginas** |
| KaTeX sin errores | **4.355 fórmulas renderizadas · 0 `.katex-error`** en 10/10 (idéntico total a la R5) |
| Nav | 10/10 con `.nav` + 4 links (index sin `aria-label` = residual N9, conocido) |
| Campos de respuesta | **111/111 drills con campo** (15×5 temas + 12×3 exámenes), 0 sin campo |
| Progreso del índice | 5 barras / 5 labels con formato `n / 15 · p%` ✔ · **funcional**: tras marcar 5/15 de tema-1 → «5 / 15 · 33%» + barra al 33% ✔ · barra de lectura 10/10 ✔ |
| Timer de exámenes | examen-1: `HH:MM:SS` con tick (01:59:56 → 01:59:54) ✔ · deadline absurdo `1e21` clampeado a 01:59:57 y reescrito finito en `sessionStorage` ✔ |
| Vídeos con track | 6 vídeos (tema-2/4/5) con **6 `<track kind="captions" default>`** y 6 `.vtt` en disco · `mediaError 0` |

---

## 3. Punto 2 — Flujo real de corrección: **0 fallos**

**tema-1** (`flujo-r8.log`):

| Escenario | Resultado |
|---|---|
| T1-N4 incorrecta | ✗ «Aún no es correcto» · sin solución revelada ✔ |
| T1-N4 correcta (`4/11`) | ✓ **con solución visible** ✔ · `localStorage` = `solved` ✔ |
| T1-N4 equivalente estructural (`8/22` ≡ 4/11) | ✓ (capa estructural vía UI) ✔ |
| T1-M2 multi correcta (2 · 5π/6) | ✓ con solución ✔ |
| T1-M2 multi parcialmente mala (arg π/6) | ✗ ✔ |
| T1-M4 exprset reordenado / malo | ✓ / ✗ ✔ |
| T1-E4 decimal `0.8660254` y `sin(pi/3)` | ✓ / ✓ (constantes por vía numérica) ✔ |
| Botón «Ver solución» | revela la solución ✔ |

**examen-1**:

| Escenario | Resultado |
|---|---|
| «Comprobar» × 12 (patrón 6 ok / 6 bad) | 6 ✓ / 6 ✗ ✔ |
| «Corregir examen» vs «Comprobar» | **coinciden en 12/12 tarjetas** ✔ |
| Marcador | 6/12 · nota **5** ✔ · 12/12 soluciones reveladas ✔ |
| Feedback ✓/✗ por tarjeta | coherente con la clase en 12/12 ✔ |
| «Reiniciar» | 0 marcadas · 0/12 · timer 01:59:58 ✔ |

---

## 4. Punto 3 — Batería hostil

### 4.1 Grader (`hostil-grader-r8.js`, 146 casos): **138/146 · 8 desajustes**

- **Batería R2/R5 íntegra: 110/114.** Desajustes: **A11, E10, E12** (nuevos desde la R5;
  cambios de contrato de la capa estructural, §6) y **H18** (= N6 conocido, sin cambios).
- **SET-S (basura, 20 casos): 19/20** — sin crashes ni bucles; único desajuste S11
  `(x+y)^(-300)` vs 0 aceptado (§5 M1, misma raíz del bypass).
- **SET-H (multi malformado): 2/5** — H19 `fields:{}`, H20 `fields:0`, H23 sin `fields`
  auto-aprueban: familia N6 ampliada (§6).
- **SET-CONSISTENCIA: 111/111** — todo drill acepta su propia respuesta esperada;
  timing máximo **1 ms** (T1-E2). El banco real no sufre la capa nueva en el uso honesto.
- **SET-R7: 70/70 runs con 0 falsos positivos** — la familia M1–M12 de la R7
  **en su forma naive queda cerrada por el fix** (0/10 en M1, M5, M7, M9, M10, M11, M12).
- **I-set (entradas extremas): 15/15** sin crash ni bucle (10k caracteres, 9999
  paréntesis, `<script>`, objetos, `999999!`, matrices malformadas, emoji…).
- Tests del equipo: **190/190**.

### 4.2 `app.js` con almacenamiento corrupto (`hostil-app-r8.js`): **25/25**

- **localStorage (15/15)**: JSON inválido, `null` (el N1 de la R2), string, array,
  número, booleano, `undefined`, vacío, `__proto__`, valores anidados/booleanos,
  300 KB de basura, 3000 claves, claves ajenas — **en todos**: tema-1 arranca con
  15 drills + 779 fórmulas + 0 errores de JS y los labels quedan en formato
  `n / 15 · p%` (los sanos muestran «1 / 15 · 7%»).
- **Auto-sanación**: con LS `{{{`, corregir T1-N4 reescribe `{"T1-N4":"solved"}`.
- **sessionStorage (8/8)**: `abc`/`NaN`/`Infinity`/`""`/`0` → deadline nuevo
  (≈02:00) desbloqueado; `999…9` → clampeo a 2 h (regla R5); `-1` y `1e21`
  (parseInt = 1 → pasado) → **fail-safe**: 00:00:00 con inputs bloqueados
  («tiempo agotado»; «Reiniciar» lo recupera).
- «Corregir examen» operativo con LS corrupto (0 errores de JS).

---

## 5. Hallazgos del motor — los falsos positivos de la capa estructural

Dos caras de la misma clase —**«✓ Correcto» deja de implicar «la respuesta es
correcta»**—, ambas **nuevas desde la R5** (el motor numérico antiguo las rechazaba:
evaluaba 0/0 como NaN y exigía ≥3 puntos comparados) y ambas con reproducción por el
botón «Comprobar» real. Están corroboradas de forma independiente por las familias
S_UNIV / S_FALLBACK de `ataques-estructurales-r8.js` (lado matemático de esta ronda).

### C1-R8 · **CRÍTICO** — respuesta universal `(x-x)/(x-x)`: aprueba cualquier pregunta sin conocerla

`toRationalPoly` representa `0/0` como `{n: polinomio-cero, d: polinomio-cero}`; al
comparar, la diferencia cruzada `a.n·d₂ − b.n·d₁` es `0 − 0 = 0` → `polyIsZero` →
**veredicto «equivalente» para cualquier expresión esperada**. No hay chequeo de
denominador nulo ni de definición. Reproducción (`bypass-r8.js`, SET-U, 50 runs/caso):

| Caso | Resultado |
|---|---|
| U1–U4: `(x-x)/(x-x)` vs `5`, vs `4/11` (drill real), vs `log(x*y)`, vs `x+y` | **50/50 ACEPTA** ✘ |
| U5–U8: `0/(x-x)`, `(x-x)^2/(x-x)`, `1*(x-x)/(x-x)`, `5+0*(x-x)/(x-x)` (J10 histórico R2) | **50/50 ACEPTA** ✘ |
| U9–U11: la misma basura en **matriz T5-N5 (4 celdas)**, **exprset**, **multi** | **50/50 ACEPTA** ✘ |
| U12–U13 (controles): `1/(x-x)`, `x/(x-x)` con numerador no nulo | 0/50 — rechaza ✔ |

**Cobertura en el banco**: un único token **aprueba 57/111 drills (51 %)** —
`expr` 12/12, `matrix` 15/15, `vector` 10/10, `exprset` 8/8 y 12 `multi` con campos
`expr` — repartidos en todo el curso: **examen-1 8/12 · examen-2 3/12 · examen-3 6/12 ·
tema-1 8/15 · tema-2 10/15 · tema-3 3/15 · tema-4 8/15 · tema-5 11/15**.

**Prueba de producto** (`ui-bypass-r8.js`, T1-N4, botón «Comprobar» real):

| Respuesta escrita | Veredicto de la UI |
|---|---|
| `(x-x)/(x-x)` | **ACEPTA → ✓ «Correcto»** y `localStorage` queda con `{"T1-N4":"solved"}` ✘ |

**Testigo de no-equivalencia**: `(x-x)/(x-x)` no es una expresión definida (0/0);
`G.evaluate` devuelve `{re: null}` en cualquier punto. No equivale a ninguna respuesta.

**Severidad**: **CRÍTICO**. La propiedad que los críticos C1–C5 de la R1 restauraron
—«las notas de examen son justas» y «el bucle intenta → corrige → aprende existe en
las 111 preguntas»— queda rota para el 51 % del banco: un examen puede aprobarse
escribiendo el mismo token en cada tarjeta simbólica. Es un falso positivo
**determinista (100 %), sin conocimiento de la respuesta y sin coste** — la forma más
grave de la clase N9r que la R7 declaró MAYOR.

### M1-R8 · **MAYOR** — bypass del fallback numérico: la familia N9r sigue viva con un token de veneno

La R7 matemática dictaminó **MAYOR** la familia N9r («falsos positivos […] por reglas
de rama»): `E + log(u)+log(v)−log(u·v)` se aceptaba como equivalente a `E` en el
**100 %** (`ataques-r7.js`: M5/M9/M10/M11 = 300/300) y prescribió el chequeo
estructural AST como única clausura estable. El equipo lo implementó y su forma naive
**sí queda cerrada** (SET-R7: 0/10 en todas). **Pero la capa es esquivable**:
`toRationalPoly` devuelve `null` ante exponentes no enteros (`grader.js:683`) y ante
exponentes negativos entre paréntesis (parsean como nodo `neg`), y `equivalentStrings`
(`grader.js:769-777`) delega entonces en la **vía numérica** — la misma que la R7
demostró no cerrar. Basta multiplicar el ruido de rama Δ por una potencia no entera
bajo un `+`:

```
respuesta = 4/11 + (log(x+5)+log(y+5)-log((x+5)(y+5)))·x^0.5     ← matemáticamente FALSA
```

| Caso (`bypass-r8.js`) | Resultado |
|---|---|
| B0/B0b: `E+Δ` y `4-s-t+Δ` naive (control) | **0/20** — el fix las cierra ✔ |
| B1–B3: `E+Δ·x^0.5`, `·x^(1/2)`, `·x^0.3333` | **20/20 ACEPTA** ✘ |
| B4 `E+Δ·x^y` · B5 `·2^x` · B6 `E+Δ/(x^0.5+1)` · B7 `·(x+y)^(-1)` | **18–20/20 ACEPTA** ✘ |
| B8/B9/B10: veneno en **exprset / matriz / multi** (M10/M11) | **20/20 ACEPTA** ✘ |
| B11/B12: `·abs(x)^0.5`, `·sqrt(x)^0.3333` | **20/20 ACEPTA** ✘ |
| B13–B15 (controles sin potencia rara: `·sqrt(x)`, `·sin(x)`, `·x`) | 0/20 — el fix rechaza ✔ |
| B16–B18: `(x+y)^(-300)`, `(x+y)^-300`, `(x^2+y^2+2)^(-200)` vs 0 | **35–49/50 ACEPTA** ✘ (misma raíz) |
| B19: `1/(x+y)^300` vs 0 (forma racional) | 0/20 ✔ |

**Testigo**: en x = y = −6, `4/11+Δ·x^0.5` vale **−10,3906** (|Δ| = 15,39). Las
expresiones no son equivalentes; el acierto persiste como `solved` (`app.js:490`) y es
grindable («Comprobar» no se deshabilita, `app.js:504`).

**Prueba de producto** (`ui-bypass-r8.js`, T1-N4):

| Respuesta escrita | Veredicto de la UI |
|---|---|
| `4/11+(log(x+5)+log(y+5)-log((x+5)(y+5)))` (naive) | RECHAZA ✔ |
| **`4/11+(log(x+5)+log(y+5)-log((x+5)(y+5)))·x^0.5`** | **ACEPTA → ✓** ✘ |
| `1/2+Δ·x^0.5` (E erróneo) | RECHAZA ✔ |

**Causa raíz** (3 líneas, `grader.js`):

1. `grader.js:769-777` — `equivalentStrings` trata `structural === null` como «confía
   en la vía numérica», pero `null` significa «forma no soportada», no «equivalencia
   no decidible».
2. `grader.js:683` — exponente no entero → `return null` para toda la expresión; un
   `neg` como exponente (paréntesis) también cae aquí.
3. `grader.js:586-611` — `rewriteTrueIdentities` **no recurre en nodos `+`/`-`/`/`**,
   con lo que ni el rewrite `u^(1/2)=sqrt(u)` se aplica bajo sumas (por eso `x^0.5`
   envenena bajo `+` pero no bajo `*`, donde sí se reescribe a `sqrt(x)`).

**Severidad**: **MAYOR** — es literalmente la familia que la R6/R7 declararon MAYOR
(«reglas de producto de rama aceptadas indebidamente»), abierta con un token de
diferencia respecto de la forma que el fix sí cierra.

---

## 6. Cambios de contrato de aceptación desde la R5 (adjudicados, no bloqueantes)

La batería R2/R5 pasaba en R5 a **113/114**; hoy está en **110/114**. Los 3 desajustes
nuevos son efectos de la capa estructural sobre el contrato de aceptación:

| # | Cambio | Evidencia | Impacto en el banco | Adjudicación |
|---|---|---|---|---|
| **N13-R8** | **Tolerancia de constantes**: la vía estructural decide con `polyIsZero` (1e-8) donde el diseño documentado era `tol: 1e-6`. A11 (`1e-7 ≈ 0` en matriz, etiquetado «diseño» en la R2) ahora **rechaza**; igualmente decimales redondeados a 6–7 cifras: `0.444444` vs `4/9`, `0.1428571` vs `1/7`, `1.0471976` vs `π/3`, `2.6179939` vs `5π/6` → **rechazan** (R5 aceptaba) | `hostil-grader-r8.log` (A11); sonda directa | **0/111** — los enunciados piden «fracción irreducible», «forma exacta», «forma binómica», «como fracción»; el tipo `number` conserva 1e-6 (`numberMatches`); decimales con 8+ cifras siguen aceptándose | **MENOR** — pero contradice la nota de diseño de la R2 («la tolerancia 1e-6 … `sqrt(3)/2 ≈ 0,866…` lo necesita») y la expectativa A11 de la batería. Fix: comparar constantes puras con `nearlyEqual(…, spec.tol)` antes de decidir por estructura |
| **N14-R8** | **Identidades globales trigonométricas rechazadas** (sobre-rechazo): E10 `cos²+sin² ≡ 1`, E12 `tan ≡ sin/cos` (aceptadas en R5) → rechazan; también `exp(log(x)) ≡ x`. La prescripción R7 pedía rechazar identidades de rama **no globales**; la implementación rechaza toda identidad no polinómica | `hostil-grader-r8.log` (E10, E12) | **0/111** — ningún `expected` contiene sin/cos/tan de variables (el único trig en un enunciado, X1-6, espera `4/9`); `sin(pi/3)` como respuesta a T1-E4 **sí** se acepta (constantes por vía numérica) | **MENOR** — sobre-rechazo fuera del alcance del producto; el criterio de identidades globales es semántica-matemática (remitido al árbitro matemático) |
| **N6** (conocido) | `multi` con `fields` vacío/nulo/no-objeto auto-aprueba: H18 (igual que en R5) + **H19** `fields:{}`, **H20** `fields:0`, **H23** sin `fields` (ampliación de esta ronda) | `hostil-grader-r8.log` | 0/32 `multi` del banco (todos con `fields` poblado) | **MENOR** (ya catalogado N6 en R2; 3 miembros nuevos de la misma familia) |

### M2-R8 · **MENOR (endurecimiento)** — explosión polinómica: una entrada hostil congela la pestaña

La capa estructural expande potencias de sumas (`toRationalPoly` → `polyPowInt`), una
superficie **nueva desde la R5** (la vía numérica antigua era inmune). `dos-poly-r8.js`
— coherente con `giant-r8.js` del lado matemático —:

| Entrada en un campo de respuesta | Comportamiento |
|---|---|
| `(x+y+z)^50` | 593 ms bloqueando el hilo principal |
| `(x+y+z)^100` | **8,6 s** bloqueando |
| `(x+y+z)^150`, `(x+y+z)^300`, `(a+b+c+d)^40`, `(a+b+c+d+e+f+g+h)^10` | **FREEZE** (> 15–20 s; el navegador marcaría la pestaña «sin respuesta») |

Trigger: entrada hostil deliberada en cualquier campo `expr`/`matrix`/`exprset`/`multi`.
**0/111 drills** lo producen (timing máx 1 ms), sin impacto en integridad ni datos, y
es auto-infligido → **MENOR** por la calibración R1–R4. Fix: tope de monomios/tiempo
en `polyMul`/`polyPowInt` con rechazo fail-closed.

---

## 7. Falsos positivos de esta auditoría (trazabilidad)

1. **Fallo de flujo T1-M2 en la primera ejecución de `flujo-r8.js`**: mi relleno de
   `multi` usaba `:scope > .field` sobre `.drill__answer`, pero los `.field` son
   nietos (bajo `.drill__fields`) — el campo no se rellenaba. Error del instrumento;
   corregido y re-ejecutado (T1-M2 ✓). Ninguna conclusión se apoyó en la pasada mala.
2. **Sonda de tolerancia con destructuring defectuoso**: las respuestas de cada caso se
   fusionaban en un array y todo «rechazaba» por `String(array)`. Descartada la pasada
   y re-ejecutada caso a caso; los datos de §6 proceden de la v2.
3. **«Contradicción» del veneno en M7**: un caso con `·x^0.5` rechazaba mientras M5
   aceptaba. Causa: `rewriteTrueIdentities` sí reescribe `x^0.5 → sqrt(x)` bajo nodos
   `*`/`^`, pero **no** bajo `+`/`-`/`/` — el veneno solo funciona bajo suma. La
   investigación refinó M1-R8 (regla exacta del dominio del bypass) sin invertirlo:
   B1–B12 lo confirman en su dominio y B13–B15 confirman que el fix retiene el rechazo
   para factores racionales/función.
4. **Primera medición DoS con timeout global**: `(x+y+z)^300` agotó el presupuesto del
   bucle y no hubo salida. Reescrita con `spawnSync` + timeout por caso (`dos-poly-r8.js`).

*(Los falsos positivos descartados en R2, R4 y R5 —chip «Medio», tracks `file://`,
recolector de errores— siguen descartados; no se han reproducido en esta ronda.)*

---

## 8. Veredicto

## **NO APTO**

**(1 CRÍTICO · 1 MAYOR · 4 MENORES)**

Todo el protocolo UX/motor está en verde y **sin regresiones de UI** respecto a la R5:

- **Smoke 10/10** con 0 fallos: 111/111 drills con campo, 4.355 fórmulas sin errores,
  nav, progreso estático y funcional, timer con tick y clampeo, 6 vídeos con captions.
- **Flujo de corrección 0 fallos**: ✓ con solución / ✗ en tema, y
  **«Corregir examen» ≡ «Comprobar» en 12/12 tarjetas** con marcador justo (6/12 · 5).
- **`app.js` resiste almacenamiento corrupto 25/25** (incluido el `null` que fue N1 en
  la R2), con auto-sanación del progreso.
- **Auto-consistencia 111/111** del banco real en el uso honesto (timing ≤ 1 ms) y la
  capa nueva **cierra la familia N9r en su forma naive** (70/70 runs de la R7);
  tests del equipo **190/190**.

**Pero el motor de corrección tiene falsos positivos deterministas nuevos desde la
R5, y eso es exactamente lo que esta ronda debía confirmar:**

1. **C1-R8 (CRÍTICO)** — la respuesta universal **`(x-x)/(x-x)`** (0/0 sin definir)
   se acepta como correcta para **cualquier** valor esperado en `expr`, `matrix`,
   `vector`, `exprset` y `multi` (50/50 en todos los casos U1–U11) y **aprueba 57/111
   drills del banco, incluidos 17/36 de los tres exámenes**. El botón «Comprobar» real
   la marca ✓ y la persiste como `solved`. Rompe la propiedad que los críticos C1–C5
   de la R1 restauraron («las notas de examen son justas»).
2. **M1-R8 (MAYOR)** — el bypass del fallback numérico (`E+Δ·x^0.5`) reabre la familia
   N9r que la R6/R7 dictaminaron MAYOR: aceptación 18–20/20 en `expr`, `matrix`,
   `exprset` y `multi`, con testigo de no-equivalencia y confirmación por la UI real.

Con el criterio firme de la serie (APTO exige 0 CRÍTICOS y 0 MAYORES), la Ronda 8
**no puede cerrar en APTO**. Los menores no bloquean: N13-R8 (tolerancia de
constantes), N14-R8 (identidades globales trig), N6 (multi malformado, ampliado),
M2-R8 (explosión polinómica), más el backlog ya aplazado en R4/R5 (N4, N7, N8, N9,
N10, m4, m7, nota del timer).

### Condición de cierre (reparación mínima)

1. **Cerrar C1-R8**: en `toRationalPoly`/`structurallyEqual`, rechazar toda fracción
   cuyo denominador sea el polinomio cero (y, en general, toda forma `0/0` o no
   definida) — el camino numérico antiguo ya lo hacía al exigir `compared >= 3` con
   evaluaciones finitas. Regresión: SET-U (U1–U13) a 0 desajustes × 50 runs.
2. **Cerrar M1-R8**: fail-closed en `equivalentStrings` (`structural === null` →
   rechazo, con la vía numérica solo como falsificador) **o** totalizar
   `toRationalPoly` (átomos para `^` no soportado + exponentes `neg` + recursión de
   `rewriteTrueIdentities` por `+`/`-`/`/`). Regresión: B0–B19 a 0 desajustes × 50
   runs y `ataques-r7.js` con variantes envenenadas a 0/300.
3. **(Recomendado, no bloqueante)** tope de monomios/tiempo (M2-R8);
   `nearlyEqual(spec.tol)` para constantes puras (N13); decisión expresa sobre
   identidades globales (N14) — semántica matemática, a cargo del árbitro matemático.

### Reproducción

```sh
node verify/arbitro/ronda8/smoke-r8.js          # 10 páginas · 0 fallos
node verify/arbitro/ronda8/flujo-r8.js          # tema + examen · 0 fallos
node verify/arbitro/ronda8/hostil-grader-r8.js  # 146 casos · 8 desajustes (A11,E10,E12,H18,S11,H19,H20,H23)
node verify/arbitro/ronda8/bypass-r8.js         # 36 casos · 26 desajustes = C1-R8 + M1-R8 confirmados
node verify/arbitro/ronda8/ui-bypass-r8.js      # exploits por «Comprobar» real (✓ en T1-N4)
node verify/arbitro/ronda8/dos-poly-r8.js       # 4/15 FREEZE
node verify/arbitro/ronda8/hostil-app-r8.js     # 25/25
node tests/grader.test.js                       # 190/190
```

---

## 9. Anexo — artefactos de verificación

Todo en `verify/arbitro/ronda8/` (re-ejecutable con Node ≥22 y Chrome; `cdp.js` con
perfil/puerto únicos por lanzamiento). Artefactos de este árbitro (UX/motor):

| Archivo | Qué hace |
|---|---|
| `cdp.js` | Cliente CDP sin dependencias (mismo que R5) |
| `smoke-r8.js` / `.log` / `.json` | Smoke de las 10 páginas + progreso funcional + timer |
| `flujo-r8.js` / `.log` | Flujo de corrección tema-1 / examen-1 (Comprobar ≡ Corregir examen) |
| `hostil-grader-r8.js` / `.log` | 146 casos: batería R2 íntegra + SET-S + SET-H + SET-CONSISTENCIA + SET-R7 |
| `bypass-r8.js` / `.log` | Falsos positivos de la capa estructural (B0–B19 veneno/fallback, U1–U13 universal) |
| `ui-bypass-r8.js` / `.log` | Prueba de producto de los exploits en T1-N4 |
| `dos-poly-r8.js` / `.log` | Explosión polinómica (15 casos con timeout por proceso) |
| `hostil-app-r8.js` / `.log` | localStorage/sessionStorage corruptos + auto-sanación |

Artefactos del lado matemático de la misma ronda (no generados por este árbitro):
`ataques-estructurales-r8.js` (S_UNIV/S_FALLBACK = familias de C1-R8/M1-R8),
`bateria-hostil-r8.js`, `equivalentes-r8.js`, `giant-r8.js`, `sympy-r8.py`.
