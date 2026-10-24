# Auditoría matemática — Ronda 8 · VEREDICTO FINAL (ÁRbitro adversarial independiente)

**Curso:** Fundamentos Algebraicos para la IA — `CURSO MIMO/`
**Objeto:** `assets/js/grader.js` con la nueva capa de chequeo estructural (`toRationalPoly` + `structurallyEqual`, `grader.js:499-780`)
**Alcance:** protocolo R8 (batería hostil R1–R7 ≥200 runs/caso · formas equivalentes ≥39 casos ≥100 runs · ataques nuevos a la capa estructural · recálculo sympy de 10 ejercicios · `node tests/grader.test.js`)
**Evidencia:** `verify/arbitro/ronda8/` (scripts + `.json` + `.log` de cada batería)
**Fecha:** 2026-10-14

---

## 1. Resumen ejecutivo

La sustitución del muestreo numérico por chequeo estructural es una mejora **real y medible**: toda la familia N9r (simple y desplazada) y la clase `log(exp)` se rechazan ya de forma **determinista** en su forma cooperativa (76−1 casos hostiles a 0/200), y el bug `polyScale` está efectivamente cerrado. **Pero la nueva capa introduce a su vez dos falsos positivos CRÍTICOS y una clase MAYOR de falsos negativos:**

| # | Hallazgo | Gravedad | Efecto | Reproducción |
|---|----------|----------|--------|--------------|
| **N10** | Identidad universal `0/0` vía polinomio vacío: `(x-x)/(x-x)` aprueba **cualquier** respuesta | **CRÍTICO** | FP determinista 200/200 en expr/matrix/vector/exprset/multi | `ataques-estructurales-r8.js` U1–U20 |
| **N11** | Forzar el fallback numérico con un sumando cancelado no convertible (`+x^(3/2)-x^(3/2)`) reabre **N9r de forma determinista** | **CRÍTICO** | FP 200/200 con exploits desplazados sobre specs reales | `ataques-estructurales-r8.js` F1–F8 |
| **N12** | La capa estructural rechaza identidades VERDADERAS y la misma expresión reordenada dentro de átomos | **MAYOR** | 23 FN deterministas / 78 casos equivalentes (incl. 4 de los 39 históricos) | `equivalentes-r8.js` |
| **N13** | La coma decimal se traga la coma de argumentos de `min`/`max` (`min(2,3)` parsea como `min(2.3)`) | MENOR | 2 FP + 1 FN de parser | `ataques-estructurales-r8.js` M16–M18 |
| **N14** | Overflow de coeficientes binomiales con `(x+y)^n`, n≥1024: entradas idénticas rechazadas | MENOR | FN errático en entradas gigantes | `giant-r8.js` |
| **N15** | DoS: `(x+y+z)^n` cuartiza en n (n=100 → 18,6 s; n=3000 → cuelga el proceso) | MENOR | Pestaña congelada | `giant-r8.js` + timeout externo |
| **N16** | Exponentes con signo unario (`x^(-n)`) eluden la capa estructural (su rama `e.v<0` es código muerto) y con n≥20 la tolerancia numérica los acepta como ≡0/≡E | MENOR | FP *grindable* 173/200 sobre specs reales | §6, `ataques` + medidas dedicadas |

**Veredicto: NO APTO.** El criterio R6/R7 («APTO exige 0 CRÍTICOS y 0 MAYORES») queda incumplido con **2 CRÍTICOS y 1 MAYOR**. El protocolo R8.1 («0 falsos positivos» en la batería hostil) falla en el caso histórico J10 y en toda la familia N10/N11; el R8.2 («0 falsos negativos» en ≥39 formas equivalentes) falla en 23 casos, 4 de ellos de la batería histórica del propio equipo.

---

## 2. Verificación de las afirmaciones del equipo

