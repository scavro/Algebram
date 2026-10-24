# Auditoría adversarial · Ronda 7 · Veredicto final · Revisión matemática

**Árbitro independiente** — Curso «Fundamentos Algebraicos para la IA» (CURSO MIMO)
Fecha: 2026-10-14 · Alcance: verificación de las correcciones afirmadas tras la Ronda 6
(`docs/auditoria/arbitro-ronda6-math.md`) sobre `assets/js/grader.js` — puntos-sonda
fijos de rama (cierre de **N9r**) y trigonometría inversa (cierre de **N5r-a**) — con
batería de ramas a ≥300 runs/caso, 39 formas equivalentes a ≥100 runs/caso, contraste
de trig inversa con sympy/mpmath y recálculo independiente de 10 ejercicios con scripts
frescos en `verify/arbitro/ronda7/`.

Afirmaciones del equipo a verificar:
- **N9r**: `equivalentExprs` evalúa SIEMPRE 5 puntos-sonda FIJOS de rama
  (−2.37−5.11i, 1.23+4.2i, −3.1+0.4i, 0.7−7.3i, −1.7+2.6i) además de los aleatorios;
  cualquier diferencia en un sonda → rechazo determinista.
- **N5r-a**: `asin/arcsin/arcsen/acos/arccos/atan/arctan/arctg` implementadas por rama
  principal.

---

## 1. Metodología (Ronda 7)

1. **Batería de ramas** (`verify/arbitro/ronda7/bateria-r7.js`, 66 casos =
   **15 900 runs**): re-ejecución íntegra de la batería R6 — H_LOGEXP (7
   anuladores `log(exp(·))`), H_FIJO (O1–O5, wrap-around, `1/(x-x)`, `x-y≡0`),
   H_BRANCH (12 alias de rama: `log(x)+log(y)` vs `log(x*y)`, `sqrt(x*y)`,
   `arg(x*y)`, exploits `esperado+log(u)+log(v)-log(u*v)` sobre T4-N3/T4-M5/T5-N5)
   a **N=300**/caso (condición: 0 falsos positivos en TODOS los runs) y EQUIV
   (39 formas equivalentes) a **N=200**/caso (condición: 0 falsos negativos).
2. **Ataques frescos** (`ataques-r7.js`, 15 casos × 300 = **4 500 runs** + medición
   de tasas a N=3000): familia N9r con argumentos desplazados `u=f(x)+c` que esquivan
   los 5 sondas (públicos y fijos en el código). Cada acusación lleva **testigo
   explícito** de no-equivalencia (punto donde las expresiones difieren, medido con
   `G.evaluate`).
3. **Trig inversa** (`trig-r7.js` + `trig-r7.py`): casos nombrados del protocolo
   (`asin(0)`, `arcsen(1)`, `atan(1)`, `arccos(1)`, `asin(2)` complejo) vía `G.check`
   y forma cerrada en sympy; rejilla de 18 puntos reales y complejos × 3 funciones
   contra ramas principales de **mpmath**; 90 comparaciones de alias.
4. **Muestra de 10 ejercicios** (`dump-r7.js` → `expected-r7.json`, `muestra10.py`,
   17 comprobaciones): recálculo desde el enunciado con sympy exacto — T1-M2, T1-E3,
   T2-N4, T2-E1, T3-E2, T4-E3, T5-M5, T5-E3, X1-9, X2-10. Lista distinta de la
   muestra15 de R6; scripts escritos de cero.
5. **Tests del equipo**: `tests/grader.test.js` → **153/153 OK** (incluye la regresión
   R6 añadida: `log(x)+log(y)`, `sqrt(x*y)`, exploit `E+log(u)+log(v)-log(uv)` rechazan,
   y `asin/arcsen/atan/arccos`).
6. **Cero falsos positivos de esta auditoría**: cada acusación va con script y testigo
   reproducible; mis propios errores de script detectados y corregidos se listan en §8.

---

## 2. Verificación de las afirmaciones del equipo

