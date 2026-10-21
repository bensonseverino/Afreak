import { useState } from 'react';
import Icon from '../ui/Icon';
import useCurrency from '../../hooks/useCurrency';

// Mobile-only collapsible summary bar (keeps the form above the fold).
export default function SummaryToggle({ amount = 0, children }) {
  const [open, setOpen] = useState(false);
  const { formatValue } = useCurrency();

  return (
    <div className="lg:hidden border-b border-line bg-mist">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full min-h-[56px] px-4 flex items-center justify-between text-ink"
      >
        <span className="font-sans font-medium text-[14px] flex items-center gap-2">
          {open ? 'Hide' : 'Show'} order summary
          <Icon
            name="chevronDown"
            size={16}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
        <span className="font-display font-bold text-[16px]">{formatValue(amount)}</span>
      </button>
      {open && <div className="px-4 pb-5">{children}</div>}
    </div>
  );
}
