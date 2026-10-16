import { forwardRef } from 'react';

// Label + control + inline error. `as` = 'input' | 'textarea' | 'select'.
const Field = forwardRef(function Field(
  { label, error, hint, id, required, as = 'input', className = '', children, ...props },
  ref
) {
  const Comp = as;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block font-sans text-[13px] font-medium text-ink mb-2">
          {label}
          {required && <span className="text-graphite"> *</span>}
        </label>
      )}
      <Comp
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full min-h-[52px] px-4 py-3 bg-paper text-base text-ink border outline-none transition-colors placeholder:text-stone focus:border-ink focus:ring-2 focus:ring-ink ${
          error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-line'
        }`}
        {...props}
      >
        {children}
      </Comp>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] text-danger" aria-live="polite">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-graphite">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

Field.displayName = 'Field';

export default Field;
