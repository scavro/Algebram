"""ÁRBITRO R1 · utilidad común: convierte texto del data a expresión sympy,
interpretando 'i' como unidad imaginaria (como hace el grader del curso)."""
import sympy as sp

def sx(s):
    return sp.sympify(str(s), locals={"i": sp.I, "I": sp.I, "pi": sp.pi, "e": sp.E})
