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
| `@astrojs/check`          | **0.9.10** | ⚠️ Fila nueva (2026-08-26). Es lo que hace que `astro check` compruebe de verdad |

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
`pnpm run build` era «todo lo que hay» y que **no había typecheck** porque el repo no instalaba
`typescript` ni `@astrojs/check`. ~~Ya no es cierto~~: ambos están instalados y pineados, existe
el script `verify`, y `astro check` comprueba los `.astro` de verdad. **Se deja escrito que este
repo estuvo un mes con el `tsconfig` en `strict` y nada que lo ejecutara** — el dato es que la
puerta faltaba, no solo que ahora esté.

Sigue **sin haber lint ni tests**: no hay `eslint` ni script `test`. La cobertura es tipos +
build.

Línea base medida con el árbol limpio:

| Fecha      | Comando          | Resultado                                                              |
| ---------- | ---------------- | ---------------------------------------------------------------------- |
| 2026-07-27 | `pnpm run build` | ✅ verde (9 rutas + función de Vercel) — ⚠️ única puerta de la época   |
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

<!-- layer1:start · generated by the harness · do not edit by hand -->

## Verification

1. **Verify before asserting, and with whatever consumes it.** Never take a
   file's word about the environment: **run the tool that reads it and trigger
   what it controls.** What cannot be checked stays `❓ pending`, said out loud.

   _Asking is not enough: `pnpm config get` answered `42` for a key that does
   not exist, and `true` for one that changed nothing._

2. **"Done" means verified by CI, not asserted.** What has not passed the gate
   stays pending, and that is said.

   _A green on your machine only proves your machine._

## What the AI does not decide

3. **`.env`, credentials and real data dumps: neither read without explicit
   permission, nor committed.** What the agent reads **enters the
   conversation**, and from there it does not come back. `.env.example` is what
   travels.

4. **The AI installs and configures nothing on its own**: it proposes, the owner
   decides.

   _An install or a config change lands in everyone's lockfile and CI, and
   neither shows in the diff the agent presents._

5. **Nothing destructive without a `--dry-run` first**, showing what would be
   deleted.

   _A `git clean -fd` took three unrecoverable directories._

6. **The AI commits; the person decides the push.** Local commits pile up until
   the go-ahead, **and one go-ahead covers one push**, not the next ones.

7. **No AI trace in commits or output**: no `Co-Authored-By`, no "Generated
   with…".

   _Tools add it by default. History says what changed and why, not with which
   tool._

8. **Conventional Commits, in English**: `type(scope): summary`, with `!` for a
   breaking change. The types: `feat` · `fix` · `docs` · `style` · `refactor` ·
   `perf` · `test` · `build` · `ci` · `chore` · `revert`. The body carries
   **only** the list of changes and the reason for each — the how is already in
   the diff.

## The environment

9. **An agent session has no Node auto-switch.** The hook lives in the shell
   profile and a non-interactive session never loads it: the session runs on
   whatever Node it **inherited when it was launched**, and `cd` into another
   project does not change it.

   **Start the session from a terminal already on the repo's version** — enter
   the directory, let fnm/nvm switch, then launch the agent. **One session per
   project.**

   _If that was not done, activate it on every invocation: `fnm use <major>`
   then the command. `fnm exec --using=N pnpm` does not work on Windows — `pnpm`
   is a `.cmd` and `fnm exec` only launches real executables._

10. **pnpm, never npm.**

_`npm install` leaves a `package-lock.json` next to `pnpm-lock.yaml`, and two
installers disagree in silence._

11. **pnpm settings live in `pnpm-workspace.yaml`**; `.npmrc` carries registry
    and authentication only — from pnpm 11 anything else there is ignored, and
    pnpm 10 still reads it, so it works today and stops on upgrade. Every repo
    with dependencies sets `minimumReleaseAge` there.

## Continuity

12. **State lives in `docs/SESSION.md`**, written **when a task closes** — at
    session close there is no context left — and **overwritten**: git keeps the
    history. Nothing the code or `git log` already tells goes in.

13. **The reasoning lives in `docs/DECISIONS.md`**, append-only. A decision that
    changes **is not edited**: another is appended revising it, and the old one
    is **marked, never deleted**. Knowing what was believed is part of the
    record.

