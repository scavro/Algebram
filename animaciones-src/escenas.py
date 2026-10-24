"""Animaciones del curso «Fundamentos Algebraicos para la IA».

Estas escenas se renderizan con ManimGX (https://manimgx.academa.ai/):
    manimgx render animaciones-src/escenas.py <Escena> -o assets/animaciones/<nombre>.mp4 -r 1280x720 --fps 30

Paleta del sitio: fondo #141209, texto crema #ece4cf, oro #c9a227.
"""

import manimgx as m

# ---- paleta del curso ----
BG = "#141209"
CREAM = "#ece4cf"
GOLD = "#c9a227"
MUTED = "#8a7f63"
OKC = "#7fa877"
BAD = "#c96a4a"
GRID = "#4c452f"

m.config.background_color = BG


def placa(obj):
    """Envuelve un mobject de texto con un fondo opaco para que nada lo atraviese."""
    fondo = m.BackgroundRectangle(obj, color=BG, buff=0.22)
    return m.VGroup(fondo, obj)


def titulo(texto: str, sub: str | None = None):
    t = m.Text(texto, color=CREAM, font_size=44)
    if sub:
        s = m.Text(sub, color=MUTED, font_size=28)
        s.next_to(t, m.DOWN, buff=0.35)
        return m.VGroup(t, s)
    return t


def reticula(ext: float = 3.2, paso: float = 1.0, color: str = GRID):
    """Rejilla de líneas (un VGroup al que se le puede aplicar apply_matrix)."""
    lineas = m.VGroup()
    k = int(ext / paso)
    for i in range(-k, k + 1):
        h = m.Line(m.LEFT * ext + m.UP * i * paso, m.RIGHT * ext + m.UP * i * paso)
        v = m.Line(m.UP * ext + m.RIGHT * i * paso, m.DOWN * ext + m.RIGHT * i * paso)
        for ln in (h, v):
            ln.set_stroke(color, width=1.2, opacity=0.55)
        lineas.add(h, v)
    return lineas


# =====================================================================
# TEMA II
# =====================================================================
class TransformacionLineal(m.Scene):
    """Una matriz transforma el plano: círculo → elipse, cuadrado → paralelogramo."""

    def construct(self) -> None:
        txt = titulo("Una matriz es una aplicación lineal", "El plano se deforma; las rectas siguen siendo rectas")
        self.play(m.FadeIn(txt), run_time=0.8)
        self.wait(1.2)
        self.play(m.FadeOut(txt))

        rejilla = reticula()
        ejes = m.VGroup(
            m.Arrow(m.LEFT * 3.2, m.RIGHT * 3.2, buff=0, color=CREAM, stroke_width=2),
            m.Arrow(m.DOWN * 3.2, m.UP * 3.2, buff=0, color=CREAM, stroke_width=2),
        )
        cuadrado = m.Polygon(
            m.ORIGIN, m.RIGHT, m.RIGHT + m.UP, m.UP,
            color=GOLD, fill_color=GOLD, fill_opacity=0.35, stroke_width=3,
        )
        u = m.Arrow(m.ORIGIN, m.RIGHT, buff=0, color=GOLD, stroke_width=6)
        v = m.Arrow(m.ORIGIN, m.UP, buff=0, color=OKC, stroke_width=6)
        etiqueta = m.MathTex(r"A = \begin{pmatrix} 2 & 1 \\ 0 & 1 \end{pmatrix}", color=CREAM)
        etiqueta = placa(etiqueta)
        etiqueta.to_corner(m.UR).shift(m.LEFT * 0.4)

        self.play(m.Create(rejilla), m.GrowArrow(ejes[0]), m.GrowArrow(ejes[1]), run_time=1.1)
        self.play(m.Create(cuadrado), m.GrowArrow(u), m.GrowArrow(v), m.Write(etiqueta))
        self.wait(0.8)

        A = [[2, 1], [0, 1]]
        copia = m.VGroup(rejilla.copy(), cuadrado.copy(), u.copy(), v.copy())
        self.play(
            rejilla.animate.apply_matrix(A),
            cuadrado.animate.apply_matrix(A),
            u.animate.apply_matrix(A),
            v.animate.apply_matrix(A),
            run_time=2.0,
        )
        nota = m.Text("Combinaciones lineales → combinaciones lineales", color=MUTED, font_size=30)
        nota = placa(nota)
        nota.to_edge(m.DOWN)
        self.play(m.FadeIn(nota))
        self.wait(1.8)


