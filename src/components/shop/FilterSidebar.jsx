import { useState } from 'react';
import { categories, colors, sizes } from '../../data/products';
import Icon from '../ui/Icon';

const filterSections = [
  {
    key: 'category',
    label: 'CATEGORY',
    options: categories.filter(c => c.slug !== 'all').map(c => ({ value: c.slug, label: c.name.toUpperCase(), count: c.count })),
    type: 'checkbox',
  },
  {
    key: 'price',
    label: 'PRICE',
    type: 'range',
    min: 0,
    max: 200,
  },
  {
    key: 'color',
    label: 'COLOR',
    options: colors.map(c => ({ value: c.hex, label: c.name, hex: c.hex })),
    type: 'color',
  },
  {
    key: 'size',
    label: 'SIZE',
    options: sizes.map(s => ({ value: s, label: s })),
    type: 'checkbox',
  },
];

export default function FilterSidebar({ 
  filters, 
  onFilterChange, 
  onClearAll,
  isOpen,
  onClose,
  className = '' 
}) {
  const [openSections, setOpenSections] = useState(['category', 'price']);

  const toggleSection = (key) => {
    setOpenSections(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleCheckboxChange = (sectionKey, value, checked) => {
    const current = filters[sectionKey] || [];
    if (checked) {
      onFilterChange(sectionKey, [...current, value]);
    } else {
      onFilterChange(sectionKey, current.filter(v => v !== value));
    }
  };

  const handleColorChange = (color) => {
    onFilterChange('color', color);
  };

  const handlePriceChange = (from, to) => {
    onFilterChange('price', { from, to });
  };

  const handleSizeChange = (size, checked) => {
    const current = filters.size || [];
    if (checked) {
      onFilterChange('size', [...current, size]);
    } else {
      onFilterChange('size', current.filter(s => s !== size));
    }
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => props.onOpen?.()}
        className="lg:hidden w-full border border-ink text-ink py-3 px-4 font-sans font-semibold uppercase text-xs tracking-label flex items-center justify-between hover:bg-mist transition-colors"
        type="button"
      >
        FILTERS
        <span className="w-8 h-8 flex items-center justify-center border border-ink bg-ink text-paper text-[11px] font-bold">
          {(filters.category?.length || 0) + (filters.color?.length || 0) + (filters.size?.length || 0) + (filters.price ? 1 : 0)}
        </span>
      </button>

      {/* Desktop Sidebar */}
      <aside 
        className={`lg:block hidden sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto border border-line p-4 ${className}`}
        aria-label="Filters"
      >
        <div className="space-y-4">
          {filterSections.map(section => (
            <div key={section.key} className="border-t border-line pt-4 first:border-0 first:pt-0">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between font-sans font-bold uppercase text-[12px] tracking-label text-ink"
                aria-expanded={openSections.includes(section.key)}
              >
                {section.label}
                <Icon 
                  name="chevronDown" 
                  size={16} 
                  className={`transition-transform ${openSections.includes(section.key) ? 'rotate-180' : ''}`} 
                />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${openSections.includes(section.key) ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                {section.type === 'checkbox' && (
                  <div className="space-y-3" role="group" aria-label={`${section.label} options`}>
                    {section.options.map(option => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters[section.key]?.includes(option.value)}
                          onChange={(e) => handleCheckboxChange(section.key, option.value, e.target.checked)}
                          className="w-4 h-4 border border-ink rounded-none accent-ink focus:ring-2 focus:ring-ink focus:ring-offset-2"
                        />
                        <span className="font-sans text-sm text-ink">{option.label}</span>
                        {option.count !== undefined && (
                          <span className="ml-auto font-sans text-xs text-graphite">({option.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {section.type === 'color' && (
                  <div className="grid grid-cols-6 gap-2" role="group" aria-label={`${section.label} options`}>
                    {section.options.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleColorChange(option.value)}
                        className={`relative aspect-square rounded-full border-2 transition-all ${
                          filters.color === option.value 
                            ? 'border-ink [&:has(+*)]:border-ink/0' 
                            : 'border-transparent hover:border-stone'
                        }`}
                        style={{ 
                          backgroundColor: option.value,
                          boxShadow: filters.color === option.value ? '0 0 0 2px white, 0 0 0 3px #000' : 'none'
                        }}
                        aria-label={option.label}
                        aria-pressed={filters.color === option.value}
                        type="button"
                      >
                        {filters.color === option.value && (
                          <span className="absolute -top-2 -left-2 -right-2 -bottom-2 border border-ink rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {section.type === 'range' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="price-min" className="font-sans text-xs text-graphite w-12">FROM</label>
                      <input
                        id="price-min"
                        type="number"
                        min={section.min}
                        max={section.max}
                        value={filters.price?.from ?? ''}
                        placeholder={section.min}
                        onChange={(e) => handlePriceChange(Number(e.target.value) || section.min, filters.price?.to ?? section.max)}
                        className="flex-1 h-10 px-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="price-max" className="font-sans text-xs text-graphite w-12">TO</label>
                      <input
                        id="price-max"
                        type="number"
                        min={section.min}
                        max={section.max}
                        value={filters.price?.to ?? ''}
                        placeholder={section.max}
                        onChange={(e) => handlePriceChange(filters.price?.from ?? section.min, Number(e.target.value) || section.max)}
                        className="flex-1 h-10 px-3 border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min={section.min}
                        max={section.max}
                        value={filters.price?.from ?? section.min}
                        onChange={(e) => handlePriceChange(Number(e.target.value), filters.price?.to ?? section.max)}
                        className="w-full h-2 bg-line appearance-none cursor-pointer accent-ink"
                      />
                      <input
                        type="range"
                        min={section.min}
                        max={section.max}
                        value={filters.price?.to ?? section.max}
                        onChange={(e) => handlePriceChange(filters.price?.from ?? section.min, Number(e.target.value))}
                        className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-ink -mt-2"
                      />
                    </div>
                  </div>
                )}

                {section.type === 'checkbox' && section.key === 'size' && (
                  <div className="grid grid-cols-4 gap-2" role="group" aria-label={`${section.label} options`}>
                    {section.options.map(option => (
                      <label key={option.value} className="relative">
                        <input
                          type="checkbox"
                          checked={filters.size?.includes(option.value)}
                          onChange={(e) => handleSizeChange(option.value, e.target.checked)}
                          className="sr-only peer"
                        />
                        <span className={`block py-2 px-2 text-center font-sans font-medium text-[13px] border border-line transition-all ${
                          filters.size?.includes(option.value)
                            ? 'bg-ink text-paper'
                            : 'bg-paper text-ink hover:bg-mist'
                        } peer-checked:bg-ink peer-checked:text-paper`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {(filters.category?.length || filters.color?.length || filters.size?.length || filters.price) && (
            <button
              onClick={onClearAll}
              className="w-full py-3 px-4 border border-ink text-ink font-sans font-semibold uppercase text-xs tracking-label hover:bg-ink hover:text-paper transition-colors"
              type="button"
            >
              CLEAR ALL FILTERS
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Filter Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-paper border-l border-line overflow-y-auto">
            <div className="flex items-center justify-between h-[80px] px-6 border-b border-line">
              <h3 className="font-sans font-bold uppercase text-[13px] tracking-label">FILTERS</h3>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-ink hover:text-graphite" aria-label="Close filters">
                <Icon name="close" size={24} />
              </button>
            </div>
            <div className="p-6 pb-20">
              <FilterSidebar 
                filters={filters} 
                onFilterChange={onFilterChange} 
                onClearAll={onClearAll}
                isOpen={true}
                onClose={onClose}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}