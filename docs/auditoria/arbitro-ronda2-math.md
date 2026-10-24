# Auditoría adversarial · Ronda 2 · Revisión matemática
**Árbitro independiente** — Curso «Fundamentos Algebraicos para la IA» (CURSO MIMO)
Fecha: 2026-10-13 · Alcance: verificación de las correcciones afirmadas tras la Ronda 1
(`docs/auditoria/arbitro-ronda1-math.md`) y **reauditura hostil completa** de
`assets/js/grader.js`, `assets/data/tema-1..5.js`, `assets/data/examen-1..3.js`,
`temas/tema-1..5.html`, `examenes/examen-1..3.html`, `docs/schema.md`.

---

## 1. Metodología (Ronda 2)

1. **Reejecución de la batería propia de la Ronda 1** (`verify/arbitro/ronda1/`) contra el
   código actual: `dump_answers.js` → 111 ejercicios; `check_tema1..5.py`,
   `check_examen1..3.py` (recálculo sympy/exacto de cada enunciado, 152 campos);
   `ataque_grader.js` (51 casos hostiles). Regresión estricta: lo que antes explotaba debe
   estar cerrado y lo que antes funcionaba no debe haberse roto (falsos negativos).
2. **Verificación uno a uno de las 15 correcciones afirmadas** (C1/C2, C3, M1–M6, m1–m6,
   m8), con evidencia reproducible.
3. **Muestra adversarial fresca** en `verify/arbitro/ronda2/muestra.py`: **57 ejercicios**
   delicados (complejos, SVD/pseudoinversa con verificación de Penrose, Jordan, QR por
   Gram–Schmidt propio, mínimos cuadrados, redondeo al par con `decimal` half-even, bases y
   subespacios, LU/LDU/Cholesky/PLU, inercia, Schur, norma espectral) resueltos **desde el
   enunciado** con algoritmos independientes: **87 comprobaciones, 0 discrepancias** con
   `answer.expected`.
4. **Soluciones corregidas paso a paso** (`verify/arbitro/ronda2/soluciones_corregidas.py`):
   T5-E3, T1-M5, X3-10, T3-N1, T1-M2, Ejemplo 9 (+ T1-N2/X1-1 en base 3/4): cada paso
   aritmético escrito se recalcula; la caracterización de \(\sqrt{z^2}\) se verifica sobre
   **20 000 puntos aleatorios** con rama principal implementada de forma independiente:
   **35 comprobaciones, 0 fallos**.
5. **Ataques nuevos al grader** (`verify/arbitro/ronda2/ataque_grader2.js`): **108 casos**
   no probados en la Ronda 1 — tipo `text` sobre specs reales, `exact`, exprset con
   duplicados, multi con campos vacíos/fantasma, matrices 1×1, `inf`/`nan`/no finitos,
   sustracción de tolerancias, `i` vs variable `i` y alias de constantes, artefactos del
   parser, y explots de muestreo.
6. **Escáner de daño colateral** (`verify/arbitro/ronda2/scan_lt_gt.js` + escaneo de
   escapes simples sobre los 8 data files) y revisión de las zonas editadas: HTML
   (balance de etiquetas y de delimitadores TeX), `tests/lint-tema.js` (5 temas),
   `tests/grader.test.js` (74 tests de los autores).
7. **Cero falsos positivos**: cada acusación de este informe viene de un cálculo o script
   reproducible. Las sospechas descartadas se listan en §5.

---

## 2. Verificación de las correcciones afirmadas

### 2.1 CRÍTICOS (Ronda 1)

