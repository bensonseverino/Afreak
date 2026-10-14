import Placeholder from '../components/ui/Placeholder';

export default function About() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24 space-y-16">
        <header>
          <h1 className="font-display font-black uppercase text-4xl lg:text-5xl tracking-tight text-ink mb-6">
            ABOUT AFREAK
          </h1>
          <div className="prose prose-ink max-w-none">
            <p className="text-graphite leading-relaxed text-base lg:text-lg mb-6">
              AFREAK is a custom-print streetwear brand founded on the belief that clothing should be a canvas for self-expression. We combine bold graphics, premium blanks, and future-ready essentials to create pieces that transcend seasons.
            </p>
            <p className="text-graphite leading-relaxed text-base lg:text-lg mb-6">
              Every garment is designed in our Berlin studio and produced in certified European factories. We work with heavyweight cotton, technical fabrics, and innovative finishes to ensure each piece meets our exacting standards for quality and durability.
            </p>
            <p className="text-graphite leading-relaxed text-base lg:text-lg">
              Our custom print service allows you to bring your own designs to life on our premium blanks. From single pieces to bulk orders, we handle everything from artwork preparation to final production.
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-extrabold uppercase text-2xl tracking-tight text-ink mb-6">OUR PILLARS</h2>
            <dl className="space-y-8">
              <div>
                <dt className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-2">BOLD GRAPHICS</dt>
                <dd className="text-graphite leading-relaxed">Original artwork and collaborations with emerging artists. Screen printed with water-based inks for a soft hand feel.</dd>
              </div>
              <div>
                <dt className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-2">QUALITY BLANKS</dt>
                <dd className="text-graphite leading-relaxed">Heavyweight cotton, technical fabrics, and premium hardware. Sourced from certified European suppliers.</dd>
              </div>
              <div>
                <dt className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-2">FUTURE-READY</dt>
                <dd className="text-graphite leading-relaxed">Designed for longevity. Modular designs, repairable construction, and timeless silhouettes that evolve with you.</dd>
              </div>
              <div>
                <dt className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-2">CUSTOM PRINT</dt>
                <dd className="text-graphite leading-relaxed">Your designs, our blanks. No minimums, fast turnaround, professional results. From concept to delivery.</dd>
              </div>
            </dl>
          </div>

          <div className="aspect-[4/3] bg-mist">
            <Placeholder ratio="aspect-[4/3]" label="ABOUT IMAGE" />
          </div>
        </div>

        <div className="border-t border-line pt-12">
          <h2 className="font-display font-extrabold uppercase text-2xl tracking-tight text-ink mb-6">TIMELINE</h2>
          <div className="space-y-6">
            {[
              { year: '2024', title: 'FOUNDED', desc: 'AFREAK launches in Berlin with first collection of 12 pieces.' },
              { year: '2025', title: 'CUSTOM PRINT LAUNCH', desc: 'On-demand printing service goes live. 500+ designs uploaded in first month.' },
              { year: '2026', title: 'SS26 COLLECTION', desc: 'Expanded product range including outerwear, accessories, and technical fabrics.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-display font-black text-3xl text-ink">{item.year}</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-sans font-bold uppercase text-sm tracking-label text-ink mb-1">{item.title}</h3>
                  <p className="text-graphite text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}