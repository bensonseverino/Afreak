import { Link } from 'react-router-dom';
import { interpolate, isPlaceholder } from '../../data/siteInfo';

const linkClass =
  'text-ink underline decoration-line underline-offset-2 transition-colors hover:decoration-ink';

/**
 * Inline formatter for legal copy: {{placeholders}}, **bold** and
 * [label](/internal-link). External links are only used if a spec provides an
 * absolute URL.
 */
export function InlineText({ text }) {
  const value = interpolate(text);
  const nodes = [];
  let lastIndex = 0;
  let match;
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > lastIndex) nodes.push(value.slice(lastIndex, match.index));

    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      nodes.push(
        href.startsWith('/') ? (
          <Link key={`link-${match.index}`} to={href} className={linkClass}>
            {label}
          </Link>
        ) : (
          <a
            key={`link-${match.index}`}
            href={href}
            className={linkClass}
            target="_blank"
            rel="noreferrer noopener"
          >
            {label}
          </a>
        ),
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < value.length) nodes.push(value.slice(lastIndex));
  return <>{nodes}</>;
}

function ContactBlock({ block }) {
  const rows = (block.rows ?? [])
    .map((row) => ({ ...row, resolved: interpolate(row.value) }))
    .filter((row) => !(row.omitIfPlaceholder && isPlaceholder(row.resolved)));

  return (
    <div className="border border-line bg-card p-6 lg:p-8">
      <p className="text-[15px] leading-7 text-graphite lg:text-base">
        <InlineText text={block.text} />
      </p>
      <dl className="mt-6 space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <dt className="shrink-0 font-sans text-[11px] font-bold uppercase tracking-label text-graphite sm:w-16">
              {row.label}
            </dt>
            <dd className="min-w-0 break-words text-[15px] leading-6 text-ink">
              {row.mailto && !isPlaceholder(row.resolved) ? (
                <a href={`mailto:${row.resolved}`} className="link-underline">
                  {row.resolved}
                </a>
              ) : (
                row.resolved
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Renders one content block: paragraph, list, subheading, callout or contact. */
export default function PolicyBlock({ block }) {
  if (!block) return null;

  switch (block.type) {
    case 'subheading':
      return (
        <h3 className="pt-2 font-sans text-xs font-bold uppercase tracking-label text-ink">
          <InlineText text={block.text} />
        </h3>
      );

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag
          className={`space-y-2 pl-5 text-[15px] leading-7 text-graphite lg:text-base ${
            block.ordered ? 'list-decimal' : 'list-disc'
          } marker:text-stone`}
        >
          {(block.items ?? []).map((item, index) => (
            <li key={index} className="pl-1">
              <InlineText text={item} />
            </li>
          ))}
        </ListTag>
      );
    }

    case 'callout':
      return (
        <div className="border border-line border-l-4 border-l-ink bg-card p-5 lg:p-6">
          <div className="space-y-3">
            {(block.paragraphs ?? []).map((paragraph, index) => (
              <p key={index} className="text-[15px] leading-7 text-graphite lg:text-base">
                <InlineText text={paragraph} />
              </p>
            ))}
          </div>
        </div>
      );

    case 'contact':
      return <ContactBlock block={block} />;

    case 'paragraph':
    default:
      return (
        <p className="text-[15px] leading-7 text-graphite lg:text-base">
          <InlineText text={block.text} />
        </p>
      );
  }
}
