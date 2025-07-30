export { auth as middleware } from "@/auth";

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - / (home page - accessible to all)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|$).*)",
  ],
};
