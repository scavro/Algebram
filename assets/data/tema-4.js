/* ============================================================
   Tema IV · Procesos de triangulación
   Datos del tema: resumen, mapa mental y ejercicios (7/7/6 = 20).
   ============================================================ */
window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["tema-4"] = {
  id: "tema-4",
  title: "Procesos de triangulación",

  summary: [
    {
      h: "Definiciones clave",
      items: [
        "Sistema lineal \\(Ax = b\\), con \\(A \\in \\mathbb{K}^{n \\times m}\\), incógnita \\(x \\in \\mathbb{K}^{m}\\) y término independiente \\(b \\in \\mathbb{K}^{n}\\); matriz ampliada \\(C = [[A, b]]\\) y homogeneización \\(Ax = b \\iff C x' = 0\\) con \\(x' = (x_1, \\dots, x_m, -1)^{\\top}\\).",
        "Forma escalonada (REF): matriz trapezoidal superior en la que todas las filas nulas están situadas debajo de las filas no nulas y los pivotes —primeras entradas no nulas de cada fila no nula— avanzan estrictamente de izquierda a derecha.",
        "Sistema compatible determinado (solución única), compatible indeterminado (infinitas soluciones) e incompatible (ninguna).",
        "Factorización PLU: \\(C = P L U\\), con \\(P\\) de permutación, \\(L\\) unitriangular inferior y \\(U\\) trapezoidal superior.",
        "Factorización QR completa, reducida y de rango: \\(C = QR\\), con \\(Q\\) ortogonal (o unitaria) y \\(R\\) trapezoidal superior; en \\(C = \\begin{pmatrix} Q_1 & Q_2 \\end{pmatrix}\\begin{pmatrix} R_1 \\\\ 0 \\end{pmatrix}\\), las columnas de \\(Q_1\\) son base ortonormal de \\(\\operatorname{col} C\\) y las de \\(Q_2\\) de \\((\\operatorname{col} C)^{\\perp} = \\ker C^{*}\\).",
        "Ecuación normal sobre \\(\\mathbb{K}\\): \\(A^{*} A x = A^{*} b\\) (en \\(\\mathbb{R}\\), \\(A^{\\top} A x = A^{\\top} b\\)); ajuste de mínimos cuadrados y proyección sobre \\(\\operatorname{col} A\\) según \\(\\mathbb{K}^{n} = \\operatorname{col} A \\oplus \\ker A^{*}\\).",
        "Forma de Schur: \\(A = Q U Q^{*}\\), con \\(Q\\) unitaria y \\(U\\) triangular superior con los autovalores de \\(A\\) en la diagonal.",
      ],
    },
    {
      h: "Resultados que hay que saber",
      items: [
        "Rouché–Frobenius: el sistema es compatible si y solo si \\(\\operatorname{rng}(A) = \\operatorname{rng}([[A,b]])\\); es determinado si además ese rango es \\(m\\) (número de incógnitas) e indeterminado si es menor, con \\(m - r\\) parámetros libres.",
        "El determinante de una matriz triangular es el producto de su diagonal: \\(\\det U = u_{11} u_{22} \\cdots u_{nn}\\); si \\(U\\) es invertible, \\(U^{-1} = (b_{ij})\\) tiene \\(b_{jj} = 1/u_{jj}\\) y \\(b_{ij} = -\\frac{1}{u_{ii}}\\sum_{k=i+1}^{j} u_{ik} b_{kj}\\) (\\(i = j-1, \\dots, 1\\)).",
        "Una matriz cuadrada no singular admite \\(C = LU\\) si y solo si todos sus menores principales conducentes son no nulos; en ese caso la factorización es única y \\(\\det C = u_{11} \\cdots u_{nn}\\).",
        "Toda matriz admite \\(C = P L U\\); al permutar después de eliminar se aplica \\(E_j^{-1} P_k^{-1} = P_k^{-1} \\widehat{E}_j^{-1}\\) (\\(j \\le k\\)), y para \\(C\\) cuadrada \\(\\det C = \\pm u_{11} \\cdots u_{nn}\\).",
        "Toda matriz admite factorización QR; si \\(C\\) tiene rango completo por columnas (\\(r = m \\le n\\)) y se exige que la diagonal de \\(R_1\\) sea estrictamente positiva, la QR reducida (y de rango) \\(C = Q_1 R_1\\) es única.",
        "\\(Ax = \\operatorname{proj}_{\\operatorname{col} A}(b) \\iff A^{*} A x = A^{*} b\\); con QR reducida \\(A = Q_1 R_1\\) (\\(r = m\\)) el ajuste único es \\(x = R_1^{-1} Q_1^{*} b\\), y con la QR de rango de la adjunta \\(A^{*} = Q_1 R_1\\) la solución general cerrada es \\(x = Q_1 (R_1 R_1^{*})^{-1} R_1 b + Q_2 u\\).",
        "Toda matriz cuadrada admite forma de Schur sobre \\(\\mathbb{C}\\); los autovalores aparecen en la diagonal de \\(U\\), luego \\(p_A = p_U\\).",
      ],
    },
    {
      h: "Métodos y algoritmos",
      items: [
        "Método de Gauss: escalonamiento (permutaciones y combinaciones lineales de filas) y sustitución hacia atrás.",
        "PLU con pivoteo: en la etapa \\(j\\) se fija la posición diagonal \\((j,j)\\) como referencia y se permuta para situar en \\((j,j)\\) la entrada de mayor módulo disponible en la columna \\(j\\) (si toda la subcolumna es nula en rango deficiente, queda \\(u_{jj} = 0\\) y \\(U\\) es trapezoidal superior).",
        "Gram–Schmidt para la QR teórica (y \\(C^{*} = QR \\implies C = LQ^{*}\\) para filas); reflectores de Householder y rotaciones de Givens para la QR numérica.",
        "Mínimos cuadrados: ecuaciones normales \\(A^{*}Ax = A^{*}b\\) o, de forma más estable, factorización QR (de \\(A\\) o de \\(A^{*}\\)).",
        "Forma de Schur: demostración por inducción por bloques \\(Q_1^{*} A Q_1\\); en cálculo numérico se obtiene por el algoritmo QR iterativo.",
      ],
    },
    {
      h: "Errores frecuentes",
      items: [
        "Aplicar mínimos cuadrados a un sistema incompatible sin decir que la «solución» es un ajuste, no una solución del sistema.",
        "Olvidar que una permutación \\(P_2\\) posterior a la eliminación \\(E_1\\) permuta también los multiplicadores ya calculados en la primera columna de \\(L\\) (\\(\\widehat{E}_1^{-1}\\)).",
        "Confundir la QR completa \\(Q \\in \\mathbb{K}^{n \\times n}\\) con la reducida \\(Q_1 \\in \\mathbb{K}^{n \\times m}\\) o la de rango \\(Q_1 \\in \\mathbb{K}^{n \\times r}\\).",
        "Usar la traspuesta ordinaria \\(A^{\\top}\\) en lugar de la traspuesta conjugada \\(A^{*}\\) (notada \\(A^{\\dagger}\\) en el libro) cuando se trabaja sobre \\(\\mathbb{C}\\).",
        "Formar \\(A^{*} A\\) cuando \\(A\\) está mal condicionada: \\(\\operatorname{cond}(A^{*} A) = \\operatorname{cond}(A)^2\\).",
      ],
    },
    {
      h: "En IA",
      items: [
        "La regresión lineal múltiple es un problema de mínimos cuadrados: añadir una columna de unos a la matriz de diseño absorbe el sesgo (intercept/bias).",
        "Cuando hay multicolinealidad entre variables (\\(r \\lt m\\)), elegir \\(u = 0\\) en \\(x = Q_1 (R_1 R_1^{*})^{-1} R_1 b + Q_2 u\\) proporciona el ajuste de mínima norma \\(\\|x\\|_2\\).",
        "El pivoteo completo \\(C = P L U P'\\) en matrices dispersas minimiza el relleno (fill-in) y sostiene las librerías de álgebra lineal.",
        "La forma de Schur se usa en análisis de estabilidad de sistemas dinámicos lineales y redes recurrentes.",
      ],
    },
  ],

  mindmap: {
    label: "Tema IV · Triangulación",
    detail:
      "Reducir a estructuras triangulares u ortogonales: sistemas, factorizaciones y ajustes. \\(Ax=b\\), \\(C=PLU\\), \\(C=QR\\), \\(A=QUQ^{*}\\).",
    children: [
      {
        label: "Sistemas lineales",
        detail: "Forma matricial \\(Ax = b\\), matriz ampliada \\(C = [[A, b]]\\) y homogeneización \\(Cx' = 0\\).",
        children: [
          {
            label: "Compatibilidad",
            detail:
              "\\(Ax = b\\) es compatible si y solo si \\(b \\in \\operatorname{col} A\\), es decir \\(\\operatorname{rng}(A) = \\operatorname{rng}([[A,b]])\\).",
          },
          {
            label: "Rouché–Frobenius",
            detail:
              "Determinado si \\(r = m\\); indeterminado si \\(r \\lt  m\\), con \\(m - r\\) parámetros libres; incompatible si los rangos difieren.",
          },
        ],
      },
      {
        label: "Método de Gauss",
        detail: "Escalonamiento y sustitución hacia atrás sobre la matriz ampliada.",
        children: [
          {
            label: "Escalonado",
            detail:
              "Pasos \\(E_j P_j\\) hasta la forma escalonada \\(U = M C\\), con \\(M = (E_m P_m) \\cdots (E_1 P_1)\\).",
          },
          {
            label: "Sustitución atrás",
            detail:
              "En la forma escalonada se resuelve desde la última ecuación hacia arriba; deja las incógnitas libres si \\(U\\) es ancha.",
          },
        ],
      },
      {
        label: "Factorización PLU",
        detail: "\\(C = P L U\\): la lectura matricial del método de Gauss y conmutación \\(E_j^{-1} P_k^{-1} = P_k^{-1} \\widehat{E}_j^{-1}\\).",
        children: [
          {
            label: "Pivoteo",
            detail:
              "Sin permutación no toda matriz admite \\(LU\\); el pivoteo parcial o completo \\(C=PLUP'\\) garantiza estabilidad y reduce el fill-in.",
          },
          {
            label: "LU y menores",
            detail:
              "Una cuadrada no singular admite \\(C = LU\\) si y solo si todos sus menores principales conducentes son no nulos; \\(\\det C = u_{11} \\cdots u_{nn}\\).",
          },
        ],
      },
      {
        label: "Factorización QR",
        detail: "Ortogonalización de Gram–Schmidt aplicada a las columnas de \\(C\\) (y \\(LQ\\) por filas).",
        children: [
          {
            label: "Completa, reducida y de rango",
            detail:
              "\\(C = QR\\) con \\(Q = \\begin{pmatrix} Q_1 & Q_2 \\end{pmatrix}\\) unitaria; \\(Q_1\\) base ortonormal de \\(\\operatorname{col} C\\) y \\(Q_2\\) de \\(\\ker C^{*}\\).",
          },
          {
            label: "Estabilidad",
            detail:
              "Gram–Schmidt pierde ortogonalidad; en la práctica se usan Householder y Givens, y a veces \\(C = QRP\\).",
          },
        ],
      },
      {
        label: "Mínimos cuadrados",
        detail: "Proyección de \\(b\\) sobre \\(\\operatorname{col} A\\) según \\(\\mathbb{K}^{n} = \\operatorname{col} A \\oplus \\ker A^{*}\\).",
        children: [
          {
            label: "Ecuaciones normales",
            detail:
              "\\(Ax = \\operatorname{proj}_{\\operatorname{col} A}(b) \\iff A^{*} A x = A^{*} b\\); si \\(\\operatorname{rng}(A) = m\\), \\(x = (A^{*} A)^{-1} A^{*} b\\).",
          },
          {
            label: "Ajuste por QR",
            detail:
              "Con \\(A = Q_1 R_1\\) (\\(r=m\\)), \\(x = R_1^{-1} Q_1^{*} b\\); en general, con \\(A^{*} = Q_1 R_1\\), \\(x = Q_1 (R_1 R_1^{*})^{-1} R_1 b + Q_2 u\\).",
          },
          {
            label: "Regresión lineal",
            detail:
              "Ajustar rectas o planos \\(z = p_1 x + p_2 y + p_3\\) a una nube de puntos es mínimos cuadrados: el motor de la regresión lineal en IA.",
          },
        ],
      },
      {
        label: "Forma de Schur",
        detail: "Triangularización unitaria: \\(A = Q U Q^{*}\\).",
        children: [
          {
            label: "Autovalores en la diagonal",
            detail:
              "\\(U\\) es triangular superior con los autovalores de \\(A\\) en la diagonal; luego \\(p_A = p_U\\).",
          },
          {
            label: "Aplicaciones",
            detail:
              "Estabilidad de sistemas lineales y algoritmo QR iterativo para autovalores; si \\(A\\) es real con autovalores reales, \\(Q\\) puede ser real.",
          },
        ],
      },
    ],
  },

  drills: [
    /* ================= NIVEL NORMAL (7) ================= */
    {
      id: "T4-N1",
      level: "normal",
      statement:
        "<p>Resuelve por eliminación de Gauss el sistema</p>" +
        "\\[ \\begin{cases} x + y + z = 2, \\\\ 2x - y + z = 5, \\\\ x + 2y - z = -3, \\end{cases} \\]" +
        "<p>y escribe la solución \\((x, y, z)\\) como vector columna.</p>",
      hint: "<p>Escribe la matriz ampliada \\([[A, b]]\\), anula las entradas bajo el primer pivote y termina con sustitución hacia atrás.</p>",
      solution: [
        "<p>Matriz ampliada: \\(C = \\left(\\begin{smallmatrix} 1 & 1 & 1 & 2 \\\\ 2 & -1 & 1 & 5 \\\\ 1 & 2 & -1 & -3 \\end{smallmatrix}\\right)\\).</p>",
        "<p>\\(F_2 \\leftarrow F_2 - 2F_1\\) y \\(F_3 \\leftarrow F_3 - F_1\\) dan \\(\\left(\\begin{smallmatrix} 1 & 1 & 1 & 2 \\\\ 0 & -3 & -1 & 1 \\\\ 0 & 1 & -2 & -5 \\end{smallmatrix}\\right)\\).</p>",
        "<p>\\(F_3 \\leftarrow F_3 + \\tfrac{1}{3} F_2\\) deja la forma escalonada \\(\\left(\\begin{smallmatrix} 1 & 1 & 1 & 2 \\\\ 0 & -3 & -1 & 1 \\\\ 0 & 0 & -7/3 & -14/3 \\end{smallmatrix}\\right)\\).</p>",
        "<p>Última ecuación: \\(-\\tfrac{7}{3} z = -\\tfrac{14}{3}\\), de donde \\(z = 2\\).</p>",
        "<p>Segunda ecuación: \\(-3y - 2 = 1\\), de donde \\(y = -1\\); primera: \\(x - 1 + 2 = 2\\), de donde \\(x = 1\\).</p>",
        "<p>La solución única es \\(x = (1, -1, 2)^{\\top}\\).</p>",
      ],
      answer: {
        type: "vector",
        rows: 3,
        cols: 1,
        expected: [["1"], ["-1"], ["2"]],
      },
    },
    {
      id: "T4-N2",
      level: "normal",
      statement:
        "<p>Considera el sistema</p>" +
        "\\[ \\begin{cases} x + y = 1, \\\\ 2x + 2y = 3. \\end{cases} \\]" +
        "<p>Aplicando el teorema de Rouché–Frobenius, ¿qué tipo de sistema es?</p>",
      hint: "<p>Compara el rango de la matriz de coeficientes con el rango de la matriz ampliada \\([[A, b]]\\).</p>",
      solution: [
        "<p>La matriz de coeficientes es \\(A = \\left(\\begin{smallmatrix} 1 & 1 \\\\ 2 & 2 \\end{smallmatrix}\\right)\\), de rango \\(1\\) (sus filas son proporcionales).</p>",
        "<p>La ampliada es \\(C = \\left(\\begin{smallmatrix} 1 & 1 & 1 \\\\ 2 & 2 & 3 \\end{smallmatrix}\\right)\\), de rango \\(2\\): \\(F_2 - 2F_1 = (0, 0, 1)\\) no es nula.</p>",
        "<p>Como \\(\\operatorname{rng}(A) = 1 \\lt  2 = \\operatorname{rng}([[A,b]])\\), el sistema es incompatible.</p>",
      ],
      answer: {
        type: "choice",
        expected: 2,
        choices: [
          "<p>Compatible determinado (solución única).</p>",
          "<p>Compatible indeterminado (infinitas soluciones).</p>",
          "<p>Incompatible (sin solución).</p>",
        ],
      },
    },
    {
      id: "T4-N3",
      level: "normal",
      statement:
        "<p>El sistema</p>" +
        "\\[ \\begin{cases} x + y + z = 4, \\\\ 2x + 2y + 2z = 8 \\end{cases} \\]" +
        "<p>es compatible indeterminado. Toma como parámetros libres \\(y = s\\) y \\(z = t\\), y escribe \\(x\\) en función de \\(s\\) y \\(t\\) (por ejemplo, <code>4-s-t</code>).</p>",
      hint: "<p>Despeja \\(x\\) en la primera ecuación; la segunda no aporta información nueva.</p>",
      solution: [
        "<p>La segunda ecuación es el doble de la primera, así que el sistema es equivalente a \\(x + y + z = 4\\).</p>",
        "<p>Con \\(y = s\\) y \\(z = t\\): \\(x = 4 - s - t\\).</p>",
        "<p>La solución general es \\((4 - s - t,\\, s,\\, t)\\), un subespacio afín de dimensión \\(2 = m - r\\).</p>",
      ],
      answer: {
        type: "expr",
        expected: "4-s-t",
      },
    },
    {
      id: "T4-N4",
      level: "normal",
      statement:
        "<p>Calcula la proyección ortogonal del vector \\(b = (3, 1)\\) sobre el vector \\(a = (1, 1)\\),</p>" +
        "\\[ \\operatorname{proj}_{a}(b) = \\frac{\\langle a, b \\rangle}{\\langle a, a \\rangle}\\, a, \\]" +
        "<p>y escribe el resultado como vector columna.</p>",
      hint: "<p>El coeficiente es \\(\\frac{\\langle a,b \\rangle}{\\langle a,a \\rangle}\\); multiplica después el vector \\(a\\).</p>",
      solution: [
        "<p>Productos escalares: \\(\\langle a, b \\rangle = 1 \\cdot 3 + 1 \\cdot 1 = 4\\) y \\(\\langle a, a \\rangle = 1 + 1 = 2\\).</p>",
        "<p>Coeficiente de proyección: \\(\\frac{4}{2} = 2\\).</p>",
        "<p>Por tanto \\(\\operatorname{proj}_{a}(b) = 2 (1, 1) = (2, 2)\\).</p>",
      ],
      answer: {
        type: "vector",
        rows: 2,
        cols: 1,
        expected: [["2"], ["2"]],
      },
    },
    {
      id: "T4-N5",
      level: "normal",
      statement:
        "<p>¿Es compatible el sistema \\(\\begin{cases} x + 2y = 3, \\\\ 2x + 4y = 7 \\end{cases}\\)? Responde verdadero o falso.</p>",
      hint: "<p>Comprueba si la segunda ecuación es múltiplo de la primera, incluido el término independiente.</p>",
      solution: [
        "<p>La segunda ecuación debería ser \\(2\\) veces la primera: \\(2x + 4y = 6\\).</p>",
        "<p>Pero el término independiente es \\(7 \\neq 6\\), luego \\(\\operatorname{rng}(A) = 1 \\lt  2 = \\operatorname{rng}([[A,b]])\\).</p>",
        "<p>El sistema es incompatible: la respuesta es falso.</p>",
      ],
      answer: {
        type: "bool",
        expected: false,
      },
    },
    {
      id: "T4-N6",
      level: "normal",
      statement:
        "<p>Sea \\(A = \\begin{pmatrix} 1 & 0 \\\\ 1 & 1 \\\\ 1 & 2 \\end{pmatrix}\\). Escribe la matriz \\(A^{\\top} A\\) que aparece en las ecuaciones normales \\(A^{\\top} A x = A^{\\top} b\\).</p>",
      hint: "<p>\\(A^{\\top} A\\) es la matriz \\(2 \\times 2\\) de productos escalares entre las columnas de \\(A\\).</p>",
      solution: [
        "<p>Las columnas de \\(A\\) son \\(c_1 = (1, 1, 1)\\) y \\(c_2 = (0, 1, 2)\\).</p>",
        "<p>\\(\\langle c_1, c_1 \\rangle = 3\\), \\(\\langle c_1, c_2 \\rangle = 3\\) y \\(\\langle c_2, c_2 \\rangle = 5\\).</p>",
        "<p>Por tanto \\(A^{\\top} A = \\begin{pmatrix} 3 & 3 \\\\ 3 & 5 \\end{pmatrix}\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 2,
        cols: 2,
        expected: [["3", "3"], ["3", "5"]],
      },
    },
    {
      id: "T4-N7",
      level: "normal",
      statement:
        "<p>Calcula la inversa \\(U^{-1} = (b_{ij})\\) de la matriz triangular superior</p>" +
        "\\[ U = \\begin{pmatrix} 1 & 2 & -1 \\\\ 0 & 2 & 4 \\\\ 0 & 0 & -1 \\end{pmatrix} \\]" +
        "<p>aplicando la relación de recurrencia de la Proposición 4.2 para los elementos situados por encima de la diagonal.</p>",
      hint: "<p>En la diagonal \\(b_{jj} = 1/u_{jj}\\); después calcula \\(b_{12}\\), luego \\(b_{23}\\) y finalmente \\(b_{13} = -\\frac{1}{u_{11}}(u_{12} b_{23} + u_{13} b_{33})\\).</p>",
      solution: [
        "<p>Diagonal de \\(B = U^{-1}\\): \\(b_{11} = 1/1 = 1\\), \\(b_{22} = 1/2\\), \\(b_{33} = 1/(-1) = -1\\).</p>",
        "<p>Columna \\(j = 2\\) (\\(i = 1\\)): \\(b_{12} = -\\frac{1}{u_{11}}(u_{12} b_{22}) = -1 \\cdot (2 \\cdot \\tfrac{1}{2}) = -1\\).</p>",
        "<p>Columna \\(j = 3\\), para \\(i = 2\\): \\(b_{23} = -\\frac{1}{u_{22}}(u_{23} b_{33}) = -\\tfrac{1}{2}(4 \\cdot (-1)) = 2\\).</p>",
        "<p>Columna \\(j = 3\\), para \\(i = 1\\): \\(b_{13} = -\\frac{1}{u_{11}}(u_{12} b_{23} + u_{13} b_{33}) = -1 \\cdot (2 \\cdot 2 + (-1)(-1)) = -5\\).</p>",
        "<p>Por tanto \\(U^{-1} = \\begin{pmatrix} 1 & -1 & -5 \\\\ 0 & 1/2 & 2 \\\\ 0 & 0 & -1 \\end{pmatrix}\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 3,
        cols: 3,
        expected: [
          ["1", "-1", "-5"],
          ["0", "1/2", "2"],
          ["0", "0", "-1"],
        ],
      },
    },

    /* ================= NIVEL MEDIO (7) ================= */
    {
      id: "T4-M1",
      level: "medio",
      statement:
        "<p>Calcula los tres menores principales conducentes \\(\\Delta_1, \\Delta_2, \\Delta_3\\) de la matriz</p>" +
        "\\[ A = \\begin{pmatrix} 2 & 4 & 1 \\\\ 4 & 8 & 3 \\\\ 1 & 3 & 5 \\end{pmatrix} \\]" +
        "<p>y decide, aplicando el Teorema 4.11, si \\(A\\) admite factorización \\(A = LU\\) sin permutación (con \\(L\\) unitriangular inferior y \\(U\\) triangular superior).</p>",
      hint: "<p>\\(\\Delta_1 = a_{11}\\), \\(\\Delta_2 = \\det \\begin{pmatrix} 2 & 4 \\\\ 4 & 8 \\end{pmatrix}\\) y \\(\\Delta_3 = \\det A\\). Recuerda que una matriz cuadrada no singular admite \\(A = LU\\) si y solo si todos sus menores principales conducentes son no nulos.</p>",
      solution: [
        "<p>Primer menor principal: \\(\\Delta_1 = 2 \\neq 0\\).</p>",
        "<p>Segundo menor principal: \\(\\Delta_2 = \\det \\begin{pmatrix} 2 & 4 \\\\ 4 & 8 \\end{pmatrix} = 16 - 16 = 0\\).</p>",
        "<p>Tercer menor principal: \\(\\Delta_3 = \\det A = 2(40 - 9) - 4(20 - 3) + 1(12 - 8) = 62 - 68 + 4 = -2 \\neq 0\\).</p>",
        "<p>Como \\(A\\) es no singular (\\(\\Delta_3 = -2 \\neq 0\\)) pero \\(\\Delta_2 = 0\\), por el Teorema 4.11 no admite factorización \\(A = LU\\) sin permutación (tras la etapa 1 la segunda columna queda \\((4, 0, 1)^{\\top}\\), obligando a permutar las filas 2 y 3).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          d1: { type: "number", expected: "2", exact: true },
          d2: { type: "number", expected: "0", exact: true },
          d3: { type: "number", expected: "-2", exact: true },
          lu: {
            type: "choice",
            expected: 1,
            choices: [
              "<p>Sí admite factorización LU sin permutación.</p>",
              "<p>No admite factorización LU sin permutación.</p>",
            ],
          },
        },
        labels: {
          d1: "Menor Δ₁",
          d2: "Menor Δ₂",
          d3: "Menor Δ₃ = det(A)",
          lu: "¿Admite A = LU sin permutar?",
        },
      },
    },
    {
      id: "T4-M2",
      level: "medio",
      statement:
        "<p>Aplica el procedimiento de Gram–Schmidt para hallar la factorización QR reducida \\(A = Q_1 R_1\\) de</p>" +
        "\\[ A = \\begin{pmatrix} 1 & 1 \\\\ 0 & 3 \\\\ 0 & 4 \\end{pmatrix}, \\]" +
        "<p>con \\(Q_1 \\in \\mathbb{R}^{3 \\times 2}\\) de columnas ortonormales y \\(R_1 \\in \\mathbb{R}^{2 \\times 2}\\) triangular superior <strong>con diagonal positiva en \\(R_1\\) (\\(r_{ii} \\gt 0\\))</strong>. Escribe \\(Q_1\\) y \\(R_1\\).</p>",
      hint: "<p>\\(q_1 = c_1 / \\|c_1\\|\\); después \\(u_2 = c_2 - \\langle q_1, c_2 \\rangle q_1\\) y \\(q_2 = u_2 / \\|u_2\\|\\). Los coeficientes \\(r_{11}, r_{12}, r_{22}\\) forman \\(R_1\\).</p>",
      solution: [
        "<p>Etapa 1: \\(c_1 = (1, 0, 0)^{\\top}\\) ya tiene norma \\(1\\), luego \\(q_1 = (1, 0, 0)^{\\top}\\) y \\(r_{11} = 1\\).</p>",
        "<p>Coeficiente \\(r_{12} = \\langle q_1, c_2 \\rangle = 1\\).</p>",
        "<p>Etapa 2: \\(u_2 = c_2 - 1 \\cdot q_1 = (0, 3, 4)^{\\top}\\), con \\(\\|u_2\\| = \\sqrt{9 + 16} = 5\\); por tanto \\(q_2 = \\left(0, \\tfrac{3}{5}, \\tfrac{4}{5}\\right)^{\\top}\\) y \\(r_{22} = 5\\).</p>",
        "<p>Así \\(Q_1 = \\begin{pmatrix} 1 & 0 \\\\ 0 & 3/5 \\\\ 0 & 4/5 \\end{pmatrix}\\) y \\(R_1 = \\begin{pmatrix} 1 & 1 \\\\ 0 & 5 \\end{pmatrix}\\).</p>",
        "<p>Comprobación: \\(Q_1 R_1 = A\\), \\(Q_1^{\\top} Q_1 = I_2\\) y la diagonal de \\(R_1\\) es positiva (\\(1, 5 \\gt 0\\)).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          Q1: {
            type: "matrix",
            rows: 3,
            cols: 2,
            expected: [
              ["1", "0"],
              ["0", "3/5"],
              ["0", "4/5"],
            ],
          },
          R1: {
            type: "matrix",
            rows: 2,
            cols: 2,
            expected: [
              ["1", "1"],
              ["0", "5"],
            ],
          },
        },
        labels: {
          Q1: "Matriz Q₁",
          R1: "Matriz R₁",
        },
      },
    },
    {
      id: "T4-M3",
      level: "medio",
      statement:
        "<p>Ajusta por mínimos cuadrados la recta \\(y = m x + n\\) a los cuatro puntos \\((0, 0)\\), \\((1, 1)\\), \\((2, 3)\\) y \\((3, 4)\\). Escribe la pendiente \\(m\\) y la ordenada en el origen \\(n\\).</p>",
      hint: "<p>Plantea las ecuaciones normales \\(A^{\\top} A x = A^{\\top} b\\) con la matriz de diseño \\(A = [[X, \\mathbf{1}]]\\), \\(X = (0, 1, 2, 3)^{\\top}\\).</p>",
      solution: [
        "<p>Matriz de diseño \\(A = \\begin{pmatrix} 0 & 1 \\\\ 1 & 1 \\\\ 2 & 1 \\\\ 3 & 1 \\end{pmatrix}\\), \\(b = (0, 1, 3, 4)^{\\top}\\) e incógnita \\(x = (m, n)^{\\top}\\).</p>",
        "<p>\\(A^{\\top} A = \\begin{pmatrix} 14 & 6 \\\\ 6 & 4 \\end{pmatrix}\\) y \\(A^{\\top} b = (19, 8)^{\\top}\\).</p>",
        "<p>Ecuaciones normales: \\(\\begin{cases} 14m + 6n = 19, \\\\ 6m + 4n = 8. \\end{cases}\\)</p>",
        "<p>Resolviendo el sistema: \\(20m = 28 \\implies m = \\tfrac{7}{5}\\), y \\(4n = 8 - \\tfrac{42}{5} = -\\tfrac{2}{5} \\implies n = -\\tfrac{1}{10}\\).</p>",
        "<p>La recta ajustada es \\(y = \\tfrac{7}{5}x - \\tfrac{1}{10}\\); el residuo \\(b - Ax = (\\tfrac{1}{10}, -\\tfrac{3}{10}, \\tfrac{3}{10}, -\\tfrac{1}{10})^{\\top}\\) es ortogonal a las dos columnas de \\(A\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          m: { type: "number", expected: "7/5" },
          n: { type: "number", expected: "-1/10" },
        },
        labels: {
          m: "Pendiente m",
          n: "Ordenada n",
        },
      },
    },
    {
      id: "T4-M4",
      level: "medio",
      statement:
        "<p>El ajuste por mínimos cuadrados de una recta a las alturas (en decímetros) de cuatro plantas en función de su edad (en semanas) es \\(y = 2x + \\tfrac{1}{2}\\). ¿Qué altura predice el modelo a las \\(5\\) semanas? Escribe el resultado como fracción.</p>",
      hint: "<p>El modelo ajustado se evalúa directamente: sustituye \\(x = 5\\) en la recta de mínimos cuadrados.</p>",
      solution: [
        "<p>La recta ajustada es el mejor predictor lineal en el sentido de mínimos cuadrados.</p>",
        "<p>Para \\(x = 5\\): \\(y = 2 \\cdot 5 + \\tfrac{1}{2} = 10 + \\tfrac{1}{2} = \\tfrac{21}{2}\\).</p>",
        "<p>El modelo predice una altura de \\(\\tfrac{21}{2}\\) decímetros (\\(10,5\\) dm).</p>",
      ],
      answer: {
        type: "number",
        expected: "21/2",
      },
    },
    {
      id: "T4-M5",
      level: "medio",
      statement:
        "<p>Sea \\(A = \\begin{pmatrix} 1 & -2 \\\\ 1 & -1 \\end{pmatrix}\\). Por el teorema de Schur, \\(A = Q U Q^{*}\\) con \\(U\\) triangular superior cuya diagonal contiene los autovalores de \\(A\\). Escribe esos autovalores (sepáralos con punto y coma, por ejemplo <code>i; -i</code>).</p>",
      hint: "<p>Resuelve la ecuación característica \\(p_A(\\lambda) = \\det(\\lambda I - A) = \\lambda^2 - \\operatorname{tr}(A)\\lambda + \\det(A) = 0\\).</p>",
      solution: [
        "<p>\\(\\det(\\lambda I - A) = \\det \\begin{pmatrix} \\lambda - 1 & 2 \\\\ -1 & \\lambda + 1 \\end{pmatrix} = (\\lambda^2 - 1) + 2 = \\lambda^2 + 1\\).</p>",
        "<p>Las raíces son \\(\\lambda = \\pm i\\), de modo que la diagonal de \\(U\\) contiene \\(i\\) y \\(-i\\).</p>",
        "<p>Como los autovalores no son reales, cualquier factorización triangular de Schur \\(A = Q U Q^{*}\\) exige trabajar en \\(\\mathbb{C}\\).</p>",
      ],
      answer: {
        type: "exprset",
        expected: ["i", "-i"],
      },
    },
    {
      id: "T4-M6",
      level: "medio",
      statement:
        "<p>Sea la matriz de rango deficiente</p>" +
        "\\[ C = \\begin{pmatrix} 1 & 2 & 1 \\\\ 0 & 0 & 1 \\\\ 1 & 2 & 1 \\end{pmatrix} \\in \\mathbb{R}^{3 \\times 3}. \\]" +
        "<p>Calcula su <strong>factorización QR de rango</strong> \\(C = Q_1 R_1\\) (con entradas positivas en los pivotes de \\(R_1\\)) y, completando la base ortonormal con \\(e_1 = (1, 0, 0)^{\\top}\\), halla el bloque \\(Q_2 \\in \\mathbb{R}^{3 \\times 1}\\) (con primera entrada positiva) cuyas columnas forman una base ortonormal de \\((\\operatorname{col} C)^{\\perp} = \\ker C^{\\top}\\).</p>",
      hint: "<p>Al aplicar Gram–Schmidt, la segunda columna \\(c_2 = 2c_1\\) da \\(u_2 = 0\\) y se descarta, quedando \\(Q_1 \\in \\mathbb{R}^{3 \\times 2}\\) y \\(R_1 \\in \\mathbb{R}^{2 \\times 3}\\). Después proyecta \\(e_1\\) ortogonalmente a \\(q_1, q_2\\) y normaliza.</p>",
      solution: [
        "<p>Etapa 1 (\\(c_1 = (1, 0, 1)^{\\top}\\)): \\(\\|c_1\\| = \\sqrt{2} \\implies q_1 = \\tfrac{1}{\\sqrt{2}}(1, 0, 1)^{\\top}\\) y \\(r_{11} = \\sqrt{2}\\).</p>",
        "<p>Etapa 2 (\\(c_2 = (2, 0, 2)^{\\top}\\)): \\(r_{12} = q_1^{\\top} c_2 = 2\\sqrt{2}\\) y \\(u_2 = c_2 - r_{12} q_1 = (0, 0, 0)^{\\top}\\); \\(c_2\\) es dependiente de \\(c_1\\) y no añade columna a \\(Q_1\\).</p>",
        "<p>Etapa 3 (\\(c_3 = (1, 1, 1)^{\\top}\\)): \\(r_{13} = q_1^{\\top} c_3 = \\sqrt{2}\\) y \\(u_3 = c_3 - \\sqrt{2} q_1 = (0, 1, 0)^{\\top}\\), de norma \\(1\\), luego \\(q_2 = (0, 1, 0)^{\\top}\\) y \\(r_{23} = 1\\).</p>",
        "<p>Así, \\(Q_1 = \\begin{pmatrix} 1/\\sqrt{2} & 0 \\\\ 0 & 1 \\\\ 1/\\sqrt{2} & 0 \\end{pmatrix}\\) y \\(R_1 = \\begin{pmatrix} \\sqrt{2} & 2\\sqrt{2} & \\sqrt{2} \\\\ 0 & 0 & 1 \\end{pmatrix}\\).</p>",
        "<p>Completación con \\(e_1 = (1, 0, 0)^{\\top}\\): \\(u_4 = e_1 - (q_1^{\\top} e_1) q_1 - (q_2^{\\top} e_1) q_2 = (1/2, 0, -1/2)^{\\top}\\). Normalizando: \\(Q_2 = \\begin{pmatrix} 1/\\sqrt{2} \\\\ 0 \\\\ -1/\\sqrt{2} \\end{pmatrix}\\), que verifica \\(C^{\\top} Q_2 = 0\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          Q1: {
            type: "matrix",
            rows: 3,
            cols: 2,
            expected: [
              ["1/sqrt(2)", "0"],
              ["0", "1"],
              ["1/sqrt(2)", "0"],
            ],
          },
          R1: {
            type: "matrix",
            rows: 2,
            cols: 3,
            expected: [
              ["sqrt(2)", "2*sqrt(2)", "sqrt(2)"],
              ["0", "0", "1"],
            ],
          },
          Q2: {
            type: "vector",
            rows: 3,
            cols: 1,
            expected: [["1/sqrt(2)"], ["0"], ["-1/sqrt(2)"]],
          },
        },
        labels: {
          Q1: "Matriz Q₁ (3×2)",
          R1: "Matriz R₁ (2×3)",
          Q2: "Vector Q₂ (base ortonormal de ker Cᵀ)",
        },
      },
    },
    {
      id: "T4-M7",
      level: "medio",
      statement:
        "<p>Se desea ajustar un plano \\(z = p_1 x + p_2 y + p_3\\) por mínimos cuadrados a las \\(n = 5\\) mediciones \\((x_i, y_i, z_i)\\) siguientes:</p>" +
        "\\[ (1, 0, 5), \\quad (0, 1, 3), \\quad (-1, 0, 1), \\quad (0, -1, 3), \\quad (0, 0, 2). \\]" +
        "<p>Plantea la matriz de diseño \\(A \\in \\mathbb{R}^{5 \\times 3}\\) (con la tercera columna de unos), resuelve las ecuaciones normales \\(A^{\\top} A p = A^{\\top} b\\) para hallar \\(p_1, p_2, p_3\\) y calcula el error cuadrático total \\(\\|b - Ap\\|_2^2\\).</p>",
      hint: "<p>Las tres columnas de \\(A\\) son ortogonales entre sí por la simetría de los puntos, por lo que \\(A^{\\top} A = \\operatorname{diag}(2, 2, 5)\\) es diagonal.</p>",
      solution: [
        "<p>Matriz de diseño \\(A = \\left(\\begin{smallmatrix} 1 & 0 & 1 \\\\ 0 & 1 & 1 \\\\ -1 & 0 & 1 \\\\ 0 & -1 & 1 \\\\ 0 & 0 & 1 \\end{smallmatrix}\\right)\\) y vector de observaciones \\(b = (5, 3, 1, 3, 2)^{\\top}\\).</p>",
        "<p>Por ortogonalidad de las columnas, \\(A^{\\top} A = \\begin{pmatrix} 2 & 0 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 5 \\end{pmatrix}\\) y \\(A^{\\top} b = \\begin{pmatrix} 4 \\\\ 0 \\\\ 14 \\end{pmatrix}\\).</p>",
        "<p>Despejando: \\(p_1 = 2\\), \\(p_2 = 0\\) y \\(p_3 = 14/5\\) (plano ajustado \\(z = 2x + \\tfrac{14}{5}\\)).</p>",
        "<p>El vector residuo es \\(r = b - Ap = (1/5, 1/5, 1/5, 1/5, -4/5)^{\\top}\\), cuyo error cuadrático total vale \\(\\|r\\|_2^2 = \\frac{1+1+1+1+16}{25} = \\frac{20}{25} = \\frac{4}{5}\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          // p1 y p2 son enteros exactos: `exact` evita que la tolerancia por
          // defecto (1e-6 relativa) admita residuos como 2.0000001 o 1e-7.
          // p3 = 14/5 y err2 = 4/5 no son enteros: conservan la tolerancia.
          p1: { type: "number", expected: "2", exact: true },
          p2: { type: "number", expected: "0", exact: true },
          p3: { type: "number", expected: "14/5" },
          err2: { type: "number", expected: "4/5" },
        },
        labels: {
          p1: "Coeficiente p₁",
          p2: "Coeficiente p₂",
          p3: "Término independiente p₃",
          err2: "Error cuadrático ‖b − Ap‖₂²",
        },
      },
    },

    /* ================= NIVEL EXAMEN (6) ================= */
    {
      id: "T4-E1",
      level: "examen",
      statement:
        "<p>Resuelva el sistema de ecuaciones</p>" +
        "\\[ \\begin{cases} y + z = 5, \\\\ x + z = 4, \\\\ x + y = 3. \\end{cases} \\]" +
        "<p>Escriba la solución \\((x, y, z)\\) como vector columna.</p>",
      hint: "<p>La posición \\((1,1)\\) de la matriz de coeficientes es nula: intercambie las dos primeras filas antes de eliminar.</p>",
      solution: [
        "<p>Matriz ampliada: \\(C = \\left(\\begin{smallmatrix} 0 & 1 & 1 & 5 \\\\ 1 & 0 & 1 & 4 \\\\ 1 & 1 & 0 & 3 \\end{smallmatrix}\\right)\\); permutamos \\(F_1 \\leftrightarrow F_2\\).</p>",
        "<p>\\(F_3 \\leftarrow F_3 - F_1\\) da \\(\\left(\\begin{smallmatrix} 1 & 0 & 1 & 4 \\\\ 0 & 1 & 1 & 5 \\\\ 0 & 1 & -1 & -1 \\end{smallmatrix}\\right)\\) y \\(F_3 \\leftarrow F_3 - F_2\\) deja \\(\\left(\\begin{smallmatrix} 1 & 0 & 1 & 4 \\\\ 0 & 1 & 1 & 5 \\\\ 0 & 0 & -2 & -6 \\end{smallmatrix}\\right)\\).</p>",
        "<p>De la tercera ecuación: \\(-2z = -6\\), luego \\(z = 3\\); de la segunda: \\(y + 3 = 5\\), luego \\(y = 2\\); de la primera: \\(x + 3 = 4\\), luego \\(x = 1\\).</p>",
        "<p>La solución es \\(x = (1, 2, 3)^{\\top}\\).</p>",
      ],
      answer: {
        type: "vector",
        rows: 3,
        cols: 1,
        expected: [["1"], ["2"], ["3"]],
      },
    },
    {
      id: "T4-E2",
      level: "examen",
      statement:
        "<p>Considere el sistema</p>" +
        "\\[ \\begin{cases} x - 2y = 3, \\\\ -2x + 4y = -6, \\\\ 3x - 6y = 5. \\end{cases} \\]" +
        "<p>Aplique el teorema de Rouché–Frobenius: escriba el rango de la matriz de coeficientes y el rango de la matriz ampliada.</p>",
      hint: "<p>Observe la proporcionalidad entre las filas de \\(A\\) y compruebe si los términos independientes mantienen esa misma proporción en la tercera ecuación.</p>",
      solution: [
        "<p>\\(A = \\begin{pmatrix} 1 & -2 \\\\ -2 & 4 \\\\ 3 & -6 \\end{pmatrix}\\) tiene sus tres filas proporcionales a \\((1, -2)\\), luego \\(\\operatorname{rng}(A) = 1\\).</p>",
        "<p>La ampliada es \\(C = \\begin{pmatrix} 1 & -2 & 3 \\\\ -2 & 4 & -6 \\\\ 3 & -6 & 5 \\end{pmatrix}\\); al hacer \\(F_2 + 2F_1 = (0, 0, 0)\\) y \\(F_3 - 3F_1 = (0, 0, -4)\\) aparece un segundo pivote en la última columna, luego \\(\\operatorname{rng}([[A,b]]) = 2\\).</p>",
        "<p>Como \\(1 \\lt  2\\), el sistema es incompatible.</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          rangoA: { type: "number", expected: "1", exact: true },
          rangoC: { type: "number", expected: "2", exact: true },
        },
        labels: {
          rangoA: "rng(A)",
          rangoC: "rng([[A, b]])",
        },
      },
    },
    {
      id: "T4-E3",
      level: "examen",
      statement:
        "<p>Aplique eliminación gaussiana sin permutar en el paso 1 (pues \\(c_{11} = 1 \\neq 0\\)) e intercambiando las filas 2 y 3 en el paso 2 para obtener la factorización \\(C = P L U\\) (con \\(P\\) de permutación, \\(L\\) unitriangular inferior y \\(U\\) triangular superior) de</p>" +
        "\\[ C = \\begin{pmatrix} 1 & 2 & -1 \\\\ 2 & 4 & 1 \\\\ -1 & -1 & 3 \\end{pmatrix}. \\]" +
        "<p>Escriba las matrices \\(P\\), \\(L\\) y \\(U\\) (preste especial atención al efecto de la permutación \\(P_2\\) sobre los multiplicadores de la primera columna de \\(L\\) según \\(E_1^{-1} P_2^{-1} = P_2^{-1} \\widehat{E}_1^{-1}\\)).</p>",
      hint: "<p>En el paso 1 los multiplicadores que anulan debajo de \\(c_{11}\\) son \\(2\\) (en fila 2) y \\(-1\\) (en fila 3). Al permutar las filas 2 y 3 en el paso 2 mediante \\(P_2\\), esos dos multiplicadores también se intercambian en la primera columna de \\(L = \\widehat{E}_1^{-1}\\).</p>",
      solution: [
        "<p>Etapa 1 (\\(P_1 = I_3\\)): anulamos bajo \\(c_{11} = 1\\) con \\(F_2 \\leftarrow F_2 - 2F_1\\) y \\(F_3 \\leftarrow F_3 + F_1\\), lo que da \\(E_1 C = \\begin{pmatrix} 1 & 2 & -1 \\\\ 0 & 0 & 3 \\\\ 0 & 1 & 2 \\end{pmatrix}\\) con \\(E_1^{-1} = \\begin{pmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ -1 & 0 & 1 \\end{pmatrix}\\).</p>",
        "<p>Etapa 2: como la entrada \\((2,2)\\) es nula y la \\((3,2)\\) vale \\(1\\), permutamos las filas 2 y 3 mediante \\(P_2 = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 1 & 0 \\end{pmatrix}\\) y obtenemos directamente \\(U = P_2 E_1 C = \\begin{pmatrix} 1 & 2 & -1 \\\\ 0 & 1 & 2 \\\\ 0 & 0 & 3 \\end{pmatrix}\\).</p>",
        "<p>Factorización \\(C = E_1^{-1} P_2^{-1} U = P_2^{-1} \\widehat{E}_1^{-1} U = P L U\\): la permutación \\(P_2\\) intercambia las entradas \\((2,1)\\) y \\((3,1)\\) de \\(E_1^{-1}\\), dando \\(P = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 1 & 0 \\end{pmatrix}\\) y \\(L = \\widehat{E}_1^{-1} = \\begin{pmatrix} 1 & 0 & 0 \\\\ -1 & 1 & 0 \\\\ 2 & 0 & 1 \\end{pmatrix}\\).</p>",
        "<p>Se comprueba que \\(P L U = C\\) y \\(\\det C = \\det(P) \\cdot 1 \\cdot 1 \\cdot 3 = (-1) \\cdot 3 = -3\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          P: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [
              ["1", "0", "0"],
              ["0", "0", "1"],
              ["0", "1", "0"],
            ],
          },
          L: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [
              ["1", "0", "0"],
              ["-1", "1", "0"],
              ["2", "0", "1"],
            ],
          },
          U: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [
              ["1", "2", "-1"],
              ["0", "1", "2"],
              ["0", "0", "3"],
            ],
          },
        },
        labels: {
          P: "Matriz P",
          L: "Matriz L",
          U: "Matriz U",
        },
      },
    },
    {
      id: "T4-E4",
      level: "examen",
      statement:
        "<p>Ajuste por mínimos cuadrados la recta \\(y = m x + n\\) a los puntos \\((0, 3)\\), \\((1, 1)\\) y \\((2, 5)\\). Escriba la pendiente \\(m\\), la ordenada \\(n\\) y la predicción del modelo para \\(x = 4\\).</p>",
      hint: "<p>Plantee las ecuaciones normales con la matriz de diseño \\(A = [[X, \\mathbf{1}]]\\) y resuelva el sistema \\(2 \\times 2\\).</p>",
      solution: [
        "<p>\\(A = \\begin{pmatrix} 0 & 1 \\\\ 1 & 1 \\\\ 2 & 1 \\end{pmatrix}\\), \\(b = (3, 1, 5)^{\\top}\\), \\(x = (m, n)^{\\top}\\).</p>",
        "<p>\\(A^{\\top} A = \\begin{pmatrix} 5 & 3 \\\\ 3 & 3 \\end{pmatrix}\\) y \\(A^{\\top} b = (11, 9)^{\\top}\\).</p>",
        "<p>De \\(5m + 3n = 11\\) y \\(3m + 3n = 9\\) se obtiene \\(2m = 2\\), luego \\(m = 1\\) y \\(n = 2\\). La recta ajustada es \\(y = x + 2\\).</p>",
        "<p>Predicción para \\(x = 4\\): \\(y = 4 + 2 = 6\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          m: { type: "number", expected: "1", exact: true },
          n: { type: "number", expected: "2", exact: true },
          pred: { type: "number", expected: "6", exact: true },
        },
        labels: {
          m: "Pendiente m",
          n: "Ordenada n",
          pred: "Predicción y(4)",
        },
      },
    },
    {
      id: "T4-E5",
      level: "examen",
      statement:
        "<p>Considere el sistema compatible indeterminado \\(Ax = b\\) dado por</p>" +
        "\\[ A = \\begin{pmatrix} 1 & 0 & 1 \\\\ 0 & 1 & 1 \\end{pmatrix}, \\qquad b = \\begin{pmatrix} 2 \\\\ 3 \\end{pmatrix}. \\]" +
        "<p>Sabiendo que la factorización QR completa de \\(A^{\\top}\\) es \\(A^{\\top} = \\begin{pmatrix} Q_1 & Q_2 \\end{pmatrix} \\begin{pmatrix} R_1 \\\\ 0 \\end{pmatrix}\\) con</p>" +
        "\\[ Q_1 = \\begin{pmatrix} 1/\\sqrt{2} & -1/\\sqrt{6} \\\\ 0 & 2/\\sqrt{6} \\\\ 1/\\sqrt{2} & 1/\\sqrt{6} \\end{pmatrix}, \\quad Q_2 = \\begin{pmatrix} 1/\\sqrt{3} \\\\ 1/\\sqrt{3} \\\\ -1/\\sqrt{3} \\end{pmatrix}, \\quad R_1 = \\begin{pmatrix} \\sqrt{2} & 1/\\sqrt{2} \\\\ 0 & \\sqrt{6}/2 \\end{pmatrix}, \\]" +
        "<p>aplique la fórmula de Perán \\(x = Q_1 (R_1 R_1^{\\top})^{-1} R_1 b + Q_2 u\\) con \\(u = 0\\) para hallar la solución de mínima norma euclídea \\(x_0 \\in \\operatorname{col}(A^{\\top})\\) y calcule \\(\\|x_0\\|_2^2\\).</p>",
      hint: "<p>Como \\(R_1 \\in \\mathbb{R}^{2 \\times 2}\\) es cuadrada invertible, \\((R_1 R_1^{\\top})^{-1} R_1 b = (R_1^{\\top})^{-1} b\\). Resuelva el sistema triangular inferior \\(R_1^{\\top} y = b\\) y multiplique \\(x_0 = Q_1 y\\) (o imponga directamente \\(Ax_0 = b\\) y \\(Q_2^{\\top} x_0 = 0\\)).</p>",
      solution: [
        "<p>Resolvemos \\(R_1^{\\top} y = \\begin{pmatrix} \\sqrt{2} & 0 \\\\ 1/\\sqrt{2} & \\sqrt{6}/2 \\end{pmatrix} \\begin{pmatrix} y_1 \\\\ y_2 \\end{pmatrix} = \\begin{pmatrix} 2 \\\\ 3 \\end{pmatrix}\\), de donde \\(y_1 = \\sqrt{2}\\) y \\(y_2 = \\frac{4}{\\sqrt{6}}\\).</p>",
        "<p>Multiplicando \\(x_0 = Q_1 y = \\begin{pmatrix} 1/\\sqrt{2} & -1/\\sqrt{6} \\\\ 0 & 2/\\sqrt{6} \\\\ 1/\\sqrt{2} & 1/\\sqrt{6} \\end{pmatrix} \\begin{pmatrix} \\sqrt{2} \\\\ 4/\\sqrt{6} \\end{pmatrix} = \\begin{pmatrix} 1 - 2/3 \\\\ 8/6 \\\\ 1 + 2/3 \\end{pmatrix} = \\begin{pmatrix} 1/3 \\\\ 4/3 \\\\ 5/3 \\end{pmatrix}\\).</p>",
        "<p>Se comprueba que \\(A x_0 = (2, 3)^{\\top} = b\\) y que \\(x_0 \\perp Q_2\\) (\\(1/3 + 4/3 - 5/3 = 0\\)); el conjunto completo de soluciones es \\(x = (1/3, 4/3, 5/3)^{\\top} + \\lambda (1, 1, -1)^{\\top}\\).</p>",
        "<p>La norma al cuadrado mínima es \\(\\|x_0\\|_2^2 = \\frac{1 + 16 + 25}{9} = \\frac{42}{9} = \\frac{14}{3}\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          x0: {
            type: "vector",
            rows: 3,
            cols: 1,
            expected: [["1/3"], ["4/3"], ["5/3"]],
          },
          norm2: {
            type: "number",
            expected: "14/3",
          },
        },
        labels: {
          x0: "Solución de mínima norma x₀",
          norm2: "Norma al cuadrado ‖x₀‖₂²",
        },
      },
    },
    {
      id: "T4-E6",
      level: "examen",
      statement:
        "<p>Halle una factorización triangular de Schur compleja \\(A = Q U Q^{*}\\) (con \\(Q \\in \\mathbb{C}^{2 \\times 2}\\) unitaria y \\(U \\in \\mathbb{C}^{2 \\times 2}\\) triangular superior) para la matriz real no normal</p>" +
        "\\[ A = \\begin{pmatrix} 0 & -4 \\\\ 1 & 0 \\end{pmatrix}, \\]" +
        "<p>tomando como primera columna de \\(Q\\) el autovector unitario \\(u = \\frac{1}{\\sqrt{5}}\\begin{pmatrix} 2i \\\\ 1 \\end{pmatrix}\\) asociado a \\(\\lambda_1 = 2i\\) y como segunda columna el vector unitario ortogonal \\(v = \\frac{1}{\\sqrt{5}}\\begin{pmatrix} 1 \\\\ 2i \\end{pmatrix}\\). Escriba \\(Q\\) y \\(U = Q^{*} A Q\\).</p>",
      hint: "<p>Recuerde que sobre \\(\\mathbb{C}\\) la adjunta \\(Q^{*} = \\overline{Q}^{\\top}\\) conjuga las entradas además de trasponer: \\(u^{*} = \\frac{1}{\\sqrt{5}}(-2i,\\, 1)\\) y \\(v^{*} = \\frac{1}{\\sqrt{5}}(1,\\, -2i)\\).</p>",
      solution: [
        "<p>El polinomio característico es \\(p_A(\\lambda) = \\lambda^2 + 4\\), con autovalores \\(\\lambda_1 = 2i\\) y \\(\\lambda_2 = -2i\\).</p>",
        "<p>La matriz \\(Q = \\begin{pmatrix} u & v \\end{pmatrix} = \\begin{pmatrix} 2i/\\sqrt{5} & 1/\\sqrt{5} \\\\ 1/\\sqrt{5} & 2i/\\sqrt{5} \\end{pmatrix}\\) es unitaria pues \\(u^{*} u = (4 + 1)/5 = 1\\), \\(v^{*} v = 1\\) y \\(u^{*} v = (-2i + 2i)/5 = 0\\).</p>",
        "<p>Como \\(A u = 2i\\, u\\) y \\(A v = \\frac{1}{\\sqrt{5}}\\begin{pmatrix} -8i \\\\ 1 \\end{pmatrix}\\), la entrada \\((1,2)\\) de \\(U = Q^{*} A Q\\) vale \\(u^{*} A v = \\frac{1}{5}((-2i)(-8i) + 1 \\cdot 1) = \\frac{-16 + 1}{5} = -3\\), y la entrada \\((2,2)\\) es \\(\\lambda_2 = -2i\\).</p>",
        "<p>Por tanto \\(U = \\begin{pmatrix} 2i & -3 \\\\ 0 & -2i \\end{pmatrix}\\), cumpliéndose \\(Q U Q^{*} = A\\) (note que \\(u_{12} = -3 \\neq 0\\) porque \\(A\\) no es normal).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          Q: {
            type: "matrix",
            rows: 2,
            cols: 2,
            expected: [
              ["2*i/sqrt(5)", "1/sqrt(5)"],
              ["1/sqrt(5)", "2*i/sqrt(5)"],
            ],
          },
          U: {
            type: "matrix",
            rows: 2,
            cols: 2,
            expected: [
              ["2*i", "-3"],
              ["0", "-2*i"],
            ],
          },
        },
        labels: {
          Q: "Matriz unitaria Q",
          U: "Matriz triangular superior U",
        },
      },
    },
  ],
};
