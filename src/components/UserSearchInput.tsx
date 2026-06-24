"use client";

import { useState, useEffect, useRef } from "react";
import { searchUsers } from "@/lib/search";
import { UserSearchResult } from "@/lib/types";
import Avatar from "./Avatar";
import RankBadge from "./RankBadge";

interface UserSearchInputProps {
  onSelect: (user: UserSearchResult) => void;
  placeholder?: string;
  excludeUid?: string;
}

export default function UserSearchInput({
  onSelect,
  placeholder = "Kullanıcı ara...",
  excludeUid,
}: UserSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const res = await searchUsers(query);
      setResults(excludeUid ? res.filter((u) => u.uid !== excludeUid) : res);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query, excludeUid]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(user: UserSearchResult) {
    onSelect(user);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-ink-700 bg-ink-950 pl-10 pr-4 py-2.5 text-sm focus:border-mint-500 focus:outline-none transition text-paper-100 placeholder-paper-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-ink-700 bg-ink-900 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.uid}
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ink-800 transition text-left"
            >
              <Avatar
                avatarUrl={user.avatarUrl}
                avatarColor={user.avatarColor}
                displayName={user.displayName}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-paper-100 truncate">
                  {user.displayName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-mint-400">
                    Seviye {user.level}
                  </span>
                  <RankBadge rank={user.rank} />
                </div>
              </div>
              <span className="text-xs font-mono text-paper-500">
                {user.score} Puan
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
