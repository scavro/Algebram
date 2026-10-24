# Árbitro R12 · Ronda de cierre sobre la versión ampliada (matemáticas)

**Fecha:** 2026-10-22 · **Motor:** `assets/js/grader.js` (sin cambios en R12)
**Alcance:** las 41 fichas de los temas 4 y 5 de la versión ampliada del
2026-10-21 y ampliada el 2026-10-22 (122 ejercicios) y, por extensión, todo lo
que el banco de esos dos temas hace con el motor.

**Protocolo:** R12 es la ronda que faltaba. Las 11 rondas anteriores se
ejecutaron sobre la versión de 111 ejercicios; la ampliación (9 ejercicios
nuevos + sección de planificación) solo se había verificado con las suites de
contenido, nunca con un ciclo adversarial completo. R12 cierra ese hueco:
prepara el catálogo de ataques, lo ejecuta, dictamina y cierra.

**Certificación previa obligatoria:** cada caso del catálogo lleva su
certificación SymPy, que debe cumplirse *antes* de dar por bueno el veredicto
del motor: `verify/arbitro/ronda12/certificar-r12.py` → **138/138** (0
triviales).

## 0. Nota sobre la independencia del árbitro (transparencia)

El material de ataque (catálogo) y este dictamen los redactó el mismo agente.
No es, por tanto, un arbitraje en el sentido de «un tercero hostil»: es una
**autoauditoría con verificación mecánica**. La mitigación aplicada son las
garantías que hacen reproducible el resultado sin confianza en el criterio
del autor:

1. La especificación de cada caso se toma del **banco real** en tiempo de
   ejecución (`vm.createContext` sobre `assets/data/tema-4.js` y `tema-5.js`),
   no de una copia: el arnés no puede quedar obsoleto respecto del banco.
2. Cada caso lleva su **certificación SymPy** y se comprueba en el acto: si la
   identidad del caso no se cumple, el caso no vale.
3. El motor **no se ha modificado** en R12, de modo que cualquier persona
   puede reproducir el resultado ejecutando los dos guiones y contrastar el
   recuento con este informe.
4. La comparación es contra un **veredicto esperado escrito por el autor**, lo
   que introduce un sesgo real: un caso mal etiquetado como «debía aceptar»
   pasaría inadvertido. El contraargumento es que las 124 certificaciones son
   identities verificadas por SymPy de forma independiente del etiquetado, y
   que el contenido del banco está verificado aparte por
   `verify/crosscheck-expected.py` (179/179 valores).

**Consecuencia práctica:** este informe cierra la salvedad §6.4 del
`INFORME-VERIFICACION.md` (que la ampliación no se había arbitrado), pero
**no** sustituye a una revisión por persona ajena al proyecto. Si el aula
quiere esa garantía, el guion `verify/arbitro/ronda12/ataques-r12.js` está
preparado para que la ejecute quien quiera con `node`.

## 1. Material de la ronda

| Pieza | Qué es | Tamaño |
|---|---|---|
| `docs/auditoria/arbitro-ronda12-catalogo.md` | Catálogo: las 9 fichas nuevas, la superficie de ataque, las 5 familias de riesgo | 510 líneas |
| `verify/arbitro/ronda12/ataques-r12.js` | Arnés: casos de las 9 fichas nuevas (64) + las 2 fichas añadidas el 2026-10-22 (14) | 78 casos |
| `verify/arbitro/ronda12/casos-barrido-r12.js` | Barrido de las 14 fichas restantes + sondas de las familias de riesgo (60) | 60 casos |
| `verify/arbitro/ronda12/certificar-r12.py` | Certificador SymPy de los 138 casos | 138 certificaciones |

**Recuento de la ronda:** 138 casos sobre **25 de las 41 fichas** de los temas
4 y 5 (las 9 nuevas + 14 del barrido + 2 añadidas el 2026-10-22) y **11 sondas
sintéticas** sobre las familias de riesgo.

| Clase | Significado | Casos |
|---|---|---|
| **FN** | identidad verdadera que el motor NO debe rechazar | 45 |
| **FP** | identidad falsa que el motor NO debe aceptar | 85 |
| **TOL** | tolerancia deliberada: el motor DEBE aceptar | 2 |
| **CON** | caso de contrato: la respuesta es válida en matemáticas pero el enunciado fija un representante, luego el rechazo es lo correcto | 6 |
| | **total** | **138** |

