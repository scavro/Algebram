# Auditoría adversarial · Ronda 1 · Revisión matemática
**Árbitro independiente** — Curso «Fundamentos Algebraicos para la IA» (CURSO MIMO)
Fecha: 2026-10-13 · Alcance: `temas/tema-1..5.html`, `assets/data/tema-1..5.js`,
`assets/data/examen-1..3.js`, `assets/js/grader.js`, contrastado con
`CURSO CHATI/revision/principal-limpio.txt` (fuente).

---

## 1. Metodología

1. **Recálculo independiente de los 111 ejercicios** (75 de temas + 36 de exámenes).
   Scripts propios escritos desde el enunciado (sin copiar los `verify/` de los autores)
   en `verify/arbitro/ronda1/`:
   - `dump_answers.js` — extrae `answer.expected` de los 8 data files a `expected.json`.
   - `check_tema1.py` … `check_tema5.py`, `check_examen1.py` … `check_examen3.py` —
     resuelven **cada** ejercicio con sympy / aritmética exacta (raíces de polinomios,
     sistemas, inversas, SVD/Gram–Schmidt/Cholesky por algoritmos propios, proyecciones,
     autovalores, pseudoinversa con verificación de Penrose, conversiones de base por
     divisiones sucesivas, redondeo al par, etc.) y comparan contra `expected.json`.
   - `ataque_grader.js` — 45 casos hostiles contra el motor de respuesta.
   152 comprobaciones de campo (los `multi` tienen varios campos) sobre 111 ejercicios.
2. **Soluciones paso a paso**: revisadas las 111 soluciones completas (todos los pasos
   aritméticos recalculados a mano) y, en la teoría, los enunciados de los **54 bloques
   `.plaque--thm`**, los **44 `.plaque--def`** y las **92 fórmulas display** (`\[...\]`)
   de los 5 temas.
3. **Ataque al grader** con Node sobre `assets/js/grader.js`: falsos positivos
   (coeficiente, signo, dimensión, identidades falsas), falsos negativos (formas
   equivalentes: `1/2` vs `0.5`, `2i` vs `2*i`, `π`, coma decimal, `1/sqrt(2)` vs
   `sqrt(2)/2`, orden de conjuntos, matrices con entradas equivalentes), y exploits
   de muestreo/tolerancia/parseo.
4. **Fidelidad al temario**: ≥15 contrastes con `principal-limpio.txt` (series de
   Taylor, Euler, Rouché–Frobenius, LU y menores, Cholesky, Sylvester (inercia y
   criterio), espectrales, Jordan, SVD, Penrose, Cauchy–Schwarz, teorema del rango,
   convención de formato \(A\in K^{n\times m}\)). Búsqueda de erratas conocidas
   (series de la p.48 impresa que en la fuente empiezan en \(n=1\)).
5. **Coherencia interna**: notación \(m,n\), \(\top\) vs \(*\), hipótesis de los
   enunciados, convención de «menores principales», IDs y esquema.

Los scripts de los autores (`verify/*-verify.py`) se ejecutaron **solo como contraste**
(todos dicen OK; mis recálculos independientes coinciden en los `expected`, luego las
respuestas oficiales son correctas, pero eso no exime a las soluciones ni al grader).

---

## 2. Hallazgos

### 2.1 CRÍTICO

