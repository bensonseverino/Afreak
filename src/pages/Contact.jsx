import Placeholder from '../components/ui/Placeholder';

export default function Contact() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24 space-y-16">
        <header>
          <h1 className="font-display font-black uppercase text-4xl lg:text-5xl tracking-tight text-ink mb-6">
            CONTACT US
          </h1>
          <p className="text-graphite leading-relaxed text-base lg:text-lg">
            Have questions? We'd love to hear from you. Our team typically responds within 24 hours.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <form className="space-y-6" aria-label="Contact form">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first-name" className="font-sans font-semibold uppercase text-xs tracking-label text-ink block mb-2">FIRST NAME</label>
                <input id="first-name" type="text" className="w-full h-12 px-4 border border-line bg-paper text-ink placeholder-graphite text-sm focus:outline-none focus:ring-2 focus:ring-ink" required />
              </div>
              <div>
                <label htmlFor="last-name" className="font-sans font-semibold uppercase text-xs tracking-label text-ink block mb-2">LAST NAME</label>
                <input id="last-name" type="text" className="w-full h-12 px-4 border border-line bg-paper text-ink placeholder-graphite text-sm focus:outline-none focus:ring-2 focus:ring-ink" required />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="font-sans font-semibold uppercase text-xs tracking-label text-ink block mb-2">EMAIL</label>
              <input id="email" type="email" className="w-full h-12 px-4 border border-line bg-paper text-ink placeholder-graphite text-sm focus:outline-none focus:ring-2 focus:ring-ink" required />
            </div>
            <div>
              <label htmlFor="subject" className="font-sans font-semibold uppercase text-xs tracking-label text-ink block mb-2">SUBJECT</label>
              <select id="subject" className="w-full h-12 px-4 border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink" required>
                <option value="">Select a topic</option>
                <option value="order">Order Inquiry</option>
                <option value="returns">Returns & Exchanges</option>
                <option value="custom">Custom Print</option>
                <option value="wholesale">Wholesale</option>
                <option value="press">Press</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="font-sans font-semibold uppercase text-xs tracking-label text-ink block mb-2">MESSAGE</label>
              <textarea id="message" rows={6} className="w-full px-4 py-4 border border-line bg-paper text-ink placeholder-graphite text-sm focus:outline-none focus:ring-2 focus:ring-ink resize-none" required></textarea>
            </div>
            <button type="submit" className="w-full sm:w-auto bg-ink text-paper font-sans font-semibold uppercase text-xs tracking-label px-10 py-4 hover:bg-paper hover:text-ink hover:border hover:border-ink transition-colors">
              SEND MESSAGE
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-display font-extrabold uppercase text-xl tracking-tight text-ink mb-6">GET IN TOUCH</h2>
              <dl className="space-y-6">
                <div>
                  <dt className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-1">EMAIL</dt>
                  <dd className="text-graphite"><a href="mailto:hello@afreak.com" className="underline underline-offset-2 hover:text-ink transition-colors">hello@afreak.com</a></dd>
                </div>
                <div>
                  <dt className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-1">PHONE</dt>
                  <dd className="text-graphite"><a href="tel:+493012345678" className="underline underline-offset-2 hover:text-ink transition-colors">+49 30 1234 5678</a></dd>
                </div>
                <div>
                  <dt className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-1">ADDRESS</dt>
                  <dd className="text-graphite not-italic">AFREAK Studio<br />Skalitzer Str. 86<br />10997 Berlin, Germany</dd>
                </div>
                <div>
                  <dt className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-1">HOURS</dt>
                  <dd className="text-graphite">Mon–Fri: 10:00–18:00 CET<br />Sat: 12:00–16:00<br />Sun: Closed</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-line pt-8">
              <h3 className="font-sans font-bold uppercase text-xs tracking-label text-ink mb-4">FOLLOW US</h3>
              <div className="flex gap-4">
                {['instagram', 'x', 'youtube', 'pinterest'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 flex items-center justify-center border border-line text-graphite hover:text-ink hover:border-ink transition-colors" aria-label={social.charAt(0).toUpperCase() + social.slice(1)}>
                    <Placeholder ratio="aspect-square" label={social.toUpperCase()} className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="border-t border-line pt-12">
          <h2 className="font-display font-extrabold uppercase text-2xl tracking-tight text-ink mb-6">QUICK ANSWERS</h2>
          <div className="space-y-4">
            {[
              { q: 'What is your return policy?', a: 'We offer 30-day free returns on all unworn items with original tags. Custom print items are non-returnable.' },
              { q: 'How long does shipping take?', a: 'Standard shipping: 2-5 business days EU, 5-10 worldwide. Express options available at checkout.' },
              { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide. Free shipping on orders over €150. Duties and taxes may apply.' },
              { q: 'Can I customize any product?', a: 'Most of our blanks are available for custom printing. Check the product page for the "Add Custom Print" option.' },
            ].map((faq, i) => (
              <details key={i} className="border-b border-line group">
                <summary className="flex items-center justify-between py-4 font-sans font-medium text-sm text-ink list-none cursor-pointer">
                  {faq.q}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-graphite transition-transform group-open:rotate-180"><path d="M6 9l6 6 6-6"/></svg>
                </summary>
                <div className="pb-4 text-graphite text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}