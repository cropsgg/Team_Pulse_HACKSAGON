import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'hi', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'pt', 'it', 'nl', 'ru'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The locale detection is enabled by default
  localeDetection: true,

  // Configure the locale prefix
  localePrefix: 'as-needed',

  // Configure the pathname matcher
  pathnames: {
    '/': '/',
    '/explore': '/explore',
    '/how-it-works': '/how-it-works',
    '/governance': '/governance',
    '/impact': '/impact',
    '/dashboard': '/dashboard',
    '/console': '/console',
    '/create/ngo': '/create/ngo',
    '/create/startup': '/create/startup',
    '/create/personal': '/create/personal',
    '/help': '/help',
    '/login': '/login',
    '/signup': '/signup',
  }
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(hi|es|fr|de|ar|zh|ja|pt|it|nl|ru)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)' 
  ]
}; 