| # | Archivo / localización | Qué está mal | Evidencia | Corrección propuesta |
|---|---|---|---|---|
| C1 | `assets/js/grader.js` · `equivalentExprs` (≈l. 400–435) | **Acepta `1/(x-x)` como respuesta válida de cualquier ejercicio** tipo `expr`, `matrix`, `vector` o `exprset`. El muestreo evalúa toda variable en el **mismo punto**; si la expresión no es finita en los 7 puntos, el bucle hace `continue` y al final devuelve `true` sin haber comparado. | `verify/arbitro/ronda1/ataque_grader.js` casos A6–A8 y prueba adicional: `check({expr, expected:"4/11"}, "1/(x-x)")` → `ok:true`; lo mismo para `T1-M1`, `T4-N3`, celdas de `T2-N1`, `T2-N2` y conjuntos de `T1-M4` (solo `number` se libra, porque evalúa sin entorno). | Si **todas** las evaluaciones dan no-finito, devolver `false`; y muestrear **cada variable en puntos distintos** (o añadir 1 punto con valores distintos por variable y un chequeo simbólico de diferencia). |
| C2 | `assets/js/grader.js` · `equivalentExprs` | **Falsos positivos sistemáticos por poner todas las variables en el mismo punto**: `x-y` ≡ `0`, `x^2-y^2` ≡ `0`, `sin(x)-sin(y)` ≡ `0`, `y^2` ≡ `x^2`, y en el ejercicio real `T4-N3` la respuesta falsa `4-2*t` se acepta para `4-s-t`. | `ataque_grader.js` A1–A5, A9–A10: todos → `ACEPTA`. Contraste con sympy: `4-2*t ≠ 4-s-t` como polinomios. | Muestrear \(x,y,\ldots\) en valores **distintos** (p. ej. env\[v\_k\] = punto\_k). |
| C3 | `assets/data/tema-5.js` · `T5-E3` (pseudoinversa de \(\begin{pmatrix}3&1\\-1&3\end{pmatrix}\)), `solution[1]` | **Igualdad falsa en la solución**: escribe \(A^{\dagger}=(AA^{\top})^{-1}A=\tfrac{1}{10}A^{\top}\). La expresión intermedia es falsa: \((AA^{\top})^{-1}A=\tfrac{1}{10}A=\begin{pmatrix}3/10&1/10\\-1/10&3/10\end{pmatrix}\neq A^{\dagger}\). La fórmula general correcta (que es la de la propia teoría, Def. 5.20) es \(A^{\dagger}=A^{\top}(AA^{\top})^{-1}\) o \((A^{\top}A)^{-1}A^{\top}\). El `answer.expected` final \(\tfrac{1}{10}A^{\top}\) sí es correcto. | `verify/arbitro/ronda1/check_tema5.py` (sección T5-E3): `(AA^T)^-1·A = [[3/10, 1/10], [-1/10, 3/10]]`, `A^daga = [[3/10, -1/10], [1/10, 3/10]]`, `coincide: False`. Además \(A^\top=\begin{pmatrix}3&-1\\1&3\end{pmatrix}\neq A\). | Reescribir el paso: \(A^{\dagger}=(A^{\top}A)^{-1}A^{\top}=\tfrac{1}{10}A^{\top}\) (o \(A^{\top}(AA^{\top})^{-1}\)), sin cambiar el `expected`. |

### 2.2 MAYOR

| # | Archivo / localización | Qué está mal | Evidencia | Corrección propuesta |
|---|---|---|---|---|
| M1 | `assets/data/tema-1.js` · `T1-M5`, `solution[2]` | La caracterización «\(\sqrt{z^2}=z\) solo cuando \(z\) está en el **semiplano derecho cerrado**, y \(\sqrt{z^2}=-z\) cuando está en el semiplano izquierdo» admite (y sugiere) la lectura «\(\iff \operatorname{Re} z\ge 0\)», que es **falsa** en el eje imaginario negativo. | Contraejemplo: \(z=-i\) está en el semiplano derecho cerrado (\(\operatorname{Re} z=0\)) y \(\sqrt{z^2}=\sqrt{-1}=i=-z\neq z\). La clasificación exacta: \(\sqrt{z^2}=z \iff \operatorname{Re}z>0\) ó (\(\operatorname{Re}z=0\land\operatorname{Im}z\ge 0\)); \(\sqrt{z^2}=-z\) en el resto. | Precisar el eje imaginario: «\(\sqrt{z^2}=z\) si \(\operatorname{Re}z>0\), o \(\operatorname{Re}z=0\) con \(\operatorname{Im}z\ge 0\); \(\sqrt{z^2}=-z\) en el resto (p. ej. \(z=-i\))». |
| M2 | `temas/tema-4.html` · Proposición 4.7 | «Las operaciones elementales de fila […] no alteran el rango de **ninguna submatriz por filas** de \(C\)» es **falsa** literalmente; la demostración solo cubre el rango de la matriz completa. (La fuente, p.156, hace el mismo exceso: «no alteran los rangos de las submatrices de \(C\)».) | Contrajemplo: \(C=\begin{pmatrix}2&0\\-2&0\end{pmatrix}\) y \(F_2\leftarrow F_2+F_1\) da \(\begin{pmatrix}2&0\\0&0\end{pmatrix}\); la submatriz formada por la fila 2 pasa de rango 1 a rango 0. Lo que sí es cierto: no se altera el rango de \(C\) ni el de sus submatrices **por columnas** (p. ej. \(A\) y \([[A,b]]\)). | Reescribir: «…no alteran el rango de \(C\) ni el de ninguna submatriz por **columnas** (en particular el de \(A\) y el de \([[A,b]]\))». |
| M3 | `temas/tema-5.html` · Teorema 5.18 (SVD) y §5.9–5.10 | La SVD se enuncia como \(A=U\Sigma V^{\top}\) sobre \(K\in\{\mathbb{R},\mathbb{C}\}\) con \(U,V\) «ortogonales». Sobre \(\mathbb{C}\) la fórmula es **falsa**: debe ser \(A=U\Sigma V^{*}\) con \(U,V\) **unitarias**. Incoherente además con la Def. 5.20 del propio curso, que usa \(A^{\dagger}=V\Sigma^{\dagger}U^{*}\). (El origen es la notación `A>` de la fuente = transpuesta conjugada, mal traducida a `\top`.) | Def. 2.19 distingue ortogonal/unitaria y usa \(*\); Def. 5.20 usa \(U^{*}\); Thm. 5.18 y el resumen usan \(V^{\top}\). Para \(A\in\mathbb{C}^{2\times2}\) no hermítica, \(U\Sigma V^{\top}\neq A\) en general. | En 5.18: \(A=U\Sigma V^{*}\) («\(U,V\) ortogonales si \(K=\mathbb{R}\), unitarias si \(K=\mathbb{C}\)»), o restringir el teorema a \(K=\mathbb{R}\). |
| M4 | `assets/js/grader.js` · `check`, tipo `choice` | `parseInt` laxo: `1abc` se marca como opción 1 y `2.9` como opción 2. Cualquier basura que empiece por el dígito del índice correcto se acepta. | `ataque_grader.js` A13–A14: ambos → `ACEPTA`. | Validar con `/^\d+$/` (o comparar con `Number(answer)` exacto). |
| M5 | `assets/data/tema-1.js` `T1-N2`, `assets/data/examen-1.js` `X1-1` | El enunciado pide «solo la secuencia de cifras» pero el tipo es `expr`, que compara **valor numérico**: se aceptan `222*10` (para `2220`) y `1.211e3` (para `1211`), que no son la secuencia de cifras pedida. | `ataque_grader.js` A16–A17: ambos → `ACEPTA`. | Tipo específico de cadena de dígitos (o `expr` con validación `/^[0-9]+$/`), o cambiar el enunciado a «el valor del número». |
| M6 | `assets/data/tema-2.js` · `summary` (Definiciones clave) | El resumen da \(\cos(u,v)=\frac{u^{\top}v}{\|u\|\|v\|}\) **sin la hipótesis «caso real»** (la teoría, §2.5, sí la pone), y en el mismo punto mezcla \(\top\) con \(*\) (\(u\perp v\iff u^{*}v=0\)). Sobre \(\mathbb{C}\) la fórmula del coseno con producto traspuesto es falsa (debe usarse \(\operatorname{Re}(u^{*}v)\)). | `temas/tema-2.html`: «En el caso real, el triángulo anterior es rectángulo y se obtiene…» — la hipótesis existe en teoría pero no en el resumen del data. Contrajemplo: \(u=v=(1,i)\): \(u^{\top}v=0\) daría cos = 0, ángulo \(\pi/2\), cuando \(u=v\). | Añadir «(para vectores reales)» en el resumen y usar \(u^{*}v\) de forma uniforme. |

