# Auditoría adversarial · Ronda 6 · Veredicto final · Revisión matemática

**Árbitro independiente** — Curso «Fundamentos Algebraicos para la IA» (CURSO MIMO)
Fecha: 2026-10-14 · Alcance: verificación final de las correcciones afirmadas tras la
Ronda 5 (`docs/auditoria/arbitro-ronda5-math.md`) sobre `assets/js/grader.js`,
`temas/tema-5.html`, `docs/schema.md` y el tokenizer, con batería de estabilidad
(≥250 ejecuciones/caso + medición de tasas a N=3000), verificación simbólica de la
demo de Penrose sobre ℂ y muestra final de 15 ejercicios recalculada con scripts
frescos en `verify/arbitro/ronda6/`.

Afirmaciones del equipo a verificar:
- **N9**: región de muestreo |Re|≤4.2, |Im|≤9 (cruza la rama de log/exp), ≥16 intentos,
  ≥3 puntos finitos exigidos, semilla aleatoria por llamada; O1–O5 y `log(exp(v))`
  cerrados de forma **estable**.
- **N3r**: §5.10 y demo de Prop 5.21 con \(V_r^{*}\), \(U_r^{*}\); `schema.md` con nota
  «\(V^{*}=V^{\top}\) en el caso real».
- **N5r**: parser con aplicación implícita (`senx`=`sen(x)`, `log2`=`log(2)`) y alias
  `sen`/`tg`/`arcsen`.

---

## 1. Metodología (Ronda 6)

1. **Batería N9** (`verify/arbitro/ronda6/n9-estabilidad.js`, 86 casos × 250 + 11 casos ×
   3000 = **54 500 comprobaciones**): H_LOGEXP (18 anuladores `log(exp(·))`, incluida la
   lista explícita del protocolo `0+log(exp(x))-x` y `esperado+log(exp(v))-v` sobre
   T4-N3/T5-N5/T4-M5/T1-M2), H_FIJO (O1–O5, wrap-around 9/20 vars, `1/(x-x)`, `x-y≡0`,
   anulador a ciegas), H_BRANCH (alias de rama, incl. `log(exp(4-s-t))`) y EQUIV (36
   formas equivalentes de R5 + 3 de N5r = 39). Criterio R6.1: hostiles → **siempre**
   rechazo; equivalentes → **siempre** aceptación. Segunda pasada FLAKY a **N=3000** para
   medir la tasa real de falsos positivos por llamada (grindeabilidad).
2. **Verificación simbólica N3r** (`n3-penrose.py`, 63 comprobaciones): lectura literal de
   los 3 emplazamientos corregidos + reconstrucción independiente de la SVD compacta
   sobre ℂ (5 matrices complejas 3×4, 4×2, 2×3, 3×3 rango defectuoso, 5×2) y verificación
   **exacta en sympy** de la cadena de la demo de Prop 5.21 (\(V_r^{*}V_r=I\),
   \(U_r^{*}U_r=I\), 4 ecuaciones de Penrose, \(A^{*}AA^{\dagger}=A^{*}\)); contraste con la
   fórmula antigua \(V_r\Sigma_r^{-1}U_r^{\top}\) (falla Penrose sobre ℂ).
3. **N5r** (`n5-parser.js`, 39 comprobaciones): lista explícita del protocolo
   (`senx`, `sen x`, `log2`, `tg(1)`, `sqrt4`) + aplicación implícita general + alias
   `sen`/`tg`/`arcsen` (claim) + contraste hostil (sin falsos positivos) + regresión
   sintáctica.
4. **Muestra final de 15 ejercicios** (`muestra15.py`, 42 comprobaciones): recálculo desde
   el enunciado con algoritmos propios — T1-N4, T1-M1, T1-M4, T2-N1, T2-M2, T2-E2, T3-N5,
   T3-M5, T4-N4, T4-M3, T4-M4, T5-M3, **T5-M4** (pseudoinversa de rango 1, fórmula N3r),
   X3-7, X3-10. Lista distinta de la muestra20 de R5; scripts escritos de cero.