| Claim | Veredicto | Evidencia |
|---|---|---|
| 5 puntos-sonda FIJOS siempre evaluados además de los aleatorios | **CIERTO** | `grader.js:463-471` `PROBES` (los 5 valores exactos del claim), `grader.js:472-478` `t < PROBES.length` evalúa los 5 son los primeros de cada llamada, `grader.js:479-481` resto aleatorio; `trials = max(16, vs+12)+5` (`grader.js:472`) |
| Cualquier diferencia en un sonda → rechazo determinista | **CIERTO** (en su alcance literal) | L4/L7/L8/L9/L11/L12 (los 5 fallos H_BRANCH de R6) → **0/300** y **0/3000**; el rechazo ocurre en el sonda t=0 (−2.37−5.11i, arg≈−2.01: \(\arg u+\arg v=-4.01<-\pi\)) |
| `asin/arcsin/arcsen/acos/arccos/atan/arctan/arctg` por rama principal | **CIERTO** | `grader.js:78-91` (\(\arcsin z=-i\log(iz+\sqrt{1-z^2})\), \(\arccos=\pi/2-\arcsin\), \(\arctan=\frac i2[\log(1-iz)-\log(1+iz)]\)), `grader.js:108-115` los 8 alias; 9/9 casos del protocolo, **54/54** valores en rejilla vs mpmath, **90/90** alias idénticos, `asin(2)` = π/2 − i·ln(2+√3) exacto (Δ=0) |

---

## 3. Paso 1 — batería de ramas, N=300/caso: **0 falsos positivos**

`bateria-r7.js` · 27 casos hostiles × 300 = **8 100 runs · 0 aceptaciones**.
Casos nombrados en el protocolo:

| Caso protocolo | Caso batería | Resultado |
|---|---|---|
| `log(x)+log(y)` vs `log(x*y)` | L4 | **0/300** ✔ |
| `sqrt(x)*sqrt(y)` vs `sqrt(x*y)` | L7 | **0/300** ✔ |
| `esperado+log(u)+log(v)-log(u*v)` sobre T4-N3 | L9 | **0/300** ✔ |
| `esperado+log(u)+log(v)-log(u*v)` sobre T4-M5 | L11 | **0/300** ✔ |
| `log(exp(v))` (E9, E10, F1, F4, G1) | H_LOGEXP | **0/300** en los 5 ✔ |
| O1–O5 (anuladores 8-ptos, wrap-around, matriz, exprset) | H_FIJO | **0/300** en los 5 ✔ |
| `1/(x-x)` | A6 (+J9) | **0/300** ✔ |
| `x-y≡0` | A1 | **0/300** ✔ |

Resto de la batería (controles de rama L1–L3, L5, L6, L10, L12 y anuladores A1–J9):
**0/300** en todos. Los 5 casos H_BRANCH que fallaban en R6 (L4 1/250, L7 2/250,
L8 3/250, L9 6/250, L11 5/250) pasan a **rechazo determinista** — también a N=3000
(0/3000 en los controles naive). **La condición del paso 1 se cumple.**

## 4. Paso 2 — 39 formas equivalentes, N=200/caso: **0 falsos negativos**

`bateria-r7.js` set EQUIV · 39 casos × 200 = **7 800/7 800 acepta** (B1–B17, D1–D5,
N2/N2b/N3, V1–V19: fracciones, complejos, orden de exprset, factorial, notación
implícita `senx`/`log2`/`sqrt4`, matrices, multi T1-M2, redondeo T1-N5). **La
condición del paso 2 se cumple** (se exigían ≥100 runs: se ejecutaron 200).

## 5. Paso 3 — trigonometría inversa: **verde**

- `G.check`: `asin(0)=0` ✔ · `arcsen(1)=pi/2` ✔ · `atan(1)=pi/4` ✔ · `arccos(1)=0` ✔ ·
  `asin(2)=pi/2−i·ln(2+√3)` ✔ (complejo) · extra: `arcsin(0.5)=pi/6`, `acos(0.5)=pi/3`,
  `arctg(1)=pi/4`, `atan(2i)=pi/2+i·ln3/2` ✔ — **9/9**.
- Rejilla 18 puntos (reales y complejos, incl. semiplano izquierdo y |Im|>1) ×
  {asin, acos, atan} vs **mpmath** (ramas principales): **54/54**, \|Δ\|≤1e-9.
- Alias `arcsin/arcsen`≡`asin`, `arccos`≡`acos`, `arctan/arctg`≡`atan` en los 18
  puntos: **90/90** idénticos (Δ=0).
