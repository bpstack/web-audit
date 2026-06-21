---
title: "Stack Técnico"
slug: "01-stack"
order: 1
description: "Drupal 8 EOL, Apache 2.4.10, Bootstrap 3 + Foundation 5, jQuery 3.4.1 y librerías detectadas"
---
# Análisis del Stack Tecnológico — cliente.com

> **Fecha del análisis:** 26 de mayo de 2026  
> **URL analizada:** https://www.cliente.com/es/sobre-cliente  
> **Metodología:** Inspección de cabeceras HTTP, HTML fuente, archivos CSS/JS agregados,
> `robots.txt` y `CHANGELOG.txt`

---

## 1. Infraestructura y Servidor

| Componente              | Valor                      | Observación                                                               |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------- |
| **Servidor web**        | Apache 2.4.10              | Versión de 2014 — muy desactualizada, EOL desde hace años                 |
| **SO del servidor**     | Debian Linux               | Detectado por cabecera `Server: Apache/2.4.10 (Debian)`                   |
| **CMS**                 | **Drupal 8**               | EOL desde noviembre 2021 — sin parches de seguridad oficiales             |
| **Motor de plantillas** | Twig                       | Motor nativo de Drupal 8                                                  |
| **Caché**               | Drupal Internal Page Cache | Cabecera `X-Drupal-Cache: HIT` / `X-Drupal-Dynamic-Cache: MISS`           |
| **HTTPS**               | Sí                         | HSTS configurado (`max-age=15768000; includeSubdomains; preload`)         |
| **CDN**                 | Ninguno                    | Sin Cloudflare, CloudFront ni similar — todo sirve desde el propio Apache |

---

## 2. CMS: Drupal 8

El sitio está construido sobre **Drupal 8**, cuyo fin de vida (EOL) fue el **2 de noviembre de
2021**. Esto implica:

- No recibe parches de seguridad oficiales del proyecto Drupal.
- Cualquier vulnerabilidad descubierta desde esa fecha queda sin corregir a nivel de core.
- La ruta de actualización correcta sería Drupal 9 → Drupal 10, pero ambas representan migraciones
  no triviales.
- Alternativa recomendable para un sitio de tipo landing/corporativo: **migración a Astro** (ver
  informe de propuesta final).

**Evidencias de detección:**

- Cabecera HTTP: `X-Generator: Drupal 8 (https://www.drupal.org)`
- Meta tag: `<meta name="Generator" content="Drupal 8 (https://www.drupal.org)" />`
- Archivo `/core/CHANGELOG.txt` accesible públicamente (riesgo menor de fingerprinting)
- Archivo `/robots.txt` con plantilla estándar de Drupal

![/core/CHANGELOG.txt accesible públicamente — cualquier visitante puede confirmar que el CMS es Drupal 8 sin necesidad de escaneo activo](../../assets/screenshots/changelog-public.webp)

---

## 3. Tema: Rhythm + rhythm_sub

### ¿Qué es Rhythm?

**Rhythm** es un tema comercial premium para Drupal 8, originalmente distribuido en marketplaces
como ThemeForest. Sus características principales:

- Basado en **Bootstrap 3.3.4** (EOL desde 2019)
- Incluye OWL Carousel, WOW.js, Font Awesome, jquery.appear, countTo y jQuery YTP
- Sistema de layout visual mediante el módulo `nikadevs_cms`
- Diseño orientado a agencias/corporativo con secciones parallax, contadores animados y sliders

### Sub-tema: rhythm_sub

`rhythm_sub` es la personalización específica para Cliente: logotipo, colores, plantillas Twig
sobreescritas. Estructura detectada:

```
themes/custom/rhythm/          → tema base (Bootstrap 3, librerías JS)
themes/custom/rhythm_sub/      → sub-tema con brand Cliente
  ├── logotipo.png
  └── templates/
      ├── layout/html.html.twig
      ├── layout/page.html.twig
      └── we_megamenu/
```

### ¿Es un problema?

Sí, por varios motivos:

1. **Bootstrap 3.3.4 está obsoleto.** EOL en 2019. No soporta flexbox nativo moderno, CSS Grid, ni
   tiene soporte oficial.
2. **Carga pesada innecesaria.** El tema arrastra ~15 librerías JS (OWL Carousel, WOW, YTP, appear,
   countTo...) aunque no todas se usen en cada página.
3. **Temas comerciales de Drupal 8 ya no se actualizan.** El autor original no dará soporte de
   seguridad ni compatibilidad con versiones más nuevas.
