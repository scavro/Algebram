#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify/tema-1-verify.py — Tema I · Escalares
============================================
Recalcula desde el enunciado la respuesta de cada ejercicio (T1-N1 … T1-E4)
y la compara con el `expected` de assets/data/tema-1.js (copiado aquí como
constante). Tipos de respuesta (docs/schema.md §3):

  - expr   : simplify(computado - esperado) == 0
  - number : igualdad numérica exacta o racional
  - exprset: comparación de conjuntos, elemento a elemento
  - multi  : se verifica cada campo
  - choice : comprobación manual documentada (se recalculan los hechos)
  - bool   : comprobación manual documentada (contraejemplo explícito)

Uso:  python3 verify/tema-1-verify.py   →  «OK: 15/15 verificados», exit 0
"""

import re
import sys
from decimal import Decimal, ROUND_HALF_EVEN

import sympy as sp

# --------------------------------------------------------------------------
# `expected` copiados de assets/data/tema-1.js (constantes del verificador)
# --------------------------------------------------------------------------
EXPECTED = {
    "T1-N1": "109",                      # number, exact
    "T1-N2": "2220",                     # expr (cifras en base 3)
    "T1-N3": 1,                          # choice: «Sobreyectiva y no inyectiva»
    "T1-N4": "4/11",                     # expr
    "T1-N5": "2.34",                     # expr
    "T1-N6": "10+5*i",                   # expr
    "T1-M1": "1/2+3/2*i",                # expr
    "T1-M2": {"mod": "2", "arg": "5*pi/6"},            # multi
    "T1-M3": "16",                       # expr
    "T1-M4": ["2", "-1+sqrt(3)*i", "-1-sqrt(3)*i"],    # exprset
    "T1-M5": False,                      # bool
    "T1-E1": "93/8",                     # number
    "T1-E2": {"mod": "2", "arg": "pi/3", "cub": "-8"},  # multi
    "T1-E3": ["2", "2*i", "-2", "-2*i"],               # exprset
    "T1-E4": "sqrt(3)/2",                # expr
}

I = sp.I
pi = sp.pi


def E(s):
    """Convierte una cadena `expected` del data en expresión de SymPy.

    La unidad imaginaria se escribe `i` en el data; se pasa a `I` sin tocar
    identificadores como `pi` o `sqrt`.
    """
    return sp.sympify(re.sub(r"\bi\b", "I", str(s)), locals={"I": I, "pi": pi})


def eq_expr(computado, esperado_str):
    """Equivalencia simbólica exacta para respuestas de tipo expr."""
    return sp.simplify(sp.sympify(computado) - E(esperado_str)) == 0


def eq_set(computado_list, esperado_list):
    """Conjuntos iguales: cada esperado se cubre con algún computado."""
    if len(computado_list) != len(esperado_list):
        return False
    usados = [False] * len(esperado_list)
    for c in computado_list:
        ok = False
        for k, e in enumerate(esperado_list):
            if not usados[k] and sp.simplify(sp.sympify(c) - E(e)) == 0:
                usados[k] = True
                ok = True
                break
        if not ok:
            return False
    return True


RESULTADOS = []


def registrar(did, ok, detalle):
    RESULTADOS.append((did, bool(ok), detalle))


# ==========================================================================
# T1-N1 — 1101101_2 en base diez  (number exact: 109)
# ==========================================================================
bits = [1, 1, 0, 1, 1, 0, 1]  # cifras de 1101101_2, de mayor a menor peso
valor_n1 = sum(b * 2**k for k, b in enumerate(reversed(bits)))
registrar(
    "T1-N1",
    valor_n1 == int(EXPECTED["T1-N1"]) and valor_n1 == 109,
    "1101101_2 = %d (esperado %s)" % (valor_n1, EXPECTED["T1-N1"]),
)

# ==========================================================================
# T1-N2 — 78 en base 3  (expr: 2220)
# ==========================================================================


def a_base(n, b):
    """Divisiones sucesivas: representación de n en base b (sin subíndice)."""
    if n == 0:
        return "0"
    cifras = []
    while n > 0:
        cifras.append(str(n % b))
        n //= b
    return "".join(reversed(cifras))


rep_n2 = a_base(78, 3)
# comprobación inversa con el valor posicional
valor_n2 = sum(int(d) * 3**k for k, d in enumerate(reversed(rep_n2)))
registrar(
    "T1-N2",
    rep_n2 == EXPECTED["T1-N2"] and valor_n2 == 78,
    "78 = %s_3 (esperado %s); comprobación posicional = %d" % (rep_n2, EXPECTED["T1-N2"], valor_n2),
)

# ==========================================================================
# T1-N3 — función f:{1,2,3}→{a,b}  (choice: índice 1 «Sobreyectiva y no inyectiva»)
# Comprobación manual documentada: se recalculan inyectividad y sobreyectividad.
# ==========================================================================
f = {1: "a", 2: "b", 3: "a"}
f_inyectiva = len(set(f.values())) == len(f)          # False: f(1) = f(3)
f_sobreyectiva = set(f.values()) == {"a", "b"}        # True: imagen = {a, b}
# Opciones del enunciado (índices 0-based):
#   0 «Inyectiva y no sobreyectiva»  1 «Sobreyectiva y no inyectiva»
#   2 «Biyectiva»                    3 «Ni inyectiva ni sobreyectiva»
indice_correcto = 1
registrar(
    "T1-N3",
    (not f_inyectiva)
    and f_sobreyectiva
    and indice_correcto == EXPECTED["T1-N3"],
    "f no inyectiva (f(1)=f(3)) y sobreyectiva (imagen={a,b}) → opción %d"
    % indice_correcto,
)

# ==========================================================================
# T1-N4 — 0,(36) como fracción irreducible  (expr: 4/11)
# ==========================================================================
# 100r - r = 36  ⇒  99r = 36  ⇒  r = 36/99
r_n4 = sp.Rational(36, 99)
registrar(
    "T1-N4",
    eq_expr(r_n4, EXPECTED["T1-N4"]) and sp.simplify(r_n4 - sp.Rational(4, 11)) == 0,
    "99r=36 → r=36/99=4/11 (esperado %s)" % EXPECTED["T1-N4"],
)

# ==========================================================================
# T1-N5 — redondeo al par de 2,345 a 3 c.s.  (expr: 2.34)
# ==========================================================================
# 3 cifras significativas ⇒ redondeo a las centésimas: candidatos 2,34 y 2,35.
red_n5 = Decimal("2.345").quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)
registrar(
    "T1-N5",
    sp.Rational(str(red_n5)) == sp.Rational(EXPECTED["T1-N5"]) and red_n5 == Decimal("2.34"),
    "ROUND_HALF_EVEN(2.345 → 2 decimales) = %s (esperado %s)" % (red_n5, EXPECTED["T1-N5"]),
)

# ==========================================================================
# T1-N6 — (3+4i)(2-i)  (expr: 10+5*i)
# ==========================================================================
calc_n6 = (3 + 4 * I) * (2 - I)
registrar(
    "T1-N6",
    eq_expr(calc_n6, EXPECTED["T1-N6"]),
    "(3+4i)(2-i) = %s (esperado %s)" % (sp.expand(calc_n6), EXPECTED["T1-N6"]),
)

# ==========================================================================
# T1-M1 — (2+i)/(1-i)  (expr: 1/2+3/2*i)
# ==========================================================================
calc_m1 = (2 + I) / (1 - I)
registrar(
    "T1-M1",
    eq_expr(calc_m1, EXPECTED["T1-M1"]),
    "(2+i)/(1-i) = %s (esperado %s)" % (sp.simplify(calc_m1), EXPECTED["T1-M1"]),
)

# ==========================================================================
# T1-M2 — z = -√3 + i: módulo y argumento principal  (multi)
# ==========================================================================
z_m2 = -sp.sqrt(3) + I
mod_m2 = sp.Abs(z_m2)          # = 2
arg_m2 = sp.arg(z_m2)          # = 5π/6 ∈ (-π, π]
ok_m2 = (
    sp.simplify(mod_m2 - E(EXPECTED["T1-M2"]["mod"])) == 0
    and sp.simplify(arg_m2 - E(EXPECTED["T1-M2"]["arg"])) == 0
)
registrar(
    "T1-M2",
    ok_m2,
    "|z| = %s, arg(z) = %s (esperado %s y %s)"
    % (sp.simplify(mod_m2), sp.simplify(arg_m2),
       EXPECTED["T1-M2"]["mod"], EXPECTED["T1-M2"]["arg"]),
)

# ==========================================================================
# T1-M3 — (1+i)^8  (expr: 16)
# ==========================================================================
calc_m3 = sp.expand((1 + I) ** 8)
registrar(
    "T1-M3",
    eq_expr(calc_m3, EXPECTED["T1-M3"]),
    "(1+i)^8 = %s (esperado %s)" % (calc_m3, EXPECTED["T1-M3"]),
)

# ==========================================================================
# T1-M4 — raíces cúbicas de 8  (exprset)
# ==========================================================================
z = sp.Symbol("z")
raices_m4 = [sp.expand(r) for r in sp.solve(z**3 - 8, z)]
registrar(
    "T1-M4",
    eq_set(raices_m4, EXPECTED["T1-M4"]),
    "raíces de z^3-8: %s (esperado %s)" % (raices_m4, EXPECTED["T1-M4"]),
)

# ==========================================================================
# T1-M5 — «√(z²) = z para todo z ∈ C»  (bool: False)
# Comprobación manual documentada: contraejemplo z = -1.
# ==========================================================================
contraejemplo = sp.sqrt((-1) ** 2)   # rama principal: sqrt(1) = 1
ok_m5 = (contraejemplo != -1) and (EXPECTED["T1-M5"] is False)
registrar(
    "T1-M5",
    ok_m5,
    "z=-1: √(z²) = %s ≠ -1 → la afirmación es falsa (esperado %s)"
    % (contraejemplo, EXPECTED["T1-M5"]),
)

# ==========================================================================
# T1-E1 — 1011,101_2 en base diez  (number: 93/8)
# ==========================================================================
calc_e1 = (
    1 * 2**3 + 0 * 2**2 + 1 * 2**1 + 1 * 2**0          # parte entera 1011_2
    + sp.Rational(1, 2) + sp.Rational(1, 8)            # 0,101_2 = 1/2 + 1/8
)
registrar(
    "T1-E1",
    sp.simplify(calc_e1 - E(EXPECTED["T1-E1"])) == 0 and calc_e1 == sp.Rational(93, 8),
    "1011,101_2 = %s (esperado %s)" % (calc_e1, EXPECTED["T1-E1"]),
)

# ==========================================================================
# T1-E2 — z = 1+√3 i: módulo, argumento principal y z³  (multi)
# ==========================================================================
z_e2 = 1 + sp.sqrt(3) * I
mod_e2 = sp.Abs(z_e2)                 # = 2
arg_e2 = sp.arg(z_e2)                 # = π/3
cub_e2 = sp.expand(z_e2**3)           # = -8
ok_e2 = (
    sp.simplify(mod_e2 - E(EXPECTED["T1-E2"]["mod"])) == 0
    and sp.simplify(arg_e2 - E(EXPECTED["T1-E2"]["arg"])) == 0
    and sp.simplify(cub_e2 - E(EXPECTED["T1-E2"]["cub"])) == 0
)
registrar(
    "T1-E2",
    ok_e2,
    "|z| = %s, arg(z) = %s, z^3 = %s (esperado %s, %s, %s)"
    % (sp.simplify(mod_e2), sp.simplify(arg_e2), cub_e2,
       EXPECTED["T1-E2"]["mod"], EXPECTED["T1-E2"]["arg"], EXPECTED["T1-E2"]["cub"]),
)

# ==========================================================================
# T1-E3 — raíces cuartas de 16  (exprset)
# ==========================================================================
raices_e3 = [sp.expand(r) for r in sp.solve(z**4 - 16, z)]
registrar(
    "T1-E3",
    eq_set(raices_e3, EXPECTED["T1-E3"]),
    "raíces de z^4-16: %s (esperado %s)" % (raices_e3, EXPECTED["T1-E3"]),
)

# ==========================================================================
# T1-E4 — (e^{iπ/3} - e^{-iπ/3}) / (2i)  (expr: sqrt(3)/2)
# ==========================================================================
# Forma literal del enunciado (exponenciales) y forma desarrollada con Euler:
# e^{iθ} - e^{-iθ} = 2i·sen(θ), luego w = sen(π/3) = √3/2.
calc_e4_exp = (sp.exp(I * pi / 3) - sp.exp(-I * pi / 3)) / (2 * I)
calc_e4 = (sp.cos(pi / 3) + I * sp.sin(pi / 3) - (sp.cos(pi / 3) - I * sp.sin(pi / 3))) / (2 * I)
ok_e4 = (
    sp.simplify(calc_e4 - E(EXPECTED["T1-E4"])) == 0
    and abs(sp.N(calc_e4_exp - sp.sqrt(3) / 2, 30)) < sp.Float("1e-25")
)
registrar(
    "T1-E4",
    ok_e4,
    "(e^{iπ/3}-e^{-iπ/3})/(2i) = sen(π/3) = %s (esperado %s); numérico = %s"
    % (sp.simplify(calc_e4), EXPECTED["T1-E4"], sp.N(calc_e4_exp, 15)),
)

# ==========================================================================
# Informe
# ==========================================================================
fallos = 0
for did, ok, detalle in RESULTADOS:
    marca = "OK " if ok else "FAIL"
    if not ok:
        fallos += 1
    print("%-6s %s  %s" % (did, marca, detalle))

total = len(RESULTADOS)
if fallos:
    print("\nFALLO: %d/%d verificados" % (total - fallos, total))
    sys.exit(1)

print("\nOK: %d/%d verificados" % (total, total))
sys.exit(0)