- `asin(2)` contrastado además con sympy: 1.5707963267948966−1.3169578969248168i en
  ambas ramas, Δ=0.

## 6. Paso 4 — muestra de 10 ejercicios: **verde**

`muestra10.py` (recálculo independiente, sympy exacto): **17/17 OK** ·
T1-M2 (\|z\|=2, arg=5π/6) · T1-E3 (raíces cuartas de 16: ±2, ±2i) · T2-N4 (7, 3√2) ·
T2-E1 (inversa 3×3 exacta) · T3-E2 (λ=4, v=(1,1,1)) · T4-E3 (PLU con swap 1↔2:
verificación PA=LU + L + U) · T5-M5 (verificación A=QΛQᵀ + Q + Λ) · T5-E3 (A⁺=A⁻¹ +
4 ecuaciones de Penrose) · X1-9 (−1±2i) · X2-10 (α=7, β=5, rango 2=2<3).

---

## 7. Ataques frescos: la familia N9r **sigue abierta**

Los 5 son-das son **fijos, públicos** (constantes en `grader.js:463-471`) y asignan el
**mismo valor a todas las variables** (`grader.js:476`). La identidad de producto de
rama \(\log u+\log v=\log(uv)\) es falsa solo cuando \(\arg u+\arg v\notin(-\pi,\pi]\);
en todo el **semiplano derecho** (Re u ≥ 0 ∧ Re v ≥ 0) es invisible. Un adversario que
lee los sondas elige \(u=x+c,\ v=y+c\) con \(c\ge 3{,}1\) (Re mínimo de los sondas:
−3.1) y la discrepancia queda **fuera de la mira de los 5 puntos fijos**. Los puntos
aleatorios (16 por llamada, caja re∈[−4.57,4.57]) son la única defensa que queda.

`ataques-r7.js` · 15 casos × 300 = 4 500 runs · **12 casos con falsos positivos** ·
todos con testigo de no-equivalencia (12/12 `TESTIGO-OK`, \|A−B\| = 2π ≈ 6.283 o 2):

| Ataque (familia) | Acepta | Tasa | Diferencia real |
|---|---|---|---|
| M0/M0b/M13 naive (controles R6) | 0/300 | 0 % | las sondas los matan ✔ |
| **M1** `5+2log(x+3.5)−log((x+3.5)²)` vs 5 | **44/300** | **14,7 %** | en caja (x=−4.2 → Δ=2πi) |
| **M2** idem sobre **T4-N3** (ejercicio real) | **35/300** | **11,7 %** | en caja |
| M3 c=3.1 (esquiva mínima de sondas) | 12/300 | 4,0 % | en caja |
| M4 c=4.5 | 260/300 | 86,7 % | casi fuera de caja |
| **M5** `5+log(x+5)+log(y+5)−log((x+5)(y+5))` vs 5 | **300/300** | **100 %** | fuera de caja (x=y=−6 → Δ=2πi) |
| M6 `5+2log(x+5)−log((x+5)²)` vs 5 | 300/300 | 100 % | fuera de caja |
| M7 `sqrt(xy)` vs `sqrt(x)sqrt(y)` con c=5 | 300/300 | 100 % | fuera de caja (Δ=2) |
| M8 `arg(xy)` vs `arg(x)+arg(y)` con c=5 | 300/300 | 100 % | fuera de caja (Δ=2π) |
| **M9** exploit universal sobre **T4-N3** con c=5 | **300/300** | **100 %** | fuera de caja |
| **M10** exploit sobre **T4-M5** (exprset) con c=5 | **300/300** | **100 %** | fuera de caja |
| **M11** exploit sobre **T5-N5** (matriz) con c=5 | **300/300** | **100 %** | fuera de caja |
| **M12** `5+log(exp((x+5)/20))−(x+5)/20` vs 5 (clase N9) | **300/300** | **100 %** | fuera de caja (x=−5+80i → Δ=2πi) |

Tasas estables a **N=3000**: M1 **372/3000 = 12,40 %/llamada** · M2 **367/3000 =
12,23 %/llamada** (T4-N3 real) · M5 **3000/3000 = 100 %** · control naive 0/3000.

### Interpretación (dos subclases, misma raíz)

