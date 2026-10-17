import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const PROTECTED = [
  '/browse',
  '/buy',
  '/sell',
  '/search',
  '/list',
  '/dashboard',
  '/my-account',
  '/subscribe',
  '/reveal-success',
  '/pay-success',
  '/sale-success',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  if (!isProtected) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  // Track every cookie Supabase wants to set, so we can re-apply them
  // to whichever response object we ultimately return (including a
  // redirect response, which is built separately below).
  let pendingCookies = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies = cookiesToSet;
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/account';
    url.search = '';
    url.searchParams.set('redirect', pathname);

    const redirectResponse = NextResponse.redirect(url);

    // Re-apply any refreshed session cookies onto the redirect response,
    // otherwise a token refresh done during getUser() is silently dropped.
    pendingCookies.forEach(({ name, value, options }) =>
      redirectResponse.cookies.set(name, value, options)
    );

    // If Supabase rejected the token (4xx), the cookie is stale or revoked.
    // Delete it here, otherwise /account sees the old cookie, sends the user
    // back to a protected page, and the loop repeats.
    // A network or 5xx error is NOT treated as stale, so users are not
    // logged out by a temporary Supabase problem.
    const tokenRejected =
      error && error.status && error.status >= 400 && error.status < 500;

    if (tokenRejected) {
      request.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith('sb-')) {
          redirectResponse.cookies.set(name, '', { maxAge: 0, path: '/' });
        }
      });
    }

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|account/callback|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|js|css|woff2?)).*)',
  ],
};