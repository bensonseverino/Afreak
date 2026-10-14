import Placeholder from '../components/ui/Placeholder';
import { Link } from 'react-router-dom';

const journalPosts = [
  { 
    id: 1, 
    category: 'DESIGN', 
    title: 'The Anatomy of a Hoodie', 
    excerpt: 'Breaking down the construction details that make our Utility Hoodie a modern classic.',
    date: 'MARCH 15, 2026',
    readTime: '5 MIN READ'
  },
  { 
    id: 2, 
    category: 'CULTURE', 
    title: 'Streetwear in the Age of AI', 
    excerpt: 'How generative tools are reshaping graphic design and brand identity.',
    date: 'FEBRUARY 28, 2026',
    readTime: '7 MIN READ'
  },
  { 
    id: 3, 
    category: 'SUSTAINABILITY', 
    title: 'Closing the Loop', 
    excerpt: 'Our journey toward circular production and the challenges of textile recycling.',
    date: 'FEBRUARY 10, 2026',
    readTime: '6 MIN READ'
  },
  { 
    id: 4, 
    category: 'PRODUCT', 
    title: 'Fabric Deep Dive: Heavyweight Cotton', 
    excerpt: 'Why we chose 480gsm cotton for our tees and what it means for longevity.',
    date: 'JANUARY 22, 2026',
    readTime: '4 MIN READ'
  },
  { 
    id: 5, 
    category: 'COLLABORATION', 
    title: 'Artist Spotlight: KAI R.', 
    excerpt: 'The Berlin-based illustrator behind our SS26 graphic series.',
    date: 'JANUARY 8, 2026',
    readTime: '8 MIN READ'
  },
  { 
    id: 6, 
    category: 'BEHIND THE SCENES', 
    title: 'Factory Visit: Portugal', 
    excerpt: 'Inside the workshop where our garments come to life.',
    date: 'DECEMBER 18, 2025',
    readTime: '9 MIN READ'
  },
];

export default function Journal() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-wide mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <header className="mb-12 lg:mb-16">
          <h1 className="font-display font-black uppercase text-4xl lg:text-5xl tracking-tight text-ink mb-4">
            JOURNAL
          </h1>
          <p className="font-sans text-graphite text-base lg:text-lg max-w-2xl leading-relaxed">
            Stories from the studio, the street, and the supply chain. Deep dives into design, culture, and craft.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
          {journalPosts.map(post => (
            <article key={post.id} className="group" role="listitem">
              <Link to="#" className="block">
                <div className="aspect-[4/3] bg-mist overflow-hidden mb-4">
                  <Placeholder 
                    ratio="aspect-[4/3]" 
                    label="JOURNAL IMAGE" 
                    className="group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-sans font-semibold uppercase tracking-label text-ink">{post.category}</span>
                    <span className="text-graphite">·</span>
                    <span className="font-sans text-graphite">{post.readTime}</span>
                  </div>
                  <h2 className="font-display font-extrabold uppercase text-xl leading-tight text-ink group-hover:text-graphite transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-graphite text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs mt-2">
                    <span className="font-sans text-graphite">{post.date}</span>
                    <span className="text-graphite">→</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="border border-ink text-ink font-sans font-semibold uppercase text-xs tracking-label px-8 py-4 hover:bg-ink hover:text-paper transition-colors">
            LOAD MORE
          </button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20 p-8 lg:p-12 bg-mist border border-line text-center">
          <h2 className="font-display font-extrabold uppercase text-2xl lg:text-3xl tracking-tight text-ink mb-3">
            STAY IN THE LOOP
          </h2>
          <p className="text-graphite max-w-md mx-auto mb-6">
            Subscribe to receive new journal entries, exclusive drops, and behind-the-scenes content.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" aria-label="Journal newsletter">
            <label htmlFor="journal-email" className="sr-only">Email</label>
            <input
              id="journal-email"
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 border border-line bg-paper text-ink placeholder-graphite text-sm focus:outline-none focus:ring-2 focus:ring-ink"
              required
            />
            <button type="submit" className="w-12 h-12 flex items-center justify-center bg-ink text-paper hover:bg-paper hover:text-ink hover:border hover:border-ink transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}