| Afirmación R8 | Veredicto | Evidencia |
|---|---|---|
| `log(x)+log(y)` vs `log(x*y)`, `2log(x+3.5)-log((x+3.5)^2)`, `sqrt(x)sqrt(y)` vs `sqrt(xy)`, exploit desplazado `E+log(x+5)+log(y+5)-log((x+5)(y+5))` se rechazan de forma DETERMINISTA | **VERIFICADA en su alcance** (formas cooperativas) | M0b, M1, M7, M5 → **0/200** cada uno (`bateria-hostil-r8.js`); adicionalmente M0–M13 (15 casos N9r simple/desplazada) y L1–L12 → 0/200. **Pero el alcance es incompleto**: ver N11 — basta un sumando cancelado no convertible para reabrir la vía numérica, y ahí el exploit desplazado vuelve a aceptarse 200/200 |
| Formas algebraicamente equivalentes se aceptan por normalización estructural | **PARCIAL / FALSA en dos cláusulas** | Desarrollos/factorizaciones/`x*x^(-1)`/`(x^2-1)/(x-1)`/`senx`=`sin(x)`/fracción-decimal en coeficientes: **OK 100/100** (R8-C1…C8, B*, D*, V2/V4–V7/V10–V19). **«Orden de términos»**: cierto solo FUERA de átomos — `log(x+y)` vs `log(y+x)` rechaza 200/200 (N12b). **«Fracciones/decimales»**: cierto solo en coeficientes — `log(x/2)` vs `log(0.5x)` rechaza 200/200 (N12b). Además la capa estructural rompe 4 casos de la batería EQUIV histórica (V1, V3, V8, V9) |
| Bug `polyScale` en restas cerrado | **VERIFICADA** | Restas/restas cruzadas correctas: `(x^2-1)/(x-1)`≡`x+1`, `x^3-x`≡`x(x-1)(x+1)`, `4-(s+t)`≡`4-s-t` → 100/100 |
| 190/190 tests propios | **VERIFICADA** (`node tests/grader.test.js` → *Pasaron: 190 · Fallaron: 0*) | Pero la suite tiene exactamente los huecos que N10/N11 explotan (§7) |

---

## 3. N10 — CRÍTICO · identidad universal `0/0` vía la capa estructural

**Qué ocurre.** `toRationalPoly` convierte `(x-x)/(x-x)` en `{n: ∅, d: ∅}` (Map vacío = polinomio cero): el numerador `x-x` cancela sus términos en `polySet` (`grader.js:537-538`) y el cociente `mulRat` (`grader.js:729-734`) propaga el cero. En `structurallyEqual` (`grader.js:751-763`) la diferencia cruzada de dos polinomios vacíos es el polinomio vacío, y `polyIsZero(∅)` devuelve `true` **sin evaluar nada** (`grader.js:570-577`). Resultado: `structurallyEqual` → `true` para **cualquier par** donde una parte sea `0/0`. El camino numérico (que habría rechazado: todo punto da NaN y `compared >= 3` falla) nunca llega a ejecutarse, porque `equivalentStrings` hace short-circuit con el resultado estructural (`grader.js:773-774`).

**Escala (200 runs/caso, todos 200/200 = determinista):**

| Payload (respuesta del alumno) | Esperado | Resultado |
|---|---|---|
| `(x-x)/(x-x)` | `5`, `log(x*y)`, `4-s-t` (T4-N3 real), `pi`, `1`, `7` | **ACEPTA** |
| `0/(x-x)`, `1/(x-x)-1/(x-x)`, `5+0*(x-x)/(x-x)` (¡el J10 de R2!), `0*x/(x-x)`, `(x-x)^2/(x-x)`, `((x+1)(x-x))/((x+2)(x-x))`, `(x-x)log(x)/(x-x)`, `(exp(x)-exp(x))/(x-x)`, `(x+y-x-y)/(x-x)`, `(x-x)/(x-x+x-x)`, `1*(x-x)/(x-x)` | cualquiera | **ACEPTA** |
| `(x-x)/(x-x)` en **todas** las celdas de T5-N5 (matriz) | matriz del ejercicio | **ACEPTA** |
| `(x-x)/(x-x);(x-x)/(x-x)` (exprset T4-M5) | `i;-i` | **ACEPTA** |
| vector 2×1 con `(x-x)/(x-x)` | `1;2` | **ACEPTA** |
| multi T1-M2 con campos `(x-x)/(x-x)` | mod/arg | rechaza (control: tipo `number` no evalúa variables) |
| `(x-y)/(x-y)` | `5` | rechaza (control: `x−y` no es el polinomio cero; solo se autodestruye lo que cancela literalmente) |

