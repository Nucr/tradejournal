"use client";

import { useState } from "react";

interface AvatarProps {
  avatarUrl?: string;
  avatarColor?: string;
  displayName: string;
  size?: "sm" | "md" | "lg";
}

const CLASS_MAP = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-2xl",
};

export default function Avatar({
  avatarUrl,
  avatarColor = "#2ED9A4",
  displayName,
  size = "md",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const letter = displayName.trim()[0]?.toUpperCase() ?? "?";

  if (avatarUrl && !imgError) {
    return (
      <div className={`${CLASS_MAP[size]} rounded-full overflow-hidden shrink-0`}>
        <img
          src={avatarUrl}
          key={avatarUrl}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${CLASS_MAP[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: avatarColor }}
    >
      {letter}
    </div>
  );
}
