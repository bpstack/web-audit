import { defineMiddleware } from 'astro:middleware';

const COOKIE_NAME = 'audit_access';
const COOKIE_MAX_AGE = 60 * 60 * 2; // 2 horas

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;

  // En desarrollo nunca bloqueamos
  if (import.meta.env.DEV) return next();

  const expected = process.env.ACCESS_TOKEN;

  // Permitir siempre los assets generados (imágenes, fuentes, css, js)
  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/_image')) {
    return next();
  }

  // Fail-closed: si en producción no hay token configurado, bloqueamos todo.
  if (!expected) {
    if (url.pathname === '/restricted') return next();
    return context.rewrite('/restricted');
  }

  // Ruta de desbloqueo: ?token=XXX setea la cookie y redirige a /
  if (url.pathname === '/unlock') {
    const provided = url.searchParams.get('token');
    if (provided && provided === expected) {
      const cookieValue = `${COOKIE_NAME}=${encodeURIComponent(expected)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
          'Set-Cookie': cookieValue,
          'Cache-Control': 'private, no-store',
        },
      });
    }
    // Token incorrecto → muestra la página bloqueada
    return context.rewrite('/restricted');
  }

  // Permitir la página de bloqueo siempre
  if (url.pathname === '/restricted') return next();

  // Cookie válida → acceso permitido (con cabeceras anti-caché)
  const cookie = cookies.get(COOKIE_NAME);
  if (cookie && cookie.value === expected) {
    const response = await next();
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return response;
  }

  // Sin cookie → reescribimos a la página bloqueada (mantiene la URL original)
  return context.rewrite('/restricted');
});
