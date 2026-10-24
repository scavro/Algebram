/* ÁRBITRO R1 · ataque al grader — casos hostiles.
   Objetivo: (a) que acepte respuestas FALSAS, (b) que rechace CORRECTAS.
   Cada caso imprime ACEPTA/RECHAZA y si eso es correcto (✔) o un fallo del grader (✘). */
const G = require("../../../assets/js/grader.js");

let fallos = 0;
function t(nombre, spec, respuesta, esperadoAcepta) {
  const r = G.check(spec, respuesta);
  const bien = r.ok === esperadoAcepta;
  if (!bien) fallos++;
  console.log(`${bien ? "✔" : "✘"} ${nombre}: grader=${r.ok ? "ACEPTA" : "RECHAZA"} (debía ${esperadoAcepta ? "aceptar" : "rechazar"})${r.error ? " [" + r.error + "]" : ""}`);
}

console.log("--- A. FALSOS POSITIVOS (debe RECHAZAR y a veces acepta) ---");
// A1. x-y es 0 solo cuando x=y: el muestreo pone todas las variables en el MISMO punto
t("A1 'x-y' vs expected 0", { type: "expr", expected: "0" }, "x-y", false);
t("A2 'x^2-y^2' vs expected 0", { type: "expr", expected: "0" }, "x^2-y^2", false);
t("A3 'sin(x)-sin(y)' vs 0", { type: "expr", expected: "0" }, "sin(x)-sin(y)", false);
t("A4 '4-2*t' vs expected 4-s-t (T4-N3)", { type: "expr", expected: "4-s-t" }, "4-2*t", false);
t("A5 '4-s-t+(s-t)' vs '4-s-t'", { type: "expr", expected: "4-s-t" }, "4-s-t+(s-t)", false);
// A6. Expresiones no finitas en todos los puntos de muestreo: el bucle hace continue y devuelve true
t("A6 '1/(x-x)' vs expected 5", { type: "expr", expected: "5" }, "1/(x-x)", false);
t("A7 'log(x-x)' vs expected 3", { type: "expr", expected: "3" }, "log(x-x)", false);
t("A8 '1/(x-y)' vs '2/(x-y)'", { type: "expr", expected: "2/(x-y)" }, "1/(x-y)", false);
// A9. x^2 ≡ y^2 (mismo punto para todas las variables)
t("A9 'y^2' vs expected x^2", { type: "expr", expected: "x^2" }, "y^2", false);
// A10. celda de matriz con la misma trampa
t("A10 matriz celda 'x-y' vs '0'", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [["x-y"]], false);
// A11. tolerancia: perturbaciones microscópicas aceptadas como 0
t("A11 '1e-7' vs expected 0 (matrix)", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [["0.0000001"]], false);
t("A12 '0.0001' vs number 0 sin exact", { type: "number", expected: "0" }, "0.0001", false);
// A13. choice: parseInt trunca basura
t("A13 choice '1abc' == 1", { type: "choice", expected: 1 }, "1abc", false);
t("A14 choice '2.9' == 2", { type: "choice", expected: 2 }, "2.9", false);
// A15. bool admite 'si'/'1'/'v' (documentado) pero ¿y '0.0'?
t("A15 bool '1' -> true", { type: "bool", expected: true }, "1", true);
// A16. expr para secuencia de cifras: valor equivalente no es la secuencia
t("A16 '1.211e3' vs expected '1211' (X1-1)", { type: "expr", expected: "1211" }, "1.211e3", false);
t("A17 '222*10' vs expected '2220' (T1-N2)", { type: "expr", expected: "2220" }, "222*10", false);
// A18. número exacto: ¿'2.0000001' pasa por entero?
t("A18 exact '2.0000001' vs 2", { type: "number", expected: "2", exact: true }, "2.0000001", false);

