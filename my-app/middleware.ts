import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define routes that should be protected
const isProtectedRoute = createRouteMatcher([
   '/demo(.*)',
   '/chat(.*)',
   '/dashboard(.*)', // This will protect all dashboard routes
   '/organization/(.*)', // This will protect all organization routes
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}