class GramSchmidt(m.Scene):
    """De dos vectores dependientes a una base ortogonal."""

    def construct(self) -> None:
        txt = titulo("Gram–Schmidt", "Restar la proyección produce ortogonalidad")
        self.play(m.FadeIn(txt), run_time=0.8)
        self.wait(1.0)
        self.play(m.FadeOut(txt))

        ejes = m.VGroup(
            m.Arrow(m.LEFT * 5 + m.DOWN * 2.4, m.RIGHT * 5 + m.DOWN * 2.4, buff=0, color=GRID, stroke_width=2),
        )
        O = m.DOWN * 2.4 + m.LEFT * 1.5
        u = m.Arrow(O, O + m.RIGHT * 4.2 + m.UP * 1.4, buff=0, color=GOLD, stroke_width=6)
        v = m.Arrow(O, O + m.RIGHT * 1.2 + m.UP * 3.2, buff=0, color=BAD, stroke_width=6)
        lu = m.MathTex(r"\mathbf{u}", color=GOLD).next_to(u.get_end(), m.DOWN)
        lv = m.MathTex(r"\mathbf{v}", color=BAD).next_to(v.get_end(), m.LEFT)

        self.play(m.GrowArrow(u), m.GrowArrow(v), m.Write(lu), m.Write(lv))
        self.wait(0.6)

        proy = m.Line(O, O + m.RIGHT * 2.1 + m.UP * 0.7, color=OKC, stroke_width=6)
        lproy = m.MathTex(r"\mathrm{proy}_{\mathbf{u}}(\mathbf{v})", color=OKC, font_size=36)
        lproy.next_to(proy, m.DOWN)
        self.play(m.Create(proy), m.Write(lproy))
        self.wait(0.6)

        w = m.Arrow(O, O + m.RIGHT * -0.9 + m.UP * 2.5, buff=0, color=OKC, stroke_width=6)
        lw = m.MathTex(r"\mathbf{v} - \mathrm{proy}_{\mathbf{u}}(\mathbf{v})", color=OKC, font_size=36)
        lw.next_to(w.get_end(), m.RIGHT)
        self.play(m.TransformFromCopy(v, w), m.Write(lw))
        self.wait(0.6)

        final = m.MathTex(r"\langle \mathbf{u},\, \mathbf{v} - \mathrm{proy}_{\mathbf{u}}(\mathbf{v}) \rangle = 0", color=CREAM)
        final = placa(final)
        final.to_edge(m.UP)
        self.play(m.Write(final))
        self.wait(2.0)


