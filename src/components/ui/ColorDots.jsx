export default function ColorDots({ colors = [], selectedColor, onSelect, className = '', size = 10 }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="Color options">
      {colors.map((color, index) => (
        <button
          key={index}
          onClick={() => onSelect?.(color)}
          className={`relative flex-shrink-0 rounded-full border-2 transition-all duration-200 ${
            color === selectedColor 
              ? 'border-ink [&:has(+*)]:border-ink/0' 
              : 'border-transparent hover:border-stone'
          }`}
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: color,
            boxShadow: color === selectedColor ? '0 0 0 2px white, 0 0 0 3px #000' : 'none'
          }}
          aria-label={`Color: ${color}`}
          aria-pressed={color === selectedColor}
        >
          {color === selectedColor && (
            <span className="absolute -top-2 -left-2 -right-2 -bottom-2 border border-ink rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}