## 2. Ejecución

| Comprobación | Resultado |
|---|---|
| `node verify/arbitro/ronda12/ataques-r12.js` | **138/138 con el veredicto esperado** · 0 discrepancias · 0 cuestiones de contrato abiertas |
| `python3 -I verify/arbitro/ronda12/certificar-r12.py` | **138/138** certificaciones se cumplen (0 triviales) |

Los dos casos que en la primera ejecución figuraban como «abiertos» (las dos
caras de H-2) están ya **dictaminados** y reclasificados en el arnés como
casos de contrato (`CON`) con el veredicto que les corresponde: el rechazo es
lo correcto. La ronda no deja ninguna cuestión abierta.

## 3. Dictamen sobre H-2 (asimetría de tolerancia `number` vs celda)

**Cuestión planteada.** La celda de `matrix`/`vector` decide con una
tolerancia **absoluta 1e-8** (`polyIsZero`, `grader.js:628-635`), mientras que
un campo `number` decide con una tolerancia **relativa 1e-6** (`nearlyEqual`,
`grader.js:473`). Consecuencia observable: `0.333333` sirve en un campo
`number` y **no** sirve en una celda de vector; `0.707107` tampoco.

**Dictamen: se mantiene el comportamiento del motor; la asimetría es el
contrato y se documenta. No se toca `grader.js`.**

Fundamento, en cuatro puntos:

1. **La ventana relativa es exactamente lo que se cerró en R10.** El MAYOR-1 de
   R10 fue un falso positivo «`E ≡ E+δ` errático» a magnitudes enormes
   (|E| ~ 1e20), cerrado con la comparación exacta en cuerpos finitos F_p con
   BigInt. Ensanchar la celda con una ventana relativa reabriría, en otra vía,
   la misma herida: cualquier respuesta falsa con residuo relativo por debajo
   del umbral entraría.
2. **La celda ya tiene una decisión exacta.** Para pares algebraicos decide en
   F_p (BigInt, determinista); el 1e-8 es el umbral del **fallback numérico**,
   no una tolerancia de diseño. Ensancharlo no añade rigor: solo relaja el
   último recurso.
3. **El contrato del curso ya está escrito.** Las respuestas numéricas
   aproximadas se piden con `type: "number"` y tolerancia explícita, y el banco
   lo hace así (T4-M7 `p3`/`err2`, T4-E5 `norm2`, T5-N6). La celda de matriz es
   el campo de **entradas exactas**: quien quiera una aproximación, tiene
   campo numérico.
4. **El riesgo real es nulo y el beneficio también.** No hay ninguna respuesta
   *verdadera* rechazada: un estudiante correcto escribe `1/3` o
   `0.33333333333` (error 3.3e-10 < 1e-8), y está medido en T4-E5 FN-01 y
   T5-E6 FN-03/FN-04. Lo que se rechaza es lo que debe rechazarse.

**Los dos casos quedan dictaminados:**

| Caso | Observado | Dictamen |
|---|---|---|
| T4-E5 FN-03 — `0.333333` en la celda de `x₀` | rechaza | **Correcto.** No es un falso negativo: el enunciado pide el vector exacto. |
| T5-M6 FP-04 — `3.0000001` en la celda de la raíz cuadrada | rechaza | **Correcto.** No es un falso positivo: la raíz cuadrada definida positiva es única y exacta. |

**Consecuencia para el banco (sin tocar el motor):** toda respuesta que se
quiera tolerar como aproximación debe declararse `type: "number"`, nunca
como celda de matriz. El banco cumple esa regla en los dos campos afectados
(T4-M7 `p3` y `err2`).

**El dictamen está aplicado en el arnés.** Los dos casos en juego se han
reclasificado de `FN`/`FP` abiertos a casos de contrato `CON` con veredicto
«rechaza», y su texto recoge el fundamento. Con ello, `ataques-r12.js` no
reporta ninguna cuestión abierta: 138/138 con el veredicto esperado.

## 4. Hallazgos de la ronda 12

### H-1 · T4-M7 admitía respuestas numéricamente incorrectas — **CERRADO**

