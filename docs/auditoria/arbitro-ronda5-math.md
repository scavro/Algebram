# Auditoría adversarial · Ronda 5 · Verificación final · Revisión matemática
**Árbitro independiente** — Curso «Fundamentos Algebraicos para la IA» (CURSO MIMO)
Fecha: 2026-10-14 · Alcance: verificación final de las correcciones afirmadas tras las
Rondas 1–2 (`docs/auditoria/arbitro-ronda1-math.md`, `arbitro-ronda2-math.md`) sobre
`assets/js/grader.js`, los 8 `assets/data/*.js`, `temas/tema-*.html` y `docs/schema.md`,
con batería de estabilidad del muestreo aleatorio (≥200 ejecuciones por caso) y
muestra final de 20 ejercicios recalculada con scripts propios.

Afirmaciones del equipo a verificar:
- **N1**: `grader.js` con muestreo aleatorio por llamada (semilla nueva por check),
  valor distinto por variable, ≥10 intentos, ≥2 puntos finitos exigidos.
- **N2**: `\\lt`/`\\gt` (barra doble) en los 8 data `.js`.
- **N3**: `tema-5.js` resumen con \(A=U\Sigma V^{*}\), \(A^{\dagger}=V\Sigma^{-1}U^{*}\),
  \(\sigma_i=\sqrt{\lambda_i(A^{*}A)}\); Prop 5.21 de `tema-5.html` con \(U_rU_r^{*}\), \(V_rV_r^{*}\).
- **N5/N6/N7**: alias `sen`/`tg`, «condiciones», typo Thm 4.8.

---

## 1. Metodología (Ronda 5)

1. **Reejecución íntegra de las baterías propias de R1+R2** (`verify/arbitro/ronda1/` y
   `verify/arbitro/ronda2/`) contra el código actual: `dump_answers.js` → 111 ejercicios;
   `check_tema1..5.py` + `check_examen1..3.py` (152 campos recalculados con sympy);
   `ataque_grader.js` (51 casos); `ataque_grader2.js` (108 casos); `scan_lt_gt.js`;
   `muestra.py` (57 ejercicios / 87 comprobaciones); `soluciones_corregidas.py` (35).
   Regresión estricta: lo que antes explotaba debe estar cerrado; lo que antes
   funcionaba no debe haberse roto. Log completo: `verify/arbitro/ronda5/regresion-r1-r2.log`.
2. **Batería de estabilidad del muestreo** (`verify/arbitro/ronda5/estabilidad-n1.js`):
   **65 casos × 200 = 13 000 comprobaciones** en 4 sets — H_FIJO (18 exploits clásicos de
   puntos fijos A*/O*/J*), H_REGION (7 anuladores de región, ataque fresco), H_BRANCH
   (4 alias de rama log/sqrt), EQUIV (36 formas equivalentes, incluidas 10 con variables).
   Criterio del protocolo R5.2: resultado **siempre** estable y en la dirección correcta.
3. **Auditoría de escapes** (`n2-escapes.js`): contaje en fuente (`\\lt` barra doble vs
   `\lt` suelto) y en runtime (operadores KaTeX vs letras `lt`/`gt` desnudas) en los 8
   data files; más `scan_lt_gt.js` de R2 sobre TeX.
4. **Verificación simbólica de N3** (`n3-svd.py`): mapa de emplazamientos \(V^{\top}\)/\(V^{*}\)
   en `tema-5.js` (runtime), `tema-5.html` y `schema.md`; y verificación **independiente**
   en sympy de \(A=U\Sigma V^{*}\), \(A^{\dagger}=V\Sigma^{-1}U^{*}\) (4 ecuaciones de
   Penrose), \(\sigma_i=\sqrt{\lambda_i(A^{*}A)}\), \(P=U_rU_r^{*}\), \(A^{\dagger}A=V_rV_r^{*}\),
   con contraste de la fórmula antigua \(V\Sigma^{-1}U^{\top}\) (falla Penrose sobre ℂ) y el
   contraejemplo de \(U_rU_r^{\top}\) (no hermítica, no idempotente).
5. **N5** (`n5-alias.js`): alias `sen`/`tg` + funciones sin paréntesis. **N6/N7**: lectura
   literal de `tema-1.js:312-313` y `temas/tema-4.html:197`.
