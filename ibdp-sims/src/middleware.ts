import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Define public routes that don't require authentication.
 * `createRouteMatcher` is used to create a function that checks if a given path matches the provided patterns.
 * In this case, it checks if the path starts with '/sign-in'.
 */
const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

/**
 * `clerkMiddleware` is the main middleware that handles authentication for the application.
 * It receives an asynchronous function that takes `auth` and `request` objects.
 *
 * The middleware checks if the current route is public using `isPublicRoute`.
 * If the route is not public, it ensures that the user is authenticated by calling `auth.protect()`.
 * `auth.protect()` will throw an error if the user is not signed in, effectively blocking access to the route.
 */
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

/**
 * Configuration for the middleware to define which paths should be processed by the middleware.
 * `matcher` array specifies the paths that `clerkMiddleware` should apply to.
 *
 * It uses a negative lookahead regular expression to exclude paths that start with '_next' (Next.js internals)
 * or contain a file extension (static files), unless they are found in search parameters.
 * It also explicitly includes API routes and trpc routes to ensure they are always protected.
 */
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};