**Impacto.** Cualquier ejercicio de tipo `expr`, `matrix`, `vector`, `exprset` o `multi` con campos `expr` se aprueba con una respuesta basura de 7 tokens, sin conocer el esperado, sin grind y de forma determinista. Es una regresión total del hallazgo C1 de la R1 en forma peor: entonces `1/(x-x)` se aceptaba por un bug del bucle de muestreo; ahora `(x-x)/(x-x)` se acepta **por diseño del chequeo estructural**, que declara `0/0 ≡ todo` antes de cualquier evaluación. El caso J10 (`5+0*(x-x)/(x-x)`), que la R2 cerró y las baterías R5/R6 mantenían en 0/250, está **reabierto a 200/200**.

**Corrección sugerida.** En `toRationalPoly`/`structurallyEqual`: (a) rechazar (→ `null`, i.e. fallback numérico) todo racional cuyo denominador sea el polinomio cero o cuyo numerador y denominador sean ambos cero; (b) en `polyIsZero`, no aceptar el Map vacío cuando proviene de una forma `0/0` (distinguir «polinomio cero legítimo» de «sin términos por cancelación de denominador»); (c) como defensa en profundidad, no hacer short-circuit con `structural === true` si alguna subexpresión tuvo denominador nulo. Regresión en `tests/grader.test.js`: `(x-x)/(x-x)`, `0/(x-x)`, `1/(x-x)-1/(x-x)`, `5+0*(x-x)/(x-x)` deben rechazar contra cualquier esperado.

---

## 4. N11 — CRÍTICO · N9r reabierto al forzar el fallback numérico

**Qué ocurre.** `toRationalPoly` devuelve `null` ante exponentes no enteros o simbólicos (`grader.js:683`: `if (e.k !== "num" || !Number.isInteger(e.v)) return null`), y `structurallyEqual` devuelve `null` si **cualquiera** de las dos partes no convierte (`grader.js:748`) → cae al muestreo numérico (`equivalentExprs`, `grader.js:433-497`). El atacante controla la respuesta: basta añadir un par cancelado no convertible (`+x^(3/2)-x^(3/2)`, `+x^z-x^z`, `0*x^(3/2)`, `+x^(0.3)-x^(0.3)`) para **desactivar el chequeo estructural completo** y volver al mecanismo de la R7. Con los argumentos desplazados `u=x+5`, `v=y+5` la falsa regla de producto se cumple en el 100 % de la caja de muestreo (para `x.re ≥ −4.57` se tiene `arg u + arg v ∈ (−π,π)` siempre) → falso positivo **determinista**.

**Escala (200 runs/caso, todos 200/200):**

| Payload | Spec | Resultado |
|---|---|---|
| `5+log(x+5)+log(y+5)-log((x+5)(y+5))+x^(3/2)-x^(3/2)` | `5` | **ACEPTA** 200/200 |
| idem `+x^z-x^z` (exponente simbólico) | `5` | **ACEPTA** 200/200 |
| idem `0*x^(3/2)` | `5` | **ACEPTA** 200/200 |
| idem `+x^(0.3)-x^(0.3)` | `5` | **ACEPTA** 200/200 |
| `4-s-t+log(s+5)+log(t+5)-log((s+5)(t+5))+s^(3/2)-s^(3/2)` | T4-N3 real | **ACEPTA** 200/200 |
| `i+log(s+5)+log(t+5)-log((s+5)(t+5))+s^z-s^z;-i` | T4-M5 real (exprset) | **ACEPTA** 200/200 |
| `5+sqrt((x+5)(y+5))-sqrt(x+5)sqrt(y+5)+x^(3/2)-x^(3/2)` | `5` | **ACEPTA** 200/200 |
| `5+log(exp((x+5)/20))-(x+5)/20+x^(3/2)-x^(3/2)` (clase N9 escalada, residual R7 M12) | `5` | **ACEPTA** 200/200 |
| `5+log(exp(x))-x+x^y-x^y` (control) | `5` | rechaza 0/200 — la clase `log(exp)` simple cierra incluso vía fallback |
| `x-y+x^(1/3)-x^(1/3)` (control) | `0` | rechaza 0/200 — `x−y≢0` lo mata el muestreo |

