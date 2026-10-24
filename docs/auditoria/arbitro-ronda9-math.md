# Auditoría matemática — Ronda 9 · VEREDICTO FINAL (ÁRbitro adversarial independiente)

**Curso:** Fundamentos Algebraicos para la IA — `CURSO MIMO/`
**Objeto:** `assets/js/grader.js` (versión R9, 1112 líneas; snapshot en `verify/arbitro/ronda9/grader-r9-snapshot.js`)
**Alcance:** protocolo R9 (re-ejecución de la batería R8 completa a ≥200 runs/caso · ataques nuevos a las defensas N10/N11/N12–N16 · `node tests/grader.test.js` · 10 ejercicios con sympy 1.11)
**Evidencia:** `verify/arbitro/ronda9/*-r9-math.*` (scripts + `.json` + `.log` de cada batería; ~62.000 comprobaciones)
**Fecha:** 2026-10-14

---

## 1. Resumen ejecutivo

Los dos CRÍTICOS de la R8 están **cerrados y verificados**: la identidad universal `0/0` (N10) y la re-apertura de N9r vía fallback forzado (N11) dan **0/200** en toda la superficie medida, incluidos los denominadores nulos elaborados del paso 2. El bug del historial J10 (`5+0*(x-x)/(x-x)`) vuelve a 0/200 tras haber estado en 200/200. La batería hostil R1–R7 completa: **0 falsos positivos en 76 casos (15.200 runs)**.

**Pero el gate del protocolo R9.1 («0 falsos negativos en los 78 equivalentes») falla con 10 FN efectivos, y los ataques nuevos del R9.2 destapan una familia FP grindable intacta (N16r) con las MISMAS tasas que la R8 (173/200), además de que el DoS de N15 sigue abierto.** El contrato global («cualquier forma equivalente se acepta») queda roto en una clase sistemática de identidades verdaderas, tres de ellas **regresiones introducidas por el propio fix de N11**.

| # | Hallazgo | Gravedad | Efecto | Reproducción |
|---|----------|----------|--------|--------------|
| **N10** | `0/0` universal vía polinomio vacío | **CERRADO** ✔ | `(x-x)/(x-x)`, `0/(x-x)`, `1/(x-x)-1/(x-x)`, `5+0*(x-x)/(x-x)`, `(x-x)*(x-x)` en denominador, `0*(x-x)`, fracciones cruzadas, matriz/exprset/vector → **0/200** cada uno | `ataques-estructurales-r9-math.log` U1–U20 · `ataques-nuevos-r9-math.log` N1–N20 |
| **N11** | Fallback forzado reabría N9r | **CERRADO para FP** ✔ | F1–F8 y explotados desplazados sobre specs reales → **0/200**; el gate de esqueleto trascendente bloquea ramas falsas incluso con perturbaciones no convertibles | `ataques-estructurales-r9-math.log` F1–F10 · `ataques-nuevos-r9-math.log` S1–S14 |
| **N12r** | Identidades verdaderas certificadas rechazadas de forma determinista (7 persistentes de R8 + **3 regresiones del fix N11** + 10 casos nuevos del paso 2) | **MAYOR** | 10 FN efectivos de los 78 equivalentes (11 crudos; ver §5) + 10 casos nuevos (`tan=sin/cos`, `|x|²=x·conj(x)`, `conj` de restas, `im`/`re`) → 0/200 | `equivalentes-r9-math.log` · `ataques-nuevos-r9-math.log` T1–T10 · `sympy-identidades-r9.py` |
| **N16r** | Exponentes negativos con \|k\|>64 siguen escapando al fallback numérico (sin marca en el esqueleto) y la tolerancia los acepta como ≡0/≡E | **MENOR** (grindable) | `5+x^(-300)` vs `5` → **173/200** (idéntico a R8); `x^(-65)` vs `x^(-64)` → **158/200** (respuesta incorrecta aceptada); expr/matrix/exprset 117–176/200. La cláusula del equipo «potencias grandes distintas → rechazo» es **falsa para negativos** | `ataques-nuevos-r9-math.log` L8, R1–R9 · `repro-n16r-r9-math.log` · `bordes-r9-math.log` |
| **N15r** | DoS por tamaño de polinomio (no por exponente) | **MENOR** | `(x+y+z)^64` 7,6–13,7 s; `(x+y+z+w)^64`, `(a+b+c+d+e)^64`, `((x+y+z)^64+x)^64` → **timeout 60 s (pestaña congelada)**. El tope \|k\|≤64 no acota el nº de monomios | `dos-r9-math.log` |
| **N14r** | Formas gigantes semánticamente idénticas → rechazo errático | MENOR | `(x+y)^1024` vs `((x+y)^512)^2` 20/200 (errático); `x^100000` vs `x^99999*x` 0/200 (FN); solo entradas gigantes no pedidas | `bordes-r9-math.log` |
| **N13r** | `min(2,3)+0,5` no parsea (la coma decimal se desactiva en toda la cadena si hay `min(`/`max(`) | MENOR | 1 FN de parser; los 3 casos R8 (M16–M18) están **cerrados** | `bordes-r9-math.log` · `ataques-estructurales-r9-math.log` M16–M18 |
| **F4** | `fact(x)` no es escribible (parsea `f·a·c·t(x)`); `x!` serializa internamente como `fact(x)` | NOTA | Sin FP; **mi expectativa ACEPTAR en el caso NEW-F4 era inválida** (contradice mi propio control M2) — reexaminada y reclasificada, no cuenta como FN del grader | `bordes-r9-math.log` |