6. **Muestra final de 20 ejercicios** (`muestra20.py`, 44 comprobaciones): recálculo desde
   el enunciado con algoritmos propios (Gram–Schmidt, Penrose, solve, bases sucesivas,
   inercia, proyección ortogonal, caracterización de \(\sqrt{z^2}\) sobre 5000 puntos),
   incluidas las fórmulas tocadas por las correcciones (T1-M5, T1-M2, T5-E3, T5-M1,
   T1-N2/X1-1, T4-N3, T5-N5, X3-10, X3-12).
7. **Cero falsos positivos**: cada acusación viene de un script reproducible en
   `verify/arbitro/ronda5/`. Los errores de mis propios scripts detectados y corregidos
   durante la auditoría se listan en §7 (no son defectos del curso).

---

## 2. Estado de cada corrección afirmada

| # | Afirmación | Veredicto | Evidencia |
|---|---|---|---|
| N1 | Muestreo aleatorio por llamada, valor distinto por variable, ≥10 intentos, ≥2 puntos finitos | **PARCIAL** — las 4 propiedades se verifican; **la clase de explot de N1 no queda cerrada** (ver **N9**, §3) | (a) semilla nueva por llamada: `grader.js:419` `seed = Math.random()*1000+0.12345` dentro de `equivalentExprs`; la variabilidad inter-llamadas queda demostrada empíricamente por los casos L1/L2/L4 (§4: 32/200, 1/200, 12/200 — imposible con puntos fijos). (b) valor distinto por variable: `grader.js:433` `env[vs[k]] = pointFor(k,t)` con \(k\) y \(t\) en el hash; O3/O3b (wrap-around 9 y 20 variables) → 0/200 ✔. (c) ≥10 intentos: `grader.js:429` `trials = Math.max(10, vs.length+6)` ✔. (d) ≥2 puntos finitos: `grader.js:448` `return compared >= 2`; J8–J10 → 0/200 ✔. O1–O5 (anulador de los 8 puntos fijos de R2) → 0/200 ✔ (explot original cerrado). **Pero** el contrato sigue siendo engañable de forma determinística (**N9**) y los alias de rama producen falsos positivos ocasionales (L1: 32/200 en el spec real de T4-N3) — protocolo R5.2 incumplido. |
| N2 | `\\lt`/`\\gt` (barra doble) en los 8 data `.js` | **CORREGIDO** | `n2-escapes.js`: 31 tokens `\\lt`/`\\gt` en fuente (3+1+2+4+7+2+7+5), **0** restos `\lt`/`\gt` de barra simple; runtime: 31 operadores `\lt`/`\gt`, **0** letras `lt`/`gt` desnudas en TeX; `scan_lt_gt.js` → 0 ocurrencias. KaTeX recibe los operadores. Sin regresiones en HTML (m5: `&lt;`/`&gt;` intactos). |
| N3 | `tema-5.js` resumen \(A=U\Sigma V^{*}\), \(A^{\dagger}=V\Sigma^{-1}U^{*}\), \(\sigma_i=\sqrt{\lambda_i(A^{*}A)}\); Prop 5.21 con \(U_rU_r^{*}\), \(V_rV_r^{*}\) | **PARCIAL** — lo afirmado es **verificado**, pero la unificación de N3 está incompleta (ver **N3r**, §3) | Afirmando exactamente lo dicho: `tema-5.js` resumen l. 17–18 (`A=U\Sigma V^{*}` con «ortogonales si \(K=\mathbb{R}\) (unitarias si \(K=\mathbb{C}\))», \(A^{\dagger}=V\Sigma^{-1}U^{*}\)) ✔, l. 30 y mapa l. 97 (\(\sigma_i=\sqrt{\lambda_i(A^{*}A)}\)) ✔, mapa l. 95/98 (\(V^{*}\)) ✔; `tema-5.html` Prop 5.21: \(P = U_rU_r^{*}\) y \(A^{\dagger}A = V_rV_r^{*}\), «hermíticas e idempotentes» ✔ (l. 464, tramo final). Verificado además simbólicamente (`n3-svd.py`, 13/13): \(U_rU_r^{*}\) hermítica e idempotente; \(U_rU_r^{\top}\) NO (contraejemplo \(U=\frac{1}{\sqrt2}[[1,i],[i,1]]\)); \(A^{\dagger}=V\Sigma^{-1}U^{*}\) cumple Penrose sobre ℂ y \(V\Sigma^{-1}U^{\top}\) la falla; \(\sigma_i=\sqrt{\lambda_i(A^{*}A)}=\{3,1\}\) ✔. **Pero** persiste \(V^{\top}\) en §5.10 y en la sustitución de la demo de Prop 5.21 y en `schema.md` §5 (emplazamientos incluidos en la lista de cierre de N3) — ver **N3r**. |
| N5 | Alias `sen`/`tg` | **PARCIAL** — los alias se verifican; persiste la otra mitad de N5 (funciones sin paréntesis) | `n5-alias.js`: `sen(x)`≡`sin(x)`, `tg(x)`≡`tan(x)`, `sen(0.5)`, `tg(pi/4)`, `sen(pi/6)` → 6/6 ACEPTA ✔. Pero `sen x`, `senx`, `sinx`, `sin x`, `cosx` siguen descomponiéndose en producto de letras y se **rechazan** frente a `sin(x)`/`cos(x)` (5 falso negativos — era parte del hallazgo N5 y de su propuesta de cierre «admitir identificador de función seguido de letra»). Residual **MENOR** (N5r), sin impacto en los `expected` actuales (ninguno exige escribir funciones sin paréntesis). |
| N6 | T1-M2 «condiciones» en vez de «cotas» | **CORREGIDO** | `tema-1.js:312-313`: paso 2 «Las condiciones del ángulo son \(\cos\theta=-\frac{\sqrt3}{2}\) y \(\operatorname{sen}\theta=\frac12\)»; paso 3 «donde **esas condiciones** corresponden a \(\theta=\frac{5\pi}{6}\)». Sin restos de «esas cotas» (el único «cota» restante es «no tiene cota mínima» de T1 sobre ℚ, terminología correcta). Matemática re-verificada en `muestra20.py` (\(|z|=2\), \(\arg z = 5\pi/6\)) ✔. |
| N7 | Thm 4.8 (Rouché–Frobenius) typo «\(r = r \lt m\)» | **CORREGIDO** | `temas/tema-4.html:197` caso (3): «Es compatible indeterminado … si y solo si \(\operatorname{rng}(A) = \operatorname{rng}([[A, b]]) = r \lt m\); en ese caso las soluciones forman un subespacio afín de dimensión \(m-r\)» — hipótesis coherente, sin artefacto «\(r=r\)»; demo (3) y casos (1)/(2) re-leídos, correctos. |

