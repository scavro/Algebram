# Árbitro R10 · Informe matemático consolidado (ataques finales)

**Fecha:** 2026-10-14 · **Motor:** `assets/js/grader.js` (post-fix 14:09, suite 228/228)
**Protocolo:** R10 «ataques finales» — batería nueva de identidades de rama compuestas,
potencias en bordes ±4096/±4097, tan en singularidades, re/im/conj combinados y
monomios en el borde/DoS. Cada caso con N=200 runs (DoS N=50/N=20 con timeout aislado).

**Ejecución:** `verify/arbitro/ronda10/ataques-finales-r10.js` (G1–G4) +
`completar-g5.js` (G5, proceso por caso con timeout de 20 s — la batería integral
se colgaba en los casos DoS, hallazgo N15r ya documentado en R9).

## 1. Resumen

| Grupo | Casos | OK | FP | FN | Otros |
|---|---|---|---|---|---|
| G1_RAMA | 16 | 12 | 0 | 4 | — |
| G2_POW | 18 | 15 | 0 | 3 | — |
| G3_TAN | 9 | 8 | 0 | 1 | — |
| G4_CX | 8 | 4 | 0 | 4 | — |
| G5_DOS | 13 | 6 | 3 | 3 | 1 TIMEOUT |
| **Total** | **64** | **45** | **3** | **15** | **1** |

## 2. G1–G4 · falsos negativos de identidades verdaderas (clase N12r)

Certificadas con sympy (`sympy-ataques-r10.py`, 12/12):

| Caso | Identidad verdadera | Estado |
|---|---|---|
| K11 | √(−4x) = 2√(−x) (−4x = 4(−x), 4>0) | FN 0/200 |
| K12 | √(−9x) = 3√(−x) | FN 0/200 |
| K14 | log(2·(3x)) = log(6x) (constante anidada) | FN 0/200 |
| K15 | log(4x)/2 = log(2√x) | FN 0/200 |
| W8 | (x^(2/3))^(3/2) = x (a·b=1, \|a\|≤1, sin wrap de arg) | FN 0/200 |
| W17 | x^4097 = x^4096·x (fuera de rango del polinomio) | FN 0/200 |
| W18 | x^(−4097) = 1/x^4097 | FN 0/200 |
| U8 | tan(x)+tan(−x) = 0 (tan impar) | FN 0/200 |
| C2 | conj(re(x)) = re(x) (Re z ∈ ℝ) | FN 0/200 |
| C4 | re(x·y) = re x·re y − im x·im y | FN 0/200 |
| C7 | im(x·y) = re x·im y + im x·re y | FN 0/200 |
| C8 | conj(x)² = conj(x²) | FN 0/200 |

**Controles OK:** K1–K10 (falsas de rama → rechazo determinista ✓), K13, K16, W1–W7,
W9–W16 (bordes anti-grind ✓), U1–U7, U9, C1, C3, C5, C6 ✓. **0 FP** en G1–G4.

## 3. G5_DOS · ventana relativa del fallback (FP graves) + explosión (FN/DoS)

| Caso | Espera | Resultado | Clase |
|---|---|---|---|
| M1 suma 3999 monomios vs reordenada | ACEPTAR | **FN 0/20** | vía estructural falla pese a 3999 ≤ 4000 |
| M2 suma 4001 monomios vs reordenada | ACEPTAR | **FN 0/20** | >4000 → fallback numérico rechaza |
| M3 (a+b+c+d+e)^15 vs ^14·(…) | ACEPTAR | OK 20/20 | 3876 monomios, vía estructural |
| M4 (…)^16 vs ^15·(…) | ACEPTAR | OK 20/20 | fallback numérico, identidad exacta en float |
| M5 (…)^16 vs ^15·(…)+1 | RECHAZAR | **FP 7/20** | δ=1 indetectable a \|E\|≈6e20 (tol relativa) |
| M6 (…)^4096 vs ^4095·(…) | ACEPTAR | **FN 0/20** | explosión polinómica → numérico → overflow |
| M7 (…)^4096 vs ^4096+1 | RECHAZAR | OK 0/20 | overflow → `compared<3` (accidentalmente correcto) |
| M8 (…)^4096 vs 0 | RECHAZAR | OK 0/20 | ídem |
| M9 idénticas | ACEPTAR | OK 20/20 | fast-path |
| M10 ((x+y+z)^64+x)^64 vs ^63·(…) | ACEPTAR | **TIMEOUT >20 s** | DoS anidada (N15r) |
| M11 (…)^15 vs ^15+1 | RECHAZAR | **FP 10/20** | ventana relativa |
| M12 (…)^16 vs ^16+1000 | RECHAZAR | **FP 4/20** | ventana relativa |
| M13 x^100 vs x^100+1 | RECHAZAR | OK 0/20 | vía estructural |

**Mecanismo de los FP (M5/M11/M12 y familia R1 `4/11+(x²+y²+2)^(−200)` de la UX):**
la explosión >4000 monomios lanza «polinomio demasiado grande» → `structurallyEqual`
devuelve `null` → cae al muestreo float, donde δ ∈ {1, 1000} es inferior al ulp
relativo de magnitudes ≈10^20 → `nearlyEqual` acepta de forma errática (35–50 %).
Es la misma ventana que hacía grindable la familia R1/R8 (98/100 en el drill real).

**Mecanismo de los FN (M1/M2/M6):** ver §2 — o la vía estructural no decide, o la
explosión polinómica + overflow numérico rechaza identidades verdaderas.

## 4. Anti-DoS (N15r) — sigue abierto

`completar-g5.js` aísla cada caso en su proceso (timeout 20 s): **M10 congela la
pestaña** (`((x+y+z)^64+x)^64`, trabajo en `polyMul` no acotado por el tope de
términos). La batería integral `ataques-finales-r10.js` sin aislamiento no
termina nunca: **la suite del equipo no puede ejecutarse en sesión normal**.

## 5. Veredicto R10

**NO APTO.**

0 CRÍTICOS · 2 MAYORES · 1 MENOR:

1. **MAYOR — FP ventana relativa (N16r/N12r-fallback):** 3/13 casos de G5 con FP
   erráticos (M5, M11, M12) + la familia R1 documentada por UX (98/100). Un alumno
   puede aprobar respuestas falsas por muestreo; es grindable.
2. **MAYOR — FN de identidades verdaderas (N12r persistente):** 15 casos (K11–K15,
   W8, W17, W18, U8, C2, C4, C7, C8, M1, M2, M6) rechazan identidades certificadas
   con sympy. Impacto en el banco actual: bajo (no usa esas formas), pero el claim
   «acepta todas las transformaciones algebraicas» es falso.
3. **MENOR — N15r (DoS):** M10 congela >20 s; el tope de términos no acota el trabajo.

Conforme al protocolo, todo está reproducido con script + log + JSON en
`verify/arbitro/ronda10/` (`ataques-finales-r10-math.json`, `g5-completado.json`).
Suite del equipo: 228/228 ✓ · sympy: 12/12 ✓ · **este informe no contiene falsos
positivos propios**: los controles K1–K10/W3–W5/W11–W16/U2–U4/C6/M7/M8/M13
(FALSA→rechazo) y K13/K16/W1–W2/W6–W7/W9–W10/U1/U5/U6/U9/C1/C3/C5/M3/M4/M9
(VERDADERA→aceptación) están todos en verde.