**Impacto.** El claim «la sustitución del muestreo por chequeo estructural cierra N9r» es cierto **solo frente a un atacante que no añade constructos no convertibles**. El exploit universal de la R7 (`esperado+log(u)+log(v)-log(u·v)` con `u,v` desplazados) sigue siendo un mecanismo de aprobación automática de cualquier ejercicio expr/matrix/exprset, ahora con un coste de 2 tokens extra y una tasa de éxito 200/200 (frente al 100 % «fuera de caja» de la R7). Es exactamente el hallazgo N9r que esta ronda debía cerrar.

**Corrección sugerida.** (a) Las identidades de rama deben decidirse estructuralmente **incluso cuando la expresión no sea convertible en su conjunto**: tratar `log`/`sqrt`/`arg` de productos como identidad falsa con independencia de que existan exponentes fraccionarios en otras ramas del AST (p. ej. normalizar/rechazar antes de caer al fallback, o hacer el chequeo de ramas por separado del polinomio); (b) alternativamente, muestrear también **fuera** de la caja actual (puntos con `arg u + arg v ∉ (−π,π]`) o con valores independientes por variable en los PROBES (hoy `PROBES` asigna el **mismo** valor a todas las variables, `grader.js:476-477`, lo que también esconde reglas de producto); (c) regresión en tests: los 4 payloads F1–F4 y F5–F8 sobre specs reales deben rechazar.

---

## 5. N12 — MAYOR · falsos negativos deterministas de la capa estructural

La capa trata cada `fn` como átomo opaco por su serialización literal (`grader.js:693-698`, `serializeAST` 620-640) y devuelve `false` — **sin fallback numérico** — cuando los átomos difieren. Consecuencias (200 runs/caso en `ataques-estructurales-r8.js`; 100 runs en `equivalentes-r8.js`):

**5a. Identidades trascendentes VERDADERAS rechazadas (8 casos propios, 0/200; +1 del cruce §7):**

| Identidad (verdadera en ℂ) | Resultado | ¿En batería histórica? |
|---|---|---|
| `exp(log x)` ≡ `x` (en ℂ∖{0}) | rechaza | **SÍ — HIST-V1** (EQUIV R5/R6) |
| `conj(x·y)` ≡ `conj(x)·conj(y)` | rechaza | **SÍ — HIST-V3** |
| `cos²x + sin²x` ≡ `1` | rechaza | **SÍ — HIST-V8** |
| `cosh²x − sinh²x` ≡ `1` | rechaza | **SÍ — HIST-V9** |
| `√(4x)` ≡ `2√x` (4>0 ⇒ arg invariante) | rechaza | nueva |
| `log(4x)` ≡ `log 4 + log x` (4>0) | rechaza | nueva |
| `log(√x)` ≡ `(log x)/2` | rechaza | nueva |
| `(√x)^4` ≡ `x²` | rechaza | nueva |
| `tan(x)` ≡ `sin(x)/cos(x)` (ambas direcciones) | rechaza | verificado a raíz del cruce §7 (mismo mecanismo) |

**Regresión directa:** 4 de los 39 casos EQUIV históricos que el protocolo R8.2 exige aceptar (`n9-estabilidad.js`, batería R5/R6) ahora fallan de forma determinista. El alumno que responde `cos(x)^2+sin(x)^2` a un ejercicio cuya respuesta es `1` — respuesta matemáticamente correcta e idéntica — es rechazado sin recurso.

