import PolicyBlock from './PolicyBlock';

/** One policy section: anchored heading plus its content blocks. */
export default function PolicySection({ section, first = false }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className={`scroll-mt-20 lg:scroll-mt-24 ${first ? '' : 'mt-10 border-t border-line pt-10'}`}
    >
      <h2
        id={`${section.id}-title`}
        className="font-display text-2xl font-extrabold uppercase tracking-tight text-ink"
      >
        {section.title}
      </h2>
      <div className="mt-4 space-y-4">
        {section.blocks.map((block, index) => (
          <PolicyBlock key={index} block={block} />
        ))}
      </div>
    </section>
  );
}
