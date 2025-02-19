import { NextResponse } from "next/server";

// Define which routes the middleware should run on
export const config = {
  matcher: [
    "/api/:path*", // Apply to all API routes
    "/admin/:path*", // Apply to all admin routes
  ],
};

export function middleware(request) {
  const { nextUrl, method } = request;
  const requestHeaders = new Headers(request.headers);

  // Log the request for debugging
  console.log(`[Middleware] ${method} ${nextUrl.pathname}`);

  // Add custom headers (if needed)
  requestHeaders.set("unburdened", "time");

  // Protect admin routes (optional)
  if (nextUrl.pathname.startsWith("/admin")) {
    const authToken = request.cookies.get("authToken");

    // If no auth token, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Add the auth token to the request headers
    requestHeaders.set("x-auth-token", authToken);
  }

  // Rewrite API requests to your backend (if needed)
  if (nextUrl.pathname.startsWith("/api")) {
    // Example: Rewrite /api/posts to your backend URL
    const backendUrl = new URL(nextUrl.pathname, "http://localhost:5000");
    return NextResponse.rewrite(backendUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Continue with the request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