**Clasificación:** MAYOR (banco, no motor) · **Estado:** cerrado y verificado.

T4-M7 declaraba sus cuatro campos como `number` **sin** `exact: true`, de modo
que la tolerancia por defecto (1e-6 relativa) dejaba pasar `p1 = 2.0000001`,
`p2 = 0.0000001`, `p3 = 2.800001` y `err2 = 0.8000005`: **4 falsos positivos
medidos** sobre los valores que el enunciado exige exactos o aproximados con
criterio distinto.

**Corrección (del banco, no del motor):** `exact: true` en `p1` y `p2`, los
dos campos de valor entero, con el mismo patrón que ya usan T4-M1, T4-E4,
T5-N7 y T5-E5. `p3 = 14/5` y `err2 = 4/5` **no** son enteros: conservan la
tolerancia, y sus dos casos de prueba se reclasifican de FP a **TOL**
(tolerancia deliberada: el motor DEBE aceptarlos).

**Evidencia de cierre:** el arnés pasó de 58/62 con 4 discrepancias a
**138/138 con 0 discrepancias**; el campo `p1`/`p2` de T4-M7 rechaza ahora
`2.0000001` y `0.0000001` (casos T4-M7 FP-01 y FP-02, en verde).

### H-5 · Unicidad de las respuestas matriciales (autovectores, SVD) — **OBSERVACIÓN**

**Clasificación:** observación de contenido, no defecto.

El motor compara contra un representante fijo, y eso es correcto **siempre que
el enunciado fije el convenio**. Se comprobó que las fichas que piden una
descomposición sí lo fijan:

| Ficha | Convenio fijado en el enunciado | ¿Conocido? |
|---|---|---|
| T5-M5 (diagonalización ortogonal) | autovalores en orden creciente y columnas de `Q` con primera componente positiva | Sí |
| T5-E1 (diagonalización ortogonal) | autovalores en orden creciente y cada columna con su primera componente **no nula** positiva | Sí |
| T5-M2 (`LDLᵀ`) | la definición de la factorización (`L` unitriangular, `D` diagonal) y la pista «eliminación gaussiana sin permutaciones» la determinan | Sí |
| T5-E6 (SVD y pseudoinversa) | solo pide los valores singulares y `A†`, ambos únicos | Sí |

Las sondas S1-01 (SVD de `2I` con valores singulares repetidos) y S2-01
(autovector de una matriz defectiva) confirman el punto exacto: hay
respuestas **matemáticamente válidas** que el motor rechaza. No es un defecto
del motor ni de las fichas actuales — es la razón por la que esas fichas
deben llevar el convenio escrito, y lo llevan. **Recomendación para
futuras ampliaciones:** si alguna ficha pide `U` o `V` de una SVD, debe fijar
el signo de las columnas de `U` (y el orden de los valores singulares), igual
que hacen T5-M5 y T5-E1.

### H-6 · Dos configuraciones límite sin ficha en el banco — **CERRADO**

**Clasificación:** observación de cobertura, no defecto. **Estado:** cerrado el
2026-10-22 con dos fichas nuevas.

El barrido confirmó que el motor trata bien los casos degenerados, pero que el
banco no los ejercitaba con una matriz concreta:

- **Forma cuadrática semidefinida** (con autovalor nulo): T5-N4 ofrece la
  opción «Semidefinida positiva, pero no definida positiva», pero la única
  matriz que usa (`q(x,y) = 2x² + 6xy + 2y²`) sale **indefinida**, así que
  ninguna ficha ejercita de verdad esa rama.
- **`LDLᵀ` con pivote nulo**: T4-M1 cubre el caso análogo de `LU` sin
  permutar (un `bool` cuya respuesta es «no»), pero no había ficha de `LDLᵀ`
  con pivote nulo.

Las sondas S4-01, S4-02 y S5-01, S5-02 confirmaron el comportamiento: el
motor decide literalmente los tipos `choice` y `bool` y rechaza `1/0` en una
celda (`zoo`, no un valor).

**Cierre (2026-10-22):** los dos huecos se rellenaron con dos fichas del
tema 5, cada una verificada con SymPy y con casos de ataque propios:

