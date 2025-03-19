'use client';
import { useState } from 'react';
import Link from 'next/link';
import { RiArrowRightUpLine } from '@remixicon/react';
import { ReactNode } from 'react';

export interface NavItemProps {
  label: string;
  href: string;
  icon?: ReactNode;
  description?: string;
  isActive?: boolean;
  isExternal?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const NavItem = ({
  label,
  href,
  icon,
  isActive = false,
  isExternal = false,
  isFirst = false,
  isLast = false,
}: NavItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const borderRadius = isFirst
    ? 'rounded-l-full'
    : isLast
      ? 'rounded-r-full'
      : '';

  const linkContent = (
    <div
      className={`
        px-4 py-2 flex items-center gap-2 transition-all duration-300 
        ${borderRadius} relative overflow-hidden
        ${
          isActive
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-slate-800'
            : 'text-slate-600 hover:text-slate-800 hover:bg-white/80'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* bg glow effect */}
      {isActive && (
        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-blue-300 to-purple-300"></div>
      )}

      {/* icon with animation */}
      {icon && (
        <span
          className={`
            transition-all duration-300 relative z-10
            ${isHovered || isActive ? 'scale-110 rotate-3' : ''}
            ${isActive ? 'text-blue-600' : ''}
          `}
        >
          {icon}
        </span>
      )}

      {/* label text */}
      <span
        className={`
        text-sm font-medium relative z-10 transition-all duration-300
        ${isHovered ? 'translate-x-0.5' : ''}
        ${isActive ? 'font-semibold' : ''}
      `}
      >
        {label}
      </span>

      {/* external link indicator */}
      {isExternal && (
        <RiArrowRightUpLine
          className={`
            w-3 h-3 opacity-70 transition-all duration-300 relative z-10
            ${isHovered ? 'translate-x-0.5 -translate-y-0.5' : ''}
          `}
        />
      )}

      {/* bottom glow effect */}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></span>
      )}
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline"
      >
        {linkContent}
      </a>
    );
  }

  return (
    <Link href={href} className="no-underline">
      {linkContent}
    </Link>
  );
};
