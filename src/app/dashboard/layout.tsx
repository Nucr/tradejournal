"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col lg:flex-row bg-ink-950">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
