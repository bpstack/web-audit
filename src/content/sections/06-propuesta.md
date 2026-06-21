---
title: "Propuesta de Migración"
slug: "06-propuesta"
order: 6
description: "Migración de Drupal 8 a Astro 5 + Tailwind 4 con plan de fases y estimación"
---
# Propuesta de Migración a Astro — cliente.com

> **Fecha:** 26 de mayo de 2026
> **Basado en:** Informes `01` al `05` de esta auditoría
> **Destinatario:** Equipo técnico y dirección de Cliente

---

## 1. Por qué este sitio necesita migrar — el argumento real

Antes de hablar de tecnología, hay que entender qué está costando el sitio actual **hoy mismo**,
no en el futuro.

### 1.1 El sitio está activamente perdiendo negocio

**El problema de rendimiento es una penalización de Google en curso.**

Desde mayo 2021, Google usa los Core Web Vitals como factor de ranking. El LCP móvil de
cliente.com es de **15.2 segundos** — el umbral de "bueno" es 2.5 segundos, el de "malo" es
4 segundos. Cliente está 6 veces por encima del límite de lo "malo".

Esto no es una advertencia. Es una penalización activa en los resultados de búsqueda móvil,
todos los días, frente a cualquier competidor con un sitio bien construido.

**El problema de analytics lleva ~3 años sin resolverse.**

Universal Analytics (el sistema de medición instalado) fue desactivado por Google el 1 de julio
de 2023. Desde esa fecha, el script de Analytics sigue en la web, pero no recoge ningún dato.
Cliente lleva casi tres años tomando decisiones de negocio digital — campañas, contenido,
contrataciones — sin saber qué visita su web, desde dónde, ni qué páginas funcionan.

**La web contradice lo que Cliente vende.**

Cliente es una empresa de IT. Su web es la primera impresión de cualquier candidato o cliente
que los busca en Google. Un site con un Lighthouse de 41 en desktop, cargado de librerías
abandonadas de 2016, con un CMS sin soporte de seguridad desde 2021, es una contradicción
directa con el mensaje de competencia tecnológica que la empresa comunica.

---

### 1.2 El sitio es un riesgo de seguridad sin parches disponibles

El estado actual de la infraestructura acumula **dos problemas críticos sin solución posible**
dentro del stack actual:

| Componente       | Estado               | Riesgo                                              |
| ---------------- | -------------------- | --------------------------------------------------- |
| **Drupal 8**     | EOL desde nov. 2021  | Sin parches de seguridad oficiales — nunca más      |
| **Apache 2.4.10**| Versión de 2014      | Múltiples CVEs acumulados en 12 años sin actualizar |
| **jQuery 3.4.1** | CVE-2020-11022/11023 | Vulnerabilidades XSS conocidas y sin parchear       |
| **Bootstrap 3**  | EOL desde 2019       | Sin actualizaciones de seguridad                    |

La palabra clave es **sin solución posible**: actualizar Drupal 8 a Drupal 10 es una migración
mayor, no una actualización. El tema Rhythm no tiene versión para D10. Las librerías del tema
(WOW.js, OWL Carousel, jquery.appear, countTo, jQuery YTP) están abandonadas — sus
repositorios llevan años sin commits.

No hay un camino de actualización incremental. El stack actual es un callejón sin salida.

---

### 1.3 El mantenimiento actual tiene coste creciente y retorno decreciente

Mantener Drupal 8 en 2026 requiere:

- Un servidor VPS con PHP, MySQL y Apache (coste mensual + administración)
- Conocimiento específico de Drupal (escaso y caro en el mercado actual)
- Vigilancia manual de vulnerabilidades (sin actualizaciones automáticas del core)
- Gestión de un tema comercial abandonado que nadie puede actualizar

Cada euro invertido en mantener este stack es un euro que no se invierte en el negocio.

---

## 2. Por qué Astro es la solución correcta para este caso

### 2.1 El tipo de web determina la tecnología

Cliente.com es una **web corporativa con contenido prácticamente estático**:

- Página de inicio
- Servicios (empresas / candidatos)
- Sobre nosotros
- Contacto
- Ofertas de empleo
- Páginas legales

Este tipo de web **no necesita un CMS dinámico**. No hay login de usuarios, no hay tienda,
no hay comentarios en tiempo real. El 95% del contenido cambia como mucho una vez al mes.
Usar Drupal para esto es como usar un camión para ir al supermercado.

**Astro** es un framework diseñado exactamente para este caso: genera HTML estático en tiempo
de build y lo sirve desde un CDN global, sin servidor, sin base de datos, sin PHP.

### 2.2 Comparativa directa: Drupal 8 actual vs. Astro propuesto