---

## 3. Hallazgos residuales (clasificados)

### 3.1 MAYOR

| # | Localización | Qué está mal | Evidencia / cálculo | Corrección propuesta |
|---|---|---|---|---|
| N9 | `assets/js/grader.js` · `equivalentExprs` (`pointFor` l. 420–428: región de muestreo \(\lvert\Im z\rvert\le 2.61\lt\pi\); sin restricción de variables libres de la respuesta) | **Residual de la clase de N1: falsos positivos deliberados para cualquier ejercicio `expr`, `matrix`, `vector` o `exprset`.** El muestreo aleatorio derrota a los anuladores *puntuales* (polinomios), pero todos los puntos posibles caen en la banda \(\lvert\Im z\rvert\lt\pi\), donde \(\operatorname{Log}(\operatorname{Exp}(z))=z\). Un alumno que mire el fuente envía `esperado + log(exp(v)) − v` (con \(v\) una variable nueva: no hay límite de variables libres de la respuesta, `grader.js:405`) y la respuesta **falsa** pasa **siempre**. Variante flaky: alias de rama p. ej. `log(exp(4-s-t))` para `4-s-t` (T4-N3) se acepta con probabilidad ≈0.16 por intento y es **grindeable** (el botón «Comprobar» permite reintentos: `app.js` `grade()` no lo deshabilita). | `estabilidad-n1.js` set H_REGION (**7/7 falso positivo ESTABLE, 200/200 acepta**): `5+log(exp(x))-x`≡`5`; `4-s-t+log(exp(s))-s`≡`4-s-t` (spec real T4-N3); celda de matriz `log(exp(x))-x`≡`0`; exprset T4-M5 `i+log(exp(x))-x`≡`i`; `log(exp(x))`≡`x`; `log(exp(x))-x`≡`0`. Set H_BRANCH (**falsos positivos OCASIONALES**, el caso que prohíbe el protocolo R5.2): `log(exp(4-s-t))` vs T4-N3 → **32/200 acepta**; `log(x)+log(y)` vs `log(x*y)` → 12/200; `sqrt(x^2)` vs `x` → 1/200. Causa raíz verificada por muestreo directo: 0 de 100 000 puntos de `pointFor` cumplen \(\lvert\Im z\rvert\ge\pi\) (`estabilidad-n1.log`, E-§ de `node -e` previo). El comentario `grader.js:402` («imposible de engañar con un polinomio anulador conocido de antemano») sobrevalora la garantía: solo cierra anuladores polinómicos. | Muestrear fuera de la banda: p. ej. \(\Im z\in\pm(0.21\ldots4.5)\) con alguna muestra de \(\lvert\Im\rvert\gt\pi\) (mata E\* y L\* de un golpe); y/o limitar las variables libres de la respuesta a las de `expected`; y/o 1 comprobación simbólica de la diferencia. Añadir a `tests/grader.test.js` los casos `log(exp(x))-x` y `log(exp(4-s-t))` como regresión. |
| N3r | `temas/tema-5.html:454` (§5.10), `temas/tema-5.html:464` (demo Prop 5.21, tramo de sustitución), `docs/schema.md:110` (§5) | **N3 solo se corrigió en parte: la fórmula \(V^{\top}\), falsa sobre \(K\supseteq\mathbb{C}\), persiste en (a) la frase puente de §5.10 «Con la SVD compacta \(A = U_{r}\Sigma_{r}V_{r}^{\top}\), definimos \(A^{\dagger} = V_{r}\Sigma_{r}^{-1}U_{r}^{\top} \in K^{m\times n}\)» — con \(\in K^{m\times n}\) explícito; (b) la sustitución de la demo de Prop 5.21 («Sustituyendo \(A = U_r\Sigma_r V_r^{\top}\) y \(A^{\dagger}=V_r\Sigma_r^{-1}U_r^{\top}\)…» con cadena \(V_r^{\top}V_r=I\), \(U_r^{\top}U_r=I\), inválidas sobre ℂ); y (c) `schema.md` §5 «SVD \(A=U\Sigma V^{\top}\)». Los tres emplazamientos estaban en la lista de cierre de N3 («§5.9/5.10», «demo de Prop 5.21», «schema.md §5»). | `n3-svd.py` §(1): 8 apariciones de \(V^{\top}\) con contexto \(K\) en `tema-5.html:454,464` + `schema.md:110` (las de l. 425/430 son ejemplos/nota en matrices **reales**, correctas). Contraste interno: la misma §5.10 afirma2 líneas más abajo \(A^{\dagger}=V\Sigma^{\dagger}U^{*}\) (Def 5.20, correcta) y Thm 5.18 usa \(V^{*}\); la conclusión de la demo ya usa \(P=U_rU_r^{*}\), \(A^{\dagger}A=V_rV_r^{*}\) ✔. Por tanto la demo queda **interna e inconsistente** y su primer tramo es falso sobre ℂ. `n3-svd.py` §(2): \(V\Sigma^{-1}U^{\top}\) **falla** las 4 ecuaciones de Penrose sobre ℂ (contraste computado) mientras \(V\Sigma^{-1}U^{*}\) las cumple. | Unificar a \(A=U_r\Sigma_r V_r^{*}\), \(A^{\dagger}=V_r\Sigma_r^{-1}U_r^{*}\) en §5.10 y en la sustitución de la demo (la cadena pasa a \(V_r^{*}V_r=I\), \(U_r^{*}U_r=I\)) y actualizar `schema.md` §5. Son 2 frases + 1 doc. |

