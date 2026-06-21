# web-audit

Sitio de documentación técnica que presenta una **auditoría completa de una web corporativa real**.
El nombre y el dominio de la empresa se han anonimizado por privacidad (se usa `cliente.com`),
manteniendo intactos todos los datos técnicos del análisis.

La auditoría cubre los pilares que definen la calidad de un sitio profesional —rendimiento,
seguridad, accesibilidad y SEO— y concluye con una propuesta de migración a una arquitectura
moderna. El análisis se realizó de forma no intrusiva, con herramientas públicas e inspección
mediante DevTools.

**Producción:** [web-audit-bp.vercel.app](https://web-audit-bp.vercel.app/)
**Autor:** Salvador Pérez — [stackbp.es](https://www.stackbp.es/)

---

## Stack

| Tecnología | Versión | Uso |
| --- | --- | --- |
| [Astro](https://astro.build/) | 6.x | Framework — SSR mínimo para el control de acceso |
| [@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/) | — | Adapter de despliegue serverless |
| [TypeScript](https://www.typescriptlang.org/) | strict | Tipado en Content Collections y componentes |
| [Sharp](https://sharp.pixelplumbing.com/) | 0.34.x | Conversión de capturas a WebP |

Sin framework de UI ni CSS utilitario: estilos propios con CSS moderno (variables, `color-mix`,
`clamp`) y cero JavaScript de cliente salvo la interacción mínima (tema, lightbox, paleta de búsqueda).

---

## Estructura del proyecto

```
src/
├── assets/
│   ├── avatar.png
│   └── screenshots/          # 19 capturas de las herramientas de análisis (WebP)
├── components/               # Sidebar, Footer, CommandPalette, ScoreGauge, StatCard, BeforeAfterBar
├── content/
│   └── sections/             # 8 secciones de la auditoría (Content Collections)
│       ├── 00-metodologia.md
│       ├── 01-stack.md
│       ├── 02-rendimiento.md
│       ├── 03-seguridad.md
│       ├── 04-accesibilidad.md
│       ├── 05-seo.md
│       ├── 06-propuesta.md
│       └── 07-informe-final.md
├── layouts/
│   └── DocsLayout.astro      # Layout base: sidebar + contenido + lightbox
├── pages/
│   ├── index.astro           # Portada: resumen ejecutivo y tabla de hallazgos
│   ├── [slug].astro          # Ruta dinámica de las 8 secciones
│   └── restricted.astro      # Pantalla de acceso restringido
├── middleware.ts             # Control de acceso por token + cookie
├── styles/
└── content.config.ts         # Schema de Content Collections
scripts/
└── png-to-webp.mjs           # Conversión por lotes de capturas a WebP
public/
└── robots.txt                # Disallow: / — sin indexación
```

---

## Secciones de la auditoría

| URL | Sección | Severidad |
| --- | --- | --- |
| `/` | Portada — resumen ejecutivo | — |
| `/00-metodologia` | Metodología y herramientas | — |
| `/01-stack` | Stack técnico | Crítico |
| `/02-rendimiento` | Rendimiento | Crítico |
| `/03-seguridad` | Seguridad | Crítico |
| `/04-accesibilidad` | Accesibilidad | Medio |
| `/05-seo` | SEO & Analytics | Alto |
| `/06-propuesta` | Propuesta de migración | Acción |
| `/07-informe-final` | Informe final | — |

---

## Desarrollo

```bash
pnpm install      # instalar dependencias
pnpm dev          # servidor de desarrollo (localhost:4321)
pnpm build        # build de producción
pnpm preview      # previsualizar el build
```

> En desarrollo el control de acceso se desactiva automáticamente para no entorpecer el trabajo local.

---

## Control de acceso

El informe está protegido por un middleware que exige un token compartido. El acceso se concede
mediante un enlace `/unlock?token=...` que establece una cookie `HttpOnly` con caducidad de 2 horas;
el HTML de la auditoría nunca se envía sin una cookie válida. El token se configura con la variable
de entorno `ACCESS_TOKEN` en el despliegue y puede rotarse en cualquier momento para revocar todos
los accesos. Es una demostración del patrón, no un sistema de autenticación de producción.

---

## Despliegue

Despliegue automático en **Vercel** (modo serverless con `@astrojs/vercel`).

- Imágenes optimizadas a WebP.
- Privacidad: `robots.txt` con `Disallow: /` y `<meta name="robots" content="noindex, nofollow">`.
- Acceso controlado por la variable de entorno `ACCESS_TOKEN`.