### 2.3 MENOR

| # | Archivo / localización | Qué está mal | Evidencia | Corrección propuesta |
|---|---|---|---|---|
| m1 | `assets/data/examen-3.js` · `X3-10`, `solution[0]` | Producto tipografiado con signo de más: «\((-2\cdot 2\cdot(-1)\cdot 4)^2=(-16)^2=256\)». El producto **escrito** vale \(16\), no \(-16\); el resultado final (256) es correcto porque se eleva al cuadrado. | \(-2\cdot2\cdot(-1)\cdot4=16\); el producto de autovalores \(2\cdot2\cdot(-1)\cdot4=-16\). Contraste en `check_examen3.py`. | Escribir \((2\cdot 2\cdot(-1)\cdot 4)^2=(-16)^2\). |
| m2 | `assets/data/tema-3.js` · `T3-N1`, `solution[0]` | «la regla del sarrus simplificada para matrices de orden 2»: la regla de Sarrus es solo para \(3\times3\); en \(2\times2\) es la fórmula del determinante. | — | «Aplicamos la fórmula del determinante de orden 2». |
| m3 | `assets/data/tema-1.js` · `T1-M2`, `solution[1]` | «Las cotas del ángulo son \(\cos\theta=…\) y \(\operatorname{sen}\theta=…\)»: no son cotas, son los valores del coseno y el seno. | — | «Las condiciones son…» / «Debe cumplirse…». |
| m4 | `temas/tema-1.html` · Ejemplo 9 | \(8^{1/3}=\{2,-1+\sqrt3 i,-1-\sqrt3 i\}\): abuso de notación; \(8^{1/3}=2\) es un número, no un conjunto. | — | «Las raíces cúbicas de 8 son \(2,\,-1\pm\sqrt3 i\)». |
| m5 | `temas/tema-1.html` (varios: Def. 1.7, 1.10, Prop. 1.10, …) | `<` sin escapar dentro de TeX (`0 \le a_i < b`, `r^2 < 2`, …): HTML no válido estrictamente; los navegadores lo toleran porque `<` va seguido de espacio. | Detección por script sobre `\(…\)`. | Usar `\lt` o `&lt;`. |
| m6 | Teoría vs ejercicios (p. ej. `T5-N1`, `X3-7` vs Def. 3.15) | \(P_A\) se define como \(\det(\lambda I-A)\), pero algunos ejercicios escriben \(\det(A-\lambda I)\). Coinciden en raíces (difieren en signo para \(n\) impar), pero es notación mixta. | `tema-3.html` Def. 3.15 frente a `tema-5.js` T5-N1. | Unificar a \(\det(\lambda I-A)\). |
| m7 | `assets/js/grader.js` · tipos `matrix`/`vector` | Sin opción `exact`: una celda `0.0000001` se acepta por `0` (tol 1e-6 relativa). | `ataque_grader.js` A11 → `ACEPTA`. | Añadir `exact` para celdas, o bajar tolerancia en campos de datos exactos. |
| m8 | `docs/schema.md` §2/§5 vs contenido | El esquema fija IDs de examen `X{k}-1…X{k}-11` (11 preguntas) y notación \(A\in\mathbb{R}^{m\times n}\); los exámenes tienen 12 preguntas (`X1-12`…) y el curso usa \(A\in K^{n\times m}\) (como la fuente, \(n\) filas, \(m\) columnas). El contenido es **internamente coherente**; lo desactualizado es el esquema. | `dump_answers.js`: 12 preguntas/examen. Tema 3 Def. 3.3 y Thm. 3.12 usan \(n\)=filas. | Actualizar `schema.md`. |

