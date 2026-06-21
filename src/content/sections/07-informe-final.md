---
title: "Informe Final"
slug: "07-informe-final"
order: 7
description: "Resumen ejecutivo con todos los hallazgos, prioridades y recomendaciones"
---
# Informe Final de Auditoría — cliente.com

> **Fecha:** 26 de mayo de 2026
> **Elaborado por:** Salvador Pérez — [stackbp.es](https://www.stackbp.es/)
> **Publicado en:** [web-audit-bp.vercel.app](https://web-audit-bp.vercel.app/)
> **Alcance:** Análisis completo de stack tecnológico, rendimiento, seguridad, accesibilidad y SEO
> **Documentos de soporte:** Informes `00` al `06` de esta auditoría

---

## Resumen Ejecutivo

El sitio web de Cliente fue construido sobre **Drupal 8**, un CMS que llegó a su fin de vida
en noviembre de 2021. En la fecha de este análisis, el sitio acumula más de **4 años sin
soporte de seguridad oficial**, un rendimiento que Google penaliza activamente en los resultados
de búsqueda, y un sistema de analytics que lleva casi **3 años sin recoger ningún dato**.

La auditoría no ha encontrado un camino de mejora incremental viable dentro del stack actual.
Los problemas identificados son estructurales: no se pueden resolver con parches o ajustes
puntuales porque las tecnologías que los causan han llegado al final de su ciclo de vida.

**La recomendación es migrar a un nuevo sitio construido en Astro**, un framework moderno para
sitios estáticos que resuelve todos los problemas documentados, reduce el coste de
infraestructura a cero y elimina por completo la superficie de ataque de seguridad.

---

## Estado Actual: Cuadro de Mando

| Área              | Puntuación actual          | Valoración     |
| ----------------- | -------------------------- | -------------- |
| **Rendimiento**   | 41/100 desktop · 53/100 mobile | 🔴 Crítico  |
| **Seguridad**     | 2 componentes críticos EOL | 🔴 Crítico     |
| **Analytics**     | GA4 activo — UA obsoleto pendiente de eliminar | 🟠 Mejorable |
| **Accesibilidad** | 100/100 desktop · 89/100 mobile (76/100 home) | 🟠 Mejorable |
| **SEO técnico**   | 100/100 (básico correcto)  | 🟠 Incompleto  |

---

## Hallazgos Principales por Área

### Rendimiento — 🔴 Crítico

El indicador más grave es el **LCP móvil de 15.2 segundos**. El umbral de Google para
considerar un sitio "bueno" es 2.5 segundos — cliente.com está 6 veces por encima del límite
de lo "malo". Desde mayo 2021, Google utiliza esta métrica como factor de ranking en búsquedas
móviles.

Causas principales:
- Imágenes cargadas vía JavaScript en lugar de HTML (el navegador no puede precargarlas)
- Bootstrap 3 completo cargado en todas las páginas aunque solo se use una fracción
- 15 librerías JavaScript incluidas globalmente, varias de ellas abandonadas desde 2016
- Fuentes de Google cargadas de forma bloqueante

**Impacto directo:** posiciones de ranking inferiores a competidores con mejor rendimiento,
especialmente en búsquedas desde dispositivos móviles.

---

### Seguridad — 🔴 Crítico

Dos componentes del stack son críticos y no tienen solución dentro de la arquitectura actual:

**Drupal 8** llegó a su fin de vida el 2 de noviembre de 2021. Desde esa fecha no recibe
parches de seguridad oficiales. Cualquier vulnerabilidad descubierta en el core de Drupal 8
a partir de esa fecha queda sin corregir de forma permanente.

**Apache 2.4.10** es una versión de 2014 — lleva más de 12 años sin actualizaciones de
seguridad en el servidor.

Adicionalmente:
- jQuery 3.4.1 tiene dos vulnerabilidades XSS conocidas (CVE-2020-11022 y CVE-2020-11023)
- La cabecera `Content-Security-Policy` está ausente, dejando el sitio expuesto a inyección
  de scripts
- Una API key de Google Maps está expuesta en el código fuente público

Ninguno de estos problemas puede resolverse sin reemplazar los componentes afectados.

---

### Analytics — 🟠 Mejorable

El script de Universal Analytics (`UA-XXXXXXXXX-1`) lleva instalado en la web desde julio de
2023 **sin procesar ningún dato** — Google desactivó UA en esa fecha. Esto significa que
aproximadamente 3 años de tráfico, fuentes y comportamiento de usuario son irrecuperables.

**La situación actual:** GA4 ya está instalado y activo vía Google Tag Manager
(`G-XXXXXXXXXX`, confirmado en análisis de Coverage). Sin embargo, **el script de UA nunca
fue eliminado**, de modo que ambas propiedades corren simultáneamente sumando **765 KB** de
código de analítica por carga sin ningún beneficio adicional.

**Acción urgente:** Verificar en Google Analytics que `G-XXXXXXXXXX` tiene datos activos y
los eventos clave configurados, y eliminar el script UA del sitio.

---

### Accesibilidad — 🟠 Mejorable

El score de desktop es 100/100. El score móvil baja a 89/100 por dos causas concretas y
corregibles:

1. Áreas de toque insuficientes en el footer y el selector de idioma (mínimo recomendado:
   48×48 píxeles)
2. Texto del footer a 11px — por debajo del tamaño mínimo recomendado para legibilidad

Problemas estructurales adicionales (que no penalizan el score pero afectan a usuarios con
necesidades especiales):
- El menú móvil no anuncia su estado a lectores de pantalla
- La jerarquía de títulos tiene saltos (h2 → h4 sin h3 intermedio)
- El enlace de LinkedIn no tiene texto accesible

---

### SEO — 🟠 Incompleto

El score técnico básico de Lighthouse es 100/100 — los fundamentos están correctos (título,
descripción, canonical, hreflang). Sin embargo, el SEO avanzado tiene carencias importantes:

- **Sin Open Graph ni Twitter Cards:** cada enlace compartido en LinkedIn, X o WhatsApp genera
  un preview vacío, sin imagen ni descripción personalizada
- **Sin datos estructurados (JSON-LD):** Google no puede mostrar rich results (breadcrumbs
  en snippets, sitelinks) ni indexar las ofertas de empleo en Google Jobs
- **Core Web Vitals en rojo:** penalización activa de ranking en móvil por el LCP

---

## Comparativa Antes / Después

| Métrica / Característica        | Sitio actual              | Sitio en Astro (objetivo)         |
| ------------------------------- | ------------------------- | --------------------------------- |
| LCP móvil                       | 15.2 s 🔴                 | < 1.5 s 🟢                        |
| Performance Lighthouse (mobile) | 53 🔴                     | > 95 🟢                           |
| Performance Lighthouse (desktop)| 41 🔴                     | > 95 🟢                           |
| Accesibilidad móvil             | 89 🟠                     | 100 🟢                            |
| Vulnerabilidades de seguridad   | 2 críticas + 2 altas      | 0 (sin superficie de ataque)      |
| Coste de hosting                | VPS (pago mensual)        | CDN estático (gratuito)           |
| Analytics funcionando           | Parcialmente — GA4 activo, UA obsoleto sin eliminar | Sí (GA4 limpio desde el primer deploy) |
| Open Graph / social preview     | Ausente                   | Implementado en todas las páginas |
| Datos estructurados JSON-LD     | Ausente                   | Organization, Breadcrumb, Jobs    |
| Parches de seguridad disponibles| No (stack EOL)            | Sí (dependencias npm activas)     |
| Actualizaciones de contenido    | CMS Drupal (administrador)| Markdown en git (cualquier editor)|

---

## Plan de Acción Priorizado

### Acciones urgentes — independientes de la decisión de migrar

Estas acciones pueden y deben aplicarse al sitio actual **ahora mismo**, mientras se decide
o prepara la migración:

| Prioridad | Acción                                         | Esfuerzo | Impacto               |
| --------- | ---------------------------------------------- | -------- | --------------------- |
| 🔴 1      | Verificar datos de GA4 (`G-XXXXXXXXXX`) y eliminar script UA | 1h | Limpiar 355 KB de código muerto |
| 🔴 2      | Verificar restricciones de la Google Maps API key en Google Cloud Console | 30min | Evitar uso fraudulento de la key |
| 🟠 3      | Desactivar Twig debug en producción            | 15min    | Eliminar comentarios HTML con rutas de archivos internos |
| 🟠 4      | Bloquear `/core/CHANGELOG.txt` en `.htaccess`  | 15min    | Eliminar fingerprinting de versión |
| 🟠 5      | Eliminar cabecera `X-Generator` de Drupal      | 30min    | Eliminar exposición del CMS y versión |
| 🟡 6      | Aumentar tamaño de fuente del footer a ≥ 14px  | 15min    | Recuperar puntos de accesibilidad móvil |

---

### Plan de migración — fases y cronograma orientativo

El desglose completo por fases, duraciones y entregables está documentado en la **sección `06 · Propuesta de Migración`**. Resumen: ~10–13 días de trabajo estructurado en 9 fases (reconocimiento de activos → scaffold → componentes → páginas → optimización → SEO/GA4 → seguridad → QA → deploy).

---

## Conclusión

cliente.com es un sitio funcional con una identidad de marca consolidada, buena estructura de
URLs, contenido correcto y las bases técnicas del SEO en orden. No parte de cero.

Lo que tiene es una deuda tecnológica acumulada durante los últimos 4 años que ya no es posible
saldar de forma incremental. El stack subyacente — Drupal 8, Apache 2.4.10, Bootstrap 3,
jQuery 3.4.1 — ha llegado al final de su ciclo de vida de forma simultánea, sin un camino de
actualización que no sea equivalente en esfuerzo a construir de nuevo.

La migración a Astro no es un cambio por el cambio. Es la ruta más corta para tener un sitio
que represente correctamente a una empresa de tecnología en 2026: rápido, seguro, medible,
accesible y con coste de mantenimiento bajo.

Los 10–13 días de esfuerzo estimado son una inversión puntual. El estado actual es un coste
recurrente y creciente.

---

## Propuesta de Segunda Fase — Nueva Landing Corporativa

Esta auditoría incluye una **propuesta de migración completa a Astro** (ver `06-propuesta.md`) que resuelve de forma estructural todos los problemas documentados. El ROADMAP de diseño e implementación está elaborado y listo para desarrollar en cuanto se decida iniciar el trabajo.

Si Cliente decide dar ese paso, la segunda fase cubriría:

- Diseño a medida sobre el sistema de identidad actual de la empresa
- Implementación sobre el stack propuesto (Astro + Tailwind 4 + CDN estático)
- Todos los problemas de esta auditoría resueltos desde la arquitectura, no parcheados
- Estimación: **10–13 días de trabajo**

---

## Nota metodológica

Este análisis se realizó sin acceso al servidor, sin credenciales y sin ningún acuerdo previo con Cliente. El detalle completo de herramientas utilizadas, condiciones del análisis y flujo de trabajo reproducible está documentado en la **sección `00 · Metodología y Herramientas`**.

---

## Documentación de soporte

| Informe | Contenido |
| ------- | --------- |
| `00-metodologia.md` | Herramientas usadas, cómo reproducir el análisis |
| `01-stack.md` | Inventario completo del stack actual |
| `02-rendimiento.md` | Análisis detallado de Core Web Vitals y causas |
| `03-seguridad.md` | CVEs, cabeceras HTTP, API keys, Drupal EOL |
| `04-accesibilidad.md` | Lighthouse, WCAG, análisis del DOM |
| `05-seo.md` | SEO técnico, Open Graph, JSON-LD, analytics |
| `06-propuesta.md` | Justificación, stack propuesto, estimación de esfuerzo |