5. **Regresión íntegra R1+R2+R5 + autores** (`regresion-r6.log`): `dump_answers.js` (111
   ejercicios), `check_tema1..5.py` + `check_examen1..3.py` (**152 campos**),
   `ataque_grader.js` (51), `ataque_grader2.js` (108), `scan_lt_gt.js`, `muestra.py`
   (57/87), `soluciones_corregidas.py` (35), `n2-escapes.js`, `n3-svd.py`, `n5-alias.js`,
   `muestra20.py` (44), `estabilidad-n1.js` (65 × 200), `tests/grader.test.js` (106),
   `tests/lint-tema.js` (5 temas × 15 ejercicios).
6. **Cero falsos positivos de esta auditoría**: cada acusación va con script reproducible;
   mis propios errores detectados y corregidos se listan en §7.

---

## 2. Estado de cada corrección afirmada

| # | Afirmación | Veredicto | Evidencia |
|---|---|---|---|
| N9 | Región \|Re\|≤4.2, \|Im\|≤9; ≥16 intentos; ≥3 puntos finitos; semilla por llamada; O1–O5 y `log(exp(v))` **estables** | **PARCIAL** — todo lo afirmado se verifica y la clase `log(exp)` queda cerrada de forma estable, **pero** la segunda mitad del hallazgo N9 («falsos positivos ocasionales grindables») sigue viva en la familia de **reglas de producto de rama** (ver **N9r**, §3) | (a) región: `grader.js:430-435` `re∈[-4.57,4.57]`, `im∈[-9.21,9.21]` tras el desplazamiento (muestreo directo de 1.2·10⁶ puntos: \|Re\|ₘₐₓ=4.570, \|Im\|ₘₐₓ=9.210; **67.2 % de los puntos tienen \|Im\|≥π** — la rama se cruza); (b) ≥16 intentos: `grader.js:439` `trials = Math.max(16, vs.length+12)` ✔; (c) ≥3 puntos finitos: `grader.js:458` `compared >= 3` ✔ (mata `1/(x-x)`); (d) semilla por llamada: `grader.js:426` `Math.random()*1000+0.12345` ✔. **Estabilidad**: los 18 casos H_LOGEXP → **0/250** y los críticos repetidos a **0/3000** (`0+log(exp(x))-x`, `esperado+log(exp(v))-v`, `log(exp(2*x))/2`); O1–O5 y O3b/P30 → **0/250**; `1/(x-x)`, J8–J10, `x-y≡0` (A1/A10) → **0/250**; `log(exp(4-s-t))` → **0/250 y 0/3000** (era 32/200 en R5). **Pero** H_BRANCH L4/L7/L8/L9/L11/L12 → falsos positivos ocasionales medidos (N9r). |
| N3r | §5.10 y demo Prop 5.21 con \(V_r^{*}\), \(U_r^{*}\); `schema.md` con nota real | **CORREGIDO** | `n3-penrose.py` 63/63. Emplazamientos: `tema-5.html:454` «\(A = U_{r}\Sigma_{r}V_{r}^{*}\), \(A^{\dagger} = V_{r}\Sigma_{r}^{-1}U_{r}^{*} \in K^{m\times n}\)» ✔; `tema-5.html:464` (demo) «Sustituyendo \(A = U_{r}\Sigma_{r}V_{r}^{*}\) y \(A^{\dagger} = V_{r}\Sigma_{r}^{-1}U_{r}^{*}\)» con cadena \(V_{r}^{*}V_{r}\), \(U_{r}^{*}U_{r}\) ✔; `schema.md:110` «SVD \(A=U\Sigma V^{*}\) (con \(V^{*}=V^{\top}\) en el caso real)» ✔. Sin restos \(\Sigma_rV_r^{\top}\)/\(\Sigma_r^{-1}U_r^{\top}\) (grep en `tema-5.html`/`schema.md`/`tema-5.js`: 0). **La demo es ahora válida sobre ℂ**: cadena exacta en sympy (2×3 compleja) y numérica en 5 formas (incl. rango defectuoso): \(AA^{\dagger}A=A\), \(A^{\dagger}AA^{\dagger}=A^{\dagger}\), \((AA^{\dagger})^{*}=AA^{\dagger}\), \((A^{\dagger}A)^{*}=A^{\dagger}A\), \(P=U_rU_r^{*}\) y \(A^{\dagger}A=V_rV_r^{*}\) hermíticas e idempotentes, \(A^{*}AA^{\dagger}=A^{*}\) (normales). Contraste: \(V_r\Sigma_r^{-1}U_r^{\top}\) **falla** Penrose en los 5 casos y en sympy — el cambio era necesario y suficiente. |
| N5r | Aplicación implícita (`senx`, `log2`) y alias `sen`/`tg`/`arcsen` | **PARCIAL** — la lista del protocolo y la aplicación implícita se verifican; **el alias `arcsen` del claim es falso** (ver **N5r-a**, §3) | `n5-parser.js`: lista R6.3 **5/5** (`senx`, `sen x`, `log2`, `tg(1)`, `sqrt4` → ACEPTA) ✔; aplicación implícita general 10/10 (`sinx`, `cosx`, `logx`, `expx`, `sqrtx`, `absx`, `conjx`, `tg1`, `senx^2`, `log2x`) ✔; alias `sen(x)`≡`sin(x)`, `tg(x)`≡`tan(x)` ✔. Contraste hostil sin falsos positivos (7/7: `senx`≢`sin(y)`, `log2`≢`log(3)`, …) ✔. **Pero** `arcsen(1)`, `arcsen(0.5)` y toda la familia `asin/acos/atan/arcsin/arccos/arctan` → **RECHAZA** (`Función desconocida: arcsen`, `grader.js:366`). |