### 3.2 MENOR

| # | Localización | Qué está mal | Evidencia | Corrección propuesta |
|---|---|---|---|---|
| N5r | `grader.js` tokenizer (`KNOWN_NAMES` l. 136–139) | Función sin paréntesis sigue descomponiéndose en letras: `sen x`/`senx`/`sinx`/`sin x`/`cosx` → falso negativo frente a `sin(x)`/`cos(x)` (parte no cubierta de N5). | `n5-alias.js` B1–B5: 5 rechazos. | Admitir identificador de función seguido de letra (`sinx`→`sin(x)`) o documentar que exige paréntesis. |
| N4 | `grader.js` `parseMatrixText` (abierto, no afirmado) | La coma decimal no funciona en celdas de rejilla (la coma separa celdas); `schema.md` promete `3,14`=`3.14`. | `regresion-r1-r2.log` sondeo: T5-N5 con `0,5 0;0 0,25` → RECHAZA por dimensiones (mismo resultado que R2 N9b). | Convertir `\d,\d`→`\d.\d` antes de separar celdas, o documentar la excepción. |
| N8 | `grader.js` `numberMatches`/API `check` (abierto, no afirmado) | (a) `exact:true` con `expected` no entero imposible de aprobar (`1/2` vs `0.5` → RECHAZA, trampa latente); (b) `multi` ignora campos extra; (c) alias `J`. | Sondeo N8a → RECHAZA; `ataque_grader2.js` F9/H6 sin cambios. | Permitir igualdad exacta real en `exact`; rechazar campos extra. |
| m7 | tolerancia `nearlyEqual` (abierto, no afirmado) | Celda `0.0000001` aceptada por `0` (tol 1e-6 relativa). | Sondeo m7/A11 → ACEPTA (igual que R1 A11 y R2 K1–K8). | Tol absoluta cerca de 0 o `exact` en celdas. |

