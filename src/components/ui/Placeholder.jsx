export default function Placeholder({
  ratio = 'aspect-[5/6]',
  label = 'IMAGE',
  className = '',
  src,
  alt,
  loading = 'lazy',
}) {
  if (src) {
    return (
      <div className={`${ratio} ${className} bg-mist overflow-hidden`}>
        <img
          src={src}
          alt={alt || label}
          loading={loading}
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${ratio} ${className} bg-card flex items-center justify-center text-[11px] font-semibold uppercase tracking-label text-graphite`}
      aria-hidden={label ? undefined : true}
    >
      {label}
    </div>
  );
}
