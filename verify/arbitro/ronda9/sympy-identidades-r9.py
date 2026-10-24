# -*- coding: utf-8 -*-
"""Certificación sympy de las identidades VERDADERAS usadas como FN en R9."""
import sympy as sp
x, y = sp.symbols('x y')
I = sp.I
R = sp.Rational
ok = fail = 0
def cert(nombre, a, b):
    global ok, fail
    d = sp.simplify(a - b)
    bien = (d == 0)
    print(("OK  " if bien else "FALLO") + f" | {nombre}: diff = {d}")
    ok += bien; fail += (not bien)

cert("sqrt(4x)=2sqrt(x)", sp.sqrt(4*x), 2*sp.sqrt(x))
cert("log(4x)=log4+logx", sp.log(4*x), sp.log(4)+sp.log(x))
cert("log(sqrt(x))=log(x)/2", sp.log(sp.sqrt(x)), sp.log(x)/2)
cert("sqrt(9x)=3sqrt(x)", sp.sqrt(9*x), 3*sp.sqrt(x))
cert("x^(3/2)=x*sqrt(x)", x**R(3,2), x*sp.sqrt(x))
cert("x^(2/3)=(x^(1/3))^2", x**R(2,3), (x**R(1,3))**2)
cert("x^(-1/2)=1/sqrt(x)", x**R(-1,2), 1/sp.sqrt(x))
cert("(sqrt(x))^4=x^2", (sp.sqrt(x))**4, x**2)
cert("tan=sin/cos", sp.tan(x), sp.sin(x)/sp.cos(x))
cert("abs(x)^2=x*conj(x)", sp.Abs(x)**2, x*sp.conjugate(x))
cert("conj(x-y)=conj(x)-conj(y)", sp.conjugate(x-y), sp.conjugate(x)-sp.conjugate(y))
cert("conj(-x)=-conj(x)", sp.conjugate(-x), -sp.conjugate(x))
cert("conj(x)+x=2re(x)", sp.conjugate(x)+x, 2*sp.re(x))
cert("abs(xy)=abs(x)abs(y)", sp.Abs(x*y), sp.Abs(x)*sp.Abs(y))
cert("conj(x^2)=conj(x)^2", sp.conjugate(x**2), sp.conjugate(x)**2)
cert("im(x)=(x-conj(x))/(2i)", sp.im(x), (x-sp.conjugate(x))/(2*I))
cert("x^(2y/y)=x^2 (y!=0)", x**(2*y/y), x**2)
cert("min(x,y)=min(y,x) — simbólico no aplica, ver eval", sp.Min(x, y), sp.Min(y, x))
print(f"\nRESUMEN sympy identidades: {ok} OK · {fail} FALLOS")
import pathlib, json
json.dump({"ok": int(ok), "fail": int(fail)}, open(pathlib.Path(__file__).parent / "sympy-identidades-r9-math.json","w"))
raise SystemExit(1 if fail else 0)