14. **An exception is declared** in the project's `AGENTS.md`, with its reason
    and its scope; failing silently is not an option. Does not apply to
    security, AI traces or pushing.

## Naming

15. **File names, configuration keys and identifiers in English.**

## Knowledge that is not in this file

16. **Skills are per project.** `npx autoskills` installs them into
    `<repo>/.claude/skills/`, which is **git-ignored and rebuilt** like
    `node_modules`; **`skills-lock.json` is committed** — it carries each
    skill's source and hash, and it is what makes three machines rebuild the
    same set. **The developer runs `autoskills`, not the agent** — `npx`
    downloads a package, and installing is not the agent's call.

_Global skills in `~/.claude/skills/` are the machine's, not the project's._

17. **Official docs and MCPs are consulted and never silenced**, at the
    **installed** version — from the lockfile, not the `^` range. **Context7 is
    the one every project uses**: `resolve-library-id`, then `query-docs` at
    that version. If the MCP does not answer, say so instead of pretending it
    was consulted.

## Review

18. **When work is reviewed, this is the shape.** `architect` before building;
    `reviewer` and `security` over what was built, **read-only**; `tester` to
    verify. Run them whenever you want, together or on their own.

<!-- layer1:end -->

<!-- reparaciones:inicio · medido en el repo `setup` · no editar a mano:

     lo de dentro lo reescribe el comando de propagación desde
     `findings/pending-repairs.md`. Lo que se edite aquí se pierde al siguiente
     pase; lo que se repara se repara en este repo, y la línea desaparece sola.
-->

> 🔴 **Este repo tiene una reparación pendiente**, medidas el 2026-08-26 desde `setup` y
> traídas aquí por el comando de propagación, porque un proyecto no recuerda
> su propio defecto: su agente lee este fichero, no el registro de `setup`.
>
> - `skills-lock.json` gitignorado _(§4, medido el 2026-08-26)_
>
> **El detalle y el porqué de cada una** están en `findings/pending-repairs.md`
> del repo `setup`, en la ficha que cada línea cita. **Nada de esto se arregla
> desde aquí automáticamente** (ADR-115): se repara a mano, en este repo, con
> el contexto que el comando no tiene.

<!-- reparaciones:fin -->

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
pnpm run dev        # ❓ no verificado: no termina, y ejecutarlo cuelga la sesión
pnpm run build      # ✅ verificado 2026-08-26
pnpm run verify     # ✅ verificado 2026-08-26, exit 0 — es lo que ejecuta el CI
```

**No hay `test`**: el repo no declara ese script y no se inventa uno. La cobertura de este proyecto
es tipos + build, nada más.

🔴 **En sesión de agente no hay auto-switch de Node** (rule 9). Comprueba `node -v` contra
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

## Where the model goes wrong

| Síntoma | Causa | Qué hacer |
| --- | --- | --- |
| Se propone `tailwind.config.js`, `@apply` o utilities | Tailwind está instalado pero **cero clases utilitarias** en `src/` | El estilo real es CSS propio en bloques `<style>`. Ver «El estilo real es CSS propio» |
| Se toca `--color-brand` para cambiar la marca | Hay **dos** sistemas de tokens; el vivo es `--brand` en `:root` (~40 usos) | Tocar el de `:root`, y no mezclar |
| Se usa `import { z } from 'astro:content'` | Deprecado en Astro 6 | `import { z } from 'astro/zod'`. Ya está bien en `src/content.config.ts`: señalar, no reescribir |
| Se «arregla» `@types/node` 25 sobre Node 24 | Los tipos van por delante del runtime, a propósito | Verificar contra la doc de **Node 24**, no contra el autocompletado |
| «El sitio se ha roto» tras un cambio | Todo es SSR: **ninguna** página exporta `prerender` | Mirar primero `src/middleware.ts` |

## Security

**L2** — estimated on 2026-09-19: token-based access control with fail-closed middleware, HttpOnly cookie, SSR-only; no money or personal data. **Re-estimate when:** accounts and payments are added.

**Areas:**

- Authentication, Session → `src/middleware.ts`

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