---

## 3. Hallazgos residuales (clasificados)

### 3.1 MAYOR

| # | Localización | Qué está mal | Evidencia / cálculo | Corrección propuesta |
|---|---|---|---|---|
| N9r | `assets/js/grader.js` `equivalentExprs` (`pointFor` l. 430–435, `trials` l. 439) | **La cláusula «falsos positivos ocasionales grindables» de N9 no queda cerrada.** El muestreo nuevo mata la familia `log(exp)` (estable) y los anuladores polinómicos, pero las **identidades de producto de rama** \(\log u+\log v=\log(uv)\), \(\sqrt{uv}=\sqrt u\sqrt v\), \(\arg(uv)=\arg u+\arg v\) — falsas sobre ℂ — sobreviven con probabilidad ≈0,75 por punto (basta que \(\arg u+\arg v\in(-\pi,\pi]\)), y con **16 intentos la tasa de aceptación por llamada es ≈1 %** (0,75¹⁶≈0,01). Es grindable: `app.js:504` no deshabilita «Comprobar» y `app.js:490` marca `solved` en `localStorage` al primer verde (o un bucle en consola lo logra al instante). Ataque **universal** para cualquier ejercicio `expr`/`matrix`/`vector`/`exprset`: `esperado + log(u)+log(v)-log(u*v)` (análogo con `sqrt`), con `u`,`v` variables nuevas. | `n9-estabilidad.js` (logs: `n9-estabilidad.log`/`.json`): H_BRANCH **5 fallos en 250 runs** (L4 `log(x)+log(y)`: 1/250; L7 `sqrt(xy)`: 2/250; L8 `arg(xy)`: 3/250; L9 grind sobre **T4-N3 real**: 6/250; L11 grind sobre **T4-M5 real**: 5/250). Medición a **N=3000**: L4 **26/3000 (0,87 %/llamada)**, L7 **38/3000 (1,27 %)**, L8 **34/3000 (1,13 %)**, L9 **35/3000 (1,17 %)**, L12 **28/3000 (0,93 %)**. Misma tasa medida con el ataque fresco de R6 (§4). Contraste: la mitad `log(exp)` es **0/3000** en todos los casos — el claim es cierto en su alcance; lo que no se cierra es la clase hermana del mismo hallazgo. | Añadir a `equivalentExprs` un juego **determinista** de puntos-sonda de rama, siempre evaluados además de los aleatorios: p. ej. \(u=v=-2-5i\) (mata la regla de producto: \(\arg u+\arg v\approx-3,9<-\pi\)), \(w\) con \(\Im w=4,2\) (mata \(\log(\exp w)=w\)) y \(w\) con \(\Re w<0\) (mata \(\sqrt{w^2}=w\), \(\log(w^2)=2\log w\)); los puntos aleatorios siguen matando los anuladores polinómicos (O1–O5 ya 0/250). Alternativa: subir `trials` a ≥80 (0,75⁸⁰≈10⁻¹⁰) o comprobación estructural AST de log/sqrt/arg de productos. Regresión en `tests/grader.test.js`: `log(x)+log(y)` vs `log(x*y)`, `sqrt(x*y)`, y `E+log(u)+log(v)-log(u*v)` deben rechazar. |

