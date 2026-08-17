import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'reset' | 'info' | 'ghost' | 'outline';
}
const Button = ({ children, variant = 'primary', className = '', disabled, ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-calm-accent text-white hover:bg-calm-accent/80 hover:shadow-glow ',
    secondary: 'border border-slate-300 bg-calm-surface text-calm-text hover:bg-slate-100',
    success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-glow',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-glow',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-glow',
    reset: 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200',
    info: 'bg-sky-500 text-white hover:bg-sky-600 hover:shadow-glow',
    outline: 'border border-calm-accent bg-transparent text-calm-accent hover:bg-calm-accent hover:text-white',
    ghost: 'bg-transparent text-calm-text shadow-none hover:bg-slate-100'
  };

  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-lg px-4 py-2
        font-medium
        shadow-soft
        transition
        cursor-pointer
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
