// src/components/AIAvatar.tsx
import React from "react";

interface AIAvatarProps {
  size?: number;
  className?: string;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ size = 32, className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-500 rounded-full shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Robot head outline */}
        <rect
          x="6"
          y="8"
          width="12"
          height="10"
          rx="2"
          fill="white"
          opacity="0.9"
        />

        {/* Robot antenna */}
        <line
          x1="12"
          y1="8"
          x2="12"
          y2="5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Antenna tip */}
        <circle cx="12" cy="5" r="1" fill="white" opacity="0.9" />

        {/* Robot eyes */}
        <circle cx="9.5" cy="12" r="1.5" fill="#374151" />
        <circle cx="14.5" cy="12" r="1.5" fill="#374151" />

        {/* Robot mouth */}
        <rect x="10" y="15" width="4" height="1" rx="0.5" fill="#374151" />

        {/* Small detail lines */}
        <line
          x1="8"
          y1="10"
          x2="8"
          y2="10.5"
          stroke="#374151"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="10"
          x2="16"
          y2="10.5"
          stroke="#374151"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default AIAvatar;
