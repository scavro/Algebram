/* ============================================================
   Tema III — Aplicaciones lineales y multilineales
   window.CURSO_DATA["tema-3"]: summary, mindmap, drills
   (6 normal · 5 medio · 4 examen)
   ============================================================ */
window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["tema-3"] = {
  id: "tema-3",
  title: "Aplicaciones lineales y multilineales",

  summary: [
    {
      h: "Definiciones clave",
      items: [
        "Aplicación lineal: \\(f(\\alpha u + \\beta v) = \\alpha f(u) + \\beta f(v)\\); entre espacios finitos toda aplicación lineal es \\(f(x) = Ax\\) para una única matriz \\(A\\).",
        "Forma multilineal: lineal en cada variable con las demás fijas; \\(g(u,v) = u^{\\top}Av\\) es bilineal y \\(g(u,v) = u^{*}Av\\) sesquilineal.",
        "Determinante: única forma multilineal antisimétrica con \\(\\det(I_n) = 1\\); \\(\\det(A) = 0 \\iff A\\) no invertible.",
        "Volumen \\(k\\)-dimensional del paralelepípedo de \\(A \\in \\mathbb{R}^{n \\times k}\\): \\(|P| = \\sqrt{\\det(A^{\\top}A)}\\), y si \\(n = k\\), \\(|P| = |\\det A|\\).",
        "Los cuatro subespacios: \\(\\mathrm{col}(A)\\), \\(\\mathrm{fil}(A) = \\mathrm{col}(A^{\\top})\\), \\(\\mathrm{nul}(A)\\) y \\(\\mathrm{nul}(A^{\\top})\\).",
        "Núcleo generalizado: \\(\\ker B^{p}\\), la primera potencia en la que la cadena \\(\\ker B \\subset \\ker B^{2} \\subset \\cdots\\) se estabiliza.",
        "Autovalor \\(\\lambda\\) y autovector \\(u \\neq 0\\): \\(Au = \\lambda u\\), es decir \\(u \\in \\ker(\\lambda I - A)\\); polinomio característico \\(P_A(\\lambda) = \\det(\\lambda I - A)\\).",
        "Forma cuadrática: \\(f(u) = u^{*}Au\\) con \\(A\\) hermítica (simétrica si \\(K = \\mathbb{R}\\)); su matriz se recupera con \\(a_{ij} = \\frac{f(e_i + e_j) - f(e_i) - f(e_j)}{2}\\).",
      ],
    },
    {
      h: "Resultados que hay que saber",
      items: [
        "\\(f(\\alpha u + \\beta v) = \\alpha f(u) + \\beta f(v)\\) para \\(f(x) = Ax\\); la composición \\(g \\circ f\\) tiene matriz \\(BA\\) si \\(f(x) = Ax\\) y \\(g(y) = By\\).",
        "\\(\\det(\\alpha A) = \\alpha^{n}\\det(A)\\), \\(\\det(AB) = \\det(A)\\det(B)\\), \\(\\det(A^{\\top}) = \\det(A)\\) y \\(\\det(A^{-1}) = 1/\\det(A)\\).",
        "El determinante no se altera al sumar a una columna combinación lineal de las demás; cambia de signo al permutar dos columnas.",
        "Matrices especiales: triangular \\(\\Rightarrow\\) producto de la diagonal; por bloques \\(\\det\\begin{pmatrix} A &amp; C \\\\ 0 &amp; B \\end{pmatrix} = \\det(A)\\det(B)\\).",
        "Teorema del rango: \\(\\mathrm{col}(A) \\oplus \\mathrm{nul}(A^{\\top}) = \\mathbb{K}^n\\) y \\(\\mathrm{fil}(A) \\oplus \\mathrm{nul}(A) = \\mathbb{K}^m\\) (sobre \\(\\mathbb{C}\\), con la adjunta: \\(\\mathrm{col}(A) \\oplus \\mathrm{nul}(A^{*})\\) y \\(\\mathrm{col}(A^{*}) \\oplus \\mathrm{nul}(A)\\)); con \\(r = \\operatorname{rng}A\\): \\(\\dim\\mathrm{nul}(A) = m - r\\), \\(\\dim\\mathrm{nul}(A^{\\top}) = n - r\\).",
        "El autovalor \\(\\lambda\\) tiene multiplicidad algebraica \\(m_j\\) (exponente en \\(P_A\\)) y geométrica \\(\\dim\\ker(\\lambda I - A) \\le m_j\\); además \\(m_j = \\dim\\ker^{\\infty}(\\lambda I - A)\\).",
        "\\(\\det(A) = (-1)^n P_A(0) = \\lambda_1^{m_1} \\cdots \\lambda_p^{m_p}\\) y \\(P_A(A) = 0\\) (Cayley-Hamilton).",
        "Toda matriz \\(B^{\\top}B\\) es simétrica semidefinida positiva; \\(A\\) es definida positiva si \\(x^{\\top}Ax \\gt  0\\) para todo \\(x \\neq 0\\).",
      ],
    },
    {
      h: "Errores frecuentes",
      items: [
        "Creer que \\(\\det(A + B) = \\det(A) + \\det(B)\\): el determinante es multilineal, no lineal; por ejemplo \\(\\det(2A) = 2^{n}\\det(A)\\), no \\(2\\det(A)\\).",
        "Olvidar que \\(\\det(A) = 0\\) equivale a que las columnas de \\(A\\) sean linealmente dependientes (\\(A\\) no invertible).",
        "Confundir la multiplicidad algebraica (exponente en \\(P_A\\)) con la geométrica (\\(\\dim\\ker(\\lambda I - A)\\)): la segunda nunca supera a la primera y puede ser menor.",
        "Escribir el volumen como \\(\\det(A^{\\top}A)\\) en vez de \\(\\sqrt{\\det(A^{\\top}A)}\\), o confundir \\(\\mathrm{col}(A)\\) (en \\(\\mathbb{K}^n\\)) con \\(\\mathrm{fil}(A)\\) (en \\(\\mathbb{K}^m\\)).",
        "Aplicar a \\(\\mathbb{C}\\) el vocabulario de \\(\\mathbb{R}\\): una forma sesquilineal se dice hermítica, no «simétrica», y sobre \\(\\mathbb{R}\\) bilineal y sesquilineal coinciden.",
      ],
    },
    {
      h: "Conexiones con la IA",
      items: [
        "El determinante mide el factor de escala de volumen de una transformación: es el corazón del cambio de variables (Jacobiano) y de la normalización de densidades.",
        "Los cuatro subespacios separan la información efectiva (\\(\\mathrm{col}\\): grados de libertad de los datos) de la redundancia (\\(\\mathrm{nul}\\): dependencias entre variables).",
        "Los autovalores de la matriz de covarianza ordenados de mayor a menor dan las componentes principales del PCA.",
        "La Hessiana de la función de pérdida es una forma cuadrática: sus autovalores dirigen la optimización de segundo orden.",
        "Las funciones de pérdida de errores cuadráticos y los kernels de procesos gaussianos son formas cuadráticas o bilineales: \\(x^{\\top}Ax\\) y \\(u^{\\top}v\\).",
      ],
    },
  ],

  mindmap: {
    label: "Tema III · Aplicaciones lineales y multilineales",
    detail:
      "Las matrices como aplicaciones: linealidad, multilinealidad, determinante, subespacios, autovalores y formas cuadráticas.",
    children: [
      {
        label: "Aplicaciones lineales",
        detail:
          "\\(f(x) = Ax\\) es lineal; recíprocamente, toda aplicación lineal tiene matriz \\(A = [f(e_1) \\cdots f(e_m)]\\).",
        children: [
          {
            label: "Composición",
            detail: "Si \\(f(x) = Ax\\) y \\(g(y) = By\\), la matriz de \\(g \\circ f\\) es \\(BA\\).",
          },
          {
            label: "Núcleo e imagen",
            detail:
              "\\(\\mathrm{nul}(A) = \\{u : Au = 0\\}\\) y \\(\\mathrm{col}(A) = \\operatorname{gen}\\{\\text{columnas}\\}\\); \\(\\operatorname{rng}A = \\dim\\mathrm{col}(A)\\).",
          },
        ],
      },
      {
        label: "Aplicaciones multilineales",
        detail:
          "Linealidad en cada variable con las demás fijas: bilineales \\(g(u,v) = u^{\\top}Av\\), sesquilineales \\(u^{*}Av\\), y \\(n\\)-lineales sobre tensores de orden \\(n\\).",
      },
      {
        label: "Determinante",
        detail:
          "Única forma multilineal antisimétrica con \\(\\det(I) = 1\\): \\(\\det(AB) = \\det(A)\\det(B)\\), \\(\\det(A^{\\top}) = \\det(A)\\).",
        children: [
          {
            label: "Matrices especiales",
            detail:
              "Triangular: producto de la diagonal. Por bloques: \\(\\det = \\det(A)\\det(B)\\).",
          },
          {
            label: "Volumen",
            detail:
              "\\(|P| = \\sqrt{\\det(A^{\\top}A)}\\), y si \\(n = k\\), \\(|P| = |\\det A|\\): factor de escala del cambio de variables.",
          },
        ],
      },
      {
        label: "Cuatro subespacios",
        detail:
          "\\(\\mathrm{col}(A)\\), \\(\\mathrm{fil}(A)\\), \\(\\mathrm{nul}(A)\\) y \\(\\mathrm{nul}(A^{\\top})\\); teorema del rango: \\(r + \\dim\\mathrm{nul}(A) = m\\).",
        children: [
          {
            label: "Núcleo generalizado",
            detail:
              "\\(\\ker B^{p}\\) con \\(\\ker B^{p-1} \\neq \\ker B^{p} = \\ker B^{p+1}\\); base de los autovectores generalizados.",
          },
        ],
      },
      {
        label: "Autovalores",
        detail:
          "\\(Au = \\lambda u\\); \\(P_A(\\lambda) = \\det(\\lambda I - A)\\); multiplicidad algebraica y geométrica; \\(P_A(A) = 0\\) (Cayley-Hamilton).",
      },
      {
        label: "Formas cuadráticas",
        detail:
          "\\(f(u) = u^{*}Au\\) con \\(A\\) hermítica; definida positiva si \\(x^{\\top}Ax \\gt  0\\); su diagonalización ortogonal se ve en el Tema V.",
      },
    ],
  },

  drills: [
    /* ---------------------------- NORMAL ---------------------------- */
    {
      id: "T3-N1",
      level: "normal",
      statement:
        "<p>Calcula el determinante de la matriz \\(A = \\begin{pmatrix} 3 &amp; 1 \\\\ 2 &amp; 4 \\end{pmatrix}\\).</p>",
      hint: "<p>En \\(2 \\times 2\\): \\(\\det A = a_{11}a_{22} - a_{12}a_{21}\\).</p>",
      solution: [
        "<p>Aplicamos la fórmula del determinante de orden 2.</p>",
        "<p>\\(\\det A = 3 \\cdot 4 - 1 \\cdot 2 = 12 - 2 = 10\\).</p>",
      ],
      answer: { type: "number", expected: "10", exact: true },
    },
    {
      id: "T3-N2",
      level: "normal",
      statement:
        "<p>Calcula el determinante de \\(A = \\begin{pmatrix} 2 &amp; 0 &amp; 1 \\\\ 1 &amp; 3 &amp; 2 \\\\ 4 &amp; 1 &amp; 5 \\end{pmatrix}\\) desarrollando por la primera fila.</p>",
      hint: "<p>\\(\\det A = a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}\\), con \\(M_{ij}\\) los menores.</p>",
      solution: [
        "<p>Desarrollamos por la primera fila: \\(\\det A = 2\\det\\begin{pmatrix} 3 &amp; 2 \\\\ 1 &amp; 5 \\end{pmatrix} - 0 + 1\\det\\begin{pmatrix} 1 &amp; 3 \\\\ 4 &amp; 1 \\end{pmatrix}\\).</p>",
        "<p>\\(\\det\\begin{pmatrix} 3 &amp; 2 \\\\ 1 &amp; 5 \\end{pmatrix} = 15 - 2 = 13\\) y \\(\\det\\begin{pmatrix} 1 &amp; 3 \\\\ 4 &amp; 1 \\end{pmatrix} = 1 - 12 = -11\\).</p>",
        "<p>\\(\\det A = 2 \\cdot 13 - 11 = 26 - 11 = 15\\).</p>",
      ],
      answer: { type: "number", expected: "15", exact: true },
    },
    {
      id: "T3-N3",
      level: "normal",
      statement:
        "<p>Sea \\(A \\in \\mathbb{R}^{3 \\times 3}\\) con \\(\\det(A) = -2\\) y \\(B \\in \\mathbb{R}^{3 \\times 3}\\) con \\(\\det(B) = 3\\). Calcula \\(\\det(AB)\\) y \\(\\det(A^{-1})\\).</p>",
      hint: "<p>\\(\\det(AB) = \\det(A)\\det(B)\\) y \\(\\det(A^{-1}) = 1/\\det(A)\\).</p>",
      solution: [
        "<p>Por la multiplicatividad del determinante: \\(\\det(AB) = \\det(A)\\det(B) = (-2) \\cdot 3 = -6\\).</p>",
        "<p>Como \\(A\\) es invertible (\\(\\det(A) \\neq 0\\)): \\(\\det(A^{-1}) = \\dfrac{1}{\\det(A)} = -\\dfrac{1}{2}\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          detAB: { type: "number", expected: "-6", exact: true },
          detInv: { type: "number", expected: "-1/2" },
        },
        labels: { detAB: "det(AB)", detInv: "det(A inversa)" },
      },
    },
    {
      id: "T3-N4",
      level: "normal",
      statement:
        "<p>Calcula el rango de la matriz \\(A = \\begin{pmatrix} 1 &amp; 2 &amp; 3 \\\\ 2 &amp; 4 &amp; 6 \\\\ 1 &amp; 1 &amp; 1 \\end{pmatrix}\\).</p>",
      hint: "<p>Busca combinaciones lineales entre las filas (o las columnas) y cuenta las independientes.</p>",
      solution: [
        "<p>Observa que la segunda fila es el doble de la primera: \\((2, 4, 6) = 2 \\cdot (1, 2, 3)\\).</p>",
        "<p>Las filas primera y tercera, \\((1, 2, 3)\\) y \\((1, 1, 1)\\), no son proporcionales, luego son linealmente independientes.</p>",
        "<p>Por tanto \\(\\operatorname{rng} A = 2\\).</p>",
      ],
      answer: { type: "number", expected: "2", exact: true },
    },
    {
      id: "T3-N5",
      level: "normal",
      statement:
        "<p>Calcula los autovalores de la matriz \\(A = \\begin{pmatrix} 4 &amp; 7 \\\\ 0 &amp; -2 \\end{pmatrix}\\). Escribe los valores separados por punto y coma.</p>",
      hint: "<p>El polinomio característico de una matriz triangular son las raíces de su diagonal.</p>",
      solution: [
        "<p>\\(A\\) es triangular superior, luego \\(P_A(\\lambda) = (\\lambda - 4)(\\lambda + 2)\\).</p>",
        "<p>Las raíces son \\(\\lambda = 4\\) y \\(\\lambda = -2\\).</p>",
      ],
      answer: { type: "exprset", expected: ["4", "-2"] },
    },
    {
      id: "T3-N6",
      level: "normal",
      statement:
        "<p>Sea la forma cuadrática \\(f(x) = x^{\\top} A x\\) con \\(A = \\begin{pmatrix} 2 &amp; 1 \\\\ 1 &amp; 3 \\end{pmatrix}\\). Evalúa \\(f\\) en \\(x = (1, -1)\\).</p>",
      hint: "<p>Primero calcula \\(Ax\\) y después el producto escalar \\(x^{\\top}(Ax)\\).</p>",
      solution: [
        "<p>\\(Ax = \\begin{pmatrix} 2 &amp; 1 \\\\ 1 &amp; 3 \\end{pmatrix}\\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix} = \\begin{pmatrix} 1 \\\\ -2 \\end{pmatrix}\\).</p>",
        "<p>\\(f(x) = x^{\\top}(Ax) = 1 \\cdot 1 + (-1) \\cdot (-2) = 1 + 2 = 3\\).</p>",
      ],
      answer: { type: "number", expected: "3", exact: true },
    },

    /* ---------------------------- MEDIO ---------------------------- */
    {
      id: "T3-M1",
      level: "medio",
      statement:
        "<p>Sea \\(A = \\begin{pmatrix} 1 &amp; 1 &amp; 0 \\\\ 0 &amp; 1 &amp; 1 \\\\ 1 &amp; 2 &amp; 1 \\end{pmatrix}\\). Halla el vector del núcleo de \\(A\\) cuya tercera componente vale \\(1\\) y escríbelo como columna de tres componentes.</p>",
      hint: "<p>Resuelve \\(Au = 0\\): son dos ecuaciones independientes en tres incógnitas; fija \\(u_3 = 1\\) al final.</p>",
      solution: [
        "<p>\\(Au = 0\\) da el sistema \\(\\begin{cases} u_1 + u_2 = 0 \\\\ u_2 + u_3 = 0 \\\\ u_1 + 2u_2 + u_3 = 0 \\end{cases}\\); la tercera ecuación es suma de las dos primeras.</p>",
        "<p>De la primera, \\(u_1 = -u_2\\); de la segunda, \\(u_3 = -u_2\\). Luego \\(u = t(1, -1, 1)\\).</p>",
        "<p>Imponiendo \\(u_3 = 1\\) se obtiene \\(t = 1\\), es decir \\(u = (1, -1, 1)\\).</p>",
      ],
      answer: {
        type: "vector",
        rows: 3,
        cols: 1,
        expected: [["1"], ["-1"], ["1"]],
      },
    },
    {
      id: "T3-M2",
      level: "medio",
      statement:
        "<p>Para \\(A = \\begin{pmatrix} 1 &amp; 2 &amp; 3 \\\\ 2 &amp; 4 &amp; 6 \\\\ 1 &amp; 1 &amp; 1 \\end{pmatrix}\\) calcula las dimensiones de los cuatro subespacios fundamentales: \\(\\mathrm{col}(A)\\), \\(\\mathrm{fil}(A)\\), \\(\\mathrm{nul}(A)\\) y \\(\\mathrm{nul}(A^{\\top})\\).</p>",
      hint: "<p>El rango ya se calculó en T3-N4. Aplica el teorema del rango: \\(\\dim\\mathrm{nul}(A) = m - r\\) y \\(\\dim\\mathrm{nul}(A^{\\top}) = n - r\\).</p>",
      solution: [
        "<p>La matriz tiene \\(m = n = 3\\) y \\(r = \\operatorname{rng} A = 2\\) (la fila 2 es doble de la 1).</p>",
        "<p>\\(\\dim\\mathrm{col}(A) = r = 2\\) y \\(\\dim\\mathrm{fil}(A) = \\operatorname{rng}(A^{\\top}) = r = 2\\).</p>",
        "<p>\\(\\dim\\mathrm{nul}(A) = 3 - 2 = 1\\) y \\(\\dim\\mathrm{nul}(A^{\\top}) = 3 - 2 = 1\\).</p>",
        "<p>Comprobación: \\(\\mathrm{col}(A) \\oplus \\mathrm{nul}(A^{\\top}) = \\mathbb{R}^3\\) y \\(\\mathrm{fil}(A) \\oplus \\mathrm{nul}(A) = \\mathbb{R}^3\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          col: { type: "number", expected: "2", exact: true },
          fil: { type: "number", expected: "2", exact: true },
          nul: { type: "number", expected: "1", exact: true },
          nulT: { type: "number", expected: "1", exact: true },
        },
        labels: {
          col: "dim col(A)",
          fil: "dim fil(A)",
          nul: "dim nul(A)",
          nulT: "dim nul(A traspuesta)",
        },
      },
    },
    {
      id: "T3-M3",
      level: "medio",
      statement:
        "<p>Sea \\(A = \\begin{pmatrix} 2 &amp; 1 &amp; 0 \\\\ 0 &amp; 2 &amp; 0 \\\\ 0 &amp; 0 &amp; 3 \\end{pmatrix}\\). Indica la multiplicidad algebraica y la multiplicidad geométrica del autovalor \\(\\lambda = 2\\).</p>",
      hint: "<p>La multiplicidad algebraica es el exponente de \\((\\lambda - 2)\\) en \\(P_A\\); la geométrica es \\(\\dim\\ker(2I - A)\\).</p>",
      solution: [
        "<p>\\(A\\) es triangular, luego \\(P_A(\\lambda) = (\\lambda - 2)^2 (\\lambda - 3)\\): la multiplicidad algebraica de \\(\\lambda = 2\\) es \\(2\\).</p>",
        "<p>\\(2I - A = \\begin{pmatrix} 0 &amp; -1 &amp; 0 \\\\ 0 &amp; 0 &amp; 0 \\\\ 0 &amp; 0 &amp; -1 \\end{pmatrix}\\), cuyo núcleo es \\(\\{(t, 0, 0) : t \\in \\mathbb{R}\\}\\).</p>",
        "<p>\\(\\dim\\ker(2I - A) = 1\\): la multiplicidad geométrica es \\(1\\) (menor que la algebraica: \\(A\\) no es diagonalizable).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          malg: { type: "number", expected: "2", exact: true },
          mgeo: { type: "number", expected: "1", exact: true },
        },
        labels: { malg: "Multiplicidad algebraica", mgeo: "Multiplicidad geométrica" },
      },
    },
    {
      id: "T3-M4",
      level: "medio",
      statement:
        "<p>Verdadero o falso: si \\(A \\in \\mathbb{R}^{n \\times n}\\) es simétrica, entonces todos sus autovalores son números reales.</p>",
      hint: "<p>Piensa en el teorema espectral para matrices reales simétricas (se demuestra en el Tema V).</p>",
      solution: [
        "<p>Verdadero. El teorema espectral afirma que toda matriz real simétrica tiene autovalores reales y una base de autovectores ortonormal.</p>",
        "<p>La hipótesis de simetría es esencial: \\(B = \\begin{pmatrix} 1 &amp; -1 \\\\ 1 &amp; 1 \\end{pmatrix}\\) tiene \\(P_B(\\lambda) = \\lambda^2 - 2\\lambda + 2\\), con autovalores \\(1 \\pm i\\).</p>",
      ],
      answer: { type: "bool", expected: true },
    },
    {
      id: "T3-M5",
      level: "medio",
      statement:
        "<p>Dada la forma cuadrática \\(f(x) = x_1^2 + 2x_1x_2 + 6x_1x_3 + 2x_2^2 + 4x_2x_3 + 3x_3^2\\), escribe la matriz simétrica \\(A\\) tal que \\(f(x) = x^{\\top}Ax\\).</p>",
      hint: "<p>En la diagonal van los coeficientes de los cuadrados; fuera, \\(a_{ij}\\) es la mitad del coeficiente de \\(x_ix_j\\).</p>",
      solution: [
        "<p>Los términos cuadráticos dan la diagonal: \\(a_{11} = 1\\), \\(a_{22} = 2\\), \\(a_{33} = 3\\).</p>",
        "<p>El coeficiente de \\(2x_1x_2\\) es \\(2 = 2a_{12}\\), luego \\(a_{12} = a_{21} = 1\\); de \\(6x_1x_3\\): \\(a_{13} = a_{31} = 3\\); de \\(4x_2x_3\\): \\(a_{23} = a_{32} = 2\\).</p>",
        "<p>\\(A = \\begin{pmatrix} 1 &amp; 1 &amp; 3 \\\\ 1 &amp; 2 &amp; 2 \\\\ 3 &amp; 2 &amp; 3 \\end{pmatrix}\\). Comprueba expandiendo \\(x^{\\top}Ax\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 3,
        cols: 3,
        expected: [["1", "1", "3"], ["1", "2", "2"], ["3", "2", "3"]],
      },
    },

    /* ---------------------------- EXAMEN ---------------------------- */
    {
      id: "T3-E1",
      level: "examen",
      statement:
        "<p>Calcula el determinante de \\(D = \\begin{pmatrix} 1 &amp; 2 &amp; 3 &amp; 4 \\\\ 3 &amp; 4 &amp; 5 &amp; 6 \\\\ 0 &amp; 0 &amp; 2 &amp; 1 \\\\ 0 &amp; 0 &amp; 1 &amp; 2 \\end{pmatrix}\\).</p>",
      hint: "<p>\\(D\\) es triangular por bloques: \\(\\det\\begin{pmatrix} A &amp; C \\\\ 0 &amp; B \\end{pmatrix} = \\det(A)\\det(B)\\).</p>",
      solution: [
        "<p>Los bloques son \\(A = \\begin{pmatrix} 1 &amp; 2 \\\\ 3 &amp; 4 \\end{pmatrix}\\) y \\(B = \\begin{pmatrix} 2 &amp; 1 \\\\ 1 &amp; 2 \\end{pmatrix}\\), con \\(C\\) arbitrario y el bloque inferior izquierdo nulo.</p>",
        "<p>\\(\\det(A) = 4 - 6 = -2\\) y \\(\\det(B) = 4 - 1 = 3\\).</p>",
        "<p>\\(\\det(D) = \\det(A)\\det(B) = (-2) \\cdot 3 = -6\\).</p>",
      ],
      answer: { type: "number", expected: "-6", exact: true },
    },
    {
      id: "T3-E2",
      level: "examen",
      statement:
        "<p>Sea \\(A = \\begin{pmatrix} 2 &amp; 1 &amp; 1 \\\\ 1 &amp; 2 &amp; 1 \\\\ 1 &amp; 1 &amp; 2 \\end{pmatrix}\\). Calcula su mayor autovalor y un autovector asociado de primera componente \\(1\\).</p>",
      hint: "<p>Suma las filas para adivinar un autovector; el polinomio característico es \\((\\lambda - 4)(\\lambda - 1)^2\\).</p>",
      solution: [
        "<p>Cada fila suma \\(4\\), luego \\(A(1, 1, 1)^{\\top} = (4, 4, 4)^{\\top} = 4(1, 1, 1)^{\\top}\\): \\(\\lambda = 4\\) es autovalor con autovector \\((1, 1, 1)\\).</p>",
        "<p>\\(P_A(\\lambda) = (\\lambda - 4)(\\lambda - 1)^2\\), luego los autovalores son \\(4\\) (simple) y \\(1\\) (doble); el mayor es \\(\\lambda = 4\\).</p>",
        "<p>Un autovector asociado con primera componente \\(1\\) es \\((1, 1, 1)\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          lam: { type: "number", expected: "4", exact: true },
          v: {
            type: "vector",
            rows: 3,
            cols: 1,
            expected: [["1"], ["1"], ["1"]],
          },
        },
        labels: { lam: "Mayor autovalor", v: "Autovector (columna)" },
      },
    },
    {
      id: "T3-E3",
      level: "examen",
      statement:
        "<p>Sea \\(A = \\begin{pmatrix} 1 &amp; 0 &amp; 1 &amp; 1 \\\\ 0 &amp; 1 &amp; 1 &amp; 2 \\\\ 1 &amp; 1 &amp; 2 &amp; 3 \\end{pmatrix}\\). Calcula las dimensiones de \\(\\mathrm{col}(A)\\), \\(\\mathrm{fil}(A)\\), \\(\\mathrm{nul}(A)\\) y \\(\\mathrm{nul}(A^{\\top})\\).</p>",
      hint: "<p>La tercera fila es la suma de las dos primeras. El teorema del rango da las dimensiones de los núcleos.</p>",
      solution: [
        "<p>La fila 3 es \\(\\mathrm{fil}_1 + \\mathrm{fil}_2\\), y las filas 1 y 2 son independientes: \\(r = \\operatorname{rng} A = 2\\).</p>",
        "<p>\\(\\dim\\mathrm{col}(A) = \\dim\\mathrm{fil}(A) = 2\\).</p>",
        "<p>Con \\(m = 4\\) columnas y \\(n = 3\\) filas: \\(\\dim\\mathrm{nul}(A) = 4 - 2 = 2\\) y \\(\\dim\\mathrm{nul}(A^{\\top}) = 3 - 2 = 1\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          col: { type: "number", expected: "2", exact: true },
          fil: { type: "number", expected: "2", exact: true },
          nul: { type: "number", expected: "2", exact: true },
          nulT: { type: "number", expected: "1", exact: true },
        },
        labels: {
          col: "dim col(A)",
          fil: "dim fil(A)",
          nul: "dim nul(A)",
          nulT: "dim nul(A traspuesta)",
        },
      },
    },
    {
      id: "T3-E4",
      level: "examen",
      statement:
        "<p>Sea \\(A, B \\in \\mathbb{R}^{n \\times n}\\). ¿Cuál de las siguientes afirmaciones es siempre cierta?</p>",
      hint: "<p>Razona con las propiedades del determinante y busca contraejemplos sencillos para las demás.</p>",
      solution: [
        "<p>La afirmación correcta es \\(\\det(AB) = \\det(A)\\det(B)\\): es la multiplicatividad del determinante.</p>",
        "<p>\\(\\det(A + B) = \\det(A) + \\det(B)\\) es falsa: con \\(A = \\begin{pmatrix} 1 &amp; 2 \\\\ 3 &amp; 4 \\end{pmatrix}\\) y \\(B = \\begin{pmatrix} 2 &amp; 0 \\\\ 1 &amp; 1 \\end{pmatrix}\\), \\(\\det(A + B) = 7\\) pero \\(\\det(A) + \\det(B) = -2 + 2 = 0\\).</p>",
        "<p>\\(\\det(2A) = 2\\det(A)\\) es falsa: \\(\\det(2A) = 2^{n}\\det(A)\\); por ejemplo \\(\\det(2A) = -8\\) frente a \\(2\\det(A) = -4\\) en el caso anterior.</p>",
        "<p>\\(\\det(A + B) = \\det(A)\\det(B)\\) también es falsa: en el mismo ejemplo, \\(7 \\neq (-2) \\cdot 2\\).</p>",
      ],
      answer: {
        type: "choice",
        expected: 1,
        choices: [
          "<p>\\(\\det(A + B) = \\det(A) + \\det(B)\\)</p>",
          "<p>\\(\\det(AB) = \\det(A)\\det(B)\\)</p>",
          "<p>\\(\\det(2A) = 2\\det(A)\\)</p>",
          "<p>\\(\\det(A + B) = \\det(A)\\det(B)\\)</p>",
        ],
      },
    },
  ],
};
