import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { ClerkMiddlewareAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const isPublicApiRoute = createRouteMatcher([
  '/api/quest(.*)',
  '/api/profile',
  '/api/announcement(.*)',
  '/api/notifications(.*)',
  '/api/webhooks(.*)',
  '/api/cron(.*)',
  '/api/shop/catalog',
  '/api/shop(.*)',
]);

/** Sans préfixe `/en` pour comparer aux routes « logiques » (as-needed). */
function stripLocale(pathname: string): string {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return pathname === '/en' ? '/' : pathname.slice(3) || '/';
  }
  return pathname;
}

/** Clerk absent : on refuse les routes protégées au lieu de les servir sans contrôle. */
function authUnavailable() {
  return new NextResponse('Authentification indisponible : Clerk non configuré.', {
    status: 503,
  });
}

function isPublicPagePath(pathname: string): boolean {
  const p = stripLocale(pathname);
  if (p === '/') return true;
  if (p.startsWith('/q/')) return true;
  if (p.startsWith('/legal')) return true;
  if (p.startsWith('/generation-quetes')) return true;
  if (p.startsWith('/aura')) return true;
  if (p.startsWith('/onboarding')) return true;
  if (p.startsWith('/sign-in')) return true;
  if (p.startsWith('/sign-up')) return true;
  return false;
}

/**
 * Clerk non configuré (pas de clés) → `clerkMiddleware` passe en mode « keyless »
 * et le middleware n'est jamais exécuté : next-intl ne réécrit plus `/` vers
 * `/fr` (localePrefix `as-needed`) et la home renvoie 404. On exécute donc la
 * même logique sans Clerk : la locale marche, l'auth est simplement inopérante
 * (aucune session possible sans clés).
 */
const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

async function handleRequest(auth: ClerkMiddlewareAuth | null, req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  /** Universal Links / App Links : fichiers publics, sans auth ni locale */
  if (pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  /** Sitemap / robots : routes Next.js (`app/sitemap.ts`, `app/robots.ts`) — hors intl + sans Clerk sinon accès cassé (404 / redirect). */
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt' || /^\/sitemap.*\.xml$/.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    if (!isPublicApiRoute(req)) {
      if (!auth) return authUnavailable();
      await auth.protect();
    }
    return NextResponse.next();
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-questia-pathname', pathname);
  requestHeaders.set(
    'x-questia-locale',
    pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr',
  );
  const reqForIntl = new NextRequest(req.url, { headers: requestHeaders });
  const intlResponse = intlMiddleware(reqForIntl);

  /** Laisser next-intl appliquer redirections (ex. négociation `Accept-Language` → `/en`). */
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/dashboard/, '/app') || '/app';
    return NextResponse.redirect(url);
  }
  if (pathname === '/en/dashboard' || pathname.startsWith('/en/dashboard/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en\/dashboard/, '/en/app') || '/en/app';
    return NextResponse.redirect(url);
  }

  const userId = auth ? (await auth()).userId : null;

  if (userId && (pathname === '/' || pathname === '/en')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === '/en' ? '/en/app' : '/app';
    return NextResponse.redirect(url);
  }

  /**
   * `auth.protect()` réécrit vers une route interne inexistante quand la session
   * manque : le visiteur non connecté recevait un 404 au lieu de la page de
   * connexion. On redirige explicitement vers le `/sign-in` de l'app, en gardant
   * la destination pour le retour après authentification.
   */
  if (!isPublicPagePath(pathname)) {
    if (!auth) return authUnavailable();
    if (!userId) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === '/en' || pathname.startsWith('/en/') ? '/en/sign-in' : '/sign-in';
      url.search = '';
      url.searchParams.set('redirect_url', `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
  }

  return intlResponse;
}

if (!hasClerkKeys) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY absentes : ' +
        'démarrage refusé en production (auth désactivée).',
    );
  }
  console.warn(
    '[middleware] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY absentes : ' +
      'pages publiques et i18n OK, routes authentifiées (/app, /api privées) en 503.',
  );
}

export default hasClerkKeys
  ? clerkMiddleware((auth, req) => handleRequest(auth, req))
  : (req: NextRequest) => handleRequest(null, req);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