| # | Afirmación | Veredicto | Evidencia |
|---|---|---|---|
| C1 | `grader.js`: ≥2 puntos finitos comparados; ya no vale `1/(x-x)` | **CORREGIDO** | `equivalentExprs` (`grader.js:400-447`) exige `compared >= 2` (l. 446) y devuelve `false` si no se comparan 2 puntos. R1 `ataque_grader.js` A6–A8 → RECHAZA ✔; R2 J8–J10 (`x*inf`, `1/(x-x)+5`, `5+0*(x-x)/(x-x)`) → RECHAZA ✔. |
| C2 | Muestreo con valores distintos por variable; ya no vale `x-y`≡0 ni `4-2*t`≡`4-s-t` | **CORREGIDO** (con salvedad del nuevo hallazgo **N1**) | `env[vs[k]] = points[(k+t)%8]` (`grader.js:428-432`): valores distintos por variable. R1 A1–A5, A9–A10 → RECHAZA ✔; R2 N1 con el spec real de T4-N3 (`4-2*t`) → RECHAZA ✔. Cuidado: el muestreo es determinista y público (**N1**, §3). |
| C3 | T5-E3: paso \(A^{\dagger}=A^{\top}(AA^{\top})^{-1}\) | **CORREGIDO** | Solución actual: «\(AA^{\top}=10I\)… \(A^{\dagger}=A^{\top}(AA^{\top})^{-1}=\tfrac{1}{10}A^{\top}\)». Recálculo paso a paso (`soluciones_corregidas.py`): \(AA^{\top}=10I\) ✔, \(A^{\top}(AA^{\top})^{-1}=\frac{1}{10}A^{\top}=\begin{pmatrix}3/10&-1/10\\1/10&3/10\end{pmatrix}\) ✔, \((AA^{\top})^{-1}A\neq A^{\dagger}\) (contraste) ✔, **4 ecuaciones de Penrose** verificadas ✔. El `expected` no cambió y sigue correcto. |

### 2.2 MAYORES (Ronda 1)

| # | Afirmación | Veredicto | Evidencia |
|---|---|---|---|
| M1 | T1-M5: caracterización precisa de \(\sqrt{z^2}\) con \(z=-i\) | **CORREGIDO** (en contenido; ver **N2** por renderizado) | Paso reescrito: «\(\sqrt{z^2}=z\) si \(\operatorname{Re}z\gt0\), o \(\operatorname{Re}z=0\) y \(\operatorname{Im}z\ge0\); en el resto \(\sqrt{z^2}=-z\) (p. ej. \(z=-i\)…)». Verificado sobre 20 000 puntos aleatorios con rama principal propia: **0 excepciones**; \(z=-i\): \(\sqrt{-1}=i=-z\) ✔. |
| M2 | Prop. 4.7: «submatrices por columnas» | **CORREGIDO** | Enunciado: «…no alteran el rango de \(C\) ni el de sus submatrices **por columnas** (en particular el de \(A\) y el de \([[A,b]]\))». Es cierto: las operaciones de fila son \(E\) invertible por la izquierda; para cualquier subconjunto de columnas \(J\), las filas de \(C_{:,J}\) sufren las mismas operaciones elementales, luego \(\operatorname{rng}(C_{:,J})\) se conserva. El contraejemplo de R1 (submatriz por filas) ya no aplica. |
| M3 | Thm 5.18: \(A=U\Sigma V^{*}\), unitarias sobre \(\mathbb{C}\) | **CORREGIDO en el teorema / PARCIAL como defecto** | El Teorema 5.18 usa ahora \(V^{*}\) y «ortogonales si \(K=\mathbb{R}\) (unitarias si \(K=\mathbb{C}\))» ✔ coherente con Def. 5.20 (\(A^{\dagger}=V\Sigma^{\dagger}U^{*}\)) ✔. **Pero la misma fórmula falsa sobre \(\mathbb{C}\) persiste** en el resumen de `tema-5.js` (2 veces), la demostración de Prop. 5.21 y otros sitios — ver **N3**. |
| M4 | `choice` estricto `/^\d+$/` | **CORREGIDO** | `grader.js:581-585`. R1 A13 (`1abc`) y A14 (`2.9`) → RECHAZA ✔; R2 M10 (`+1`) → RECHAZA ✔. |
| M5 | T1-N2 y X1-1 pasan a tipo `text` | **CORREGIDO** | `tema-1.js` `T1-N2` → `{type:"text", expected:"2220"}`; `examen-1.js` `X1-1` → `{type:"text", expected:"1211"}`. R2 E1–E12 con specs reales: `2220`/`1211` ACEPTA; `222*10`, `2.220e3`, `1.211e3`, `01211`, `1 211`, dígitos unicode → RECHAZA ✔. `app.js:376` renderiza `text` como campo de texto ✔. Pasos de las soluciones (divisiones sucesivas) recalculados: \(78=2220_3\), \(101=1211_4\) ✔. |
| M6 | `tema-2.js`: hipótesis «para vectores reales» en el coseno | **CORREGIDO** | Resumen: «…**para vectores reales** \(\cos(u,v)=\frac{u^{\top}v}{\|u\|\|v\|}\); \(u\perp v\iff u^{*}v=0\)». |

