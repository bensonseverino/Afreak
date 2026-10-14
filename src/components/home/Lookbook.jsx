import { lookbookItems } from '../../data/lookbook';
import SectionHeader from '../ui/SectionHeader';
import Placeholder from '../ui/Placeholder';
import { Link } from 'react-router-dom';

export default function Lookbook() {
  return (
    <section className="py-12 md:py-16" aria-labelledby="lookbook-heading">
      <div className="max-w-shell mx-auto px-6">
        <SectionHeader label="LOOKBOOK" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5" role="list">
          {lookbookItems.map((item, index) => (
            <Link
              key={item.id}
              to="/lookbook"
              className="group block overflow-hidden"
              aria-label={`View ${item.label}`}
              role="listitem"
            >
              <div className="aspect-[3/4] bg-stone overflow-hidden">
                <Placeholder 
                  ratio="aspect-[3/4]" 
                  label={item.label} 
                  className="grayscale group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}