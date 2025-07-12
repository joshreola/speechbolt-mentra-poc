// src/components/UserAvatar.tsx
import React from "react";

interface UserAvatarProps {
  size?: number;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 32,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-blue-600 rounded-full shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* User head */}
        <circle cx="12" cy="8" r="4" fill="white" opacity="0.9" />
        {/* User body */}
        <path
          d="M6 21c0-4.42 2.69-8 6-8s6 3.58 6 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="white"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};

export default UserAvatar;
