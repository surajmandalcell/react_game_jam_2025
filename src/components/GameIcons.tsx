import React from "react";

export const HumanIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="10" r="6" fill="#FFB74D" />
    <path
      d="M8 28C8 22.477 11.6 18 16 18C20.4 18 24 22.477 24 28"
      fill="#FFB74D"
    />
    <path
      d="M8 28C8 22.477 11.6 18 16 18C20.4 18 24 22.477 24 28"
      stroke="#F57C00"
      strokeWidth="2"
    />
  </svg>
);

export const GorillaIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 4C20.4183 4 24 7.58172 24 12C24 16.4183 20.4183 20 16 20C11.5817 20 8 16.4183 8 12C8 7.58172 11.5817 4 16 4Z"
      fill="#5D4037"
    />
    <path
      d="M6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14Z"
      fill="#5D4037"
    />
    <path
      d="M26 14C27.1046 14 28 13.1046 28 12C28 10.8954 27.1046 10 26 10C24.8954 10 24 10.8954 24 12C24 13.1046 24.8954 14 26 14Z"
      fill="#5D4037"
    />
    <path
      d="M12 12C12.5523 12 13 11.5523 13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12Z"
      fill="white"
    />
    <path
      d="M20 12C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10C19.4477 10 19 10.4477 19 11C19 11.5523 19.4477 12 20 12Z"
      fill="white"
    />
    <path
      d="M16 16C17.1046 16 18 15.1046 18 14C18 12.8954 17.1046 12 16 12C14.8954 12 14 12.8954 14 14C14 15.1046 14.8954 16 16 16Z"
      fill="#8D6E63"
    />
    <path
      d="M10 28C10 24.134 12.6863 21 16 21C19.3137 21 22 24.134 22 28"
      fill="#5D4037"
    />
    <path
      d="M10 28C10 24.134 12.6863 21 16 21C19.3137 21 22 24.134 22 28"
      stroke="#4E342E"
      strokeWidth="2"
    />
    <path
      d="M6 18C6 18 8 20 10 20"
      stroke="#4E342E"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M26 18C26 18 24 20 22 20"
      stroke="#4E342E"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const MineIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="16" r="10" fill="#D32F2F" />
    <circle cx="16" cy="16" r="7" fill="#B71C1C" />
    <circle cx="14" cy="14" r="2" fill="#FFFFFF" />
    <path d="M8 8L5 5" stroke="#B71C1C" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M24 8L27 5"
      stroke="#B71C1C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 24L5 27"
      stroke="#B71C1C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M24 24L27 27"
      stroke="#B71C1C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 6L16 2"
      stroke="#B71C1C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 30L16 26"
      stroke="#B71C1C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6 16L2 16"
      stroke="#B71C1C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M30 16L26 16"
      stroke="#B71C1C"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const GameIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="4" width="24" height="24" rx="2" fill="#4CAF50" />
    <rect x="8" y="8" width="4" height="4" fill="#E8F5E9" />
    <rect x="8" y="14" width="4" height="4" fill="#E8F5E9" />
    <rect x="8" y="20" width="4" height="4" fill="#E8F5E9" />
    <rect x="14" y="8" width="4" height="4" fill="#E8F5E9" />
    <rect x="14" y="14" width="4" height="4" fill="#FF5252" />
    <rect x="14" y="20" width="4" height="4" fill="#E8F5E9" />
    <rect x="20" y="8" width="4" height="4" fill="#E8F5E9" />
    <rect x="20" y="14" width="4" height="4" fill="#E8F5E9" />
    <rect x="20" y="20" width="4" height="4" fill="#FFB74D" />
  </svg>
);
