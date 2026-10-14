export default function Badge({ variant = 'new', children, className = '' }) {
  const variants = {
    new: 'bg-paper text-ink border border-ink',
    sale: 'bg-ink text-paper',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-[11px] font-semibold uppercase rounded-none ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}