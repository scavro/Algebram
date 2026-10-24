# Catálogo de ataques — Ronda 12 (fichas nuevas de los temas 4 y 5)

**Fecha:** 2026-10-21 (material) · **Ejecutado:** 2026-10-22 · **Alcance:** las
9 fichas añadidas en la ampliación del 2026-10-21 (temas 4 y 5), más las 2
fichas añadidas el 2026-10-22 (T5-N8 y T5-M7, que cierran H-6), con barrido
sobre las 41 fichas de ambos temas.
**Destinatario:** quien actúe de árbitro en la ronda 12.
**Estado:** **EJECUTADO** — veredicto en `docs/auditoria/arbitro-ronda12-math.md`
(APTO: 138/138 con el veredicto esperado, 0 discrepancias, 138/138
certificaciones SymPy). Este documento conserva su valor como material de
ataque: es el guion de la ronda, y cualquiera puede volver a ejecutarlo.
**Estado del motor:** `assets/js/grader.js` **no se modifica en esta fase**
(auditado, 283/283 en verde). Todo hallazgo se cierra con certificación SymPy
*antes* de plantear un cambio.

Este documento no es un informe de resultados: es el **material de trabajo**
para atacar. Cada caso está redactado como una identidad que el motor **no
debe** rechazar (FN) o **no debe** aceptar (FP), con su justificación
matemática y la certificación SymPy que la respalda.

---

## 1. Material que acompaña al catálogo

| Fichero | Qué es |
|---|---|
| `verify/arbitro/ronda12/ataques-r12.js` | Arnés: 78 casos sobre las 11 fichas nuevas (9 de la ampliación del 2026-10-21 + T5-N8 y T5-M7 del 2026-10-22). Toma la especificación **del banco real** (`assets/data/tema-4.js`, `tema-5.js`), no de una copia, y muestra el veredicto observado |
| `verify/arbitro/ronda12/casos-barrido-r12.js` | Barrido de las 14 fichas de los temas 4 y 5 que ninguna ronda anterior había atacado (49 casos) + 11 sondas sintéticas de las familias de riesgo |
| `verify/arbitro/ronda12/certificar-r12.py` | Extrae las certificaciones SymPy del arnés y las ejecuta: **138/138 se cumplen** (0 triviales) |

```bash
node verify/arbitro/ronda12/ataques-r12.js           # línea base (informe, exit 0)
node verify/arbitro/ronda12/ataques-r12.js --check   # exit 1 si hay discrepancias
python3 -I verify/arbitro/ronda12/certificar-r12.py  # certificaciones SymPy
```

**Línea base (2026-10-21, antes de corregir H-1):** 58 de los 62 casos
cerrados se comportan como deben; los 4 casos que fallan son los FP de **H-1**
(tolerancia de `number` en T4-M7); 2 casos están **abiertos** como cuestión de
contrato (**H-2**).

**Línea base tras la ejecución (2026-10-22):** 122 de los 122 casos cerrados
se comportan como deben (**0 discrepancias**); los 2 casos de contrato (H-2)
quedan **dictaminados** en el informe de arbitraje (opción (a): documentar, sin
tocar el motor). El barrido y las sondas añaden 60 casos: **49 sobre las 14
fichas restantes** y **11 sondas sintéticas** de las familias de riesgo, todos
en verde salvo los 3 casos de contrato (S1-01, S2-01, T5-E1 CON-01), que se
rechazan **por diseño**.

Para añadir un caso: una entrada al array `CASOS` del arnés con `ficha`,
`caso`, `clase` (`FN`/`FP`), `debe` (`acepta`/`rechaza`), `cambios` (la respuesta
del alumno, completa o con los campos sustituidos), `por` (justificación
matemática) y `sympy` (la certificación, que debe devolver `True`).

---

## 2. Reglas de la ronda

1. **El motor no se toca.** Es la regla de la casa: el motor está auditado y en
   verde. Un hallazgo se documenta, se clasifica y se cierra con la
   certificación SymPy correspondiente; solo después se propone un cambio, y ese
   cambio requiere una ronda de pruebas completa (`tests/grader.test.js`,
   `verify/sympy-fix-r10.py` y las baterías adversariales de la ronda 10).
2. **Todo ataque se formula en las dos direcciones:**
   - **FN** — *identidad verdadera* que el motor no debe rechazar. Si la
     rechaza, es un falso negativo: un alumno que ha acertado es corregido
     como si hubiera fallado.
   - **FP** — *identidad falsa* que el motor no debe aceptar. Si la acepta, es
     un falso positivo: un alumno que no ha acertado pasa como si hubiera
     acertado.
3. **Cada caso se certifica con SymPy antes de nada:** la justificación
   matemática no se afirma, se calcula. La certificación vive en el arnés
   (`sympy:`) y se ejecuta con `certificar-r12.py`.
4. **Un hallazgo solo se cierra con la certificación**, no con el argumento.
5. Lo que se busca en esta ronda no son fallos de aritmética del banco —las 9
   fichas están verificadas por SymPy (`verify/tema-4-verify.py` 55/55,
   `verify/tema-5-verify.py` 24/24) y por el cross-check (122/122 ejercicios,
   179/179 valores)— sino fallos de **corrección, unicidad e interfaz**.

---

## 3. Superficie de ataque: qué decide de verdad el motor

`equivalentStrings` (`assets/js/grader.js:1471-1504`) decide en este orden:

1. **Identidad textual** tras normalizar.
2. **Vía exacta en cuerpos finitos F_p** con BigInt (`fieldEquivalent`,
   `:1442`): decide `true`/`false`/`null` sin ventana de tolerancia.
3. **Vía polinómica** `polyEqual` (`:1262`): si decide, **es la autoridad**
   (se evalúa *antes* del `return false` de la vía 2). La anulación de un
   polinomio usa `polyIsZero` con tolerancia **absoluta 1e-8** (`:628-635`).
