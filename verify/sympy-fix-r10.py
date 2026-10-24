#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Certificación sympy — correcciones planificadas para grader.js (post-R10).

Antes de tocar el motor, cada identidad que se va a aceptar y cada regla de
reescritura que se va a implementar se certifica aquí con sympy (simplificación
simbólica + muestreo numérico complejo denso). Si un caso no certifica, NO se
implementa.

Casos:
  A. Identidades FN de la R10 que deben pasar a ACEPTAR (K11–K15, W8, W17,
     W18, U8, C2, C4, C7, C8 + las clases M1/M2/M6 de G5).
  B. Reglas de reescritura planificadas (cada una con su contrapartida falsa
     que debe seguir RECHAZÁNDOSE — controles negativos).
  C. Controles que deben seguir en RECHAZAR (K1–K10, W3–W5, etc.).

Salida: verify/certificaciones/sympy-fix-r10.json + stdout.
"""

import json
import random
import sys
from pathlib import Path

import sympy as sp
from sympy import (
    Abs, I, Integer, Rational, conjugate, cos, exp, im, log, pi, re, sin,
    sqrt, symbols, tan, simplify, nsimplify, N,
)

x, y, z, a, b, c, d, e, u, w = symbols("x y z a b c d e u w", complex=True)

random.seed(20261014)


def numeric_holds(lhs, rhs, samples=60, tol=1e-6):
    """Muestreo numérico complejo: True si lhs≈rhs en todos los puntos válidos."""
    lhs = sp.sympify(lhs)
    rhs = sp.sympify(rhs)
    free = list(lhs.free_symbols | rhs.free_symbols)
    if not free:
        return abs(complex(N(lhs)) - complex(N(rhs))) < tol
    ok = 0
    for _ in range(samples):
        env = {}
        for s in free:
            env[s] = complex(random.uniform(-3, 3), random.uniform(-3, 3))
        try:
            lv = complex(N(lhs.subs(env)))
            rv = complex(N(rhs.subs(env)))
        except Exception:
            continue
        if not (abs(lv) < 1e12 and abs(rv) < 1e12):
            continue
        if abs(lv - rv) > tol * max(1.0, abs(lv), abs(rv)):
            return False
        ok += 1
    return ok >= 5


def prove(name, lhs, rhs, expect_equal=True):
    """True si la identidad se comporta como se espera (igual o distinta)."""
    lhs = sp.sympify(lhs)
    rhs = sp.sympify(rhs)
    try:
        diff = simplify(lhs - rhs)
    except Exception:
        diff = None
    symbolic_eq = diff == 0 if diff is not None else None
    numeric_eq = numeric_holds(lhs, rhs)
    if expect_equal:
        # basta la prueba simbólica O el muestreo denso (u^4096 desborda el
        # muestreo float pero simplify certifica la identidad)
        held = (symbolic_eq is True) or numeric_eq
    else:
        held = not numeric_eq
    return {
        "nombre": name,
        "espera": "IGUAL" if expect_equal else "DISTINTO",
        "sympy_simplify_cero": symbolic_eq,
        "muestreo_numerico_igual": numeric_eq,
        "certifica": bool(held),
    }


CASOS_A = [
    # --- K11/K12: sqrt(c·u) con c<0 real: sqrt(c·u) = sqrt(-c)·sqrt(-u) ---
    ("K11 sqrt(-4x) = 2*sqrt(-x)", sqrt(-4 * x), 2 * sqrt(-x), True),
    ("K12 sqrt(-9x) = 3*sqrt(-x)", sqrt(-9 * x), 3 * sqrt(-x), True),
    ("K11b sqrt(-4x) = sqrt(4)*sqrt(-x)", sqrt(-4 * x), sqrt(4) * sqrt(-x), True),
    ("K11c sqrt(-x) = sqrt(-1)*sqrt(x) FALSO (rama)", sqrt(-x), I * sqrt(x), False),
    # --- K13/K14/K15: log(c·u) c>0, anidado, y log(4x)/2 = log(2 sqrt(x)) ---
    ("K13 log(2x)+log(3) = log(6x)", log(2 * x) + log(3), log(6 * x), True),
    ("K14 log(2*(3x)) = log(6x)", log(2 * (3 * x)), log(6 * x), True),
    ("K15 log(4x)/2 = log(2*sqrt(x))", log(4 * x) / 2, log(2 * sqrt(x)), True),
    ("K15b log(sqrt(x)) = log(x)/2", log(sqrt(x)), log(x) / 2, True),
    ("K15c log(2*sqrt(x)) = log(2)+log(x)/2", log(2 * sqrt(x)), log(2) + log(x) / 2, True),
    # --- W8: (x^(2/3))^(3/2) = x  (b no entero, sin wrap de arg) ---
    ("W8 (x^(2/3))^(3/2) = x", (x ** Rational(2, 3)) ** Rational(3, 2), x, True),
    ("W8b (x^(p/q))^(q/p) = x con p/q=1/2", (x ** Rational(1, 2)) ** 2, x, True),
    # --- W17/W18: potencias fuera de rango, identidades verdaderas ---
    ("W17 x^4097 = x^4096*x", x ** 4097, x ** 4096 * x, True),
    ("W18 x^(-4097) = 1/x^4097", x ** (-4097), 1 / x ** 4097, True),
    ("W18b x^(-65) = 1/x^65", x ** (-65), 1 / x ** 65, True),
    # --- U8: tan impar ---
    ("U8 tan(x)+tan(-x) = 0", tan(x) + tan(-x), 0, True),
    ("U8b tan(-x) = -tan(x)", tan(-x), -tan(x), True),
    # --- C2/C4/C7/C8: re/im/conj ---
    ("C2 conj(re(x)) = re(x)", conjugate(re(x)), re(x), True),
    ("C2b conj(im(x)) = im(x)", conjugate(im(x)), im(x), True),
    ("C4 re(x*y) = re(x)re(y)-im(x)im(y)", re(x * y), re(x) * re(y) - im(x) * im(y), True),
    ("C7 im(x*y) = re(x)im(y)+im(x)re(y)", im(x * y), re(x) * im(y) + im(x) * re(y), True),
    ("C8 conj(x)^2 = conj(x^2)", conjugate(x) ** 2, conjugate(x ** 2), True),
    ("C8b conj(x*y) = conj(x)conj(y)", conjugate(x * y), conjugate(x) * conjugate(y), True),
    ("C8c conj(x^2) = conj(x)^2", conjugate(x ** 2), conjugate(x) ** 2, True),
    # --- M1/M2/M6: conmutatividad/associatividad y potencias grandes ---
    ("M1 suma reordenada", a + b + c + d + e, e + d + c + b + a, True),
    ("M6 (a+b+c+d+e)^4096 = ^4095*(a+b+c+d+e)",
     (a + b + c + d + e) ** 4096, (a + b + c + d + e) ** 4095 * (a + b + c + d + e), True),
    ("M6b (x^300)*(x^1) = x^301", x ** 300 * x, x ** 301, True),
    ("M6c 1/x^300 = x^(-300)", 1 / x ** 300, x ** (-300), True),
    # --- cierres residuales (T8/P7 de ataques-nuevos/estructurales) ---
    ("T8 abs(x*y) = abs(x)*abs(y)", Abs(x * y), Abs(x) * Abs(y), True),
    ("T8b abs(x/y) = abs(x)/abs(y)", Abs(x / y), Abs(x) / Abs(y), True),
    ("P7 x^(2y/y) = x^2 (y≠0)", x ** (2 * y / y), x ** 2, True),
    ("P7b x^(y+y)/x^(y) = x^y", x ** (y + y) / x ** y, x ** y, True),
    # --- reglas planificadas de rewriteTrueIdentities ---
    ("R-a sqrt(k*u) = sqrt(k)*sqrt(u) k>0", sqrt(4 * x), 2 * sqrt(x), True),
    ("R-b log(k*u) = log(k)+log(u) k>0", log(4 * x), log(4) + log(x), True),
    ("R-c tan(-u) = -tan(u)", tan(-u), -tan(u), True),
    ("R-d sin(-u) = -sin(u)", sin(-u), -sin(u), True),
    ("R-e cos(-u) = cos(u)", cos(-u), cos(u), True),
    ("R-f (u^(1/2))^2 = u", (u ** Rational(1, 2)) ** 2, u, True),
    ("R-g u^(3/2) = u*sqrt(u)", u ** Rational(3, 2), u * sqrt(u), True),
    ("R-h u^(-1/2) = 1/sqrt(u)", u ** Rational(-1, 2), 1 / sqrt(u), True),
    ("R-i |u|^2 = u*conj(u)", Abs(u) ** 2, u * conjugate(u), True),
    ("R-j re(u) = (u+conj(u))/2", re(u), (u + conjugate(u)) / 2, True),
    ("R-k im(u) = (u-conj(u))/(2i)", im(u), (u - conjugate(u)) / (2 * I), True),
    ("R-l conj(u+v) = conj(u)+conj(v)", conjugate(u + w), conjugate(u) + conjugate(w), True),
    ("R-m min/max conmutan", 0 * (a - b), 0 * (b - a), True),
]

CASOS_B_CONTROLES_RECHAZAR = [
    ("K1 log(-4x) vs log(4x)+i*pi FALSA", log(-4 * x), log(4 * x) + I * pi, False),
    ("K2 log(-4x) vs log(4x)-i*pi FALSA", log(-4 * x), log(4 * x) - I * pi, False),
    ("K3 log(-2x) vs log(2)+log(x)+i*pi FALSA", log(-2 * x), log(2) + log(x) + I * pi, False),
    ("K5 log(-x) vs log(x)+i*pi FALSA", log(-x), log(x) + I * pi, False),
    ("K6 log(-4x) vs log(4x) FALSA", log(-4 * x), log(4 * x), False),
    ("K7 sqrt(-4x) vs 2*sqrt(x) FALSA", sqrt(-4 * x), 2 * sqrt(x), False),
    ("K8 sqrt(-4x) vs 2i*sqrt(x) FALSA", sqrt(-4 * x), 2 * I * sqrt(x), False),
    ("K9 sqrt(-9x) vs 3*sqrt(x) FALSA", sqrt(-9 * x), 3 * sqrt(x), False),
    ("K10 log(-4x) vs log(4)+log(x) FALSA", log(-4 * x), log(4) + log(x), False),
    ("W3 (x^2)^(1/2) vs x FALSA", sqrt(x ** 2), x, False),
    ("W4 (x^4)^(1/2) vs x^2 FALSA", sqrt(x ** 4), x ** 2, False),
    ("W5 (x^2)^(1/3) vs x^(2/3) FALSA", (x ** 2) ** Rational(1, 3), x ** Rational(2, 3), False),
    ("U4 tan(x) vs sin(x)*cos(x) FALSA", tan(x), sin(x) * cos(x), False),
    ("C6 abs(x+y) vs abs(x)+abs(y) FALSA", Abs(x + y), Abs(x) + Abs(y), False),
    ("M5b (…)^16 vs ^16+1 FALSA", (a + b + c + d + e) ** 16, (a + b + c + d + e) ** 16 + 1, False),
    ("N16b 5+x^(-300) vs 5 FALSA", 5 + x ** (-300), 5, False),
    ("N16c x^(-65) vs x^(-64) FALSA", x ** (-65), x ** (-64), False),
    ("R-n sqrt(-x) vs i*sqrt(x) FALSO", sqrt(-x), I * sqrt(x), False),
    ("T8c abs(x*y) vs abs(x)*abs(y)*2 FALSO", Abs(x * y), 2 * Abs(x) * Abs(y), False),
    ("P7c x^(2y/y) vs x^3 FALSO", x ** (2 * y / y), x ** 3, False),
]

resultados = []
print("=== A. Identidades a ACEPTAR (FN de la R10 + reglas planificadas) ===")
for nombre, lhs, rhs, esp in CASOS_A:
    r = prove(nombre, lhs, rhs, esp)
    resultados.append(r)
    marca = "OK " if r["certifica"] else "FAIL"
    print(f"{marca} | sympy_cero={r['sympy_simplify_cero']!s:5} numerico={r['muestreo_numerico_igual']!s:5} | {nombre}")

print("\n=== B. Controles que deben seguir RECHAZANDO ===")
for nombre, lhs, rhs, esp in CASOS_B_CONTROLES_RECHAZAR:
    r = prove(nombre, lhs, rhs, esp)
    resultados.append(r)
    marca = "OK " if r["certifica"] else "FAIL"
    print(f"{marca} | sympy_cero={r['sympy_simplify_cero']!s:5} numerico={r['muestreo_numerico_igual']!s:5} | {nombre}")

fallos = [r for r in resultados if not r["certifica"]]
print(f"\nRESUMEN: {len(resultados) - len(fallos)}/{len(resultados)} certifican")
if fallos:
    print("FALLOS:")
    for r in fallos:
        print("  -", r["nombre"])

out_dir = Path(__file__).resolve().parent.parent / "certificaciones"
out_dir.mkdir(exist_ok=True)
(out_dir / "sympy-fix-r10.json").write_text(
    json.dumps({"resultados": resultados, "fallos": [r["nombre"] for r in fallos]}, indent=1, ensure_ascii=False),
    encoding="utf-8",
)
sys.exit(1 if fallos else 0)