### 2.3 MENORES (Ronda 1)

| # | Afirmación | Veredicto | Evidencia |
|---|---|---|---|
| m1 | X3-10: signo del producto | **CORREGIDO** | Solución: \((2\cdot2\cdot(-1)\cdot4)^{2}=(-16)^{2}=256\). \(2\cdot2\cdot(-1)\cdot4=-16\) ✔; recíprocos y traza \(\frac12+\frac12-1+\frac14=\frac14\) ✔. |
| m2 | T3-N1: «fórmula del determinante de orden 2» | **CORREGIDO** | Texto actual: «Aplicamos la fórmula del determinante de orden 2»; sin mención a Sarrus ✔; \(3\cdot4-1\cdot2=10\) ✔. |
| m3 | T1-M2: «condiciones» en vez de «cotas» | **PARCIAL** | Paso 2 corregido («Las condiciones del ángulo son…») ✔, pero el paso 3 conserva «donde **esas cotas** corresponden a \(\theta=\frac{5\pi}{6}\)» — residuo del término erróneo (ver **N6**). Matemática de la solución correcta (recalculada: \(|z|=2\), \(\cos\theta=-\frac{\sqrt3}{2}\), \(\operatorname{sen}\theta=\frac12\), \(\theta=\frac{5\pi}{6}\)). |
| m4 | Ejemplo 9 sin \(8^{1/3}\) como conjunto | **CORREGIDO** | Ahora: «las raíces cúbicas de \(8\)… \(\{2,-1+\sqrt3 i,-1-\sqrt3 i\}=\{z\in\mathbb{C}:z^{3}=8\}\)». Las 3 raíces verificadas (\((-1\pm\sqrt3 i)^3=8\)) y exhaustividad vía `sympy.roots` ✔; \((1+i)^8=16\) ✔. |
| m5 | `<`/`>` escapados a `\lt`/`\gt` | **NO CORREGIDO — regresión (N2)** | En HTML se usó `&lt;`/`&gt;`/`\lt` (correcto), pero en los **8 data files .js** se escribió `\lt`/`\gt` con **barra simple**; JavaScript elimina la barra en escapes no reconocidos, y el runtime contiene `lt`/`gt` literales: KaTeX renderiza **letras**, no el signo. **31 tokens** corruptos (ver **N2**). El `<` crudo de la Ronda 1 renderizaba bien en JS; la «corrección» lo ha empeorado. |
| m6 | Polinomio característico unificado a \(\det(\lambda I-A)\) | **CORREGIDO** | Búsqueda sobre teoría + datos: todas las apariciones de \(P_A\) usan \(\det(\lambda I-A)\) o forma factorizada; los usos restantes de \((A-\lambda I)\) son legítimos (cadenas de Jordan y \(\ker(A-\lambda I)^{j}\)). |
| m7 | Tolerancia en celdas de matriz / `exact` (no se afirmó corregido) | **ABIERTO (residual)** | R1 A11 sigue: celda `0.0000001` aceptada por `0` (tol 1e-6). R2 K1–K8 documenta el comportamiento: `1+1e-9`≈`1`, `5e-7`≈`0`, `1000000+0.4`≈`1000000` (tolerancia relativa con `scale≥1`). Sin impacto en los `expected` actuales (ninguno supera 256). |
| m8 | `schema.md` actualizado | **CORREGIDO con residual** | IDs `X{k}-1…X{k}-12` ✔, \(A\in K^{n\times m}\) ✔, tipos `text` y `exact` documentados ✔, regla `\lt`/`\gt` ✔. **Residual**: §5 aún fija «SVD \(A=U\Sigma V^{\top}\)» (ver **N3**). |