---

## 3. Cuenta de verificación

| Qué | Cantidad | Resultado |
|---|---|---|
| Ejercicios recalculados desde cero (sympy/exacto) | **111** (75 temas + 36 exámenes) | **111 correctos** · **0** con `answer.expected` erróneo |
| Comprobaciones de campo (multi-campos incluidos) | 152 | 152 OK |
| Soluciones paso a paso revisadas (todos los pasos) | 111 | 107 sin tacha · **1 con igualdad falsa (T5-E3)** · **1 con caracterización engañosa (T1-M5)** · **2 con errata menor (X3-10, T3-N1)** |
| Teoría: enunciados `.plaque--thm` + `.plaque--def` + fórmulas display | 54 + 44 + 92 | **3 defectos** (Prop. 4.7 falsa literalmente; Thm. 5.18 falso sobre \(\mathbb{C}\); resumen T2 sin hipótesis) + 3 menores |
| Contrastados con la fuente `principal-limpio.txt` | 15 enunciados/resultados | Fieles. **Errata p.48 (series desde \(n=1\)) NO propagada** — el curso usa \(n=0\) correctamente; sí se propagó el exceso de la Prop. 4.7 («submatrices de \(C\)») |
| Ataques al grader | 45 casos + exploit universal | **15 desajustes**: 2 CRÍTICOS (C1–C2), 2 MAYORES (M4–M5), 2 MENORES (tolerancia, bool laxo documentado); 0 falsos negativos (todas las formas equivalentes probadas se aceptan) |
| Falsos positivos de esta auditoría | — | Se descartaron 5 sospechas tras verificar: fórmula de Penrose del Ejemplo 5.9 (\(A^2=5A\) ✓), «menores principales» = líderes según la fuente (criterio de Sylvester correcto), coseno real en la teoría ✓, \(m\)/\(n\) coherentes con la fuente ✓, `X3-6` (incógnitas \((n,m)\) ✓). |

---

## 4. Veredicto

## **NO APTO**

Motivo: hay hallazgos **CRÍTICOS** (C1–C2: el grader acepta respuestas falsas de forma universal y sistemática; C3: igualdad falsa en la solución de T5-E3) y **MAYORES** (M1–M6: caracterización engañosa de \(\sqrt{z^2}\), Proposición 4.7 falsa en su literalidad, Teorema de la SVD falso sobre \(\mathbb{C}\), grader engañable en `choice` y en secuencias de cifras, hipótesis ausente en el resumen del tema 2).

Los **111 `answer.expected` son matemáticamente correctos** — el contenido está bien calculado —, pero el contrato de evaluación se rompe: con `1/(x-x)` un alumno aprueba cualquier ejercicio de tipo expresión/matriz/vector/conjunto, y dos afirmaciones matemáticas impresas son falsas en su lectura natural. Hasta corregir C1–C3 y M1–M6, el curso no puede entregarse como «perfecto».

*Recomendación de cierre: arreglar C1–C2 con muestreo por variables distintas + rechazo de no-finitos; corregir la fórmula de T5-E3; reescribir M1–M3, M6; endurecer `choice` y el tipo de secuencias de cifras. Tras eso, conviene una ronda 2 centrada en el motor (tests de regresión con los casos de `ataque_grader.js`).*