### 3.3 Informativo (sin impacto)
- `grader.js` `FUNCS.re`/`FUNCS.im` son **código muerto**: `re`/`im` no están en `KNOWN_NAMES`, así que `re(x)` se tokeniza como \(r\cdot e\cdot(x)\) y `im(x)` como \(i\cdot m\cdot x\) (esto hizo rechazar un primer borrador de mi ataque E2, §7). Sin efecto en los ejercicios.

---

## 4. Ataque al muestreo aleatorio — estabilidad (protocolo R5.2)

`verify/arbitro/ronda5/estabilidad-n1.js` · 65 casos × 200 = 13 000 comprobaciones
(`estabilidad-n1.log`, resultados crudos en `estabilidad-n1.json`):

| Set | Casos | Resultado |
|---|---|---|
| H_FIJO — exploits de puntos fijos (A1–A10, O1–O5, O3b 20 vars, J8–J10, P30 anulador a ciegas) | 18 | **18/18 OK · 0/200 acepta en todos** — el explot de N1 (puntos fijos públicos) está cerrado y es estable |
| H_REGION — anuladores `log(exp(v))−v` (ataque fresco) | 7 | **7/7 FALLO · 200/200 acepta** — falso positivo **determinístico** sobre cualquier ejercicio expr/matrix/vector/exprset (N9) |
| H_BRANCH — alias de rama (L1 `log(exp(4-s-t))` en T4-N3, L2 `sqrt(x^2)`, L3 `log(x^2)`, L4 `log(x)+log(y)`) | 4 | **3/4 FALLO · falsos positivos OCASIONALES**: L1 32/200, L2 1/200, L4 12/200 (L3 0/200) — literalmente los «falsos positivos ocasionales» que el protocolo prohíbe |
| EQUIV — formas equivalentes (B1–B17, D1–D5, reordenamientos de T4-N3, `exp(log(x))`, `(x^2-1)/(x-1)`, `conj(xy)`, identidades trig/hiperbólicas, alias `sen`/`tg`, multi T1-M2, matrices) | 36 | **36/36 OK · 200/200 acepta — 0 falsos negativos ocasionales** (7200/7200) |

Lectura: la mitad «falsos negativos ocasionales» del protocolo está **en verde** (ninguna
forma equivalente flaquea ni una sola vez). La mitad «falsos positivos ocasionales» **no**:
además de la cola flaky (L\*), existe una clase de falsos positivos **estables** (H_REGION)
que deja el contrato de evaluación tan expuesto como lo describía N1.

---

## 5. Regresión completa (R1 + R2 + autores)

