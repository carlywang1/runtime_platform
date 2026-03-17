import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export default function CustomSelect({ value, onChange, options, className = '' }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`h-10 pl-4 pr-10 rounded-lg text-sm text-white flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
          open
            ? 'bg-dark-50 border-2 border-indigo ring-1 ring-indigo/30'
            : 'bg-dark-50 border border-white/10 hover:border-white/20'
        }`}
      >
        {selectedLabel}
        {open ? (
          <ChevronUp className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-full bg-dark-50 border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === opt.value
                  ? 'text-white bg-indigo/20'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