**Veredicto: NO APTO.** El protocolo R9 exige «todo en verde» (0 FP y 0 FN en los 78 equivalentes; ataques nuevos limpios). Se miden **10 FN efectivos en los 78** (gate R9.1 incumplido), **9 FP grindables en los ataques nuevos** (gate R9.2 incumplido) y **1 MAYOR residual (N12r)**, que por sí solo viola el criterio vigente desde R6 («APTO exige 0 CRÍTICOS y 0 MAYORES»). El criterio de gravedad arroja **0 CRÍTICOS, 1 MAYOR, 3 MENORES**.

---

## 2. Verificación de las afirmaciones del equipo

| Afirmación R9 | Veredicto | Evidencia |
|---|---|---|
| **N10**: `toRationalPoly` lanza ante denominador nulo (fail-closed) → `0/0`, `0/(x-x)`, `1/(x-x)-1/(x-x)`, `5+0*(x-x)/(x-x)` caen al fallback que exige ≥3 puntos finitos → rechazo | **VERIFICADA** | `grader.js:812-814` (throw «denominador nulo») + `grader.js:499` (`compared >= 3`). 40 payloads (U1–U20, N1–N20): **0/200** cada uno, incl. `(x-x)*(x-x)`, `0*(x-x)`, `1/(x^2-x*x)`, `2/(x-x)` vs `1/(x-x)`, celdas de matriz, exprset T4-M5. Control N11 (`1/(x-x)^0`≡`1`) acepta 200/200 ✓ |
| **N11**: `equivalentStrings` solo muestrea si el esqueleto trascendente coincide; si difiere → rechazo sin muestreo | **VERIFICADA para FP** | `grader.js:889-895` (short-circuit estructural + gate `atomSkeleton`). F1–F10 (N9r desplazada + forzado `x^(3/2)`, `x^z`, `0*x^(3/2)`): **0/200**; S1–S9 (ramas falsas con forzado): **0/200**. **Salvedad**: el gate introduce 5 falsos negativos (P1–P3, P7, P9) — ver §6 |
| **N12**: `serializeAST` pliega constantes, ordena `+`/`*`, normaliza `x/c≡x·(1/c)`; `rewriteTrueIdentities` con `cos²=1−sin²`, `cosh²=1+sinh²`, `exp(log u)=u`, `conj` homomorfismo, `u^(1/2)=sqrt(u)`, `sqrt(u)²=u`, recursión en sumas/restas | **VERIFICADA en su alcance literal** | HIST-V1/V3/V8/V9 (los 4 históricos rotos en R8) → **200/200**; NEW-A1–A10 (orden dentro de átomos) → **200/200**; R8-C5 `x/c≡x·(1/c)` → 200/200. **Pero el alcance no cubre N12 completo**: la lista de rewrites es finita y quedan fuera `tan=sin/cos`, `|x|²=x·conj(x)`, `conj` de restas/negaciones, `re`/`im`, radicales `√(k·x)`, potencias fraccionarias y `min`/`max` — 21 casos de identidades verdaderas rechazadas (§6). La recomendación R8(d) («fallback numérico si `structurallyEqual` da `false` con solo átomos») **no se implementó** |
| **N13**: coma decimal no se aplica si hay `min(`/`max(` | **VERIFICADA** | `grader.js:153`. M16 (`min(2,3)`≡`2`) 200/200; M17 (`min(2,3)`≢`2.3`) 0/200; M18 (`max(1,2)`≢`1.2`) 0/200. **Residuo menor** N13r: la desactivación es de toda la cadena — `min(2,3)+0,5` no parsea (0/200) |
| **N14/N15**: exponentes estructurales acotados a \|k\|≤64 (potencias grandes → idénticas por fast-path; distintas → rechazo) | **PARCIAL / FALSA en una cláusula** | Idénticas → fast-path 0 ms ✓ (N14 cerrado para idénticas, `giant-r9-math.log`). Distintas **positivas** → rechazo ✓ (`x^65`≢`x^66` 0/200; `(x+y)^2000`≢`2001` 1 ms). **Falsa para negativas**: `x^(-65)` vs `x^(-64)` → **158/200 acepta** (L8) y `5+x^(-300)` vs `5` → **173/200** (R3). **N15 sigue abierto**: el tope de exponente no acota monomios — 4 variables o potencias anidadas cuelgan >60 s (§8) |
| **N16**: exponentes enteros negativos (incl. `x^(-20)`) manejados por la vía estructural (const-fold de `-(n)`) | **VERIFICADA solo para \|k\|≤64** | `grader.js:787-798` (const-fold de `neg` + recíproco). `x^(-20)`≡`1/x^20` 200/200; `x^(-20)` vs `0` y `5+x^(-20)` vs `5` → **0/200** (controles estructurales). **Pero \|k\|>64 vuelve al fallback numérico sin marca de esqueleto** (enteros no se registran como átomos, `grader.js:724-735`) y la familia grindable de R8 queda **intacta**: tasas idénticas a la R8 (§7) |
| Tests propios 209/209 con regresiones B0-style | **VERIFICADA** | `node tests/grader.test.js` → *Pasaron: 209 · Fallaron: 0*. Los huecos restantes: sin test de `tan=sin/cos`, `|x|²=x·conj(x)`, `min`/`max` conmutativos, `√(4x)`, `x^(-300)`, ni DoS multivariable (§9) |

