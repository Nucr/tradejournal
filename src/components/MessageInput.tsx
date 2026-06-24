"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Mesaj yaz...",
}: MessageInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-ink-800 bg-ink-900 p-3">
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm resize-none focus:border-mint-500 focus:outline-none transition text-paper-100 placeholder-paper-500 max-h-[120px]"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="rounded-lg bg-mint-500 text-ink-950 p-2.5 hover:bg-mint-400 transition disabled:opacity-40 shrink-0"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
}
