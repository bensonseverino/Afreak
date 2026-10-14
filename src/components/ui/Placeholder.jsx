export default function Placeholder({ 
  ratio = 'aspect-[5/6]', 
  label = 'IMAGE', 
  className = '', 
  src,
  alt,
  ...props 
}) {
  if (src) {
    return (
      <div className={`${ratio} ${className} bg-mist overflow-hidden`} {...props}>
        <img 
          src={src} 
          alt={alt || label} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div 
      className={`${ratio} ${className} bg-card flex items-center justify-center text-[11px] font-semibold uppercase tracking-label text-graphite`} 
      {...props}
    >
      {label}
    </div>
  );
}