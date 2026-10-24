# Algebram · Fundamentos Algebraicos para la IA

Curso web estático e interactivo de **Fundamentos Algebraicos para la IA**, organizado a partir del temario de la UNED. Reúne teoría, ejemplos, resúmenes, mapas mentales, ejercicios autocorregidos, exámenes y una planificación de 16 semanas.

> **Proyecto personal generado con ayuda de inteligencia artificial.** No es un recurso oficial ni está vinculado institucionalmente con la UNED. Conviene contrastar fechas, evaluación y contenidos con el aula virtual.

## Contenido

- **5 temas** con teoría, demostraciones y ejemplos resueltos.
- **122 ejercicios** en tres niveles: normal, medio y examen.
- **3 exámenes** de 12 preguntas, con temporizador y calificación sobre 10.
- Resúmenes y mapas mentales interactivos.
- Corrección matemática en el navegador, incluidas expresiones, matrices, vectores y conjuntos de soluciones.
- Planificación semanal enlazada con todos los ejercicios.
- Animaciones con subtítulos, fórmulas con KaTeX y tipografías locales.
- Funcionamiento sin conexión y sin servicios externos; el progreso se guarda únicamente en el navegador.

## Empezar

No hay que compilar el curso ni instalar dependencias para estudiar.

### Abrir directamente

Abre [`index.html`](index.html) en un navegador moderno.

### Servirlo en local (recomendado)

Desde la raíz del repositorio:

```bash
python3 -m http.server 8000
```

Después visita <http://localhost:8000>.

## Índice del curso

| Bloque | Contenido |
| --- | --- |
| [Tema 1](temas/tema-1.html) | Escalares |
| [Tema 2](temas/tema-2.html) | Tensores, matrices y vectores |
| [Tema 3](temas/tema-3.html) | Aplicaciones lineales |
| [Tema 4](temas/tema-4.html) | Procesos de triangulación |
| [Tema 5](temas/tema-5.html) | Procesos de diagonalización |
| [Examen 1](examenes/examen-1.html) | Temas 1 y 2 |
| [Examen 2](examenes/examen-2.html) | Temas 3 y 4 |
| [Examen 3](examenes/examen-3.html) | Tema 5 y repaso global |
| [Planificación](planificacion.html) | Calendario, evaluación y plan de 16 semanas |

## Cómo responder

El motor admite, entre otras, las siguientes notaciones:

- Multiplicación: `2*x` o `2x`.
- Potencias: `x^2`.
- Raíces: `sqrt(2)`.
- Constantes: `pi`, `π`, `e` e `i`.
- Decimales con punto o coma: `3.14` o `3,14`.
- Matrices y vectores: se cumplimentan celda a celda.

El progreso de los ejercicios se almacena en `localStorage` y el temporizador de cada examen en `sessionStorage`. No se envían respuestas ni datos personales a ningún servidor. Borrar los datos del sitio en el navegador elimina ese progreso.

## Estructura

```text
index.html                    Portada
planificacion.html            Calendario, evaluación y plan semanal
temas/                        Páginas de los cinco temas
examenes/                     Tres exámenes interactivos
assets/
  css/                        Estilos y tipografías
  data/                       Contenido y respuestas de los ejercicios
  js/                         Interfaz y motor de corrección
  animaciones/                Vídeos, storyboards y subtítulos
  vendor/katex/               KaTeX para renderizado matemático local
docs/                         Guía editorial, plantillas y auditorías
scripts/                      Generadores de subtítulos y planificación
tests/                        Pruebas del motor y validación de los bancos
verify/                       Verificación matemática y pruebas adversariales
wrangler.jsonc                Configuración de Cloudflare Workers
.assetsignore                 Archivos excluidos de la publicación web
```

Los PDF y demás documentos fuente de `materiales/`, junto con las notas personales, se mantienen fuera del repositorio y de la publicación.

## Verificación

Requisitos: **Node.js**, **Python 3** y **SymPy**.

```bash
# Motor de corrección y recuentos visibles
npm test

# Estructura y respuestas de los cinco temas y los tres exámenes
for i in 1 2 3 4 5; do
  node tests/lint-tema.js "temas/tema-$i.html" "assets/data/tema-$i.js"
done
for i in 1 2 3; do
  node tests/lint-tema.js "examenes/examen-$i.html" "assets/data/examen-$i.js"
done

# Comprobación matemática con SymPy
for f in verify/tema-{1,2,3,4,5}-verify.py verify/examen-{1,2,3}-verify.py; do
  python3 -I "$f"
done
python3 -I verify/crosscheck-expected.py
python3 -I verify/sympy-fix-r10.py

# Generadores: comprueban que no falten cambios por regenerar
python3 -I scripts/build_subtitulos.py --check
python3 -I scripts/build_planificacion.py --check

# Batería adversarial de la ronda 12
node verify/arbitro/ronda12/ataques-r12.js
python3 -I verify/arbitro/ronda12/certificar-r12.py
```

El alcance, los resultados y las limitaciones de la autoauditoría están documentados en [`INFORME-VERIFICACION.md`](INFORME-VERIFICACION.md). Las comprobaciones automáticas reducen errores, pero no sustituyen una revisión docente externa.

## Publicar en Cloudflare Workers

El sitio usa **Workers Static Assets**, sin código de servidor ni base de datos. La configuración excluye pruebas, auditorías, documentación y materiales fuente: solo se suben los archivos necesarios para el curso.

```bash
npm ci
npm run dev                 # vista previa local con Wrangler
npx wrangler login          # solo la primera vez
npm run deploy:dry-run      # valida la configuración y el empaquetado
npm run deploy              # publica en <nombre-del-worker>.workers.dev
```

El despliegue es compatible con el plan gratuito de Cloudflare para este tipo de sitio estático; el uso efectivo sigue sujeto a los límites vigentes del servicio.

## Fuentes y atribución

El contenido se elaboró a partir de los apuntes de la asignatura de Juan Perán Mazón (UNED), material de *Álgebra para Ingenieros* y la información de evaluación del aula. KaTeX y las tipografías se distribuyen localmente con sus respectivos avisos de licencia.