---

## 3. N10 — CERRADO ✔

El throw «denominador nulo» (`grader.js:812-814`) se dispara en cuanto `out.d` es el polinomio cero, y `structurallyEqual` captura la excepción → `null` → fallback numérico, donde todo punto evalúa a `NaN`/`Inf` y `compared >= 3` falla. Cadena completa verificada a 200 runs:

| Payload | Esperado | R8 | R9 |
|---|---|---|---|
| `(x-x)/(x-x)`, `0/(x-x)`, `1/(x-x)-1/(x-x)`, `5+0*(x-x)/(x-x)` (J10) | cualquiera | 200/200 FP | **0/200** ✔ |
| `1/((x-x)*(x-x))`, `(x+1)/((x-x)*(x-x))`, `(x-x)/((x-x)*(x-x))`, `(x-x)/(2*(x-x))` | `5` | — | **0/200** ✔ |
| `1/(0*(x-x))`, `1/(0*x)`, `1/(-(x-x))`, `1/((x-x)+(x-x))`, `1/((x+y)-(x+y))`, `1/(x^2-x*x)`, `1/((x+1)^2-(x+1)^2)` | `5` | — | **0/200** ✔ |
| `2/(x-x)` vs `1/(x-x)` (fracciones cruzadas), `1/(x-x)+1/(y-y)` | `5`/`1/(x-x)` | — | **0/200** ✔ |
| `((x-x)*log(x))/((x-x)*exp(x))`, `5+1/((x-x)*(x-x))` | `5` | — | **0/200** ✔ |
| `(x-x)/(x-x)` en matriz, `1/((x-x)*(x-x));…` en exprset T4-M5 | T5-N5 / T4-M5 | 200/200 FP | **0/200** ✔ |
| Control `1/(x-x)^0` ≡ `1` (verdadero: `(x-x)^0=1`) | `1` | — | **200/200** ✔ |

