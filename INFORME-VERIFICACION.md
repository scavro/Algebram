# Informe de verificación — Curso «Fundamentos Algebraicos para la IA» (UNED)

**Fecha de la última re-verificación:** 2026-10-22 · **Alcance:** versión ampliada del
2026-10-21 y ampliada otra vez el 2026-10-22 (122 ejercicios) · **Estado:** APTO
con las notas de §6

Curso web estático de la asignatura *Fundamentos Algebraicos para la IA* (UNED):
teoría, ejercicios interactivos en 3 niveles (normal / medio / examen), mapas
mentales, resúmenes y exámenes cada 2 temas. Se abre **sin instalar nada**
(HTML + JS + KaTeX local), y toda respuesta se corrige con un motor de
equivalencia simbólica auditado en bucle adversarial.

---

## 1. Cómo se usa

- Abrir `index.html` en un navegador moderno (doble clic; sin servidor ni build).
- `temas/tema-1..5.html`: teoría + ejercicios por tema (3 niveles).
- `examenes/examen-1..3.html`: 12 preguntas, temporizador, «Corregir examen».
- `planificacion.html`: calendario, fórmula de calificación y **plan de trabajo
  semana a semana** con los 122 identificadores de ejercicio enlazados a su ficha.
- El progreso de los ejercicios se guarda en `localStorage` y el plazo de cada examen en `sessionStorage`.

**Contenido del archivo:** 122 ejercicios (15 + 15 + 15 + 20 + 21 en los cinco
temas, más 12 + 12 + 12 en los tres exámenes) repartidos en **492 campos de
respuesta** y **16 semanas** de plan.

## 2. Qué se verificó y con qué

### 2.1 Contenido (respuestas correctas)

Cada script recalcula el resultado desde el enunciado con SymPy y lo compara con
el `expected` del banco de ejercicios.

| Verificación | Resultado |
|---|---|
| `verify/tema-1-verify.py` | **15/15** |
| `verify/tema-2-verify.py` | **15/15** |
| `verify/tema-3-verify.py` | **71/71** |
| `verify/tema-4-verify.py` | **55/55** |
| `verify/tema-5-verify.py` | **24/24** |
| `verify/examen-1..3-verify.py` | **12/12** cada uno = **36/36** |
| **Total de comprobaciones de contenido** | **216/216** |

El tema 5 se cubre por completo: las 21 fichas del tema tienen comprobación
propia, incluidas T5-N7 (menores principales líderes), T5-N8 (forma cuadrática
semidefinida: autovalor nulo y autovector unitario), T5-M6 (raíz cuadrada
definida positiva), T5-M7 (`LDLᵀ` con pivote nulo), T5-E5 (forma de Jordan,
verificada con la cadena de Jordan `P⁻¹AP = J`) y T5-E6 (SVD y pseudoinversa,
con las cuatro ecuaciones de Penrose).

Además, `verify/crosscheck-expected.py` ejecuta esos mismos scripts y
contrasta **por valor** la copia de la respuesta esperada que cada script
guarda con el `expected` del banco: **122/122 ejercicios, 179/179 valores**
(§ 4.1).

### 2.2 Motor de comprobación (`assets/js/grader.js`)

| Verificación | Resultado |
|---|---|
| `tests/grader.test.js` (suite del equipo, 55 regresiones R10 añadidas) | **283/283** |
| `verify/sympy-fix-r10.py` (identidades certificadas + controles negativos) | **64/64** |
| `ataques-estructurales-r10.js` (71 casos) | 1 FP (esperado, §6.2) · 0 FN |
| `ataques-nuevos-r10.js` (74 casos) | **0 FP · 0 FN** |
| `bateria-hostil-r10.js` (76 casos) | **0 FP** |
| `verify/arbitro/ronda12/ataques-r12.js` (138 casos: 78 sobre las 11 fichas nuevas + 60 de barrido y sondas) | **138/138 con el veredicto esperado · 0 discrepancias** |
| `verify/arbitro/ronda12/certificar-r12.py` (certificaciones SymPy de la ronda 12) | **138/138** |
| `equivalentes-r10.js` (78 casos) | **0 FN** |
| `bordes-r10.js` (exponentes negativos, ceros) | **0 FP · 0 FN** |
| `dos-r10.js` · `dos-uno-r10.js` (DoS polinómico, 8 vectores) | 7/7 verdaderas aceptadas en ≤ 2 ms; la falsa rechazada en 430 ms |
| `giant-r10.js` (monomios grandes) | 0 congelaciones |