1. **Grindable y DENTRO de caja (M1–M4)** — literalmente la cláusula del título de N9r,
   «falsos positivos ocasionales grindables por reglas de rama». Con los sondas esquivados
   la tasa es **12,4 %/llamada**, superior a las tasas pre-fix de R6 (0,87–1,27 % de la
   variante naive). La variante naive murió (0/3000); lo que sobrevive es la familia con
   `u`,`v` **elegidos por el atacante**, que es el alcance real del «ataque universal» de
   N9r. Sigue grindable: «Comprobar» no se deshabilita (`app.js:504`) y el acierto
   persiste como `solved` (`app.js:490`).
2. **Determinista y FUERA de caja (M5–M12)** — con \(c\ge 4{,}57\) la discrepancia de rama
   queda fuera de la región de muestreo (re∈[−4.57,4.57], im∈[−9.21,9.21]):
   `equivalentExprs` no puede verla en ningún punto, por muchos runs que se ejecuten.
   `E + log(x+5)+log(y+5)−log((x+5)(y+5))` es aceptado como equivalente a `E` en el
   **100 %** de las llamadas para cualquier tipo (`expr`, `matrix`, `exprset`, `multi`),
   siendo \(E+2\pi i\) en buena parte de \(\mathbb{C}^2\). M12 muestra el mismo residuo
   determinista sobre la clase `log(exp)` (N9, dada por «cerrada de forma estable» en la
   R6): basta escalar la variable para empujar \(|\Im w|>\pi\) fuera de la caja.

Ningún muestreo en región **acotada** cierra esta familia de forma determinista (el
atacante traslada la discrepancia fuera de la caja); lo que R6 ofreció como «alternativa»
— **chequeo estructural AST** — es lo único estable. Con el criterio de la R6
(«APTO exige 0 CRÍTICOS y 0 MAYORES»), el residual es **MAYOR**: es el mismo defecto
de N9r (reglas de producto de rama aceptadas indebidamente) con un adversario que conoce
los sondas.

**Cierre recomendado (para una Ronda 8 corta):**
- **Estructural** (estable): rechazar por regla todo par que difiere solo por identidades
  de rama no globales — \(\log(AB)\not\equiv\log A+\log B\), \(\sqrt{AB}\not\equiv\sqrt
  A\sqrt B\), \(\arg(AB)\not\equiv\arg A+\arg B\), \(\log(e^{A})\not\equiv A\),
  \(\sqrt{A^{2}}\not\equiv A\) — salvo identidad sintáctica literal de ambos lados.
- **Numérico** (mitigación, no determinista): transformada afín aleatoria de los puntos
  por intento (\(z\mapsto a+r z\), \(a,r\) de soporte ancho) — hace la tasa ≈2⁻²¹ para
  cualquier atacante de cadena finita.
- Regresión en `tests/grader.test.js`: `E+log(x+5)+log(y+5)-log((x+5)(y+5))`,
  `E+2*log(x+3.5)-log((x+3.5)^2)`, `E+sqrt((x+5)*(y+5))-sqrt(x+5)*sqrt(y+5)` deben
  rechazar × 250.
- De propina (MENOR, no bloqueante): `grader.js:447` dice «los puntos de muestreo no son
  públicos» — los PROBES sí lo son; y las sondas asignan el mismo valor a todas las
  variables (sin diversidad por variable en los 5 fijos).

---

## 8. Falsos positivos de esta auditoría (trazabilidad)

1. **`trig-r7.py` v1 — `asin(2)`**: comparaba con `sp.simplify(val − closed) == 0`, que
   sympy no demuestra (identidad cierta pero no simplificable simbólicamente) e imprimió
   «FALLO» con **valores numéricos idénticos** (Δ=0). Es un falso positivo del script;
   corregido a comparación numérica (Δ<1e-12) antes de este informe. El hallazgo sobre
   trig inversa es el resultado v2: todo verde.
2. **Puntos testigo descartados antes de ejecutar**: elegí inicialmente \(u=-1+2i,
   v=-1-2i\) para M7/M8 (regla de \(\sqrt{}\)/`arg`), donde \(\arg u+\arg v=0\) y las
   expresiones **coincidían** — testigo inútil; y \(x=-5+40i\) para M12 (\(|\Im w|=2<\pi\),
   también coincidían). Descartados por análisis previo; los testigos finales usan
   \(x=y=-6\) (M7: Δ=2; M8: Δ=2π) y \(x=-5+80i\) (M12: Δ=2πi), todos `TESTIGO-OK`.