---

## 4. N11 — CERRADO para FP ✔ (con regresiones FN, §6)

El gate de esqueleto (`grader.js:893-895`) compara el multiconjunto de átomos (`@fn(...)` y `**potencias no enteras`) **antes** de muestrear: una perturbación no convertible añade átomos y rompe la coincidencia → rechazo sin evaluar. Superficie verificada a 200 runs — **0 FP**:

- **Forzado de fallback** (R8 F1–F8): `+x^(3/2)-x^(3/2)`, `+x^z-x^z`, `0*x^(3/2)`, `+x^(0.3)-x^(0.3)` sobre el exploit desplazado `E+log(u)+log(v)-log(u·v)`, incluidas specs reales T4-N3, T4-M5, T5-N5 → 0/200 cada uno.
- **Ramas falsas con esqueleto que difiere** (paso 2, S1–S14): `log(x*x)` vs `2log(x)` y su inverso (pedido explícitamente por el protocolo), `log(x^2)` vs `2log(x)`, `sqrt(x*x)` vs `x`, `sqrt(x^2)` vs `x`, `asin(sin(x))` vs `x`, forzado combinado `5+log(x*x)-2log(x)+x^(3/2)-x^(3/2)` → 0/200 cada uno.
- **Mismos átomos, estructura falsa** (S10–S11): `log(x)*log(y)` vs `log(x)+log(y)`, `sin(x)/sin(y)` vs `sin(x)-sin(y)` → rechazan por la vía estructural (la diferencia cruzada de polinomios sobre átomos no es cero) → 0/200 ✔.
- **Controles**: `x-y+x^(1/3)-x^(1/3)` vs `0` (verdadero pero `x-y≢0`) rechaza; `5+log(exp(x))-x+x^y-x^y` rechaza.

**Mecanismo de las regresiones (importante para el equipo):** el gate clasifica como «átomo» toda potencia **no entera** (`grader.js:724-735`). `x^(3/2)` produce el átomo `**…` pero `x·sqrt(x)` produce el átomo `@sqrt(x)` → esqueletos distintos → rechazo **sin muestreo**, aunque ambas expresiones son la misma función (certificado con sympy). Antes del fix, ambas caían al muestreo numérico y se aceptaban (R8: P1–P3 **200/200**; R9: **0/200**).

---

## 5. Matriz de resultados de la re-ejecución R9.1 (≥200 runs/caso)

| Batería | Composición | Resultado |
|---|---|---|
| Hostil R1–R7 (`bateria-hostil-r9.js`, N=200) | 76 casos: H_LOGEXP 18, H_FIJO 17 (O1–O5, A1–A10, J8–J10, P30, wraps), H_BRANCH 12 (L1–L12), H_SHIFT 15 (M0–M13), H_NEGEXP 14 (X1–X14) | **76/76 → 0/200** ✔ (J10 cerrado). Total 15.200 runs · **0 FP** |
| Equivalentes (`equivalentes-r9.js`, N=200) | 78 casos: 39 históricos EQUIV + 8 del claim R8 + 31 propios | **67 OK 200/200** · **11 FN 0/200** ✘ (10 efectivos + 1 expectativa inválida del árbitro) · Total 15.600 runs |
| Ataques estructurales (`ataques-estructurales-r9.js`, N=200) | 71 casos: S_UNIV 20 (N10), S_FALLBACK 10 (N11), S_ATOM 14, S_FRAC 9, S_MISC 18 (N13) | **FP=0** ✔ (U1–U20, F1–F10, M16–M18 todos en verde) · FN=11 (misma clase N12r; P7/P9 regresiones) · Total 14.200 runs |
| Ataques nuevos (`ataques-nuevos-r9.js`, N=200) | 74 casos: D_NULL 20, D_SKEL 14, D_TRUE 11, D_POW 12, D_N16R 12, D_COMA 5 | **FP=9** ✘ (N16r: L8 + R1–R6, R8–R9) · FN=11 ✘ (T1–T10, C5) · Total 14.800 runs |
| Gigantes + DoS (`giant-r9.js`, `dos-uno-r9.js`) | overflow, idénticas, coste polinomial | N14 cerrado para idénticas (0 ms) · **N15 abierto** (3 casos con timeout 60 s) · N14r errático en gigantes |
| Bordes (`bordes-r9.js`, N=200) | 9 casos: N13r, N14r, N16r matriz, F4 | FP=3 (N16r) · FN=3 (N13r, N14r) · 3 OK |
| sympy (`sympy-r9.py`, sympy 1.11) | 10 ejercicios: T1-N6, T1-M1, T1-M2 mod/arg, T1-M3, T1-M4, T2-N2, T2-M2, T4-N3, T5-E3, X3-10, T1-E4 | **12/12 OK** — los `expected` del curso siguen bien calculados |
| `node tests/grader.test.js` | suite del equipo | **209/209 PASAN** ✔ |

