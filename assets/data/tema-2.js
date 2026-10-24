/* ============================================================
   tema-2.js — datos del Tema II: Tensores, matrices y vectores
   (resumen, mapa mental y 15 ejercicios: 6 normal, 5 medio, 4 examen)
   ============================================================ */
window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["tema-2"] = {
  id: "tema-2",
  title: "Tensores, matrices y vectores",

  summary: [
    {
      h: "Definiciones clave",
      items: [
        "\\(K^{I}\\): familias \\(u=(u_i)_{i\\in I}\\) con operaciones componente a componente; combinación lineal \\(\\alpha u+\\beta v\\); subespacio generado \\(\\langle B\\rangle\\).",
        "Tensor de formato \\(n_1\\times\\cdots\\times n_m\\): orden \\(m\\), ejes y componentes. Orden 0 = escalar; orden 1 = vector; orden 2 = matriz.",
        "Identificaciones: \\([v_1,\\dots,v_n]=(v_1,\\dots,v_n)=[[v_1],[v_2],\\dots,[v_n]]\\); los vectores son matrices columna; las filas, covectores.",
        "Producto \\(C=AB\\): \\(c_{ij}=\\sum_s a_{is}b_{sj}\\); traza \\(\\operatorname{tr}(A)=\\sum_i a_{ii}\\); contracción de índices (\\(\\texttt{einsum}\\)).",
        "\\(A^{\\top}\\) intercambia filas y columnas; \\(A^{*}\\) transpone y conjuga (coinciden si \\(A\\) es real); \\(A\\) invertible \\(\\iff AA^{-1}=A^{-1}A=I\\).",
        "Módulo \\(\\|u\\|=\\sqrt{u^{*}u}\\); distancia \\(d(u,v)=\\|u-v\\|\\); para vectores reales \\(\\cos(u,v)=\\frac{u^{\\top}v}{\\|u\\|\\|v\\|}\\); \\(u\\perp v\\iff u^{*}v=0\\).",
        "Proyección ortogonal \\(\\operatorname{proy}_V(w)=A(A^{*}A)^{-1}A^{*}w=\\sum_j (f_j^{*}w)f_j\\); complemento ortogonal \\(V^{\\perp}\\) con \\(K^n=V\\oplus V^{\\perp}\\).",
      ],
    },
    {
      h: "Resultados que hay que saber",
      items: [
        "Teorema de la base: todas las bases de un subespacio tienen el mismo número de elementos (la dimensión \\(\\dim V\\)).",
        "\\((AB)^{\\top}=B^{\\top}A^{\\top}\\) y \\((AB)^{*}=B^{*}A^{*}\\); \\(\\operatorname{tr}(AB)=\\operatorname{tr}(BA)\\).",
        "\\((AB)^{-1}=B^{-1}A^{-1}\\), \\((A^{\\top})^{-1}=(A^{-1})^{\\top}\\) y \\((A^{*})^{-1}=(A^{-1})^{*}\\).",
        "Desigualdad de Cauchy–Schwarz \\(|u^{\\top}v|\\leq\\|u\\|\\|v\\|\\), de donde salen el ángulo y la desigualdad triangular \\(\\|u+v\\|\\leq\\|u\\|+\\|v\\|\\).",
        "Toda familia ortogonal de vectores no nulos es linealmente independiente.",
        "Gram–Schmidt: \\(u_k=v_k-\\sum_{j\\lt k}(f_j^{*}v_k)f_j\\) convierte cualquier familia generadora en una base ortonormal del mismo subespacio.",
        "\\(Q\\) ortogonal (unitaria si \\(K=\\mathbb{C}\\)) \\(\\iff Q^{*}Q=I \\iff Q^{-1}=Q^{*}\\); su inversión es solo transponer (y conjugar).",
      ],
    },
    {
      h: "Errores frecuentes",
      items: [
        "Confundir \\(A^{\\top}\\) (solo transpone) con \\(A^{*}\\) (transpone y conjuga).",
        "Multiplicar matrices en el orden equivocado: \\(AB\\neq BA\\) en general, y a veces ni siquiera están definidos los dos productos.",
        "Escribir \\((AB)^{-1}=A^{-1}B^{-1}\\): el orden se invierte, \\((AB)^{-1}=B^{-1}A^{-1}\\).",
        "Pensar que columnas ortogonales bastan para que la matriz sea ortogonal: hace falta además que sean unitarias (\\(\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}\\) no lo es).",
        "En Gram–Schmidt, descartar mal: si \\(u_k=0\\) el vector \\(v_k\\) es dependiente y no genera vector nuevo.",
        "Comparar embeddings con producto punto sin normalizar: confundirás longitud con similitud.",
      ],
    },
    {
      h: "Con IA en la cabeza",
      items: [
        "Los embeddings son vectores de \\(\\mathbb{R}^{d}\\): la similitud coseno mide su cercanía semántica en recuperación de información.",
        "Un lote de imágenes RGB es un tensor de cuatro ejes: muestras \\(\\times\\) alto \\(\\times\\) ancho \\(\\times\\) canales (p. ej. \\(64\\times32\\times32\\times3\\)).",
        "La proyección ortogonal es la base de PCA y de la regresión por mínimos cuadrados.",
        "Las matrices ortogonales inicializan pesos y conservan la norma: evitan la explosión y el desvanecimiento del gradiente.",
      ],
    },
  ],

  mindmap: {
    label: "Tema II · Tensores y matrices",
    detail: "De los espacios \\(K^{I}\\) a las matrices ortogonales: el álgebra con la que se organizan, se combinan y se miden los datos.",
    children: [
      {
        label: "Espacio lineal K^I",
        detail: "Familias indexadas, combinaciones lineales, generadores e independencia lineal.",
        children: [
          { label: "Bases y dimensión", detail: "Elementos básicos \\(e_j\\), delta de Kronecker, teorema de la base y \\(\\dim V\\)." },
        ],
      },
      {
        label: "Tensores",
        detail: "Orden, formato \\(n_1\\times\\cdots\\times n_m\\), ejes, componentes y corchetes anidados.",
        children: [
          { label: "Vectores y covectores", detail: "Orden 1 = vector = matriz columna; la matriz fila es un covector de orden 2." },
        ],
      },
      {
        label: "Operaciones",
        detail: "Combinaciones lineales de tensores, producto de matrices, contracción de índices y traza.",
        children: [
          { label: "Bloques y propiedades", detail: "Producto por bloques, asociativa, distributiva, \\((AB)^{\\top}=B^{\\top}A^{\\top}\\) y \\(\\operatorname{tr}(AB)=\\operatorname{tr}(BA)\\)." },
        ],
      },
      {
        label: "Inversa y cambio de base",
        detail: "\\(A^{-1}\\) existe \\(\\iff\\) \\(A\\) cuadrada no singular; \\((AB)^{-1}=B^{-1}A^{-1}\\); coordenadas \\(c=W^{-1}u\\).",
        children: [
          { label: "Cálculo eficiente", detail: "Gauss–Jordan sobre \\(A\\mid I\\), sustitución hacia atrás en triangulares, inversión por bloques." },
        ],
      },
      {
        label: "Normas y ángulos",
        detail: "Módulo, Cauchy–Schwarz, distancia euclídea, similitud coseno y ortogonalidad.",
        children: [
          { label: "Ortogonalidad", detail: "\\(u\\perp v\\iff u^{*}v=0\\); toda familia ortogonal de vectores no nulos es linealmente independiente." },
        ],
      },
      {
        label: "Ortogonalización",
        detail: "Gram–Schmidt, complemento ortogonal \\(V^{\\perp}\\), proyección ortogonal y matrices ortogonales.",
        children: [
          { label: "Matrices ortogonales", detail: "\\(Q^{*}Q=I\\iff Q^{-1}=Q^{*}\\): transformaciones que conservan la norma." },
        ],
      },
    ],
  },

  drills: [
    /* ---------------- NIVEL NORMAL ---------------- */
    {
      id: "T2-N1",
      level: "normal",
      statement: "<p>Sean \\(u=(2,-1,3)\\) y \\(v=(1,4,-2)\\) vectores de \\(\\mathbb{R}^{3}\\). Calcula la combinación lineal \\(w=3u-2v\\).</p>",
      hint: "<p>Opera componente a componente: \\(w_i=3u_i-2v_i\\).</p>",
      solution: [
        "<p>Primera componente: \\(w_1=3\\cdot 2-2\\cdot 1=6-2=4\\).</p>",
        "<p>Segunda componente: \\(w_2=3\\cdot(-1)-2\\cdot 4=-3-8=-11\\).</p>",
        "<p>Tercera componente: \\(w_3=3\\cdot 3-2\\cdot(-2)=9+4=13\\).</p>",
        "<p>Por tanto \\(w=(4,-11,13)\\), que sigue viviendo en \\(\\mathbb{R}^{3}\\).</p>",
      ],
      answer: { type: "vector", rows: 3, cols: 1, expected: [["4"], ["-11"], ["13"]] },
    },
    {
      id: "T2-N2",
      level: "normal",
      statement: "<p>Calcula el producto \\(AB\\) de las matrices \\(A=\\begin{pmatrix}1&2&0\\\\3&1&2\\end{pmatrix}\\) y \\(B=\\begin{pmatrix}2&1\\\\0&3\\\\1&1\\end{pmatrix}\\).</p>",
      hint: "<p>Cada celda \\(c_{ij}\\) es el producto escalar de la fila \\(i\\) de \\(A\\) por la columna \\(j\\) de \\(B\\). El resultado es de formato \\(2\\times 2\\).</p>",
      solution: [
        "<p>Recordemos \\(c_{ij}=\\sum_{s}a_{is}b_{sj}\\).</p>",
        "<p>Primera fila: \\(c_{11}=1\\cdot2+2\\cdot0+0\\cdot1=2\\) y \\(c_{12}=1\\cdot1+2\\cdot3+0\\cdot1=7\\).</p>",
        "<p>Segunda fila: \\(c_{21}=3\\cdot2+1\\cdot0+2\\cdot1=8\\) y \\(c_{22}=3\\cdot1+1\\cdot3+2\\cdot1=8\\).</p>",
        "<p>Así \\(AB=\\begin{pmatrix}2&7\\\\8&8\\end{pmatrix}\\).</p>",
      ],
      answer: { type: "matrix", rows: 2, cols: 2, expected: [["2", "7"], ["8", "8"]] },
    },
    {
      id: "T2-N3",
      level: "normal",
      statement: "<p>Sean \\(A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\) y \\(B=\\begin{pmatrix}5&6\\\\7&8\\end{pmatrix}\\). Calcula la matriz \\(C=A^{\\top}B\\) y su traza \\(\\operatorname{tr}(C)\\).</p>",
      hint: "<p>Calcula primero \\(A^{\\top}\\) y multiplica por \\(B\\); la traza es la suma de la diagonal principal de \\(C\\).</p>",
      solution: [
        "<p>La transpuesta es \\(A^{\\top}=\\begin{pmatrix}1&3\\\\2&4\\end{pmatrix}\\).</p>",
        "<p>\\(C=A^{\\top}B=\\begin{pmatrix}1&3\\\\2&4\\end{pmatrix}\\begin{pmatrix}5&6\\\\7&8\\end{pmatrix}=\\begin{pmatrix}5+21&6+24\\\\10+28&12+32\\end{pmatrix}=\\begin{pmatrix}26&30\\\\38&44\\end{pmatrix}\\).</p>",
        "<p>La traza es la suma de la diagonal: \\(\\operatorname{tr}(C)=26+44=70\\).</p>",
        "<p>Atención: \\(C=A^{\\top}B\\neq AB=\\begin{pmatrix}19&22\\\\43&50\\end{pmatrix}\\), cuya traza sería 69.</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          prod: { type: "matrix", rows: 2, cols: 2, expected: [["26", "30"], ["38", "44"]] },
          tr: { type: "number", expected: "70" },
        },
        labels: { prod: "Matriz C = A transpuesta por B", tr: "Traza de C" },
      },
    },
    {
      id: "T2-N4",
      level: "normal",
      statement: "<p>Sean \\(u=(2,3,6)\\) y \\(v=(1,2,2)\\) en \\(\\mathbb{R}^{3}\\). Calcula el módulo \\(\\|u\\|\\) y la distancia euclídea \\(d(u,v)=\\|u-v\\|\\).</p>",
      hint: "<p>\\(\\|u\\|=\\sqrt{u^{\\top}u}\\) y \\(d(u,v)=\\|u-v\\|\\). Si la raíz no sale exacta, deja el resultado con raíz.</p>",
      solution: [
        "<p>\\(\\|u\\|=\\sqrt{2^{2}+3^{2}+6^{2}}=\\sqrt{4+9+36}=\\sqrt{49}=7\\).</p>",
        "<p>\\(u-v=(2-1,3-2,6-2)=(1,1,4)\\).</p>",
        "<p>\\(d(u,v)=\\sqrt{1^{2}+1^{2}+4^{2}}=\\sqrt{18}=3\\sqrt{2}\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          norm: { type: "number", expected: "7" },
          dist: { type: "number", expected: "3*sqrt(2)" },
        },
        labels: { norm: "Módulo de u", dist: "Distancia d(u,v)" },
      },
    },
    {
      id: "T2-N5",
      level: "normal",
      statement: "<p>¿Es ortogonal la matriz \\(Q=\\dfrac{1}{5}\\begin{pmatrix}3&4\\\\4&-3\\end{pmatrix}\\)? Responde verdadero o falso.</p>",
      hint: "<p>Una matriz real es ortogonal si y solo si \\(Q^{\\top}Q=I\\), es decir, si sus columnas son ortonormales.</p>",
      solution: [
        "<p>Las columnas son \\(q_1=\\frac{1}{5}(3,4)\\) y \\(q_2=\\frac{1}{5}(4,-3)\\).</p>",
        "<p>\\(\\|q_1\\|^{2}=\\frac{9+16}{25}=1\\) y \\(\\|q_2\\|^{2}=\\frac{16+9}{25}=1\\): son unitarias.</p>",
        "<p>\\(q_1^{\\top}q_2=\\frac{12-12}{25}=0\\): son ortogonales entre sí.</p>",
        "<p>Por tanto \\(Q^{\\top}Q=I\\) y la respuesta es verdadero.</p>",
      ],
      answer: { type: "bool", expected: true },
    },
    {
      id: "T2-N6",
      level: "normal",
      statement: "<p>Calcula la matriz inversa de \\(A=\\begin{pmatrix}2&5\\\\1&3\\end{pmatrix}\\). Escribe en cada celda el número correspondiente.</p>",
      hint: "<p>Para una \\(2\\times 2\\), \\(A^{-1}=\\frac{1}{\\det A}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}\\) siempre que \\(\\det A\\neq 0\\).</p>",
      solution: [
        "<p>\\(\\det A=2\\cdot 3-5\\cdot 1=1\\neq 0\\), luego \\(A\\) es invertible.</p>",
        "<p>\\(A^{-1}=\\frac{1}{1}\\begin{pmatrix}3&-5\\\\-1&2\\end{pmatrix}=\\begin{pmatrix}3&-5\\\\-1&2\\end{pmatrix}\\).</p>",
        "<p>Comprobación: \\(AA^{-1}=\\begin{pmatrix}2&5\\\\1&3\\end{pmatrix}\\begin{pmatrix}3&-5\\\\-1&2\\end{pmatrix}=\\begin{pmatrix}6-5&-10+10\\\\3-3&-5+6\\end{pmatrix}=I\\).</p>",
      ],
      answer: { type: "matrix", rows: 2, cols: 2, expected: [["3", "-5"], ["-1", "2"]] },
    },

    /* ---------------- NIVEL MEDIO ---------------- */
    {
      id: "T2-M1",
      level: "medio",
      statement: "<p>Sea \\(X=\\begin{pmatrix}A&B\\\\C&D\\end{pmatrix}\\) con los bloques \\(A=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}\\), \\(B=\\begin{pmatrix}1\\\\0\\end{pmatrix}\\), \\(C=\\begin{pmatrix}0&1\\end{pmatrix}\\), \\(D=(1)\\); e \\(Y=\\begin{pmatrix}E\\\\F\\end{pmatrix}\\) con \\(E=\\begin{pmatrix}3&1\\\\1&2\\end{pmatrix}\\) y \\(F=\\begin{pmatrix}2&5\\end{pmatrix}\\). Calcula el producto \\(XY\\) por bloques.</p>",
      hint: "<p>\\(XY=\\begin{pmatrix}AE+BF\\\\CE+DF\\end{pmatrix}\\). Recuerda que \\(BF\\) es el producto de una \\(2\\times 1\\) por una \\(1\\times 2\\), y da una matriz \\(2\\times 2\\).</p>",
      solution: [
        "<p>\\(AE=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}\\begin{pmatrix}3&1\\\\1&2\\end{pmatrix}=\\begin{pmatrix}5&5\\\\1&2\\end{pmatrix}\\) y \\(BF=\\begin{pmatrix}1\\\\0\\end{pmatrix}\\begin{pmatrix}2&5\\end{pmatrix}=\\begin{pmatrix}2&5\\\\0&0\\end{pmatrix}\\).</p>",
        "<p>\\(AE+BF=\\begin{pmatrix}7&10\\\\1&2\\end{pmatrix}\\).</p>",
        "<p>\\(CE=\\begin{pmatrix}0&1\\end{pmatrix}\\begin{pmatrix}3&1\\\\1&2\\end{pmatrix}=(1,2)\\) y \\(DF=1\\cdot(2,5)=(2,5)\\), luego \\(CE+DF=(3,7)\\).</p>",
        "<p>Recomponiendo los bloques: \\(XY=\\begin{pmatrix}7&10\\\\1&2\\\\3&7\\end{pmatrix}\\), una matriz \\(3\\times 2\\), como manda el formato.</p>",
      ],
      answer: { type: "matrix", rows: 3, cols: 2, expected: [["7", "10"], ["1", "2"], ["3", "7"]] },
    },
    {
      id: "T2-M2",
      level: "medio",
      statement: "<p>Calcula la matriz inversa de \\(A=\\begin{pmatrix}1&2&3\\\\0&1&4\\\\5&6&0\\end{pmatrix}\\).</p>",
      hint: "<p>El determinante vale 1. Puedes usar cofactores (y transponer la matriz de cofactores) o escalonar \\((A\\mid I)\\).</p>",
      solution: [
        "<p>\\(\\det A=1\\cdot(0-24)-2\\cdot(0-20)+3\\cdot(0-5)=-24+40-15=1\\neq 0\\).</p>",
        "<p>Matriz de cofactores: \\(C=\\begin{pmatrix}-24&20&-5\\\\18&-15&4\\\\5&-4&1\\end{pmatrix}\\), y \\(\\operatorname{adj}(A)=C^{\\top}=\\begin{pmatrix}-24&18&5\\\\20&-15&-4\\\\-5&4&1\\end{pmatrix}\\).</p>",
        "<p>Como \\(\\det A=1\\), \\(A^{-1}=\\operatorname{adj}(A)=\\begin{pmatrix}-24&18&5\\\\20&-15&-4\\\\-5&4&1\\end{pmatrix}\\).</p>",
        "<p>Comprobación: \\(AA^{-1}=I\\); por ejemplo, la entrada \\((1,1)\\) es \\(1(-24)+2(20)+3(-5)=1\\) y la \\((3,3)\\) es \\(5(5)+6(-4)+0(1)=1\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 3,
        cols: 3,
        expected: [["-24", "18", "5"], ["20", "-15", "-4"], ["-5", "4", "1"]],
      },
    },
    {
      id: "T2-M3",
      level: "medio",
      statement: "<p>Sean \\(v_1=(1,1,0)\\) y \\(v_2=(2,0,1)\\) en \\(\\mathbb{R}^{3}\\). Aplica el primer paso del procedimiento de Gram–Schmidt: calcula \\(u_2=v_2-\\dfrac{v_1^{\\top}v_2}{\\|v_1\\|^{2}}v_1\\) (sin normalizar).</p>",
      hint: "<p>Resta a \\(v_2\\) su proyección sobre \\(v_1\\): el resultado debe ser ortogonal a \\(v_1\\).</p>",
      solution: [
        "<p>\\(v_1^{\\top}v_2=1\\cdot 2+1\\cdot 0+0\\cdot 1=2\\) y \\(\\|v_1\\|^{2}=1+1+0=2\\).</p>",
        "<p>El coeficiente de proyección es \\(\\frac{v_1^{\\top}v_2}{\\|v_1\\|^{2}}=\\frac{2}{2}=1\\).</p>",
        "<p>\\(u_2=(2,0,1)-1\\cdot(1,1,0)=(1,-1,1)\\).</p>",
        "<p>Comprobación: \\(v_1^{\\top}u_2=1-1+0=0\\), luego \\(u_2\\perp v_1\\). Si normalizaras, obtendrías \\(f_2=\\frac{1}{\\sqrt{3}}(1,-1,1)\\).</p>",
      ],
      answer: { type: "vector", rows: 3, cols: 1, expected: [["1"], ["-1"], ["1"]] },
    },
    {
      id: "T2-M4",
      level: "medio",
      statement: "<p>Sea el subespacio \\(V=\\langle (1,1,0),(0,1,1)\\rangle\\subset\\mathbb{R}^{3}\\). Calcula la proyección ortogonal de \\(w=(3,0,3)\\) sobre \\(V\\).</p>",
      hint: "<p>Con \\(A\\) la matriz cuyas columnas son los generadores, \\(\\operatorname{proy}_V(w)=A(A^{\\top}A)^{-1}A^{\\top}w\\).</p>",
      solution: [
        "<p>\\(A=\\begin{pmatrix}1&0\\\\1&1\\\\0&1\\end{pmatrix}\\), luego \\(A^{\\top}A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}\\) y \\((A^{\\top}A)^{-1}=\\frac{1}{3}\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}\\).</p>",
        "<p>\\(A^{\\top}w=\\begin{pmatrix}3+0\\\\0+3\\end{pmatrix}=\\begin{pmatrix}3\\\\3\\end{pmatrix}\\).</p>",
        "<p>\\((A^{\\top}A)^{-1}A^{\\top}w=\\frac{1}{3}\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}\\begin{pmatrix}3\\\\3\\end{pmatrix}=\\frac{1}{3}\\begin{pmatrix}3\\\\3\\end{pmatrix}=\\begin{pmatrix}1\\\\1\\end{pmatrix}\\).</p>",
        "<p>\\(\\operatorname{proy}_V(w)=1\\cdot(1,1,0)+1\\cdot(0,1,1)=(1,2,1)\\).</p>",
        "<p>El residuo \\(w-\\operatorname{proy}_V(w)=(2,-2,2)\\) es ortogonal a los dos generadores, como debe ser.</p>",
      ],
      answer: { type: "vector", rows: 3, cols: 1, expected: [["1"], ["2"], ["1"]] },
    },
    {
      id: "T2-M5",
      level: "medio",
      statement: "<p>Sea la base ordenada de \\(\\mathbb{R}^{3}\\) dada por \\(w_1=(1,0,0)\\), \\(w_2=(1,1,0)\\), \\(w_3=(0,1,1)\\). Calcula las coordenadas de \\(u=(2,3,1)\\) respecto de esa base.</p>",
      hint: "<p>Busca \\(c_1,c_2,c_3\\) con \\(u=c_1w_1+c_2w_2+c_3w_3\\); equivale a resolver \\(c=W^{-1}u\\) con \\(W=(w_1\\ w_2\\ w_3)\\).</p>",
      solution: [
        "<p>La ecuación \\(u=c_1w_1+c_2w_2+c_3w_3\\) se lee coordenada a coordenada: \\((2,3,1)=(c_1+c_2,\\ c_2+c_3,\\ c_3)\\).</p>",
        "<p>De la tercera coordenada: \\(c_3=1\\).</p>",
        "<p>De la segunda: \\(c_2+1=3\\), luego \\(c_2=2\\).</p>",
        "<p>De la primera: \\(c_1+2=2\\), luego \\(c_1=0\\). Las coordenadas son \\((0,2,1)\\).</p>",
        "<p>Comprobación: \\(0\\cdot(1,0,0)+2\\cdot(1,1,0)+1\\cdot(0,1,1)=(2,3,1)=u\\).</p>",
      ],
      answer: { type: "vector", rows: 3, cols: 1, expected: [["0"], ["2"], ["1"]] },
    },

    /* ---------------- NIVEL EXAMEN ---------------- */
    {
      id: "T2-E1",
      level: "examen",
      statement: "<p>Sea \\(A=\\begin{pmatrix}2&5&7\\\\6&3&4\\\\5&-2&-3\\end{pmatrix}\\). Calcula \\(A^{-1}\\).</p>",
      hint: "<p>El determinante vale \\(-1\\). Aplica cofactores y no olvides transponer la matriz de cofactores.</p>",
      solution: [
        "<p>\\(\\det A=2(-9+8)-5(-18-20)+7(-12-15)=-2+190-189=-1\\).</p>",
        "<p>La matriz de cofactores es \\(C=\\begin{pmatrix}-1&38&-27\\\\1&-41&29\\\\-1&34&-24\\end{pmatrix}\\), de modo que \\(\\operatorname{adj}(A)=C^{\\top}=\\begin{pmatrix}-1&1&-1\\\\38&-41&34\\\\-27&29&-24\\end{pmatrix}\\).</p>",
        "<p>\\(A^{-1}=\\frac{1}{\\det A}\\operatorname{adj}(A)=-\\operatorname{adj}(A)=\\begin{pmatrix}1&-1&1\\\\-38&41&-34\\\\27&-29&24\\end{pmatrix}\\).</p>",
        "<p>Comprobación: \\(AA^{-1}=I\\); por ejemplo, la entrada \\((1,1)\\) es \\(2(1)+5(-38)+7(27)=2-190+189=1\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 3,
        cols: 3,
        expected: [["1", "-1", "1"], ["-38", "41", "-34"], ["27", "-29", "24"]],
      },
    },
    {
      id: "T2-E2",
      level: "examen",
      statement: "<p>Sea \\(V=\\langle (1,0,1),(0,1,1)\\rangle\\subset\\mathbb{R}^{3}\\) y \\(w=(2,1,0)\\). Calcula la proyección ortogonal \\(\\operatorname{proy}_V(w)\\) y el componente ortogonal \\(w-\\operatorname{proy}_V(w)\\).</p>",
      hint: "<p>Usa \\(\\operatorname{proy}_V(w)=A(A^{\\top}A)^{-1}A^{\\top}w\\). El componente ortogonal debe anularse al multiplicarlo escalarmente por cada generador de \\(V\\).</p>",
      solution: [
        "<p>\\(A=\\begin{pmatrix}1&0\\\\0&1\\\\1&1\\end{pmatrix}\\), \\(A^{\\top}A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}\\), \\((A^{\\top}A)^{-1}=\\frac{1}{3}\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}\\).</p>",
        "<p>\\(A^{\\top}w=\\begin{pmatrix}2+0\\\\1+0\\end{pmatrix}=\\begin{pmatrix}2\\\\1\\end{pmatrix}\\).</p>",
        "<p>\\((A^{\\top}A)^{-1}A^{\\top}w=\\frac{1}{3}\\begin{pmatrix}4-1\\\\-2+2\\end{pmatrix}=\\begin{pmatrix}1\\\\0\\end{pmatrix}\\).</p>",
        "<p>\\(\\operatorname{proy}_V(w)=1\\cdot(1,0,1)+0\\cdot(0,1,1)=(1,0,1)\\).</p>",
        "<p>El componente ortogonal es \\(w-\\operatorname{proy}_V(w)=(1,1,-1)\\), verificando \\((1,1,-1)\\cdot(1,0,1)=0\\) y \\((1,1,-1)\\cdot(0,1,1)=0\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          proj: { type: "vector", rows: 3, cols: 1, expected: [["1"], ["0"], ["1"]] },
          perp: { type: "vector", rows: 3, cols: 1, expected: [["1"], ["1"], ["-1"]] },
        },
        labels: { proj: "Proyección sobre V", perp: "Componente ortogonal" },
      },
    },
    {
      id: "T2-E3",
      level: "examen",
      statement: "<p>¿Cuál de las siguientes matrices es ortogonal?</p>",
      hint: "<p>Una matriz real es ortogonal si y solo si \\(Q^{\\top}Q=I\\): sus columnas deben ser ortogonales <em>y</em> de módulo 1.</p>",
      solution: [
        "<p>La matriz \\(A\\) tiene columnas \\((1,0)\\) y \\((1,1)\\): \\(A^{\\top}A=\\begin{pmatrix}1&1\\\\1&2\\end{pmatrix}\\neq I\\).</p>",
        "<p>La matriz \\(B\\) tiene columnas \\((0,1)\\) y \\((-1,0)\\), ortonormales: \\(B^{\\top}B=I\\). Es la rotación de \\(90^{\\circ}\\) del plano.</p>",
        "<p>La matriz \\(C\\) tiene columnas ortogonales, pero \\(\\|c_1\\|=\\|c_2\\|=\\sqrt{2}\\), luego \\(C^{\\top}C=2I\\): falta normalizar con el factor \\(1/\\sqrt{2}\\).</p>",
        "<p>La matriz \\(D\\) verifica \\(D^{\\top}D=4I\\). La respuesta correcta es \\(B\\).</p>",
      ],
      answer: {
        type: "choice",
        expected: 1,
        choices: [
          "<p>\\(A=\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}\\)</p>",
          "<p>\\(B=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}\\)</p>",
          "<p>\\(C=\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}\\)</p>",
          "<p>\\(D=\\begin{pmatrix}2&0\\\\0&2\\end{pmatrix}\\)</p>",
        ],
      },
    },
    {
      id: "T2-E4",
      level: "examen",
      statement: "<p>Sea \\(Q=\\dfrac{1}{7}\\begin{pmatrix}2&3&6\\\\6&2&-3\\\\-3&6&-2\\end{pmatrix}\\). (a) ¿Es \\(Q\\) una matriz ortogonal? (b) Calcula \\(Q^{-1}\\).</p>",
      hint: "<p>Si \\(Q\\) resulta ortogonal, entonces \\(Q^{-1}=Q^{\\top}\\): basta con transponer.</p>",
      solution: [
        "<p>Las columnas son \\(q_1=\\frac{1}{7}(2,6,-3)\\), \\(q_2=\\frac{1}{7}(3,2,6)\\), \\(q_3=\\frac{1}{7}(6,-3,-2)\\).</p>",
        "<p>\\(\\|q_1\\|^{2}=\\|q_2\\|^{2}=\\|q_3\\|^{2}=\\frac{4+36+9}{49}=1\\) y los productos escalares cruzados se anulan: \\(q_1^{\\top}q_2=\\frac{6+12-18}{49}=0\\), \\(q_1^{\\top}q_3=\\frac{12-18+6}{49}=0\\), \\(q_2^{\\top}q_3=\\frac{18-6-12}{49}=0\\).</p>",
        "<p>Por tanto \\(Q^{\\top}Q=I\\) y \\(Q\\) es ortogonal (respuesta: verdadero).</p>",
        "<p>Al ser ortogonal, \\(Q^{-1}=Q^{\\top}=\\frac{1}{7}\\begin{pmatrix}2&6&-3\\\\3&2&6\\\\6&-3&-2\\end{pmatrix}\\), es decir, con celdas \\(2/7, 6/7, -3/7\\) en la primera fila, y así el resto.</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          orth: { type: "bool", expected: true },
          inv: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [["2/7", "6/7", "-3/7"], ["3/7", "2/7", "6/7"], ["6/7", "-3/7", "-2/7"]],
          },
        },
        labels: { orth: "¿Es Q ortogonal?", inv: "Matriz Q inversa" },
      },
    },
  ],
};
