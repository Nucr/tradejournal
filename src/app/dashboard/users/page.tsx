"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserSearchInput from "@/components/UserSearchInput";
import { UserSearchResult } from "@/lib/types";
import Avatar from "@/components/Avatar";
import RankBadge from "@/components/RankBadge";

export default function UsersPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  function handleSelect(user: UserSearchResult) {
    setSelectedUser(user);
    router.push(`/dashboard/users/${user.uid}`);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold">Kullanıcılar</h1>
        <p className="text-sm text-paper-300 mt-1">
          Diğer traderların profillerini görüntüle ve onlarla bağlantı kur.
        </p>
      </div>

      <div className="max-w-md">
        <UserSearchInput
          onSelect={handleSelect}
          placeholder="Kullanıcı adı ile ara..."
        />
      </div>

      <div className="rounded-xl border border-ink-800 bg-ink-900 p-8 text-center">
        <svg
          className="w-12 h-12 mx-auto text-paper-500 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-paper-400 text-sm">
          Yukarıdaki arama çubuğunu kullanarak diğer traderları bulabilirsin.
        </p>
      </div>
    </div>
  );
}