**Detalle de los 10 FN efectivos de los 78** (`equivalentes-r9-math.log`):

| Caso | Identidad (certificada sympy) | ¿R8? | Origen |
|---|---|---|---|
| NEW-T1 | `√(4x) ≡ 2√x` (4>0) | FN en R8 | persistente N12 |
| NEW-T2 | `log(4x) ≡ log4+log x` (4>0) | FN en R8 | persistente N12 |
| NEW-T3 | `log(√x) ≡ (log x)/2` | FN en R8 | persistente N12 |
| NEW-T4 | `√(9x) ≡ 3√x` (9>0) | FN en R8 | persistente N12 |
| NEW-F1 | `min(x,y) ≡ min(y,x)` | FN en R8 | persistente N12 |
| NEW-F2 | `max(x,y,z) ≡ max(z,y,x)` | FN en R8 | persistente N12 |
| NEW-P5 | `(√x)^4 ≡ x²` | FN en R8 | persistente N12 |
| NEW-P1 | `x^(3/2) ≡ x·√x` | **OK 200/200 en R8** | **REGRESIÓN del fix N11** |
| NEW-P2 | `x^(2/3) ≡ (x^(1/3))²` | **OK 200/200 en R8** | **REGRESIÓN del fix N11** |
| NEW-P3 | `x^(-1/2) ≡ 1/√x` | **OK 200/200 en R8** | **REGRESIÓN del fix N11** |
| ~~NEW-F4~~ | `x!` vs `fact(x)` | FN en R8 | **Reclasificado: expectativa inválida del árbitro** — `fact(x)` no es notación escribible (tokeniza `f·a·c·t(x)`, control M2 lo admite como RECHAZAR). No es FN del grader |

Los 39 históricos y los 8 del claim R8 (incluidos los 4 que R8 rompió: HIST-V1 `exp(log x)`, V3 `conj(xy)`, V8 `cos²+sin²`, V9 `cosh²−sinh²`) están **todos en 200/200** ✔. Balance del fix N12: **15 de 23 FN de R8 cerrados, 8 persistentes crudos (7 efectivos tras reexaminar NEW-F4), 3 regresiones nuevas**.

---

## 6. N12r — MAYOR · identidades verdaderas certificadas rechazadas

**Mecanismo (sin cambios respecto a N12).** `toRationalPoly` trata cada `fn` y cada potencia no entera como **variable algebraica independiente**. Cuando `structurallyEqual` devuelve `false` (no `null`), `equivalentStrings` corta **sin verificación numérica** (`grader.js:889`). Cualquier identidad que relate dos formas de átomo distinto se rechaza de forma determinista. `rewriteTrueIdentities` (`grader.js:589-653`) solo cubre su lista finita.

**Paso 2 — identidades nuevas, todas certificadas con sympy (15 por `simplify` directo + 3 con descomposición `z=a+bi`, `sympy-identidades-r9.py` → 18/18) y todas rechazadas 0/200** (`ataques-nuevos-r9-math.log` T1–T10):