---

## 3. Hallazgos nuevos (reauditura hostil)

### 3.1 MAYOR

| # | Localización | Qué está mal | Evidencia / cálculo | Corrección propuesta |
|---|---|---|---|---|
| N1 | `assets/js/grader.js` · `equivalentExprs` (puntos hardcodeados l. 416–425; env l. 428–432) | **Explot de muestreo: falsos positivos deliberados para cualquier ejercicio `expr`, `matrix`, `vector` o `exprset`.** Los 8 puntos de muestreo son **fijos, públicos y deterministas**; una expresión que se anule en ellos (o que iguale la esperada solo ahí) aprueba cualquier respuesta falsa. Variante 2: con **≥9 variables libres**, `env[k]=points[(k+t)%8]` hace que las variables de índice \(k\) y \(k+8\) reciban el **mismo valor siempre**, reabriendo el exploit \(a-b\equiv0\) de la Ronda 1 (C2) con variables inventadas. | `ataque_grader2.js` O1–O5 → **ACEPTAN** (deben rechazar). O1–O2: \(v(x)=\prod_{t=0}^{7}\big(x-p_t\big)\) con \(p_t\) los 8 puntos complejos del código: \(v(p_t)=0\) en los 8 muestreos, luego `5+v(x)` ≡ `5` y `v(x)` ≡ `0` pasan como válidos. O3: `4-s-t+0*(v1+…+v6)+(s-v7)` con orden de inserción \(s=0,\ t=1,\ v1..v6=2..7,\ v7=8\): \(\mathrm{env}[s]=\mathrm{env}[v7]=p_t\ \forall t\), luego \(s-v7\equiv0\) y la respuesta falsa pasa para `4-s-t` (T4-N3). O4 (celda de matriz) y O5 (exprset de T4-M5 con `i+v(x)`) también pasan. | Generar los puntos **aleatoriamente en cada comprobación** (semilla por intento), o usar 1 evaluación simbólica (p. ej. expandir/simplificar diferencia con `math.js`/CAS); limitar el número de variables libres de la respuesta al de la esperada y muestrear sin colisiones (sin `%`). |
| N2 | `assets/data/tema-1..5.js`, `examen-1..3.js` — escapado `\lt`/`\gt` (m5) | **El fix de m5 está mal aplicado en JS y corrompe el renderizado de 31 fórmulas** (incluido el propio contenido corregido de M1 y el enunciado de T5-M1). En una cadena JS, `\l` no es escape válido: `"…\lt…"` produce `…lt…` en runtime. KaTeX recibe `lt`/`gt` y renderiza las **letras** \(l\cdot t\) / \(g\cdot t\) en vez de \(\lt/\gt\). | `node verify/arbitro/ronda2/scan_lt_gt.js`: **31 apariciones** en runtime (`\operatorname{Re} z gt  0` en T1-M5; `\lambda_{1}lt \lambda_{2}` en el enunciado de T5-M1; `0 \le a_i lt  b` en el resumen de T1; `jlt k` en Gram–Schmidt de T2; `25gt 0`, `1lt 2`, etc.). Escaneo de escapes simples: los 8 data files contienen `\lt`/`\gt` de barra simple (31 tokens). Contraste: en los `.html` se usó `&lt;`/`&gt;`/`\lt`, que sí renderizan bien. | En los `.js`, escribir `\\lt` / `\\gt` (barra doble en el fuente) o `&lt;`/`&gt;` — 27 líneas afectadas. Añadir a `tests/lint-tema.js` una comprobación de escapes. |
| N3 | `assets/data/tema-5.js` (resumen l. 17 y 18; mapa l. 98); `temas/tema-5.html` (Prop. 5.21 demo, §5.9/5.10, tabla l. 110); `docs/schema.md` §5 | **M3 solo se corrigió en el Teorema 5.18: la fórmula \(A=U\Sigma V^{\top}\) (falsa sobre \(\mathbb{C}\)) y \(A^{\dagger}=V\Sigma^{-1}U^{\top}\) siguen en el resumen del alumno y en la demostración de la Prop. 5.21, donde además se afirma que \(U_rU_r^{\top}\) es «hermítica e idempotente» — falso sobre \(\mathbb{C}\).** | Contraejemplo computado (`node -e`, §2 del script de ataque): \(U=\frac{1}{\sqrt2}\begin{pmatrix}1&i\\i&1\end{pmatrix}\) es unitaria (\(UU^{*}=I\) ✔), pero \(P=UU^{\top}=\begin{pmatrix}0&i\\i&0\end{pmatrix}\) cumple \(P^{*}=\begin{pmatrix}0&-i\\-i&0\end{pmatrix}\neq P\) (**no hermítica**) y \(P^{2}=-I\neq P\) (**no idempotente**). Además \(U\Sigma V^{\top}\neq A\) para \(A\) compleja en general (basta \(A=V^{*}\), \(\Sigma=I\), \(U=I\): da \(V^{\top}\neq V^{*}\)). | Unificar a \(A=U\Sigma V^{*}\) («\(U,V\) ortogonales en \(\mathbb{R}\), unitarias en \(\mathbb{C}\)») en: resumen y mapa de `tema-5.js`, demo de Prop. 5.21 (\(P=U_rU_r^{*}\), \(A^{\dagger}A=V_rV_r^{*}\)), tabla de factorizaciones y `schema.md` §5. |