console.log("--- B. FALSOS NEGATIVOS (debe ACEPTAR y a veces rechaza) ---");
t("B1 '1/2' vs expected '0.5'", { type: "expr", expected: "0.5" }, "1/2", true);
t("B2 '2i' vs '2*i'", { type: "expr", expected: "2*i" }, "2i", true);
t("B3 '0,5' coma decimal vs '1/2'", { type: "expr", expected: "1/2" }, "0,5", true);
t("B4 '(2+11i)/5' vs '2/5+11/5*i'", { type: "expr", expected: "2/5+11/5*i" }, "(2+11i)/5", true);
t("B5 'sqrt(3)/2' vs '3^0.5/2'", { type: "expr", expected: "sqrt(3)/2" }, "3^0.5/2", true);
t("B6 'π/3' unicode vs 'pi/3'", { type: "expr", expected: "pi/3" }, "π/3", true);
t("B7 '−2' unicode minus vs '-2'", { type: "number", expected: "-2", exact: true }, "\u22122", true);
t("B8 matriz '1/2' vs '0.5'", { type: "matrix", rows: 1, cols: 1, expected: [["0.5"]] }, [["1/2"]], true);
t("B9 matriz 'sqrt(4)' vs '2'", { type: "matrix", rows: 1, cols: 1, expected: [["2"]] }, [["sqrt(4)"]], true);
t("B10 exprset '2;-2' vs ['4','-2'] en cualquier orden", { type: "exprset", expected: ["4", "-2"] }, "-2;4", true);
t("B11 '1e3' notación científica vs 1000", { type: "number", expected: "1000", exact: true }, "1e3", true);
t("B12 '5!' factorial vs 120", { type: "number", expected: "120", exact: true }, "5!", true);
t("B13 '-2^2' vs '-4' (convención -(2^2))", { type: "expr", expected: "-4" }, "-2^2", true);
t("B14 '2sqrt(3)' implícito vs '2*sqrt(3)'", { type: "expr", expected: "2*sqrt(3)" }, "2sqrt(3)", true);
t("B15 bool 'Sí' acento/mayúscula -> true", { type: "bool", expected: true }, "Sí", true);
t("B16 bool 'falso' -> false", { type: "bool", expected: false }, "falso", true);
t("B17 '3,14' vs '3.14'", { type: "number", expected: "3.14" }, "3,14", true);
t("B18 multi campos correctos", { type: "multi", fields: { a: { type: "number", expected: "2", exact: true }, b: { type: "number", expected: "3", exact: true } } }, { a: "2", b: "3" }, true);

console.log("--- C. FALSOS POSITIVOS de coeficiente/signo/dimensión (debe RECHAZAR) ---");
t("C1 '11' vs expected 10 (coeficiente)", { type: "expr", expected: "10" }, "11", false);
t("C2 '-2i' vs '2i' (signo)", { type: "expr", expected: "2*i" }, "-2*i", false);
t("C3 vector 2 componentes vs 3", { type: "vector", rows: 3, cols: 1, expected: [["1"], ["2"], ["3"]] }, [["1"], ["2"]], false);
t("C4 matriz transpuesta", { type: "matrix", rows: 2, cols: 2, expected: [["1", "2"], ["3", "4"]] }, [["1", "3"], ["2", "4"]], false);
t("C5 '0.5' vs expected 1/2 negado: '-1/2'", { type: "expr", expected: "1/2" }, "-1/2", false);
t("C6 exprset con valor cambiado", { type: "exprset", expected: ["4", "-2"] }, "4;2", false);
t("C7 bool invertido", { type: "bool", expected: true }, "false", false);
t("C8 choice equivocado", { type: "choice", expected: 1 }, "2", false);
t("C9 '4/2' exact vs expected 3", { type: "number", expected: "3", exact: true }, "4/2", false);

console.log("--- D. CASOS DE FORMA EQUIVALENTE SUTILES (debe ACEPTAR) ---");
t("D1 'sqrt(2)/2' vs '1/sqrt(2)'", { type: "expr", expected: "sqrt(2)/2" }, "1/sqrt(2)", true);
t("D2 'sqrt(5)/5' vs '1/sqrt(5)'", { type: "matrix", rows: 1, cols: 1, expected: [["sqrt(5)/5"]] }, [["1/sqrt(5)"]], true);
t("D3 'i^2' vs '-1'", { type: "expr", expected: "-1" }, "i^2", true);
t("D4 '(1+i)^2' vs '2i'", { type: "expr", expected: "2*i" }, "(1+i)^2", true);
t("D5 '5*pi/6' vs 'pi*5/6'", { type: "expr", expected: "5*pi/6" }, "pi*5/6", true);
t("D6 'sqrt(3)/2' vs '0.8660254037844386' (tol)", { type: "expr", expected: "sqrt(3)/2" }, "0.8660254037844386", true);

console.log("\nResumen: " + fallos + " desajustes del grader frente al criterio matemático");
process.exit(fallos ? 1 : 0);
