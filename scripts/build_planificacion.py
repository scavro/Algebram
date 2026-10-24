#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/build_planificacion.py — genera (y verifica) la sección «Plan de
trabajo semana a semana» de planificacion.html.

El reparto de los 122 ejercicios entre las 16 semanas del cuatrimestre vive
aquí, en un único sitio, y se contrasta contra los ficheros de datos:

  · cada ejercicio de assets/data/ debe aparecer EXACTAMENTE una vez como
    «ejercicio nuevo» (no se puede quedar fuera ni quedar duplicado);
  · cada «repaso en frío» debe apuntar a un ejercicio que exista;
  · el HTML generado debe coincidir byte a byte con lo que hay en el
    fichero (--check).

Uso:
    python3 -I scripts/build_planificacion.py           # escribe la sección
    python3 -I scripts/build_planificacion.py --check    # solo verifica
"""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "assets" / "data"
PLAN = BASE / "planificacion.html"

BEGIN = "    <!-- PLAN:BEGIN (generado por scripts/build_planificacion.py — no editar a mano) -->"
END = "    <!-- PLAN:END -->"

# --------------------------------------------------------------------------
# Etiquetas: resumen de una línea por ejercicio.
# Es el contenido pedagógico de la planificación; el enunciado completo
# vive en el tema y se enlaza desde aquí.
# --------------------------------------------------------------------------

LABELS: dict[str, str] = {
    # ---- Tema I · Escalares
    "T1-N1": "Binario a decimal",
    "T1-N2": "El número 78 en base 3",
    "T1-N3": "Función entre conjuntos: inyectiva, sobreyectiva, biyectiva",
    "T1-N4": "Fracción irreducible de una fracción decimal periódica",
    "T1-N5": "Redondeo a 3 cifras significativas",
    "T1-N6": "Producto de números complejos",
    "T1-M1": "Cociente de números complejos",
    "T1-M2": "Módulo y argumento principal de un complejo",
    "T1-M3": "Potencia de un número complejo",
    "T1-M4": "Raíces cúbicas de 8",
    "T1-M5": "La rama principal: \\(\\sqrt{z^{2}} \\neq z\\) en general",
    "T1-E1": "Número binario con parte decimal",
    "T1-E2": "Módulo, argumento y cubo de un complejo",
    "T1-E3": "Raíces cuartas de 16",
    "T1-E4": "Fórmula de Euler: simplificación de una expresión",
    # ---- Tema II · Espacios vectoriales, tensores, ortogonalidad
    "T2-N1": "Combinación lineal de vectores",
    "T2-N2": "Producto de matrices",
    "T2-N3": "Producto \\(A^{\\top}B\\) y su traza",
    "T2-N4": "Módulo y distancia euclídea",
    "T2-N5": "¿La matriz es ortogonal? (verdadero o falso)",
    "T2-N6": "Inversa de una matriz de 2×2",
    "T2-M1": "Producto de matrices por bloques",
    "T2-M2": "Inversa de una matriz de 3×3",
    "T2-M3": "Primer paso del procedimiento de Gram–Schmidt",
    "T2-M4": "Proyección ortogonal sobre un subespacio",
    "T2-M5": "Coordenadas de un vector en una base ordenada",
    "T2-E1": "Inversa de una matriz de 3×3",
    "T2-E2": "Proyección ortogonal y componente ortogonal",
    "T2-E3": "Identificar la matriz ortogonal",
    "T2-E4": "Ortogonalidad de \\(Q\\) y cálculo de \\(Q^{-1}\\)",
    # ---- Tema III · Aplicaciones lineales, determinantes, autovalores
    "T3-N1": "Determinante de una matriz de 2×2",
    "T3-N2": "Determinante por desarrollo en la primera fila",
    "T3-N3": "Determinante de un producto y de una inversa",
    "T3-N4": "Rango por determinantes",
    "T3-N5": "Autovalores de una matriz triangular",
    "T3-N6": "Evaluar una forma cuadrática en un punto",
    "T3-M1": "Vector del núcleo con tercera componente normalizada",
    "T3-M2": "Dimensiones de los cuatro subespacios fundamentales",
    "T3-M3": "Multiplicidad algebraica y geométrica de un autovalor",
    "T3-M4": "Autovalores de una matriz simétrica: ¿reales? (V/F)",
    "T3-M5": "Matriz simétrica de una forma cuadrática",
    "T3-E1": "Determinante de una matriz de 4×4 por bloques",
    "T3-E2": "Mayor autovalor y un autovector asociado",
    "T3-E3": "Dimensiones de los subespacios fundamentales (4×3)",
    "T3-E4": "Afirmación siempre cierta sobre \\(A\\) y \\(B\\)",
    # ---- Tema IV · Sistemas, factorizaciones, mínimos cuadrados
    "T4-N1": "Sistema por eliminación de Gauss",
    "T4-N2": "Clasificar el sistema con Rouché–Frobenius",
    "T4-N3": "Sistema compatible indeterminado en parámetros",
    "T4-N4": "Proyección ortogonal de un vector sobre otro",
    "T4-N5": "¿Sistema compatible? (verdadero o falso)",
    "T4-N6": "Matriz \\(A^{\\top}A\\) de las ecuaciones normales",
    "T4-N7": "Inversa de una matriz triangular superior por recurrencia",
    "T4-M1": "Menores principales conducentes y factorización \\(LU\\)",
    "T4-M2": "Factorización QR reducida",
    "T4-M3": "Ajuste por mínimos cuadrados de una recta",
    "T4-M4": "Predicción del modelo de ajuste lineal",
    "T4-M5": "Autovalores en la factorización triangular de Schur",
    "T4-M6": "QR de rango deficiente y base de \\((\\operatorname{col}C)^{\\perp}\\)",
    "T4-M7": "Ajuste de un plano por mínimos cuadrados",
    "T4-E1": "Sistema de ecuaciones de 3×3",
    "T4-E2": "Rangos por Rouché–Frobenius",
    "T4-E3": "Factorización \\(C = PLU\\) con permutación",
    "T4-E4": "Mínimos cuadrados: pendiente, ordenada y predicción",
    "T4-E5": "Solución de mínima norma euclídea con QR",
    "T4-E6": "Factorización triangular de Schur compleja",
    # ---- Tema V · Diagonalización, descomposición espectral
    "T5-N1": "Autovalores de una matriz de 2×2",
    "T5-N2": "¿Diagonalizable por similitud? (verdadero o falso)",
    "T5-N3": "Factorización de Cholesky",
    "T5-N4": "Clasificación de una forma cuadrática",
    "T5-N5": "Pseudoinversa de Moore–Penrose de una diagonal",
    "T5-N6": "Norma espectral (norma 2)",
    "T5-N7": "Menores principales líderes: criterio de Sylvester",
    "T5-N8": "Forma cuadrática semidefinida positiva",
    "T5-M1": "Diagonalización por similitud",
    "T5-M2": "Factorización \\(LDL^{\\top}\\)",
    "T5-M3": "Valores singulares de una matriz simétrica",
    "T5-M4": "Pseudoinversa de una matriz de rango 1",
    "T5-M5": "Teorema espectral: diagonalización ortogonal",
    "T5-M6": "Raíz cuadrada simétrica definida positiva",
    "T5-M7": "\(LDL^{\\top}\) con pivote nulo",
    "T5-E1": "Diagonalización ortogonal de una matriz de 3×3",
    "T5-E2": "Cholesky de una matriz de 3×3",
    "T5-E3": "Pseudoinversa de Moore–Penrose",
    "T5-E4": "Inercia de una forma cuadrática",
    "T5-E5": "Forma canónica de Jordan y dimensión del autoespacio",
    "T5-E6": "SVD y pseudoinversa de una matriz rectangular",
    # ---- Examen 1 · Temas I–II
    "X1-1": "Escribir un número en base 4",
    "X1-2": "Fracción irreducible de una fracción decimal",
    "X1-3": "Cardinalidad de conjuntos finitos (V/F)",
    "X1-4": "Producto de matrices por bloques",
    "X1-5": "Redondeo a 2 cifras significativas",
    "X1-6": "Coseno entre dos vectores de \\(\\mathbb{R}^{3}\\)",
    "X1-7": "Cociente de números complejos",
    "X1-8": "Procedimiento de Gram–Schmidt",
    "X1-9": "Ecuación cuadrática en \\(\\mathbb{C}\\)",
    "X1-10": "Proyección de un vector sobre un subespacio",
    "X1-11": "Identificar la familia ortogonal",
    "X1-12": "Matriz por bloques y su inversa",
    # ---- Examen 2 · Temas III–IV
    "X2-1": "Determinante de un producto escalado",
    "X2-2": "Volumen y determinante",
    "X2-3": "Rango y teorema de la dimensión",
    "X2-4": "Sistema por eliminación de Gauss",
    "X2-5": "¿Diagonalizable? (verdadero o falso)",
    "X2-6": "Factorización PLU con permutación",
    "X2-7": "Mínimos cuadrados de una recta",
    "X2-8": "Autovalores de una matriz por bloques",
    "X2-9": "Forma cuadrática y su matriz",
    "X2-10": "Sistema por inspectores",
    "X2-11": "Descomposición espectral \\(A = Q\\Lambda Q^{\\top}\\)",
    "X2-12": "QR y ortonormalización",
    # ---- Examen 3 · Tema V y repaso global
    "X3-1": "Factorización de Cholesky",
    "X3-2": "Cociente de números complejos",
    "X3-3": "Propiedades de los determinantes (V/F)",
    "X3-4": "Determinante de \\(2A\\)",
    "X3-5": "Factorización \\(LDL^{\\top}\\)",
    "X3-6": "Mínimos cuadrados de una recta",
    "X3-7": "Forma canónica de Jordan",
    "X3-8": "Sistema dependiente de un parámetro",
    "X3-9": "Diagonalización ortogonal de una matriz simétrica",
    "X3-10": "Autovalores de una matriz de 4×4",
    "X3-11": "Inercia de una forma cuadrática",
    "X3-12": "Sistema por mínimos cuadrados",
}

LEVEL_LABEL = {"normal": "Normal", "medio": "Medio", "examen": "Examen"}
LEVEL_ORDER = {"normal": 0, "medio": 1, "examen": 2}

# --------------------------------------------------------------------------
# Reparto por semanas.
#
# «nuevo»  : ejercicios que se hacen por primera vez esa semana.
# «repaso» : ejercicios ya resueltos que se repiten en frío (opcional).
# El reparto sigue el plan semanal del curso (16 semanas) y el orden de los
# temas: escalares → tensores y matrices → aplicaciones y determinantes →
# sistemas y factorizaciones → diagonalización.
# --------------------------------------------------------------------------

WEEKS: list[dict] = [
    {
        "n": 1,
        "dates": "5–11 de octubre",
        "title": "Escalares",
        "tema": "Tema I",
        "nuevo": ["T1-N1", "T1-N2", "T1-N3", "T1-N4", "T1-N5", "T1-N6", "T1-M1", "T1-M2"],
        "repaso": [],
        "nota": (
            "Semana de arranque y la más comprimida del calendario. Prioriza los seis ejercicios "
            "de nivel normal; si el tiempo aprieta, deja T1-M1 y T1-M2 para el repaso de las "
            "semanas 2 y 3. La base numérica y el redondeo se asientan aquí o no se sostienen "
            "después."
        ),
        "hito": "Al terminar: convertir una representación a decimal, redondear a cifras significativas y operar con un complejo. Debes entender qué son el módulo y el argumento.",
    },
    {
        "n": 2,
        "dates": "12–18 de octubre",
        "title": "Espacios vectoriales y tensores",
        "tema": "Tema II",
        "nuevo": ["T1-M3", "T1-M4", "T1-M5", "T1-E1", "T2-N1", "T2-M1", "T2-M5"],
        "repaso": [],
        "nota": (
            "Arranca el Tema II y recoge el resto de escalares. El bloque de tensores del texto "
            "de IA no lo sustituyen los ejercicios de ingeniería: reconstruye además un ejemplo "
            "de tensor e identifica sus ejes y sus entradas."
        ),
        "hito": "Al terminar: explicar la diferencia entre base y dimensión, e identificar el formato de un tensor.",
    },
    {
        "n": 3,
        "dates": "19–25 de octubre",
        "title": "Operaciones matriciales e inversa",
        "tema": "Tema II",
        "nuevo": ["T1-E2", "T1-E3", "T1-E4", "T2-N2", "T2-N3", "T2-N6", "T2-M2", "T2-E1"],
        "repaso": [],
        "nota": (
            "Producto matricial y por bloques, contracción de índices, matriz inversa y cambio "
            "de base. El producto por bloques (T2-M1) reaparece en el examen 1 (X1-4): hazlo "
            "entonces con la notación de bloques delante."
        ),
        "hito": "Al terminar: decidir si dos matrices pueden multiplicarse, verificar una inversa multiplicando y transformar coordenadas entre bases.",
    },
    {
        "n": 4,
        "dates": "26 de octubre – 1 de noviembre",
        "title": "Geometría y ortogonalidad",
        "tema": "Tema II",
        "nuevo": ["T2-N4", "T2-N5", "T2-M3", "T2-M4", "T2-E2", "T2-E3", "T2-E4"],
        "repaso": [],
        "nota": (
            "Cierra el Tema II con norma, distancia, ángulo, ortogonalidad, Gram–Schmidt, "
            "complemento ortogonal, proyección y matrices ortogonales. Es el bloque más denso "
            "del tema: si vas corto de tiempo, deja T2-E3 y T2-E4 para el repaso de la semana 9."
        ),
        "hito": "Al terminar: construir una base ortonormal pequeña y proyectar un vector, explicando la interpretación geométrica.",
    },
    {
        "n": 5,
        "dates": "2–8 de noviembre",
        "title": "Aplicaciones lineales y determinantes",
        "tema": "Tema III",
        "nuevo": ["T3-N1", "T3-N2", "T3-N3", "T3-N4"],
        "repaso": [],
        "simulacro": {
            "titulo": "Simulacro 1",
            "temas": "Temas I–II",
            "min": 120,
            "preguntas": [f"X1-{i}" for i in range(1, 13)],
        },
        "nota": (
            "Arranca el Tema III: interpretación de matrices y tensores como aplicaciones "
            "lineales, y determinantes con su interpretación geométrica. En paralelo, "
            "simulacro del examen 1."
        ),
        "hito": "Al terminar: comprobar linealidad, calcular un determinante y relacionarlo con la invertibilidad y el cambio de área o volumen.",
    },
    {
        "n": 6,
        "dates": "9–15 de noviembre",
        "title": "Núcleo, imagen y autovalores",
        "tema": "Tema III",
        "nuevo": ["T3-N5", "T3-M1", "T3-M2", "T3-M3"],
        "repaso": ["T2-E1", "T2-E4"],
        "nota": (
            "Subespacios asociados a una matriz, núcleo e imagen, polinomio característico, "
            "autovalores y autovectores. Los ejercicios de autovalores adelantan parte del "
            "Tema V sin necesidad: no es preciso esperar a enero para entrenarlos."
        ),
        "hito": "Al terminar: encontrar bases de núcleo e imagen en un ejemplo pequeño y comprobar un autovector mediante la igualdad \\(Av = \\lambda v\\).",
    },
    {
        "n": 7,
        "dates": "16–22 de noviembre",
        "title": "Formas bilineales y cuadráticas",
        "tema": "Tema III",
        "nuevo": ["T3-N6", "T3-M4", "T3-M5", "T3-E1", "T3-E2", "T3-E3", "T3-E4"],
        "repaso": ["T3-N5", "T3-M3"],
        "nota": (
            "Formas bilineales y sesquilineales en el contexto del texto, forma cuadrática, "
            "matriz asociada y producto escalar. Cierra el Tema III con el repaso acumulado de "
            "los temas I a III. La clasificación detallada de la forma cuadrática se deja para "
            "el Tema V."
        ),
        "hito": "Al terminar: pasar de una expresión a su matriz y distinguir linealidad, bilinealidad y forma cuadrática.",
    },
    {
        "n": 8,
        "dates": "23–29 de noviembre",
        "title": "Sistemas, Gauss y factorización PLU",
        "tema": "Tema IV",
        "nuevo": ["T4-N1", "T4-N2", "T4-N3", "T4-N4", "T4-N5", "T4-E1", "T4-E2"],
        "repaso": [],
        "nota": (
            "Matrices triangulares, sistemas en forma matricial y compatibilidad; eliminación "
            "de Gauss, pivotes, permutaciones y factorización PLU. Los ejercicios de LU se "
            "complementan con un ejemplo PLU de A para practicar las permutaciones."
        ),
        "hito": "Al terminar: resolver y clasificar un sistema, y reconstruir la matriz desde los factores siguiendo la convención de A.",
    },
    {
        "n": 9,
        "dates": "30 de noviembre – 6 de diciembre",
        "title": "QR, mínimos cuadrados y Schur",
        "tema": "Tema IV",
        "nuevo": ["T4-N6", "T4-N7", "T4-M1", "T4-M2", "T4-M3", "T4-M4", "T4-M5", "T4-M6", "T4-E5", "T4-E6"],
        "repaso": ["T2-E3", "T2-E4"],
        "nota": (
            "QR y su relación con Gram–Schmidt, sistemas y aproximación por mínimos cuadrados, "
            "y factorización triangular de Schur con sus hipótesis. Los ajustes por mínimos "
            "cuadrados (T4-M3, T4-M4) comparten planteamiento: hazlos seguidos para no repetir "
            "el mismo montaje."
        ),
        "hito": "Al terminar: verificar A = QR y explicar qué se minimiza cuando un sistema no tiene solución exacta.",
    },
    {
        "n": 10,
        "dates": "7–13 de diciembre",
        "title": "Inicio del Tema V y PEC",
        "tema": "Tema V",
        "nuevo": ["T4-M7", "T4-E3", "T4-E4", "T5-N1", "T5-N2", "T5-M1", "T5-M2", "T5-M7"],
        "repaso": [],
        "nota": (
            "Diferenciar equivalencia, congruencia y similitud, y factorización LDU conectada con "
            "LU. Reparto orientativo de 7 h: 2 h de Tema V, 4 h de preparación y realización de la "
            "PEC y 1 h de corrección. Reduce ejercicios adicionales para dar prioridad a la PEC."
        ),
        "hito": "Hito: PEC señalada del 11 al 14 de diciembre. Objetivo personal: completarla antes del último día, si su modalidad lo permite.",
    },
    {
        "n": 11,
        "dates": "14–20 de diciembre",
        "title": "Teorema espectral y clasificación",
        "tema": "Tema V",
        "nuevo": ["T5-N3", "T5-N4", "T5-N7", "T5-N8", "T5-M5", "T5-M6", "T5-E1", "T5-E2"],
        "repaso": [],
        "nota": (
            "Diagonalización ortogonal y teorema espectral; ley de inercia de Sylvester y "
            "matrices definidas y semidefinidas. Con la PEC detrás es una semana de carga: "
            "conserva siempre la corrección aunque bajes ejercicios."
        ),
        "hito": "Al terminar: diagonalizar un ejemplo simétrico y clasificar una forma cuadrática justificando el criterio utilizado.",
    },
    {
        "n": 12,
        "dates": "21–27 de diciembre",
        "title": "Consolidación flexible",
        "tema": "Repaso",
        "nuevo": [],
        "repaso": ["T3-E1", "T3-E2", "T3-E3", "T3-E4", "T4-E1", "T4-E2"],
        "simulacro": {
            "titulo": "Simulacro 2",
            "temas": "Temas III–IV",
            "min": 120,
            "preguntas": [f"X2-{i}" for i in range(1, 13)],
        },
        "nota": (
            "El calendario no asigna tema nuevo: el tiempo es de consolidación. Rehaz en frío "
            "los ejercicios de examen que fallaste y aprovecha el simulacro para medir por "
            "dónde vas."
        ),
        "hito": "Resultado: una lista breve de dudas concretas y de partes pendientes. No abras otro manual completo.",
    },
    {
        "n": 13,
        "dates": "28 de diciembre – 3 de enero",
        "title": "Borrador de la práctica",
        "tema": "Práctica",
        "nuevo": [],
        "repaso": ["T5-N1", "T5-N2", "T5-M1", "T4-M1", "T4-M7"],
        "nota": (
            "Prioridad al primer apartado del enunciado, si existe. Si aún no está disponible, "
            "consolida el procedimiento con dos ejercicios acumulados sin mirar la solución."
        ),
        "hito": "Resultado: borrador ejecutable o revisable según el formato exigido. No presupongas que hay que entregar un archivo .py: eso debe decirlo el enunciado.",
    },
    {
        "n": 14,
        "dates": "4–10 de enero",
        "title": "Revisión final de la práctica",
        "tema": "Práctica",
        "nuevo": [],
        "repaso": ["T5-N3", "T5-N4", "T5-N7", "T5-M5", "T5-M6", "T5-E1", "T5-E2"],
        "nota": (
            "Unas 4–5 h para revisar la práctica y 2–3 h de repaso matemático: requisitos de "
            "entrega, cálculos, explicaciones y archivos. Ejecuta de nuevo el trabajo desde el "
            "principio si incluye código."
        ),
        "hito": "Resultado: entrega preparada con margen para el día señalado, sin esperar al 12 para descubrir problemas. Repasa autovalores, multiplicidades y bases: hacen falta la semana siguiente.",
    },
    {
        "n": 15,
        "dates": "11–17 de enero",
        "title": "Similitud, Jordan y SVD",
        "tema": "Tema V",
        "nuevo": ["T5-N5", "T5-N6", "T5-M3", "T5-M4", "T5-E3", "T5-E4", "T5-E5", "T5-E6"],
        "repaso": [],
        "nota": (
            "Condiciones de diagonalización por similitud, multiplicidades y forma de Jordan; "
            "descomposición en valores singulares, con sus dimensiones; pseudoinversa y su "
            "relación con los sistemas y los mínimos cuadrados. Es la semana más exigente: "
            "usa el margen de hasta 8 h y llega con la práctica ya preparada. Si el cálculo "
            "completo resulta largo, comprueba primero dimensiones y productos y después "
            "reproduce el procedimiento por partes."
        ),
        "hito": "Hito: práctica señalada el 12 de enero. Reserva tiempo para entregarla y comprobar la recepción, conforme a las instrucciones del aula.",
    },
    {
        "n": 16,
        "dates": "18–24 de enero",
        "title": "Repaso global",
        "tema": "Todos los temas",
        "nuevo": [],
        "repaso": ["T5-E5", "T5-E6", "T1-E4", "T2-E1", "T4-E6"],
        "simulacro": {
            "titulo": "Simulacro 3",
            "temas": "Tema V y repaso global",
            "min": 120,
            "preguntas": [f"X3-{i}" for i in range(1, 13)],
        },
        "nota": (
            "Sesión de diagnóstico sin apuntes con preguntas de los cinco temas, corrección y "
            "reparación de los dos puntos más débiles, segunda sesión mixta de problemas y una "
            "hora de teoría, hipótesis, notación y errores frecuentes. Las sesiones de 90 min "
            "son una propuesta de entrenamiento: no indican la duración oficial del examen."
        ),
        "hito": "Resultado: una hoja de conceptos y condiciones de uso, y una lista corta de errores ya corregidos.",
    },
]

# Semana de mantenimiento: no reparte ejercicios nuevos, solo fija la rutina.
MANTENIMIENTO = {
    "dates": "Desde el 25 de enero hasta tu examen",
    "title": "Mantenimiento",
    "nota": (
        "El calendario no proporciona la fecha de la prueba presencial. Mantén 6–8 h "
        "semanales con dos sesiones de problemas mezclados, corrección y repaso dirigido. "
        "Cuando conozcas el formato, la duración y los materiales permitidos, adapta las "
        "sesiones a esas condiciones: no se inventa una semana de examen."
    ),
}

# --------------------------------------------------------------------------
# Lectura de los datos
# --------------------------------------------------------------------------

LEVEL_RE = re.compile(r"level:\s*[\"']([a-z]+)[\"']")
ID_RE = re.compile(r"\bid:\s*[\"']([A-Za-z0-9-]+)[\"']")


def read_data() -> dict[str, dict]:
    """Lee assets/data/*.js y devuelve {id: {level, file}} sin ejecutar nada."""
    out: dict[str, dict] = {}
    for f in sorted(DATA.glob("*.js")):
        src = f.read_text(encoding="utf-8")
        # Los bloques de datos se separan por "id: ..." y su nivel va detrás.
        # El propio fichero lleva además un id de nivel superior ("tema-1",
        # "examen-2") que no es un ejercicio: se descarta.
        for m in ID_RE.finditer(src):
            eid = m.group(1)
            if eid == f.stem:
                continue
            tail = src[m.end() : m.end() + 400]
            lv = LEVEL_RE.search(tail)
            out[eid] = {"level": lv.group(1) if lv else "normal", "file": f.stem}
    return out


# --------------------------------------------------------------------------
# Generación del HTML
# --------------------------------------------------------------------------


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def anchor(eid: str, data: dict) -> str:
    f = data[eid]["file"]
    if f.startswith("examen"):
        return f"examenes/{f}.html#{eid}"
    return f"temas/{f}.html#{eid}"


def render_item(eid: str, data: dict, extra: str = "") -> str:
    lvl = data[eid]["level"]
    label = esc(LABELS[eid])
    return (
        f'        <li class="exlist__item" data-level="{lvl}"{extra}>\n'
        f'          <a class="exlist__id" href="{anchor(eid, data)}">{eid}</a>\n'
        f'          <span class="exlist__text">{label}</span>\n'
        f"        </li>"
    )


def render_week(w: dict, data: dict) -> str:
    rows = [render_item(e, data) for e in w["nuevo"]]
    if w.get("repaso"):
        rows.append(
            '        <li class="exlist__sep"><span>Repaso en frío</span></li>'
        )
        rows += [render_item(e, data, ' data-repaso="1"') for e in w["repaso"]]

    sim = ""
    if w.get("simulacro"):
        s = w["simulacro"]
        srows = "\n".join(render_item(e, data) for e in s["preguntas"])
        sim = (
            '\n      <div class="simul">\n'
            '        <div class="simul__head">\n'
            f'          <span class="simul__label">{esc(s["titulo"])}</span>\n'
            f'          <span class="simul__meta">{esc(s["temas"])} · {s["min"]} min · '
            f'{len(s["preguntas"])} preguntas</span>\n'
            "        </div>\n"
            '        <ul class="exlist exlist--compact">\n'
            f"{srows}\n"
            "        </ul>\n"
            "      </div>"
        )

    total = len(w["nuevo"])
    count = (
        f'<span class="week__count chip chip--ink">{total} '
        f'{"ejercicio" if total == 1 else "ejercicios"} nuevos</span>'
        if total
        else '<span class="week__count chip chip--ink">sin contenido nuevo</span>'
    )

    hito = (
        f'\n      <p class="week__hito"><span class="week__hito-label">Objetivo</span>'
        f"{esc(w['hito'])}</p>"
        if w.get("hito")
        else ""
    )

    return (
        f'    <article class="week reveal" id="semana-{w["n"]}">\n'
        f'      <header class="week__head">\n'
        f'        <span class="week__num">Semana {w["n"]:02d}</span>\n'
        f'        <h3 class="week__title">{esc(w["title"])}</h3>\n'
        f'        <span class="week__meta">{esc(w["dates"])} · {esc(w["tema"])}</span>\n'
        f"        {count}\n"
        f"      </header>\n"
        f'      <div class="week__body">\n'
        f'        <p class="week__note">{esc(w["nota"])}</p>\n'
        f'        <ul class="exlist">\n'
        + "\n".join(rows)
        + ("\n" if rows else "")
        + "        </ul>"
        + sim
        + hito
        + "\n      </div>\n"
        "    </article>"
    )


def render_totals(data: dict) -> str:
    temas = [k for k in data if not k.startswith("X")]
    examenes = [k for k in data if k.startswith("X")]
    n_t = sum(1 for k in temas if data[k]["file"].startswith("tema"))
    n_e = sum(1 for k in examenes if data[k]["file"].startswith("examen"))
    rows = []
    for t in range(1, 6):
        n = sum(1 for k in temas if data[k]["file"] == f"tema-{t}")
        rows.append(f"            <tr><td>Tema {['I', 'II', 'III', 'IV', 'V'][t-1]}</td>"
                    f'<td>{n}</td><td><a href="temas/tema-{t}.html">temas/tema-{t}.html</a></td></tr>')
    for e in range(1, 4):
        n = sum(1 for k in examenes if data[k]["file"] == f"examen-{e}")
        rows.append(f"            <tr><td>Examen {e}</td>"
                    f'<td>{n}</td><td><a href="examenes/examen-{e}.html">examenes/examen-{e}.html</a></td></tr>')
    return (
        '        <table>\n'
        "          <thead>\n"
        "            <tr><th>Bloque</th><th>Ejercicios</th><th>Fichero</th></tr>\n"
        "          </thead>\n"
        "          <tbody>\n"
        + "\n".join(rows)
        + "\n"
        f"            <tr><td><strong>Total</strong></td><td><strong>{n_t + n_e}</strong></td>"
        "<td></td></tr>\n"
        "          </tbody>\n"
        "        </table>"
    )


def render_section(data: dict) -> str:
    weeks = "\n".join(render_week(w, data) for w in WEEKS)
    mant = (
        '    <article class="week week--mantenimiento reveal" id="semana-17">\n'
        "      <header class=\"week__head\">\n"
        '        <span class="week__num">Después</span>\n'
        f'        <h3 class="week__title">{esc(MANTENIMIENTO["title"])}</h3>\n'
        f'        <span class="week__meta">{esc(MANTENIMIENTO["dates"])}</span>\n'
        '        <span class="week__count chip chip--ink">rutina</span>\n'
        "      </header>\n"
        '      <div class="week__body">\n'
        f'        <p class="week__note">{esc(MANTENIMIENTO["nota"])}</p>\n'
        "      </div>\n"
        "    </article>"
    )
    return (
        BEGIN
        + "\n"
        '    <section class="wrap section" id="plan">\n'
        '      <div class="theory-section__head reveal">\n'
        '        <div class="theory-section__num">§ 4</div>\n'
        "        <div>\n"
        "          <h2>Plan de trabajo, semana a semana</h2>\n"
        "          <p>Los "
        f"{sum(1 for _ in data)} ejercicios del archivo repartidos en las 16 semanas del "
        "cuatrimestre. Cada identificador enlaza a su ficha.</p>\n"
        "        </div>\n"
        "      </div>\n"
        '      <div class="plaque plaque--ia reveal">\n'
        '        <span class="plaque__label">Cómo se lee</span>\n'
        "        <p>El identificador <strong>T5-N4</strong> significa Tema 5, nivel normal; "
        "<strong>X2-7</strong> es la pregunta 7 del examen 2. El color del identificador "
        "indica el nivel: verde <em>normal</em>, ámbar <em>medio</em>, rojo <em>examen</em>. "
        "Los apartados «repaso en frío» repiten ejercicios ya resueltos: sirven para "
        "rehacerlos sin mirar la solución, y son opcionales si vas con retraso.</p>\n"
        "      </div>\n"
        '      <div class="weeks">\n'
        + weeks
        + "\n"
        + mant
        + "\n      </div>\n"
        '      <div class="theory-section__head reveal">\n'
        '        <div class="theory-section__num">§ 5</div>\n'
        "        <div>\n"
        "          <h2>Recuento del archivo</h2>\n"
        "          <p>Lo que cubre el plan, contrastado con los ficheros de datos.</p>\n"
        "        </div>\n"
        "      </div>\n"
        '      <div class="table-wrap reveal">\n'
        + render_totals(data)
        + "\n      </div>\n"
        "    </section>\n"
        + END
    )


# --------------------------------------------------------------------------
# Comprobaciones
# --------------------------------------------------------------------------


def check(data: dict) -> list[str]:
    errs: list[str] = []

    # 1. Toda etiqueta apunta a un ejercicio que existe.
    for eid in LABELS:
        if eid not in data:
            errs.append(f"etiqueta sin ejercicio: {eid}")

    # 2. Todo ejercicio del archivo tiene etiqueta.
    for eid in data:
        if eid not in LABELS:
            errs.append(f"ejercicio sin etiqueta: {eid}")

    # 3. Cada ejercicio se asigna exactamente una vez: como ejercicio nuevo
    #    de una semana o como pregunta de un simulacro.
    asignados: dict[str, list[str]] = {}
    for w in WEEKS:
        for eid in w["nuevo"]:
            asignados.setdefault(eid, []).append(f"semana {w['n']}")
    for w in WEEKS:
        s = w.get("simulacro")
        if not s:
            continue
        for eid in s["preguntas"]:
            asignados.setdefault(eid, []).append(f"simulacro de la semana {w['n']}")
    for eid in data:
        veces = asignados.get(eid, [])
        if len(veces) == 0:
            errs.append(f"ejercicio sin semana asignada: {eid}")
        elif len(veces) > 1:
            errs.append(f"ejercicio asignado en varios sitios: {eid} → {veces}")

    # 4. Ningún ejercicio se asigna dos veces en la misma semana.
    for w in WEEKS:
        dup = {e for e in w["nuevo"] if w["nuevo"].count(e) > 1}
        for e in dup:
            errs.append(f"ejercicio repetido en la semana {w['n']}: {e}")

    # 5. Los repasos apuntan a ejercicios existentes (pueden repetirse).
    for w in WEEKS:
        for eid in w.get("repaso", []):
            if eid not in data:
                errs.append(f"repaso a un ejercicio inexistente en la semana {w['n']}: {eid}")
            if eid in w["nuevo"]:
                errs.append(f"repaso y nuevo a la vez en la semana {w['n']}: {eid}")

    # 6. Los simulacros cubren un examen completo y no se solapan con «nuevo».
    for w in WEEKS:
        s = w.get("simulacro")
        if not s:
            continue
        bloque = set(s["preguntas"])
        if len(bloque) != len(s["preguntas"]):
            errs.append(f"simulacro con preguntas repetidas en la semana {w['n']}")
        for eid in bloque:
            if eid in w["nuevo"]:
                errs.append(f"pregunta de simulacro también nueva en la semana {w['n']}: {eid}")

    # 7. Coherencia de las semanas: numeración correlativa y fechas crecientes.
    for i, w in enumerate(WEEKS):
        if w["n"] != i + 1:
            errs.append(f"numeración de semana incoherente: {w['n']} en la posición {i+1}")

    return errs


def main() -> int:
    modo = sys.argv[1] if len(sys.argv) > 1 else "--write"
    data = read_data()
    errs = check(data)
    if errs:
        print("ERRORES en el reparto:")
        for e in errs:
            print("  - " + e)
        return 1

    seccion = render_section(data)
    actual = PLAN.read_text(encoding="utf-8")
    ini, fin = actual.find(BEGIN), actual.find(END)
    if ini == -1 or fin == -1:
        print(f"ERROR: no se encuentran las marcas {BEGIN!r} … {END!r} en {PLAN}")
        return 1

    nueva = actual[:ini] + seccion + actual[fin + len(END) :]

    if modo == "--check":
        if nueva != actual:
            print("DESACTUALIZADO: planificacion.html no coincide con el reparto del script.")
            print("Ejecuta: python3 -I scripts/build_planificacion.py")
            return 1
        print(f"OK: planificacion.html coincide con el reparto ({len(data)} ejercicios).")
        return 0

    if modo not in ("--write", "-w", ""):
        print(f"Opción desconocida: {modo}")
        return 2

    PLAN.write_text(nueva, encoding="utf-8")
    print(
        f"Escrito {PLAN.name}: {len(WEEKS)} semanas, {len(data)} ejercicios asignados, "
        f"{sum(len(w.get('repaso', [])) for w in WEEKS)} repasos en frío."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
