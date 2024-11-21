import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access protected routes
  if (!session && (
    req.nextUrl.pathname.startsWith('/workouts') ||
    req.nextUrl.pathname.startsWith('/nutrition') ||
    req.nextUrl.pathname.startsWith('/calendar')
  )) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/workouts/:path*',
    '/nutrition/:path*',
    '/calendar/:path*',
  ],
};