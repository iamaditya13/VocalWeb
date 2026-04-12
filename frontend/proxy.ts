import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/login(.*)",
  "/auth/signup(.*)",
  "/sso-callback(.*)",
  "/pricing(.*)",
  "/terms(.*)",
  "/privacy(.*)",
]);

const isAuthRoute = createRouteMatcher(["/auth/login(.*)", "/auth/signup(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect authenticated users away from login/signup to dashboard
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
