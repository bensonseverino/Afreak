import { useState } from 'react';
import Placeholder from '../ui/Placeholder';
import Icon from '../ui/Icon';
import Price from '../ui/Price';

// Horizontal add-on card: thumb · ADD ACCESSORY · name · price · [+] → ✓
export default function AccessoryCard({ accessory, onAdd, added = false, className = '' }) {
  const [done, setDone] = useState(added);

  const handleAdd = () => {
    if (done) return;
    onAdd?.(accessory);
    setDone(true);
  };

  return (
    <div className={`border border-line p-3 flex items-center gap-3 ${className}`}>
      <div className="w-[72px] h-[72px] bg-card shrink-0 overflow-hidden">
        <Placeholder ratio="h-full" label="" src={accessory.image} alt={accessory.name} className="w-full h-full" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold uppercase text-[10px] tracking-label text-graphite">Add accessory</p>
        <p className="font-sans font-semibold text-[14px] text-ink truncate">{accessory.name}</p>
        <p className="text-[13px] text-graphite"><Price amount={accessory.price} /></p>
      </div>

      <button
        onClick={handleAdd}
        aria-label={done ? `${accessory.name} added` : `Add ${accessory.name}`}
        aria-pressed={done}
        className={`w-11 h-11 flex items-center justify-center border shrink-0 transition-colors ${
          done ? 'bg-ink text-paper border-ink' : 'border-line text-ink hover:border-ink'
        }`}
        type="button"
      >
        <Icon name={done ? 'check' : 'plus'} size={18} />
      </button>
    </div>
  );
}
