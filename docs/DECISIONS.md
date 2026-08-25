# DECISIONS — el porqué de lo que ya está cerrado

> **Qué contesta:** por qué está así. · **Quién lo lee:** quien duda de una
> decisión, a propósito — no en cada sesión. · **Cómo se poda:** no se poda.

> **Se añade, no se reescribe.** Una decisión que cambia **no se edita**: se
> escribe una nueva que la revisa, y la vieja se marca con un puntero a ella.
> Saber que algo se decidió y por qué se cambió vale más que la versión final.
>
> Aquí va el **porqué**; el estado actual vive en [`SESSION.md`](./SESSION.md).

---

## ADR-001 — El nivel de seguridad de este proyecto es L2

- **Estado:** ✅ aceptada (2026-08-26, por el propietario)
- **Fecha:** 2026-08-26
- **Decisión:** Declarar el proyecto **L2**. El subagente `security` abre
  `~/.claude/reference/security/asvs.md` y cita requisitos versionados en vez de
  inventarlos.
- **Motivo:** Hay una puerta de acceso real, no una cortina. `src/middleware.ts:20-23`
  es **fail-closed en producción**: si falta `ACCESS_TOKEN` en el entorno, bloquea todo
  menos `/restricted` y los assets. La sesión se sostiene con una cookie
  `HttpOnly; Secure; SameSite=Lax` de 2 h (`:29`). Un fallo ahí no degrada el sitio:
  lo abre entero o lo cierra entero, y como **todo es SSR** (`output: 'server'`, ninguna
  página con `prerender`), afecta a las 9 rutas a la vez.
- **Descartado:** L1. El argumento era que no hay dinero ni datos personales y que el
  token de desbloqueo está a la vista en `src/pages/restricted.astro`. Cae porque el
  nivel lo fija el mecanismo que hay que no romper, no lo valioso del contenido: el
  control de acceso existe, es fail-closed y es la única pieza entre el contenido y
  el público.

## ADR-002 — La sección «Qué NO es» se queda vacía a propósito

- **Estado:** ✅ aceptada (2026-08-26, por el propietario)
- **Fecha:** 2026-08-26
- **Decisión:** Dejar la sección «Qué NO es» de `AGENTS.md` **sin ninguna frontera**, y
  escribir dentro que está vacía a propósito, con la fecha en que se preguntó.
- **Motivo:** Se preguntó al propietario el 2026-08-26, formulado como reacción a trabajo
  concreto y no en abstracto: «si mañana te propongo alojar las auditorías de varios
  clientes, cada uno con su acceso y una pantalla de alta, ¿buena o mala noticia?».
  La respuesta fue **buena noticia**, así que no delimita nada y no se escribe como
  regla. Un ensayo anterior sobre un clon local de este repo llegó a la misma sección
  vacía el 2026-08-24, pero preguntando de otra forma y sin obtener respuesta; aquí hay
  respuesta y es que no hay frontera.
- **Descartado:** Escribir «no es multi-cliente» apoyándose en que hoy solo publica una
  auditoría. Sería convertir el estado actual en una regla que nadie ha decidido, y la
  respuesta del propietario dice justo lo contrario.

## ADR-003 — `skills-lock.json` no se versiona en este repositorio

- **Estado:** ✅ aceptada (2026-08-26, por el propietario)
- **Fecha:** 2026-08-26
- **Decisión:** Mantener `skills-lock.json` en el `.gitignore` (`:37`), incumpliendo la
  regla de capa 1 que pide versionarlo, y **declarar la excepción por escrito** en la
  sección «Excepciones declaradas» de `AGENTS.md`.
- **Motivo:** Este repositorio es **público**, y su `.gitignore` ya fija desde antes del
  arnés el bloque «AI / agent tooling — nunca al repo público» (`:27`). El fichero no es
  una marca vacía: es la lista real de las 8 skills instaladas bajo `.agents/skills/`,
  y publicarla expone el utillaje de agente del propietario sin aportar nada a quien
  lee la auditoría.
  ⚠️ La excepción **se mantiene a mano o no se mantiene**: el generador del arnés solo
  comprueba los tres ficheros que él escribe, y `skills-lock.json` no es uno, así que
  nada avisa si esta línea desaparece de `AGENTS.md`.
- **Descartado:** Versionarlo como pide la regla, aceptando la exposición. Cae porque la
  regla asume repos privados —compara el fichero con `node_modules`, reconstruible— y
  ese supuesto no se cumple aquí.

## ADR-004 — `CLAUDE.md` se versiona como puntero de una línea

