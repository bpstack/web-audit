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
omiten las guardas de null. Aquí no hay typecheck que los coja (ver abajo): el filtro es el build.

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
| `typescript`              | —          | 🔴 **NO instalado** — ver la sección de comprobaciones                  |

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

- **2 clases utilitarias** en todo `src/` (dos `grid`). El estilo real son **clases propias** y
  CSS moderno en bloques `<style>` de cada `.astro` (variables, `color-mix`, `clamp`).
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

### Comprobaciones antes de dar algo por bueno — solo hay UNA puerta

```bash
pnpm build        # es todo lo que hay
```

**No hay lint, ni typecheck, ni tests**: el repo no instala `eslint`, ni `typescript`, ni
`@astrojs/check`, y no hay script `test`. El `tsconfig.json` extiende `strict`, pero **nada lo
ejecuta**. Consecuencia: errores que en otros repos cogería el typecheck aquí solo los coge el
build — pásalo siempre, y lee sus avisos.

Línea base medida con el árbol limpio (2026-07-27): `pnpm build` ✅ **verde** (9 rutas + función
de Vercel). Si tras un cambio sigue verde, no lo has roto tú.

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

- Mensajes de commit **en inglés**, imperativo, asunto conciso + cuerpo cuando el cambio no sea
  trivial. **Nunca** `Co-Authored-By` ni "Generated with…".
- No se hace `push` sin OK explícito del propietario. Los commits locales se acumulan.
- Formato de Markdown: Prettier por defecto. Tablas estilo GitHub-flavored.