### 3.2 MENOR

| # | Localización | Qué está mal | Evidencia / cálculo | Corrección propuesta |
|---|---|---|---|---|
| N4 | `grader.js` `parseMatrixText` (l. 473) vs `docs/schema.md` («coma o punto decimal: `3,14`=`3.14`») | La **coma decimal no funciona en celdas de matriz/vector**: la coma es separador de celdas. `0,5` en una 1×1 da «Dimensiones incorrectas». El `expr`/`number` sí aceptan coma (R1 B3/B17). | `ataque_grader2.js` N9b (spec real de T5-N5 con `0,5 0;0 0,25`) → RECHAZA con error de dimensiones; N9 con puntos (`0.5 0;0 0.25`) → ACEPTA. | Antes de separar celdas, convertir `\d,\d` → `\d.\d` (como ya hace `normalizeInput` en modo expr), o documentar en `schema.md` que en la rejilla solo vale el punto. |
| N5 | `grader.js` tokenizer (`KNOWN_NAMES`, l. 134–139, y comentario l. 170) | Funciones **sin paréntesis** se descomponen en producto de letras: `sin x` → `s·i·n·x` (el comentario dice «"sinx" → sin·x», pero el código hace lo contrario: exige que el carácter siguiente **no** sea letra). En español, `sen(...)`/`tg(...)` → «Función desconocida». Falso negativo para entradas naturales (ningún `expected` actual usa sen/cos, así que el impacto real es bajo). | `ataque_grader2.js` M1/M3 (`sin x`, `sinx` vs `sin(x)`) → RECHAZA; M2 (`sin(x)`) → ACEPTA. | Admitir identificador de función seguido de letra (`sinx` → `sin(x)`), añadir alias `sen`→`sin`, `tg`→`tan`, y corregir el comentario. |
| N6 | `assets/data/tema-1.js` · `T1-M2`, `solution[2]` | Residual de m3: tras cambiar el paso 2 a «Las condiciones…», el paso 3 conserva «donde **esas cotas** corresponden a \(\theta=\frac{5\pi}{6}\)». | Texto literal de la solución (ver §2.3). | Cambiar «esas cotas» por «esas condiciones» / «esos valores». |
| N7 | `temas/tema-4.html` · Thm 4.8 (Rouché–Frobenius), demostración (3) | Errata: «Si \(r = r \lt m\)…» — «\(r = r\)» es un artefacto (debía ser \(r=\operatorname{rng}(A)=\operatorname{rng}([[A,b]])\lt m\) o solo \(r\lt m\)). | Línea 198 de `tema-4.html`. | Reescribir la hipótesis del caso (3). |
| N8 | `grader.js` · API de `check` | (a) `exact:true` con `expected` **no entero** es imposible de aprobar: `numberMatches` exige `Number.isInteger(z.re)` (`grader.js:518-520`), luego ni siquiera `0.5` pasa para `{expected:"1/2", exact:true}`. Los 44 usos actuales son todos enteros (verificado), es una **trampa latente**. (b) Alias asimétricos del imaginario: `i`, `I`, `j` valen \(+i\), pero `J` es variable libre (N8c). (c) `multi` ignora silenciosamente campos extra (H6). | `ataque_grader2.js` F9 (imposible de aprobar), N8b/N8c, H6. | Permitir en `exact` cualquier `w.re === z.re` exacto; añadir `J` a `CONSTS` (o no); rechazar campos extra en `multi`. |