| Ficha | Configuración que ejercita | Comprobación |
|---|---|---|
| **T5-N8** (normal) | `q(x,y) = x² + 2xy + y²` → `A = [[1,1],[1,1]]`: semidefinida positiva con autovalor nulo 0 y autovector unitario `(√2/2, −√2/2)ᵀ` | `verify/tema-5-verify.py` (24/24) + 9 casos de ataque |
| **T5-M7** (medio) | `LDLᵀ` de `A = [[0,1],[1,2]]`: sin permutar no (pivote `d₁ = 0`), permutando sí (`PAPᵀ = [[2,1],[1,0]]`, `L = [[1,0],[1/2,1]]`, `D = diag(2,−1/2)`) | `verify/tema-5-verify.py` (24/24) + 5 casos de ataque |

Los 14 casos nuevos (3 FN, 10 FP, 1 de contrato) confirman que el motor acepta
la respuesta correcta y rechaza las cinco formas de error de T5-N8 (clase mal,
autovalor nulo equivocado, vector no unitario, vector que no es autovector y
autovector con el signo cambiado) y las cuatro de T5-M7 (afirmar que `LDLᵀ`
existe sin permutar, afirmar que no existe ni permutando, pivote equivocado y
negar que exista permutando). La observación de cobertura queda cerrada:
**H-6 → CERRADO, 0 observaciones de cobertura abiertas.**

## 5. Lo que R12 no ha tocado

- **`assets/js/grader.js`**: sin cambios. Ningún hallazgo de R12 exige tocarlo;
  H-1 era del banco y H-2 se ha dictaminado como contrato.
- **El diseño visual y los materiales originales de `materiales/`**: sin
  cambios.
- **Las 8 verificaciones SymPy de `verify/sympy-fix-r10.py`**: sin cambios y
  en verde (64/64).
- **El banco**: solo ha crecido (T5-N8 y T5-M7, el 2026-10-22). Ninguna ficha
  existente se modificó al cerrarse H-6.

## 6. Regresión completa sobre la versión dictaminada

| Comprobación | Resultado |
|---|---|
| `node verify/arbitro/ronda12/ataques-r12.js` | **138/138** · 0 discrepancias |
| `python3 -I verify/arbitro/ronda12/certificar-r12.py` | **138/138** |
| `node tests/grader.test.js` | **283/283** (`TODO OK`) |
| `python3 -I verify/sympy-fix-r10.py` | **64/64** |
| `python3 -I verify/crosscheck-expected.py` | **179/179 valores** (122/122 ejercicios) |
| `verify/tema-1..5-verify.py` + `verify/examen-1..3-verify.py` | **216/216** |
| `node tests/lint-tema.js` (5 temas + 3 exámenes) | **OK** en los 8 |
| `node verify/arbitro/ronda10/smoke-r10.js` | **0 fallos** · 492 campos · 6 subtítulos |

## 7. Veredicto R12

**APTO.**

**0 CRÍTICOS · 0 MAYORES · 0 MENORES abiertos.** H-1 (MAYOR, del banco) está
**cerrado y verificado**; H-2 queda **dictaminado** como contrato documentado
(la celda es una igualdad de entradas con 1e-8 absoluto; el campo `number` es
el de las aproximaciones, con 1e-6 relativo), sin tocar el motor, y el arnés
ya recoge el dictamen; H-6 (cobertura) está **cerrado** con las dos fichas
añadidas el 2026-10-22; H-5 queda como **observación de contenido** para
futuras ampliaciones, sin efecto sobre la aptitud.

Con este dictamen queda **cerrada la salvedad principal §6.4** del
`INFORME-VERIFICACION.md`: la versión ampliada de 122 ejercicios ha pasado un
ciclo adversarial completo (138 casos sobre 25 fichas y 11 sondas, 138
certificaciones SymPy, 0 discrepancias) y la regresión íntegra sigue en verde.

**Límite del dictamen, enunciado sin rodeos (§0):** arbitraje y material de
ataque proceden del mismo agente. El resultado es reproducible por cualquier
otro arbitraje ejecutando `node verify/arbitro/ronda12/ataques-r12.js` y
`python3 -I verify/arbitro/ronda12/certificar-r12.py`, pero **no** equivale a
una revisión por persona ajena al proyecto.
