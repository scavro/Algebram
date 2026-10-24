/* ============================================================
   Datos del Examen 1 · Temas I–II (Escalares · Tensores)
   window.CURSO_DATA["examen-1"] — ver docs/schema.md
   12 preguntas: 4 normal (X1-1…X1-4), 4 medio (X1-5…X1-8),
   4 examen (X1-9…X1-12). Reparto: 6 del Tema I y 6 del Tema II.
   ============================================================ */
window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["examen-1"] = {
  id: "examen-1",
  title: "Examen 1 · Temas I–II",
  exam: {
    minutes: 120,
    questions: [
      /* ============ NIVEL NORMAL ============ */
      {
        id: "X1-1",
        level: "normal",
        statement:
          "<p>Escribe en base \\(4\\) el número \\(101\\) (escrito en base diez). Introduce solo la secuencia de cifras de la representación, sin subíndice de base.</p>",
        hint:
          "<p>Divide sucesivamente entre \\(4\\) y anota los restos; la representación se lee de abajo arriba.</p>",
        solution: [
          "<p>\\(101 = 4 \\cdot 25 + 1\\): la cifra de las unidades es \\(1\\).</p>",
          "<p>\\(25 = 4 \\cdot 6 + 1\\): la segunda cifra es \\(1\\).</p>",
          "<p>\\(6 = 4 \\cdot 1 + 2\\) y \\(1 = 4 \\cdot 0 + 1\\): las dos cifras superiores son \\(2\\) y \\(1\\).</p>",
          "<p>Leyendo los restos de abajo arriba, \\(101 = 1211_4\\).</p>",
          "<p>Comprobación posicional: \\(1\\cdot 64 + 2\\cdot 16 + 1\\cdot 4 + 1 = 64 + 32 + 4 + 1 = 101\\).</p>",
        ],
        answer: { type: "text", expected: "1211" },
      },
      {
        id: "X1-2",
        level: "normal",
        statement:
          "<p>Escribe como fracción irreducible el número \\(r = 0{,}\\overline{142857} = 0{,}142857142857\\ldots\\).</p>",
        hint:
          "<p>El periodo tiene \\(6\\) cifras: considera \\(10^{6}r - r\\) y observa cómo se cancela la parte periódica.</p>",
        solution: [
          "<p>\\(10^{6}r = 142857{,}\\overline{142857}\\); al restar \\(r\\) desaparece el periodo: \\(10^{6}r - r = 142857\\).</p>",
          "<p>Así \\(999999\\,r = 142857\\), de donde \\(r = \\dfrac{142857}{999999}\\).</p>",
          "<p>Como \\(999999 = 7 \\cdot 142857\\), la fracción se reduce a \\(r = \\dfrac{1}{7}\\).</p>",
        ],
        answer: { type: "expr", expected: "1/7" },
      },
      {
        id: "X1-3",
        level: "normal",
        statement:
          "<p>Verdadero o falso: si \\(A\\) y \\(B\\) son conjuntos finitos con \\(|A| = 3\\) y \\(|B| = 4\\), entonces hay \\(12\\) funciones de \\(A\\) en \\(B\\).</p>",
        hint:
          "<p>Cada elemento de \\(A\\) puede enviarse a cualquiera de los \\(4\\) elementos de \\(B\\), y las elecciones son independientes.</p>",
        solution: [
          "<p>Una función \\(f : A \\to B\\) se fija eligiendo imagen para cada uno de los \\(3\\) elementos de \\(A\\); cada elección admite \\(4\\) posibilidades.</p>",
          "<p>En total hay \\(4 \\cdot 4 \\cdot 4 = 4^{3} = 64\\) funciones de \\(A\\) en \\(B\\), es decir, \\(|B^{A}| = |B|^{|A|}\\).</p>",
          "<p>El \\(12\\) del enunciado sale de \\(3 \\cdot 4\\), que cuenta pares \\((a,b)\\), no funciones. La afirmación es <strong>falsa</strong>.</p>",
        ],
        answer: { type: "bool", expected: false },
      },
      {
        id: "X1-4",
        level: "normal",
        statement:
          "<p>Sean \\(A = \\begin{pmatrix}1&2&0\\\\0&1&1\\end{pmatrix}\\) y \\(B = \\begin{pmatrix}2&0\\\\1&1\\\\0&2\\end{pmatrix}\\). Calcula \\(\\operatorname{tr}(AB)\\).</p>",
        hint:
          "<p>El producto \\(AB\\) es una matriz \\(2\\times 2\\); la traza es la suma de los dos elementos de su diagonal principal.</p>",
        solution: [
          "<p>\\(AB = \\begin{pmatrix}1\\cdot 2 + 2\\cdot 1 + 0\\cdot 0 & 1\\cdot 0 + 2\\cdot 1 + 0\\cdot 2 \\\\ 0\\cdot 2 + 1\\cdot 1 + 1\\cdot 0 & 0\\cdot 0 + 1\\cdot 1 + 1\\cdot 2\\end{pmatrix} = \\begin{pmatrix}4&2\\\\1&3\\end{pmatrix}\\).</p>",
          "<p>La traza es la suma de la diagonal: \\(\\operatorname{tr}(AB) = 4 + 3 = 7\\).</p>",
          "<p>Comprueba que \\(BA = \\begin{pmatrix}2&4&0\\\\1&3&1\\\\0&2&2\\end{pmatrix}\\) y \\(\\operatorname{tr}(BA) = 2 + 3 + 2 = 7\\): coherente con \\(\\operatorname{tr}(AB) = \\operatorname{tr}(BA)\\).</p>",
        ],
        answer: { type: "number", expected: "7", exact: true },
      },

      /* ============ NIVEL MEDIO ============ */
      {
        id: "X1-5",
        level: "medio",
        statement:
          "<p>Redondea \\(0{,}125\\) a \\(2\\) cifras significativas aplicando el criterio de redondeo al par más cercano.</p>",
        hint:
          "<p>\\(0{,}125\\) está exactamente a mitad de camino entre \\(0{,}12\\) y \\(0{,}13\\): elige el candidato cuya última cifra es par.</p>",
        solution: [
          "<p>A \\(2\\) cifras significativas los candidatos son \\(0{,}12\\) y \\(0{,}13\\), y \\(0{,}125\\) está exactamente a la misma distancia de ambos.</p>",
          "<p>Ante la equidistancia se adopta el candidato con última cifra par: \\(0{,}12\\) termina en \\(2\\) (par) y \\(0{,}13\\) en \\(3\\) (impar).</p>",
          "<p>Por tanto \\(0{,}125 \\approx 0{,}12\\). Este es el criterio del IEEE 754, que evita acumular sesgo al redondear siempre en el mismo sentido.</p>",
        ],
        answer: { type: "expr", expected: "0.12" },
      },
      {
        id: "X1-6",
        level: "medio",
        statement:
          "<p>Sean \\(u = (1,2,2)\\) y \\(v = (2,-1,2)\\) vectores de \\(\\mathbb{R}^{3}\\). Calcula el coseno del ángulo que forman, \\(\\cos(u,v) = \\dfrac{u^{\\top}v}{\\|u\\|\\,\\|v\\|}\\), y da el resultado como fracción.</p>",
        hint:
          "<p>Calcula por separado \\(u^{\\top}v\\), \\(\\|u\\|\\) y \\(\\|v\\|\\); los dos vectores tienen módulo entero.</p>",
        solution: [
          "<p>\\(u^{\\top}v = 1\\cdot 2 + 2\\cdot(-1) + 2\\cdot 2 = 2 - 2 + 4 = 4\\).</p>",
          "<p>\\(\\|u\\| = \\sqrt{1 + 4 + 4} = 3\\) y \\(\\|v\\| = \\sqrt{4 + 1 + 4} = 3\\).</p>",
          "<p>\\(\\cos(u,v) = \\dfrac{4}{3\\cdot 3} = \\dfrac{4}{9}\\). Como \\(0 \\lt  \\frac{4}{9} \\lt  1\\), el ángulo es agudo.</p>",
        ],
        answer: { type: "expr", expected: "4/9" },
      },
      {
        id: "X1-7",
        level: "medio",
        statement:
          "<p>Escribe el cociente \\(w = \\dfrac{3 + 4i}{2 - i}\\) en la forma binómica \\(a + bi\\).</p>",
        hint:
          "<p>Multiplica numerador y denominador por el conjugado del denominador, \\(2 + i\\).</p>",
        solution: [
          "<p>\\(w = \\dfrac{(3 + 4i)(2 + i)}{(2 - i)(2 + i)}\\).</p>",
          "<p>Denominador: \\((2 - i)(2 + i) = 4 - i^{2} = 5\\).</p>",
          "<p>Numerador: \\((3 + 4i)(2 + i) = 6 + 3i + 8i + 4i^{2} = 2 + 11i\\).</p>",
          "<p>Por tanto \\(w = \\dfrac{2 + 11i}{5} = \\dfrac{2}{5} + \\dfrac{11}{5}\\,i\\).</p>",
        ],
        answer: { type: "expr", expected: "2/5+11/5*i" },
      },
      {
        id: "X1-8",
        level: "medio",
        statement:
          "<p>Aplica el procedimiento de Gram–Schmidt a la familia \\(v_1 = (1,1,0)\\), \\(v_2 = (1,0,1)\\) de \\(\\mathbb{R}^{3}\\) y escribe la base ortonormal \\(f_1, f_2\\) resultante. Escribe cada vector como matriz columna.</p>",
        hint:
          "<p>Primero \\(f_1 = v_1/\\|v_1\\|\\); después resta a \\(v_2\\) su proyección sobre \\(v_1\\) y normaliza: \\(\\|u_2\\| = \\sqrt{3/2}\\).</p>",
        solution: [
          "<p>\\(\\|v_1\\| = \\sqrt{2}\\), luego \\(f_1 = \\dfrac{1}{\\sqrt{2}}(1,1,0)\\).</p>",
          "<p>\\(u_2 = v_2 - (f_1^{\\top}v_2) f_1 = (1,0,1) - \\dfrac{1}{2}(1,1,0) = \\left(\\dfrac{1}{2}, -\\dfrac{1}{2}, 1\\right)\\), pues \\(f_1^{\\top}v_2 = \\frac{1}{\\sqrt{2}}\\).</p>",
          "<p>\\(\\|u_2\\| = \\sqrt{\\frac{1}{4} + \\frac{1}{4} + 1} = \\sqrt{\\frac{3}{2}} = \\frac{\\sqrt{6}}{2}\\), de donde \\(f_2 = \\dfrac{u_2}{\\|u_2\\|} = \\dfrac{1}{\\sqrt{6}}(1,-1,2)\\).</p>",
          "<p>Comprobación: \\(f_1^{\\top}f_2 = \\dfrac{1 - 1 + 0}{\\sqrt{12}} = 0\\) y \\(\\|f_1\\| = \\|f_2\\| = 1\\).</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            f1: {
              type: "vector",
              rows: 3,
              cols: 1,
              expected: [["1/sqrt(2)"], ["1/sqrt(2)"], ["0"]],
            },
            f2: {
              type: "vector",
              rows: 3,
              cols: 1,
              expected: [["1/sqrt(6)"], ["-1/sqrt(6)"], ["2/sqrt(6)"]],
            },
          },
          labels: { f1: "Vector f1 (unitario)", f2: "Vector f2 (unitario)" },
        },
      },

      /* ============ NIVEL EXAMEN ============ */
      {
        id: "X1-9",
        level: "examen",
        statement:
          "<p>Resuelve en \\(\\mathbb{C}\\) la ecuación \\(z^{2} + 2z + 5 = 0\\). Escribe las dos soluciones en forma binómica, separadas por punto y coma.</p>",
        hint:
          "<p>La fórmula cuadrática da \\(z = \\dfrac{-2 \\pm \\sqrt{4 - 20}}{2}\\); en \\(\\mathbb{C}\\) la raíz del discriminante es imaginaria pura.</p>",
        solution: [
          "<p>El discriminante es \\(\\Delta = 2^{2} - 4\\cdot 5 = -16\\), y \\(\\sqrt{-16} = 4i\\) en \\(\\mathbb{C}\\).</p>",
          "<p>\\(z = \\dfrac{-2 \\pm 4i}{2} = -1 \\pm 2i\\).</p>",
          "<p>Comprobación: \\((-1 + 2i)^{2} + 2(-1 + 2i) + 5 = (1 - 4i - 4) + (-2 + 4i) + 5 = 0\\).</p>",
        ],
        answer: {
          type: "exprset",
          expected: ["-1+2*i", "-1-2*i"],
        },
      },
      {
        id: "X1-10",
        level: "examen",
        statement:
          "<p>Sea \\(V = \\langle (1,1,0), (0,0,1) \\rangle \\subset \\mathbb{R}^{3}\\) y \\(w = (3,2,1)\\). Calcula la proyección ortogonal \\(\\operatorname{proy}_V(w)\\). Escribe el vector como matriz columna.</p>",
        hint:
          "<p>Los dos generadores de \\(V\\) ya son ortogonales entre sí: la proyección es la suma de las proyecciones sobre cada uno de ellos.</p>",
        solution: [
          "<p>Con \\(v_1 = (1,1,0)\\) y \\(v_2 = (0,0,1)\\) se tiene \\(v_1^{\\top}v_2 = 0\\), luego \\(\\operatorname{proy}_V(w) = \\dfrac{w^{\\top}v_1}{\\|v_1\\|^{2}}v_1 + \\dfrac{w^{\\top}v_2}{\\|v_2\\|^{2}}v_2\\).</p>",
          "<p>\\(w^{\\top}v_1 = 3 + 2 = 5\\), \\(\\|v_1\\|^{2} = 2\\); \\(w^{\\top}v_2 = 1\\), \\(\\|v_2\\|^{2} = 1\\).</p>",
          "<p>\\(\\operatorname{proy}_V(w) = \\dfrac{5}{2}(1,1,0) + 1\\cdot(0,0,1) = \\left(\\dfrac{5}{2}, \\dfrac{5}{2}, 1\\right)\\).</p>",
          "<p>El residuo \\(w - \\operatorname{proy}_V(w) = \\left(\\frac{1}{2}, -\\frac{1}{2}, 0\\right)\\) es ortogonal a \\(v_1\\) y a \\(v_2\\), como debe ser.</p>",
        ],
        answer: {
          type: "vector",
          rows: 3,
          cols: 1,
          expected: [["5/2"], ["5/2"], ["1"]],
        },
      },
      {
        id: "X1-11",
        level: "examen",
        statement: "<p>¿Cuál de las siguientes familias de vectores de \\(\\mathbb{R}^{3}\\) es ortogonal?</p>",
        hint:
          "<p>Una familia es ortogonal si el producto escalar de cada par de vectores distintos se anula (y todos son no nulos).</p>",
        solution: [
          "<p>A: \\((1,1,0)^{\\top}(0,1,1) = 1 \\neq 0\\): no es ortogonal.</p>",
          "<p>B: \\((1,2,2)^{\\top}(2,-1,2) = 2 - 2 + 4 = 4 \\neq 0\\): no es ortogonal.</p>",
          "<p>C: \\((2,2,1)^{\\top}(2,-1,-2) = 4 - 2 - 2 = 0\\), y ninguno de los dos vectores es nulo: la familia es ortogonal.</p>",
          "<p>D: \\((3,0,4)^{\\top}(4,0,3) = 12 + 12 = 24 \\neq 0\\). Ojo: con \\((4,0,-3)\\) sí sería ortogonal.</p>",
        ],
        answer: {
          type: "choice",
          expected: 2,
          choices: [
            "<p>A: \\(\\{(1,1,0),\\ (0,1,1)\\}\\)</p>",
            "<p>B: \\(\\{(1,2,2),\\ (2,-1,2)\\}\\)</p>",
            "<p>C: \\(\\{(2,2,1),\\ (2,-1,-2)\\}\\)</p>",
            "<p>D: \\(\\{(3,0,4),\\ (4,0,3)\\}\\)</p>",
          ],
        },
      },
      {
        id: "X1-12",
        level: "examen",
        statement:
          "<p>Sea \\(M = \\begin{pmatrix} I_2 & B \\\\ 0 & I_2 \\end{pmatrix}\\), con \\(B = \\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\) e \\(I_2\\) la matriz identidad de orden \\(2\\). Calcula \\(M^{-1}\\) utilizando la estructura por bloques.</p>",
        hint:
          "<p>Busca la inversa en la misma forma \\(\\begin{pmatrix} I_2 & X \\\\ 0 & I_2 \\end{pmatrix}\\) e impone \\(M M^{-1} = I_4\\).</p>",
        solution: [
          "<p>Sea \\(N = \\begin{pmatrix} I_2 & X \\\\ 0 & I_2 \\end{pmatrix}\\); el producto por bloques da \\(MN = \\begin{pmatrix} I_2 & X + B \\\\ 0 & I_2 \\end{pmatrix}\\).</p>",
          "<p>Para que \\(MN = I_4\\) hace falta \\(X + B = 0\\), es decir, \\(X = -B\\).</p>",
          "<p>Por tanto \\(M^{-1} = \\begin{pmatrix} I_2 & -B \\\\ 0 & I_2 \\end{pmatrix} = \\begin{pmatrix} 1 & 0 & -1 & -2 \\\\ 0 & 1 & -3 & -4 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{pmatrix}\\).</p>",
          "<p>Comprobación: \\(\\begin{pmatrix} I_2 & B \\\\ 0 & I_2 \\end{pmatrix}\\begin{pmatrix} I_2 & -B \\\\ 0 & I_2 \\end{pmatrix} = \\begin{pmatrix} I_2 & -B + B \\\\ 0 & I_2 \\end{pmatrix} = I_4\\).</p>",
        ],
        answer: {
          type: "matrix",
          rows: 4,
          cols: 4,
          expected: [
            ["1", "0", "-1", "-2"],
            ["0", "1", "-3", "-4"],
            ["0", "0", "1", "0"],
            ["0", "0", "0", "1"],
          ],
        },
      },
    ],
  },
};
