// Square loading block matching the final layout (bg-card).
export default function Skeleton({ className = '', as: Comp = 'div', ...props }) {
  return <Comp className={`bg-card animate-pulse ${className}`} aria-hidden="true" {...props} />;
}
