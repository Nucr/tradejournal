"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-context";

const EXEMPT_ROUTES = ["/login", "/register", "/onboarding"];

export function useAuthGuard() {
  const { user, loading, needsOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!EXEMPT_ROUTES.includes(pathname)) {
        router.replace("/login");
      }
      return;
    }

    if (EXEMPT_ROUTES.includes(pathname)) return;

    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [loading, user, needsOnboarding, pathname, router]);
}
