// Square selectable card used for delivery + payment method pickers.
export default function RadioCard({ name, value, checked, onChange, title, note, price, className = '' }) {
  return (
    <label
      className={`relative flex items-center gap-3 border-2 p-4 cursor-pointer transition-colors ${
        checked ? 'border-ink' : 'border-line hover:border-graphite'
      } ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`w-5 h-5 border flex items-center justify-center shrink-0 ${
          checked ? 'border-ink' : 'border-stone'
        }`}
        aria-hidden="true"
      >
        {checked && <span className="w-2.5 h-2.5 bg-ink" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-sans font-semibold text-[14px] text-ink">{title}</span>
        {note && <span className="block text-[12px] text-graphite mt-0.5">{note}</span>}
      </span>
      {price != null && <span className="font-sans font-semibold text-[14px] text-ink shrink-0">{price}</span>}
    </label>
  );
}