4. **Vía numérica** con muestreo aleatorio en ℂ (`:487`), solo si el esqueleto
   trascendente coincide.

### 3.1 Tolerancia efectiva por tipo de respuesta (medida, 2026-10-21)

`number` usa `nearlyEqual` (`:473`): `diff ≤ tol · max(1, |a|, |b|)` con
`tol = 1e-6` por defecto → **relativa 1e-6**.
`expr`, `matrix`, `vector` y `exprset` caen en la vía polinómica, cuya
tolerancia es **absoluta 1e-8** → unas dos órdenes de magnitud más estricta.

| Valor esperado | Candidato | Error abs. | `number` | `expr` | celda de matriz |
|---|---|---|---|---|---|
| `1/sqrt(2)` | `0.707107` | 2.19e-7 | acepta | rechaza | rechaza |
| `1/sqrt(2)` | `0.7071068` | 1.88e-8 | acepta | rechaza | rechaza |
| `1/sqrt(2)` | `0.70710678` | 1.19e-9 | acepta | acepta | acepta |
| `1/3` | `0.333333` | 3.33e-7 | acepta | rechaza | rechaza |
| `1/3` | `0.3333333` | 3.33e-8 | acepta | rechaza | rechaza |
| `1/3` | `0.33333333` | 3.33e-9 | acepta | acepta | acepta |
| `1/18` | `0.0555556` | 4.44e-8 | acepta | rechaza | rechaza |
| `1/18` | `0.05555556` | 4.44e-9 | acepta | acepta | acepta |
| `1/9` | `0.1111111` | 1.11e-8 | acepta | rechaza | rechaza |
| `1/9` | `0.11111111` | 1.11e-9 | acepta | acepta | acepta |
| `1000000/3` | `333333.3333333` | 3.33e-8 | acepta | **acepta** | **acepta** |

El último caso merece atención: se acepta pese a un error de 3.3e-8 porque la
vía F_p **reconoce la identidad racional**. `doubleToFrac` (`grader.js:1329`)
descompone el decimal en fracciones continuas y se queda con el convergente
`h1/k1` que cumpla `|h1/k1 − x| ≤ 1e-12 · max(1, x)`. Para `333333.3333333`
ese convergente es `1000000/3` —idéntica a la esperada—, mientras que para
`0.3333333` es `3333332/9999997`, que **no** es `1/3` y por eso se rechaza.
Dos consecuencias para el árbitro: (a) la tolerancia de esta vía es
**relativa** (1e-12·max(1,x)), así que una magnitud grande se reconoce mucho
más holgadamente que una pequeña; (b) la vía exacta en F_p es más fuerte que
la tolerancia decimal cuando la entrada es racional, y más débil cuando es
irracional (`1/sqrt(2)`, `sqrt(2)/2`, `2i/sqrt(5)`), donde solo decide la
tolerancia polinómica de 1e-8.

### 3.2 Lo que el motor no puede hacer

- **No comprueba la consistencia entre campos** de un `multi`: en T4-M6 se
  acepta un `Q1` y un `R1` que no satisfacen `Q1 R1 = C` si cada uno coincide
  con su propio `expected`. Es una limitación del contrato (la relación entre
  campos la comprueba el alumno, no el corrector), no un defecto.
- **No comprueba la unicidad matemática** de la respuesta: solo compara con
  lo que el banco fija. Si el enunciado no fija el signo o el orden, dos
  respuestas igualmente correctas se rechazan entre sí (y viceversa: dos
  respuestas distintas pueden ser ambas correctas y solo una pasa).
- **No distingue respuestas "equivalentes pero no idénticas"** en los tipos
  `bool`, `choice` y `text`: son comparaciones literales.

Estas tres limitaciones son el mapa de lo que la ronda 12 debe explorar: la
corrección del banco está verificada; lo que falta es el contrato de las
respuestas que el enunciado deja abiertas.

---

## 4. Las nueve fichas nuevas, una a una

### 4.1 T4-N7 — Inversa de una triangular superior (matrix 3×3)

- **Enunciado:** `U = [[1,2,-1],[0,2,4],[0,0,-1]]`; calcular `U⁻¹` con la
  recurrencia de la Proposición 4.2.
- **`expected`:** `[[1,-1,-5],[0,1/2,2],[0,0,-1]]` · **tipo:** `matrix` 3×3.
- **Invariante:** `U⁻¹ U = I`, y la inversa de una triangular superior es
  triangular superior.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | celda `1/2` escrita `0.5` | mismo racional | acepta ✓ |
| FN-02 | FN | celda `1/2` escrita `2/4` | misma fracción | acepta ✓ |
| FN-03 | FN | celda `-1` escrita `(-1)` | el paréntesis no cambia el valor | acepta ✓ |
| FN-04 | FN | celda `-5` escrita `-5.0` | mismo real | acepta ✓ |
| FP-01 | FP | celda `b22 = 2` | error de recíproco: `b22 = 1/u22 = 1/2` | rechaza ✓ |
| FP-02 | FP | celda `b13 = 5` | la fila 1 debe anular la 3.ª columna de `U` | rechaza ✓ |
| FP-03 | FP | celda `b13 = -4` | `b13 = -(2·2 + (-1)(-1)) = -5` | rechaza ✓ |
| FP-04 | FP | inversa transpuesta | la inversa de triangular superior es triangular superior | rechaza ✓ |
| FP-05 | FP | `-U⁻¹` | `U⁻¹U = I` obliga a `b11 = 1` | rechaza ✓ |

Certificación: `sp.Matrix([[1,-1,-4],[0,sp.Rational(1,2),2],[0,0,-1]]) * U != sp.eye(3)`.

### 4.2 T4-M6 — QR de rango de una matriz deficiente (multi: Q1, R1, Q2)