### 2.3 Interfaz (`verify/arbitro/ronda10/smoke-r10.js`)

Recorrido de las 10 páginas en Chrome real, con recuento **leído de los
ficheros de datos** (no cableado) y comprobación real de subtítulos:

| Comprobación | Resultado |
|---|---|
| Carga y render de las 10 páginas | **< 200 ms** cada una (evento `load`) |
| Errores de JavaScript | **0** en las 10 páginas |
| `.katex-error` | **0** (hasta 1010 fórmulas renderizadas por página) |
| Campos de respuesta | **492**, coinciden con los datos · 0 ejercicios sin campo |
| Subtítulos de las animaciones | **6/6 pistas cargadas** (`cues > 0`, modo `showing`, `mediaError = 0`) |
| Nav, barra de lectura, progreso estático | correctos |
| Progreso funcional (`localStorage` → etiquetas y barras) | correcto |
| Temporizador del examen (tick y clampeo de `deadline`) | correcto |

**Resultado final del smoke:** `SMOKE R10: 0 fallos · 492 campos · 6 subtítulos cargados`.

Ejecutado tres veces de forma independiente, con idéntico resultado. En una
ocasión dio un `CDP timeout` al evaluar `temas/tema-2.html`: fue contención del
entorno —había ~45 procesos de Chrome huérfanos de otras sesiones— y no un
defecto del sitio; las otras dos tiradas, sin competencia, pasaron limpias en
36 s.

## 3. Bucle de auditoría adversarial (resumen)

Un árbitro adversarial (documentación en `docs/auditoria/`) atacó el motor
durante 12 rondas con identidades falsas de rama, polinomios anuladores,
ventanas de tolerancia, explosiones combinatorias y vectores DoS. Cada hallazgo
se clasificó (CRÍTICO/MAYOR/MENOR) y se cerró con regla certificada en sympy
**antes** de tocar el motor.

**Veredicto R11 (confirmación del motor): APTO** — 0 CRÍTICOS, 0 MAYORES,
0 MENORES abiertos (`docs/auditoria/arbitro-ronda11-math.md`).

**Veredicto R12 (versión ampliada): APTO** — 0 CRÍTICOS, 0 MAYORES, 0 MENORES
abiertos (`docs/auditoria/arbitro-ronda12-math.md`). 138 casos sobre 25 de las
41 fichas de los temas 4 y 5 y 11 sondas sintéticas: **138/138 con el veredicto
esperado, 0 discrepancias, 138/138 certificaciones SymPy**. El único hallazgo
MAYOR (H-1, un campo `number` sin `exact: true` en T4-M7) era **del banco** y
quedó cerrado el 2026-10-22 sin tocar el motor.

Cierres del ciclo final (R10 → R11):

| Hallazgo | Cierre |
|---|---|
| FP por ventana relativa a magnitudes enormes (E ≡ E+δ errático) | Comparación **exacta en cuerpos finitos F_p** con BigInt para pares algebraicos; determinista |
| FN de identidades verdaderas (15 casos: √(c·u) c<0, log compuesto, (u^a)^b, tan impar, re/im/conj, potencias fuera de rango, sumas gigantes) | `rewriteTrueIdentities` con re-entrada recursiva + reglas certificadas + serialización canónica n-aria |
| DoS por explosión polinómica (pestaña congelada >20 s) | Estimación previa de monomios + presupuesto de trabajo + `polyPowInt` corregido; vectores en 0–1 ms |
| Coma decimal desactivada con `min`/`max` | Coma decimal solo fuera de listas de argumentos (`min(2,3)+0,5` ≡ 2.5) |
| Exponentes negativos grandes grindables (N16r) | Cerrado en R10 y re-verificado (W13/W15, `5+x^(-300)` → 0/200) |
| Rendimiento (sumas de ~4000 términos: O(n²) + stack overflow) | Memoización + árboles equilibrados; 3999 monomios en ~10 ms |