| Identidad verdadera | Resultado | Relevancia para el curso |
|---|---|---|
| `tan(x) ≡ sin(x)/cos(x)` (y `sen/cos ≡ tg`) | 0/200 | El propio motor define `cTan = cDiv(cSin, cCos)` (`grader.js:74-76`); `tg(π/4)` está en la batería histórica (HIST-V12) |
| `|x|² ≡ x·conj(x)` (ambas direcciones) | 0/200 | Tema 1 (complejos): identidad nuclear de módulo/conjugado |
| `conj(x−y) ≡ conj(x)−conj(y)` | 0/200 | el homomorfismo de `conj` solo cubre `+` y `*` (`grader.js:628`) |
| `conj(−x) ≡ −conj(x)` | 0/200 | ídem, falta `neg` |
| `conj(x)+x ≡ 2·re(x)` | 0/200 | Tema 1 |
| `|x·y| ≡ |x|·|y|` | 0/200 | módulo multiplicativo |
| `conj(x²) ≡ conj(x)²` | 0/200 | conjugado de potencias |
| `im(x) ≡ (x−conj(x))/(2i)` | 0/200 | Tema 1 |

Además, en `ataques-estructurales-r9` y `bordes-r9` quedan rechazadas `x^(2y/y) ≡ x²` (P7, verdadera para `y≠0`), `min(2,3)+0,5 ≡ 3.5` (N13r) y las gigantes `x^100000 ≡ x^99999·x`, `(x+y)^1024 ≡ ((x+y)^512)^2` (N14r, errático 20/200).

**Impacto.** El alumno que responde `sin(x)/cos(x)` donde se espera `tan(x)`, o `|x|²` donde se espera `x·conj(x)`, es rechazado sin recurso. **Mitigante honesto:** ninguna respuesta esperada del banco de preguntas actual (`assets/data/*.js`) está escrita en las formas afectadas (dominan constantes numéricas tipo `sqrt(3)/2` y el simbólico `4-s-t`), de modo que el impacto sobre los ejercicios de hoy es **bajo**; la gravedad MAYOR se mantiene por (a) el incumplimiento del gate R9.1, (b) las 3 regresiones introducidas por este mismo round, (c) que las identidades pertenecen al propio temario (complejos/trigonometría/radicales) y (d) ser el mismo mecanismo N12 ya clasificado MAYOR.

---

## 7. N16r — MENOR · familia FP grindable intacta para \|k\|>64

**Mecanismo.** `toRationalPoly` devuelve `null` para \|ev\|>64 (`grader.js:792`), pero `atomSkeleton` **no** marca las potencias enteras como átomos (const-fold de `-(n)`, `grader.js:724-735`) → esqueletos vacíos coinciden → se muestrea. La caja (re∈[−4.57,4.57], im∈[−9.21,9.21]) tiene \|z\|<1 solo ~2 % por punto; con las 5 sondas fijas (todas \|z\|>1) y ~16 aleatorios, casi todos los runs caen donde \|x\|^(-k) es despreciable y `nearlyEqual` (`grader.js:422-427`, escala `max(1,|a|,|b|)`) acepta ≡0 o ≡E.

**Medidas (200 runs/caso; reproducción mínima en `repro-n16r-r9-math.log`):**

| Payload | Esperado | R8 | R9 | |
|---|---|---|---|---|
| `5+x^(-300)` | `5` | 173/200 | **173/200** | sin cambio |
| `x^(-300)` | `0` | 166/200 | **175/200** | sin cambio |
| `5+x^(-65)` | `5` | — | **162/200** | |
| `x^(-65)` | `0` | — | **159/200** | |
| `4-s-t+x^(-300)` (T4-N3 real) | `4-s-t` | 173/200 | **170/200** | sin cambio |
| `(x+y)^(-300)` | `0` | 148/200 | **156/200** | sin cambio |
| `i+x^(-300);-i` (exprset T4-M5) | T4-M5 | — | **168/200** | |
| T5-N5 (matriz) celdas `+x^(-300)` | T5-N5 | — | **117/200** | |
| `5+x^(-65)` en celda matriz 1×1 | `5` | — | **166/200** | |
| `x^(-300)+0*y` vs `0` | `0` | — | **176/200** | |
| **`x^(-65)`** | **`x^(-64)`** | — | **158/200** | **respuesta incorrecta aceptada** (L8) |
| `5+x^(-2000)` | `5` | — | 0/200 | el overflow lo salva *por accidente*, no por diseño |
| `x^(-20)` vs `0` · `5+x^(-20)` vs `5` (controles \|k\|≤64) | `0`/`5` | 89/200 | **0/200** ✔ | vía estructural |
| `x^(-300)` vs `5` (control no-universal) | `5` | 0/200 | **0/200** ✔ | |