- **Estado:** ✅ aceptada (2026-08-26, por el propietario)
- **Fecha:** 2026-08-26
- **Decisión:** Versionar `CLAUDE.md` con una única línea, `@AGENTS.md`, y
  retirar el patrón `CLAUDE.md` del `.gitignore` (línea 34). El resto del bloque
  «AI / agent tooling» se queda como está: `.claude/`, `.agents/`, `.skills/` y
  `skills-lock.json` siguen fuera del repo (ver ADR-003).
- **Motivo:**
  Medido en la sesión del 2026-08-26: el repo se abrió sin `CLAUDE.md` y
  `AGENTS.md` **no llegó al contexto**. Sus 144 líneas —la tabla de versiones
  instaladas, las trampas de Astro 6 y Tailwind 4, el aviso de que el repo es
  público— solo entraron porque el propietario ordenó leerlas a mano. Sin esa
  orden, la sesión habría trabajado sin ellas y nada lo habría delatado: no hay
  error, no hay aviso, el fichero simplemente no se lee.
  El coste de publicarlo es nulo y ya está asumido: el `.gitignore:35` declara
  que `AGENTS.md` **sí se versiona**, así que el repo ya publica sus
  instrucciones de agente. Un puntero de una línea expone estrictamente menos
  que el fichero al que apunta.
- **Descartado:** Dejar `CLAUDE.md` local a la máquina, que es lo que concluyó
  un ensayo previo sobre un clon local de este mismo repo. Aquel razonamiento
  identificó el síntoma correcto —«el artefacto que no viaja no existe»— pero
  la conclusión no lo arregla: local, el puntero tampoco existe en los otros dos
  equipos, y el fallo medido arriba se repite entero en cada uno. La regla pedía
  hacerlo viajar, no aceptarlo quieto.
- **Descartado:** Un `CLAUDE.md` con las reglas copiadas dentro en vez del
  puntero. Duplicaría un fichero que ya se versiona, y las dos copias derivarían
  sin dar error: `CLAUDE.md` solo lo lee Claude Code, mientras que `AGENTS.md`
  es el que leen los demás agentes. El repo se comportaría distinto según qué
  herramienta lo abriese.

<!-- reglas:inicio · plantilla DECISIONS v1 · generado desde `setup` · no editar

  🔴 NACE COMO `🔶 propuesta`. Solo el propietario lo pasa a `✅ aceptada`.
  Escribir «decidido» sobre una conclusión propia es el fallo concreto que
  originó esta regla.

  ESTADOS: 🔶 propuesta · ✅ aceptada · 🗑️ retirado (nunca llegó a aceptarse).
  Un ADR aceptado no se borra jamás; si deja de valer, otro lo revisa.

  FORMATO, y no es cosmético — cada entrada abre exactamente así:

      ## ADR-0NN — Título en una línea, en indicativo

      - **Estado:** 🔶 propuesta (YYYY-MM-DD)
      - **Decisión:** …
      - **Motivo:** …
      - **Descartado:** … (solo si había alternativa real)

  🔴 EL ESTADO VA EN SU CAMPO, NO PEGADO AL TÍTULO. Este fichero nace sin ADR
  de ejemplo a propósito —uno falso invita a dejarlo ahí—, así que el formato
  se dice aquí o se deduce. Deducido, el estado acaba como sufijo del título:
  el fichero se ve correcto y una comprobación que busque el campo `Estado` da
  rojo.

  CUÁNDO ESCRIBIR UNO: cuando la respuesta a «¿por qué está así?» no se ve en el
  código. Si se ve, no hace falta ADR.

  MOTIVO ≠ JUSTIFICACIÓN: «lo pide el cliente» o «es más limpio» no son motivos.
  Un motivo cita algo que pasó, algo medido, o una restricción real. Si la única
  razón es una preferencia, se dice que es una preferencia.

  LAS CIFRAS SALEN DE UN COMANDO, no de la memoria. Un número escrito a ojo
  parece verificado justo por ser un número, y envejece sin que nadie lo mire.

  NUMERACIÓN: correlativa y sin reutilizar. Si un número se salta, se deja
  saltado y se dice — reciclarlo rompe los enlaces de los que ya lo citaban.

  TAMAÑO: sin tope. Este fichero se lee **a propósito**, no en cada sesión, así
  que crecer no cuesta contexto. Lo que sí importa es que cada entrada sea
  autocontenida: quien la lea dentro de un año no tendrá el hilo delante.

  reglas:fin -->