| Criterio                     | Drupal 8 actual                   | Astro propuesto                      |
| ---------------------------- | --------------------------------- | ------------------------------------ |
| LCP móvil esperado           | 15.2 s                            | < 1.5 s                              |
| Performance Lighthouse       | 41 (desktop) / 53 (mobile)        | > 95 en ambos                        |
| TTFB                         | ~200–500 ms (PHP + MySQL)         | ~10–50 ms (CDN edge)                 |
| Superficie de ataque         | Drupal core + 30+ módulos + PHP   | Cero — assets estáticos              |
| Parches de seguridad         | Ninguno disponible (EOL)          | `npm update` — dependencias activas  |
| Coste de hosting             | VPS con Apache + PHP + MySQL      | CDN estático (Vercel/Netlify, gratis)|
| Mantenimiento técnico        | Alto (Drupal, PHP, módulos, tema) | Bajo (dependencias npm estándar)     |
| Tiempo para un cambio de contenido | Edición en CMS + caché Drupal | Edición en archivo + build ~30s    |
| Accesibilidad móvil          | 89                                | 100 (desde el diseño)                |
| Open Graph / JSON-LD / GA4   | Ausente                           | Implementado desde el día 1          |
| Analytics funcionando        | No (UA deprecado desde jul. 2023) | Sí (GA4 desde el primer deploy)      |

### 2.3 El argumento de hosting merece un párrafo aparte

Un sitio estático en Vercel o Netlify tiene:

- **CDN global** con nodos en decenas de ciudades — el HTML llega al usuario desde el nodo
  más cercano geográficamente, sin que el servidor de Cliente intervenga.
- **HTTPS automático** con renovación de certificado sin gestión manual.
- **Deploy automático** con cada push a `main` — no hay FTP, no hay sincronización manual.
- **Coste:** $0 para sitios de este tráfico en el plan gratuito de ambas plataformas.

Frente a esto, el VPS actual tiene coste mensual, necesita administración del sistema operativo,
y cualquier fallo del servidor tumba la web sin CDN de respaldo.

---

## 3. Stack técnico propuesto

```
Astro 5.x               → Framework SSG — genera HTML estático en build
Tailwind CSS 4.x        → Sistema de diseño utility-first, reemplaza Bootstrap 3
TypeScript              → Tipado estático en componentes Astro
Astro Content Collections → Gestión de ofertas de empleo en Markdown/MDX
Netlify / Vercel        → Hosting estático con CDN global
Cloudflare              → DNS + CDN adicional + WAF gratuito
Netlify Forms           → Formulario de contacto sin backend propio
Fontsource              → Fuentes self-hosted (elimina petición a Google Fonts)
@astrojs/sitemap        → Generación automática del sitemap.xml en cada build
sharp (astro:assets)    → Optimización automática de imágenes a WebP/AVIF en build
GA4                     → Analytics real desde el primer día
```

### Por qué estas elecciones y no otras

**Astro 5 vs. Next.js / Nuxt / SvelteKit:**
Next.js y similares son frameworks pensados para aplicaciones web complejas con hidratación
en cliente. Para un sitio mayoritariamente estático generan overhead innecesario. Astro por
defecto envía **0 KB de JavaScript** al cliente — el JS solo se incluye cuando un componente
específico lo necesita ("islands architecture").

**Tailwind 4 vs. Bootstrap:**
Bootstrap 3 pesa ~140 KB minificado e incluye estilos para cientos de componentes que no se
usan. Tailwind genera solo el CSS de las clases que realmente aparecen en el HTML — un sitio
de este tamaño termina con 5–15 KB de CSS. Además, el diseño es completamente a medida, no
una plantilla reconocible.

**Content Collections vs. CMS externo:**
Para las ofertas de empleo, Astro Content Collections permite gestionar el contenido en
archivos Markdown con frontmatter tipado. Sin base de datos, sin panel de administración
externo, sin coste adicional. Si en el futuro el volumen de contenido crece y el cliente
necesita un CMS visual, se puede conectar un headless CMS (Sanity, Contentful, Storyblok)
sin cambiar el framework.

**Netlify Forms vs. backend propio:**
El formulario de contacto es el único punto "dinámico" del sitio. Netlify Forms procesa
envíos de formularios HTML sin necesidad de ningún servidor. El resultado llega por email
al cliente. Cero backend, cero mantenimiento, cero coste.

---

## 4. Qué se resuelve con la migración

### 4.1 Todos los problemas críticos identificados en la auditoría

| Problema documentado                        | Informe     | Resuelto en Astro                              |
| ------------------------------------------- | ----------- | ---------------------------------------------- |
| Drupal 8 EOL — sin parches de seguridad     | `01`, `03`  | Eliminado — sin CMS en producción              |
| Apache 2.4.10 de 2014                       | `01`, `03`  | Eliminado — sin servidor propio                |
| jQuery CVE-2020-11022 / 11023               | `03`        | Eliminado — sin jQuery                         |
| LCP móvil 15.2 s                            | `02`        | Imágenes optimizadas + CDN edge → < 1.5 s      |
| Performance 41/53                           | `02`        | Sin JS innecesario, sin PHP → > 95             |
| Bootstrap 3 + 15 librerías JS               | `01`, `02`  | Reemplazado por Tailwind + 0 KB JS por defecto |
| Universal Analytics deprecado              | `01`, `05`  | GA4 desde el día 1                             |
| Sin Open Graph / Twitter Cards             | `05`        | Componente `<Head>` con OG en todas las páginas|
| Sin JSON-LD                                | `05`        | Organization, BreadcrumbList, JobPosting       |
| Accesibilidad móvil 89                     | `04`        | Sistema de diseño con targets táctiles y tipografía correctos |
| Google Fonts bloqueante                    | `01`, `02`  | Fontsource self-hosted                         |
| CSP ausente                                | `01`, `03`  | CSP estricta en headers del CDN                |
| API key Maps expuesta                      | `03`        | Mapa como iframe embed sin API key             |
| `<meta name="Generator">` expuesto         | `05`        | Astro no lo añade                              |
| Sin sitemap automático                     | `05`        | `@astrojs/sitemap` en cada build               |