### 3.2 MENOR

| # | Localización | Qué está mal | Evidencia | Corrección propuesta |
|---|---|---|---|---|
| N5r-a | `grader.js` `KNOWN_NAMES` l. 136–140 vs `FUNCS` l. 81–100 y `evalAST` l. 355–367 | El claim «alias `sen`/`tg`/`arcsen`» es **parcialmente falso**: `arcsen` (y `arcsin`, `arccos`, `arctan`, `asin`, `acos`, `atan`) está en `KNOWN_NAMES` — se tokeniza como un identificador — pero **no** está en `FUNCS` ni en `evalAST`, luego `arcsen(1)` lanza `Función desconocida: arcsen` y toda respuesta que lo use se rechaza. `sen`/`tg` sí funcionan. Impacto actual nulo: **0 usos** de trigonometría inversa en enunciados y `expected` de los 8 data files. | `n5-parser.js`: 8 rechazos (`arcsen(1)`, `arcsen(0.5)`, `arcsin(1)`, `asin(1)`, `acos(0)`, `atan(1)`, `arctan(1)`, `arccos(0)`); evaluación directa `ERR: Función desconocida: arcsen`. | Añadir `asin/acos/atan` (+ alias `arcsen/arcsin/arccos/arctan`) a `FUNCS` con rama principal (`Math.atan2`-based), o retirarlos de `KNOWN_NAMES` y documentar que no se admiten. |

### 3.3 Informativos (sin impacto)

- **i1 · comentario/behavior en tokenizer**: `grader.js:174-176` documenta «para que
  *pix* sea pi·x», pero `pix` tokeniza como `p·i·x` (y como el modo expr elimina
  espacios, `grader.js:127`, «pi x» da lo mismo) → `pix`≢`pi*x`, `πx`≢`pi*x`,
  `2πx`≢`2*pi*x`. Riesgo latente de falso negativo si un alumno escribe «2πx»; ningún
  `expected` actual usa π·variable (`2pi`, `5π/6`, `2π` sí se aceptan). Corrige el
  comentario o empareja constantes seguidas de letra con multiplicación implícita.
- **i2 · precisión del claim de región**: la caja afirmada (\|Re\|≤4.2, \|Im\|≤9) es la
  previa al desplazamiento de `pointFor` (±0.37/±0.21); la real es \|Re\|≤4.57,
  \|Im\|≤9.21. Irrelevante para la garantía (67,2 % de los puntos cruzan \|Im\|=π).
- **i3 · `FUNCS.re`/`FUNCS.im` siguen siendo código muerto** (no están en `KNOWN_NAMES`;
  `re(x)`→`r·e·(x)`), igual que en R5 §3.3. Sin efecto.