### 3.3 Sin hallazgo: zonas revisadas sin daño
- **HTML de temas y exámenes**: balance de etiquetas 0 errores; delimitadores TeX `\(...\)`/`\[...\]` balanceados en los 5 temas (528/528, 335/335, 490/490, …); `tests/lint-tema.js`: 5/5 OK (15 ejercicios cada uno).
- **`tests/grader.test.js`**: 74/74 OK (regresión de los autores intacta).
- **T5-E3** (hint y solución), **T1-M5** (contenido), **X3-10**, **T3-N1**, **T1-M2** (matemática), **Ejemplo 9**, **T1-N2/X1-1**: todo el contenido corregido recalculado sin errores matemáticos.
- **Falsos negativos**: ninguna de las 18 formas equivalentes de la Ronda 1 (`1/2`≡`0.5`, `2i`≡`2*i`, coma decimal en `expr`, `π`, matrices, conjuntos en cualquier orden, factorial, `2^3^2`, …) se ha roto: R1 sección B 18/18 ✔ y R2 L/M/N sin regresiones.

---

## 4. Cuenta de verificación

| Qué | Cantidad | Resultado |
|---|---|---|
| Batería Ronda 1 (regresión) · campos recalculados | 152 (111 ejercicios) | **152 OK · 0 roturas** |
| Batería Ronda 1 · ataques al grader | 51 casos | 48 cerrados/OK; A11 = m7 residual (no afirmado); A16/A17 cerrados a nivel de ejercicio (tipo `text`) |
| Muestra adversarial fresca R2 | **57 ejercicios** (87 comprobaciones) | **87 OK · 0 `expected` erróneos** |
| Soluciones corregidas paso a paso (T5-E3, T1-M5, X3-10, T3-N1, T1-M2, Ejemplo 9, T1-N2, X1-1) | 35+ comprobaciones + 20 000 puntos de la caracterización de \(\sqrt{z^2}\) | **0 fallos matemáticos** |
| Ataques nuevos al grader R2 | **108 casos** | 102 OK · **6 desajustes** (O1–O5 = N1; N9b = N4) |
| Escapes `\lt`/`\gt` corruptos (N2) | 31 tokens / 27 líneas / 8 archivos | Todos renderizan mal |
| Residuos de M3 (N3) | 6 localizaciones | Fórmula falsa sobre \(\mathbb{C}\) persiste |
| HTML / lint / tests de autores | 8 HTML, 5 lints, 74 tests | Todo OK |
| Falsos positivos de esta auditoría | — | Descartados 6 tras verificar (§5) |