- **Enunciado:** `C = [[1,2,1],[0,0,1],[1,2,1]]` (rango 2: la 2.ª columna es
  `2·c1`); QR de rango `Q1 R1` y `Q2` de `ker Cᵀ`.
- **`expected`:** `Q1 = [[1/√2,0],[0,1],[1/√2,0]]`,
  `R1 = [[√2,2√2,√2],[0,0,1]]`, `Q2 = [1/√2,0,-1/√2]ᵀ`.
- **Punto delicado:** en una QR de rango la 2.ª columna de `Q1` **no** la fija
  un pivote (su entrada en `R1` es 0): la fija el procedimiento (proyección
  ortogonal de `c3` sobre `q1`) y el convenio de pivotes positivos de `R1`.
  Ese es el corazón del ataque: dos respuestas "equivalentes" con distinto
  signo, y una de ellas correcta solo si se respeta el convenio.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | `Q1` con `sqrt(2)/2` en vez de `1/sqrt(2)` | `√2/2 = 1/√2` | acepta ✓ |
| FN-02 | FN | `R1` con `sqrt(8)` en vez de `2*sqrt(2)` | `√8 = 2√2` | acepta ✓ |
| FN-03 | FN | `Q2` con `-sqrt(2)/2` | `-√2/2 = -1/√2` | acepta ✓ |
| FP-01 | FP | `Q1` con `q1 = (1/√2,0,-1/√2)` | `q1` sale de `col(C)`: los pivotes `r11` y `r13` se anulan | rechaza ✓ |
| FP-02 | FP | `Q2` con primera entrada negativa | el enunciado exige primera entrada positiva | rechaza ✓ |
| FP-03 | FP | `R1` con `r23 = -1` | el pivote debe ser positivo: `r23 = q2ᵀc3 = 1` | rechaza ✓ |
| FP-04 | FP | `Q1` con `q2 = (0,-1,0)` | invierte el pivote `r23` | rechaza ✓ |
| FP-05 | FP | `R1` con `r11 = -√2` | los pivotes de `R1` son positivos | rechaza ✓ |

**Consistencia que el motor no comprueba (fuera del alcance del corrector, pero
digno de una pregunta al banco):** `Q1 R1` debe ser `C` y `Q1ᵀ Q1 = I`;
`Q2` debe ser unitaria y ortogonal a `Q1`. El banco no lo exige y el motor no
lo puede exigir.

### 4.3 T4-M7 — Ajuste de un plano por mínimos cuadrados (multi de 4 números)

- **Enunciado:** ajustar `z = p1 x + p2 y + p3` a 5 mediciones; pedir `p1`,
  `p2`, `p3` y `‖b - Ap‖₂²`.
- **`expected`:** `p1 = 2`, `p2 = 0`, `p3 = 14/5`, `err2 = 4/5`.
  **Tipo:** `multi` de cuatro `number` **sin `exact`**.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | `p3 = 2.8` | `14/5 = 2.8` | acepta ✓ |
| FN-02 | FN | `err2 = 0.8` | `4/5 = 0.8` | acepta ✓ |
| FP-01 | FP | `p2 = 0.0000001` | `p2` vale exactamente 0 | acepta ✗ → **rechaza ✓** (H-1 cerrado) |
| FP-02 | FP | `p1 = 2.0000001` | `p1` vale exactamente 2 | acepta ✗ → **rechaza ✓** (H-1 cerrado) |
| TOL-01 | TOL | `p3 = 2.800001` | error 1e-6: tolerancia deliberada (14/5 no es entero) | acepta ✓ (era FP, reclasificado) |
| TOL-02 | TOL | `err2 = 0.8000005` | error 5e-7: tolerancia deliberada (4/5 no es entero) | acepta ✓ (era FP, reclasificado) |

Es el único punto donde el banco admitía una respuesta numéricamente
incorrecta: los cuatro campos eran `number` sin `exact: true`, así que la
tolerancia por defecto (1e-6 relativa) dejaba pasar residuos en valores que son
enteros. **La corrección es del banco, no del motor**: basta con poner
`exact: true` en los campos de valor entero (`p1`, `p2`) como ya hacen T4-M1,
T4-E4, T5-N7 y T5-E5. En `p3` y `err2` no procede (14/5 y 4/5 no son enteros) y
su tolerancia debe permanecer.

**Estado: APLICADO el 2026-10-22** en `assets/data/tema-4.js` (bloque T4-M7,
`p1` y `p2` con `exact: true`). El arnés pasó de 58/62 con 4 discrepancias a
**138/138 con 0 discrepancias**.

### 4.4 T4-E5 — Fórmula de Perán y solución de mínima norma (multi)

- **Enunciado:** `A = [[1,0,1],[0,1,1]]`, `b = (2,3)`; `x = Q1 (R1R1ᵀ)⁻¹ R1 b +
  Q2 u` con `u = 0`; pedir `x0` y `‖x0‖₂²`.
- **`expected`:** `x0 = [1/3,4/3,5/3]ᵀ`, `norm2 = 14/3`.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | `x0` con `0.33333333` | error 3.3e-9, dentro del umbral de la celda | acepta ✓ |
| FN-02 | FN | `norm2 = 4.666666666666667` | 14/3 a 16 cifras | acepta ✓ |
| FN-03 | FN | `x0` con 6–7 decimales | error < 1e-6 (la tolerancia declarada) | **rechaza ✗ (H-2, abierto)** |
| FP-01 | FP | `x0 + t·Q2` con `t ≠ 0` | solución compatible, pero **no** de mínima norma | rechaza ✓ |
| FP-02 | FP | `x0 = (2/3,4/3,5/3)ᵀ` | no satisface `Ax = b` | rechaza ✓ |
| FP-03 | FP | `norm2 = sqrt(14/3)` | es `‖x0‖`, no `‖x0‖²` | rechaza ✓ |
| FP-04 | FP | `x0` como fila | el banco espera columna 3×1 | rechaza ✓ |