### 3.4 Abiertos, no afirmados (sin cambios respecto a R5; no bloqueantes)

- **N4**: coma decimal en celdas de rejilla (`0,5 0;0 0,25` → RECHAZA por dimensiones) —
  `schema.md` la promete. Sondeo en `regresion-r6.log`.
- **N8**: `exact:true` con `expected` no entero inaprobable (`1/2` vs `0.5` → RECHAZA).
- **m7**: tolerancia relativa 1e-6 acepta `0.0000001` como `0` en celdas (A11 → ACEPTA).

---

## 4. Ataque al muestreo — batería de estabilidad (protocolo R6.1)

`verify/arbitro/ronda6/n9-estabilidad.js` · 86 casos × 250 = 21 500 + 11 × 3000 = 33 000
(`n9-estabilidad.log`, resultados crudos en `n9-estabilidad.json`):

| Set | Casos | Resultado |
|---|---|---|
| H_LOGEXP — anuladores `log(exp(·))` (clase N9, lista explícita R6) | 18 | **18/18 OK · 0/250 en todos** — `0+log(exp(x))-x`, `esperado+log(exp(v))-v` (T4-N3, T5-N5, T4-M5, T1-M2), `log(exp(x))` vs `x`, `5+(log(exp(x))-x)²`, doble variable, etc. Repetidos a **0/3000**. **Cerrado de forma ESTABLE** ✔ |
| H_FIJO — O1–O5 (lista R6), wrap 9/20 vars, `1/(x-x)`, J8–J10, `x-y≡0`, anulador a ciegas | 17 | **17/17 OK · 0/250 en todos** ✔ |
| H_BRANCH — alias de rama | 12 | **7/12 OK** — `log(exp(4-s-t))` (lista R6) **0/250 y 0/3000** ✔ (era 32/200); `sqrt(x²)`, `log(x²)`, `log(exp(2x))/2`, `acos(cos x)` 0/250 y 0/3000 ✔. **5 FALLO (FP ocasionales)**: L4 1/250 (0,87 %/llamada a N=3000), L7 2/250 (1,27 %), L8 3/250 (1,13 %), L9 grind T4-N3 6/250 (1,17 %), L11 grind T4-M5 5/250 → **N9r** |
| EQUIV — formas equivalentes (36 de R5 + 3 de N5r) | 39 | **39/39 OK · 250/250 acepta — 0 falsos negativos ocasionales (9 750/9 750)** ✔ |

Tasas medidas (N=3000) de la familia residual: `log(x)+log(y)` 0,87 % · `sqrt(xy)`
1,27 % · `arg(xy)` 1,13 % · grind universal 0,93–1,17 % · `log(exp)` **0,000 %**.

Lectura: la mitad «falsos negativos ocasionales» del protocolo está **en verde absoluto**
(ni un solo rechazo espurio en 9 750 pruebas; un corrector estable en el sentido de
aceptación). La mitad «falsos positivos» queda **casi** verde: la clase determinista de
N9 y sus alias `log(exp)` están cerrados de forma estable (0/250 y 0/3000), pero la cola
de reglas de producto de rama conserva ~1 % de aceptación por llamada — grindeable y
aplicable a cualquier ejercicio (N9r). El protocolo R6.1 exige «SIEMPRE rechazo» para la
batería hostil; 5 de 12 casos H_BRANCH lo incumplen.

---

## 5. N3r — verificación simbólica de la demo de Penrose sobre ℂ

`verify/arbitro/ronda6/n3-penrose.py` · **63/63 OK** (`n3-penrose.log`):

1. **Emplazamientos** (8 comprobaciones de lectura literal): §5.10 y demo de Prop 5.21
   usan \(V_r^{*}\)/\(U_r^{*}\) con cadena \(V_r^{*}V_r\), \(U_r^{*}U_r\) (válida sobre ℂ);
   `schema.md` §5 con \(A=U\Sigma V^{*}\) y la nota del caso real; 0 restos de
   \(V^{\top}\) con \(\Sigma_r\).
