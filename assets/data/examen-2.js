/* ============================================================
   Datos del Examen 2 · Temas III–IV (Aplicaciones lineales ·
   Procesos de triangulación)
   window.CURSO_DATA["examen-2"] — ver docs/schema.md
   12 preguntas: 4 normal (X2-1…X2-4), 4 medio (X2-5…X2-8),
   4 examen (X2-9…X2-12). Reparto: 6 del Tema III y 6 del Tema IV.
   ============================================================ */
window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["examen-2"] = {
  id: "examen-2",
  title: "Examen 2 · Temas III–IV",
  exam: {
    minutes: 120,
    questions: [
      /* ============ NIVEL NORMAL ============ */
      {
        id: "X2-1",
        level: "normal",
        statement:
          "<p>Sea \\(A \\in \\mathbb{R}^{3 \\times 3}\\) una matriz con \\(\\det(A) = -2\\). Calcula \\(\\det(2A^{\\top}A)\\).</p>",
        hint:
          "<p>Usa la homogeneidad del determinante de grado \\(n = 3\\), \\(\\det(\\alpha M) = \\alpha^{3} \\det(M)\\), y después la multiplicatividad: \\(\\det(A^{\\top}A) = \\det(A)^{2}\\).</p>",
        solution: [
          "<p>La matriz \\(A^{\\top}A\\) es de orden \\(3\\), luego por la homogeneidad del determinante: \\(\\det(2A^{\\top}A) = 2^{3} \\det(A^{\\top}A) = 8 \\det(A^{\\top}A)\\).</p>",
          "<p>Por la multiplicatividad y \\(\\det(A^{\\top}) = \\det(A)\\): \\(\\det(A^{\\top}A) = \\det(A^{\\top})\\det(A) = \\det(A)^{2} = (-2)^{2} = 4\\).</p>",
          "<p>Por tanto \\(\\det(2A^{\\top}A) = 8 \\cdot 4 = 32\\).</p>",
          "<p>Cuidado con un error frecuente: \\(\\det(2A^{\\top}A) \\neq 2\\det(A^{\\top}A)\\); el factor \\(2\\) sale elevado al orden de la matriz.</p>",
        ],
        answer: { type: "number", expected: "32", exact: true },
      },
      {
        id: "X2-2",
        level: "normal",
        statement:
          "<p>Calcula el volumen \\(2\\)-dimensional del paralelepípedo \\(P \\subset \\mathbb{R}^{3}\\) generado por las columnas de \\(A = \\begin{pmatrix} 2 & -3 \\\\ 3 & 6 \\\\ 6 & -2 \\end{pmatrix}\\):</p>" +
          "\\[ |P| = \\sqrt{\\det(A^{\\top}A)}. \\]" +
          "<p>Da el resultado como número.</p>",
        hint:
          "<p>Calcula primero \\(A^{\\top}A\\), una matriz \\(2 \\times 2\\) de productos escalares entre columnas. No olvides la raíz: \\(\\det(A^{\\top}A)\\) es el <em>cuadrado</em> del volumen.</p>",
        solution: [
          "<p>Las columnas de \\(A\\) son \\(c_1 = (2, 3, 6)^{\\top}\\) y \\(c_2 = (-3, 6, -2)^{\\top}\\): \\(\\|c_1\\|^{2} = 4 + 9 + 36 = 49\\), \\(\\|c_2\\|^{2} = 9 + 36 + 4 = 49\\) y \\(c_1^{\\top}c_2 = -6 + 18 - 12 = 0\\).</p>",
          "<p>Por tanto \\(A^{\\top}A = \\begin{pmatrix} 49 & 0 \\\\ 0 & 49 \\end{pmatrix}\\) y \\(\\det(A^{\\top}A) = 49^{2} = 2401\\).</p>",
          "<p>El volumen es \\(|P| = \\sqrt{2401} = 49\\). Fíjate en que la fórmula lleva raíz: escribir \\(\\det(A^{\\top}A) = 2401\\) mediría áreas «al cuadrado».</p>",
          "<p>Comprobación geométrica: las columnas son ortogonales, de norma \\(7\\) cada una, y el paralelepípedo es un rectángulo de lados \\(7\\) y \\(7\\); su área es \\(7 \\cdot 7 = 49\\).</p>",
        ],
        answer: { type: "number", expected: "49", exact: true },
      },
      {
        id: "X2-3",
        level: "normal",
        statement:
          "<p>Sea \\(A \\in \\mathbb{R}^{4 \\times 6}\\) una matriz de rango \\(r = 3\\). Aplicando el teorema del rango, calcula \\(\\dim \\mathrm{nul}(A)\\) y \\(\\dim \\mathrm{nul}(A^{\\top})\\).</p>",
        hint:
          "<p>\\(\\mathrm{nul}(A)\\) vive en \\(\\mathbb{R}^{6}\\) (tantas componentes como columnas) y \\(\\mathrm{nul}(A^{\\top})\\) en \\(\\mathbb{R}^{4}\\) (tantas como filas). El teorema del rango resta el rango a esas dimensiones.</p>",
        solution: [
          "<p>Para una matriz de rango \\(r\\) con \\(n = 4\\) filas y \\(m = 6\\) columnas, el teorema del rango da \\(\\dim \\mathrm{nul}(A) = m - r\\) y \\(\\dim \\mathrm{nul}(A^{\\top}) = n - r\\).</p>",
          "<p>\\(\\dim \\mathrm{nul}(A) = 6 - 3 = 3\\) y \\(\\dim \\mathrm{nul}(A^{\\top}) = 4 - 3 = 1\\).</p>",
          "<p>Comprobación de coherencia: \\(\\dim \\mathrm{col}(A) = \\dim \\mathrm{fil}(A) = 3\\), y las sumas del teorema cierran: \\(3 + 3 = 6\\) en \\(\\mathbb{R}^{6}\\) y \\(3 + 1 = 4\\) en \\(\\mathbb{R}^{4}\\).</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            nul: { type: "number", expected: "3", exact: true },
            nulT: { type: "number", expected: "1", exact: true },
          },
          labels: {
            nul: "\\(\\dim \\mathrm{nul}(A)\\)",
            nulT: "\\(\\dim \\mathrm{nul}(A^{\\top})\\)",
          },
        },
      },
      {
        id: "X2-4",
        level: "normal",
        statement:
          "<p>Resuelve por eliminación de Gauss el sistema</p>" +
          "\\[ \\begin{cases} x + y + z = 4, \\\\ 2x - y + z = 8, \\\\ x + 2y - z = -3. \\end{cases} \\]" +
          "<p>Escribe la solución \\((x, y, z)\\) como vector columna.</p>",
        hint:
          "<p>Tras \\(F_2 \\leftarrow F_2 - 2F_1\\) y \\(F_3 \\leftarrow F_3 - F_1\\), intercambia las dos últimas filas para dejar un pivote cómodo en la segunda columna y termina con sustitución atrás.</p>",
        solution: [
          "<p>Matriz ampliada: \\(C = \\left(\\begin{smallmatrix} 1 & 1 & 1 & 4 \\\\ 2 & -1 & 1 & 8 \\\\ 1 & 2 & -1 & -3 \\end{smallmatrix}\\right)\\).</p>",
          "<p>\\(F_2 \\leftarrow F_2 - 2F_1\\) y \\(F_3 \\leftarrow F_3 - F_1\\) dan \\(\\left(\\begin{smallmatrix} 1 & 1 & 1 & 4 \\\\ 0 & -3 & -1 & 0 \\\\ 0 & 1 & -2 & -7 \\end{smallmatrix}\\right)\\); intercambiando \\(F_2 \\leftrightarrow F_3\\) queda \\(\\left(\\begin{smallmatrix} 1 & 1 & 1 & 4 \\\\ 0 & 1 & -2 & -7 \\\\ 0 & -3 & -1 & 0 \\end{smallmatrix}\\right)\\).</p>",
          "<p>\\(F_3 \\leftarrow F_3 + 3F_2\\) da \\(\\left(\\begin{smallmatrix} 1 & 1 & 1 & 4 \\\\ 0 & 1 & -2 & -7 \\\\ 0 & 0 & -7 & -21 \\end{smallmatrix}\\right)\\): de la tercera fila, \\(-7z = -21\\), luego \\(z = 3\\).</p>",
          "<p>Segunda fila: \\(y - 6 = -7\\), luego \\(y = -1\\); primera fila: \\(x - 1 + 3 = 4\\), luego \\(x = 2\\).</p>",
          "<p>La solución es \\((2, -1, 3)^{\\top}\\). Comprueba sustituyendo en las tres ecuaciones: \\(2 - 1 + 3 = 4\\), \\(4 + 1 + 3 = 8\\) y \\(2 - 2 - 3 = -3\\).</p>",
        ],
        answer: {
          type: "vector",
          rows: 3,
          cols: 1,
          expected: [["2"], ["-1"], ["3"]],
        },
      },

      /* ============ NIVEL MEDIO ============ */
      {
        id: "X2-5",
        level: "medio",
        statement:
          "<p>Verdadero o falso: la matriz \\(A = \\begin{pmatrix} 2 & 1 \\\\ 0 & 2 \\end{pmatrix}\\) es diagonalizable sobre \\(\\mathbb{C}\\).</p>",
        hint:
          "<p>El único autovalor es \\(\\lambda = 2\\). Compara su multiplicidad algebraica (exponente en el polinomio característico) con la geométrica, \\(\\dim \\ker(2I - A)\\).</p>",
        solution: [
          "<p>\\(P_A(\\lambda) = \\det(\\lambda I - A) = (\\lambda - 2)^{2}\\): el único autovalor es \\(\\lambda = 2\\), con multiplicidad algebraica \\(2\\).</p>",
          "<p>\\(2I - A = \\begin{pmatrix} 0 & -1 \\\\ 0 & 0 \\end{pmatrix}\\) tiene rango \\(1\\), luego la multiplicidad geométrica es \\(\\dim \\ker(2I - A) = 2 - 1 = 1\\).</p>",
          "<p>Como la multiplicidad geométrica (\\(1\\)) es menor que la algebraica (\\(2\\)), \\(A\\) no es diagonalizable: la respuesta es <strong>falso</strong>. La matriz ya es un bloque de Jordan de orden \\(2\\).</p>",
        ],
        answer: { type: "bool", expected: false },
      },
      {
        id: "X2-6",
        level: "medio",
        statement:
          "<p>Sea \\(A = PLU \\in \\mathbb{R}^{3 \\times 3}\\) una factorización PLU en la que \\(P\\) intercambia las filas \\(1\\) y \\(2\\), \\(L = \\begin{pmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ 3 & 1 & 1 \\end{pmatrix}\\) es unitriangular inferior y \\(U = \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 4 & 5 \\\\ 0 & 0 & 6 \\end{pmatrix}\\). Calcula \\(\\det(A)\\).</p>",
        hint:
          "<p>\\(\\det(A) = \\det(P)\\det(L)\\det(U)\\): el determinante de una permutación es su signo, el de una matriz unitriangular es \\(1\\) y el de una triangular superior es el producto de su diagonal.</p>",
        solution: [
          "<p>\\(P\\) es el intercambio de dos filas: una única transposición, luego \\(\\det(P) = -1\\).</p>",
          "<p>\\(L\\) es unitriangular inferior y el determinante de una matriz triangular es el producto de su diagonal: \\(\\det(L) = 1 \\cdot 1 \\cdot 1 = 1\\).</p>",
          "<p>\\(U\\) es triangular superior y \\(\\det(U) = 1 \\cdot 4 \\cdot 6 = 24\\): el producto de los elementos de su diagonal, no el de su primera fila.</p>",
          "<p>Por la multiplicatividad del determinante: \\(\\det(A) = \\det(P)\\det(L)\\det(U) = (-1) \\cdot 1 \\cdot 24 = -24\\).</p>",
        ],
        answer: { type: "number", expected: "-24", exact: true },
      },
      {
        id: "X2-7",
        level: "medio",
        statement:
          "<p>Ajusta por mínimos cuadrados la recta \\(y = m x + n\\) a los puntos \\((0, 2)\\), \\((1, 2)\\), \\((2, 4)\\) y \\((3, 8)\\). Escribe la pendiente \\(m\\), la ordenada \\(n\\) y la norma del residuo \\(\\|b - Ax\\|_{2}\\) del ajuste.</p>",
        hint:
          "<p>Plantea las ecuaciones normales \\(A^{\\top}A x = A^{\\top}b\\) con la matriz de diseño \\(A = [[X, \\mathbf{1}]]\\). El residuo es \\(e = b - (mX + n\\mathbf{1})\\), y su norma es la raíz de la suma de los cuadrados de sus componentes.</p>",
        solution: [
          "<p>Matriz de diseño \\(A = \\begin{pmatrix} 0 & 1 \\\\ 1 & 1 \\\\ 2 & 1 \\\\ 3 & 1 \\end{pmatrix}\\), \\(b = (2, 2, 4, 8)^{\\top}\\) e incógnita \\(x = (m, n)^{\\top}\\).</p>",
          "<p>\\(A^{\\top}A = \\begin{pmatrix} 14 & 6 \\\\ 6 & 4 \\end{pmatrix}\\) y \\(A^{\\top}b = (34, 16)^{\\top}\\): las ecuaciones normales son \\(\\begin{cases} 14m + 6n = 34, \\\\ 6m + 4n = 16. \\end{cases}\\)</p>",
          "<p>De la segunda ecuación, \\(n = 4 - \\tfrac{3}{2}m\\); sustituyendo en la primera: \\(14m + 24 - 9m = 34\\), luego \\(5m = 10\\), \\(m = 2\\) y \\(n = 1\\).</p>",
          "<p>El ajuste es \\(y = 2x + 1\\); las predicciones son \\((1, 3, 5, 7)\\) y el residuo \\(e = (2-1,\\, 2-3,\\, 4-5,\\, 8-7) = (1, -1, -1, 1)\\).</p>",
          "<p>Por tanto \\(\\|e\\|_{2} = \\sqrt{1 + 1 + 1 + 1} = 2\\). Comprueba que \\(A^{\\top}e = 0\\): el residuo es ortogonal a las columnas de \\(A\\), como exige la condición de mínimos cuadrados.</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            m: { type: "number", expected: "2", exact: true },
            n: { type: "number", expected: "1", exact: true },
            res: { type: "number", expected: "2", exact: true },
          },
          labels: {
            m: "Pendiente \\(m\\)",
            n: "Ordenada \\(n\\)",
            res: "Norma del residuo \\(\\|b - Ax\\|_{2}\\)",
          },
        },
      },
      {
        id: "X2-8",
        level: "medio",
        statement:
          "<p>Calcula los autovalores de la matriz \\(A = \\begin{pmatrix} 3 & 1 & 0 \\\\ 1 & 3 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}\\). Escribe los tres valores separados por punto y coma.</p>",
        hint:
          "<p>El polinomio característico se factoriza por bloques: desarrolla \\(\\det(\\lambda I - A)\\) desplegando por la tercera fila (o columna).</p>",
        solution: [
          "<p>\\(\\det(\\lambda I - A) = \\det \\begin{pmatrix} \\lambda - 3 & -1 & 0 \\\\ -1 & \\lambda - 3 & 0 \\\\ 0 & 0 & \\lambda - 1 \\end{pmatrix} = (\\lambda - 1)\\big[(\\lambda - 3)^{2} - 1\\big]\\).</p>",
          "<p>\\((\\lambda - 3)^{2} - 1 = \\lambda^{2} - 6\\lambda + 8 = (\\lambda - 2)(\\lambda - 4)\\), luego \\(P_A(\\lambda) = (\\lambda - 1)(\\lambda - 2)(\\lambda - 4)\\).</p>",
          "<p>Los autovalores son \\(\\lambda = 1, 2, 4\\): todos reales y simples, coherente con que \\(A\\) sea simétrica.</p>",
          "<p>Comprobación: \\(1 + 2 + 4 = 7 = \\operatorname{tr}(A)\\) y \\(1 \\cdot 2 \\cdot 4 = 8 = \\det(A)\\).</p>",
        ],
        answer: {
          type: "exprset",
          expected: ["4", "2", "1"],
        },
      },

      /* ============ NIVEL EXAMEN ============ */
      {
        id: "X2-9",
        level: "examen",
        statement:
          "<p>Sea \\(f(x) = x^{\\top} A x\\) la forma cuadrática de matriz simétrica \\(A = \\begin{pmatrix} 1 & 2 & 0 \\\\ 2 & 1 & 0 \\\\ 0 & 0 & 3 \\end{pmatrix}\\). Clasifica \\(f\\) según su signo.</p>",
        hint:
          "<p>Los autovalores de la matriz simétrica deciden el signo de la forma cuadrática: calcula el espectro de \\(A\\) por bloques.</p>",
        solution: [
          "<p>La matriz es simétrica por bloques: el bloque \\(\\begin{pmatrix} 1 & 2 \\\\ 2 & 1 \\end{pmatrix}\\) tiene autovalores \\(3\\) y \\(-1\\) (raíces de \\(\\lambda^{2} - 2\\lambda - 3 = 0\\)), y la entrada \\(3\\) de la esquina inferior aporta el autovalor \\(\\lambda = 3\\).</p>",
          "<p>Los autovalores de \\(A\\) son \\(3, 3, -1\\): aparecen autovalores de los dos signos.</p>",
          "<p>Una forma cuadrática con autovalores de ambos signos toma valores positivos y negativos: por ejemplo \\(f(1, 0, 0) = 1 \\gt  0\\) y \\(f(1, -1, 0) = 1 + 1 - 4 = -2 \\lt  0\\). Por tanto \\(f\\) es <strong>indefinida</strong>.</p>",
          "<p>Si todos los autovalores fueran positivos (negativos), \\(f\\) sería definida positiva (negativa); si todos fueran del mismo signo pero con algún cero, semidefinida.</p>",
        ],
        answer: {
          type: "choice",
          expected: 3,
          choices: [
            "<p>Definida positiva.</p>",
            "<p>Definida negativa.</p>",
            "<p>Semidefinida (positiva o negativa), pero no definida.</p>",
            "<p>Indefinida.</p>",
          ],
        },
      },
      {
        id: "X2-10",
        level: "examen",
        statement:
          "<p>Considera el sistema de incógnitas \\(x, y, z\\)</p>" +
          "\\[ \\begin{cases} x + y + z = 1, \\\\ 2x + 3y + 4z = 3, \\\\ 3x + 5y + \\alpha z = \\beta. \\end{cases} \\]" +
          "<p>Determina los valores de \\(\\alpha\\) y \\(\\beta\\) para los que el sistema es compatible indeterminado (infinitas soluciones).</p>",
        hint:
          "<p>Aplica el método de Gauss con parámetros y el teorema de Rouché–Frobenius: hace falta \\(\\operatorname{rng}(A) = \\operatorname{rng}([[A, b]]) \\lt  3\\).</p>",
        solution: [
          "<p>Matriz ampliada \\(C = \\left(\\begin{smallmatrix} 1 & 1 & 1 & 1 \\\\ 2 & 3 & 4 & 3 \\\\ 3 & 5 & \\alpha & \\beta \\end{smallmatrix}\\right)\\).</p>",
          "<p>\\(F_2 \\leftarrow F_2 - 2F_1\\) y \\(F_3 \\leftarrow F_3 - 3F_1\\) dan \\(\\left(\\begin{smallmatrix} 1 & 1 & 1 & 1 \\\\ 0 & 1 & 2 & 1 \\\\ 0 & 2 & \\alpha - 3 & \\beta - 3 \\end{smallmatrix}\\right)\\).</p>",
          "<p>\\(F_3 \\leftarrow F_3 - 2F_2\\) deja \\(\\left(\\begin{smallmatrix} 1 & 1 & 1 & 1 \\\\ 0 & 1 & 2 & 1 \\\\ 0 & 0 & \\alpha - 7 & \\beta - 5 \\end{smallmatrix}\\right)\\).</p>",
          "<p>Por Rouché–Frobenius, el sistema es compatible indeterminado si y solo si \\(\\operatorname{rng}(A) = \\operatorname{rng}([[A, b]]) \\lt  3\\): la tercera fila escalonada debe anularse por completo, es decir \\(\\alpha - 7 = 0\\) y \\(\\beta - 5 = 0\\).</p>",
          "<p>Por tanto \\(\\alpha = 7\\) y \\(\\beta = 5\\). Entonces \\(\\operatorname{rng}(A) = 2 = \\operatorname{rng}([[A, b]]) \\lt  3\\) y la solución depende de un parámetro. Ojo a los otros casos: si \\(\\alpha = 7\\) pero \\(\\beta \\neq 5\\) el sistema es incompatible, y si \\(\\alpha \\neq 7\\) es determinado.</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            alpha: { type: "number", expected: "7", exact: true },
            beta: { type: "number", expected: "5", exact: true },
          },
          labels: {
            alpha: "\\(\\alpha\\)",
            beta: "\\(\\beta\\)",
          },
        },
      },
      {
        id: "X2-11",
        level: "examen",
        statement:
          "<p>Sea \\(A = \\begin{pmatrix} 2 & -1 & 0 \\\\ 1 & 2 & 0 \\\\ 0 & 0 & 3 \\end{pmatrix}\\) y \\(A = Q U Q^{*}\\) su forma de Schur sobre \\(\\mathbb{C}\\), con \\(Q\\) unitaria y \\(U\\) triangular superior. Calcula \\(\\det(U)\\) (recuerda que \\(\\det(U)\\) es el producto de los elementos de su diagonal).</p>",
        hint:
          "<p>La diagonal de \\(U\\) contiene los autovalores de \\(A\\): calcula \\(P_A(\\lambda)\\) por bloques. También puedes usar que \\(Q\\) unitaria implica \\(\\det(U) = \\det(A)\\).</p>",
        solution: [
          "<p>El polinomio característico se factoriza por el bloque superior \\(2 \\times 2\\): \\(\\det(\\lambda I - A) = (\\lambda - 3)\\big[(\\lambda - 2)^{2} + 1\\big]\\).</p>",
          "<p>Las raíces son \\(\\lambda = 3\\) y \\(\\lambda = 2 \\pm i\\): estos son los elementos de la diagonal de \\(U\\), en algún orden.</p>",
          "<p>El determinante de una matriz triangular superior es el producto de su diagonal (no el de su primera fila): \\(\\det(U) = 3 \\cdot (2 + i)(2 - i) = 3 \\cdot (4 - i^{2}) = 3 \\cdot 5 = 15\\).</p>",
          "<p>Comprobación alternativa: \\(\\det(A) = 3 \\cdot (2 \\cdot 2 + 1) = 15\\) y, como \\(Q\\) es unitaria, \\(\\det(A) = \\det(Q)\\det(U)\\det(Q^{*}) = \\det(U)\\,|\\det(Q)|^{2} = \\det(U)\\).</p>",
        ],
        answer: { type: "number", expected: "15", exact: true },
      },
      {
        id: "X2-12",
        level: "examen",
        statement:
          "<p>Aplica el procedimiento de Gram–Schmidt para hallar la factorización QR reducida \\(A = QR\\) de</p>" +
          "\\[ A = \\begin{pmatrix} 1 & 1 \\\\ 1 & 0 \\\\ 1 & 2 \\end{pmatrix}, \\]" +
          "<p>con \\(Q\\) de columnas ortonormales (matriz \\(3 \\times 2\\)) y \\(R\\) triangular superior \\(2 \\times 2\\) de diagonal positiva. Escribe \\(Q\\) y \\(R\\).</p>",
        hint:
          "<p>\\(q_1 = c_1 / \\|c_1\\|\\); después \\(u = c_2 - \\langle q_1, c_2 \\rangle q_1\\) y \\(q_2 = u / \\|u\\|\\). Los coeficientes \\(r_{11} = \\|c_1\\|\\), \\(r_{12} = \\langle q_1, c_2 \\rangle\\) y \\(r_{22} = \\|u\\|\\) forman \\(R\\).</p>",
        solution: [
          "<p>\\(c_1 = (1, 1, 1)^{\\top}\\), \\(\\|c_1\\| = \\sqrt{3}\\), luego \\(q_1 = \\tfrac{1}{\\sqrt{3}}(1, 1, 1)^{\\top}\\) y \\(r_{11} = \\sqrt{3} \\gt  0\\).</p>",
          "<p>\\(r_{12} = \\langle q_1, c_2 \\rangle = \\tfrac{1}{\\sqrt{3}}(1 + 0 + 2) = \\sqrt{3}\\).</p>",
          "<p>\\(u = c_2 - r_{12} q_1 = (1, 0, 2)^{\\top} - (1, 1, 1)^{\\top} = (0, -1, 1)^{\\top}\\), con \\(\\|u\\| = \\sqrt{2}\\); por tanto \\(q_2 = \\tfrac{1}{\\sqrt{2}}(0, -1, 1)^{\\top}\\) y \\(r_{22} = \\sqrt{2} \\gt  0\\).</p>",
          "<p>Así \\(Q = \\begin{pmatrix} 1/\\sqrt{3} & 0 \\\\ 1/\\sqrt{3} & -1/\\sqrt{2} \\\\ 1/\\sqrt{3} & 1/\\sqrt{2} \\end{pmatrix}\\) y \\(R = \\begin{pmatrix} \\sqrt{3} & \\sqrt{3} \\\\ 0 & \\sqrt{2} \\end{pmatrix}\\).</p>",
          "<p>Comprobación: \\(QR = \\begin{pmatrix} 1 & 1 \\\\ 1 & 0 \\\\ 1 & 2 \\end{pmatrix} = A\\) y \\(Q^{\\top}Q = I_{2}\\). Con la convención de diagonal de \\(R\\) estrictamente positiva, la QR reducida es única.</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            Q: {
              type: "matrix",
              rows: 3,
              cols: 2,
              expected: [
                ["1/sqrt(3)", "0"],
                ["1/sqrt(3)", "-1/sqrt(2)"],
                ["1/sqrt(3)", "1/sqrt(2)"],
              ],
            },
            R: {
              type: "matrix",
              rows: 2,
              cols: 2,
              expected: [
                ["sqrt(3)", "sqrt(3)"],
                ["0", "sqrt(2)"],
              ],
            },
          },
          labels: {
            Q: "Matriz \\(Q\\)",
            R: "Matriz \\(R\\)",
          },
        },
      },
    ],
  },
};
