import React from 'react';

interface SketchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  title?: string; // Added for tooltips
}

export const SketchButton: React.FC<SketchButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  title,
  ...props 
}) => {
  const baseStyles = "font-hand text-lg px-4 py-2 border-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 select-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-sketch-active disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Update borders and shadows to use currentColor so they adapt to dark mode automatically (defined in tailwind config)
  const borderStyles = "border-ink dark:border-chalk shadow-sketch hover:shadow-sketch-hover";

  const variants = {
    primary: `${borderStyles} bg-pencil-yellow text-ink hover:bg-yellow-400 dark:text-ink`, 
    secondary: `${borderStyles} bg-white dark:bg-zinc-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-600`,
    danger: `${borderStyles} bg-pencil-red text-white hover:bg-red-400 dark:text-ink`,
    ghost: "bg-transparent border-transparent shadow-none hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-chalk"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      title={title}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};