**5b. La MISMA expresión con orden/escritura distinta dentro del átomo (10 casos, 0/200):**
`log(x+y)` vs `log(y+x)` · `log(2x)` vs `log(x·2)` · `sin(x+y)` vs `sin(y+x)` · `log(x/2)` vs `log(0.5x)` · `exp(x+y)` vs `exp(y+x)` · `sin(2x)` vs `sin(2·x)` · `log(x(y+z))` vs `log((y+z)x)` · `√(x+y)` vs `√(y+x)` · `abs(xy)` vs `abs(yx)` · `log(0.1x)` vs `log(x/10)`.
Contradicen literalmente el claim «orden de términos […] y fracciones/decimales se aceptan por normalización estructural»: la normalización **no entra en los argumentos de las funciones**.

**5c. `min`/`max`/potencias de `sqrt` (3 casos, 0/200):** `min(x,y)` vs `min(y,x)`, `max(x,y,z)` vs `max(z,y,x)` (átomos distintos → `false` sin fallback), y `(√x)^4` vs `x²` (solo se reescriben `(√u)²` y `u^(1/2)`, `grader.js:586-612`).

**Corrección sugerida.** (a) `serializeAST` debe normalizar el argumento de las funciones conmutativas/canónicas (orden lexicográfico de sumandos/factores, formas `k·x` vs `x/k` con `k` real positivo); (b) ampliar `rewriteTrueIdentities` a `(√u)^(2k)` → `u^k` y `k>0` fuera de raíces/logaritmos de productos por reales positivos; (c) `min`/`max`: serializar argumentos ordenados; (d) como red de seguridad, si el chequeo estructural devuelve `false` pero **ambas** expresiones son opacas (solo átomos), contrastar numéricamente antes de rechazar (hoy se rechaza sin verificación). Regresión en tests: los 8 casos de 5a y los 10 de 5b deben aceptar.

---

## 6. N13–N16 — MENORES

**N13 · coma decimal vs argumentos (parser).** `normalizeInput` aplica `(\d),(\d) → $1.$2` (`grader.js:151-153`) **antes** de tokenizar, así que `min(2,3)` se parsea como `min(2.3)` = 2,3. Evidencia (200/200): `min(2,3)` vs `2` → rechaza (FN); `min(2,3)` vs `2.3` → **acepta** (FP); `max(1,2)` vs `1.2` → **acepta** (FP). Relacionado: `fact(x)` no es escribible por el usuario (tokeniza como `f·a·c·t(x)`) mientras `x!` se serializa internamente como `fact(x)` — inconsistencia de ida y vuelta (sin FP: `fact(5)` ni siquiera evalúa). Corrección: aplicar la coma decimal solo fuera de listas de argumentos, o exiger espacios/`0,` inicial.

**N14 · overflow de coeficientes (`giant-r8.js`).** `(x+y)^n` vs **sí misma**: n=100…1000 → acepta (24 ms–1,4 s); **n=1024, 1100, 2000 → rechaza 0/200** (FN determinista); n=1500 → errático 4/200. Causa: los coeficientes binomiales desbordan `double` al cuadrar (`polyMul` → `polySet` lanza «coeficiente no finito», `grader.js:532-535`) y el fallback numérico desborda a `Infinity` → `compared < 3`. Controles: `(x+y)^1024` vs `0`/`+1`/`*2` → rechaza (sin FP observado). Alcance: solo entradas gigantes que el curso no pide. Corrección: aritmética racional/BigInt para coeficientes o tope de grado con error explícito.

**N15 · DoS por entradas multivariables.** `(x+y+z)^n`: n=30 → 0,13 s; n=60 → 1,6 s; n=100 → **18,6 s**; n=400 → **>240 s**; n=3000 → **timeout 25 s (exit 124)**. `polyPowInt`/`polyMul` son O(m²) en monomios (m ≈ n²/2 para 3 variables). Un alumno congela la pestaña al pulsar «Comprobar». Corrección: límite de nº de monomios/operaciones con error «expresión demasiado grande».