---

## 5. Falsos positivos descartados (trazabilidad)

1. `tema-1.html:84` «llaves desbalanceadas» en \(A=\{B : B\) / \(\}\): es composición tipográfica **deliberada** de un ejemplo de condición mal formada (partida en prosa). Descartado.
2. `ataque_grader2.js` K7 (`0.250001` vs `1/4`): estaba **exactamente en el borde** de la tolerancia (\(10^{-6}\le10^{-6}\)); no es un fallo del grader. Corregido a `0.250002` (rechaza) + K7b documenta el borde.
3. Caso N8 original (`I;-J`): mi error de test — `J` (mayúscula) es variable libre, solo `j` es alias. Reescrito como `I;-j` (acepta) + N8c documenta la asimetría como N8 (menor).
4. `X3-5` «D=diag(2,1,1)»: error de transcripción mío; el dato del curso (`diag(2,1,3)`) es el correcto y \(LDL^{\top}=A\) se verifica.
5. `T4-M2`/`X2-12` «QR incorrecto»: bug de orientación en **mi** Gram–Schmidt de `muestra.py`; corregido, QR del curso coincide y \(QR=A\).
6. Dump `expected.json` con «\(\lambda_{1}lt\lambda_{2}\)» en T5-M1: parecía errata del extractor; al verificar el runtime con Node se confirmó que es un **fallo real** (N2), no del dump.

---

## 6. Veredicto

## **NO APTO**

Las correcciones afirmadas son **ciertas en su mayoría**: C1–C3 **CORREGIDOS**, M1, M2, M4, M5, M6 **CORREGIDOS**, y los menores m1, m2, m4, m6, m8 corregidos (m3 PARCIAL). Los 111 `answer.expected` siguen siendo matemáticamente correctos (152 campos de regresión + 87 comprobaciones de muestra, todo OK) y **no hay falsos negativos nuevos**.

Pero la reauditoria hostil detecta, con cálculo reproducible:

1. **N1 (MAYOR)** — el muestreo fijo y público de `equivalentExprs` permite **falsos positivos deliberados** en cualquier ejercicio de expresión/matriz/vector/conjunto (O1–O5 del script de ataque los reproducen) y, con ≥9 variables, reabre una variante del exploit \(x-y\equiv0\) de la Ronda 1. El contrato de evaluación no es fiable frente a un alumno que mire el fuente.
2. **N2 (MAYOR, regresión introducida por las correcciones)** — el fix de m5 (`\lt`/`\gt`) está mal aplicado en los 8 data files JS: **31 fórmulas** (incluida la solución corregida de T1-M5 y el enunciado de T5-M1) se renderizan con las letras `lt`/`gt` en vez de los signos \(<,>\). Antes de la corrección se veían bien.
3. **N3 (MAYOR)** — M3 está solo a medias: la SVD \(U\Sigma V^{\top}\) y la pseudoinversa \(V\Sigma^{-1}U^{\top}\) siguen en el **resumen del alumno** (`tema-5.js`) y en la demostración de la Prop. 5.21 (que además afirma, en falso sobre \(\mathbb{C}\), que \(U_rU_r^{\top}\) es hermítica e idempotente: contraejemplo \(U=\frac{1}{\sqrt2}[[1,i],[i,1]]\) calculado).

Hasta corregir N1–N3 (y, de propina, los menores N4–N8 y el residual m7), el curso no puede entregarse como «perfecto». Cierre recomendado: (a) muestreo aleatorio por comprobación (o verificación simbólica) + restricción de variables; (b) `\\lt`/`\\gt` en los `.js` (27 líneas) y regla de lint; (c) unificar SVD/pseudoinversa a \(V^{*}\) en resumen, Prop. 5.21 y `schema.md`. Tras eso, una **Ronda 3** corta de regresión con `verify/arbitro/ronda1+ronda2` bastaría para el cierre.
