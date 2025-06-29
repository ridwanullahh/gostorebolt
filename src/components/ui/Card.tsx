import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, glass = false, hover = false }) => {
  return (
    <div
      className={cn(
        'rounded-xl shadow-lg',
        glass && 'backdrop-blur-lg bg-white/10 border border-white/20',
        !glass && 'bg-white border border-gray-200',
        hover && 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        'bg-noise',
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-gray-200', className)}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;