**N16 · exponentes con signo unario eluden la capa estructural (FP grindable por tolerancia).** El parser produce `{k:'neg', x:{k:'num',v:n}}` para `^(-n)` (incluso `x^-2`), pero `toRationalPoly` exige `e.k === 'num'` (`grader.js:683`) → **devuelve `null` → fallback numérico**. Consecuencia doble: (a) la rama «exponente entero negativo: recíproco de la potencia» (`grader.js:687-688`) es **código muerto** — ningún input de usuario llega con `e.v<0` numérico (los pocos casos que «pasan» como `x^(-2)`≡`1/(x^2)` lo hacen por el camino numérico, no por la capa estructural); (b) como el muestreo vive en `|x| ≥ 0.37`, para n≥20 se tiene `|x|^(-n) ≤ 1e-6` en casi toda la caja y la tolerancia `nearlyEqual` acepta la expresión como ≡0 o como ≡E. Medidas (200 runs): `x^(-20)` vs `0` → 89/200; `x^(-50)` vs `0` → 136/200; `x^(-300)` vs `0` → 166/200; **`5+x^(-300)` vs `5` → 173/200; `4-s-t+x^(-300)` vs `4-s-t` (T4-N3 real) → 173/200**; `(x+y)^(-300)` vs `0` → 148/200. Es grindable («Comprobar» puede reintentarse; ~1,2 intentos de media). Controles: `x^(-300)` vs `5` rechaza (no es universal); n<20 rechaza. Es la misma familia de tolerancia que K1 (`1+1e-9`≡`1`, aceptada por diseño en R1), pero con una función **no acotada** fuera de la caja de muestreo: la justificación «dentro de tolerancia» no se sostiene globalmente. Corrección: aceptar `{k:'neg'}` de entero en `toRationalPoly` (activando la rama muerta) y, de paso, que el fallback numérico exija diferencia relativa también fuera de la región muestreada o rechace potencias negativas enteras frente a 0.

---

## 7. Baterías y tests del equipo

| Batería | Composición | Resultado |
|---|---|---|
| Hostil R1–R7 (`bateria-hostil-r8.js`, N=200) | 76 casos: H_LOGEXP 18 (N9 `log(exp)`), H_FIJO 17 (O1–O5, A1–A10, J8–J10, P30, wrap 9/20 vars), H_BRANCH 12 (L1–L12), H_SHIFT 15 (M0–M13 de la R7, incl. desplazadas), H_NEGEXP 14 (exponentes negativos + átomos compuestos nuevos) | 75 casos **0/200** ✔ · **1 FP: J10 200/200** ✘ (= N10). Total 15.200 runs |
| Equivalentes (`equivalentes-r8.js`, N=100) | 78 casos: 39 históricos EQUIV + 8 del claim R8 + 31 nuevos (identidades verdaderas, orden en átomos, min/max/fact, fraccionarios, alias i/e) | **55 OK 100/100** · **23 FN 0/100** ✘ (4 de la batería histórica). Total 7.800 runs |
| Ataques estructurales (`ataques-estructurales-r8.js`, N=200) | 71 casos: S_UNIV 20 (N10), S_FALLBACK 10 (N11), S_ATOM 14 (N12), S_FRAC 9, S_MISC 18 | **FP=28** (18 N10 + 8 N11 + 2 N13) · **FN=16** (13 N12 + 3 N13) · 27 OK. Total 14.200 runs |
| sympy (`sympy-r8.py`, sympy 1.11) | 10 ejercicios: T1-N6, T1-M1, T1-M2 (mód+arg), T1-M3, T1-M4, T2-N2, T2-M2, T4-N3, T5-E3, X3-10 (12 comprobaciones) | **12/12 OK** — los `expected` del curso están bien calculados |
| Gigantes (`giant-r8.js`) | overflow + DoS | N14, N15 (§6) |
| `node tests/grader.test.js` | suite del equipo | **190/190 PASAN** ✔ |

**Huecos de la suite del equipo (por qué pasa 190/190 con N10/N11 abiertos):**
- `tests/grader.test.js:151` prueba `1/(x-x)` pero **no** `(x-x)/(x-x)` ni `0/(x-x)` (numerador vacío) — justo la frontera donde `polyIsZero(∅)` falla.
- `tests/grader.test.js:206` prueba un «exponente negativo forzado» (`log(exp(x))-x+(x-x)*x^(-1)`) que **no fuerza nada**: `x^(-1)` tiene exponente entero y la expresión convierte estructuralmente (se rechaza por la vía buena). Nadie probó un perturbador con exponente **no entero** (`x^(3/2)`), que es el que desactiva la capa.
- No hay tests de identidades trascendentes verdaderas (`cos²+sin²`, `conj(xy)`, `exp(log x)`) ni de reordenamiento dentro de átomos — por eso N12 no aparece.

