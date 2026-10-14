import { useState } from 'react';
import Icon from './Icon';

export default function Accordion({ items, className = '', allowMultiple = true }) {
  const [openIndices, setOpenIndices] = useState(() => 
    allowMultiple ? [] : [0]
  );

  const toggle = (index) => {
    setOpenIndices(prev => {
      if (allowMultiple) {
        return prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index];
      }
      return prev[0] === index ? [] : [index];
    });
  };

  return (
    <div className={`border-t border-line ${className}`} role="region" aria-label="Accordion">
      {items.map((item, index) => {
        const isOpen = openIndices.includes(index);
        return (
          <div key={index} className="border-b border-line">
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between py-4 text-left font-sans font-semibold text-[14px] text-ink hover:text-graphite transition-colors focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper"
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${index}`}
              id={`accordion-header-${index}`}
            >
              <span>{item.label}</span>
              <Icon 
                name="chevronDown" 
                size={20} 
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                aria-hidden="true"
              />
            </button>
            <div
              id={`accordion-content-${index}`}
              role="region"
              aria-labelledby={`accordion-header-${index}`}
              className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="pb-6 text-graphite leading-relaxed text-sm">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}