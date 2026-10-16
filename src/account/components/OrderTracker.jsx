import { formatDate } from '../../utils/format';

// ORDER PLACED → PAID → IN PRODUCTION → SHIPPED → DELIVERED.
// Horizontal on ≥640, vertical on mobile. Cancelled/refunded replace it with a notice.
export default function OrderTracker({ timeline = [], status }) {
  if (status === 'cancelled' || status === 'refunded') {
    const step = timeline[timeline.length - 1];
    return (
      <div className="border border-line p-4 flex items-start gap-3">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger shrink-0" aria-hidden="true" />
        <p className="text-[13px] text-ink">
          This order was {status === 'cancelled' ? 'cancelled' : 'refunded'}.
          <span className="text-graphite"> Contact support if you need help.</span>
          {step?.date && <span className="block text-[12px] text-graphite mt-1">{formatDate(step.date)}</span>}
        </p>
      </div>
    );
  }

  const nodeClass = (step) => {
    if (step.done) return 'bg-ink border-ink';
    if (step.current) return 'bg-ink border-ink';
    return 'bg-paper border-stone';
  };

  return (
    <div>
      {/* Vertical — mobile */}
      <ol className="md:hidden">
        {timeline.map((step, index) => (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`w-4 h-4 border-2 shrink-0 ${nodeClass(step)} ${
                  step.current ? 'ring-2 ring-offset-2 ring-ink' : ''
                }`}
                aria-current={step.current ? 'step' : undefined}
              />
              {index < timeline.length - 1 && <span className="w-px flex-1 min-h-[26px] bg-line" aria-hidden="true" />}
            </div>
            <div className="pb-6 min-w-0">
              <p
                className={`font-sans font-semibold uppercase text-[11px] tracking-label ${
                  step.done || step.current ? 'text-ink' : 'text-stone'
                }`}
              >
                {step.label}
              </p>
              {step.date && <p className="text-[12px] text-graphite mt-0.5">{formatDate(step.date)}</p>}
              {step.note && <p className="text-[12px] text-graphite">{step.note}</p>}
            </div>
          </li>
        ))}
      </ol>

      {/* Horizontal — desktop/tablet */}
      <ol className="hidden md:flex items-start">
        {timeline.map((step, index) => (
          <li key={step.key} className="flex-1 flex flex-col items-center relative text-center">
            {index > 0 && (
              <span
                className={`absolute top-[7px] right-1/2 w-full h-px ${step.done ? 'bg-ink' : 'bg-line'}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 w-4 h-4 border-2 ${nodeClass(step)} ${
                step.current ? 'ring-2 ring-offset-2 ring-ink' : ''
              }`}
              aria-current={step.current ? 'step' : undefined}
            />
            <span
              className={`mt-3 font-sans font-semibold uppercase text-[11px] tracking-label ${
                step.done || step.current ? 'text-ink' : 'text-stone'
              }`}
            >
              {step.label}
            </span>
            {step.date && <span className="text-[12px] text-graphite mt-0.5">{formatDate(step.date)}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
