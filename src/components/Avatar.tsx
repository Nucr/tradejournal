"use client";

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
  const letter = displayName.trim()[0]?.toUpperCase() ?? "?";

  if (avatarUrl) {
    return (
      <div className={`${CLASS_MAP[size]} rounded-full overflow-hidden shrink-0`}>
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-full h-full object-cover"
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