## 4. Correcciones de la ampliación (2026-10-21)

La ampliación del 2026-10-21 añadió 9 ejercicios (temas 4 y 5: T4-N7, T4-M6,
T4-M7, T4-E5, T4-E6, T5-N7, T5-M6, T5-E5, T5-E6) y una sección de
planificación. Antes de darla por buena se corrigieron estos defectos:

| Defecto | Corrección |
|---|---|
| Los subtítulos de las 6 animaciones no cargaban bajo `file://` (origen opaco: `readyState = 3`, `cues = 0`) | Incrustados como URI `data:text/vtt;base64,…` por `scripts/build_subtitulos.py`; verificado en Chrome real |
| Recuentos falsos: los chips de los temas decían 20/21/22/20/19 (el real es 15/15/15/20/21) y `index.html` decía «111 ejercicios» (el real es 122) | Recuento calculado en tiempo de ejecución desde `window.CURSO_DATA` (`data-count`); ya no puede quedar obsoleto. Los textos de respaldo del HTML se ajustan a mano en cada ampliación |
| `smoke-r10.js` cableado a 111 campos y con la comprobación de subtítulos tolerando el error | Umbral y número de subtítulos leídos de los datos y del HTML; la comprobación exige `cues > 0` y modo `showing` |
| `lint-tema.js` fallaba en los temas 4 y 5 (reparto rígido 6/5/4) | Se valida la estructura (los tres niveles presentes, `normal ≥ medio ≥ examen`, ≥ 15 por tema) y el reparto exacto de cada tema se avisa, no se falla |
| `verify/tema-5-verify.py` no cubría T5-N7, T5-M6, T5-E5 ni T5-E6 | 4 comprobaciones añadidas: 18 → **22** |
| El plan no ligaba los ejercicios concretos con las semanas | `planificacion.html` § 4 generado por `scripts/build_planificacion.py`: los 122 identificadores enlazan a su ficha y cada ejercicio aparece exactamente una vez |

### 4.1 Lo que encontró el cross-check de `expected` (2026-10-21)

Los scripts de `verify/` llevan su propia copia de la respuesta esperada de
cada ejercicio. Para que esa copia no se quedara obsoleta sin que nadie lo
notara, se escribió `verify/crosscheck-expected.py`: **ejecuta** cada script,
recoge lo que declara y lo que calcula en el bloque de cada ejercicio, y lo
contrasta **por valor** (con equivalencias simbólicas de SymPy) contra el
`expected` del banco. Cobertura: **122/122 ejercicios, 179/179 valores**.

El cross-check destapó **tres defectos reales** en `verify/tema-5-verify.py`,
que verificaba respuestas distintas de las del enunciado:

| Ejercicio | Qué verificaba el script | Qué pedía el enunciado | Corrección |
|---|---|---|---|
| T5-M2 | `LDL^T` de `[[2,4],[4,10]]` con `L=[[1,0],[2,1]]`, `D=diag(2,2)` (matriz 2×2 distinta) | `LDL^T` de `[[1,2,-1],[2,7,1],[-1,1,6]]` con `L=[[1,0,0],[2,1,0],[-1,1,1]]`, `D=diag(1,3,2)` | Script reescrito sobre la matriz del enunciado, comprobando además que `L` sea unitriangular y `D` diagonal |
| T5-M5 | `Q` y `Λ=diag(3,1)` (autovalores en orden **decreciente**) | `Λ=diag(1,3)` (orden creciente, como pide el enunciado) | `Q` y `Λ` del enunciado; se comprueba además que cada columna sea autovector y que su primera componente no nula sea positiva |
| T5-E1 | `Λ=diag(3,-1,4)` (orden **decreciente**) | `Λ=diag(-1,3,4)` (orden creciente) | Ídem, con la comprobación de signos y de autovectores |

En los tres casos **el banco de ejercicios era correcto** y el script, no: los
`expected` del enunciado se habían respetado, pero el script comprobaba otra
matriz u otro orden de autovalores. El banco no se tocó.

