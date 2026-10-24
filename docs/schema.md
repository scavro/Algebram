# Esquema de datos y guía editorial — Curso Fundamentos Algebraicos para la IA

Estos documentos dirigen la creación de contenido. **El incumplimiento del esquema rompe la web.**

## 1. Archivos por tema

| Archivo | Contenido |
|---|---|
| `temas/tema-N.html` | Página completa del tema (teoría + contenedores de resumen/mapa/ejercicios) |
| `assets/data/tema-N.js` | `window.CURSO_DATA["tema-N"]` con `summary`, `mindmap`, `drills` |
| `verify/tema-N-verify.py` | Script sympy que verifica **todas** las respuestas de `drills` |
| `verify/crosscheck-expected.py` | Contrasta por valor los `expected` de los scripts con los de `assets/data/` |

## 2. Formato de `assets/data/tema-N.js`

```js
window.CURSO_DATA = window.CURSO_DATA || {};
window.CURSO_DATA["tema-1"] = {
  id: "tema-1",
  title: "Escalares",
  // RESUMEN: bloques con listas (los items admiten \(TeX\))
  summary: [
    { h: "Definiciones clave", items: ["\\(\\mathbb{N}\\subset\\mathbb{Z}\\subset\\mathbb{Q}\\subset\\mathbb{R}\\subset\\mathbb{C}\\)", "..."] },
    { h: "Resultados que hay que saber", items: ["..."] },
    { h: "Errores frecuentes", items: ["..."] },
  ],
  // MAPA MENTAL: árbol (label corto + detail con \(TeX\) admitido)
  mindmap: {
    label: "Tema I · Escalares",
    detail: "Los cinco escalares del curso: de \\(\\mathbb{N}\\) a \\(\\mathbb{C}\\).",
    children: [
      { label: "Conjuntos y funciones", detail: "Tuplas, producto cartesiano, familias indexadas.", children: [
        { label: "Funciones", detail: "Inyectiva, sobreyectiva, biyectiva; imagen e imagen recíproca." },
      ]},
    ],
  },
  // EJERCICIOS: los tres niveles; al menos 15 por tema
  drills: [
    {
      id: "T1-N1",                 // único en todo el curso: T{tema}-{N|E|M}{n}
      level: "normal",             // "normal" | "medio" | "examen"
      statement: "<p>Calcula \\(z=(1+i)^2\\) y escribe el resultado en forma \\(a+bi\\).</p>",
      hint: "<p>Desarrolla el cuadrado y recuerda \\(i^2=-1\\).</p>",
      solution: [
        "<p>\\((1+i)^2=1+2i+i^2=1+2i-1=2i\\).</p>",
        "<p>Por tanto \\(z=0+2i\\).</p>",
      ],
      answer: { type: "expr", expected: "2*i" },   // ver §3 tipos
    },
  ],
};
```

### IDs
- Tema N: `T{N}-N1…` (normal), `T{N}-M1…` (medio), `T{N}-E1…` (examen), con numeración correlativa dentro de cada nivel.
- Examen k: `X{k}-1…X{k}-12` (12 preguntas por examen).

## 3. Tipos de `answer` (los entiende `assets/js/grader.js`)

```js
{ type: "expr", expected: "x^2+2*x+1" }          // expresión (admite complejos: "2+3*i")
{ type: "expr", expectedOneOf: ["1/2", "0.5"] }  // varias formas válidas
{ type: "number", expected: "2/3", tol: 1e-6 }   // número (tolerancia relativa)
{ type: "number", expected: "3", exact: true }   // entero exacto
{ type: "matrix", rows: 2, cols: 2, expected: [["1","2"],["3","4"]] }
{ type: "vector", rows: 3, cols: 1, expected: [["1"],["2"],["3"]] }
{ type: "exprset", expected: ["1", "-1", "1/2"] }// conjunto no ordenado (p. ej. autovalores)
{ type: "bool", expected: true }                 // verdadero/falso
{ type: "choice", expected: 1, choices: ["<p>…</p>", "<p>…</p>"] }  // índice correcto (0-based)
{ type: "multi", fields: { det: {type:"number", expected:"-2"}, tr: {...} },
  labels: { det: "Determinante", tr: "Traza" } } // varios campos
```

Notación en las respuestas del alumno: `*` opcional (`2x` = `2*x`), `^` potencias, `sqrt(2)`,
`pi` o `π`, `i` unidad imaginaria, coma o punto decimal (`3,14` = `3.14`).
En `matrix`, el alumno escribe celdas por una rejilla de inputs; `expected` es SIEMPRE
lista de filas de strings. Tipos adicionales: `text` (cadena exacta, para secuencias de
cifras) y `exact: true` (igualdad exacta de números/celdas). En TeX, prohibido `<`/`>`
crudos: usa `\lt` y `\gt`.

**Regla de oro:** el `expected` debe ser la respuesta que un profesor pondría en la solución
oficial, simplificada salvo que el enunciado pida otra forma.

## 4. Estructura de `temas/tema-N.html`

Copia **exactamente** la estructura de `docs/plantilla-tema.html` (mismas clases, mismos
scripts, mismo pie). Solo cambian `data-theme`, textos y `assets/data/tema-N.js`.

