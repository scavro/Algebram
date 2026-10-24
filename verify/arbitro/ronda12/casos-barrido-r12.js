/* verify/arbitro/ronda12/casos-barrido-r12.js — Casos de la ronda 12 fuera
   de las nueve fichas nuevas: barrido de las 14 fichas de los temas 4 y 5 que
   ninguna ronda anterior había atacado, y sondas sintéticas de las familias
   de riesgo (valores singulares repetidos, autovalores defectivos,
   pseudoinversas de rango deficiente, formas cuadráticas degeneradas y
   LDLᵀ con pivote cero).

   Se exporta como módulo y lo carga `ataques-r12.js`, que lo ejecuta contra
   `assets/js/grader.js`.

   Cada caso:
     · clase "FN" — identidad verdadera que el motor NO debe rechazar.
     · clase "FP" — identidad falsa que el motor NO debe aceptar.
     · clase "TOL" — tolerancia deliberada: el motor DEBE aceptar.
     · `sonda: true` — caso sintético: no pertenece a una ficha del banco;
       lleva su propia `spec` y su propia `entrada`.
     · `sympy` — la certificación; debe devolver True.
*/
"use strict";

module.exports = [
  /* ================= T4-N1 · solución de un sistema (vector 3×1) ================= */
  {
    ficha: "T4-N1", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: [["1.0"], ["-1"], ["2"]] },
    por: "1.0 es el entero 1: la celda compara en Q.",
    sympy: "sp.Float('1.0') == sp.Integer(1)",
  },
  {
    ficha: "T4-N1", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { valor: [["1"], ["-1.0"], ["2"]] },
    por: "-1.0 es el mismo entero que -1.",
    sympy: "sp.Float('-1.0') == sp.Integer(-1)",
  },
  {
    ficha: "T4-N1", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: [["0"], ["0"], ["0"]] },
    por: "La solución del sistema no es la del homogéneo: x+y+z = 2 ≠ 0.",
    sympy: "sp.Matrix([0,0,0]).dot(sp.Matrix([1,1,1])) != 2",
  },
  {
    ficha: "T4-N1", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: [["1"], ["-1"], ["-2"]] },
    por: "Signo de la tercera componente: 2x-y+z = 5 da 2+1-2 = 1 ≠ 5.",
    sympy: "sp.Matrix([1,-1,-2]).dot(sp.Matrix([2,-1,1])) != 5",
  },
  {
    ficha: "T4-N1", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { valor: [["1"], ["2"], ["-1"]] },
    por: "Componentes permutadas: la solución es (1,-1,2)ᵀ, no (1,2,-1)ᵀ.",
    sympy: "sp.Matrix([1,2,-1]).dot(sp.Matrix([2,-1,1])) != 5",
  },

  /* ================= T4-N2 · tipo de sistema por Rouché–Frobenius (choice) ================= */
  {
    ficha: "T4-N2", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: "2" },
    por: "Índice 2 = «Incompatible (sin solución)»: rg A = 1 y rg A* = 2.",
    sympy: "sp.Matrix([[1,1],[2,2]]).rank() == 1 and sp.Matrix([[1,1,1],[2,2,3]]).rank() == 2",
  },
  {
    ficha: "T4-N2", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: "0" },
    por: "«Compatible determinado»: el sistema es incompatible.",
    sympy: "sp.Matrix([[1,1,1],[2,2,3]]).rank() == 2",
  },
  {
    ficha: "T4-N2", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: "1" },
    por: "«Compatible indeterminado»: también falso, el sistema no tiene solución.",
    sympy: "sp.Matrix([[1,1,1],[2,2,3]]).rank() == 2",
  },
  {
    ficha: "T4-N2", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { valor: "3" },
    por: "Índice fuera de rango: hay tres opciones (0, 1, 2).",
    sympy: "3 not in (0, 1, 2) and 2 in (0, 1, 2)",
  },

  /* ================= T4-N5 · compatibilidad (bool) ================= */
  {
    ficha: "T4-N5", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: "false" },
    por: "La 2.ª ecuación es 2· la 1.ª con término independiente distinto (7 ≠ 6): incompatible.",
    sympy: "sp.Matrix([[1,2,3],[2,4,7]]).rank() == 2",
  },
  {
    ficha: "T4-N5", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { valor: "no" },
    por: "«no» es una forma admitida de responder falso; la respuesta es «falso» porque el sistema es incompatible.",
    sympy: "sp.Matrix([[1,2,3],[2,4,7]]).rank() == 2",
  },
  {
    ficha: "T4-N5", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: "true" },
    por: "«Verdadero» es la respuesta opuesta: el sistema es incompatible.",
    sympy: "sp.Matrix([[1,2,3],[2,4,7]]).rank() == 2",
  },

  /* ================= T4-N6 · AᵀA (matrix 2×2) ================= */
  {
    ficha: "T4-N6", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: [["3.0", "3"], ["3", "5"]] },
    por: "3.0 es el entero 3.",
    sympy: "sp.Float('3.0') == sp.Integer(3)",
  },
  {
    ficha: "T4-N6", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: [["3", "2"], ["2", "5"]] },
    por: "El producto escalar de las columnas vale 1·0+1·1+1·2 = 3, no 2 (se ha olvidado la tercera fila).",
    sympy: "sp.Matrix([[1,0],[1,1],[1,2]]).T*sp.Matrix([[1,0],[1,1],[1,2]]) == sp.Matrix([[3,3],[3,5]])",
  },
  {
    ficha: "T4-N6", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: [["5", "3"], ["3", "3"]] },
    por: "Diagonales intercambiadas: (1,1) = 1²+1²+1² = 3 y (2,2) = 0²+1²+2² = 5.",
    sympy: "(sp.Matrix([[1,0],[1,1],[1,2]]).T*sp.Matrix([[1,0],[1,1],[1,2]]))[0,0] == 3 and (sp.Matrix([[1,0],[1,1],[1,2]]).T*sp.Matrix([[1,0],[1,1],[1,2]]))[1,1] == 5",
  },

  /* ================= T4-M1 · menores y factorización LU (pivote nulo) ================= */
  {
    ficha: "T4-M1", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { d1: "2.0", d2: "0.0", d3: "-2.0" },
    por: "Los tres valores son enteros; escribirlos como decimal entero es la misma respuesta.",
    sympy: "sp.Float('2.0') == sp.Integer(2) and sp.Float('0.0') == sp.Integer(0) and sp.Float('-2.0') == sp.Integer(-2)",
  },
  {
    ficha: "T4-M1", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { d2: "0.0000001" },
    por: "Δ2 = 0 exactamente: con `exact` el residuo se rechaza (aquí el banco acierta, al contrario que en T4-M7).",
    sympy: "sp.Matrix([[2,4],[4,8]]).det() == 0 and sp.Integer(0) != sp.Float('0.0000001')",
  },
  {
    ficha: "T4-M1", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { lu: "0" },
    por: "«Sí admite LU sin permutar» es falso: Δ2 = 0 anula el pivote del segundo paso (Teorema 4.11).",
    sympy: "sp.Matrix([[2,4],[4,8]]).det() == 0",
  },
  {
    ficha: "T4-M1", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { d3: "-1" },
    por: "det A = -2, no -1.",
    sympy: "sp.Matrix([[2,4,1],[4,8,3],[1,3,5]]).det() == -2",
  },

  /* ================= T4-E1 · solución con pivote nulo inicial (vector 3×1) ================= */
  {
    ficha: "T4-E1", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: [["1.0"], ["2"], ["3"]] },
    por: "1.0 es el entero 1.",
    sympy: "sp.Float('1.0') == sp.Integer(1)",
  },
  {
    ficha: "T4-E1", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: [["1"], ["2"], ["-3"]] },
    por: "Signo: y+z = 5 da 2-3 = -1 ≠ 5.",
    sympy: "sp.Matrix([1,2,-3]).dot(sp.Matrix([0,1,1])) != 5",
  },
  {
    ficha: "T4-E1", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: [["2"], ["1"], ["3"]] },
    por: "Componentes permutadas: x+y = 3 da 2+1 = 3 ✓ pero x+z = 4 da 2+3 = 5 ≠ 4.",
    sympy: "sp.Matrix([2,1,3]).dot(sp.Matrix([1,0,1])) != 4",
  },

  /* ================= T4-E4 · mínimos cuadrados (multi de exactos) ================= */
  {
    ficha: "T4-E4", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { m: "1.0", n: "2.0", pred: "6.0" },
    por: "Los tres campos son enteros exactos; el decimal entero es la misma respuesta.",
    sympy: "sp.Float('1.0') == sp.Integer(1) and sp.Float('2.0') == sp.Integer(2) and sp.Float('6.0') == sp.Integer(6)",
  },
  {
    ficha: "T4-E4", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { m: "0.9999999" },
    por: "m = 1 exactamente.",
    sympy: "sp.solve(sp.Matrix([[5,3],[3,3]])*sp.Matrix([sp.Symbol('m'),sp.Symbol('n')]) - sp.Matrix([11,9]),[sp.Symbol('m'),sp.Symbol('n')])[sp.Symbol('m')] == 1",
  },
  {
    ficha: "T4-E4", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { pred: "5" },
    por: "y(4) = 4·1 + 2 = 6, no 5 (el 5 es el valor de la tercera medición).",
    sympy: "4*sp.Integer(1) + sp.Integer(2) == 6",
  },

  /* ================= T5-N2 · diagonalizable (bool, autovalor defectivo) ================= */
  {
    ficha: "T5-N2", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: "false" },
    por: "p(λ) = (λ-3)² con dim ker(A-3I) = 1 < 2: no es diagonalizable.",
    sympy: "2 - (sp.Matrix([[4,1],[-1,2]])-3*sp.eye(2)).rank() == 1 and sp.factor(sp.Matrix([[4,1],[-1,2]]).charpoly().as_expr()) == (sp.Symbol('lambda')-3)**2",
  },
  {
    ficha: "T5-N2", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: "true" },
    por: "«Verdadero» es la respuesta opuesta.",
    sympy: "2 - (sp.Matrix([[4,1],[-1,2]])-3*sp.eye(2)).rank() == 1",
  },
  {
    ficha: "T5-N2", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: "1" },
    por: "El motor lee «1» como verdadero: también falso.",
    sympy: "2 - (sp.Matrix([[4,1],[-1,2]])-3*sp.eye(2)).rank() == 1",
  },

  /* ================= T5-N3 · Cholesky (matrix 2×2) ================= */
  {
    ficha: "T5-N3", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: [["2.0", "0"], ["1", "2"]] },
    por: "2.0 es el entero 2.",
    sympy: "sp.Float('2.0') == sp.Integer(2)",
  },
  {
    ficha: "T5-N3", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: [["2", "0"], ["-1", "2"]] },
    por: "Signo de l21: con -1 el producto L Lᵀ da [[4,-2],[-2,5]] ≠ A.",
    sympy: "(sp.Matrix([[2,0],[-1,2]])*sp.Matrix([[2,0],[-1,2]]).T) != sp.Matrix([[4,2],[2,5]])",
  },
  {
    ficha: "T5-N3", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: [["2", "0"], ["1", "-2"]] },
    por: "Diagonal de L negativa: la factorización de Cholesky exige l_ii > 0.",
    sympy: "all(sp.Matrix([[2,0],[1,-2]])[i,i] > 0 for i in range(2)) is False",
  },
  {
    ficha: "T5-N3", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { valor: [["2", "1"], ["0", "2"]] },
    por: "Es Lᵀ, no L: no es triangular inferior.",
    sympy: "all(sp.Matrix([[2,1],[0,2]])[i,j] == 0 for i in range(2) for j in range(i+1,2)) is False",
  },

  /* ================= T5-N4 · forma cuadrática (choice, 4 opciones) ================= */
  {
    ficha: "T5-N4", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: "2" },
    por: "Índice 2 = «indefinida»: los autovalores de [[2,3],[3,2]] son 5 y -1.",
    sympy: "sorted(sp.Matrix([[2,3],[3,2]]).eigenvals().keys()) == [-1,5]",
  },
  {
    ficha: "T5-N4", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: "0" },
    por: "«Definida positiva»: hay un autovalor negativo.",
    sympy: "min(sp.Matrix([[2,3],[3,2]]).eigenvals().keys()) < 0",
  },
  {
    ficha: "T5-N4", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: "1" },
    por: "«Semidefinida positiva»: los autovalores son 5 y -1, ninguno nulo.",
    sympy: "0 not in sp.Matrix([[2,3],[3,2]]).eigenvals().keys()",
  },

  /* ================= T5-N6 · norma espectral (number exacto) ================= */
  {
    ficha: "T5-N6", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: "3.0" },
    por: "3.0 es el entero 3 (con `exact` se exige entero, y 3.0 lo es).",
    sympy: "sp.Float('3.0') == sp.Integer(3)",
  },
  {
    ficha: "T5-N6", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: "3.0000001" },
    por: "‖A‖₂ = 3 exactamente.",
    sympy: "sp.Integer(3) != sp.Float('3.0000001')",
  },
  {
    ficha: "T5-N6", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: "1" },
    por: "1 es el otro valor singular, no el mayor: ‖A‖₂ = σ₁ = 3.",
    sympy: "sorted(sp.Matrix([[2,1],[1,2]]).singular_values()) == [1,3]",
  },
  {
    ficha: "T5-N6", caso: "FP-03", clase: "FP", debe: "rechaza",
    cambios: { valor: "sqrt(5)" },
    por: "√5 es la raíz del autovalor mayor de AᵀA, no el valor singular: σ₁ = √9 = 3.",
    sympy: "sp.sqrt(9) == 3 and sp.sqrt(5) != 3",
  },

  /* ================= T5-M2 · LDLᵀ (multi de dos matrices) ================= */
  {
    ficha: "T5-M2", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { L: [["1.0", "0", "0"], ["2", "1", "0"], ["-1", "1", "1"]] },
    por: "1.0 es el entero 1 de la diagonal unittriangular.",
    sympy: "sp.Float('1.0') == sp.Integer(1)",
  },
  {
    ficha: "T5-M2", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { D: [["2", "0", "0"], ["0", "2", "0"], ["0", "0", "1"]] },
    por: "D = diag(2,2,1) es la respuesta de otra matriz: con D = diag(1,3,2) el producto L D Lᵀ da A.",
    sympy: "(sp.Matrix([[1,0,0],[2,1,0],[-1,1,1]])*sp.diag(1,3,2)*sp.Matrix([[1,0,0],[2,1,0],[-1,1,1]]).T) == sp.Matrix([[1,2,-1],[2,7,1],[-1,1,6]])",
  },
  {
    ficha: "T5-M2", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { L: [["1", "0", "0"], ["2", "1", "0"], ["1", "1", "1"]] },
    por: "Signo de l31: debe ser -1 para que L D Lᵀ = A.",
    sympy: "(sp.Matrix([[1,0,0],[2,1,0],[1,1,1]])*sp.diag(1,3,2)*sp.Matrix([[1,0,0],[2,1,0],[1,1,1]]).T) != sp.Matrix([[1,2,-1],[2,7,1],[-1,1,6]])",
  },

  /* ================= T5-E1 · diagonalización ortogonal (multi de dos matrices) ================= */
  {
    ficha: "T5-E1", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { Q: [["sqrt(2)/2", "sqrt(2)/2", "0"], ["-sqrt(2)/2", "sqrt(2)/2", "0"], ["0", "0", "1"]] },
    por: "La forma canónica del banco, reescrita.",
    sympy: "sp.Matrix([[sp.sqrt(2)/2,sp.sqrt(2)/2,0],[-sp.sqrt(2)/2,sp.sqrt(2)/2,0],[0,0,1]]).T*sp.Matrix([[sp.sqrt(2)/2,sp.sqrt(2)/2,0],[-sp.sqrt(2)/2,sp.sqrt(2)/2,0],[0,0,1]]) == sp.eye(3)",
  },
  {
    ficha: "T5-E1", caso: "FN-02", clase: "FN", debe: "acepta",
    cambios: { Q: [["0.7071067811865476", "sqrt(2)/2", "0"], ["-sqrt(2)/2", "sqrt(2)/2", "0"], ["0", "0", "1"]] },
    por: "El decimal con 16 cifras es el mismo √2/2 (error 0 en coma flotante).",
    sympy: "abs(sp.Float('0.7071067811865476') - sp.sqrt(2)/2) < sp.Float('1e-15')",
  },
  {
    // Caso de contrato: la respuesta es matemáticamente válida (negar la
    // primera columna de Q deja invariante QΛQᵀ porque Λ es diagonal), pero el
    // enunciado fija que la primera componente no nula de cada columna sea
    // positiva. El rechazo es lo correcto: lo que se comprueba es el
    // cumplimiento del convenio, no la equivalencia matricial.
    ficha: "T5-E1", caso: "CON-01", clase: "CON", debe: "rechaza",
    cambios: { Q: [["-sqrt(2)/2", "sqrt(2)/2", "0"], ["sqrt(2)/2", "sqrt(2)/2", "0"], ["0", "0", "1"]] },
    por: "El enunciado exige que la primera componente no nula de cada columna sea positiva; con la primera columna negada se incumple el convenio, aunque la diagonalización siga siendo válida.",
    sympy: "sp.Matrix([[-sp.sqrt(2)/2,sp.sqrt(2)/2,0],[sp.sqrt(2)/2,sp.sqrt(2)/2,0],[0,0,1]])*sp.diag(-1,3,4)*sp.Matrix([[-sp.sqrt(2)/2,sp.sqrt(2)/2,0],[sp.sqrt(2)/2,sp.sqrt(2)/2,0],[0,0,1]]).T == sp.Matrix([[sp.sqrt(2)/2,sp.sqrt(2)/2,0],[-sp.sqrt(2)/2,sp.sqrt(2)/2,0],[0,0,1]])*sp.diag(-1,3,4)*sp.Matrix([[sp.sqrt(2)/2,sp.sqrt(2)/2,0],[-sp.sqrt(2)/2,sp.sqrt(2)/2,0],[0,0,1]]).T and sp.Matrix([[-sp.sqrt(2)/2,sp.sqrt(2)/2,0],[sp.sqrt(2)/2,sp.sqrt(2)/2,0],[0,0,1]])[0,0] < 0",
  },
  {
    ficha: "T5-E1", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { Lam: [["3", "0", "0"], ["0", "-1", "0"], ["0", "0", "4"]] },
    por: "Λ en orden decreciente: el enunciado pide λ1 < λ2 < λ3.",
    sympy: "sp.Matrix([[1,2,0],[2,1,0],[0,0,4]]).eigenvals().keys() == {-1,3,4}",
  },

  /* ================= T5-E2 · Cholesky 3×3 (matrix) ================= */
  {
    ficha: "T5-E2", caso: "FN-01", clase: "FN", debe: "acepta",
    cambios: { valor: [["2.0", "0", "0"], ["1", "2", "0"], ["1", "1", "3"]] },
    por: "2.0 es el entero 2.",
    sympy: "sp.Float('2.0') == sp.Integer(2)",
  },
  {
    ficha: "T5-E2", caso: "FP-01", clase: "FP", debe: "rechaza",
    cambios: { valor: [["2", "1", "0"], ["0", "2", "0"], ["1", "1", "3"]] },
    por: "L no es triangular inferior: l12 = 1 no puede ser.",
    sympy: "all(sp.Matrix([[2,1,0],[0,2,0],[1,1,3]])[i,j] == 0 for i in range(3) for j in range(i+1,3)) is False",
  },
  {
    ficha: "T5-E2", caso: "FP-02", clase: "FP", debe: "rechaza",
    cambios: { valor: [["2", "0", "0"], ["1", "2", "0"], ["1", "1", "-3"]] },
    por: "La diagonal de Cholesky es positiva: l33 = 3, no -3.",
    sympy: "all(sp.Matrix([[2,0,0],[1,2,0],[1,1,-3]])[i,i] > 0 for i in range(3)) is False",
  },

  /* ==================================================================
     SONDAS SINTÉTICAS — familias de riesgo sin ficha propia en el banco.
     No son fichas: es la especificación que se somete al motor para
     ver cómo se comporta en los casos degenerados.
     ================================================================== */

  /* --- Valores singulares repetidos: la SVD no es única --- */
  {
    sonda: true, caso: "S1-01", clase: "CON", debe: "rechaza",
    spec: { type: "matrix", rows: 2, cols: 2, expected: [["1", "0"], ["0", "1"]] },
    entrada: [["sqrt(2)/2", "-sqrt(2)/2"], ["sqrt(2)/2", "sqrt(2)/2"]],
    por: "A = 2I tiene σ1 = σ2 = 2 y su SVD NO es única: U' = U R con R una rotación da otra SVD válida. El motor rechaza la rotada porque la ficha fija un representante: no es un defecto del motor, es la condición de unicidad que el enunciado debe fijar.",
    sympy: "(sp.Matrix([[sp.sqrt(2)/2,-sp.sqrt(2)/2],[sp.sqrt(2)/2,sp.sqrt(2)/2]])*sp.diag(2,2)*sp.Matrix([[sp.sqrt(2)/2,-sp.sqrt(2)/2],[sp.sqrt(2)/2,sp.sqrt(2)/2]]).T) == 2*sp.eye(2)",
  },
  {
    sonda: true, caso: "S1-02", clase: "FP", debe: "rechaza",
    spec: { type: "matrix", rows: 2, cols: 2, expected: [["1", "0"], ["0", "1"]] },
    entrada: [["sqrt(2)/2", "-sqrt(2)/2"], ["0", "1"]],
    por: "La rotación de 45° mal copiada: la segunda fila no es (√2/2, √2/2), luego la matriz no es ortogonal y no es una SVD válida.",
    sympy: "sp.Matrix([[sp.sqrt(2)/2,-sp.sqrt(2)/2],[0,1]]).T*sp.Matrix([[sp.sqrt(2)/2,-sp.sqrt(2)/2],[0,1]]) != sp.eye(2)",
  },

  /* --- Autovalor defectivo: el autovector no es único --- */
  {
    sonda: true, caso: "S2-01", clase: "CON", debe: "rechaza",
    spec: { type: "vector", rows: 2, cols: 1, expected: [["1"], ["0"]] },
    entrada: [["2"], ["0"]],
    por: "A = [[3,1],[0,3]] es defectiva: (1,0)ᵀ y (2,0)ᵀ son el mismo autovector. El motor rechaza el múltiplo porque la ficha fija el representante: de nuevo, unicidad por convenio, no defecto.",
    sympy: "(sp.Matrix([[3,1],[0,3]])-3*sp.eye(2))*sp.Matrix([2,0]) == sp.zeros(2,1)",
  },
  {
    sonda: true, caso: "S2-02", clase: "FP", debe: "rechaza",
    spec: { type: "vector", rows: 2, cols: 1, expected: [["1"], ["0"]] },
    entrada: [["1"], ["1"]],
    por: "(1,1)ᵀ NO es autovector de 3: (A-3I)(1,1)ᵀ = (1,-1)ᵀ ≠ 0.",
    sympy: "(sp.Matrix([[3,1],[0,3]])-3*sp.eye(2))*sp.Matrix([1,1]) != sp.zeros(2,1)",
  },

  /* --- Pseudoinversa de rango deficiente --- */
  {
    sonda: true, caso: "S3-01", clase: "FP", debe: "rechaza",
    spec: { type: "matrix", rows: 2, cols: 2, expected: [["1/5", "0"], ["2/5", "0"]] },
    entrada: [["1", "0"], ["2", "0"]],
    por: "A = [[1,2],[0,0]] tiene A⁺ = [[1/5,0],[2/5,0]]; sin dividir por ‖A‖²_F = 5 la respuesta es falsa.",
    sympy: "sp.Matrix([[1,2],[0,0]]).pinv() == sp.Matrix([[sp.Rational(1,5),0],[sp.Rational(2,5),0]])",
  },
  {
    sonda: true, caso: "S3-02", clase: "FP", debe: "rechaza",
    spec: { type: "matrix", rows: 2, cols: 2, expected: [["1/5", "0"], ["2/5", "0"]] },
    entrada: [["1/5", "0"], ["0", "0"]],
    por: "Se ha perdido el segundo autovector: A⁺ no es diagonal en esta base.",
    sympy: "sp.Matrix([[1,2],[0,0]]).pinv() != sp.Matrix([[sp.Rational(1,5),0],[0,0]])",
  },
  {
    sonda: true, caso: "S3-03", clase: "FN", debe: "acepta",
    spec: { type: "matrix", rows: 2, cols: 2, expected: [["1/5", "0"], ["2/5", "0"]] },
    entrada: [["0.2", "0"], ["0.4", "0"]],
    por: "1/5 = 0.2 y 2/5 = 0.4: los decimales son las mismas fracciones (vía F_p: 0.2 → 1/5).",
    sympy: "sp.Rational('0.2') == sp.Rational(1,5) and sp.Rational('0.4') == sp.Rational(2,5)",
  },

  /* --- Forma cuadrática degenerada (semidefinida) --- */
  {
    sonda: true, caso: "S4-01", clase: "FN", debe: "acepta",
    spec: { type: "choice", expected: 1, choices: ["<p>Definida positiva.</p>", "<p>Semidefinida positiva.</p>", "<p>Indefinida.</p>", "<p>Definida negativa.</p>"] },
    entrada: "1",
    por: "q(x,y) = x² tiene matriz [[1,0],[0,0]]: semidefinida positiva (autovalor 0). No hay ficha del banco con esta forma: la sonda documenta el hueco.",
    sympy: "sorted(sp.Matrix([[1,0],[0,0]]).eigenvals().keys()) == [0,1]",
  },
  {
    sonda: true, caso: "S4-02", clase: "FP", debe: "rechaza",
    spec: { type: "choice", expected: 1, choices: ["<p>Definida positiva.</p>", "<p>Semidefinida positiva.</p>", "<p>Indefinida.</p>", "<p>Definida negativa.</p>"] },
    entrada: "0",
    por: "«Definida positiva» es falso: hay un autovalor nulo, luego no es definida (no basta con que los autovalores no sean negativos).",
    sympy: "0 in sp.Matrix([[1,0],[0,0]]).eigenvals().keys()",
  },

  /* --- LDLᵀ con pivote nulo --- */
  {
    sonda: true, caso: "S5-01", clase: "FN", debe: "acepta",
    spec: { type: "bool", expected: false },
    entrada: "false",
    por: "A = [[0,1],[1,0]] tiene el pivote del primer paso nulo: sin permutación no hay LDLᵀ. La respuesta correcta es «no» (como en T4-M1).",
    sympy: "sp.Matrix([[0,1],[1,0]])[0,0] == 0",
  },
  {
    sonda: true, caso: "S5-02", clase: "FP", debe: "rechaza",
    spec: { type: "matrix", rows: 2, cols: 2, expected: [["1", "0"], ["0", "1"]] },
    entrada: [["1", "0"], ["1/0", "1"]],
    por: "El alumno «divide» por el pivote nulo: 1/0 debe rechazarse en la celda, no aceptarse como un valor.",
    sympy: "sp.S.One/sp.S.Zero == sp.zoo",
  },
];