2. **La demo es válida sobre ℂ** — reconstrucción independiente (numpy) de la SVD
   compacta en 5 formas complejas (3×4, 4×2, 2×3, 3×3 con rango defectuoso, 5×2) × 9
   comprobaciones: \(AA^{\dagger}A=A\), \(A^{\dagger}AA^{\dagger}=A^{\dagger}\),
   \((AA^{\dagger})^{*}=AA^{\dagger}\), \((A^{\dagger}A)^{*}=A^{\dagger}A\),
   \(P=U_rU_r^{*}\) y \(A^{\dagger}A=V_rV_r^{*}\) hermíticas e idempotentes,
   \(A^{*}AA^{\dagger}=A^{*}\) (última línea de la demo). Y en sympy exacto (matriz 2×3
   con entradas \(i\), \(1-i\)): la cadena completa de la sustitución, ecuación a ecuación.
3. **El cambio era necesario**: \(A^{\dagger}=V_r\Sigma_r^{-1}U_r^{\top}\) **falla** las
   ecuaciones de Penrose en los 5 casos numéricos y en el caso exacto; \(U_rU_r^{\top}\)
   no es hermítica sobre ℂ.

---

## 6. N5r y muestra de 15 ejercicios

**N5r** (`n5-parser.js`, 39 comprobaciones — log completo en `n5-parser.log`):
- Lista explícita del protocolo: **5/5 ACEPTA** (`senx`, `sen x`, `log2`, `tg(1)`,
  `sqrt4`) ✔ — el hallazgo N5r (funciones sin paréntesis) está **CORREGIDO**.
- Aplicación implícita general 10/10 ✔; contraste hostil 7/7 sin falsos positivos ✔;
  regresión sintáctica (`2x`, `xy`, `2sqrt(3)`, `5!`, `3,14`, `ln`) ✔.
- **Residual N5r-a**: `arcsen` y familia inversa → 8 rechazos (claim del equipo parcialmente
  falso). Informativo i1: `pix`/`πx` ≠ `pi*x`.

**Muestra final de 15 ejercicios** (`muestra15.py`, scripts frescos; datos de
`dump-r6.js` → `expected-r6.json`): **42/42 OK · 0 discrepancias** (`muestra15.log`).
T1-N4 (0,36̄=4/11), T1-M1 ((2+i)/(1−i)), T1-M4 (3 raíces cúbicas de 8, verificadas
\(z^3=8\)), T2-N1 (3u−2v), T2-M2 (inversa 3×3, \(AA^{-1}=I\)), T2-E2 (proyección (1,0,1),
perp (1,1,−1) ⊥ V), T3-N5 (autovalores 4,−2), T3-M5 (matriz de la forma cuadrática,
verificada \(f=x^{\top}Ax\)), T4-N4 (proy (2,2)), T4-M3 (mínimos cuadrados m=2, n=1/2 con
residual ⊥ columnas), T4-M4 (21/2), T5-M3 (σ=4,2), **T5-M4** (pseudoinversa de rango 1
\(\frac{1}{25}\begin{pmatrix}2&1\\4&2\end{pmatrix}\) con las 4 Penrose verificadas — zona
de la fórmula N3r), X3-7 (Jordan \(\begin{pmatrix}2&1\\0&2\end{pmatrix}\), defecto
geométrico 1), X3-10 (det(A²)=256, tr(A⁻¹)=1/4).

---

## 7. Regresión completa (R1 + R2 + R5 + autores) y falsos positivos descartados

