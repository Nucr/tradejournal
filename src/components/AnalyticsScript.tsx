"use client";

import { useEffect } from "react";

export default function AnalyticsScript() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const measurementId = process.env.NEXT_PUBLIC_GA_ID;

    if (!measurementId) return;

    const existing = document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      const gtag = (window as unknown as Record<string, unknown>).gtag;
      if (typeof gtag === "function") {
        gtag("js", new Date());
        gtag("config", measurementId);
      }
    };
  }, []);

  return null;
}