FP-01 es el ataque de fondo: la infinita familia de soluciones de un sistema
compatible indeterminado, de la que la mínima norma es una sola. El enunciado
la fija con `u = 0`; el banco solo puede fijar un representante.

### 4.5 T4-E6 — Factorización de Schur compleja (multi: Q y U)

- **Enunciado:** `A = [[0,-4],[1,0]]` (real **no normal**); `A = Q U Q*` con
  `u = (2i,1)/√5` como primera columna de `Q`.
- **`expected`:** `Q = [[2i/√5, 1/√5],[1/√5, 2i/√5]]`,
  `U = [[2i,-3],[0,-2i]]`.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | `Q` con `2i/sqrt(5)` | multiplicación implícita | acepta ✓ |
| FN-02 | FN | `Q` con `-2*i/(-sqrt(5))` | el mismo valor con el signo reescrito | acepta ✓ |
| FN-03 | FN | `U` con `-2i` | sin asterisco | acepta ✓ |
| FP-01 | FP | `U(1,2) = 3` | `u₁*Av = -3`, no `+3` | rechaza ✓ |
| FP-02 | FP | `U(2,2) = 2i` | la traza de `A` es 0, luego `u22 = -2i` | rechaza ✓ |
| FP-03 | FP | `Q` conjugada | el enunciado fija `u = (2i,1)/√5` | rechaza ✓ |
| FP-04 | FP | `U = Qᵀ A Q` | **traspuesta sin conjugar**: da `[[-6i/5, 17/5],[-8/5, -6i/5]]` | rechaza ✓ |

FP-04 es el error típico de la ficha: la adjunta hermítica `Q* = Q̄ᵀ` no es
`Qᵀ`. Con `A` real, `QᵀAQ` y `Q*AQ` coinciden solo si `Q` es real; aquí `Q`
es unitaria y compleja, y la diferencia es brutal.

### 4.6 T5-N7 — Menores principales líderes (multi de 3 números, `exact`)

- **Enunciado:** `A = [[2,-1,0],[-1,2,-1],[0,-1,2]]`; calcular `Δ1, Δ2, Δ3`.
- **`expected`:** `2`, `3`, `4`, los tres con `exact: true`.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | `Δ1 = 2.0` | es el entero 2 (`exact` exige entero, y 2.0 lo es) | acepta ✓ |
| FN-02 | FN | `Δ2 = 3.0`, `Δ3 = 4.0` | ídem | acepta ✓ |
| FP-01 | FP | `Δ1 = 2.0000001` | `Δ1 = 2` exactamente | rechaza ✓ |
| FP-02 | FP | `Δ3 = 3` | `det A = 4` | rechaza ✓ |
| FP-03 | FP | `Δ2 = 2.9999999` | `Δ2 = 3` exactamente | rechaza ✓ |
| FP-04 | FP | `Δ1` y `Δ2` intercambiados | `Δ1 = 2`, `Δ2 = 3` | rechaza ✓ |

Es la **referencia del patrón correcto**: los tres campos con `exact: true`
protegen frente a los residuos que H-1 deja pasar en T4-M7.

### 4.7 T5-M6 — Raíz cuadrada simétrica definida positiva (matrix 2×2)

- **Enunciado:** `A = [[10,6],[6,10]]`; la única `X` simétrica definida positiva
  con `X² = A`.
- **`expected`:** `[[3,1],[1,3]]`.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | `3` escrito `3.0` | mismo entero | acepta ✓ |
| FP-01 | FP | `[[3,-1],[-1,3]]` | su cuadrado es `[[10,-6],[-6,10]]` | rechaza ✓ |
| FP-02 | FP | `[[4,0],[0,2]]` | son las raíces de los autovalores sin volver a la base ortonormal | rechaza ✓ |
| FP-03 | FP | `[[-3,-1],[-1,-3]]` | la raíz cuadrada definida positiva es única | rechaza ✓ |
| FP-04 | FP | celda `3.0000001` | residuo 1e-7: la celda lo rechaza, un campo `number` lo aceptaría | rechaza (H-2, abierto) |

La ficha no tiene FN interesantes: la respuesta es entera y única. El ataque
está en la **unicidad** (FP-03) y en el hecho de que `X² = A` no basta para
caracterizar la raíz cuadrada SPP (hay que exigir que `X` sea simétrica
definida positiva) — la que se entrega es la única que lo cumple, así que el
banco no tiene nada que decidir aquí, pero conviene que lo diga.

### 4.8 T5-E5 — Forma de Jordan (multi: `dim` exacto y matriz `J`)

- **Enunciado:** `A = [[3,1,0],[-1,1,0],[0,0,2]]`, único autovalor `2` con
  multiplicidad 3; pedir `dim ker(A-2I)` y la forma canónica de Jordan con los
  bloques de mayor a menor tamaño.
- **`expected`:** `dim = 2`, `J = [[2,1,0],[0,2,0],[0,0,2]]`.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | `dim = 2.0` | es el entero 2 | acepta ✓ |
| FP-01 | FP | `dim = 3` | la **multiplicidad algebraica**; el error clásico | rechaza ✓ |
| FP-02 | FP | `dim = 1` | un solo bloque | rechaza ✓ |
| FP-03 | FP | `J = [[2,0,0],[0,2,1],[0,0,2]]` | forma de Jordan **válida** con los bloques en el otro orden | rechaza ✓ |
| FP-04 | FP | `J = [[2,1,0],[0,2,1],[0,0,2]]` | un bloque de tamaño 3 (implicaría `dim = 1`) | rechaza ✓ |
| FP-05 | FP | `J` diagonal | `A` no es diagonalizable | rechaza ✓ |
| FP-06 | FP | `J` con superdiagonal de doses | la forma canónica lleva superdiagonal de unos | rechaza ✓ |

