import { forwardRef, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, placeholder, className = '', ...props }, ref) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && <label className="text-sm font-medium text-calm-text">{label}</label>}

      <textarea
        ref={ref}
        className={`
            w-full rounded-lg border border-slate-300
            bg-calm-surface
            px-3 py-2
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
            resize-y
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
        placeholder={placeholder}
        rows={5}
        {...props}
      />

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
