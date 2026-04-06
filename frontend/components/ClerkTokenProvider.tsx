"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setTokenGetter } from "@/lib/api";

/**
 * Registers Clerk's getToken with the axios apiClient so all requests
 * automatically include a valid Bearer token. Must be rendered inside
 * <ClerkProvider>.
 */
export function ClerkTokenProvider() {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  return null;
}
