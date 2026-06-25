"use client";

import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function WidgetCard({ title, children, className = "" }: Props) {
  return (
    <div className={`rounded-xl border border-ink-800 bg-ink-900 p-5 hover:border-ink-700 transition ${className}`}>
      <h3 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