FP-03 es el caso interesante: **es una respuesta correcta** en términos de
Jordan —misma forma, mismo número de bloques— y solo la convención
«bloques de mayor a menor tamaño» del enunciado la desambigua. Si el
enunciado no dijera eso, el banco sería ambiguo. Vale la pena reforzar la
redacción del enunciado: conviene que diga explícitamente *«la matriz J canónica con el bloque de tamaño 2 en la
posición superior»*, porque de lo contrario el alumno no tiene cómo saber que
el orden de los bloques es el que se le pide.

### 4.9 T5-E6 — SVD y pseudoinversa (multi: `sigmas` y `pinv`)

- **Enunciado:** `A = [[1,4],[2,2],[2,-4]]` (3×2, rango 2); valores singulares
  y pseudoinversa.
- **`expected`:** `sigmas = {6,3}` (`exprset`), `A† = [[1/9,2/9,2/9],[1/9,1/18,-1/9]]`.

| Caso | Tipo | Enunciado del ataque | Por qué | Veredicto |
|---|---|---|---|---|
| FN-01 | FN | `sigmas = 3;6` | el conjunto no es ordenado | acepta ✓ |
| FN-02 | FN | `sigmas = 6; 3` | espacios en el separador | acepta ✓ |
| FN-03 | FN | `1/9` escrito `0.111111111` | error 1.1e-10 | acepta ✓ |
| FN-04 | FN | `1/18` escrito `0.0555555556` | error 4.4e-11 | acepta ✓ |
| FP-01 | FP | `sigmas = 6;3;3` | solo hay dos valores singulares | rechaza ✓ |
| FP-02 | FP | `sigmas = 6;2` | `AᵀA = diag(9,36)` → σ = 3 y 6 | rechaza ✓ |
| FP-03 | FP | `A†` transpuesta (3×2) | la pseudoinversa de una 3×2 es 2×3 | rechaza ✓ |
| FP-04 | FP | `A†(2,3) = 1/9` | el signo es negativo (la 3.ª columna de `A` es `-4`) | rechaza ✓ |
| FP-05 | FP | `1/9` escrito `0.1` | error 0.0111 | rechaza ✓ |

FP-01 toca una de las familias de riesgo: el `0` que multiplica al autovalor
nulo no aparece como valor singular, pero un alumno que multiplica por la
multiplicidad se lleva un `3` de más. La respuesta correcta (`{6,3}`) es un conjunto *no ordenado* y con la
multiplicidad implícita: el enunciado dice `σ1 > σ2`, lo que fija que son
exactamente dos valores singulares.

---

## 5. Barrido de las 41 fichas de los temas 4 y 5

De las 41 fichas, 16 han sido **citadas en las rondas anteriores**
(`docs/auditoria/`): T4-N3, T4-N4, T4-M2, T4-M3, T4-M4, T4-M5, T4-E2, T4-E3,
T5-N1, T5-N5, T5-M1, T5-M3, T5-M4, T5-M5, T5-E3, T5-E4. Las 25 restantes (las
9 nuevas de §4, las 14 de esta tabla y las 2 añadidas el 2026-10-22, T5-N8 y
T5-M7) **no habían sido atacadas**.

| Ficha | Tipo | `expected` | Ataque propuesto (FN / FP) |
|---|---|---|---|
| T4-N1 | vector 3×1 | `(1,-1,2)ᵀ` | FN: `1.0`; FP: solución del sistema homogéneo (`(0,0,0)`), componentes permutados |
| T4-N2 | choice (3) | índice 2 (incompatible) | FP: elegir «compatible determinado» o «compatible indeterminado»; la respuesta correcta es incompatible: `rg A = 1 ≠ rg A* = 2` |
| T4-N5 | bool | `false` | FP: «verdadero» (la 2.ª ecuación es `2·` la 1.ª con término independiente distinto: 7 ≠ 6) |
| T4-N6 | matrix 2×2 | `[[3,3],[3,5]]` (`AᵀA`) | FN: `3.0`; FP: `AAᵀ` (3×3, se rechaza por dimensiones) y `[[5,3],[3,3]]` (matrices transpuestas) |
| T4-M1 | multi (3 `exact` + choice) | `2, 0, -2` + «no LU» | **Pivote nulo**: `Δ2 = 0` → no hay LU sin permutar. FP: `d2 = 0.0000001` (debe rechazarse: `exact` lo rechaza), `lu = 0` («sí»); FN: `d1 = 2.0` |
| T4-E1 | vector 3×1 | `(1,2,3)ᵀ` | FP: la solución del sistema homogéneo, o permutar componentes; FN: `-1.0` |
| T4-E4 | multi (3 `exact`) | `m=1, n=2, pred=6` | FP: `pred = 5` (confundir `y(4)` con el residuo), `m = 0.9999999`; FN: `m = 1.0` |
| T5-N2 | bool | `false` | **Defectiva**: `p(λ) = (λ-3)²` con `dim ker = 1`. FP: «verdadero» |
| T5-N3 | matrix 2×2 | `[[2,0],[1,2]]` (Cholesky) | FP: `[[2,0],[-1,2]]` (signo), `[[2,0],[1,-2]]` (diagonal negativa) |
| T5-N4 | choice (4) | índice 2 (indefinida) | `q = 2x²+6xy+2y²` → matriz `[[2,3],[3,2]]` → autovalores 5 y -1. FP: «definida positiva» o «semidefinida»; la trampa del 6 por 3 **no se ve en la respuesta** (ver §6.4) |
| T5-N6 | number `exact` | `3` | FP: `3.0000001` (lo rechaza `exact`), `1` (el otro valor singular), `√5` |
| T5-M2 | multi (2 matrices) | `L` unittriangular, `D = diag(1,3,2)` | FP: `D = diag(2,2)` (la respuesta de la versión antigua), `L` no unittriangular, `D` no diagonal |
| T5-E1 | multi (2 matrices) | `Q` con `sqrt(2)/2`, `Λ = diag(-1,3,4)` | FP: autovectores con la primera componente **negativa** (el enunciado exige «primera componente no nula positiva»), `Λ` en orden decreciente |
| T5-E2 | matrix 3×3 | `[[2,0,0],[1,2,0],[1,1,3]]` (Cholesky) | FP: `L` no triangular (`l21` en `l12`), diagonal `l33 = -3` |

