# AGENTS.md

Guía para cualquier agente de código (Claude Code, OpenCode, Codex…) que trabaje en este repositorio.

Este archivo cubre **solo la verificación de documentación de dependencias** y las convenciones de
trabajo. El proyecto en sí está descrito en el `README.md` — con las correcciones verificadas que
se señalan abajo.

## Documentación actualizada (MCP context7)

Este proyecto tiene disponible el **MCP de context7** (https://context7.com/). Antes de proponer
código para las dependencias listadas abajo, consulta la documentación de la **versión exacta
instalada** — no la última publicada, no la que recuerdes.

### Flujo

1. `resolve-library-id` con el nombre de la librería.
2. `query-docs` con el ID resuelto, la versión de la tabla y el tema concreto.
3. Si la versión exacta no está indexada, usa la minor más cercana **por debajo** y di
   explícitamente en la respuesta qué versión consultaste.

Comprobar que está disponible antes de confiar en él: `claude mcp list` (o `opencode mcp list` en
OpenCode) → `context7` Connected. Si no lo está, **dilo en la respuesta** y sigue con conocimiento
propio; no finjas haberlo consultado.

**IDs resueltos** (verificado 2026-07-27):

| Librería     | ID a usar                      | Aviso                                                                               |
| ------------ | ------------------------------ | ----------------------------------------------------------------------------------- |
| Astro        | `/withastro/docs`              | Fuente rica (6571 snippets), **sin pin de versión**                                 |
| Astro (pin)  | `/withastro/astro/astro_6.3.1` | Misma minor que la instalada (6.3.7) — **usable**, pero fuente floja (791 snippets) |
| Tailwind CSS | `/websites/tailwindcss`        | Doc viva de **v4**, sin pin                                                         |

⚠️ **El pin de versión no siempre filtra.** Verificado en otro repo con Express: consultando el ID
de la v4 seguían apareciendo snippets de la v5. **Si un resultado de context7 contradice la tabla de
trampas de abajo, manda la tabla.**

⚠️ **Los snippets no están escritos para `strict`.** La API que describen suele ser correcta, pero
omiten las guardas de null. ⚠️ _Hasta el 2026-08-25 esta línea decía «aquí no hay typecheck que
los coja: el filtro es el build»._ Desde `1431e0f` **sí lo hay**: los coge `astro check` — ver las
comprobaciones, abajo.

### Versiones instaladas (fuente de verdad: `node_modules`, no los rangos `^`)

| Paquete                   | Versión    | Nota                                                                    |
| ------------------------- | ---------- | ----------------------------------------------------------------------- |
| `astro`                   | **6.3.7**  | ⚠️ **v6** — ver trampas                                                 |
| `@astrojs/vercel`         | **10.0.7** | Adapter SSR — el import es `@astrojs/vercel`, no `/serverless`          |
| `tailwindcss`             | **4.3.0**  | ⚠️ **v4**, config en CSS — ver trampas                                  |
| `@tailwindcss/vite`       | **4.3.0**  | Integración por plugin de Vite (NO `@astrojs/tailwind`)                 |
| `@tailwindcss/typography` | **0.5.19** | 🔴 **Cargado y sin usar** — ver trampas                                 |
| `sharp`                   | **0.34.5** | `scripts/png-to-webp.mjs` + `astro:assets`. Pre-1.0: rompe entre minors |
| `unist-util-visit`        | **5.1.0**  | Plugin rehype propio en `astro.config.mjs`                              |
| `@types/node`             | **25.9.1** | ⚠️ Tipos de Node 25 sobre runtime **Node 24** — ver abajo               |
| `vite`                    | **7.3.3**  | Transitiva de Astro 6. Otros proyectos del propietario van en v5/v6     |
| `typescript`              | **6.0.3**  | ⚠️ _Hasta el 2026-08-25 esta fila decía «— · 🔴 NO instalado»._ Se instaló y se pineó en `1431e0f`. **Pineado a la 6 a propósito: con la 7 `astro check` muere** |
| `@astrojs/check`          | **0.9.10** | ⚠️ Fila nueva (2026-08-26). Es lo que hace que `astro check` compruebe de verdad — ver capa 2, regla 5 |

**`zod` no lleva fila**: hay una copia en `.pnpm` (4.4.3) pero es **transitiva de Astro, con cero
imports** en `src/`. El esquema de colecciones usa el `z` que reexporta Astro.

### Trampas de versión (consultar también — aquí el modelo suele asumir mal)

| Paquete                   | Versión    | Trampa                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `astro`                   | **6.3.7**  | Es **v6**: `src/content.config.ts` va en la **raíz de `src/`**, no en `src/content/config.ts`; colecciones con loaders `glob()`/`file()` del Content Layer (la API legacy se eliminó en v6). **`z` desde `astro:content` está deprecado** — la forma v6 es `import { z } from 'astro/zod'`. Ya presente en `src/content.config.ts`: señalar, no reescribir de oficio |
| `tailwindcss`             | **4.3.0**  | Es **v4**: `@import "tailwindcss"` + `@theme` en `src/styles/global.css`. **No hay `tailwind.config.js`**, ni `content: []`, ni `@tailwind base/components/utilities` — eso es v3                                                                                                                                                                                    |
| `@tailwindcss/typography` | **0.5.19** | Se carga con `@plugin` en `global.css` pero **la clase `prose` no aparece en ningún archivo** (verificado con grep). El estilo del contenido es CSS propio. No lo uses al escribir componentes                                                                                                                                                                       |
| `sharp`                   | **0.34.5** | **Pre-1.0**: la API rompe entre minors. Verifica contra esta versión exacta                                                                                                                                                                                                                                                                                          |

### ⚠️ El estilo real es CSS propio — Tailwind está instalado pero apenas se usa

El `README.md` dice _"sin framework de UI ni CSS utilitario"_. **No es exacto**: Tailwind 4 está
instalado y **activo en el build** (`@import "tailwindcss"` aplica el preflight al render). Medido
sobre el árbol:

- **Cero clases utilitarias** en todo `src/`, y ningún `@apply`. Ojo al contarlas: `dash-grid` y
  `hallazgos-grid` (`src/pages/index.astro`) **son clases propias**, no la utility `grid`. El
  estilo real es CSS moderno en bloques `<style>` de cada `.astro` (variables, `color-mix`,
  `clamp`).
- **Tokens brand duplicados**: `@theme` define `--color-brand` (sin uso) y `:root` define
  `--brand` con el mismo hex (**~40 usos** — es el sistema vivo). Si cambias un color de marca,
  toca el de `:root`; y no mezcles ambos sistemas.
- El tema oscuro va por **clase `.dark`** en `<html>` (script inline + localStorage), con
  selectores `.dark` en el CSS — no hay `dark:` utilities ni `@custom-variant`.

### ⚠️ Todo el sitio es SSR, no hay páginas estáticas

`astro.config.mjs` fija `output: 'server'` y **ninguna página exporta `prerender = true`**: cada
petición pasa por la función serverless. Es deliberado — el middleware de control de acceso lo
exige — pero tenlo presente: aquí "generar estático" no es la norma, y un cambio que rompa la
función rompe **todas** las rutas, no una página.

### ⚠️ Los tipos de Node van por delante del Node que se ejecuta

`@types/node` es **25.9.1** y el runtime es **Node 24** (`engines.node` + `.nvmrc`). Los tipos
describen APIs que en 24 pueden no existir: verifica contra la doc de **Node 24**, no contra lo
que permita el autocompletado. No lo "arregles" por iniciativa propia.

### Comprobaciones antes de dar algo por bueno — ahora hay DOS puertas

```bash
pnpm run verify   # astro check && astro build — es lo que ejecuta el CI
```

⚠️ **Corregido el 2026-08-26.** Hasta el `1431e0f` (2026-08-25) esta sección decía que
`pnpm build` era «todo lo que hay» y que **no había typecheck** porque el repo no instalaba
`typescript` ni `@astrojs/check`. ~~Ya no es cierto~~: ambos están instalados y pineados, existe
el script `verify`, y `astro check` comprueba los `.astro` de verdad. **Se deja escrito que este
repo estuvo un mes con el `tsconfig` en `strict` y nada que lo ejecutara** — el dato es que la
puerta faltaba, no solo que ahora esté.

Sigue **sin haber lint ni tests**: no hay `eslint` ni script `test`. La cobertura es tipos +
build.

Línea base medida con el árbol limpio:

| Fecha      | Comando          | Resultado                                                              |
| ---------- | ---------------- | ---------------------------------------------------------------------- |
| 2026-07-27 | `pnpm build`     | ✅ verde (9 rutas + función de Vercel) — ⚠️ única puerta de la época   |
| 2026-08-26 | `pnpm run verify` | ✅ **exit 0** — `astro check`: 15 ficheros, 0 errores, 0 warnings, 6 hints; build completo |

Comprobado además que `astro build` **no escribe en el repo**: el árbol sigue limpio después de
verificar. Si tras un cambio `verify` sigue verde, no lo has roto tú.

### Otras trampas propias (no se ven en el manifest)

- **`package.json` dice `"name": "satellite-shepherd"`** — nombre interno heredado de la plantilla,
  no el de este proyecto. Señalarlo, no cambiarlo de oficio.
- **Control de acceso** (`src/middleware.ts`): en desarrollo se desactiva solo
  (`import.meta.env.DEV`); en producción **fail-closed** — si falta `ACCESS_TOKEN` en el entorno,
  bloquea todo menos `/restricted` y los assets `/_astro/` y `/_image`. Si un cambio tuyo "rompe el
  sitio" en un deploy de prueba, mira primero esto.
- **Plugin rehype propio** en `astro.config.mjs` (`rehypeFigureCaption`, con `unist-util-visit`):
  convierte `<p><img></p>` en `<figure><figcaption>`. Si una imagen en Markdown no lleva `alt`, no
  se genera caption; si el HTML del contenido cambia de forma, el plugin deja de casar.
- **El token del enlace de desbloqueo está a la vista** en `src/pages/restricted.astro` — es la
  demo del patrón, deliberado. No lo trates como un secreto filtrado, pero tampoco lo uses como
  ejemplo para nada serio.

### Límites

- context7 sirve para **verificar**, no para migrar. No apliques cambios de versión ni
  "modernices" código que funciona sin que se pida explícitamente. En concreto: **no propongas
  quitar Tailwind, ni "activar" el plugin de typography, ni añadir ESLint/TypeScript** de oficio.
- Si la doc actual recomienda un patrón distinto al que ya usa el repo, **no reescribas**:
  señálalo y sigue la convención existente salvo que el propietario decida lo contrario.
- Activación **reactiva y acotada**: solo código nuevo o modificado en la tarea en curso.
  Nunca como barrido ("revisa todo el proyecto contra la doc actual").
- No lo uses para lógica de negocio, refactors o debugging propio — solo para la API de la librería.
- **Este repositorio es PÚBLICO.** No añadas a este archivo, ni a ningún otro versionado, nombres
  de otros repositorios del propietario, rutas locales, ni secretos.

## Convenciones

- Formato de Markdown: Prettier por defecto. Tablas estilo GitHub-flavored.

<!-- Las reglas de commits y de push que había aquí se podaron el 2026-08-26: las
     cubre la capa 1 al pie de este fichero, palabra por palabra y sin añadir
     motivo propio. Ver «Excepciones declaradas». -->

<!-- capa1:inicio · injertado desde el repo `setup` · no editar a mano:
     `propagar` sustituye **todo** lo que hay entre estas dos marcas, así que
     una decisión escrita aquí dentro se pierde sin aviso en la siguiente
     actualización. Lo que decidas va FUERA, en «Excepciones declaradas». -->

## Verificación

1. **Verifica antes de afirmar.** No se da por bueno lo que un fichero dice del
   entorno: se ejecuta y se comprueba. _La doc afirmaba tres cosas de una
   máquina y las tres eran falsas._
2. **Nada se marca hecho sin comprobarlo.** Si no se puede, queda `❓ pendiente`
   y se dice.
3. **Se comprueba con lo que lo consume**, no leyendo ni importando. Una
   **opción de configuración**, con su herramienta (`pnpm config get`) — _tres
   repos creen tener cuarentena y no la tienen_. Un **módulo nativo**,
   **usándolo** y **bajo el runtime real del proyecto**, que puede no ser Node:
   `require()` no llega a abrir el `.node` y da verde con cualquier ABI — _dos
   hallazgos falsos el mismo día sobre el mismo paquete_.
4. **«Hecho» significa verificado por CI**, no afirmado. El CI **instala con el
   lockfile congelado** y encadena lint, tipos y build, y **el lint falla con
   avisos** o su verde no afirma nada: `eslint` da **exit 0** con «1 problem (0
   errors, 1 warning)». Los comandos concretos son de cada proyecto.
5. **Las correcciones se marcan** (⚠️ / tachado), **no se borran.** Saber qué se
   creyó cierto es parte del valor del documento.

## Seguridad y reparto humano ↔ IA

6. **No se lee `.env`, credenciales ni volcados reales** sin permiso explícito.
7. **La IA no instala ni configura nada por su cuenta**: lo propone y lo decide
   el propietario.
8. **Nada destructivo sin `--dry-run` previo**, enseñando la lista de lo que se
   va a borrar. _Un `git clean -fd` se llevó 3 directorios irrecuperables._
9. **La IA commitea; el push lo decide la persona.** Los commits locales se
   acumulan hasta el OK.
10. **`.env` gitignorado y `.env.example` versionado.**
11. **Sin rastro de IA en los commits ni en la salida**: ni `Co-Authored-By` ni
    «Generated with…». _El historial dice qué cambió y por qué, no con qué
    herramienta; y la autoría es de quien responde._

## Commits

12. **Conventional Commits, en inglés**: `tipo(scope): resumen`, con `!` para la
    rotura de compatibilidad. El cuerpo lleva **solo** la lista de cambios y el
    porqué de cada uno.

## Entorno y versiones

13. **La versión la fija el repo, no la máquina.** Nace pineado (`.nvmrc` /
    `.tool-versions` + `engines`) en **la LTS más alta que acepte el stack**,
    con el techo leído de las dependencias, no inventado.
14. **En sesión de agente no hay auto-switch de Node.** El hook vive en el
    perfil del shell y una sesión no interactiva no lo carga: hay que activar la
    versión del repo en **cada** invocación. _Síntoma según lo que quede en el
    PATH de esa máquina: si hay algún Node fuera del gestor,
    `ERR_PNPM_UNSUPPORTED_ENGINE` — arranca, con el Node equivocado; si no lo
    hay, `"node" no se reconoce…` y **no arranca nada**. Cuidado: `pnpm` puede
    resolver en el PATH y reventar igual, porque su shim necesita un `node`._
15. **pnpm, nunca npm**, y **no se activa `corepack`** _(EPERM documentado)_. Si
    una máquina ya lo trae activado, se **declara la excepción** y no se
    «arregla»: desactivarlo crearía los shims solapados que la regla evita.
16. **Los ajustes de pnpm van en `pnpm-workspace.yaml`**; `.npmrc`, solo
    registro y autenticación.
17. **`.gitattributes` desde el primer commit** (`* text=auto eol=lf`,
    `*.ps1 text eol=crlf`). _Con CRLF, `.nvmrc` se lee como `"22\r"` y rompe el
    auto-switch y el `node-version-file` del CI._
18. **Las CLI de agente se instalan standalone**, nunca con `npm i -g` bajo
    fnm/nvm: quedan atadas al Node activo y se duplican por versión.
19. **En Windows, `fnm exec --using=NN <programa>` solo lanza ejecutables
    reales.** `npm i -g` genera `.cmd`/`.ps1`, nunca `.exe`, así que `pnpm`,
    `npm` y `npx` fallan con `Can't spawn program: program not found`. _No se
    arregla instalando el paquete bajo ese Node: se ha medido con pnpm ya
    presente y falla igual._ Forma portable (Windows y Linux): lanzar `node` y
    resolver el `*-cli.js` desde `process.execPath`.

## Dependencias

20. **Endurecimiento del registro** en todo repo con dependencias. Los valores
    concretos dependen de la versión de pnpm y van en el módulo de capa 2.
21. **Al mover una lista de permisos o de configuración, comparar elemento a
    elemento.** _`onlyBuiltDependencies` pasó de 4 paquetes a 2 y el install no
    lo detecta si `node_modules` ya está poblado._

## Continuidad y documentación

22. **El estado vive en `docs/SESSION.md`** y **se sobrescribe**: el historial
    ya lo guarda git. Las **~80 líneas** avisan de que toca revisar si sobra
    algo, no prohíben pasarse. _Tres ficheros de estado llegaron a 385, 385 y
    4.565 líneas por acumular, no por ser largos._
23. **El porqué vive en `docs/DECISIONS.md`**, append-only. Una decisión que
    cambia **no se edita**: se añade otra que la revisa y se marca la vieja.
24. **El estado se escribe al cerrar tarea**, no al cerrar sesión: al final ya
    no queda contexto.
25. **Nada que el código o `git log` ya cuenten.** Sin este filtro los ficheros
    de estado degeneran.
26. **Un dato que varía según una dimensión se documenta como tabla sobre esa
    dimensión**, nunca como cifra única. _Una cifra por máquina escondió una
    desviación durante dos meses._
27. **El artefacto que no viaja no existe.** Lo que solo se imprime por pantalla
    no lo ve la otra máquina.
28. **La excepción se declara** en el `AGENTS.md` del proyecto, con motivo y
    alcance; incumplir en silencio, no. No aplica a seguridad, rastro de IA ni
    push.
29. **Textos en español**; nombres de fichero, claves de configuración e
    identificadores, en inglés.

## Arnés

30. **`AGENTS.md` es la fuente; `CLAUDE.md` es un puntero** (`@AGENTS.md`).
    Nunca dos ficheros con el mismo contenido.
31. **`skills-lock.json` se versiona**; `.claude/` y `.agents/` se gitignoran y
    se reconstruyen con `npx autoskills`, como `node_modules`.
32. **La doc oficial y los MCP se consultan siempre y no se silencian.** Si
    chocan con una decisión escrita, se señala; no se aplica por iniciativa
    propia.
33. **context7**: `resolve-library-id` → `query-docs` con la versión
    **instalada** (lockfile, nunca los rangos `^`); si esa versión no está
    indexada, se usa la minor inferior y **se dice cuál se consultó**. Si el MCP
    no responde, se dice en la respuesta en vez de fingir que se consultó.

<!-- capa1:fin -->

<!-- capa2:inicio · módulo=astro+tailwindcss · módulo de stack, injertado desde `setup` · no editar a mano -->

> 🔬 **trampa**: hecho del stack, se discute con una medición · 📐
> **convención**: elección del propietario, ni verdadera ni falsa · ❓ sin
> medición propia todavía.

## Arquitectura

1. 📐 **El estado va en islas.** Los `.astro` no llevan estado; vive en
   componentes montados como isla. Un `.astro` con estado es la señal de que
   algo se está construyendo en el sitio equivocado.

## Trampas del stack

2. 🔬 **Prettier necesita `prettier-plugin-astro`** y un `overrides` que fije el
   parser `astro` para `*.astro`. Sin ellos, `prettier --check` **aborta** con
   `No parser could be inferred for file "….astro"` y sale con código 2 — no
   formatea mal, no formatea. **Provocado y medido el 2026-08-10** sobre Astro
   5.18.1 con Prettier 3.8.1, quitando las dos claves del `.prettierrc` y
   restaurándolas. La línea se queda porque **el error no dice qué plugin
   falta**: nombra el síntoma, no el remedio.

## Fuentes

3. 📐 **`@fontsource`, autoalojadas.** Sin peticiones a Google Fonts.

## context7 en este stack

4. 🔬 **El pin de context7 puede no coincidir con la major instalada, y falla en
   las dos direcciones.** _Medido el 2026-08-19: context7 ofrece **una sola**
   entrada versionada, `6.3.1`._ Cuando no coincida —esté por encima o por
   debajo—, **manda la tabla de trampas local**, no lo que devuelva el MCP, y se
   **dice qué versión se consultó de verdad**. ⚠️ _Hasta el 2026-08-19 esto
   decía «Astro 5 no tiene pin utilizable» y «ofrece una major por encima». Se
   escribió cuando aquí se usaba la 5, y ató la regla a una major concreta: el
   desajuste no era de Astro 5, es que context7 sirve **una** versión para un
   repositorio que puede ir por cualquiera._

## La comprobación de tipos en Astro

5. **Los tipos se comprueban con `astro check`**, no con `tsc`: es lo que
   entiende los `.astro`. 🔬 **No viene con Astro: exige `@astrojs/check` y
   `typescript` aparte, y sin ellos NO falla — pregunta si los instala y, sin
   nadie que conteste, sale con código 0.** Medido el 2026-08-25 en Astro 6.1.9:
   un `verify` que lo encadene sin el paquete da un verde que no comprueba ni un
   tipo (ADR-114). **Salidas, y son dos: instalarlos** —y entonces falla con
   código distinto de 0 ante un error de tipos— **o dejarlo fuera del `verify` y
   declarar la excepción por escrito** (regla 28). Encadenarlo sin el paquete no
   es una tercera. El invariante del CI —qué encadena y que el lint falle con
   avisos— es capa 1 desde el 2026-08-22 (ADR-105); aquí solo va lo que cambia
   por ser Astro.

## Antes de escribir una sola línea de estilo

1. 🔬 **Mira qué major hay instalada antes de escribir CSS.** Conviven la 3 y la
   4, y se reconocen sin abrir el `package.json`:

   | Major  | Cómo se reconoce                                   |
   | ------ | -------------------------------------------------- |
   | **v4** | `@import 'tailwindcss'` + `@theme`, **sin** config |
   | **v3** | `tailwind.config.{js,ts}` + directivas `@tailwind` |

   Escribir la sintaxis de la otra major **no da error**, y es uno de los pocos
   fallos de este stack que de verdad es **mudo**. Medido sobre Astro 5.18.1 con
   Tailwind 4.2.1, poniendo las tres directivas
   `@tailwind base/components/utilities` de v3 en un proyecto v4:

   - el build sale **verde, código 0 y sin un solo aviso**;
   - **las utilidades se siguen generando** — `.flex{`, las variables `--tw-`;
   - **lo que desaparece en silencio es el preflight**, el reset base: el CSS
     emitido cae de **185.382 a 110.050 bytes, un 40,6 % menos**, y con él se
     van `box-sizing:border-box` y `tab-size`.

   ⚠️ Por eso «el estilo no se aplica» se queda corto y **engaña**: la página no
   sale sin estilo, sale **casi bien**, con las utilidades puestas y el reset
   ausente. Es más difícil de ver que un fallo total. ❓ Solo se ha medido esta
   dirección; **poner sintaxis v4 en un proyecto v3 no está medido**, así que
   ahí la regla avisa sin traer prueba propia.

<!-- capa2:fin -->

Sitio de documentación técnica que publica **una** auditoría web completa —rendimiento, seguridad,
accesibilidad y SEO— sobre una empresa real anonimizada, con el contenido tras un control de acceso
por token.

> **Qué NO es.** _Sin frontera declarada._ Se preguntó al propietario el 2026-08-26, como reacción a
> trabajo concreto —alojar varias auditorías de varios clientes, con alta y acceso por cliente— y la
> respuesta fue **buena noticia**: no delimita nada. La sección se queda **vacía a propósito**, no
> por olvido. Una frontera inventada aquí congelaría una decisión que nadie ha tomado.

## Comandos

Los de **este** proyecto, y van los primeros a propósito: es la sección de mayor
retorno y **la que casi todo el mundo entierra a media altura**.

```bash
pnpm install --frozen-lockfile
pnpm dev            # ❓ no verificado: no termina, y ejecutarlo cuelga la sesión
pnpm build          # ✅ verificado 2026-08-26
pnpm run verify     # ✅ verificado 2026-08-26, exit 0 — es lo que ejecuta el CI
```

**No hay `test`**: el repo no declara ese script y no se inventa uno. La cobertura de este proyecto
es tipos + build, nada más.

🔴 **En sesión de agente no hay auto-switch de Node** (capa 1, regla 14). Comprueba `node -v` contra
`.nvmrc` (24) y `pnpm -v` contra `packageManager` (10.34.1) en **cada** invocación, aunque casen por
casualidad.

## Antes de hacer nada

1. `README.md` — qué es el proyecto y su estructura.
2. `AGENTS.md` — este fichero: versiones instaladas, trampas y reglas.
3. `docs/DECISIONS.md` — por qué está así lo que no se ve en el código.

## Este proyecto

Todo lo de abajo es **tuyo**: el comando que actualiza las capas 1 y 2 no lo
toca nunca.

### Rutas y decisiones del dominio

- **`src/middleware.ts`** — el control de acceso, y la pieza más delicada del repo. Fail-closed en
  producción (`:20-23`): sin `ACCESS_TOKEN` en el entorno bloquea todo menos `/restricted`,
  `/_astro/` y `/_image`. La cookie es `HttpOnly; Secure; SameSite=Lax` con 2 h de vida (`:29`).
- **`src/content/sections/`** — las 8 secciones de la auditoría, en Markdown, como Content
  Collection. El esquema está en **`src/content.config.ts`**, en la raíz de `src/` porque es Astro 6.
- **`astro.config.mjs`** — fija `output: 'server'` y lleva un **plugin rehype propio**
  (`rehypeFigureCaption`): convierte `<p><img></p>` en `<figure><figcaption>`. Si el HTML del
  contenido cambia de forma, el plugin deja de casar en silencio.
- **`scripts/png-to-webp.mjs`** — conversión por lotes de las 19 capturas con `sharp`.

### Dónde el modelo suele asumir mal

Esta sección **no se repite aquí**: está desarrollada arriba, con sus mediciones, y duplicarla haría
dos copias que divergen. Los cuatro sitios donde este repo muerde:

| Síntoma | Causa | Qué hacer |
| --- | --- | --- |
| Se propone `tailwind.config.js`, `@apply` o utilities | Tailwind está instalado pero **cero clases utilitarias** en `src/` | El estilo real es CSS propio en bloques `<style>`. Ver «El estilo real es CSS propio» |
| Se toca `--color-brand` para cambiar la marca | Hay **dos** sistemas de tokens; el vivo es `--brand` en `:root` (~40 usos) | Tocar el de `:root`, y no mezclar |
| Se usa `import { z } from 'astro:content'` | Deprecado en Astro 6 | `import { z } from 'astro/zod'`. Ya está bien en `src/content.config.ts`: señalar, no reescribir |
| Se «arregla» `@types/node` 25 sobre Node 24 | Los tipos van por delante del runtime, a propósito | Verificar contra la doc de **Node 24**, no contra el autocompletado |
| «El sitio se ha roto» tras un cambio | Todo es SSR: **ninguna** página exporta `prerender` | Mirar primero `src/middleware.ts` |

### Nivel de seguridad

**L2** — hay control de acceso real por token con cookie de sesión, aunque no haya dinero ni datos
personales (`src/middleware.ts:20-23`, `:29`). Desde L2, el subagente `security` abre
`~/.claude/reference/security/asvs.md` y cita requisitos versionados; no los
inventa.

### Excepciones declaradas

- 🔴 **`skills-lock.json` no se versiona aquí.** Incumple la regla de capa 1 que dice
  «**`skills-lock.json` se versiona**; `.claude/` y `.agents/` se gitignoran y se reconstruyen con
  `npx autoskills`, como `node_modules`» —citada por su texto y no por su número, porque los números
  se renumeran—. Motivo: este repositorio es **público** y su `.gitignore` fija «AI / agent tooling
  — nunca al repo público» (`.gitignore:27`). **Sin fecha de caducidad**: mientras el repo sea
  público, la excepción se mantiene. Razonada en `docs/DECISIONS.md`, ADR-003.
  ⚠️ **Esta excepción hay que mantenerla a mano.** El generador del arnés solo comprueba los tres
  ficheros que él escribe, y `skills-lock.json` no es uno: nada la detecta si desaparece de aquí.
- **No hay CI todavía**, así que la regla «hecho significa verificado por CI» aún no se cumple en
  este repo. Es deuda con fecha: se cierra copiando el molde, que ya tiene qué invocar
  (`pnpm run verify`, verde desde el 2026-08-26).

## Documentos de este proyecto

- `AGENTS.md` — cómo se trabaja aquí (este fichero)
- `docs/DECISIONS.md` — por qué está así

**Cuándo crear el siguiente.** El molde está en `~/.claude/reference/templates/`
—ruta del usuario, no del proyecto—; se abre al crearlo y el fichero nuevo ya
sale con sus reglas dentro:

| Si…                                            | →   | Documento    |
| ---------------------------------------------- | --- | ------------ |
| se cierra la sesión con trabajo a medias       | →   | `SESSION.md` |
| hay tareas que ya no caben en la cabeza        | →   | `TODO.md`    |
| unos bloques dependen de lo que producen otros | →   | `ROADMAP.md` |

Para algo que no esté en esa lista —un `RUNBOOK.md`, una migración—, la receta
está en `~/.claude/reference/templates/README.md`. Resumida: **contesta a una
pregunta que ningún fichero actual contesta**, se sabe **quién lo lee**, y
**nace con su regla de poda**. Sin las tres, no se crea.

## Estado

No hay `docs/SESSION.md`: este repo no arrastra trabajo a medias. Se crea el día que una
sesión se cierre sin cerrar la tarea, con el molde de `~/.claude/reference/templates/`.