| Qué | Cantidad | Resultado |
|---|---|---|
| `dump_answers.js` | 111 ejercicios (75 drills + 36 preguntas) | OK |
| `check_tema1..5.py`, `check_examen1..3.py` (recálculo de los `expected`) | **152 campos** | **152 OK · 0 roturas** |
| `ataque_grader.js` (R1) | 51 casos | 48 OK; A11 = m7 (abierto, no afirmado); A16/A17 = cerrados a nivel de ejercicio (T1-N2/X1-1 ahora `text`, verificado: `222*10` → RECHAZA) |
| `ataque_grader2.js` (R2) | 108 casos | 107 OK; N9b = N4 (abierto, no afirmado). O1–O5 ahora RECHAZAN ✔ |
| `scan_lt_gt.js` (R2) | TeX de los 8 archivos | **0** ocurrencias `lt`/`gt` sin barra |
| `muestra.py` (R2) | 57 ejercicios / 87 comprobaciones | **87 OK · 0 discrepancias** |
| `soluciones_corregidas.py` (R2) | T5-E3, T1-M5, X3-10, T3-N1, T1-M2, Ejemplo 9, T1-N2, X1-1 | **35 OK · 0 fallos** (incl. 20 000 puntos de \(\sqrt{z^2}\)) |
| `tests/grader.test.js` (autores) | 74 | 74 OK |
| `tests/lint-tema.js` (autores) | 5 temas | 5/5 OK (0 errores, 15 ejercicios cada uno) |
| **Muestra final R5** (`muestra20.py`, 20 ejercicios) | **44 comprobaciones** | **44 OK · 0 discrepancias** |
| Batería de estabilidad R5 | 13 000 | 55/65 OK · 10 fallos concentrados en N9 (§4) |

### Muestra final de 20 ejercicios (fórmulas tocadas incluidas)
T1-N2 (78=2220₃), T1-M2 (\(|z|=2\), \(\arg z=5\pi/6\) — **N6**), T1-M5 (falsedad de
\(\sqrt{z^2}=z\) + caracterización re-verificada en 5000 puntos — **M1**), T1-E1 (93/8),
T2-N4 (\(7\), \(3\sqrt2\)), T2-E2 (proyección (1,0,1), perp (1,1,−1)), T3-N1 (10 — **m2**),
T3-N3 (−6, −1/2), T4-N3 (\(4-s-t\) — **N1/N9**), T4-M2 (QR), T4-E2 (rangos 1 y 2), T5-E3
(\(A^{\dagger}=\frac{1}{10}A^{\top}\) + 4 Penrose + falsedad de \((AA^{\top})^{-1}A\) — **C3/N3**),
T5-M1 (\(\lambda=3,4\), \(P\), \(PDP^{-1}=A\) — enunciado con \(\lambda_1\lt\lambda_2\) — **N2**),
T5-N5 (\(\mathrm{diag}(1/2,1/4)\)), T5-E4 (inercia 2+/1−), X1-1 (101=1211₄ — **M5**), X1-7
(\(2/5+11/5\,i\)), X2-12 (QR), X3-10 (256, 1/4 — **m1**), X3-12 (\(A^{\dagger}\), \(x=A^{\dagger}b\)
+ normales). **0 discrepancias** con los `expected`; la matemática de los enunciados
tocados por las correcciones está sana (la única zona de fórmulas con problemas es la de
**N3r**: \(V^{\top}\) en §5.10/demo/schema).

---

## 6. Cuenta de verificación

| Qué | Cantidad | Resultado |
|---|---|---|
| Correcciones afirmadas verificadas | 6 (N1, N2, N3, N5, N6, N7) | 3 CORREGIDAS (N2, N6, N7) · 3 PARCIALES (N1, N3, N5) |
| Hallazgos residuales | 2 MAYORES (N9, N3r) · 3 MENORES (N5r, N4, N8) + m7 + 1 informativo | ver §3 |
| Comprobaciones de regresión (R1+R2+autores) | 152 + 51 + 108 + 87 + 35 + 74 + 5 | todo OK salvo los abiertos documentados |
| Comprobaciones de estabilidad (R5) | 13 000 | 55/65 casos estables y correctos; 10 en la dirección equivocada (N9) |
| Muestra final (R5) | 20 ejercicios / 44 comprobaciones | 44 OK |
| Falsos positivos de esta auditoría | — | 4 descartados/corregidos en mis scripts (§7); 0 acusaciones sin reproducir |

---

## 7. Falsos positivos descartados (trazabilidad)

1. **`n3-svd.py` v1**: mi matriz de prueba \(V=\frac{1}{\sqrt2}[[1,-i],[i,1]]\) **no era
   unitaria** (verificado a mano: \(V^{*}=V\), \(V^{2}\neq I\)), de donde 4 «fallos»
   espurios (Penrose, hermiticidad, \(\sigma_i\)). Corregido a \(V=\frac{1}{\sqrt2}[[1,1],[i,-i]]\)
   (unitaria comprobada) → 13/13 OK. No era un defecto del curso.
2. **`muestra20.py` v1**: comparación de \(\texttt{solve}\) con símbolos \(y,z\) frente a \(s,t\)
   en T4-N3 → «falso fallo» mío. Corregido con `.subs({y:s, z:t})` → 44/44 OK.