| Qué | Cantidad | Resultado |
|---|---|---|
| `dump_answers.js` | 111 ejercicios | OK |
| `check_tema1..5.py`, `check_examen1..3.py` | **152 campos** | **152 OK · 0 roturas** |
| `ataque_grader.js` (R1) | 51 casos | 48 OK; A11 = **m7** (abierto, no afirmado); A16/A17 = cerrados a nivel de ejercicio (T1-N2/X1-1 siguen `text`: `222*10` → RECHAZA, `1.211e3` → RECHAZA) |
| `ataque_grader2.js` (R2) | 108 casos | 105 OK; N9b = **N4** (abierto); M1/M3 = expectativas obsoletas de mi script (`sin x`/`sinx` ahora se aceptan **por diseño** N5r) |
| `scan_lt_gt.js` + `n2-escapes.js` | 8 archivos | 0 `lt`/`gt` sueltos; 31 tokens barra doble (N2 sigue cerrado) |
| `muestra.py` (R2) | 57 ej / 87 comp | **87 OK** |
| `soluciones_corregidas.py` (R2) | 35 | **35 OK** |
| `n3-svd.py` (R5) | 13 | **13 OK** (N3 sigue cerrado) |
| `n5-alias.js` (R5) | 12 | **0 desajustes** — B1–B5 (`sen x`, `senx`, …) ahora ACEPTAN: N5r cerrado |
| `muestra20.py` (R5) | 44 | **44 OK** |
| `estabilidad-n1.js` (R5, 65×200) | 13 000 | **64/65** — H_REGION (N9 determinista) ahora 7/7 OK; el único fallo es L4 = N9r |
| `tests/grader.test.js` (autores) | 106 | **106 OK** (creció de 74 a 106; incluye regresión de `log(exp)`) |
| `tests/lint-tema.js` (autores) | 5 temas | 5/5 OK (0 errores, 15 ejercicios cada uno) |
| Batería N9 (R6) | 54 500 | 81/86 casos en la dirección correcta; 5 = N9r (§4) |
| Muestra R6 | 15 ej / 42 comp | **42 OK** |
| N3-penrose (R6) | 63 | **63 OK** |

**Falsos positivos de esta auditoría (trazabilidad):**

1. **Sonda de `arcsen` v1**: usé `G.equivalentStrings`, que **no existe** (la API exportada
   es `G.equivalent`, `grader.js:676`); el `TypeError` capturado devolvía truthy y mi sonda
   imprimía «ACEPTA» para todo (incluido `arcsen`). Detectado al contrastar con
   `G.check` (→ `ok:false`) y reescrito con la API correcta. El hallazgo N5r-a es el
   resultado real; la sonda v1 se descarta.
2. **`n3-penrose.py` v1**: `sorted(..., key=lambda z: complex(z))` no ordena complejos
   (TypeError) — bug de mi script en la sección sympy; corregido con clave
   `(Re, Im)`. 63/63 tras el fix.
3. **Expectativa `pix ≡ pi*x`** en `n5-parser.js`: basada en el comentario de
   `grader.js:174-176`, no en comportamiento verificado previo. No es una regresión (R5
   nunca lo comprobó; el comportamiento `p·i·x` es el mismo que en R5) — reclasificado
   como informativo **i1** (comentario engañoso), no como fallo del claim.

*(Los 4 falsos positivos descartados en R5 y los 6 de R2 siguen descartados.)*

---

## 8. Veredicto

## **NO APTO**

**(0 CRÍTICOS · 1 MAYOR residual · 1 MENOR nuevo + 3 abiertos no afirmados)**

El trabajo del equipo es **sustancial, preciso y verificable**, y el veredicto se decide
por un margen estrecho:

**Verificado en verde (con evidencia):**
- **N9 · alcance del claim**: la clase `log(exp(v))` queda cerrada de forma **estable** —
  0/250 y **0/3000** en `0+log(exp(x))-x`, `esperado+log(exp(v))-v` (sobre ejercicios
  reales de los 4 tipos), `log(exp(4-s-t))` (32/200 → 0/3000) — y **O1–O5, `1/(x-x)`,
  `x-y≡0` → 0/250**. La región cruza la rama (67,2 % de los puntos con \|Im\|≥π), los
  ≥16 intentos, los ≥3 puntos finitos y la semilla por llamada están en el código.