Es grindable con ~1,2 intentos de media (86 % de éxito al primero) y sirve para **cualquier** ejercicio expr/matrix/exprset: respuesta `E+x^(-k)` con E correcto, o respuestas basura tipo `x^(-300)` donde se espera `0`. La cláusula del claim «potencias grandes → idénticas por fast-path; **distintas → rechazo**» es verdadera solo para exponentes **positivos**; para negativos L8 la falsa de forma directa. Corrección: (a) marcar también las potencias enteras con \|k\|>64 como átomos en `atomSkeleton` (así `5+x^(-300)` no comparte esqueleto con `5` y se rechaza sin muestreo), o aceptarlas en `toRationalPoly` con aritmética racional; (b) como red de seguridad, rechazar en el fallback numérico las potencias negativas enteras frente a `0`/constantes.

---

## 8. N15r/N14r/N13r — MENORES

- **N15r (DoS).** El tope \|k\|≤64 no limita el nº de monomios. Medido (`dos-r9-math.log`, timeout 60 s por caso): `(x+y+z)^64` vs `(x+y+z)^63·(x+y+z)` → 7,6 s; vs `(x²+y²+z²+2xy+2xz+2yz)^32` → 13,7 s; `((x+y+z)^64+x)^64`, `(x+y+z+w)^64`, `(a+b+c+d+e)^64` → **timeout (pestaña congelada)**. El caso `(x+y+z)^32` vs `((x+y+z)^16)^2` acepta en 0,9 s (verde). Corrección: límite de nº de monomios/operaciones con error «expresión demasiado grande» (la recomendación R8 sigue en pie).
- **N14r.** Idénticas → fast-path (0 ms) ✔; pero formas gigantes **semánticamente iguales** con exponentes >64 caen al fallback numérico, que desborda a `Infinity` y exige `compared>=3`: `(x+y)^1024` vs `((x+y)^512)^2` → 20/200 errático; `x^100000` vs `x^99999·x` → 0/200 (FN). Solo entradas gigantes que el curso no pide.
- **N13r.** `min(2,3)` / `max(1,2)` ya parsean bien (M16–M18 en verde), pero la guarda `!/\b(min|max)\s*\(/i` (`grader.js:153`) desactiva la coma decimal en **toda** la cadena: `min(2,3)+0,5` (que debería ser 3.5) no parsea → 0/200. Corrección: aplicar la coma decimal solo fuera de listas de argumentos.

---

## 9. Baterías, tests del equipo y huecos restantes

`node tests/grader.test.js` → **209/209** ✔ (incluye regresiones `216-224` para N10/N11/N16-|k|≤64). sympy → **12/12** ✔.

**Huecos de la suite que permiten seguir pasando 209/209 con N12r/N16r/N15r abiertos:**
- No hay tests de `tan=sin/cos`, `|x|²=x·conj(x)`, `conj(x−y)`, `min(x,y)` vs `min(y,x)`, `√(4x)=2√x`, `x^(3/2)=x·√x` (la clase N12r).
- `tests/grader.test.js:224` cubre `x^(-20)` pero **no** `x^(-300)` ni `x^(-65)` vs `x^(-64)` (la clase N16r).
- No hay test de coste/DoS multivariable.

---

## 10. Recomendaciones (priorizadas)