4. **Acoplamiento fuerte.** La personalización está atada a Bootstrap 3, lo que hace difícil
   modernizar el CSS sin reescribir el tema completo.

**Propuesta:** Para una web corporativa/landing de este tipo, la solución óptima es abandonar el
stack Drupal + Rhythm y migrar a **Astro** con un sistema de componentes propio, eliminando todo el
peso heredado.

---

## 4. Módulos Drupal detectados

| Módulo                 | Versión | Función                                                | Estado                         |
| ---------------------- | ------- | ------------------------------------------------------ | ------------------------------ |
| `we_megamenu`          | —       | Mega menú responsive con dropdowns                     | Sin mantenimiento activo en D8 |
| `eu_cookie_compliance` | 1.9     | Banner de consentimiento de cookies (GDPR)             | Módulo contrib                 |
| `nikadevs_cms`         | —       | Constructor de páginas visual (propio del tema Rhythm) | Custom/comercial               |
| `core/stable`          | —       | Tema base del core de Drupal 8                         | Core                           |

---

## 5. JavaScript

### Librerías detectadas

| Librería               | Versión   | Función                             | Estado                           |
| ---------------------- | --------- | ----------------------------------- | -------------------------------- |
| **jQuery**             | **3.4.1** | Base JS                             | Desactualizado (ver seguridad)   |
| **jquery.cookie**      | 1.4.1     | Gestión de cookies en cliente       | Sin mantenimiento                |
| **Bootstrap JS**       | 3.3.4     | Componentes UI (modales, dropdowns) | EOL 2019                         |
| **Modernizr**          | 2.8.3     | Feature detection para IE           | Obsoleto — los navegadores modernos no lo necesitan |
| **Snap.svg**           | 0.3.0     | Animaciones SVG                     | Sin mantenimiento activo         |
| **Masonry**            | —         | Layout de grid tipo mampostería     | Activo                           |
| **Isotope**            | —         | Filtrado/ordenación de elementos    | Activo                           |
| **lit-html**           | 3.3.2     | Templates HTML (web components)     | Activo — inesperado en Drupal 8  |
| **lit-element**        | 4.2.2     | Web components base                 | Activo — inesperado en Drupal 8  |
| **OWL Carousel**       | —         | Slider/carrusel de contenido        | Activo                           |
| **WOW.js**             | —         | Animaciones al hacer scroll         | Abandoneado (último commit 2016) |
| **jquery.appear**      | —         | Detección de elementos en viewport  | Sin mantenimiento                |
| **countTo**            | —         | Animación de contadores numéricos   | Sin mantenimiento                |
| **jQuery YTP**         | —         | Vídeo de fondo desde YouTube        | Sin mantenimiento                |
| **Google Maps JS API** | —         | Mapa incrustado                     | Activo (ver seguridad)           |

### Delivery de assets

Los archivos JS y CSS se sirven **agregados y minificados** por Drupal (sistema de agregación del
core), con hashes en los nombres de archivo. No se usa ningún CDN externo para estos assets — todo
se sirve desde el propio servidor Apache.

---

## 6. CSS y Estilos

| Tecnología            | Versión | Detalle                                                 |
| --------------------- | ------- | ------------------------------------------------------- |
| **Bootstrap CSS**     | 3.3.4   | Grid de 12 columnas, componentes UI — EOL 2019          |
| **ZURB Foundation**   | 5.3.1   | Segundo framework CSS cargado simultáneamente — EOL 2016 |
| **Animate.css**       | —       | Clases `fadeInLeft`, `fadeInUp` (integradas con WOW.js) |
| **Font Awesome**      | —       | Iconos vectoriales                                      |
| **ET-Line**           | —       | Set adicional de iconos vectoriales                     |

> **Problema crítico de CSS:** El sitio carga **Bootstrap 3 y ZURB Foundation 5 al mismo tiempo**.
> Son dos frameworks CSS completos con sistemas de grid incompatibles. Ambos están en EOL.
> Esto explica en parte el 96% de CSS sin usar detectado en Coverage (ver `02-rendimiento`).

---

## 7. Tipografía

Servidas desde **Google Fonts** (petición externa en cada carga):

| Fuente        | Pesos cargados                      | Uso                       |
| ------------- | ----------------------------------- | ------------------------- |
| **Open Sans** | 300, 400, 700, 400italic, 700italic | Cuerpo de texto principal |
| **Dosis**     | 300, 400, 700                       | Titulares / headings      |