Bloques editoriales disponibles (clases CSS ya definidas):

```html
<div class="plaque plaque--def"><span class="plaque__label">Definición 2.1</span> … </div>
<div class="plaque plaque--thm"><span class="plaque__label">Proposición 2.3</span> … </div>
<div class="plaque plaque--warn"><span class="plaque__label">Error frecuente</span> … </div>
<div class="plaque plaque--ia"><span class="plaque__label">En IA</span> … </div>
<div class="two-col"> … </div>
<div class="table-wrap"><table> … </table></div>
<figure class="film"><video …></video><figcaption> … </figcaption></figure>  (si hay animación)
```

Secciones obligatorias del tema: `#fundamentos` … (varias de teoría, con numeración
`<div class="theory-section__num">§ N.M</div>`), `#resumen` (`<div data-summary></div>`),
`#mapa` (`<div class="mindmap" data-mindmap></div>`), `#ejercicios` (`<div data-drills></div>`),
y cinta `.pager` al final.

## 5. Matemáticas y estilo

- Delimitadores TeX: `\(...\)` en línea y `\[...\]` centrado. **Nunca** `$`.
- Notación: \(\mathbb{N},\mathbb{Z},\mathbb{Q},\mathbb{R},\mathbb{C}\); matrices \(A\in K^{n\times m}\) (\(n\) filas, \(m\) columnas, como en los apuntes);
  vectores columna \(\mathbf{v}\); normas \(\|\mathbf{v}\|_2\); traspuesta \(A^{\top}\); adjunta/conjugada \(A^{*}\);
  autovalor/autovector \((\lambda,\mathbf{v})\); SVD \(A=U\Sigma V^{*}\) (con \(V^{*}=V^{\top}\) en el caso real).
- Voz de profesor de grado (español de España): riguroso, directo, cercano. Indicaciones al
  alumno en segunda persona («comprueba», «fíjate en»). Sin anglicismos innecesarios.
- Cada teorema/propiedad importante lleva **demostración o esbozo** salvo que el enunciado
  diga «se demuestra que».
- Cada tema enlaza con IA: al menos dos bloques `.plaque--ia` (p. ej. PCA, mínimos cuadrados,
  word embeddings, regularización…).
- Errores frecuentes: al menos dos `.plaque--warn` por tema (p. ej. confundir adjunta con
  traspuesta, olvidar hipótesis de simetría…).
- Ejemplos: mínimo 4 numerados en la teoría, resueltos paso a paso.

## 6. Ejercicios

- Cada tema incluye los niveles **normal**, **medio** y **examen**, con al menos 15 ejercicios y un reparto `normal ≥ medio ≥ examen`. La ampliación actual contiene 15, 15, 15, 20 y 21 ejercicios por tema.
- Deben ser originales (adaptables del espíritu de los apuntes y de
  `Ejercicios_Tema_I.pdf`, nunca copia literal con mismos números).
- Cada ejercicio: enunciado + pista + **solución completa paso a paso** (lista `solution`
  con 2–6 pasos HTML) + `answer`.
- Los de nivel «examen»: enunciado tipo examen UNED (conciso, un resultado final claro).
- Evita números feos salvo justificación didáctica; usa datos «redondos» o simbólicos.
- Al menos 1 ejercicio de tipo `choice` y 1 de `bool` en el conjunto del curso (puede ser
  en cualquier tema); el resto pueden ser `expr`, `number`, `matrix`, `vector`, `exprset`, `multi`.

## 7. Verificación obligatoria (no entregar sin esto)

1. `verify/tema-N-verify.py` debe recorrer todos los `drills` del `assets/data/tema-N.js`
   y **afirmar con sympy** que cada respuesta es correcta: recalcular el resultado desde
   el enunciado y compararlo con el `expected` del banco
   (`simplify(a-b)==0` para exprs; igualdad de matrices elemento a elemento; etc.).
   El script se ejecuta con `python3 verify/tema-N-verify.py` y debe imprimir `OK` y salir 0.
2. Ejecutar `node tests/lint-tema.js temas/tema-N.html assets/data/tema-N.js`:
   valida estructura HTML, esquema del data (niveles y mínimos por tema, IDs únicos),
   delimitadores TeX y que el grader acepta cada `expected` y rechaza basura. Debe imprimir `OK`.
3. Ejecutar `python3 verify/crosscheck-expected.py`:
   contrasta **por valor** la copia de la respuesta esperada que guarda cada script de
   `verify/` con el `expected` de `assets/data/`. Es obligatorio porque un script puede
   quedar desactualizado —o, peor, verificar un enunciado distinto del de la ficha— sin
   que ninguna otra comprobación lo detecte. Debe imprimir `OK` y salir 0.

**Fuentes de referencia** (solo lectura):
- Texto principal extraído: `/home/scavro/AAA Uned/Fundamentos algebraicos para la ia/CURSO CHATI/revision/principal-limpio.txt`
  (numeración impresa = página física PDF + 5).
- PDF original: `.../materiales/Algebra_IA (1).pdf` (pdftotext de rangos concretos si hace falta).
- Ejercicios Tema I: `.../CURSO CHATI/revision/Ejercicios_Tema_I.txt`.