- **N3r CORREGIDO** sin restos: §5.10, demo de Prop 5.21 y `schema.md` con
  \(V_r^{*}\)/\(U_r^{*}\); la demo de Penrose es **válida sobre ℂ** (63/63, sympy exacto +
  5 formas complejas) y la fórmula antigua queda probadamente falsa (el cambio era el
  necesario).
- **N5r · aplicación implícita CORREGIDA**: `senx`, `sen x`, `log2`, `tg(1)`, `sqrt4` →
  5/5; sin falsos positivos colaterales.
- **0 falsos negativos ocasionales**: 9 750/9 750 en las 39 formas equivalentes; los 111
  ejercicios intactos (152 + 87 + 35 + 44 + 42 comprobaciones, 0 discrepancias; 106
  tests de autores OK).

**Pero, con reproducción y ataques frescos:**

1. **N9r (MAYOR)** — N9 solo cierra la mitad que el claim describe. La cláusula
   «falsos positivos ocasionales grindables» del propio título de N9 sigue viva en las
   **reglas de producto de rama**: \(\log u+\log v\) vs \(\log(uv)\) (0,87 %/llamada),
   \(\sqrt{uv}\) vs \(\sqrt u\sqrt v\) (1,27 %), \(\arg(uv)\) (1,13 %) y el **ataque
   universal** `esperado+log(u)+log(v)-log(u*v)` sobre ejercicios reales (T4-N3: 35/3000;
   T4-M5: 5/250). Un alumno puede grabar hasta el primer verde — «Comprobar» nunca se
   deshabilita (`app.js:504`) y el acierto persiste como `solved` (`app.js:490`) — o
   automatizarlo en consola. La batería hostil del protocolo exige «SIEMPRE rechazo»:
   5 de 12 casos H_BRANCH lo incumplen. Es la misma clase de defecto que N9, en su forma
   probabilística; el corrector no está en la dirección correcta de forma estable.
2. **N5r-a (MENOR)** — el claim «alias `sen`/`tg`/`arcsen`» es falso en `arcsen`: el token
   existe pero `evalAST` lo rechaza (`Función desconocida: arcsen`, y igual
   `asin/acos/atan/…`). Sin impacto en los 111 ejercicios (0 usos de trigonometría
   inversa), pero si un alumno escribe `arcsen(0.5)` obtiene un falso negativo.

El veredicto APTO exige **0 CRÍTICOS y 0 MAYORES**: queda **1 MAYOR** (N9r). Cierre
recomendado (cambio pequeño en `grader.js`):

- **N9r**: añadir a `equivalentExprs` **puntos-sonda de rama deterministas** siempre
  evaluados junto con los aleatorios — p. ej. \(u=v=-2-5i\) (mata la regla de producto),
  \(w\) con \(\Im w=4.2\) (mata \(\log(\exp w)=w\)) y \(w\) con \(\Re w<0\) (mata
  \(\sqrt{w^2}=w\), \(\log(w^2)=2\log w\)) —; los puntos aleatorios siguen matando los
  anuladores polinómicos (O1–O5 ya cerrados). Alternativa: `trials ≥ 80` o chequeo
  estructural AST. Regresión en `tests/grader.test.js` con
  `E+log(u)+log(v)-log(u*v)`, `log(x)+log(y)` y `sqrt(x*y)` (rechazo × 250).
- **N5r-a**: `asin/acos/atan` (+ alias) en `FUNCS`, o retirarlos de `KNOWN_NAMES`.
- De propina (MENORES/abiertos, no bloqueantes): i1 (comentario `pix`), N4, N8, m7.

Tras eso, una **Ronda 7** corta — reejecutar `verify/arbitro/ronda6/n9-estabilidad.js`
(los 5 casos H_BRANCH en verde) + `n5-parser.js` + la batería de estabilidad de R5 —
bastaría para el cierre.