**Estado: EJECUTADO el 2026-10-22** — las 14 fichas de esta tabla se han
atacado con 49 casos (`verify/arbitro/ronda12/casos-barrido-r12.js`), todos en
verde salvo los 3 casos de contrato. La tabla recoge el ataque *propuesto*;
el ejecutado amplió algún caso (p. ej. en T4-N6 se añadió `[[3,2],[2,5]]`, el
error de olvidar la tercera fila al calcular el producto escalar de las
columnas) y añadió los casos FN de equivalencia decimal (`1.0`, `3.0`, `2.0`).
Recuento por ficha en §9.1.

---

## 6. Familias de riesgo (las que conviene atacar primero)

### 6.1 Valores singulares repetidos

**En el banco:** ninguna ficha tiene valores singulares repetidos — las
candidatas T5-M3, T5-M6 y T5-E6 los tienen simples (`{4,2}`, `{4,2}`, `{6,3}`).
**Sonda sintética propuesta:** `A = 2I` tiene `σ1 = σ2 = 2` y su SVD **no es
única** (basta rotar `U` y `V` a la vez). Con el tipo `matrix`, el motor
rechazará la versión rotada aunque sea matemáticamente válida. La conclusión
que se busca: **el banco solo puede aceptar una respuesta si el enunciado fija
el convenio** (como hacen con «primera componente no nula positiva»). Con la
ficha T5-M6, la misma raíz cuadrada SPP es única, pero su eigenvector en el
caso degenerado no lo es: por eso la unicidad hay que **enunciarla**, no
suponerla.

### 6.2 Autovalores múltiples con matriz defectiva

**En el banco:** T5-N2 (bool) y T5-E5 (Jordan). Ambas concentran la misma
trampa: confundir multiplicidad algebraica con geométrica. La ronda debe
comprobar que el `bool` de T5-N2 no se puede "colar" con una respuesta
equivalente y que la cadena de Jordan de T5-E5 no se confunde con la cadena
propia (`[[2,1,0],[0,2,0],[0,0,2]]`) ni con la diagonal.

### 6.3 Pseudoinversas de rango deficiente

**En el banco:** T5-M4 (rango 1) y T5-E6 (rango 2 de una matriz 3×2).
**Aviso medido:** con rango completo por columnas, `A† = (AᵀA)⁻¹Aᵀ` y
`A† = Aᵀ(AAᵀ)⁺` **coinciden** (verificado con SymPy), así que ese «error de
fórmula» **no** sirve para discriminar. Los que sí discriminan son: olvidar el
`Aᵀ` (matriz 2×2 en vez de 2×3), transponer, o perder el signo. En T5-M4
(rango 1) la fórmula `A† = vuᵀ/(‖u‖²‖v‖²)` es la única posible: atacar
`[[2,1],[4,2]]` (no dividir por las normas) y `[[2/5,1/5],[4/5,2/5]]`
(dividir por `‖u‖²` en vez de por el producto `‖u‖²‖v‖² = 25`).

### 6.4 Formas cuadráticas degeneradas

**En el banco:** T5-N4 (`q = 2x²+6xy+2y²` → matriz `[[2,3],[3,2]]`, indefinida)
y T5-E4 (inercia 1 positiva, 2 negativas).
**Hallazgo de barrido:** el error clásico —usar 6 en vez de 3 fuera de la
diagonal— **no se ve en la respuesta**: con `[[2,6],[6,2]]` la forma también es
indefinida, y con `[[2,6,0],[6,2,0],[0,0,-5]]` la inercia también es (1,2). La
trampa es invisible a través del campo de respuesta; solo se detecta en la
solución escrita. **Sonda sintética propuesta:** una forma **semidefinida**
(`λ = 0`), que no aparece en el banco: `q(x,y) = x²` → `[[1,0],[0,0]]` → la
respuesta sería la opción «semidefinida positiva» del `choice` de T5-N4, y
ahí sí habría que decidir si `[[1,0],[0,0]]` debe aceptarse.

### 6.5 `LDLᵀ` con pivote cero

**En el banco:** T4-M1 es exactamente el caso: `Δ2 = det[[2,4],[4,8]] = 0` → el
pivote del segundo paso es nulo → **no hay factorización `LU` sin permutación**,
y la respuesta es «no». T5-M2 (`A = [[1,2,-1],[2,7,1],[-1,1,6]]`) tiene pivotes
`1, 3, 2`, todos no nulos: es el caso fácil al lado del difícil.
**Sonda sintética propuesta:** `A = [[0,1],[1,0]]` (pivote nulo en el primer
paso) y `A = [[1,2],[2,5]]` (pivote `1`, luego `1`): el primero exige
permutación, el segundo no. Y una sonda de **falsos positivos**: un alumno que
responde «sí, admite LU» a T4-M1 y da una `L` con un `1/0` en la segunda
columna; el motor debe rechazar el `1/0` (división por cero) y el «sí».

---

## 7. Hallazgos de la ronda 12 y su estado tras la ejecución

### H-1 · `number` sin `exact: true` en T4-M7 — **MAYOR (banco), no motor — CERRADO**

