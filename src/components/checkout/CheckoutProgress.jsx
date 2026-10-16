const STEPS = ['Cart', 'Information', 'Payment'];

// Slim 3-step indicator: breadcrumb on md+, segmented "Step n of 3" on mobile.
export default function CheckoutProgress({ current = 'payment' }) {
  const activeIndex = Math.max(0, STEPS.findIndex((s) => s.toLowerCase() === current));

  return (
    <div className="border-b border-line bg-paper">
      <div className="max-w-wide mx-auto px-4 md:px-6 py-3">
        <ol className="hidden md:flex items-center gap-2 font-sans text-[12px] uppercase tracking-label">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-graphite" aria-hidden="true">
                  ›
                </span>
              )}
              <span
                className={i === activeIndex ? 'text-ink font-semibold' : 'text-graphite'}
                aria-current={i === activeIndex ? 'step' : undefined}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>

        <div className="md:hidden flex items-center gap-3">
          <span className="text-[12px] font-semibold text-ink whitespace-nowrap">
            Step {activeIndex + 1} of 3
          </span>
          <div className="flex-1 flex gap-1" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s} className={`h-0.5 flex-1 ${i <= activeIndex ? 'bg-ink' : 'bg-line'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
