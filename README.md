# web-audit

Technical documentation site presenting a **full audit of a real corporate website**.
The company name and domain have been anonymized for privacy (using `cliente.com`),
while all technical findings remain intact.

The audit covers the pillars that define a professional site's quality — performance,
security, accessibility, and SEO — and concludes with a proposal to migrate to a
modern architecture. The analysis was carried out non-intrusively, using public
tools and DevTools inspection.

**Live:** [web-audit-bp.vercel.app](https://web-audit-bp.vercel.app/)
**Author:** [bpstack](https://www.stackbp.es/)

---

## Stack

| Technology | Version | Use |
| --- | --- | --- |
| [Astro](https://astro.build/) | 6.x | Framework — minimal SSR for access control |
| [@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/) | — | Serverless deployment adapter |
| [TypeScript](https://www.typescriptlang.org/) | strict | Typing for Content Collections and components |
| [Sharp](https://sharp.pixelplumbing.com/) | 0.34.x | Screenshot conversion to WebP |

No UI framework or utility CSS: custom styles with modern CSS (variables, `color-mix`,
`clamp`) and zero client-side JavaScript except for minimal interaction (theme, lightbox, search palette).

---

## Project structure

```
src/
├── assets/
│   ├── avatar.png
│   └── screenshots/          # 19 screenshots of the analysis tools (WebP)
├── components/               # Sidebar, Footer, CommandPalette, ScoreGauge, StatCard, BeforeAfterBar
├── content/
│   └── sections/             # 8 audit sections (Content Collections)
│       ├── 00-metodologia.md
│       ├── 01-stack.md
│       ├── 02-rendimiento.md
│       ├── 03-seguridad.md
│       ├── 04-accesibilidad.md
│       ├── 05-seo.md
│       ├── 06-propuesta.md
│       └── 07-informe-final.md
├── layouts/
│   └── DocsLayout.astro      # Base layout: sidebar + content + lightbox
├── pages/
│   ├── index.astro           # Landing page: executive summary and findings table
│   ├── [slug].astro          # Dynamic route for the 8 sections
│   └── restricted.astro      # Restricted access screen
├── middleware.ts             # Token + cookie access control
├── styles/
└── content.config.ts         # Content Collections schema
scripts/
└── png-to-webp.mjs           # Batch screenshot conversion to WebP
public/
└── robots.txt                # Disallow: / — no indexing
```

---

## Audit sections

| URL | Section | Severity |
| --- | --- | --- |
| `/` | Landing page — executive summary | — |
| `/00-metodologia` | Methodology and tools | — |
| `/01-stack` | Technical stack | Critical |
| `/02-rendimiento` | Performance | Critical |
| `/03-seguridad` | Security | Critical |
| `/04-accesibilidad` | Accessibility | Medium |
| `/05-seo` | SEO & Analytics | High |
| `/06-propuesta` | Migration proposal | Action |
| `/07-informe-final` | Final report | — |

---

## Development

```bash
pnpm install        # install dependencies
pnpm run dev        # dev server (localhost:4321)
pnpm run build      # production build
pnpm run preview    # preview the build
```

> In development, access control is automatically disabled to avoid getting in the way of local work.

---

## Access control

The report is protected by middleware requiring a shared token. Access is granted
via an `/unlock?token=...` link that sets an `HttpOnly` cookie valid for 2 hours;
the audit's HTML is never served without a valid cookie. The token is configured via
the `ACCESS_TOKEN` environment variable in the deployment and can be rotated at any
time to revoke all access. This is a demonstration of the pattern, not a
production-grade authentication system.

---

## Deployment

Automatic deployment on **Vercel** (serverless mode with `@astrojs/vercel`).

- Images optimized to WebP.
- Privacy: `robots.txt` with `Disallow: /` and `<meta name="robots" content="noindex, nofollow">`.
- Access controlled via the `ACCESS_TOKEN` environment variable.

---

## License

**All rights reserved** — see [LICENSE](LICENSE).

This audit is original work: it may be viewed for evaluation and learning purposes,
but copying, modifying, or republishing it is not permitted. The site's code is
published for reference, with no usage license.