Los cuatro campos de T4-M7 (`p1`, `p2`, `p3`, `err2`) son `number` sin
`exact: true`, con la tolerancia por defecto (1e-6 relativa). El motor acepta
`p2 = 0.0000001`, `p1 = 2.0000001`, `p3 = 2.800001` y `err2 = 0.8000005`
(4 FP medidos en el arnés).
**Corrección propuesta, en el banco y no en el motor:** añadir `exact: true` a
`p1` y `p2` (los enteros), como ya hacen T4-M1, T4-E4, T5-N7 y T5-E5; dejar
`p3` y `err2` con tolerancia, porque 14/5 y 4/5 no son enteros.
**Certificación:** `sp.Integer(2) != sp.Float('2.0000001')` y
`sp.Rational(0) != sp.Float('0.0000001')` (en el arnés).
**Efecto esperado en el arnés:** FP-01 y FP-02 pasan a rechazar; FP-03 y FP-04
siguen aceptando (tolerancia legítima de un racional no entero) y conviene
reformularlos como «tolerancia deliberada» en lugar de como FP.

**Estado: CERRADO el 2026-10-22.** `exact: true` añadido a `p1` y `p2` en
`assets/data/tema-4.js`; FP-03 y FP-04 reclasificados como TOL-01 y TOL-02. El
arnés pasó de 58/62 con 4 discrepancias a 138/138 con 0 discrepancias. No se
tocó el motor.

### H-2 · La celda de matriz es más estricta que el contrato declarado — **MENOR (contrato) — DICTAMINADO: opción (a)**

`expr`, `matrix`, `vector` y `exprset` deciden con una tolerancia **absoluta
1e-8** (vía polinómica, `polyIsZero`), mientras `number` decide con una
tolerancia **relativa 1e-6**. La consecuencia práctica: un alumno que redondea
`1/√2` a 6 decimales es rechazado en T4-M6, T5-M5 y T5-E1, y en T4-E6; en
T4-E5 y T5-E6, un redondeo a 6–7 decimales de `1/3`, `1/9` o `1/18` es
rechazado, mientras que el mismo redondeo en un campo `number` se acepta.
**Dos salidas posibles, y el árbitro debe elegir una:**
- **(a) Documentar el comportamiento** (recomendado): dejar el motor como
  está, y decir en el contrato y en el informe que la celda es una igualdad
  **exacta** (con un residuo numérico de 1e-8) mientras que `number` es una
  aproximación con tolerancia 1e-6. Es lo que ya hace `docs/schema.md` al
  distinguir «número» de «celda», y evita tocar el motor.
- **(b) Igualar la celda a la tolerancia de `number`**: exigiría un cambio
  **del motor**, con su certificación SymPy y su batería de regresión; fuera
  del alcance de esta fase.

**Estado: DICTAMINADO el 2026-10-22 — se elige (a), documentar.** Fundamento
(íntegro en `docs/auditoria/arbitro-ronda12-math.md` §3): la ventana relativa
es exactamente lo que produjo el MAYOR-1 de R10 (falso positivo «`E ≡ E+δ`»
a magnitudes enormes) y ensanchar la celda reabriría esa herida; la celda ya
tiene decisión exacta en F_p (BigInt), y su 1e-8 es el umbral del *fallback*
numérico, no una tolerancia de diseño; y el contrato del curso ya está
escrito (las aproximaciones van en `type: "number"`, las celdas son entradas
exactas). Los dos casos en juego quedan dictaminados: **T4-E5 FN-03 y T5-M6
FP-04 se rechazan correctamente**. El motor no se ha tocado.

### H-3 · Documentación incompleta de las tolerancias — **MENOR (informe) — APLICADO**

`INFORME-VERIFICACION.md` §6.1 documentaba la tolerancia de `number` pero no
la de la celda ni la diferencia entre ambas. **Corregido el 2026-10-21**: la
nota 1 del informe recoge ahora la tolerancia efectiva de cada tipo y remite
a la tabla de §3.1 de este documento.

### H-4 · Cifras incorrectas en `INFORME-VERIFICACION.md` — **MENOR (informe) — APLICADO**

Dos cifras del informe no se corresponden con la realidad. **Corregido el
2026-10-21** en el mismo fichero:
- §4 dice que la ampliación «añadió 20 ejercicios (temas 4 y 5)»: se añadieron
  **9** (T4-N7, T4-M6, T4-M7, T4-E5, T4-E6, T5-N7, T5-M6, T5-E5, T5-E6). Antes
  había 111 ejercicios (15+15+15+15+15+36) y ahora hay 120.
- §6.4 dice que las 11 rondas se ejecutaron «sobre la versión de 153
  ejercicios»: **153** es el número de **pruebas** de `tests/grader.test.js`
  (ronda 7: `153/153 OK`); el banco tenía **111 ejercicios**.

### H-5 · Unicidad de las respuestas matriciales — **OBSERVACIÓN (contenido)**

El motor compara contra un representante fijo, lo cual es correcto **siempre
que el enunciado fije el convenio**. Comprobado en las fichas afectadas:
T5-M5 y T5-E1 fijan orden creciente de autovalores y primera componente no nula
positiva; T5-M2 pide `L` unitriangular y `D` diagonal (únicos sin permutar);
T5-E6 solo pide los valores singulares y `A†` (ambos únicos). **No hay
ambigüedad en el banco actual.** Las sondas S1-01 (SVD de `2I`, valores
singulares repetidos) y S2-01 (autovector de matriz defectiva) muestran que
existirían respuestas matemáticamente válidas que el motor rechaza: por eso
toda ficha futura que pida `U` o `V` debe fijar el signo de las columnas.

### H-6 · Dos configuraciones límite sin ficha en el banco — **CERRADO (cobertura)**

