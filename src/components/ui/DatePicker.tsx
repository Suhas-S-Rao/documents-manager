import { forwardRef } from 'react';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({ value, onChange, placeholder, label, min, max, disabled, required, className = '' }, ref) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-calm-text">{label}</label>}

      <div className="relative">
        <input
          ref={ref}
          type="date"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-calm-surface px-3 py-2 pr-10 text-calm-text shadow-sm transition outline-none focus:border-calm-accent focus:ring-1 focus:ring-calm-accent disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v3m8-3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
        </svg>
      </div>
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
