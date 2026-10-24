window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["tema-5"] = {
  id: "tema-5",
  title: "Procesos de diagonalización",
  summary: [
    {
      h: "Definiciones clave",
      items: [
        "Diagonalización amplia: \\(A=W\\Lambda V\\), con \\(\\Lambda\\) diagonal-rectangular del formato de \\(A\\) y \\(W,V\\) invertibles.",
        "Similitud (semejanza): \\(A=WBW^{-1}\\). Congruencia: \\(A=WBW^{*}\\). Si \\(W=Q\\) es ortogonal (o unitaria), ambas coinciden (\\(V=W^{*}=Q^{*}\\)).",
        "Factorización \\(LDU\\): \\(L\\) unitriangular inferior, \\(D\\) diagonal, \\(U\\) unitriangular superior; si \\(A\\) es simétrica, \\(A=LDL^{\\top}\\); si \\(A\\) es hermítica, \\(A=LDL^{*}\\) con \\(D\\) real.",
        "Cholesky: \\(A\\) es hermítica semidefinida positiva \\(\\iff A=LL^{*}\\) con \\(L\\) triangular inferior (única con diagonal positiva si \\(A\\) es definida positiva).",
        "Matriz normal: \\(A^{*}A=AA^{*}\\); son normales las hermíticas, en particular las simétricas reales, y las unitarias/ortogonales.",
        "Signatura (inercia) de una hermítica: terna \\((\\pi,\\nu,\\zeta)\\) de autovalores positivos, negativos y nulos.",
        "Diagonalizable: existe base de autovectores; equivalente a que \\(\\dim\\ker(\\lambda I-A)\\) iguale la multiplicidad algebraica en cada \\(\\lambda\\).",
        "Bloque de Jordan \\(J_{k}(\\lambda)\\): diagonal con \\(\\lambda\\) y unos en la superdiagonal.",
        "SVD: \\(A=U\\Sigma V^{*}=U_{r}\\Sigma_{r}V_{r}^{*}\\), con \\(U,V\\) ortogonales si \\(K=\\mathbb{R}\\) (unitarias si \\(K=\\mathbb{C}\\)) y \\(\\Sigma_{r}=\\operatorname{diag}(\\sigma_{1},\\dots,\\sigma_{r})\\) de valores singulares \\(\\sigma_{1}\\ge\\cdots\\ge\\sigma_{r}\\gt 0\\).",
        "Pseudoinversa de Moore–Penrose: \\(A^{\\dagger}=V_{r}\\Sigma_{r}^{-1}U_{r}^{*}\\) a partir de la SVD compacta (o \\(A^{\\dagger}=V\\Sigma^{\\dagger}U^{*}\\) en la SVD completa).",
      ],
    },
    {
      h: "Resultados que hay que saber",
      items: [
        "La factorización \\(LDU\\) de una matriz cuadrada sin menores principales nulos existe y es única.",
        "Teorema espectral: \\(A\\) admite \\(A=Q\\Lambda Q^{*}\\) con \\(Q\\) unitaria si y solo si \\(A\\) es normal (sobre \\(\\mathbb{R}\\), para matrices normales de espectro real); si \\(A\\) es hermítica, sus autovalores son reales y si \\(A\\succeq 0\\) existe una única raíz cuadrada hermítica semidefinida positiva \\(A^{1/2}=Q\\Lambda^{1/2}Q^{*}\\).",
        "Ley de inercia de Sylvester: dos matrices hermíticas del mismo formato son congruentes si y solo si tienen la misma signatura.",
        "Tres criterios de definitud para \\(A\\) hermítica: (1) signos de los autovalores; (2) criterio de Sylvester (\\(\\Delta_{k}\\gt 0\\) para \\(k=1,\\dots,n\\) \\(\\iff\\) definida positiva); (3) factorización \\(A=B^{*}B\\) (\\(\\iff\\) semidefinida positiva; con \\(B\\) invertible \\(\\iff\\) definida positiva).",
        "Criterio de diagonalizabilidad por similitud: \\(A\\) es diagonalizable si y solo si los autovectores generan todo \\(K^{n}\\).",
        "Toda matriz compleja \\(A\\in\\mathbb{C}^{n\\times n}\\) es semejante a su forma canónica de Jordan, única salvo el orden de los bloques.",
        "Toda matriz admite SVD; \\(\\sigma_{i}=\\sqrt{\\lambda_{i}(A^{*}A)}\\) y \\(\\|A\\|_{2}=\\sigma_{1}\\).",
        "Propiedades de Penrose: \\(AA^{\\dagger}A=A\\), \\(A^{\\dagger}AA^{\\dagger}=A^{\\dagger}\\), \\((AA^{\\dagger})^{*}=AA^{\\dagger}\\), \\((A^{\\dagger}A)^{*}=A^{\\dagger}A\\).",
        "La pseudoinversa resuelve las ecuaciones normales: \\(\\mathbf{x}=A^{\\dagger}\\mathbf{b}\\) da la solución (si el sistema es compatible) o el ajuste de mínimos cuadrados (si es incompatible) de mínima norma euclídea \\(\\|\\mathbf{x}\\|_{2}\\).",
      ],
    },
    {
      h: "Errores frecuentes",
      items: [
        "Confundir similitud (\\(A=WBW^{-1}\\)) con congruencia (\\(A=WBW^{*}\\)): conservan objetos distintos (la aplicación lineal frente a la forma bilineal o hermítica).",
        "En Cholesky, si aparece un radicando estrictamente negativo, \\(A\\) no es semidefinida positiva; si aparece un pivote nulo (\\(l_{ii}=0\\)), \\(A\\) deja de ser definida positiva, aunque sigue siendo semidefinida positiva si y solo si el resto de esa columna residual se anula.",
        "Creer que en la SVD puede tomarse \\(U=V\\): solo si \\(A\\) es simétrica (hermítica) semidefinida positiva.",
        "Intentar diagonalizar por similitud una matriz sin base de autovectores (p. ej. un bloque de Jordan no trivial).",
        "Pensar que basta con que los menores principales líderes sean \\(\\ge 0\\) para la semidefinitud positiva: hace falta mirar los autovalores o una factorización \\(A=B^{*}B\\).",
      ],
    },
    {
      h: "En IA",
      items: [
        "PCA mediante la SVD de la matriz de datos centrados \\(X\\in\\mathbb{R}^{n\\times d}\\) (muestras por filas): las direcciones principales son las columnas de \\(V\\), las proyecciones son \\(XV=U\\Sigma\\) y las varianzas muestrales son \\(\\sigma_{i}^{2}/(n-1)\\).",
        "Comprimir o reducir dimensionalidad: truncar \\(\\Sigma\\) quedándose con los \\(k\\) mayores valores singulares (mejor aproximación de rango \\(k\\)).",
        "La pseudoinversa \\(\\mathbf{x}=A^{\\dagger}\\mathbf{b}\\) devuelve el ajuste de mínimos cuadrados de mínima norma \\(\\|\\mathbf{x}\\|_{2}\\) con matrices deficientes de rango, habituales en regresión con datos colineales.",
        "El signo de los autovalores de la Hessiana clasifica los puntos críticos de la función de pérdida.",
        "Cholesky permite muestrear Gaussianas (\\(\\mathbf{x}=\\mu+L\\mathbf{z}\\)) y alimentar métodos de optimización de segundo orden.",
      ],
    },
  ],
  mindmap: {
    label: "Tema V · Diagonalización",
    detail: "Cómo descomponer \\(A\\) en factores geométricamente interpretables: \\(A=W\\Lambda V\\).",
    children: [
      {
        label: "Similitud y congruencia",
        detail: "Dos maneras de comparar matrices: \\(A=WBW^{-1}\\) (aplicación lineal) y \\(A=WBW^{*}\\) (forma bilineal o hermítica).",
        children: [
          { label: "Diagonalización amplia", detail: "\\(A=W\\Lambda V\\), con \\(\\Lambda\\) diagonal-rectangular." },
          { label: "Caso ortogonal", detail: "\\(W=Q\\) y \\(V=W^{*}=Q^{*}\\) ortogonal: a la vez similitud y congruencia." },
        ],
      },
      {
        label: "LDU y Cholesky",
        detail: "Factores triangulares por eliminación gaussiana.",
        children: [
          { label: "Factorización LDU", detail: "\\(A=LDU\\) única si no hay menores principales nulos; si \\(A=A^{\\top}\\), \\(A=LDL^{\\top}\\); si \\(A=A^{*}\\), \\(A=LDL^{*}\\) con \\(D\\) real." },
          { label: "Cholesky", detail: "\\(A=LL^{*}\\) para hermíticas semidefinidas positivas (única con diagonal \\(\\gt 0\\) si es definida positiva)." },
        ],
      },
      {
        label: "Diagonalización ortogonal",
        detail: "El escenario central: \\(A=Q\\Lambda Q^{*}\\) con \\(Q\\) ortogonal o unitaria.",
        children: [
          { label: "Teorema espectral", detail: "\\(A\\) normal \\(\\iff A=Q\\Lambda Q^{*}\\); si \\(A\\succeq 0\\), raíz cuadrada única \\(A^{1/2}=Q\\Lambda^{1/2}Q^{*}\\)." },
          { label: "Inercia", detail: "Ley de Sylvester: dos hermíticas del mismo formato son congruentes \\(\\iff\\) tienen la misma signatura." },
          { label: "Definitud", detail: "Tres criterios: autovalores, menores de Sylvester y factorización \\(A=B^{*}B\\)." },
        ],
      },
      {
        label: "Similitud y Jordan",
        detail: "Cuando no hay base de autovectores.",
        children: [
          { label: "Diagonalizables", detail: "\\(\\dim\\ker(\\lambda I-A)=\\) multiplicidad algebraica para cada \\(\\lambda\\)." },
          { label: "Forma de Jordan", detail: "Bloques casi diagonales \\(J_{k}(\\lambda)\\) con cadenas de autovectores generalizados." },
        ],
      },
      {
        label: "SVD y pseudoinversa",
        detail: "\\(A=U\\Sigma V^{*}=U_{r}\\Sigma_{r}V_{r}^{*}\\): la herramienta fundamental del álgebra lineal en IA.",
        children: [
          { label: "Valores singulares", detail: "\\(\\sigma_{i}=\\sqrt{\\lambda_{i}(A^{*}A)}\\); \\(\\|A\\|_{2}=\\sigma_{1}\\)." },
          { label: "Pseudoinversa", detail: "\\(A^{\\dagger}=V_{r}\\Sigma_{r}^{-1}U_{r}^{*}=V\\Sigma^{\\dagger}U^{*}\\); ecuaciones de Penrose y ajuste de mínima norma \\(\\|\\mathbf{x}\\|_{2}\\)." },
          { label: "PCA y compresión", detail: "En \\(X\\in\\mathbb{R}^{n\\times d}\\), ejes \\(V\\), proyecciones \\(U\\Sigma\\), varianzas \\(\\sigma_{i}^{2}/(n-1)\\) y truncamiento a rango \\(k\\)." },
        ],
      },
    ],
  },
  drills: [
    {
      id: "T5-N1",
      level: "normal",
      statement:
        "<p>Calcula los autovalores de la matriz \\[ A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}. \\] " +
        "Escríbelos separados por punto y coma (por ejemplo <code>3;-1</code>).</p>",
      hint: "<p>Resuelve \\(\\det(\\lambda I - A)=0\\): \\((4-\\lambda)(3-\\lambda)-2=0\\).</p>",
      solution: [
        "<p>\\(\\det(\\lambda I - A)=(4-\\lambda)(3-\\lambda)-2=\\lambda^{2}-7\\lambda+10\\).</p>",
        "<p>Factorizando, \\(\\lambda^{2}-7\\lambda+10=(\\lambda-5)(\\lambda-2)\\).</p>",
        "<p>Los autovalores son \\(\\lambda_{1}=5\\) y \\(\\lambda_{2}=2\\).</p>",
      ],
      answer: { type: "exprset", expected: ["5", "2"] },
    },
    {
      id: "T5-N2",
      level: "normal",
      statement:
        "<p>Decide si es verdadero o falso: la matriz \\[ A = \\begin{pmatrix} 4 & 1 \\\\ -1 & 2 \\end{pmatrix} \\] " +
        "es diagonalizable por similitud.</p>",
      hint: "<p>Calcula el polinomio característico \\(\\det(\\lambda I - A)\\) y compara la multiplicidad algebraica del único autovalor con \\(\\dim\\ker(A-\\lambda I)\\).</p>",
      solution: [
        "<p>El polinomio característico es \\(\\det(\\lambda I - A)=(\\lambda-4)(\\lambda-2)+1=\\lambda^{2}-6\\lambda+9=(\\lambda-3)^{2}\\), luego \\(\\lambda=3\\) tiene multiplicidad algebraica \\(2\\).</p>",
        "<p>Sin embargo, \\(A-3I=\\begin{pmatrix} 1 & 1 \\\\ -1 & -1 \\end{pmatrix}\\) tiene rango \\(1\\), por lo que \\(\\ker(A-3I)=\\langle (1,-1)^{\\top}\\rangle\\) tiene dimensión \\(1\\lt 2\\).</p>",
        "<p>Al no coincidir la dimensión geométrica con la multiplicidad algebraica, \\(A\\) no es diagonalizable (su forma canónica de Jordan es \\(J_{2}(3)\\)).</p>",
      ],
      answer: { type: "bool", expected: false },
    },
    {
      id: "T5-N3",
      level: "normal",
      statement:
        "<p>Calcula la factorización de Cholesky \\(A=LL^{\\top}\\) de \\[ A = \\begin{pmatrix} 4 & 2 \\\\ 2 & 5 \\end{pmatrix}, \\] " +
        "con \\(L\\) triangular inferior de diagonal positiva. Escribe la matriz \\(L\\).</p>",
      hint: "<p>Impon \\(L=\\begin{pmatrix} a & 0 \\\\ b & c \\end{pmatrix}\\) con \\(a, c\\gt 0\\) e iguala \\(LL^{\\top}\\) a \\(A\\).</p>",
      solution: [
        "<p>De la primera entrada de \\(LL^{\\top}=A\\): \\(a^{2}=4\\), y como la diagonal debe ser positiva, \\(a=2\\).</p>",
        "<p>La entrada \\((1,2)\\) da \\(ab=2\\), luego \\(b=1\\); la \\((2,2)\\) da \\(b^{2}+c^{2}=5\\), luego \\(c^{2}=4\\) y \\(c=2\\).</p>",
        "<p>Por tanto \\(L=\\begin{pmatrix} 2 & 0 \\\\ 1 & 2 \\end{pmatrix}\\). Comprobación: \\(LL^{\\top}=\\begin{pmatrix} 4 & 2 \\\\ 2 & 5 \\end{pmatrix}=A\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 2,
        cols: 2,
        expected: [
          ["2", "0"],
          ["1", "2"],
        ],
      },
    },
    {
      id: "T5-N4",
      level: "normal",
      statement:
        "<p>La forma cuadrática \\(q(x,y)=2x^{2}+6xy+2y^{2}\\), de matriz simétrica " +
        "\\(A=\\begin{pmatrix} 2 & 3 \\\\ 3 & 2 \\end{pmatrix}\\), es:</p>",
      hint: "<p>Estudia el signo de los autovalores de \\(A\\), o valora \\(q\\) en dos vectores de signos opuestos.</p>",
      solution: [
        "<p>El polinomio característico de \\(A\\) es \\(\\lambda^{2}-4\\lambda-5=(\\lambda-5)(\\lambda+1)\\), con autovalores \\(5\\) y \\(-1\\).</p>",
        "<p>Al haber autovalores de distinto signo, la forma es indefinida.</p>",
        "<p>Directamente: \\(q(1,0)=2\\gt 0\\) mientras que \\(q(1,-1)=2-6+2=-2\\lt 0\\).</p>",
      ],
      answer: {
        type: "choice",
        expected: 2,
        choices: [
          "<p>Definida positiva</p>",
          "<p>Semidefinida positiva, pero no definida positiva</p>",
          "<p>Indefinida</p>",
          "<p>Definida negativa</p>",
        ],
      },
    },
    {
      id: "T5-N5",
      level: "normal",
      statement:
        "<p>Calcula la pseudoinversa de Moore–Penrose de la matriz diagonal \\[ A = \\begin{pmatrix} 2 & 0 \\\\ 0 & 4 \\end{pmatrix}. \\]</p>",
      hint: "<p>\\(A\\) es invertible, y toda matriz invertible verifica \\(A^{\\dagger}=A^{-1}\\).</p>",
      solution: [
        "<p>La matriz \\(A=\\operatorname{diag}(2,4)\\) es invertible, de rango \\(2\\).</p>",
        "<p>Para matrices invertibles, \\(A^{\\dagger}=A^{-1}\\) (basta verificar las ecuaciones de Penrose).</p>",
        "<p>Por tanto \\(A^{\\dagger}=\\operatorname{diag}(1/2,\\,1/4)=\\begin{pmatrix} 1/2 & 0 \\\\ 0 & 1/4 \\end{pmatrix}\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 2,
        cols: 2,
        expected: [
          ["1/2", "0"],
          ["0", "1/4"],
        ],
      },
    },
    {
      id: "T5-N6",
      level: "normal",
      statement:
        "<p>Calcula la norma espectral (norma \\(2\\)) de \\[ A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}. \\] " +
        "Recuerda que \\(\\|A\\|_{2}=\\sigma_{1}\\), el mayor valor singular de \\(A\\).</p>",
      hint: "<p>\\(A\\) es simétrica: sus valores singulares son los valores absolutos de sus autovalores.</p>",
      solution: [
        "<p>Los autovalores de \\(A\\) son \\(\\lambda=3\\) y \\(\\lambda=1\\).</p>",
        "<p>Al ser \\(A\\) simétrica, sus valores singulares son \\(|3|=3\\) y \\(|1|=1\\), luego \\(\\sigma_{1}=3\\).</p>",
        "<p>Por tanto \\(\\|A\\|_{2}=3\\).</p>",
      ],
      answer: { type: "number", expected: "3", exact: true },
    },
    {
      id: "T5-N7",
      level: "normal",
      statement:
        "<p>Calcula en orden los tres menores principales líderes \\(\\Delta_{1}, \\Delta_{2}, \\Delta_{3}\\) de la matriz simétrica tridiagonal " +
        "\\[ A = \\begin{pmatrix} 2 & -1 & 0 \\\\ -1 & 2 & -1 \\\\ 0 & -1 & 2 \\end{pmatrix} \\] " +
        "para comprobar mediante el criterio de Sylvester que es definida positiva.</p>",
      hint: "<p>\\(\\Delta_{1}=a_{11}\\), \\(\\Delta_{2}=\\det\\begin{pmatrix} 2 & -1 \\\\ -1 & 2 \\end{pmatrix}\\) y \\(\\Delta_{3}=\\det A\\).</p>",
      solution: [
        "<p>Primer menor principal: \\(\\Delta_{1}=2\\gt 0\\).</p>",
        "<p>Segundo menor principal: \\(\\Delta_{2}=\\det\\begin{pmatrix} 2 & -1 \\\\ -1 & 2 \\end{pmatrix}=4-1=3\\gt 0\\).</p>",
        "<p>Tercer menor principal: \\(\\Delta_{3}=\\det A=2(4-1)-(-1)(-2)=6-2=4\\gt 0\\). Al ser los tres estrictamente positivos, \\(A\\) es definida positiva por el criterio de Sylvester.</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          d1: { type: "number", expected: "2", exact: true },
          d2: { type: "number", expected: "3", exact: true },
          d3: { type: "number", expected: "4", exact: true },
        },
        labels: { d1: "Menor Δ₁", d2: "Menor Δ₂", d3: "Menor Δ₃" },
      },
    },
    {
      id: "T5-N8",
      level: "normal",
      statement:
        "<p>Considera la forma cuadrática \\(q(x,y)=x^{2}+2xy+y^{2}\\), de matriz simétrica " +
        "\\(A=\\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}\\). " +
        "Clasifícala, indica su autovalor nulo y da el autovector unitario asociado a ese autovalor, con la primera componente positiva. " +
        "Puedes escribir \\(\\sqrt{2}/2\\) como <code>sqrt(2)/2</code>.</p>",
      hint: "<p>El polinomio característico de \\(A\\) es \\(\\lambda^{2}-2\\lambda=\\lambda(\\lambda-2)\\), con autovalores \\(2\\) y \\(0\\). Para \\(\\lambda=0\\), la ecuación \\(A\\mathbf{v}=0\\) se reduce a \\(x+y=0\\).</p>",
      solution: [
        "<p>El polinomio característico es \\(\\det(\\lambda I-A)=\\lambda^{2}-2\\lambda=\\lambda(\\lambda-2)\\): autovalores \\(2\\) y \\(0\\).</p>",
        "<p>Como hay un autovalor nulo, \\(q\\) se anula en \\(\\ker A=\\{(t,-t)^{\\top}:t\\in\\mathbb{R}\\}\\neq\\{0\\}\\): la forma es <b>semidefinida positiva, pero no definida positiva</b> (la segunda de las opciones).</p>",
        "<p>El autovector unitario del autovalor nulo es \\(\\mathbf{v}=\\tfrac{1}{\\sqrt{2}}(1,-1)^{\\top}=\\begin{pmatrix} \\sqrt{2}/2 \\\\ -\\sqrt{2}/2 \\end{pmatrix}\\), con primera componente positiva.</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          tipo: {
            type: "choice",
            expected: 1,
            choices: [
              "<p>Definida positiva</p>",
              "<p>Semidefinida positiva, pero no definida positiva</p>",
              "<p>Indefinida</p>",
              "<p>Definida negativa</p>",
            ],
          },
          nulo: { type: "number", expected: "0", exact: true },
          vec: {
            type: "vector",
            rows: 2,
            cols: 1,
            expected: [["sqrt(2)/2"], ["-sqrt(2)/2"]],
          },
        },
        labels: {
          tipo: "Clasificación de la forma",
          nulo: "Autovalor nulo",
          vec: "Autovector unitario del autovalor nulo (primera componente positiva)",
        },
      },
    },
    {
      id: "T5-M1",
      level: "medio",
      statement:
        "<p>Diagonaliza por similitud la matriz \\[ A = \\begin{pmatrix} 5 & -1 \\\\ 2 & 2 \\end{pmatrix}. \\] " +
        "Escribe \\(A=PDP^{-1}\\) con \\(D=\\operatorname{diag}(\\lambda_{1},\\lambda_{2})\\), \\(\\lambda_{1}\\lt \\lambda_{2}\\), " +
        "y \\(P\\) de columnas los autovectores asociados normalizados para que su primera componente sea \\(1\\).</p>",
      hint: "<p>Los autovalores son \\(3\\) y \\(4\\). Para \\(\\lambda=3\\), \\((A-3I)\\mathbf{v}=0\\) da \\(\\mathbf{v}=(1,2)\\).</p>",
      solution: [
        "<p>\\(\\det(\\lambda I - A)=\\lambda^{2}-7\\lambda+12=(\\lambda-3)(\\lambda-4)\\), luego \\(\\lambda_{1}=3\\) y \\(\\lambda_{2}=4\\).</p>",
        "<p>Para \\(\\lambda=3\\): \\(\\begin{pmatrix} 2 & -1 \\\\ 2 & -1 \\end{pmatrix}\\mathbf{v}=0\\) da \\(\\mathbf{v}_{1}=(1,2)^{\\top}\\). Para \\(\\lambda=4\\): \\(\\begin{pmatrix} 1 & -1 \\\\ 2 & -2 \\end{pmatrix}\\mathbf{v}=0\\) da \\(\\mathbf{v}_{2}=(1,1)^{\\top}\\).</p>",
        "<p>Así \\(P=\\begin{pmatrix} 1 & 1 \\\\ 2 & 1 \\end{pmatrix}\\) y \\(D=\\begin{pmatrix} 3 & 0 \\\\ 0 & 4 \\end{pmatrix}\\).</p>",
        "<p>Comprobación: \\(P^{-1}AP=\\begin{pmatrix} -1 & 1 \\\\ 2 & -1 \\end{pmatrix}\\begin{pmatrix} 5 & -1 \\\\ 2 & 2 \\end{pmatrix}\\begin{pmatrix} 1 & 1 \\\\ 2 & 1 \\end{pmatrix}=D\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          P: {
            type: "matrix",
            rows: 2,
            cols: 2,
            expected: [
              ["1", "1"],
              ["2", "1"],
            ],
          },
          D: {
            type: "matrix",
            rows: 2,
            cols: 2,
            expected: [
              ["3", "0"],
              ["0", "4"],
            ],
          },
        },
        labels: { P: "Matriz P", D: "Matriz D" },
      },
    },
    {
      id: "T5-M2",
      level: "medio",
      statement:
        "<p>Obtén la factorización \\(A=LDL^{\\top}\\) de la matriz simétrica \\[ A = \\begin{pmatrix} 1 & 2 & -1 \\\\ 2 & 7 & 1 \\\\ -1 & 1 & 6 \\end{pmatrix}, \\] " +
        "con \\(L\\) unitriangular inferior y \\(D\\) diagonal. Escribe \\(L\\) y \\(D\\).</p>",
      hint: "<p>Aplica eliminación gaussiana sin permutaciones: resta \\(2\\) veces la fila 1 a la fila 2, suma la fila 1 a la fila 3 y luego elimina la entrada \\((3,2)\\).</p>",
      solution: [
        "<p>Paso 1 (primera columna, \\(d_{11}=1\\)): con multiplicadores \\(l_{21}=2\\) y \\(l_{31}=-1\\), la matriz se reduce a \\(\\begin{pmatrix} 1 & 2 & -1 \\\\ 0 & 3 & 3 \\\\ 0 & 3 & 5 \\end{pmatrix}\\).</p>",
        "<p>Paso 2 (segunda columna, \\(d_{22}=3\\)): con multiplicador \\(l_{32}=3/3=1\\), se obtiene la triangular superior \\(\\begin{pmatrix} 1 & 2 & -1 \\\\ 0 & 3 & 3 \\\\ 0 & 0 & 2 \\end{pmatrix}\\), de donde \\(d_{33}=2\\).</p>",
        "<p>Por tanto \\(L=\\begin{pmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ -1 & 1 & 1 \\end{pmatrix}\\) y \\(D=\\operatorname{diag}(1,3,2)\\), verificándose \\(LDL^{\\top}=A\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          L: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [
              ["1", "0", "0"],
              ["2", "1", "0"],
              ["-1", "1", "1"],
            ],
          },
          D: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [
              ["1", "0", "0"],
              ["0", "3", "0"],
              ["0", "0", "2"],
            ],
          },
        },
        labels: { L: "Matriz L (unitriangular inferior)", D: "Matriz D (diagonal)" },
      },
    },
    {
      id: "T5-M3",
      level: "medio",
      statement:
        "<p>Sea \\(A=\\begin{pmatrix} 1 & 3 \\\\ 3 & 1 \\end{pmatrix}\\). Calcula los valores singulares de \\(A\\) " +
        "(las raíces cuadradas de los autovalores de \\(A^{\\top}A\\)) y escríbelos en orden decreciente, separados por punto y coma.</p>",
      hint: "<p>\\(A^{\\top}A=A^{2}=\\begin{pmatrix} 10 & 6 \\\\ 6 & 10 \\end{pmatrix}\\), con autovalores \\(16\\) y \\(4\\).</p>",
      solution: [
        "<p>\\(A^{\\top}A=\\begin{pmatrix} 10 & 6 \\\\ 6 & 10 \\end{pmatrix}\\), cuyo polinomio característico \\(\\lambda^{2}-20\\lambda+64=(\\lambda-16)(\\lambda-4)\\) da los autovalores \\(16\\) y \\(4\\).</p>",
        "<p>Los valores singulares son \\(\\sigma_{1}=\\sqrt{16}=4\\) y \\(\\sigma_{2}=\\sqrt{4}=2\\).</p>",
        "<p>Coherencia: \\(A\\) es simétrica con autovalores \\(4\\) y \\(-2\\), y sus valores singulares son \\(|4|=4\\) y \\(|-2|=2\\). En particular \\(\\|A\\|_{2}=4\\).</p>",
      ],
      answer: { type: "exprset", expected: ["4", "2"] },
    },
    {
      id: "T5-M4",
      level: "medio",
      statement:
        "<p>Calcula la pseudoinversa de Moore–Penrose de la matriz de rango \\(1\\) \\[ A = \\begin{pmatrix} 2 & 4 \\\\ 1 & 2 \\end{pmatrix}. \\]</p>",
      hint: "<p>Escribe \\(A=\\mathbf{u}\\mathbf{v}^{\\top}\\) con \\(\\mathbf{u}=(2,1)^{\\top}\\) y \\(\\mathbf{v}=(1,2)^{\\top}\\), y usa \\(A^{\\dagger}=\\dfrac{\\mathbf{v}\\mathbf{u}^{\\top}}{\\|\\mathbf{u}\\|^{2}\\|\\mathbf{v}\\|^{2}}\\).</p>",
      solution: [
        "<p>\\(A=\\mathbf{u}\\mathbf{v}^{\\top}\\) con \\(\\mathbf{u}=(2,1)^{\\top}\\), \\(\\mathbf{v}=(1,2)^{\\top}\\), y \\(\\|\\mathbf{u}\\|^{2}=\\|\\mathbf{v}\\|^{2}=5\\).</p>",
        "<p>\\(A^{\\dagger}=\\dfrac{\\mathbf{v}\\mathbf{u}^{\\top}}{25}=\\dfrac{1}{25}\\begin{pmatrix} 2 & 1 \\\\ 4 & 2 \\end{pmatrix}=\\begin{pmatrix} 2/25 & 1/25 \\\\ 4/25 & 2/25 \\end{pmatrix}\\).</p>",
        "<p>Comprobación con las ecuaciones de Penrose: \\(AA^{\\dagger}A=A\\) y \\(A^{\\dagger}AA^{\\dagger}=A^{\\dagger}\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 2,
        cols: 2,
        expected: [
          ["2/25", "1/25"],
          ["4/25", "2/25"],
        ],
      },
    },
    {
      id: "T5-M5",
      level: "medio",
      statement:
        "<p>Por el teorema espectral, diagonaliza ortogonalmente la matriz simétrica " +
        "\\[ A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix} \\] " +
        "escribiendo \\(A=Q\\Lambda Q^{\\top}\\) con los autovalores en \\(\\Lambda=\\operatorname{diag}(\\lambda_{1},\\lambda_{2})\\) ordenados de forma creciente (\\(\\lambda_{1}\\lt \\lambda_{2}\\)) y las columnas de \\(Q\\) normalizadas con su primera componente positiva. " +
        "Puedes escribir \\(\\sqrt{2}/2\\) como <code>sqrt(2)/2</code>.</p>",
      hint: "<p>Calcula las raíces de \\((2-\\lambda)^{2}-1=0\\), ordena \\(\\lambda_{1}\\lt \\lambda_{2}\\) y normaliza un autovector de cada autoespacio con primera coordenada \\(\\gt 0\\).</p>",
      solution: [
        "<p>El polinomio característico es \\((2-\\lambda)^{2}-1=\\lambda^{2}-4\\lambda+3=(\\lambda-1)(\\lambda-3)\\); en orden creciente, \\(\\lambda_{1}=1\\) y \\(\\lambda_{2}=3\\), luego \\(\\Lambda=\\operatorname{diag}(1,3)\\).</p>",
        "<p>Para \\(\\lambda_{1}=1\\), \\((A-I)\\mathbf{x}=0 \\Rightarrow x_{1}+x_{2}=0\\), que normalizado con primera componente positiva da \\(\\mathbf{q}_{1}=\\tfrac{1}{\\sqrt{2}}(1,-1)^{\\top}\\). Para \\(\\lambda_{2}=3\\), \\((A-3I)\\mathbf{x}=0 \\Rightarrow -x_{1}+x_{2}=0\\), que da \\(\\mathbf{q}_{2}=\\tfrac{1}{\\sqrt{2}}(1,1)^{\\top}\\).</p>",
        "<p>Por tanto \\(Q=\\begin{pmatrix} \\sqrt{2}/2 & \\sqrt{2}/2 \\\\ -\\sqrt{2}/2 & \\sqrt{2}/2 \\end{pmatrix}\\) y \\(\\Lambda=\\begin{pmatrix} 1 & 0 \\\\ 0 & 3 \\end{pmatrix}\\), cumpliéndose \\(Q^{\\top}Q=I\\) y \\(Q\\Lambda Q^{\\top}=A\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          Q: {
            type: "matrix",
            rows: 2,
            cols: 2,
            expected: [
              ["sqrt(2)/2", "sqrt(2)/2"],
              ["-sqrt(2)/2", "sqrt(2)/2"],
            ],
          },
          Lam: {
            type: "matrix",
            rows: 2,
            cols: 2,
            expected: [
              ["1", "0"],
              ["0", "3"],
            ],
          },
        },
        labels: { Q: "Matriz Q (columnas: autovectores ortonormales)", Lam: "Matriz Λ (diagonal de autovalores)" },
      },
    },
    {
      id: "T5-M6",
      level: "medio",
      statement:
        "<p>Utilizando la diagonalización ortogonal de la matriz simétrica definida positiva " +
        "\\[ A = \\begin{pmatrix} 10 & 6 \\\\ 6 & 10 \\end{pmatrix}, \\] " +
        "calcula su única raíz cuadrada simétrica definida positiva \\(A^{1/2}\\) (es decir, la matriz simétrica definida positiva \\(X\\) tal que \\(X^{2}=A\\)).</p>",
      hint: "<p>Los autovalores de \\(A\\) son \\(16\\) y \\(4\\), con autovectores ortonormales \\(\\tfrac{1}{\\sqrt{2}}(1,1)^{\\top}\\) y \\(\\tfrac{1}{\\sqrt{2}}(1,-1)^{\\top}\\). Usa \\(A^{1/2}=Q\\operatorname{diag}(\\sqrt{\\lambda_{1}},\\sqrt{\\lambda_{2}})Q^{\\top}\\).</p>",
      solution: [
        "<p>El polinomio característico de \\(A\\) es \\((\\lambda-10)^{2}-36=(\\lambda-16)(\\lambda-4)\\), con autovalores \\(\\lambda_{1}=16\\) y \\(\\lambda_{2}=4\\).</p>",
        "<p>Los autovectores ortonormales son \\(\\mathbf{q}_{1}=\\tfrac{1}{\\sqrt{2}}(1,1)^{\\top}\\) y \\(\\mathbf{q}_{2}=\\tfrac{1}{\\sqrt{2}}(1,-1)^{\\top}\\), y las raíces de los autovalores son \\(\\sqrt{16}=4\\) y \\(\\sqrt{4}=2\\).</p>",
        "<p>Así, \\(A^{1/2}=Q\\operatorname{diag}(4,2)Q^{\\top}=\\tfrac{1}{2}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}\\begin{pmatrix} 4 & 0 \\\\ 0 & 2 \\end{pmatrix}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}=\\begin{pmatrix} 3 & 1 \\\\ 1 & 3 \\end{pmatrix}\\), que cumple \\((A^{1/2})^{2}=A\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 2,
        cols: 2,
        expected: [
          ["3", "1"],
          ["1", "3"],
        ],
      },
    },
    {
      id: "T5-M7",
      level: "medio",
      statement:
        "<p>Considera la matriz simétrica \\[ A = \\begin{pmatrix} 0 & 1 \\\\ 1 & 2 \\end{pmatrix}. \\] " +
        "Decide si admite factorización \\(A=LDL^{\\top}\\) con \\(L\\) unitriangular inferior y \\(D\\) diagonal <b>sin permutar</b> las filas, " +
        "qué valor toma el primer pivote \\(d_{1}\\) en ese procedimiento, y si admite esa misma factorización <b>permurando</b> (es decir, para \\(PAP^{\\top}\\)).</p>",
      hint: "<p>Sin permutar, el multiplicador \\(l_{21}\\) es \\(a_{21}/d_{1}\\), así que hace falta \\(d_{1}\\neq 0\\). Permutando filas y columnas, \\(PAP^{\\top}=\\begin{pmatrix} 2 & 1 \\\\ 1 & 0 \\end{pmatrix}\\), cuyo primer pivote ya no se anula.</p>",
      solution: [
        "<p>Sin permutar, el primer pivote es \\(d_{1}=a_{11}=0\\): el multiplicador \\(l_{21}=a_{21}/d_{1}\\) no está definido, luego <b>no admite \\(LDL^{\\top}\\) sin permutar</b> (la segunda opción).</p>",
        "<p>Con la permutación de intercambio \\(P=\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}\\), \\(PAP^{\\top}=\\begin{pmatrix} 2 & 1 \\\\ 1 & 0 \\end{pmatrix}\\): ahora \\(d_{1}=2\\), \\(l_{21}=1/2\\) y \\(d_{2}=0-\\tfrac{1}{4}\\cdot 2=-\\tfrac{1}{2}\\), luego <b>sí admite \\(LDL^{\\top}\\) permutando</b> (la primera opción).</p>",
        "<p>En efecto, \\(L=\\begin{pmatrix} 1 & 0 \\\\ 1/2 & 1 \\end{pmatrix}\\) y \\(D=\\operatorname{diag}(2,-1/2)\\) verifican \\(LDL^{\\top}=PAP^{\\top}\\). El pivote negativo en \\(D\\) no es un error: \\(A\\) tiene autovalores \\(1\\pm\\sqrt{2}\\), es decir, es simétrica pero no positiva definida.</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          sin_perm: {
            type: "choice",
            expected: 1,
            choices: [
              "<p>Sí admite LDLᵀ sin permutar.</p>",
              "<p>No admite LDLᵀ sin permutar: el primer pivote se anula.</p>",
              "<p>No admite LDLᵀ ni siquiera permutando.</p>",
            ],
          },
          pivote: { type: "number", expected: "0", exact: true },
          con_perm: {
            type: "choice",
            expected: 0,
            choices: [
              "<p>Sí admite LDLᵀ permutando.</p>",
              "<p>No admite LDLᵀ con ninguna permutación.</p>",
            ],
          },
        },
        labels: {
          sin_perm: "¿Admite A = LDLᵀ sin permutar?",
          pivote: "Primer pivote d₁ (sin permutar)",
          con_perm: "¿Y permutando (PAPᵀ)?",
        },
      },
    },
    {
      id: "T5-E1",
      level: "examen",
      statement:
        "<p>Diagonaliza ortogonalmente la matriz simétrica \\[ A = \\begin{pmatrix} 1 & 2 & 0 \\\\ 2 & 1 & 0 \\\\ 0 & 0 & 4 \\end{pmatrix}. \\] " +
        "Escribe \\(A=Q\\Lambda Q^{\\top}\\) con los autovalores en \\(\\Lambda=\\operatorname{diag}(\\lambda_{1},\\lambda_{2},\\lambda_{3})\\) en orden creciente (\\(\\lambda_{1}\\lt \\lambda_{2}\\lt \\lambda_{3}\\)) y cada columna de \\(Q\\) normalizada con su primera componente no nula positiva. " +
        "Puedes escribir \\(\\sqrt{2}/2\\) como <code>sqrt(2)/2</code>.</p>",
      hint: "<p>Calcula los autovalores del bloque \\(2\\times 2\\) superior izquierdo y el de la tercera diagonal, ordénalos de menor a mayor y normaliza cada autovector asociado.</p>",
      solution: [
        "<p>El polinomio característico es \\([(\\lambda-1)^{2}-4](\\lambda-4)=(\\lambda+1)(\\lambda-3)(\\lambda-4)\\); en orden creciente, \\(\\lambda_{1}=-1\\), \\(\\lambda_{2}=3\\) y \\(\\lambda_{3}=4\\), por lo que \\(\\Lambda=\\operatorname{diag}(-1,3,4)\\).</p>",
        "<p>Los autovectores ortonormales con primera componente no nula positiva son \\(\\mathbf{q}_{1}=\\tfrac{1}{\\sqrt{2}}(1,-1,0)^{\\top}\\) (para \\(\\lambda_{1}=-1\\)), \\(\\mathbf{q}_{2}=\\tfrac{1}{\\sqrt{2}}(1,1,0)^{\\top}\\) (para \\(\\lambda_{2}=3\\)) y \\(\\mathbf{q}_{3}=(0,0,1)^{\\top}\\) (para \\(\\lambda_{3}=4\\)).</p>",
        "<p>Por tanto \\(Q=\\begin{pmatrix} \\sqrt{2}/2 & \\sqrt{2}/2 & 0 \\\\ -\\sqrt{2}/2 & \\sqrt{2}/2 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}\\) y \\(\\Lambda=\\operatorname{diag}(-1,3,4)\\), cumpliéndose \\(Q\\Lambda Q^{\\top}=A\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          Q: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [
              ["sqrt(2)/2", "sqrt(2)/2", "0"],
              ["-sqrt(2)/2", "sqrt(2)/2", "0"],
              ["0", "0", "1"],
            ],
          },
          Lam: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [
              ["-1", "0", "0"],
              ["0", "3", "0"],
              ["0", "0", "4"],
            ],
          },
        },
        labels: { Q: "Matriz Q", Lam: "Matriz Λ" },
      },
    },
    {
      id: "T5-E2",
      level: "examen",
      statement:
        "<p>Calcula la factorización de Cholesky \\(A=LL^{\\top}\\) de la matriz definida positiva \\[ A = \\begin{pmatrix} 4 & 2 & 2 \\\\ 2 & 5 & 3 \\\\ 2 & 3 & 11 \\end{pmatrix}. \\] " +
        "Escribe la matriz \\(L\\) (triangular inferior de diagonal positiva).</p>",
      hint: "<p>Aplica el algoritmo de Cholesky por columnas: \\(l_{ii}=\\sqrt{a_{ii}-\\sum_{k\\lt i}l_{ik}^{2}}\\).</p>",
      solution: [
        "<p>Primera columna: \\(l_{11}=\\sqrt{4}=2\\), \\(l_{21}=2/2=1\\), \\(l_{31}=2/2=1\\).</p>",
        "<p>Segunda columna: \\(l_{22}=\\sqrt{5-1^{2}}=2\\), \\(l_{32}=(3-1\\cdot 1)/2=1\\).</p>",
        "<p>Tercera columna: \\(l_{33}=\\sqrt{11-1^{2}-1^{2}}=3\\).</p>",
        "<p>Así \\(L=\\begin{pmatrix} 2 & 0 & 0 \\\\ 1 & 2 & 0 \\\\ 1 & 1 & 3 \\end{pmatrix}\\), y se comprueba \\(LL^{\\top}=A\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 3,
        cols: 3,
        expected: [
          ["2", "0", "0"],
          ["1", "2", "0"],
          ["1", "1", "3"],
        ],
      },
    },
    {
      id: "T5-E3",
      level: "examen",
      statement:
        "<p>Calcula la pseudoinversa de Moore–Penrose de \\[ A = \\begin{pmatrix} 3 & 1 \\\\ -1 & 3 \\end{pmatrix}. \\]</p>",
      hint: "<p>Calcula \\(AA^{\\top}\\): resulta \\(10I\\), de donde \\(A^{\\dagger}=\\tfrac{1}{10}A^{\\top}\\).</p>",
      solution: [
        "<p>\\(AA^{\\top}=\\begin{pmatrix} 3 & 1 \\\\ -1 & 3 \\end{pmatrix}\\begin{pmatrix} 3 & -1 \\\\ 1 & 3 \\end{pmatrix}=\\begin{pmatrix} 10 & 0 \\\\ 0 & 10 \\end{pmatrix}=10I\\).</p>",
        "<p>La matriz \\(A\\) tiene rango \\(2\\) (columnas independientes), de modo que \\(A^{\\dagger}=A^{\\top}(AA^{\\top})^{-1}=\\tfrac{1}{10}A^{\\top}\\).</p>",
        "<p>Por tanto \\(A^{\\dagger}=\\begin{pmatrix} 3/10 & -1/10 \\\\ 1/10 & 3/10 \\end{pmatrix}\\).</p>",
      ],
      answer: {
        type: "matrix",
        rows: 2,
        cols: 2,
        expected: [
          ["3/10", "-1/10"],
          ["1/10", "3/10"],
        ],
      },
    },
    {
      id: "T5-E4",
      level: "examen",
      statement:
        "<p>La forma cuadrática \\(q(x,y,z)=2x^{2}+2y^{2}-5z^{2}+6xy\\) tiene por matriz simétrica " +
        "\\[ A = \\begin{pmatrix} 2 & 3 & 0 \\\\ 3 & 2 & 0 \\\\ 0 & 0 & -5 \\end{pmatrix}. \\] " +
        "Determina su inercia: el número de autovalores positivos de \\(A\\) y el número de autovalores negativos de \\(A\\).</p>",
      hint: "<p>El bloque \\(\\begin{pmatrix} 2 & 3 \\\\ 3 & 2 \\end{pmatrix}\\) tiene traza \\(4\\) y determinante \\(-5\\) (autovalores \\(5\\) y \\(-1\\)), o bien diagonaliza por congruencia \\(LDL^{\\top}\\).</p>",
      solution: [
        "<p>Los autovalores del bloque \\(\\begin{pmatrix} 2 & 3 \\\\ 3 & 2 \\end{pmatrix}\\) son \\(5\\gt 0\\) y \\(-1\\lt 0\\), y la tercera diagonal aporta \\(-5\\lt 0\\).</p>",
        "<p>Alternativamente, por eliminación \\(A=LDL^{\\top}\\) con \\(D=\\operatorname{diag}(2,\\,-5/2,\\,-5)\\), que por la ley de inercia de Sylvester tiene el mismo recuento de signos.</p>",
        "<p>Por tanto, la inercia es \\(\\pi=1\\) autovalor positivo y \\(\\nu=2\\) autovalores negativos (signatura \\((1,\\,2,\\,0)\\)).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          pos: { type: "number", expected: "1", exact: true },
          neg: { type: "number", expected: "2", exact: true },
        },
        labels: { pos: "Autovalores positivos", neg: "Autovalores negativos" },
      },
    },
    {
      id: "T5-E5",
      level: "examen",
      statement:
        "<p>Sea la matriz \\[ A = \\begin{pmatrix} 3 & 1 & 0 \\\\ -1 & 1 & 0 \\\\ 0 & 0 & 2 \\end{pmatrix}, \\] " +
        "cuyo único autovalor es \\(\\lambda=2\\) con multiplicidad algebraica \\(3\\). Calcula la dimensión del autoespacio \\(\\ker(A-2I)\\) (que coincide con el número de bloques de Jordan) y escribe su forma canónica de Jordan \\(J\\) colocando los bloques de mayor a menor tamaño.</p>",
      hint: "<p>Calcula el rango de \\(A-2I=\\begin{pmatrix} 1 & 1 & 0 \\\\ -1 & -1 & 0 \\\\ 0 & 0 & 0 \\end{pmatrix}\\); como \\(\\dim\\ker(A-2I)=2\\), hay dos bloques de tamaños \\(2\\) y \\(1\\).</p>",
      solution: [
        "<p>La matriz \\(A-2I=\\begin{pmatrix} 1 & 1 & 0 \\\\ -1 & -1 & 0 \\\\ 0 & 0 & 0 \\end{pmatrix}\\) tiene rango \\(1\\), por lo que \\(\\dim\\ker(A-2I)=3-1=2\\).</p>",
        "<p>Esto significa que \\(\\lambda=2\\) tiene \\(2\\) bloques de Jordan cuyos tamaños suman \\(3\\): un bloque \\(J_{2}(2)\\) de tamaño \\(2\\) y un bloque \\(J_{1}(2)\\) de tamaño \\(1\\).</p>",
        "<p>Ordenando de mayor a menor tamaño, \\(J=\\operatorname{diag}(J_{2}(2),\\,J_{1}(2))=\\begin{pmatrix} 2 & 1 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 2 \\end{pmatrix}\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          dim: { type: "number", expected: "2", exact: true },
          J: {
            type: "matrix",
            rows: 3,
            cols: 3,
            expected: [
              ["2", "1", "0"],
              ["0", "2", "0"],
              ["0", "0", "2"],
            ],
          },
        },
        labels: { dim: "Dimensión de ker(A − 2I) (nº de bloques)", J: "Forma canónica de Jordan J" },
      },
    },
    {
      id: "T5-E6",
      level: "examen",
      statement:
        "<p>Considera la matriz rectangular \\(A\\in\\mathbb{R}^{3\\times 2}\\) de rango \\(2\\): " +
        "\\[ A = \\begin{pmatrix} 1 & 4 \\\\ 2 & 2 \\\\ 2 & -4 \\end{pmatrix}. \\] " +
        "Calcula sus valores singulares \\(\\sigma_{1}\\gt \\sigma_{2}\\) (separados por punto y coma) y su pseudoinversa de Moore–Penrose \\(A^{\\dagger}\\in\\mathbb{R}^{2\\times 3}\\).</p>",
      hint: "<p>Comprueba que las columnas de \\(A\\) son ortogonales calculando \\(A^{\\top}A\\) (resulta diagonal) y usa \\(A^{\\dagger}=(A^{\\top}A)^{-1}A^{\\top}\\).</p>",
      solution: [
        "<p>Calculamos \\(A^{\\top}A=\\begin{pmatrix} 1 & 2 & 2 \\\\ 4 & 2 & -4 \\end{pmatrix}\\begin{pmatrix} 1 & 4 \\\\ 2 & 2 \\\\ 2 & -4 \\end{pmatrix}=\\begin{pmatrix} 9 & 0 \\\\ 0 & 36 \\end{pmatrix}\\).</p>",
        "<p>Los valores singulares de \\(A\\) en orden decreciente son \\(\\sigma_{1}=\\sqrt{36}=6\\) y \\(\\sigma_{2}=\\sqrt{9}=3\\).</p>",
        "<p>Al tener \\(A\\) rango completo por columnas (\\(\\operatorname{rng}A=2\\)), \\(A^{\\dagger}=(A^{\\top}A)^{-1}A^{\\top}=\\begin{pmatrix} 1/9 & 0 \\\\ 0 & 1/36 \\end{pmatrix}\\begin{pmatrix} 1 & 2 & 2 \\\\ 4 & 2 & -4 \\end{pmatrix}=\\begin{pmatrix} 1/9 & 2/9 & 2/9 \\\\ 1/9 & 1/18 & -1/9 \\end{pmatrix}\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          sigmas: { type: "exprset", expected: ["6", "3"] },
          pinv: {
            type: "matrix",
            rows: 2,
            cols: 3,
            expected: [
              ["1/9", "2/9", "2/9"],
              ["1/9", "1/18", "-1/9"],
            ],
          },
        },
        labels: { sigmas: "Valores singulares (separados por ;)", pinv: "Pseudoinversa A† (2×3)" },
      },
    },
  ],
};