La prueba negativa se ha hecho: reintroduciendo cada uno de los tres defectos
en una copia aislada, el cross-check vuelve a fallar con exit 1 y señala la
divergencia exacta.

### 4.2 Ampliación del 2026-10-22: las dos fichas que faltaban

La propia ronda 12 dejó escrito (hallazgo **H-6**, observación de cobertura)
que el banco ejercitaba mal dos configuraciones límite: la **forma cuadrática
semidefinida positiva** (con autovalor nulo) y la **`LDLᵀ` con pivote nulo**.
T5-N4 ofrecía la opción «semidefinida positiva» pero ninguna matriz del banco
salía así, y T4-M1 cubría el `LU` sin permutar pero no el `LDLᵀ`. Se cerraron
ambos huecos con dos fichas nuevas del tema 5, cada una con su comprobación
SymPy y con casos de ataque propios:

| Ficha | Nivel | Enunciado | Campos de respuesta |
|---|---|---|---|
| **T5-N8** | normal | `q(x,y) = x² + 2xy + y²` (matriz `A = [[1,1],[1,1]]`): clasificar, dar el autovalor nulo y el autovector unitario con primera componente positiva | `tipo` (opción), `nulo` (entero exacto), `vec` (vector 2×1) |
| **T5-M7** | medio | `LDLᵀ` de `A = [[0,1],[1,2]]`: ¿la admite sin permutar?, ¿cuál es el pivote del primer paso?, ¿y permutando? | `sin_perm` (opción), `pivote` (entero exacto), `con_perm` (opción) |

Lo que cambió al Incorporarlas:

| Elemento | Antes | Ahora |
|---|---|---|
| Ejercicios del banco | 120 | **122** |
| Fichas del tema 5 | 19 | **21** |
| Comprobaciones de contenido | 214 | **216** (tema 5: 22 → **24**) |
| Cross-check de `expected` | 120/120 · 173 valores | **122/122 · 179 valores** |
| Campos de respuesta | 479 | **492** (los 13 nuevos: los `choice` generan un radio por opción) |
| Casos del arnés de R12 | 124 | **138** (14 nuevos: 3 FN, 10 FP, 1 de contrato) |
| Linter del tema 5 | reparto 7/6/6 | **8/7/6** (sin avisos) |
| Plan de 16 semanas | — | T5-M7 en la semana 10 (con T5-M2), T5-N8 en la semana 11 (con T5-N4) |

Nada de esto tocó `assets/js/grader.js`: las dos fichas se validaron contra el
motor sin modificarlo, y los 14 casos de ataque nuevos (con sus
certificaciones SymPy) confirman que el motor acepta la respuesta correcta y
rechaza las cinco formas de error: clasificar mal, dar otro autovalor nulo,
dar un vector no unitario, dar un vector que no es autovector y dar un
autovector con el signo cambiado (este último es un caso de **contrato**:
matemáticamente válido, pero el enunciado fija la convención del signo).

## 5. Reproducir las comprobaciones

```bash
# Contenido (216/216) — SymPy recalcula cada respuesta desde el enunciado
for f in verify/tema-1-verify.py verify/tema-2-verify.py verify/tema-3-verify.py \
         verify/tema-4-verify.py verify/tema-5-verify.py \
         verify/examen-1-verify.py verify/examen-2-verify.py verify/examen-3-verify.py; do
  python3 -I "$f"
done

# Motor (283/283) y certificación simbólica (64/64)
node tests/grader.test.js
python3 -I verify/sympy-fix-r10.py

# Cross-check de los `expected` (122/122 ejercicios, 179 valores):
# ejecuta los scripts de verify/ y contrasta sus respuestas con assets/data/
python3 -I verify/crosscheck-expected.py

# Interfaz (10 páginas, 492 campos, 6 subtítulos)
node verify/arbitro/ronda10/smoke-r10.js

# Linter de los 8 bancos de ejercicios
for i in 1 2 3 4 5; do node tests/lint-tema.js "temas/tema-$i.html" "assets/data/tema-$i.js"; done
for i in 1 2 3;     do node tests/lint-tema.js "examenes/examen-$i.html" "assets/data/examen-$i.js"; done

# Subtítulos incrustados y plan semanal (idempotentes, con modo --check)
python3 -I scripts/build_subtitulos.py --check
python3 -I scripts/build_planificacion.py --check

# Ronda 12 (versión ampliada): arnés de 138 casos y certificador SymPy
node verify/arbitro/ronda12/ataques-r12.js
python3 -I verify/arbitro/ronda12/certificar-r12.py

# Baterías adversariales
node verify/arbitro/ronda10/ataques-estructurales-r10.js
node verify/arbitro/ronda10/ataques-nuevos-r10.js
node verify/arbitro/ronda10/bateria-hostil-r10.js
node verify/arbitro/ronda10/equivalentes-r10.js
node verify/arbitro/ronda10/flujo-r10.js
```