1. **N12r (MAYOR):** implementar la recomendación R8(d) que quedó fuera: si `structurallyEqual` devuelve `false` y **ambas** expresiones se reducen a átomos opacos (solo `fn`/potencias no enteras con la misma cardinalidad o no), contrastar numéricamente antes de rechazar; o ampliar `rewriteTrueIdentities` con `tan(u)=sin(u)/cos(u)`, `|u|²=u·conj(u)`, `conj` sobre `−`/`/`/`neg`/`^`, `re(u)=(u+conj u)/2`, `im(u)=(u−conj u)/(2i)`, `√(k·u)=√k·√u` (k>0), `log(k·u)=log k+log u` (k>0), `log(√u)=(log u)/2`, `u^(p/q)` vs radicales, `(√u)^(2k)=u^k`, y ordenar argumentos de `min`/`max` en `serializeAST`. Tests: T1–T10 de `ataques-nuevos-r9.js` + NEW-T1–T4/F1/F2/P1–P3/P5.
2. **N16r (MENOR):** que `atomSkeleton` registre las potencias enteras con \|k\|>64 como átomos (o aceptarlas estructuralmente con BigInt/racional), y rechazar potencias negativas enteras frente a `0` en el fallback. Tests: L8, R1–R9.
3. **N15r (MENOR):** límite de nº de monomios/u operaciones con error explícito (mata N14r de paso: con tope, las gigantes dan error determinista en vez de errático).
4. **N13r (MENOR):** coma decimal solo fuera de listas de argumentos de `min`/`max`.
5. **F4 (NOTA):** reconocer `fact` como nombre de función o documentar que factorial solo se escribe `x!`.

---

## 11. Veredicto

**NO APTO.**

El equipo ha cerrado **ambos CRÍTICOS de la R8** de forma sólida y verificable: N10 da 0/200 en 40 variantes de denominador nulo (incluidas las elaboradas del paso 2) y N11 da 0/200 en la familia N9r desplazada con forzado de fallback; J10, los históricos V1/V3/V8/V9 y los 10 casos de orden-en-átomos pasan de FN/FP a verde. La batería hostil R1–R7 completa: **0 FP**.

Pero el protocolo R9 exige «todo en verde» y **no lo está**:

1. **Gate R9.1 incumplido:** 10 falsos negativos efectivos en los 78 equivalentes (7 persistentes de N12 + 3 **regresiones creadas por el fix de N11**: `x^(3/2)≡x·√x`, `x^(2/3)≡(x^(1/3))²`, `x^(-1/2)≡1/√x`, que la R8 aceptaba 200/200).
2. **Gate R9.2 incumplido:** 9 FP grindables en los ataques nuevos (N16r, 58–88 % de éxito por intento, con `5+x^(-300)` vs `5` **idéntico a la R8** y `x^(-65)` ≡ `x^(-64)` aceptando respuestas incorrectas) — la cláusula del claim «potencias grandes distintas → rechazo» es falsa para exponentes negativos.
3. **1 MAYOR (N12r)** por el criterio vigente desde R6 («APTO exige 0 CRÍTICOS y 0 MAYORES»): 21 casos de identidades verdaderas (19 identidades distintas) certificadas con sympy rechazadas de forma determinista, entre ellas identidades del propio temario (`tan=sin/cos`, `|x|²=x·conj(x)`, `im`/`re`/`conj`). Mitigante documentado: el banco de preguntas actual no usa esas formas, así que el impacto sobre alumnos de hoy es bajo.
4. **N15r abierto:** 3 vectores de DoS congelan la pestaña >60 s pese al tope \|k\|≤64.

Clasificación final: **0 CRÍTICOS · 1 MAYOR (N12r) · 3 MENORES (N16r, N15r, N13r) + 1 nota (F4)**.

Conforme al protocolo R9, todo hallazgo de este informe está reproducido con script + log + JSON en `verify/arbitro/ronda9/` (baterías: ≈62.000 comprobaciones; sympy ejercicios: 12/12; sympy identidades: 18/18; tests del equipo: 209/209) y **este informe no contiene ningún falso positivo propio**: cada FP/FN declarado lleva su reproducción a 200 runs, sus controles (U5/U15, F9/F10, N11, N12, R12, L6/L7/L11, C2–C4, T11) en verde, y se corrige explícitamente la única expectativa inválida detectada (NEW-F4, del propio árbitro).
