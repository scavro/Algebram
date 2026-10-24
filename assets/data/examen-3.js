window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["examen-3"] = {
  id: "examen-3",
  title: "Examen 3 · Tema V + global",
  exam: {
    minutes: 120,
    questions: [
      {
        id: "X3-1",
        level: "normal",
        statement:
          "<p>Calcula la factorización de Cholesky \\(A = LL^{\\top}\\) de \\[ A = \\begin{pmatrix} 25 & 15 \\\\ 15 & 18 \\end{pmatrix}, \\] " +
          "con \\(L\\) triangular inferior de diagonal positiva. Escribe la matriz \\(L\\).</p>",
        hint: "<p>Impon \\(L = \\begin{pmatrix} a & 0 \\\\ b & c \\end{pmatrix}\\) con \\(a, c \\gt  0\\) e iguala \\(LL^{\\top}\\) a \\(A\\): \\(a^{2}=25\\), \\(ab=15\\), \\(b^{2}+c^{2}=18\\).</p>",
        solution: [
          "<p>De la entrada \\((1,1)\\) de \\(LL^{\\top}=A\\): \\(a^{2}=25\\), y como la diagonal de \\(L\\) debe ser positiva, \\(a=5\\).</p>",
          "<p>La entrada \\((1,2)\\) da \\(ab=15\\), luego \\(b=3\\); la \\((2,2)\\) da \\(b^{2}+c^{2}=18\\), es decir \\(9+c^{2}=18\\) y \\(c=3\\).</p>",
          "<p>Por tanto \\(L=\\begin{pmatrix} 5 & 0 \\\\ 3 & 3 \\end{pmatrix}\\). Comprobación: \\(LL^{\\top}=\\begin{pmatrix} 25 & 15 \\\\ 15 & 18 \\end{pmatrix}=A\\); además los menores principales \\(25\\gt 0\\) y \\(25\\cdot 18-15^{2}=225\\gt 0\\) confirman que \\(A\\) es definida positiva, como exige el teorema de Cholesky.</p>",
        ],
        answer: {
          type: "matrix",
          rows: 2,
          cols: 2,
          expected: [
            ["5", "0"],
            ["3", "3"],
          ],
        },
      },
      {
        id: "X3-2",
        level: "normal",
        statement:
          "<p>Escribe el cociente \\[ z = \\frac{3+4i}{1-2i} \\] en la forma binómica \\(a+bi\\).</p>",
        hint: "<p>Multiplica numerador y denominador por el conjugado del denominador, \\(1+2i\\), y recuerda que \\(i^{2}=-1\\).</p>",
        solution: [
          "<p>\\(z=\\dfrac{(3+4i)(1+2i)}{(1-2i)(1+2i)}=\\dfrac{3+6i+4i+8i^{2}}{1+4}\\).</p>",
          "<p>Como \\(i^{2}=-1\\), el numerador vale \\(3+10i-8=-5+10i\\) y el denominador \\(1+4=5\\).</p>",
          "<p>Por tanto \\(z=\\dfrac{-5+10i}{5}=-1+2i\\).</p>",
        ],
        answer: { type: "expr", expected: "-1+2*i" },
      },
      {
        id: "X3-3",
        level: "normal",
        statement:
          "<p>Verdadero o falso: para cualesquiera matrices \\(A, B \\in \\mathbb{R}^{n \\times n}\\) se cumple \\((AB)^{\\top} = A^{\\top}B^{\\top}\\).</p>",
        hint: "<p>Recuerda la regla del producto traspuesto: \\((AB)^{\\top} = B^{\\top}A^{\\top}\\). Busca un contraejemplo concreto de orden \\(2\\).</p>",
        solution: [
          "<p>La identidad correcta es \\((AB)^{\\top}=B^{\\top}A^{\\top}\\): al trasponer un producto, el orden de los factores se invierte.</p>",
          "<p>Contraejemplo: \\(A=\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}\\) y \\(B=\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}\\). Entonces \\(AB=\\begin{pmatrix} 2 & 1 \\\\ 4 & 3 \\end{pmatrix}\\) y \\((AB)^{\\top}=\\begin{pmatrix} 2 & 4 \\\\ 1 & 3 \\end{pmatrix}\\).</p>",
          "<p>Pero \\(A^{\\top}B^{\\top}=\\begin{pmatrix} 1 & 3 \\\\ 2 & 4 \\end{pmatrix}\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}=\\begin{pmatrix} 3 & 1 \\\\ 4 & 2 \\end{pmatrix} \\neq (AB)^{\\top}\\). La afirmación es falsa.</p>",
        ],
        answer: { type: "bool", expected: false },
      },
      {
        id: "X3-4",
        level: "normal",
        statement:
          "<p>Sea \\(A \\in \\mathbb{R}^{3 \\times 3}\\) una matriz con \\(\\det(A) = -2\\). Calcula \\(\\det(2A)\\).</p>",
        hint: "<p>Para \\(A \\in \\mathbb{R}^{n \\times n}\\) y un escalar \\(k\\) vale \\(\\det(kA) = k^{n}\\det(A)\\).</p>",
        solution: [
          "<p>Al multiplicar \\(A\\) por el escalar \\(k=2\\) cada una de sus \\(3\\) filas se multiplica por \\(2\\), y el determinante es multilineal por filas.</p>",
          "<p>Por tanto \\(\\det(2A) = 2^{3}\\det(A) = 8 \\cdot (-2) = -16\\). Fíjate en que el exponente es la dimensión, no el escalar: es un error frecuente escribir \\(2\\det(A)=-4\\).</p>",
        ],
        answer: { type: "number", expected: "-16", exact: true },
      },
      {
        id: "X3-5",
        level: "medio",
        statement:
          "<p>Obtén la factorización \\(LDL^{\\top}\\) de la matriz simétrica \\[ A = \\begin{pmatrix} 2 & 4 & 2 \\\\ 4 & 9 & 6 \\\\ 2 & 6 & 9 \\end{pmatrix}, \\] " +
          "con \\(L\\) unitriangular inferior y \\(D\\) diagonal. Escribe \\(L\\) y \\(D\\).</p>",
        hint: "<p>Aplica la eliminación gaussiana sin intercambios: los multiplicadores de la primera columna son \\(2\\) y \\(1\\), y el de la tercera fila respecto de la segunda es \\(2\\).</p>",
        solution: [
          "<p>Eliminamos la primera columna: multiplicadores \\(m_{21}=4/2=2\\) y \\(m_{31}=2/2=1\\). La fila \\(2\\) queda \\((0,1,2)\\) y la fila \\(3\\), \\((0,2,7)\\).</p>",
          "<p>Eliminamos la entrada \\((3,2)\\) con multiplicador \\(m_{32}=2/1=2\\): la tercera fila queda \\((0,0,3)\\).</p>",
          "<p>La triangular superior es \\(\\begin{pmatrix} 2 & 4 & 2 \\\\ 0 & 1 & 2 \\\\ 0 & 0 & 3 \\end{pmatrix} = D L^{\\top}\\), con \\(D=\\operatorname{diag}(2,1,3)\\) y \\(L^{\\top}=\\begin{pmatrix} 1 & 2 & 1 \\\\ 0 & 1 & 2 \\\\ 0 & 0 & 1 \\end{pmatrix}\\).</p>",
          "<p>Por tanto \\(L=\\begin{pmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ 1 & 2 & 1 \\end{pmatrix}\\) y \\(D=\\operatorname{diag}(2,1,3)\\). Comprobación: \\(LDL^{\\top}=\\begin{pmatrix} 2 & 4 & 2 \\\\ 4 & 9 & 6 \\\\ 2 & 6 & 9 \\end{pmatrix}=A\\); como \\(A\\) es simétrica, \\(U=L^{\\top}\\) y la factorización \\(LDU\\) se escribe \\(LDL^{\\top}\\).</p>",
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
                ["1", "2", "1"],
              ],
            },
            D: {
              type: "matrix",
              rows: 3,
              cols: 3,
              expected: [
                ["2", "0", "0"],
                ["0", "1", "0"],
                ["0", "0", "3"],
              ],
            },
          },
          labels: { L: "Matriz \\(L\\) (unitriangular inferior)", D: "Matriz \\(D\\) (diagonal)" },
        },
      },
      {
        id: "X3-6",
        level: "medio",
        statement:
          "<p>Ajusta por mínimos cuadrados la recta \\(y = mx + n\\) a los puntos \\((0,0)\\), \\((1,2)\\), \\((2,2)\\) y \\((3,4)\\). " +
          "Escribe la pendiente \\(m\\) y la ordenada \\(n\\), como fracciones si hace falta.</p>",
        hint: "<p>Plantea el sistema sobredeterminado \\(A\\begin{pmatrix} n \\\\ m \\end{pmatrix} = \\mathbf{b}\\) con \\(A = \\begin{pmatrix} 1 & 0 \\\\ 1 & 1 \\\\ 1 & 2 \\\\ 1 & 3 \\end{pmatrix}\\) y resuelve las ecuaciones normales \\(A^{\\top}A\\begin{pmatrix} n \\\\ m \\end{pmatrix} = A^{\\top}\\mathbf{b}\\).</p>",
        solution: [
          "<p>El sistema \\(n = 0\\), \\(n+m = 2\\), \\(n+2m = 2\\), \\(n+3m = 4\\) es incompatible: se minimiza el error cuadrático con las ecuaciones normales.</p>",
          "<p>\\(A^{\\top}A = \\begin{pmatrix} 4 & 6 \\\\ 6 & 14 \\end{pmatrix}\\) y \\(A^{\\top}\\mathbf{b} = \\begin{pmatrix} 8 \\\\ 18 \\end{pmatrix}\\).</p>",
          "<p>De \\(4n+6m=8\\) y \\(6n+14m=18\\) se obtiene \\(10m=12\\), luego \\(m=\\tfrac{6}{5}\\) y \\(n=\\tfrac{1}{5}\\).</p>",
          "<p>La recta ajustada es \\(y = \\tfrac{6}{5}x + \\tfrac{1}{5}\\). Comprobación: los residuos son \\(0-\\tfrac{1}{5}\\), \\(2-\\tfrac{7}{5}\\), \\(2-\\tfrac{13}{5}\\), \\(4-\\tfrac{19}{5}\\), cuya suma vale \\(0\\) y verifican \\(\\sum x_{i}(y_{i}-\\hat y_{i}) = 0\\).</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            m: { type: "number", expected: "6/5" },
            n: { type: "number", expected: "1/5" },
          },
          labels: { m: "Pendiente \\(m\\)", n: "Ordenada \\(n\\)" },
        },
      },
      {
        id: "X3-7",
        level: "medio",
        statement:
          "<p>Sea \\[ A = \\begin{pmatrix} 3 & -1 \\\\ 1 & 1 \\end{pmatrix}. \\] Escribe su forma canónica de Jordan \\(J\\).</p>",
        hint: "<p>Calcula el polinomio característico. Si el único autovalor tiene multiplicidad algebraica \\(2\\) y \\(\\dim\\ker(\\lambda I - A)=1\\), el único bloque posible es \\(J_{2}(\\lambda)\\).</p>",
        solution: [
          "<p>\\(\\det(\\lambda I - A) = (3-\\lambda)(1-\\lambda)+1 = \\lambda^{2}-4\\lambda+4 = (\\lambda-2)^{2}\\): el único autovalor es \\(\\lambda=2\\), de multiplicidad algebraica \\(2\\).</p>",
          "<p>\\(A-2I = \\begin{pmatrix} 1 & -1 \\\\ 1 & -1 \\end{pmatrix}\\) tiene rango \\(1\\), luego \\(\\dim\\ker(A-2I)=1\\lt 2\\): falta un autovector y \\(A\\) no es diagonalizable por similitud.</p>",
          "<p>La forma canónica de Jordan es el único bloque de tamaño \\(2\\): \\(J = \\begin{pmatrix} 2 & 1 \\\\ 0 & 2 \\end{pmatrix}\\). Comprobación: con \\(\\mathbf{v}_{1}=(1,1)^{\\top}\\) (autovector) y \\(\\mathbf{v}_{2}=(1,0)^{\\top}\\) (autovector generalizado, \\((A-2I)\\mathbf{v}_{2}=\\mathbf{v}_{1}\\)), la matriz \\(W=[\\mathbf{v}_{1}\\ \\mathbf{v}_{2}]\\) cumple \\(W^{-1}AW=J\\).</p>",
        ],
        answer: {
          type: "matrix",
          rows: 2,
          cols: 2,
          expected: [
            ["2", "1"],
            ["0", "2"],
          ],
        },
      },
      {
        id: "X3-8",
        level: "medio",
        statement:
          "<p>Considera el sistema dependiente del parámetro \\(k \\in \\mathbb{R}\\): \\[ \\begin{cases} x + y + z = 1, \\\\ 2x + y + 3z = 3, \\\\ 3x + 2y + 4z = k. \\end{cases} \\] " +
          "¿Para qué valor de \\(k\\) es el sistema compatible?</p>",
        hint: "<p>Aplica el teorema de Rouché–Frobenius: el sistema es compatible si y solo si el rango de la matriz ampliada coincide con el de la de coeficientes. Resta múltiplos de la primera ecuación para simplificar.</p>",
        solution: [
          "<p>Restamos \\(2\\) veces la primera ecuación a la segunda y \\(3\\) veces la primera a la tercera: el sistema queda \\(x+y+z=1\\), \\(-y+z=1\\), \\(-y+z=k-3\\).</p>",
          "<p>La matriz de coeficientes tiene rango \\(2\\): las filas \\((1,1,1)\\) y \\((0,-1,1)\\) son independientes y la tercera es combinación lineal de ellas.</p>",
          "<p>Para que haya compatibilidad, la tercera ecuación debe ser consecuencia de las anteriores: \\(-y+z=k-3\\) debe coincidir con \\(-y+z=1\\), es decir \\(k-3=1\\).</p>",
          "<p>Por tanto \\(k=4\\). En ese caso el sistema es compatible indeterminado (rango \\(2 \\lt  3\\) incógnitas).</p>",
        ],
        answer: { type: "number", expected: "4", exact: true },
      },
      {
        id: "X3-9",
        level: "examen",
        statement:
          "<p>Diagonaliza ortogonalmente la matriz simétrica \\[ A = \\begin{pmatrix} 2 & 2 \\\\ 2 & -1 \\end{pmatrix} \\] mediante el teorema espectral: escribe \\(A = Q\\Lambda Q^{\\top}\\), " +
          "con \\(\\Lambda = \\operatorname{diag}(\\lambda_{1},\\lambda_{2})\\) de autovalores en orden creciente y \\(Q\\) de autovectores unitarios asociados, cada uno con primera componente positiva. " +
          "Puedes escribir \\(\\sqrt{5}/5\\) como <code>sqrt(5)/5</code>.</p>",
        hint: "<p>El polinomio característico es \\(\\lambda^{2}-\\lambda-6=(\\lambda+2)(\\lambda-3)\\). Normaliza cada autovector dividiendo por su norma, que es \\(\\sqrt{5}\\).</p>",
        solution: [
          "<p>\\(\\det(\\lambda I - A) = (2-\\lambda)(-1-\\lambda)-4 = \\lambda^{2}-\\lambda-6 = (\\lambda+2)(\\lambda-3)\\), luego \\(\\lambda_{1}=-2\\) y \\(\\lambda_{2}=3\\).</p>",
          "<p>Para \\(\\lambda_{1}=-2\\): \\((A+2I)\\mathbf{v}=0\\) da \\(\\mathbf{v}=(1,-2)^{\\top}\\), que normalizado es \\(\\tfrac{1}{\\sqrt{5}}(1,-2)^{\\top}\\). Para \\(\\lambda_{2}=3\\): \\((A-3I)\\mathbf{v}=0\\) da \\(\\mathbf{v}=(2,1)^{\\top}\\), normalizado \\(\\tfrac{1}{\\sqrt{5}}(2,1)^{\\top}\\).</p>",
          "<p>Los autovectores de una matriz simétrica asociados a autovalores distintos son ortogonales, y ya son unitarios: \\(Q = \\tfrac{1}{\\sqrt{5}}\\begin{pmatrix} 1 & 2 \\\\ -2 & 1 \\end{pmatrix}\\) y \\(\\Lambda = \\begin{pmatrix} -2 & 0 \\\\ 0 & 3 \\end{pmatrix}\\).</p>",
          "<p>Comprobación: \\(Q\\Lambda Q^{\\top} = -2\\,\\mathbf{q}_{1}\\mathbf{q}_{1}^{\\top} + 3\\,\\mathbf{q}_{2}\\mathbf{q}_{2}^{\\top} = \\begin{pmatrix} 2 & 2 \\\\ 2 & -1 \\end{pmatrix} = A\\), y \\(Q^{\\top}Q=I\\).</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            Q: {
              type: "matrix",
              rows: 2,
              cols: 2,
              expected: [
                ["sqrt(5)/5", "2*sqrt(5)/5"],
                ["-2*sqrt(5)/5", "sqrt(5)/5"],
              ],
            },
            Lam: {
              type: "matrix",
              rows: 2,
              cols: 2,
              expected: [
                ["-2", "0"],
                ["0", "3"],
              ],
            },
          },
          labels: { Q: "Matriz \\(Q\\) (columnas: autovectores ortonormales)", Lam: "Matriz \\(\\Lambda\\) (diagonal de autovalores)" },
        },
      },
      {
        id: "X3-10",
        level: "examen",
        statement:
          "<p>Sea \\(A \\in \\mathbb{R}^{4 \\times 4}\\) una matriz invertible de autovalores \\(2\\), \\(2\\), \\(-1\\) y \\(4\\). " +
          "Calcula \\(\\det(A^{2})\\) y la traza de \\(A^{-1}\\).</p>",
        hint: "<p>Los autovalores de \\(A^{2}\\) son los cuadrados de los de \\(A\\), y los de \\(A^{-1}\\) sus recíprocos. El determinante es el producto de los autovalores y la traza su suma.</p>",
        solution: [
          "<p>Los autovalores de \\(A^{2}\\) son \\(4\\), \\(4\\), \\(1\\) y \\(16\\); por tanto \\(\\det(A^{2}) = 4 \\cdot 4 \\cdot 1 \\cdot 16 = 256\\). Equivalentemente, \\(\\det(A^{2}) = (\\det A)^{2} = (2\\cdot 2\\cdot(-1)\\cdot 4)^{2} = (-16)^{2} = 256\\).</p>",
          "<p>Los autovalores de \\(A^{-1}\\) son los recíprocos: \\(\\tfrac{1}{2}\\), \\(\\tfrac{1}{2}\\), \\(-1\\) y \\(\\tfrac{1}{4}\\).</p>",
          "<p>La traza es la suma de los autovalores: \\(\\operatorname{tr}(A^{-1}) = \\tfrac{1}{2}+\\tfrac{1}{2}-1+\\tfrac{1}{4} = \\tfrac{1}{4}\\). Estas cantidades son invariantes por similitud: no hace falta calcular \\(A\\).</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            det2: { type: "number", expected: "256", exact: true },
            trinv: { type: "number", expected: "1/4" },
          },
          labels: { det2: "\\(\\det(A^{2})\\)", trinv: "\\(\\operatorname{tr}(A^{-1})\\)" },
        },
      },
      {
        id: "X3-11",
        level: "examen",
        statement:
          "<p>La forma cuadrática \\(q(x,y,z) = 2x^{2}+2y^{2}+2z^{2}-2xy-2xz-2yz\\), de matriz simétrica \\[ A = \\begin{pmatrix} 2 & -1 & -1 \\\\ -1 & 2 & -1 \\\\ -1 & -1 & 2 \\end{pmatrix}, \\] es:</p>",
        hint: "<p>Escribe \\(q\\) como suma de cuadrados, \\(q(x,y,z) = (x-y)^{2}+(y-z)^{2}+(z-x)^{2}\\), y observa en qué vectores se anula. Los autovalores de \\(A\\) lo confirman.</p>",
        solution: [
          "<p>\\(q(x,y,z) = (x-y)^{2}+(y-z)^{2}+(z-x)^{2} \\ge 0\\) para todo \\((x,y,z)\\): la forma es semidefinida positiva.</p>",
          "<p>Pero \\(q(1,1,1)=0\\) con \\((1,1,1)\\neq 0\\), luego la forma no es definida positiva.</p>",
          "<p>Confirmación por autovalores: \\(A = 3I - J\\), con \\(J\\) la matriz de todos unos (autovalores \\(3,0,0\\)); los de \\(A\\) son \\(0,3,3\\). Hay un autovalor nulo y ningún autovalor negativo: la inercia es \\((2+,\\,0-,\\,1\\text{ cero})\\).</p>",
        ],
        answer: {
          type: "choice",
          expected: 1,
          choices: [
            "<p>Definida positiva</p>",
            "<p>Semidefinida positiva, pero no definida positiva</p>",
            "<p>Indefinida</p>",
            "<p>Definida negativa</p>",
          ],
        },
      },
      {
        id: "X3-12",
        level: "examen",
        statement:
          "<p>Sean \\[ A = \\begin{pmatrix} 1 & 1 \\\\ 2 & 2 \\end{pmatrix}, \\qquad \\mathbf{b} = \\begin{pmatrix} 2 \\\\ 5 \\end{pmatrix}. \\] " +
          "(a) Calcula la pseudoinversa de Moore–Penrose \\(A^{\\dagger}\\). " +
          "(b) Escribe la solución de mínima norma de \\(A\\mathbf{x}=\\mathbf{b}\\) dada por \\(\\mathbf{x}=A^{\\dagger}\\mathbf{b}\\), " +
          "que resuelve las ecuaciones normales de mínimos cuadrados. Da cada componente como fracción.</p>",
        hint: "<p>\\(A\\) tiene rango \\(1\\): escribe \\(A = \\mathbf{u}\\mathbf{v}^{\\top}\\) con \\(\\mathbf{u}=(1,2)^{\\top}\\) y \\(\\mathbf{v}=(1,1)^{\\top}\\), y usa \\(A^{\\dagger} = \\dfrac{\\mathbf{v}\\mathbf{u}^{\\top}}{\\|\\mathbf{u}\\|^{2}\\|\\mathbf{v}\\|^{2}}\\). Después, \\(\\mathbf{x} = A^{\\dagger}\\mathbf{b}\\).</p>",
        solution: [
          "<p>\\(A = \\mathbf{u}\\mathbf{v}^{\\top}\\) con \\(\\mathbf{u}=(1,2)^{\\top}\\), \\(\\mathbf{v}=(1,1)^{\\top}\\), \\(\\|\\mathbf{u}\\|^{2}=5\\) y \\(\\|\\mathbf{v}\\|^{2}=2\\). Su SVD compacta es \\(A = \\sigma\\,\\mathbf{u}_{1}\\mathbf{v}_{1}^{\\top}\\) con \\(\\sigma = \\sqrt{10}\\), \\(\\mathbf{u}_{1}=\\tfrac{1}{\\sqrt{5}}(1,2)^{\\top}\\) y \\(\\mathbf{v}_{1}=\\tfrac{1}{\\sqrt{2}}(1,1)^{\\top}\\).</p>",
          "<p>De la SVD, \\(A^{\\dagger} = \\sigma^{-1}\\mathbf{v}_{1}\\mathbf{u}_{1}^{\\top} = \\dfrac{\\mathbf{v}\\mathbf{u}^{\\top}}{\\|\\mathbf{u}\\|^{2}\\|\\mathbf{v}\\|^{2}} = \\dfrac{1}{10}\\begin{pmatrix} 1 & 2 \\\\ 1 & 2 \\end{pmatrix} = \\begin{pmatrix} 1/10 & 1/5 \\\\ 1/10 & 1/5 \\end{pmatrix}\\).</p>",
          "<p>La imagen de \\(A\\) son los vectores \\((s, 2s)\\) y \\(\\mathbf{b}=(2,5)\\) no pertenece a ella: el sistema es incompatible y \\(A^{\\dagger}\\mathbf{b}\\) da el ajuste de mínimos cuadrados de norma mínima, \\(\\mathbf{x} = \\dfrac{1}{10}(2+10,\\, 2+10)^{\\top} = \\left(\\tfrac{6}{5},\\, \\tfrac{6}{5}\\right)^{\\top}\\).</p>",
          "<p>Comprobación: \\(A\\mathbf{x} = \\left(\\tfrac{12}{5}, \\tfrac{24}{5}\\right)^{\\top}\\) es la proyección ortogonal de \\(\\mathbf{b}\\) sobre \\(\\operatorname{col}(A)\\), y se verifican las ecuaciones de Penrose \\(AA^{\\dagger}A=A\\) y \\(A^{\\dagger}AA^{\\dagger}=A^{\\dagger}\\).</p>",
        ],
        answer: {
          type: "multi",
          fields: {
            Adag: {
              type: "matrix",
              rows: 2,
              cols: 2,
              expected: [
                ["1/10", "1/5"],
                ["1/10", "1/5"],
              ],
            },
            x: {
              type: "vector",
              rows: 2,
              cols: 1,
              expected: [["6/5"], ["6/5"]],
            },
          },
          labels: { Adag: "Matriz \\(A^{\\dagger}\\)", x: "Vector \\(\\mathbf{x} = A^{\\dagger}\\mathbf{b}\\)" },
        },
      },
    ],
  },
};
