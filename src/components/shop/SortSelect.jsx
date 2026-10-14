import { useState, useRef, useEffect } from 'react';
import Icon from '../ui/Icon';

export default function SortSelect({ value, onChange, options = [], className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full lg:w-48 flex items-center justify-between gap-2 h-11 px-4 border border-line bg-paper text-ink font-sans font-medium uppercase text-xs tracking-label hover:bg-mist transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Sort products"
        type="button"
      >
        <span>SORT BY</span>
        <Icon name="chevronDown" size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute top-full left-0 right-0 z-20 mt-1 border border-line bg-paper overflow-hidden" role="listbox">
          {options.map(option => (
            <li key={option.value} role="option" aria-selected={value === option.value}>
              <button
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`w-full px-4 py-3 text-left font-sans text-xs uppercase tracking-label transition-colors ${
                  value === option.value ? 'bg-ink text-paper' : 'text-ink hover:bg-mist'
                }`}
                type="button"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}