3. **Contaje de N2 v1**: `grep -F '\lt'` encuentra la subcadena dentro de `\\lt`, y mis
   patrones de barras venían mal calibrados por quoting; el contaje de 31 «bug» era en
   realidad el fix. Resuelto con contaje por nodos (`n2-escapes.js`): 31 fix, 0 bug.
4. **Ataque E2** (`5+arg(exp(x))-im(x)`): rechazado, pero **no** porque el grader detecte
   el truco, sino porque `re`/`im` no son identificadores reconocidos (§3.3). Descartado
   como evidencia; la variante válida (`log(exp(x))-x`) sí reproduce (E1/E8).

*(Los 6 falsos positivos descartados en R2 siguen descartados.)*

---

## 8. Veredicto

## **NO APTO**

**(0 CRÍTICOS · 2 MAYORES residuales · 3 MENORES abiertos)**

El trabajo del equipo es **sustancial y verificable**: N2, N6 y N7 están **CORREGIDOS** sin
restos; de N1 se verifican las cuatro propiedades del nuevo muestreo y el explot original
(O1–O5 y variantes) queda cerrado de forma **estable** (0/200 en 18 casos); de N3 se
verifican todas las fórmulas afirmadas (resumen, mapa, \(\sigma_i=\sqrt{\lambda_i(A^{*}A)}\),
\(P=U_rU_r^{*}\), \(A^{\dagger}A=V_rV_r^{*}\)) y la verificación simbólica independiente de
\(V\Sigma^{-1}U^{*}\) es **13/13**; de N5 se verifican los alias `sen`/`tg`. Las 111
respuestas esperadas siguen matemáticamente intactas (152 + 87 + 35 + 44 comprobaciones,
0 discrepancias) y **no hay ni un solo falso negativo ocasional en 7200 pruebas de formas
equivalentes**.

Pero, con reproducción y ataques frescos:

1. **N9 (MAYOR)** — el contrato de evaluación **sigue sin ser fiable frente a un alumno que
   mire el fuente**: toda la región de muestreo posible cumple \(\lvert\Im z\rvert\lt\pi\),
   donde \(\log(\exp(v))=v\), de modo que `esperado + log(exp(v)) − v` aprueba **cualquier**
   ejercicio `expr`/`matrix`/`vector`/`exprset` de forma **determinística** (200/200 en los
   7 ataques H_REGION) y los alias de rama dan **falsos positivos ocasionales** (32/200 en
   el ejercicio real T4-N3) — exactamente el fenómeno que el protocolo de esta ronda
   declaraba inaceptable. Es la misma clase de defecto que N1, un nivel más arriba en
   sofisticación.
2. **N3r (MAYOR)** — N3 está a medias: \(A=U\Sigma V^{\top}\) (falsa sobre \(K\supseteq\mathbb{C}\))
   y \(A^{\dagger}=V\Sigma^{-1}U^{\top}\) siguen en la **definición puente de §5.10**
   («\(\in K^{m\times n}\)») y en la **sustitución de la demostración de la Prop 5.21**
   (cuya cadena usa \(V_r^{\top}V_r=I\), inválida sobre ℂ), además de `schema.md` §5 —
   tres emplazamientos que estaban en la lista de cierre de N3.

El veredicto APTO exige **0 CRÍTICOS y 0 MAYORES**: hay 2 MAYORES. Cierre recomendado
(ambos cambios son pequeños):

- **N9**: ampliar la banda imaginaria del muestreo más allá de \(\pm\pi\) (p. ej. \(\pm 4.5\))
  y/o limitar las variables libres de la respuesta a las de `expected`; regresión con
  `log(exp(x))-x` y `log(exp(4-s-t))` en `tests/grader.test.js`.
- **N3r**: \(V^{*}\) en `tema-5.html:454`, en la sustitución de la demo de Prop 5.21 y en
  `schema.md` §5 (2 frases + 1 doc).
- De propina (MENORES, no bloqueantes): N5r (`sinx`→`sin(x)`), N4 (coma decimal en rejilla),
  N8 (`exact` con no enteros), m7 (tolerancia en celdas).

Tras eso, una **Ronda 6** corta de regresión con `verify/arbitro/ronda1+ronda2+ronda5`
(batería de estabilidad incluida) bastaría para el cierre.
