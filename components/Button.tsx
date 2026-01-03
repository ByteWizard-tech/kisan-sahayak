import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 text-lg shadow-sm";
  
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-green-200",
    secondary: "bg-amber-100 text-amber-900 hover:bg-amber-200",
    danger: "bg-red-100 text-red-700 hover:bg-red-200",
    outline: "border-2 border-green-600 text-green-700 hover:bg-green-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="w-6 h-6">{icon}</span>}
      {children}
    </button>
  );
};