## 6. Notas de transparencia

1. **Tolerancias del contrato.** Las constantes conservan la tolerancia
   histórica (p. ej. `pi ≈ 3.141592653589793`, `1/3 ≈ 0.3333333333333333`
   aceptan; `0.3333` por `1/3` no). Los exponentes con ruido float se tratan
   como el entero más próximo (`x^2.0000000000000004 ≡ x^2`). Respuestas
   numéricas aproximadas usan `type: "number"` con tolerancia explícita.
   **La tolerancia efectiva depende del tipo** y conviene conocerla:
   `number` decide con una tolerancia **relativa 1e-6** (`diff ≤ tol·max(1,|a|,|b|)`),
   mientras que `expr`, `matrix`, `vector` y `exprset` deciden por la vía
   polinómica con una tolerancia **absoluta 1e-8** (`polyIsZero`). En la
   práctica, una celda de matriz es una igualdad casi exacta: `0.707107` no
   sirve para `1/sqrt(2)` (error 2.2e-7) y `0.333333` no sirve para `1/3`
   (error 3.3e-7), mientras que esos mismos valores sí se aceptan en un
   campo `number`. Las entradas racionales se reconocen por fracción
   continua en la vía F_p, así que `333333.3333333` sí se acepta como
   `1000000/3`. La tabla completa está en
   `docs/auditoria/arbitro-ronda12-catalogo.md` §3.1.
2. **Expectativas contradictorias en los scripts del árbitro** (3 casos, ninguno
   es defecto del motor):
   - `min(2,3)+0,5`: el script esperaba 3.5; el valor real es 2.5.
   - `x!` vs `fact(x)`: dos scripts del árbitro con expectativas opuestas; se
     implementó la equivalencia matemática correcta (`x! ≡ fact(x)`), que es la
     que provoca el único FP de `ataques-estructurales-r10` (caso M2).
   - La secuencia de `ui-poison` que exige ocultar la solución tras un intento
     basura habiendo acertado antes.

   Los tres están documentados en `docs/auditoria/arbitro-ronda11-math.md` §4.
3. **Constantes simbólicas.** `pi`, `tau` y `e` se comparan como símbolos
   formales en F_p (identidades algebraicas) y como valores numéricos en la vía
   polinómica (aproximaciones decimales). `i` se decide en ℂ (camino polinómico).
4. **La versión ampliada ya está arbitrada (R12, 2026-10-22).** Las 11 rondas
   anteriores se ejecutaron sobre la versión de 111 ejercicios (los 153 son las
   **pruebas** de `tests/grader.test.js` en la ronda 7, no ejercicios), así que
   la ampliación del 2026-10-21 (9 ejercicios nuevos + sección de planificación)
   quedaba sin ciclo adversarial completo: era la salvedad principal de este
   informe. **Queda cerrada**: la ronda 12 se ejecutó sobre la versión
   ampliada con **138 casos** (45 FN, 85 FP, 2 TOL, 6 de contrato) sobre 25 de
   las 41 fichas de los temas 4 y 5, más 11 sondas sintéticas de las familias
   de riesgo; **138/138 con el veredicto esperado, 0 discrepancias y 138/138
   certificaciones SymPy**. Veredicto **APTO**, 0 CRÍTICOS / 0 MAYORES / 0
   MENORES abiertos (`docs/auditoria/arbitro-ronda12-math.md`).
   El material de ataque queda en `docs/auditoria/arbitro-ronda12-catalogo.md`,
   con su arnés `verify/arbitro/ronda12/ataques-r12.js` y sus certificaciones
   SymPy `verify/arbitro/ronda12/certificar-r12.py`: cualquiera puede volver
   a ejecutarlo.
   **Matiz honesto:** el catálogo y el dictamen los redactó el mismo agente, así
   que no es un arbitraje por persona ajena al proyecto, sino una
   autoauditoría con verificación mecánica (§0 del informe de R12). El
   resultado es reproducible con los dos guiones, pero no equivale a una
   revisión externa.
