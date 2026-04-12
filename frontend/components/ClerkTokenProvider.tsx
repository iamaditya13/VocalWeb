"use client";

import { useAuth } from "@clerk/nextjs";
import { useRef } from "react";
import { setTokenGetter } from "@/lib/api";

/**
 * Registers Clerk's getToken with the axios apiClient so all requests
 * automatically include a valid Bearer token. Must be rendered inside
 * <ClerkProvider>.
 *
 * Uses a ref so the interceptor always calls the latest getToken —
 * and sets the getter synchronously during render (not in useEffect)
 * to avoid a race where queries fire before the effect runs.
 */
export function ClerkTokenProvider() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Set synchronously during render — available before any query effects fire
  setTokenGetter(() => getTokenRef.current());

  return null;
}