# =====================================================================
# TEMA IV
# =====================================================================
class EliminacionGauss(m.Scene):
    """La eliminación de Gauss triangula el sistema paso a paso."""

    def construct(self) -> None:
        txt = titulo("Eliminación de Gauss", "Cada paso: restar un múltiplo de una fila")
        self.play(m.FadeIn(txt), run_time=0.8)
        self.wait(1.0)
        self.play(m.FadeOut(txt))

        M = m.MathTex(
            r"\left(\begin{array}{ccc|c} 1 & 2 & -1 & 3 \\ 2 & 5 & 1 & 9 \\ 1 & -1 & 4 & 2 \end{array}\right)",
            color=CREAM,
        )
        self.play(m.Write(M))
        self.wait(0.8)

        paso1 = m.MathTex(r"F_2 \leftarrow F_2 - 2 F_1", color=GOLD)
        paso1.next_to(M, m.DOWN, buff=0.7)
        self.play(m.Write(paso1))
        M2 = m.MathTex(
            r"\left(\begin{array}{ccc|c} 1 & 2 & -1 & 3 \\ 0 & 1 & 3 & 3 \\ 1 & -1 & 4 & 2 \end{array}\right)",
            color=CREAM,
        )
        self.play(m.Transform(M, M2))
        self.wait(0.8)

        paso2 = m.MathTex(r"F_3 \leftarrow F_3 - F_1", color=GOLD)
        paso2.next_to(M, m.DOWN, buff=0.7)
        self.play(m.Transform(paso1, paso2))
        M3 = m.MathTex(
            r"\left(\begin{array}{ccc|c} 1 & 2 & -1 & 3 \\ 0 & 1 & 3 & 3 \\ 0 & -3 & 5 & -1 \end{array}\right)",
            color=CREAM,
        )
        self.play(m.Transform(M, M3))
        self.wait(0.8)

        paso3 = m.MathTex(r"F_3 \leftarrow F_3 + 3 F_2", color=GOLD)
        paso3.next_to(M, m.DOWN, buff=0.7)
        self.play(m.Transform(paso1, paso3))
        M4 = m.MathTex(
            r"\left(\begin{array}{ccc|c} 1 & 2 & -1 & 3 \\ 0 & 1 & 3 & 3 \\ 0 & 0 & 14 & 8 \end{array}\right)",
            color=OKC,
        )
        self.play(m.Transform(M, M4))
        nota = m.Text("Sistema triangular → sustitución hacia atrás", color=MUTED, font_size=32)
        nota = placa(nota)
        nota.to_edge(m.DOWN)
        self.play(m.FadeIn(nota))
        self.wait(2.0)


class MinimosCuadrados(m.Scene):
    """La recta de mínimos cuadrados minimiza la suma de residuos al cuadrado."""

    def construct(self) -> None:
        txt = titulo("Mínimos cuadrados", "La recta que minimiza la suma de errores al cuadrado")
        self.play(m.FadeIn(txt), run_time=0.8)
        self.wait(1.0)
        self.play(m.FadeOut(txt))

        ejes = m.Axes(
            x_range=[0, 6, 1], y_range=[0, 5, 1],
            x_length=8.5, y_length=5,
            axis_config={"color": GRID, "stroke_width": 2},
        )
        self.play(m.Create(ejes))

        puntos_dato = [(1, 1.2), (2, 2.1), (3, 2.9), (4, 4.1), (5, 4.8)]
        puntos = m.VGroup(*[m.Dot(ejes.c2p(x, y), color=CREAM, radius=0.09) for x, y in puntos_dato])
        self.play(m.LaggedStartMap(m.FadeIn, puntos, lag_ratio=0.25))

        m_ajuste, n_ajuste = 0.92, 0.36
        recta = ejes.plot(lambda x: m_ajuste * x + n_ajuste, x_range=[0.4, 5.6], color=GOLD, stroke_width=5)
        etiqueta = m.MathTex(r"y = 0{,}92\,x + 0{,}36", color=GOLD).to_corner(m.UR)
        self.play(m.Create(recta), m.Write(etiqueta))
        self.wait(0.5)

        residuos = m.VGroup()
        for x, y in puntos_dato:
            yr = m_ajuste * x + n_ajuste
            seg = m.Line(ejes.c2p(x, y), ejes.c2p(x, yr), color=BAD, stroke_width=3)
            residuos.add(seg)
        self.play(m.LaggedStartMap(m.Create, residuos, lag_ratio=0.2))
        nota = m.MathTex(r"\min_{m,n} \sum_{k} \bigl(y_k - (m x_k + n)\bigr)^2", color=CREAM)
        nota = placa(nota)
        nota.to_edge(m.DOWN)
        self.play(m.Write(nota))
        self.wait(2.0)


