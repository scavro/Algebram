/* ============================================================
   Datos del Tema I · Escalares
   window.CURSO_DATA["tema-1"] — ver docs/schema.md
   ============================================================ */
window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["tema-1"] = {
  id: "tema-1",
  title: "Escalares",

  /* ---------------- RESUMEN ---------------- */
  summary: [
    {
      h: "Los cinco escalares",
      items: [
        "\\(\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R} \\subset \\mathbb{C}\\).",
        "\\(\\mathbb{R}\\) y \\(\\mathbb{C}\\) son los cuerpos de escalares del curso; \\(\\mathbb{C}\\) no admite un orden compatible con su estructura de cuerpo.",
        "Cada paso de la cadena resuelve una limitación: restas (\\(\\mathbb{Z}\\)), divisiones (\\(\\mathbb{Q}\\)), completitud (\\(\\mathbb{R}\\)), raíces de polinomios (\\(\\mathbb{C}\\)).",
      ],
    },
    {
      h: "Definiciones clave",
      items: [
        "Par ordenado \\((a,b) = \\{\\{a\\},\\{a,b\\}\\}\\); producto cartesiano \\(A \\times B\\) y \\(n\\)-tuplas \\((a_1,\\ldots,a_n)\\).",
        "Función \\(f : X \\to Y\\); imagen \\(f(A)\\), imagen recíproca \\(f^{-1}(B)\\); inyectiva, sobreyectiva y biyectiva; familias indexadas \\((u_i)_{i \\in I}\\).",
        "Representación posicional en base \\(b\\): \\(n = a_k b^k + \\cdots + a_1 b + a_0\\), con \\(0 \\le a_i \\lt  b\\).",
        "Racional exacto en base \\(b\\) y cifras significativas; coma flotante y notación científica.",
        "Complejo \\(z = a + bi\\): \\(\\operatorname{Re}(z) = a\\), \\(\\operatorname{Im}(z) = b\\), conjugado \\(\\bar z = a - bi\\), módulo \\(|z| = \\sqrt{a^2+b^2}\\), argumento \\(\\arg(z) \\in (-\\pi,\\pi]\\), forma exponencial \\(z = |z| e^{i\\arg(z)}\\).",
      ],
    },
    {
      h: "Resultados que hay que saber",
      items: [
        "\\(\\mathbb{Q}\\) no es completo: \\(\\sqrt{2} \\notin \\mathbb{Q}\\), y \\(M = \\{r \\in \\mathbb{Q} : r^2 \\lt  2\\}\\) no tiene cota mínima.",
        "Caracterización de los racionales: desarrollo eventualmente periódico en cualquier base, y \\(r = p / (b^{m}(b^{k}-1))\\).",
        "\\(\\mathbb{R}\\) no es numerable (diagonal de Cantor); \\(\\mathbb{N}\\) y \\(\\mathbb{Z}\\) sí lo son.",
        "Redondeo al par más cercano (IEEE 754) ante la equidistancia.",
        "\\(\\overline{zw} = \\bar z \\bar w\\), \\(|zw| = |z|\\,|w|\\) y \\(|z+w| \\le |z| + |w|\\).",
        "Euler: \\(e^{i\\theta} = \\cos\\theta + i\\operatorname{sen}\\theta\\); Moivre: \\((\\cos\\theta + i\\operatorname{sen}\\theta)^n = \\cos n\\theta + i\\operatorname{sen} n\\theta\\); las raíces \\(n\\)-ésimas de \\(w \\neq 0\\) son \\(n\\) vértices de un polígono regular.",
        "Teorema Fundamental del Álgebra: todo polinomio de grado \\(n\\) tiene \\(n\\) raíces en \\(\\mathbb{C}\\) contando multiplicidad.",
      ],
    },
    {
      h: "Errores frecuentes",
      items: [
        "Confundir \\(A \\setminus B\\) con \\(A - B\\): objetos distintos.",
        "Redondear paso a paso en lugar de redondear una sola vez el resultado exacto.",
        "Tomar \\(\\arg(z)\\) por \\(|z|\\): el primero es un ángulo, el segundo un real no negativo.",
        "Creer que \\(\\sqrt{z^2} = z\\) en \\(\\mathbb{C}\\) (con \\(z = -1\\) falla).",
        "Olvidar que \\(\\operatorname{Im}(z) \\in \\mathbb{R}\\): \\(\\operatorname{Im}(3+4i) = 4\\), no \\(4i\\).",
        "Contar las raíces de un polinomio sin multiplicidad.",
      ],
    },
    {
      h: "Conexiones con la IA",
      items: [
        "IEEE 754 y aritmética en coma flotante: <code>0.1 + 0.2 = 0.30000000000000004</code>.",
        "Precisión y cifras significativas en la preparación de datos.",
        "Familias indexadas = tensores de datos; producto cartesiano = espacio de atributos.",
        "Exponencial en softmax y en decaimiento; normalización estable restando el máximo.",
        "Complejos y FFT para señales; autovalores como raíces del polinomio característico.",
      ],
    },
  ],

  /* ---------------- MAPA MENTAL ---------------- */
  mindmap: {
    label: "Tema I · Escalares",
    detail:
      "Los cinco escalares del curso: de \\(\\mathbb{N}\\) a \\(\\mathbb{C}\\), con su notación, sus operaciones y sus trampas.",
    children: [
      {
        label: "Conjuntos y funciones",
        detail:
          "Lógica informal, conjuntos por extensión o por condición, \\(\\cap\\), \\(\\cup\\), \\(\\setminus\\), \\(\\wp(X)\\).",
        children: [
          {
            label: "Tuplas y producto cartesiano",
            detail:
              "\\((a,b) = \\{\\{a\\},\\{a,b\\}\\}\\); \\(A \\times B\\) tiene \\(|A| \\cdot |B|\\) elementos si ambos son finitos.",
          },
          {
            label: "Funciones",
            detail:
              "Imagen e imagen recíproca; inyectiva, sobreyectiva, biyectiva; \\(Y^X\\); operaciones y cierre.",
          },
          {
            label: "Familias indexadas",
            detail:
              "\\((u_i)_{i \\in I}\\): etiquetado con cualquier conjunto de índices; variables mudas; base de la notación de tensores.",
          },
        ],
      },
      {
        label: "\\(\\mathbb{N}\\) y \\(\\mathbb{Z}\\): bases de numeración",
        detail:
          "Naturales y enteros; numerabilidad; el número frente a su representación escrita.",
        children: [
          {
            label: "Sistema posicional",
            detail:
              "Base \\(b\\) y dígitos \\(0,\\ldots,b-1\\); \\(n = \\sum a_i b^i\\); representación única (Proposición 1.8).",
          },
          {
            label: "Conversiones",
            detail:
              "A decimal: valor posicional. A base \\(b\\): divisiones sucesivas y restos leídos de abajo arriba.",
          },
          {
            label: "Octal y hexadecimal",
            detail:
              "Cada cifra octal son 3 bits y cada hexadecimal, 4: un byte son dos cifras hexadecimales.",
          },
        ],
      },
      {
        label: "\\(\\mathbb{Q}\\): fracciones y decimales",
        detail:
          "El cuerpo de los racionales: identidades algebraicas, orden y valor absoluto.",
        children: [
          {
            label: "No completitud",
            detail:
              "\\(\\sqrt{2} \\notin \\mathbb{Q}\\); \\(\\mathbb{Q}\\) es numerable y no completo.",
          },
          {
            label: "Desarrollo periódico",
            detail:
              "Racional si y solo si desarrollo eventualmente periódico; \\(r = p/(b^m(b^k-1))\\).",
          },
          {
            label: "Exactitud y cifras significativas",
            detail:
              "«Exacto» depende de la base; coma flotante y notación científica; \\(\\mathbb{Q}_{b,n}\\).",
          },
        ],
      },
      {
        label: "\\(\\mathbb{R}\\): completitud y redondeo",
        detail:
          "Menor cuerpo ordenado completo que contiene a \\(\\mathbb{Q}\\); los irracionales.",
        children: [
          {
            label: "No numerable",
            detail:
              "Diagonal de Cantor sobre \\([0,1]\\); \\(\\mathbb{R}\\) no se puede enumerar.",
          },
          {
            label: "Redondeo al par",
            detail:
              "Ante la equidistancia, el candidato con última cifra par; evita sesgos acumulados.",
          },
          {
            label: "IEEE 754",
            detail:
              "Precisión simple (32 bits) y doble (64); subnormales; \\(0{,}1\\) no es exacto en base 2.",
          },
        ],
      },
      {
        label: "\\(\\mathbb{C}\\): polar, Euler y TFA",
        detail:
          "Cuerpo de los escalares complejos: \\(a + bi\\), \\(i^2 = -1\\), y su lectura geométrica.",
        children: [
          {
            label: "Binómica y conjugado",
            detail:
              "Operar como con variables y sustituir \\(i^2 = -1\\); \\(\\overline{zw} = \\bar z \\bar w\\); potencias de \\(i\\) cíclicas.",
          },
          {
            label: "Módulo y argumento",
            detail:
              "\\(|z| = \\sqrt{a^2+b^2}\\), \\(\\operatorname{Arg}(z) = \\{\\theta_0 + 2k\\pi\\}\\), \\(\\arg(z) \\in (-\\pi,\\pi]\\); forma trigonométrica.",
          },
          {
            label: "Euler y Moivre",
            detail:
              "\\(e^{i\\theta} = \\cos\\theta + i\\operatorname{sen}\\theta\\); multiplicar rota; potencias \\(z^n = r^n e^{in\\theta}\\).",
          },
          {
            label: "Raíces y TFA",
            detail:
              "\\(n\\)-ésimas raíces en polígono regular; todo polinomio de grado \\(n\\) tiene \\(n\\) raíces contando multiplicidad.",
          },
        ],
      },
    ],
  },

  /* ---------------- EJERCICIOS (6 normal · 5 medio · 4 examen) ---------------- */
  drills: [
    /* ============ NIVEL NORMAL ============ */
    {
      id: "T1-N1",
      level: "normal",
      statement:
        "<p>Escribe en base diez el número \\(1101101_2\\), expresado en el sistema binario.</p>",
      hint:
        "<p>Cada cifra multiplica la potencia de \\(2\\) que corresponde a su posición.</p>",
      solution: [
        "<p>Separamos las cifras con sus posiciones: \\(1101101_2 = 1\\cdot 2^6 + 1\\cdot 2^5 + 0\\cdot 2^4 + 1\\cdot 2^3 + 1\\cdot 2^2 + 0\\cdot 2^1 + 1\\cdot 2^0\\).</p>",
        "<p>Calculamos las potencias: \\(64 + 32 + 0 + 8 + 4 + 0 + 1\\).</p>",
        "<p>Sumamos: \\(64 + 32 + 8 + 4 + 1 = 109\\).</p>",
        "<p>Por tanto \\(1101101_2 = 109\\).</p>",
      ],
      answer: { type: "number", expected: "109", exact: true },
    },
    {
      id: "T1-N2",
      level: "normal",
      statement:
        "<p>Escribe el número \\(78\\) en base \\(3\\). Introduce solo la secuencia de cifras de la representación, sin subíndice de base.</p>",
      hint:
        "<p>Divide sucesivamente entre \\(3\\) y anota los restos; la representación se lee de abajo arriba.</p>",
      solution: [
        "<p>\\(78 = 3 \\cdot 26 + 0\\): la primera cifra (unidades) es \\(0\\).</p>",
        "<p>\\(26 = 3 \\cdot 8 + 2\\): la siguiente cifra es \\(2\\).</p>",
        "<p>\\(8 = 3 \\cdot 2 + 2\\) y \\(2 = 3 \\cdot 0 + 2\\): las dos últimas cifras son \\(2\\) y \\(2\\).</p>",
        "<p>Leyendo los restos de abajo arriba, \\(78 = 2220_3\\).</p>",
        "<p>Comprobación: \\(2\\cdot 27 + 2\\cdot 9 + 2\\cdot 3 + 0 = 54 + 18 + 6 = 78\\).</p>",
      ],
      answer: { type: "text", expected: "2220" },
    },
    {
      id: "T1-N3",
      level: "normal",
      statement:
        "<p>Sea \\(f : \\{1, 2, 3\\} \\to \\{a, b\\}\\) la función definida por \\(f(1) = a\\), \\(f(2) = b\\), \\(f(3) = a\\). ¿Qué tipo de función es?</p>",
      hint:
        "<p>Comprueba por separado la inyectividad (¿toma el mismo valor en elementos distintos?) y la sobreyectividad (¿la imagen es todo el conjunto final?).</p>",
      solution: [
        "<p>Inyectividad: \\(f(1) = a = f(3)\\) pero \\(1 \\neq 3\\), luego \\(f\\) <strong>no</strong> es inyectiva.</p>",
        "<p>Imagen: \\(f(\\{1, 2, 3\\}) = \\{a, b\\}\\), que es todo el conjunto final, luego \\(f\\) es sobreyectiva.</p>",
        "<p>Por tanto \\(f\\) es sobreyectiva y no inyectiva; en particular no puede ser biyectiva.</p>",
      ],
      answer: {
        type: "choice",
        expected: 1,
        choices: [
          "<p>Inyectiva y no sobreyectiva</p>",
          "<p>Sobreyectiva y no inyectiva</p>",
          "<p>Biyectiva</p>",
          "<p>Ni inyectiva ni sobreyectiva</p>",
        ],
      },
    },
    {
      id: "T1-N4",
      level: "normal",
      statement:
        "<p>Escribe como fracción irreducible el número \\(r = 0{,}\\overline{36} = 0{,}363636\\ldots\\).</p>",
      hint: "<p>Considera \\(100r - r\\) y observa cómo se cancela la parte periódica.</p>",
      solution: [
        "<p>\\(100r = 36{,}\\overline{36}\\) y \\(r = 0{,}\\overline{36}\\); al restar, la parte periódica desaparece: \\(99r = 36\\).</p>",
        "<p>Por tanto \\(r = \\dfrac{36}{99}\\).</p>",
        "<p>Simplificando por \\(9\\): \\(r = \\dfrac{4}{11}\\).</p>",
      ],
      answer: { type: "expr", expected: "4/11" },
    },
    {
      id: "T1-N5",
      level: "normal",
      statement:
        "<p>Redondea \\(2{,}345\\) a \\(3\\) cifras significativas aplicando el criterio de redondeo al par más cercano.</p>",
      hint:
        "<p>El valor está exactamente a mitad de camino entre dos candidatos: mira cuál de los dos termina en cifra par.</p>",
      solution: [
        "<p>A \\(3\\) cifras significativas los candidatos son \\(2{,}34\\) y \\(2{,}35\\), y \\(2{,}345\\) está exactamente a la misma distancia de ambos.</p>",
        "<p>En la equidistancia se adopta el candidato con última cifra par: \\(2{,}34\\) termina en \\(4\\) (par) y \\(2{,}35\\) en \\(5\\) (impar).</p>",
        "<p>Por tanto \\(2{,}345 \\approx 2{,}34\\).</p>",
      ],
      answer: { type: "expr", expected: "2.34" },
    },
    {
      id: "T1-N6",
      level: "normal",
      statement:
        "<p>Escribe el producto \\(z = (3 + 4i)(2 - i)\\) en la forma binómica \\(a + bi\\).</p>",
      hint: "<p>Desarrolla como si \\(i\\) fuera una variable y sustituye después \\(i^2 = -1\\).</p>",
      solution: [
        "<p>\\((3 + 4i)(2 - i) = 6 - 3i + 8i - 4i^2\\).</p>",
        "<p>Como \\(i^2 = -1\\), el término \\(-4i^2\\) vale \\(4\\).</p>",
        "<p>Reagrupando: \\((6 + 4) + (-3 + 8)i = 10 + 5i\\).</p>",
      ],
      answer: { type: "expr", expected: "10+5*i" },
    },

    /* ============ NIVEL MEDIO ============ */
    {
      id: "T1-M1",
      level: "medio",
      statement:
        "<p>Escribe el cociente \\(z = \\dfrac{2 + i}{1 - i}\\) en la forma binómica \\(a + bi\\).</p>",
      hint:
        "<p>Multiplica numerador y denominador por el conjugado del denominador, \\(1 + i\\).</p>",
      solution: [
        "<p>Multiplicamos por \\(\\frac{1+i}{1+i}\\): \\(z = \\dfrac{(2+i)(1+i)}{(1-i)(1+i)}\\).</p>",
        "<p>Denominador: \\((1 - i)(1 + i) = 1 - i^2 = 2\\).</p>",
        "<p>Numerador: \\((2 + i)(1 + i) = 2 + 2i + i + i^2 = 1 + 3i\\).</p>",
        "<p>Por tanto \\(z = \\dfrac{1 + 3i}{2} = \\dfrac{1}{2} + \\dfrac{3}{2}\\,i\\).</p>",
      ],
      answer: { type: "expr", expected: "1/2+3/2*i" },
    },
    {
      id: "T1-M2",
      level: "medio",
      statement:
        "<p>Sea \\(z = -\\sqrt{3} + i\\). Calcula su módulo \\(|z|\\) y su argumento principal \\(\\arg(z) \\in (-\\pi, \\pi]\\).</p>",
      hint:
        "<p>\\(|z| = \\sqrt{a^2 + b^2}\\). Para el argumento, sitúa el punto \\(( -\\sqrt{3}, 1)\\) y usa \\(\\cos\\theta = a/|z|\\), \\(\\operatorname{sen}\\theta = b/|z|\\).</p>",
      solution: [
        "<p>\\(|z| = \\sqrt{(-\\sqrt{3})^2 + 1^2} = \\sqrt{3 + 1} = 2\\).</p>",
        "<p>Las condiciones del ángulo son \\(\\cos\\theta = -\\dfrac{\\sqrt{3}}{2}\\) y \\(\\operatorname{sen}\\theta = \\dfrac{1}{2}\\).</p>",
        "<p>El punto \\(( -\\sqrt{3}, 1)\\) está en el segundo cuadrante, donde esas condiciones corresponden a \\(\\theta = \\dfrac{5\\pi}{6} \\in (-\\pi, \\pi]\\).</p>",
        "<p>Así \\(z = 2\\left(\\cos\\dfrac{5\\pi}{6} + i\\operatorname{sen}\\dfrac{5\\pi}{6}\\right)\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          mod: { type: "number", expected: "2", exact: true },
          arg: { type: "expr", expected: "5*pi/6" },
        },
        labels: { mod: "Módulo |z|", arg: "Argumento principal" },
      },
    },
    {
      id: "T1-M3",
      level: "medio",
      statement:
        "<p>Calcula \\((1 + i)^8\\) y escribe el resultado en la forma \\(a + bi\\).</p>",
      hint: "<p>Empieza por \\((1 + i)^2 = 2i\\) y usa \\(i^4 = 1\\).</p>",
      solution: [
        "<p>\\((1 + i)^2 = 1 + 2i + i^2 = 2i\\).</p>",
        "<p>\\((1 + i)^8 = \\left((1 + i)^2\\right)^4 = (2i)^4\\).</p>",
        "<p>\\((2i)^4 = 2^4 \\cdot i^4 = 16 \\cdot 1 = 16\\).</p>",
        "<p>Por tanto \\((1 + i)^8 = 16 + 0i\\).</p>",
      ],
      answer: { type: "expr", expected: "16" },
    },
    {
      id: "T1-M4",
      level: "medio",
      statement:
        "<p>Calcula las tres raíces cúbicas de \\(8\\), es decir, las soluciones en \\(\\mathbb{C}\\) de \\(z^3 = 8\\). Escríbelas en forma binómica, separadas por punto y coma.</p>",
      hint:
        "<p>Escribe \\(8 = 8 e^{i\\cdot 0}\\) y aplica \\(z_k = \\sqrt[3]{8}\\, e^{i(2k\\pi)/3}\\) para \\(k = 0, 1, 2\\).</p>",
      solution: [
        "<p>En forma exponencial, \\(8 = 8\\,e^{i\\cdot 0}\\): módulo \\(8\\) y argumentos \\(\\{2k\\pi : k \\in \\mathbb{Z}\\}\\).</p>",
        "<p>Las raíces tienen módulo \\(\\sqrt[3]{8} = 2\\) y argumentos \\(\\alpha_k = \\dfrac{2k\\pi}{3}\\), \\(k = 0, 1, 2\\).</p>",
        "<p>\\(k = 0\\): \\(z_0 = 2\\). \\(k = 1\\): \\(z_1 = 2 e^{2\\pi i/3} = 2\\left(-\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i\\right) = -1 + \\sqrt{3}\\,i\\).</p>",
        "<p>\\(k = 2\\): \\(z_2 = 2 e^{4\\pi i/3} = -1 - \\sqrt{3}\\,i\\).</p>",
        "<p>Comprobación: \\((-1 + \\sqrt{3}\\,i)^3 = 8\\) y \\((-1 - \\sqrt{3}\\,i)^3 = 8\\).</p>",
      ],
      answer: {
        type: "exprset",
        expected: ["2", "-1+sqrt(3)*i", "-1-sqrt(3)*i"],
      },
    },
    {
      id: "T1-M5",
      level: "medio",
      statement:
        "<p>Verdadero o falso: para todo \\(z \\in \\mathbb{C}\\) se cumple \\(\\sqrt{z^2} = z\\), donde \\(\\sqrt{\\cdot}\\) denota la rama principal de la raíz cuadrada.</p>",
      hint: "<p>Prueba con un número real negativo, por ejemplo \\(z = -1\\).</p>",
      solution: [
        "<p>La afirmación es falsa: basta un contraejemplo.</p>",
        "<p>Para \\(z = -1\\) se tiene \\(z^2 = 1\\), y la raíz cuadrada principal de \\(1\\) es \\(1\\).</p>",
        "<p>Por tanto \\(\\sqrt{z^2} = 1 \\neq -1 = z\\). En general, \\(\\sqrt{z^2} = z\\) si \\(\\operatorname{Re} z \\gt  0\\), o si \\(\\operatorname{Re} z = 0\\) y \\(\\operatorname{Im} z \\ge 0\\); en el resto \\(\\sqrt{z^2} = -z\\) (por ejemplo \\(z = -i\\), donde \\(\\sqrt{z^2} = i = -z\\)).</p>",
      ],
      answer: { type: "bool", expected: false },
    },

    /* ============ NIVEL EXAMEN ============ */
    {
      id: "T1-E1",
      level: "examen",
      statement:
        "<p>Escribe en base diez el número \\(1011{,}101_2\\). Da el resultado exacto, como fracción irreducible o como decimal exacto.</p>",
      hint:
        "<p>Separa la parte entera y la fraccionaria: \\(1011_2 = 11\\) y \\(0{,}101_2 = \\frac{1}{2} + \\frac{1}{8}\\).</p>",
      solution: [
        "<p>Parte entera: \\(1011_2 = 8 + 2 + 1 = 11\\).</p>",
        "<p>Parte fraccionaria: \\(0{,}101_2 = 1\\cdot 2^{-1} + 0\\cdot 2^{-2} + 1\\cdot 2^{-3} = \\frac{1}{2} + \\frac{1}{8} = \\frac{5}{8}\\).</p>",
        "<p>Sumando: \\(11 + \\frac{5}{8} = \\frac{93}{8} = 11{,}625\\).</p>",
      ],
      answer: { type: "number", expected: "93/8" },
    },
    {
      id: "T1-E2",
      level: "examen",
      statement:
        "<p>Sea \\(z = 1 + \\sqrt{3}\\,i\\). Calcula su módulo, su argumento principal (en \\(( -\\pi, \\pi]\\)) y el valor de \\(z^3\\) en forma binómica.</p>",
      hint:
        "<p>Pasa \\(z\\) a forma exponencial \\(z = r e^{i\\theta}\\) y usa \\((r e^{i\\theta})^3 = r^3 e^{i 3\\theta}\\).</p>",
      solution: [
        "<p>\\(|z| = \\sqrt{1 + 3} = 2\\), con \\(\\cos\\theta = \\frac{1}{2}\\) y \\(\\operatorname{sen}\\theta = \\frac{\\sqrt{3}}{2}\\) en el primer cuadrante, luego \\(\\theta = \\frac{\\pi}{3}\\).</p>",
        "<p>Forma exponencial: \\(z = 2\\,e^{i\\pi/3}\\).</p>",
        "<p>\\(z^3 = 2^3 e^{i\\pi} = 8(\\cos\\pi + i\\operatorname{sen}\\pi) = -8\\).</p>",
      ],
      answer: {
        type: "multi",
        fields: {
          mod: { type: "number", expected: "2", exact: true },
          arg: { type: "expr", expected: "pi/3" },
          cub: { type: "expr", expected: "-8" },
        },
        labels: { mod: "Módulo |z|", arg: "Argumento principal", cub: "z^3" },
      },
    },
    {
      id: "T1-E3",
      level: "examen",
      statement:
        "<p>Obtén las cuatro raíces cuartas de \\(16\\), es decir, las soluciones en \\(\\mathbb{C}\\) de \\(z^4 = 16\\). Escríbelas en forma binómica, separadas por punto y coma.</p>",
      hint:
        "<p>\\(16 = 16\\,e^{i\\cdot 0}\\); las raíces tienen módulo \\(\\sqrt[4]{16} = 2\\) y argumentos \\(\\frac{2k\\pi}{4}\\), \\(k = 0, 1, 2, 3\\).</p>",
      solution: [
        "<p>Las raíces tienen módulo \\(2\\) y argumentos \\(\\alpha_k = \\dfrac{2k\\pi}{4} = \\dfrac{k\\pi}{2}\\), \\(k = 0, 1, 2, 3\\).</p>",
        "<p>\\(k = 0\\): \\(z_0 = 2\\). \\(k = 1\\): \\(z_1 = 2 e^{i\\pi/2} = 2i\\).</p>",
        "<p>\\(k = 2\\): \\(z_2 = 2 e^{i\\pi} = -2\\). \\(k = 3\\): \\(z_3 = 2 e^{i3\\pi/2} = -2i\\).</p>",
        "<p>Comprobación: \\(2^4 = 16\\), \\((2i)^4 = 16 i^4 = 16\\), \\((-2)^4 = 16\\) y \\((-2i)^4 = 16\\).</p>",
      ],
      answer: {
        type: "exprset",
        expected: ["2", "2*i", "-2", "-2*i"],
      },
    },
    {
      id: "T1-E4",
      level: "examen",
      statement:
        "<p>Usando la fórmula de Euler, simplifica \\(w = \\dfrac{e^{i\\pi/3} - e^{-i\\pi/3}}{2i}\\) y escribe el resultado en forma exacta.</p>",
      hint:
        "<p>Recuerda que \\(\\operatorname{sen}\\theta = \\dfrac{e^{i\\theta} - e^{-i\\theta}}{2i}\\).</p>",
      solution: [
        "<p>Por Euler, \\(e^{i\\theta} = \\cos\\theta + i\\operatorname{sen}\\theta\\) y \\(e^{-i\\theta} = \\cos\\theta - i\\operatorname{sen}\\theta\\).</p>",
        "<p>Restando: \\(e^{i\\theta} - e^{-i\\theta} = 2i\\operatorname{sen}\\theta\\), de donde \\(\\dfrac{e^{i\\theta} - e^{-i\\theta}}{2i} = \\operatorname{sen}\\theta\\).</p>",
        "<p>Con \\(\\theta = \\frac{\\pi}{3}\\): \\(w = \\operatorname{sen}\\frac{\\pi}{3} = \\dfrac{\\sqrt{3}}{2}\\).</p>",
      ],
      answer: { type: "expr", expected: "sqrt(3)/2" },
    },
  ],
};