5. **El plan semanal es una propuesta propia.** `planificacion.html` § 4 reparte
   los ejercicios en 16 semanas siguiendo el plan del curso y el calendario del
   aula. No reproduce el alcance oficial de la PEC ni el de la práctica, que
   hay que confirmar en el aula virtual.
6. **Los dos hallazgos de la ronda 12 están resueltos** (ninguno afectó al
   motor, que sigue intacto y en verde):
   - **H-1 · T4-M7 admitía respuestas numéricamente incorrectas — CERRADO.** Sus
     cuatro campos eran `number` **sin** `exact: true`, así que la tolerancia
     por defecto (1e-6 relativa) dejaba pasar `p2 = 0.0000001`,
     `p1 = 2.0000001`, `p3 = 2.800001` y `err2 = 0.8000005` (4 falsos
     positivos medidos). **Corrección aplicada el 2026-10-22 y del banco**:
     `exact: true` en `p1` y `p2`, los campos de valor entero, como ya hacen
     T4-M1, T4-E4, T5-N7 y T5-E5; `p3 = 14/5` y `err2 = 4/5` no son enteros y
     conservan la tolerancia. El arnés pasó de 58/62 con 4 discrepancias a
     **138/138 con 0 discrepancias**.
   - **H-2 · La celda de matriz es más estricta que la tolerancia declarada —
     DICTAMINADO.** Decide con 1e-8 absoluto, no con 1e-6 relativo (nota 1). Es
     una cuestión de contrato, no un defecto del motor: **se documenta y no se
     toca el motor**. Fundamento: la ventana relativa es exactamente lo que
     produjo el falso positivo cerrado en R10 (a magnitudes enormes), la celda
     ya tiene decisión exacta en cuerpos finitos F_p (su 1e-8 es el umbral del
     *fallback* numérico, no una tolerancia de diseño) y el contrato del curso
     ya distingue los dos campos: las aproximaciones van en `type: "number"`, y
     las celdas son entradas exactas. Los dos casos en juego (T4-E5 FN-03 y
     T5-M6 FP-04) se rechazan correctamente, y el arnés ya recoge ese dictamen:
     ambos están reclasificados como casos de contrato (`CON`) con veredicto
     «rechaza», de modo que la ronda 12 no deja ninguna cuestión abierta.

## 7. Estructura del proyecto

```
index.html · planificacion.html          portal y plan (calendario + 16 semanas)
temas/tema-1..5.html                     teoría + ejercicios (3 niveles)
examenes/examen-1..3.html                exámenes cronometrados
assets/js/grader.js                      motor de equivalencia (auditado)
assets/js/app.js · assets/css/           interfaz y design system
assets/data/tema-*.js · examen-*.js      banco de preguntas (verificado)
assets/animaciones/ · assets/vendor/katex/   animaciones y KaTeX offline
docs/                                    contrato, plantillas, auditorías
docs/auditoria/arbitro-ronda12-catalogo.md   catálogo de ataques de la ronda 12
docs/auditoria/arbitro-ronda12-math.md        veredicto de la ronda 12 (APTO)
scripts/                                 generadores (subtítulos, plan) con --check
verify/                                  verificaciones (sympy + adversariales)
verify/crosscheck-expected.py            contrasta los `expected` del banco con los de los scripts
verify/arbitro/ronda12/                  arnés de ataques y certificador SymPy de la ronda 12
                                        (138 casos: catálogo, barrido y sondas)
tests/grader.test.js · lint-tema.js      suite del motor y linter de los temas
```