3. **`muestra10.py` v1**: `Aug.det()` sobre matriz no cuadrada (crash de sympy, sin
   conclusión afectada); sección X2-10 reescrita con eliminación simbólica de la 3ª fila.
   v2: 17/17 OK.

*(Los 3 falsos positivos descartados en R6, los 4 de R5 y los 6 de R2 siguen
descartados.)*

---

## 9. Veredicto

## **NO APTO**

**(0 CRÍTICOS · 1 MAYOR residual · 1 MENOR no bloqueante)**

Todo lo que el equipo **afirma es literalmente cierto** y está verificado con evidencia:
las 5 sondas fijas se evalúan siempre (`grader.js:463-478`), cualquier diferencia visible
en un sonda rechaza de forma determinista (los 5 fallos H_BRANCH de R6 → 0/300 y 0/3000),
y la trigonometría inversa implementa correctamente las 8 grafías por rama principal
(9/9 protocolo, 54/54 vs mpmath, 90/90 alias, `asin(2)` exacto). El fix recomendado en R6
está correctamente implementado y aporta una mejora real y medible. **Los 4 pasos del
protocolo de la Ronda 7 están en verde**: 8 100 runs hostiles con **0 falsos positivos**,
7 800 runs de formas equivalentes con **0 falsos negativos**, trig verificada con sympy
y 10 ejercicios recalculados de forma independiente (17/17).

**Pero el hallazgo N9r es de clase y la clase no queda cerrada**, con reproducción y
ataques frescos del adversario que conoce los sondas (§7):

1. **N9r (MAYOR residual)** — la cláusula del propio título de N9r, «falsos positivos
   ocasionales grindables por reglas de rama», sigue viva: con \(u,v\) desplazados que
   esquivan las 5 constantes públicas, `esperado+2log(x+3.5)−log((x+3.5)²)` se acepta
   **12,4 %/llamada** (372/3000; y 12,2 % sobre el ejercicio real T4-N3) con diferencia
   de rama **dentro** de la caja de muestreo, y `esperado+log(x+5)+log(y+5)−log((x+5)
   (y+5))` se acepta en el **100 %** (300/300 y 3000/3000) de forma determinista sobre
   cualquier tipo de ejercicio (`expr`, `matrix`, `exprset`), siendo el resultado \(2\pi i\)
   distinto del esperado (testigos §7). La defensa numérica actual (sondas fijas + caja
   acotada) no puede cerrar esta familia: solo el chequeo estructural AST (la alternativa
   ya citada en R6) o una transformada aleatoria de los puntos lo hace.
2. **MENOR no bloqueante (propina)** — `grader.js:447` («los puntos de muestreo no son
   públicos») queda desactualizado desde que los PROBES son constantes públicas, y los
   5 sondas comparten valor entre variables (sin diversidad por variable).

El veredicto APTO exige **0 CRÍTICOS y 0 MAYORES** (criterio R6): queda **1 MAYOR**.
La Ronda 8 puede ser mínima — las reglas estructurales de §7 + 3 tests de regresión y
reejecutar `bateria-r7.js` + `ataques-r7.js` (esta vez con 0/300 en M1–M12) bastarían
para el cierre.

### Reproducción

```sh
node verify/arbitro/ronda7/bateria-r7.js    # 66 casos · 15 900 runs · 0 fallos
node verify/arbitro/ronda7/ataques-r7.js    # 15 casos · 4 500 runs · 12 FP (testigos)
node verify/arbitro/ronda7/trig-r7.js && python3 verify/arbitro/ronda7/trig-r7.py
node verify/arbitro/ronda7/dump-r7.js && python3 verify/arbitro/ronda7/muestra10.py
node tests/grader.test.js                   # 153/153
```

Evidencia numérica total de esta ronda: **≈32 400 ejecuciones del grader**
(15 900 batería + 4 500 ataques + 12 000 en mediciones N=3000) + 153 tests + 54
valores de rejilla trig + 17 comprobaciones de muestra.