El barrido confirma que el motor trata bien los casos degenerados, pero el
banco no los ejercita con una matriz concreta: la **forma cuadrática
semidefinida** (T5-N4 ofrece la opción, pero su única matriz es indefinida) y
el **`LDLᵀ` con pivote nulo** (T4-M1 cubre el análogo de `LU` sin permutar).
Sondas S4-01, S4-02, S5-01 y S5-02: el motor decide bien los tipos `choice` y
`bool` y rechaza `1/0` en una celda. Recomendación: dos fichas de examen más
cuando se amplíe el banco.

**Cierre (2026-10-22):** la recomendación se ejecutó. Se añadieron **T5-N8**
(`q(x,y) = x² + 2xy + y²`, forma cuadrática semidefinida positiva con autovalor
nulo 0 y autovector unitario `(√2/2, −√2/2)ᵀ`; 9 casos de ataque) y **T5-M7**
(`LDLᵀ` de `A = [[0,1],[1,2]]`: sin permutar el pivote `d₁` se anula, con
permutación sí existe; 5 casos de ataque). Ambas con comprobación SymPy propia
(`verify/tema-5-verify.py`, 24/24). H-6 → **CERRADO**, sin tocar el motor.

---

## 8. Lo que el árbitro debe devolver — **ENTREGADO el 2026-10-22**

*Los cuatro puntos de este apartado están cumpridos; el detalle está en
`docs/auditoria/arbitro-ronda12-math.md`.*

1. Un veredicto por caso del arnés (`node .../ataques-r12.js --check`): qué
   casos se comportan bien y cuáles no, con su clasificación FN/FP.
2. La certificación SymPy de cada hallazgo nuevo (regla 2 de §2).
3. Una decisión explícita sobre **H-2**: ¿(a) documentar la celda como
   igualdad exacta, o (b) proponer el cambio del motor? Con (a) no se toca
   `assets/js/grader.js`; con (b) hace falta una ronda completa de pruebas
   antes de tocarlo.
4. Un informe de la ronda con la misma estructura que
   `docs/auditoria/arbitro-ronda11-math.md`, para que la salvedad §6.4 del
   `INFORME-VERIFICACION.md` —«el árbitro externo no se ha repetido sobre la
   versión ampliada»— pueda cerrarse.

---

## 9. Anexo · La superficie completa de la ampliación

| Ficha | Nivel | Tipo | `expected` (resumen) | Casos en el arnés |
|---|---|---|---|---|
| T4-N7 | normal | matrix 3×3 | `[[1,-1,-5],[0,1/2,2],[0,0,-1]]` | 9 |
| T4-M6 | medio | multi (matrix + matrix + vector) | `Q1`, `R1`, `Q2` de la QR de rango | 8 |
| T4-M7 | medio | multi (4 `number` sin `exact`) | `2`, `0`, `14/5`, `4/5` | 6 |
| T4-E5 | examen | multi (vector + `number`) | `[1/3,4/3,5/3]ᵀ`, `14/3` | 7 |
| T4-E6 | examen | multi (2 matrices) | `Q`, `U` de la Schur compleja | 7 |
| T5-N7 | normal | multi (3 `number` con `exact`) | `2`, `3`, `4` | 6 |
| T5-M6 | medio | matrix 2×2 | `[[3,1],[1,3]]` | 5 |
| T5-E5 | examen | multi (`number` exacto + matrix) | `2`, `[[2,1,0],[0,2,0],[0,0,2]]` | 7 |
| T5-E6 | examen | multi (`exprset` + matrix) | `{6,3}`, `A†` 2×3 | 9 |
| **T5-N8** | normal | multi (choice + `number` exacto + vector 2×1) | «semidefinida», `0`, `(√2/2, −√2/2)ᵀ` | 9 |
| **T5-M7** | medio | multi (2 choice + `number` exacto) | «no sin permutar», `0`, «sí permutando» | 5 |

**Total del catálogo: 78 casos** (25 FN, 48 FP, 2 TOL y 3 CON), con 78
certificaciones SymPy, todas cumplidas.

### 9.1 Barrido de las 14 fichas restantes y sondas

| Ficha | Nivel | Tipo | Casos |
|---|---|---|---|
| T4-N1 | normal | vector 3×1 | 5 |
| T4-N2 | normal | choice | 4 |
| T4-N5 | normal | bool | 3 |
| T4-N6 | normal | matrix 2×2 | 3 |
| T4-M1 | medio | multi (`number` exactos + `choice`) | 4 |
| T4-E1 | examen | vector 3×1 | 3 |
| T4-E4 | examen | multi (3 `number` exactos) | 3 |
| T5-N2 | normal | bool | 3 |
| T5-N3 | normal | matrix 2×2 | 4 |
| T5-N4 | normal | choice | 3 |
| T5-N6 | normal | `number` exacto | 4 |
| T5-M2 | medio | multi (2 matrices) | 3 |
| T5-E1 | examen | multi (2 matrices) | 4 |
| T5-E2 | examen | matrix 3×3 | 3 |
| **Sondas sintéticas** | — | 5 familias de riesgo | 11 |

**Total del barrido: 60 casos** (20 FN, 37 FP y 3 CON), con 60 certificaciones
SymPy, todas cumplidas.

**Total de la ronda 12: 138 casos** (45 FN, 85 FP, 2 TOL y 6 CON) sobre **25 de
las 41 fichas** de los temas 4 y 5, con **138/138 certificaciones SymPy** y
**0 discrepancias**.

*Actualización del 2026-10-22:* se añadieron las fichas **T5-N8** y **T5-M7**
(14 casos: 3 FN, 10 FP y 1 CON) para cerrar H-6, y los dos casos de H-2
—T4-E5 FN-03 y T5-M6 FP-04— quedaron reclasificados como `CON` con el
veredicto que les asignó el dictamen, de modo que la ronda no deja ninguna
cuestión abierta.