### 4.2 Mejoras que el sitio actual no puede dar

Más allá de resolver los problemas existentes, la migración permite implementar cosas que
Drupal 8 + Rhythm no pueden ofrecer:

- **Diseño completamente a medida** — sin las limitaciones visuales del tema Rhythm
- **Actualizaciones de contenido sin riesgo** — editar un Markdown no puede romper el sitio
- **Deploy preview automático** — cada PR genera una URL de preview para que el cliente valide
  antes de publicar
- **Historial de cambios en git** — todo el contenido y el código versionado, reversible
- **JobPosting schema** — las ofertas de empleo aparecen en Google Jobs (canal gratuito)

---

## 5. Estimación de esfuerzo

El sitio tiene aproximadamente **6–8 páginas** de contenido real. No hay funcionalidades
complejas (sin tienda, sin área privada, sin comentarios).

| Fase                                      | Esfuerzo estimado |
| ----------------------------------------- | ----------------- |
| Fase 0 — Recolección de activos           | 0.5 días          |
| Fase 1 — Scaffold y configuración base    | 0.5 días          |
| Fase 2 — Sistema de diseño y componentes  | 2–3 días          |
| Fase 3 — Páginas principales              | 3–4 días          |
| Fase 4 — Optimización de activos          | 1 día             |
| Fase 5 — SEO, analytics y tracking        | 1 día             |
| Fase 6 — Seguridad y cabeceras HTTP       | 0.5 días          |
| Fase 7 — QA y validación                  | 1–2 días          |
| Fase 8 — Deploy y migración de dominio    | 0.5 días          |
| **Total estimado**                        | **~10–13 días**   |

> El rango depende principalmente de la complejidad del diseño (Fase 2 y 3) y de si el cliente
> requiere iteraciones de revisión. Un diseño definido previamente acorta el tiempo; un diseño
> con muchas revisiones lo alarga.

---

## 6. Lo que no cambia con la migración

Es importante ser explícito sobre el alcance para evitar expectativas incorrectas:

- **Las URLs principales** se mantienen (`/es/empresas`, `/es/candidatos`, etc.) con redirects
  301 para cualquier URL que cambie de estructura.
- **El contenido** — los textos actuales se migran tal cual. La migración no incluye reescritura
  de copy salvo que el cliente lo solicite.
- **El dominio** — `cliente.com` permanece. El cambio de hosting es transparente para los usuarios.
- **El SEO acumulado** — con los redirects correctos, Google transfiere la autoridad de las URLs
  antiguas a las nuevas. La migración no reinicia el SEO desde cero.

---

## 7. Riesgos y cómo mitigarlos

| Riesgo                                      | Probabilidad | Mitigación                                              |
| ------------------------------------------- | ------------ | ------------------------------------------------------- |
| Pérdida de posicionamiento SEO post-migración | Baja        | Redirects 301 exhaustivos + monitorización en GSC 30 días |
| El cliente necesita editar contenido frecuentemente | Media  | Documentar el proceso de edición en Markdown; si es bloqueante, conectar Netlify CMS o Decap CMS (gratis) |
| Imágenes del sitio actual inaccesibles       | Baja         | Fase 0 dedicada a descargar todos los activos antes de empezar |
| El nuevo diseño no satisface al cliente      | Media        | Deploy preview automático en cada PR — el cliente valida antes de publicar |

---

## 8. Recomendación final

**La migración a Astro no es una mejora técnica opcional — es la única salida viable del
callejón sin salida en el que está el stack actual.**

Parchear Drupal 8 no es posible. Actualizar a Drupal 10 requiere el mismo esfuerzo que
migrar a Astro, con el resultado de volver a depender de un CMS complejo para un sitio que
no lo necesita. Mantener el estado actual es asumir un riesgo de seguridad creciente con
un coste de mantenimiento que no genera mejoras.

El nuevo sitio en Astro resuelve los 15+ problemas documentados en esta auditoría, reduce
el coste de hosting a cero, elimina la superficie de ataque de seguridad, y entrega un
producto que representa correctamente la imagen de una empresa tecnológica en 2026.

El esfuerzo estimado (~10–13 días) es proporcionado al valor obtenido. A modo de referencia,
el tiempo que se invierte anualmente en mantener el stack actual (actualizaciones manuales,
vigilancia de seguridad, gestión del VPS) es comparable o superior a ese esfuerzo puntual.
