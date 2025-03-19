import React, { ReactNode } from 'react';

type TypographyVariant =
  | 'hero'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'subtitle'
  | 'body'
  | 'caption';

interface TypographyProps {
  variant?: TypographyVariant;
  children: ReactNode;
  className?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  gradient?: boolean;
}

const TypoGraphy: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  className = '',
  color = '',
  align = 'left',
  gradient = false,
}) => {
  const baseStyles = 'transition-opacity duration-300';
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const gradientStyle = gradient
    ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'
    : '';

  const variantStyles = {
    hero: 'text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.1]',
    heading1: 'text-4xl sm:text-5xl font-bold tracking-tight',
    heading2: 'text-3xl sm:text-4xl font-bold',
    heading3: 'text-2xl sm:text-3xl font-semibold',
    subtitle: 'text-xl font-medium',
    body: 'text-base',
    caption: 'text-sm opacity-80',
  };

  const Component =
    variant === 'hero' || variant === 'heading1'
      ? 'h1'
      : variant === 'heading2'
        ? 'h2'
        : variant === 'heading3'
          ? 'h3'
          : variant === 'subtitle'
            ? 'h4'
            : 'p';

  return (
    <Component
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${alignStyles[align]} 
        ${color} 
        ${gradientStyle} 
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

export default TypoGraphy;
