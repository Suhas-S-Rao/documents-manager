import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', value, ...props }, ref) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && <label className="text-sm font-medium text-calm-text">{label}</label>}

      <input
        ref={ref}
        className={`
            w-full rounded-lg border border-slate-300
            bg-calm-surface
            px-4 py-2
            text-calm-text
            shadow-sm
            transition
            outline-none
            placeholder:text-slate-400
            focus:border-calm-accent
            focus:ring-1
            focus:ring-calm-accent
            disabled:cursor-not-allowed
            disabled:bg-slate-100
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
        value={value ?? ''}
        {...props}
      />

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