**Contraste con la batería paralela** (`verify/arbitro/ronda8/hostil-grader-r8.*`, `smoke-r8.*`, `flujo-r8.*`, `dos-poly-r8.*` — instrumento de otro agente con alcance N6/flujo, corriendo en paralelo en este mismo directorio). Cruce de resultados sobre los solapamientos: **coincide** con esta auditoría en SET-R7 (M1/M5/M7/M9/M10/M11/M12 → 0/10), en E10 (`cos²+sin²` rechazada = mi N12/HIST-V8) y en S11 (`(x+y)^(-300)`≡0 aceptado = mi N16, aquí con tasas). Sus desajustes H18–H23 (specs `multi` sin campos aceptan cualquier respuesta) pertenecen al ámbito spec-side/N6 de ese agente y no se duplican aquí. Su A11 (`1e-7`≡0 en matriz) es una decisión de diseño de tolerancia ya tratada en R1 (K1), no un hallazgo nuevo del contrato.

---

## 8. Recomendaciones (priorizadas)

1. **N10:** rechazar explícitamente las formas `0/0` y denominador nulo en `toRationalPoly`/`structurallyEqual`; nunca declarar equivalencia con polinomios vacíos por cancelación. Tests de regresión: `(x-x)/(x-x)`, `0/(x-x)`, `1/(x-x)-1/(x-x)`, `5+0*(x-x)/(x-x)` contra cualquier esperado.
2. **N11:** la decisión de identidades de rama debe ser independiente de la convertibilidad del resto (chequeo de ramas previo o fallback con sondas de rama **por variable independiente** y fuera de caja). Tests: F1–F8 de `ataques-estructurales-r8.js`.
3. **N12:** normalizar argumentos de átomos conmutativos en `serializeAST`; ampliar `rewriteTrueIdentities`; fallback numérico cuando `structurallyEqual` diera `false` con solo-átomos; tests V1/V3/V8/V9 + A1–A12.
4. **N13:** coma decimal solo fuera de listas de argumentos.
5. **N16:** aceptar `{k:'neg'}` de entero en `toRationalPoly` (activar la rama muerta de exponentes negativos) y rechazar potencias negativas enteras frente a 0 en el fallback numérico.
6. **N14/N15:** tope de grado/nº de monomios con error explícito (mata los dos de una vez).

---

## 9. Veredicto

**NO APTO.**

La capa estructural cumple su promesa principal (N9r simple/desplazada y `log(exp)` → rechazo determinista, 0/200 en 76−1 casos hostiles; `polyScale` cerrado) pero introduce **un falso positivo universal determinista (N10)** — `(x-x)/(x-x)` aprueba cualquier ejercicio expr/matrix/vector/exprset/multi — y **reabre N9r de forma determinista (N11)** con dos tokens de forzado de fallback; ambas vías dan 200/200 sobre specs reales del curso. Además **regresa 4 casos de la batería EQUIV histórica** y rechaza 19 formas equivalentes legítimas más (N12, MAYOR). El criterio vigente desde R6 («APTO exige 0 CRÍTICOS y 0 MAYORES») queda incumplido: **2 CRÍTICOS + 1 MAYOR**.

Conforme al protocolo R8, todo hallazgo de este informe está reproducido con script + log + JSON en `verify/arbitro/ronda8/` (baterías: 37.200 comprobaciones; sympy: 12/12; tests del equipo: 190/190) y **este informe no contiene ningún falso positivo propio**: cada caso clasificado como FP/FN lleva su reproducción a 200 (o 100) runs y testigo numérico de no-equivalencia cuando procede (controles F9/F10, U5/U15, P4/P5, M3/M6/M10 incluidos y en verde).
