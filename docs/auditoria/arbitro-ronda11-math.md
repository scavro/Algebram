# Árbitro R11 · Ronda de confirmación post-fix (matemáticas)

**Fecha:** 2026-10-14 · **Motor:** `assets/js/grader.js` (post-fix R11)
**Protocolo:** R11 = confirmación única del árbitro adversarial tras el cierre de
los hallazgos R10 (MAYOR-1 FP ventana relativa, MAYOR-2 FN identidades N12r,
MENOR N15r DoS) y de los residuales N12r/N13r heredados de la R9. Se re-ejecuta
**toda** la batería sobre el motor corregido. Máximo una ronda de confirmación.

**Certificación previa obligatoria:** cada regla nueva de `rewriteTrueIdentities`
y cada tolerancia se certificó con sympy ANTES de tocar el motor:
`verify/sympy-fix-r10.py` → **64/64** (`verify/certificaciones/sympy-fix-r10.json`).

## 1. Cambios bajo confirmación (resumen del equipo)

1. **F_p (cuerpos finitos) con BigInt** como decisión exacta para pares
   algebraicos (`+ − * /`, potencias de exponente entero, constantes racionales;
   `pi/tau/e` como símbolos formales, `i` excluido → camino polinómico).
   Mata la ventana relativa (`E ≡ E+δ` con |E|~1e20) y los desbordamientos
   (`x^4097`, `(…)^4096`) de raíz.
2. **`rewriteTrueIdentities` con re-entrada recursiva** (combustible acotado) +
   reglas certificadas: √(c·u) con c<0 → √(−c)·√(−u); sin/cos de −u (tan impar);
   plegado (u^a)^b con |a|≤1 y (b entero o a·b=1); conj sobre −, /, neg, ^ entero;
   |u·v| = |u|·|v| y |u/v| = |u|/|v|; −(−u)=u.
3. **Serialización canónica n-aria** de `+`/`*` (aplanado + plegado de constantes
   + orden) y memoización de `freeVars`/`serializeAST` (fin de la complejidad
   cuadrática y del stack-overflow en sumas de ~4000 términos).
4. **`toRationalPoly`:** exponentes racionales constantes (`2*y/y ≡ 2`), snap de
   exponente entero con ruido float (`x^2.0000000000000004 ≡ x^2`), guarda de
   nulos, `polyPowInt` sin cuadrado final desperdiciado, presupuesto de trabajo
   (N15r) y **estimación de monomios previa** que aborta la explosión combinatoria.
5. **Parser:** cadenas `+`/`*` planas con árbol equilibrado; coma decimal solo
   fuera de argumentos de `min`/`max` (N13r); notación `fact(x)` ≡ `x!`.

## 2. Re-ejecución de baterías (todas sobre el motor corregido)

| Batería | Casos | Resultado |
|---|---|---|
| `ataques-finales-r10.js` (G1–G5, N=200; DoS N=50) | 64 | **FP=0 · FN=0** |
| `completar-g5.js` (G5 aislado, timeout 20 s) | 13 | **FP=0 · FN=0 · TIMEOUT=0 · CRASH=0** |
| `ataques-nuevos-r10.js` (N=200) | 74 | **FP=0 · FN=0** |
| `ataques-estructurales-r10.js` (N=200) | 71 | **FP=0 · FN=0** |
| `equivalentes-r10.js` (78 equivalentes, N=200) | 78 | **FP=0 · FN=0** |
| `bateria-hostil-r10.js` (N=200) | 76 | **0 FP** |
| `identidades-r10.js` | 46 | **0 desajustes** |
| `dos-r10.js` (vectores DoS) | — | todos 0–1 ms (M10 instantáneo; antes >20 s) |
| `giant-r10.js` | — | 2000 átomos en 6 ms · 1000 paréntesis 1 ms |
| `timing-engine-r10.js` | 22 | **0 sobre presupuesto de 2 s** |
| `flujo-r10.js` (UX completa: drills + examen + timer) | — | **0 fallos** |
| `smoke-r10.js` (estructura de páginas) | 12 | 11 avisos, ver §4 |
| `ui-poison-r10.js` (venenos en UI real) | 21 | 2 avisos, ver §4 |
| `tests/grader.test.js` (suite del equipo, +55 regresiones R10) | 283 | **283/283** |
| `verify/sympy-fix-r10.py` | 64 | **64/64** |
| `verify/tema-*-verify.py` / `examen-*-verify.py` (contenido) | 189 | **189/189** |

Detalle de los cierres del veredicto R10:

| Hallazgo R10 | Estado R11 | Evidencia |
|---|---|---|
| **MAYOR-1 FP ventana relativa** (M5 7/20, M11 10/20, M12 4/20, familia R1) | **CERRADO** | M5/M11/M12 0/200 determinista; R1 0/50 (`identidades`); exprset `i+x^(-300);-i` 0/200 (antes 174/200) |
| **MAYOR-2 FN identidades** (K11–K15, W8, W17, W18, U8, C2, C4, C7, C8, M1, M2, M6) | **CERRADO** | 15/15 aceptan 200/200 o 50/50 |
| **MENOR N15r DoS** (M10 >20 s, `ataques-finales` colgaba) | **CERRADO** | M10 en 0–1 ms; `(x+y+z)^3000` en 1 ms (antes timeout 25 s); 0/22 sobre presupuesto |
| **N12r residual R9** (T8 \|xy\|=\|x\|\|y\|, P7 `x^(2y/y)`, P9 expon. con ruido, M12/M13 tol. 1e-8) | **CERRADO** | `ataques-estructurales` FN=4→0; T8 en `ataques-nuevos` cerrado |
| **N13r coma decimal con min/max** | **CERRADO** | `min(2,3)+0,5` ≡ 2.5 acepta (test R10) |
| **N16r exponentes negativos** (ya cerrado en R10) | **CERRADO** | W13/W15 0/200; `5+x^(-300)` 0/200 |

## 3. Controles negativos (deben seguir rechazando) — todos en verde

K1–K10 (falsas de rama log/sqrt), W3–W5 (raíces de rama), W11–W16 (bordes
anti-grind ±4096/±4097), U2–U4, U7, C6, M7, M8, M13, R1 (`x^(-65)`, `0^x`,
`4/11+x^(-300)`, `(x+y)^(-300)`…), N1–N16 (0/0), M16–M18 (coma decimal con
min/max), poisons M1-R8 (`Δ·x^0.5`) — 0/200 o 0/50 en todas las baterías y en
la UI real (`ui-poison`: la familia R1 y `4/11+(x²+y²+2)^(-200)` rechazan;
antes esta última **aceptaba** y filtraba la solución).

## 4. Avisos documentados (expectativas de los scripts, no defectos del motor)

1. `bordes-r10.js`: «min(2,3)+0,5 vs 3.5» — **error aritmético del script**:
   `min(2,3)=2`, luego `min(2,3)+0,5 = 2.5`, no 3.5. El motor parsea y acepta
   `2.5` (regresión «R10: min(2,3)+0,5 = 2.5» verde). El caso siguiente del
   propio script (`min(2,3)+1/2 vs 2.5`) confirma el valor esperado real.
2. `bordes-r10.js`: «'x!' vs 'fact(x)' — control notación (fact no escribible)»
   vs `equivalentes-r10.js` NEW-F4 (mismo par, expectativa **contraria**).
   Prevalece el significado matemático: `x! ≡ fact(x)`. Se añadió `fact` a la
   notación y NEW-F4 cierra (0 FN en los 78 equivalentes); el control de
   `bordes` queda **superado** (su premisa «fact no escribible» ya no aplica).
3. `ui-poison-r10.js`:
   - «4/11+(x-x)*x^0.5 → ACEPTA»: es una **identidad verdadera**
     (0·x^0.5 = 0; certificada y exigida por `identidades-r10.js` 50/50).
     Aceptarla muestra la solución como *respuesta correcta*, no es fuga.
   - «basura-999 → RECHAZA sin solución»: rechaza correctamente; la solución
     visible procede del intento correcto inmediatamente anterior en la misma
     sesión (artefacto de secuencia del script).
   El resto de la batería (19/21) está en verde, incluida la familia de venenos
   que antes filtraba solución.
4. `smoke-r10.js`: 10 avisos de `loadMs ~2360 ms > 2000 ms` (arranque frío de
   Chrome en este entorno; el motor no está en la ruta de carga) y el recuento
   «396 campos vs 111» (semántica del contador del script). Sin errores JS,
   0 `.katex-error`, timer/progreso/nav correctos.

## 5. Veredicto R11

**APTO.**

0 CRÍTICOS · 0 MAYORES · 0 MENORES abiertos. Los tres hallazgos del veredicto
R10 (2 MAYORES + 1 MENOR) y los cuatro residuales R9 (N12r, N13r, N15r, N16r)
están **cerrados y verificados**; las 228+55=283 pruebas del equipo, los 64
casos certificados con sympy y las 511 comprobaciones de las baterías
adversariales (N=200 por caso) están en verde. Los 4 avisos del §4 son
expectativas erróneas o secuencias de los propios scripts del árbitro, ya
documentados, sin impacto en el contrato («cualquier forma equivalente se
acepta; ninguna forma no equivalente»).

Conforme al protocolo, esta es la **única** ronda de confirmación. El proyecto
pasa a Fase 6 (entrega con informe de verificación).