# =====================================================================
# TEMA V
# =====================================================================
class SVD(m.Scene):
    """A = U Σ Vᵀ: rotar, estirar, volver a rotar."""

    def construct(self) -> None:
        txt = titulo("Descomposición SVD", "Rotar · estirar · rotar")
        self.play(m.FadeIn(txt), run_time=0.8)
        self.wait(1.0)
        self.play(m.FadeOut(txt))

        circulo = m.Circle(radius=1.7, color=GOLD, stroke_width=4)
        puntos = m.VGroup(
            m.Dot(m.RIGHT * 1.7, color=CREAM, radius=0.08),
            m.Dot(m.UP * 1.7, color=OKC, radius=0.08),
        )
        rejilla = reticula(2.6, 0.87)
        escena = m.VGroup(rejilla, circulo, puntos)
        self.play(m.Create(rejilla), m.Create(circulo), m.FadeIn(puntos))
        self.wait(0.5)

        f1 = m.MathTex(r"V^{\top}", color=CREAM, font_size=40).to_edge(m.UP)
        self.play(m.Write(f1))
        self.play(escena.animate.rotate(-0.5), run_time=1.2)

        f2 = m.MathTex(r"\Sigma", color=CREAM, font_size=40).to_edge(m.UP)
        self.play(m.Transform(f1, f2))
        self.play(
            escena.animate.apply_matrix([[1.8, 0], [0, 0.6]]),
            run_time=1.4,
        )

        f3 = m.MathTex(r"U", color=CREAM, font_size=40).to_edge(m.UP)
        self.play(m.Transform(f1, f3))
        self.play(escena.animate.rotate(0.8), run_time=1.2)

        formula = m.MathTex(r"A = U \Sigma V^{\top}", color=GOLD, font_size=52)
        formula = placa(formula)
        formula.to_edge(m.DOWN)
        self.play(m.Write(formula))
        self.wait(2.0)


class TeoremaEspectral(m.Scene):
    """En una matriz simétrica, las direcciones propias solo cambian de longitud."""

    def construct(self) -> None:
        txt = titulo("Teorema espectral", "Las direcciones propias solo se escalan")
        self.play(m.FadeIn(txt), run_time=0.8)
        self.wait(1.0)
        self.play(m.FadeOut(txt))

        e1 = m.Arrow(m.ORIGIN, m.RIGHT * 2.4, buff=0, color=GOLD, stroke_width=6)
        e2 = m.Arrow(m.ORIGIN, m.UP * 1.6, buff=0, color=OKC, stroke_width=6)
        otro = m.Arrow(m.ORIGIN, m.RIGHT * 1.7 + m.UP * 1.2, buff=0, color=BAD, stroke_width=5)
        l1 = m.MathTex(r"\mathbf{v}_1", color=GOLD).next_to(e1, m.DOWN)
        l2 = m.MathTex(r"\mathbf{v}_2", color=OKC).next_to(e2, m.LEFT)
        l3 = m.MathTex(r"\mathbf{u}", color=BAD).next_to(otro, m.UR)

        self.play(m.GrowArrow(e1), m.GrowArrow(e2), m.GrowArrow(otro))
        self.play(m.Write(l1), m.Write(l2), m.Write(l3))
        self.wait(0.6)

        formula = m.MathTex(r"A = Q \Lambda Q^{\top}", color=CREAM, font_size=48)
        formula = placa(formula)
        formula.to_edge(m.UP)
        self.play(m.Write(formula))
        # A = rotación propia de la base espectral: solo escalado en v1 y v2
        self.play(
            e1.animate.scale(1.7),
            e2.animate.scale(0.65),
            m.Transform(otro, m.Arrow(m.ORIGIN, m.RIGHT * 1.1 + m.UP * 2.3, buff=0, color=BAD, stroke_width=5)),
            run_time=1.8,
        )
        nota = m.Text("u no es dirección propia: cambia de dirección", color=MUTED, font_size=30)
        nota = placa(nota)
        nota.to_edge(m.DOWN)
        self.play(m.FadeIn(nota))
        self.wait(2.0)
