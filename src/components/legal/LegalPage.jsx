import { useEffect, useMemo, useRef, useState } from 'react';
import { PLACEHOLDERS } from '../../data/siteInfo';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import PolicyBlock from './PolicyBlock';
import PolicySection from './PolicySection';
import PolicyTOC from './PolicyTOC';

/** Approximate sticky-header height used for the reading line and anchors. */
const HEADER_OFFSET = 96;

/** Sets the document title + meta description and enables print styles. */
function useLegalMeta(title, description) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const previousDescription = meta.getAttribute('content');
    meta.setAttribute('content', description);

    document.body.classList.add('print-legal');

    return () => {
      document.title = previousTitle;
      if (created) meta.remove();
      else if (previousDescription !== null) meta.setAttribute('content', previousDescription);
      document.body.classList.remove('print-legal');
    };
  }, [title, description]);
}

/** Tracks the section currently being read (IntersectionObserver). */
function useActiveSection(sections) {
  const ids = useMemo(() => sections.map((section) => section.id), [sections]);
  const [activeId, setActiveId] = useState(ids[0] ?? '');

  useEffect(() => {
    if (!ids.length) return undefined;

    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const first = ids.find((id) => visible.has(id));
        if (first) setActiveId(first);
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px`, threshold: 0 },
    );

    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Short last sections never cross the reading line, so pin them at the end.
    const handleScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      if (atBottom) setActiveId(ids[ids.length - 1]);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [ids]);

  return activeId;
}

/**
 * Shared layout for the legal pages (Privacy Policy, Terms & Conditions):
 * hero block, sticky/collapsible table of contents, policy sections,
 * "back to top" and a print-friendly body.
 */
export default function LegalPage({ title, documentTitle, description, tocLabel, sections, notice }) {
  useLegalMeta(documentTitle, description);
  const activeId = useActiveSection(sections);
  const mobileTocRef = useRef(null);

  // Deep links (e.g. /privacy#cookies) need the content mounted first.
  useEffect(() => {
    if (!window.location.hash) return undefined;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const closeMobileToc = () => {
    if (mobileTocRef.current) mobileTocRef.current.open = false;
  };

  const backToTop = () => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="legal-page bg-paper">
      <div className="mx-auto max-w-wide px-6 py-12 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-label text-graphite">
            LEGAL
          </p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight text-ink lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 font-sans text-sm text-graphite">
            Last updated: <time>{PLACEHOLDERS.LAST_UPDATED}</time>
          </p>
        </div>

        <div className="legal-grid mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-label text-graphite">
              On this page
            </p>
            <PolicyTOC sections={sections} activeId={activeId} label={tocLabel} />
          </aside>

          <div className="min-w-0">
            <details ref={mobileTocRef} className="legal-toc group border border-line bg-card lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-label text-ink [&::-webkit-details-marker]:hidden">
                On this page
                <Icon
                  name="chevronDown"
                  size={16}
                  className="transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="border-t border-line px-4 py-3">
                <PolicyTOC
                  sections={sections}
                  activeId={activeId}
                  label={`${tocLabel} (mobile)`}
                  onNavigate={closeMobileToc}
                />
              </div>
            </details>

            <div className="mt-8 max-w-prose lg:mt-0">
              {notice && (
                <div className="mb-8">
                  <PolicyBlock block={notice} />
                </div>
              )}
              {sections.map((section, index) => (
                <PolicySection key={section.id} section={section} first={index === 0} />
              ))}
            </div>

            <div className="legal-backtotop mt-12 max-w-prose border-t border-line pt-8">
              <Button variant="outline" size="sm" onClick={backToTop} leftIcon="chevronUp">
                Back to top
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