> **Nota:** Las fuentes se cargan con `@import url(//fonts.googleapis.com/...)` dentro del CSS
> principal, lo que bloquea el render. El método óptimo es cargarlas vía `<link rel="preconnect">` y
> `<link rel="stylesheet">` en el `<head>` con `font-display: swap`.

---

## 8. Analytics y Marketing

| Servicio                | ID / Identificador                 | Observación                                                 |
| ----------------------- | ---------------------------------- | ----------------------------------------------------------- |
| **Google Analytics**    | `UA-XXXXXXXXX-1`                   | Universal Analytics — **deprecado por Google en jul. 2023** |
| **GA4**                 | `G-XXXXXXXXXX`                    | Detectado en Coverage — instalado pero UA nunca eliminado   |
| **Google Tag Manager**  | —                                  | Detectado por Wappalyzer — gestor de tags activo            |
| **Mailchimp**           | `mcjs-connected` (chimpstatic.com) | Script de integración para formularios / newsletter         |

![Wappalyzer — stack completo: Drupal 8, Apache 2.4.10, Bootstrap 3.3.4, ZURB Foundation 5.3.1, jQuery 3.4.1, GTM, lit-element 4.2.2, Modernizr 2.8.3, Isotope, Masonry, Snap.svg](../../assets/screenshots/wappalyzer-stack.webp)

> **Alerta:** Universal Analytics (prefijo `UA-`) dejó de procesar datos el 1 de julio de 2023.
> GA4 está instalado en paralelo (`G-XXXXXXXXXX`, confirmado en Coverage JSON) pero UA nunca fue
> eliminado — ambos corren simultáneamente sumando **765 KB** de código de analítica por carga
> (ver `02-performance` para detalle de Coverage).

---

## 9. APIs de Terceros

| Servicio               | Clave / Endpoint                          |
| ---------------------- | ----------------------------------------- |
| **Google Maps JS API** | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |

Ver informe de seguridad (`03-seguridad.md`) para análisis de riesgo de la API key expuesta.

---

## 10. Internacionalización

- Sistema multiidioma nativo de Drupal 8
- Idiomas: **Español** (`/es/`) e **Inglés** (`/en/`)
- `hreflang` correctamente implementado en cabeceras `<link>` y en HTTP headers

---

## 11. Privacidad y Cookies

- Módulo `eu_cookie_compliance` v1.9 con modo **opt-in**
- Banner propio (sin Cookiebot, OneTrust ni soluciones de terceros)
- Color personalizado `#0779bf`
- Sin categorización granular de cookies (solo aceptar / rechazar)

---

## 12. Cabeceras de Seguridad HTTP

| Cabecera                    | Valor configurado                              | Valoración                |
| --------------------------- | ---------------------------------------------- | ------------------------- |
| `Strict-Transport-Security` | `max-age=15768000; includeSubdomains; preload` | Correcto                  |
| `X-Frame-Options`           | `SAMEORIGIN`                                   | Correcto                  |
| `X-Content-Type-Options`    | `nosniff`                                      | Correcto                  |
| `X-UA-Compatible`           | `IE=edge`                                      | Obsoleto (IE está muerto) |
| `Content-Security-Policy`   | **No detectada**                               | Ausente — riesgo XSS      |
| `Permissions-Policy`        | **No detectada**                               | Ausente                   |
| `Referrer-Policy`           | **No detectada**                               | Ausente                   |

Ver análisis completo en `03-seguridad.md`.

---

## 13. Resumen de Riesgos por Área

| Área              | Nivel de riesgo | Motivo principal                                   |
| ----------------- | --------------- | -------------------------------------------------- |
| CMS (Drupal 8)    | 🔴 Alto         | EOL — sin parches de seguridad desde nov. 2021     |
| Servidor (Apache) | 🔴 Alto         | v2.4.10 de 2014, sin soporte activo                |
| Tema (Rhythm)     | 🟠 Medio-Alto   | Bootstrap 3 EOL, librerías abandonadas             |
| jQuery 3.4.1      | 🟠 Medio        | 2 CVEs XSS conocidos (ver seguridad)               |
| Google Analytics  | 🟠 Medio        | UA deprecado, probable pérdida de datos analíticos |
| Google Maps API   | 🟡 Medio        | Key expuesta sin restricciones verificadas         |
| Tipografía        | 🟡 Bajo-Medio   | Carga bloqueante de Google Fonts                   |
| Cookies/GDPR      | 🟡 Bajo         | Sin categorización granular                        |
| CSP               | 🟠 Medio        | Cabecera ausente, vector XSS sin mitigar           |
