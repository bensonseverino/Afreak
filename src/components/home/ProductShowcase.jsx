import { useState } from 'react';
import Placeholder from '../ui/Placeholder';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Price from '../ui/Price';

const showcaseSlides = [
  {
    label: 'PRODUCT SHOWCASE',
    title: 'UTILITY HOODIE',
    price: 120,
    description: 'The Utility Hoodie is engineered for daily performance. Water-resistant shell, multiple utility pockets, and adjustable hem for a customizable fit.',
    features: [
      { icon: 'drop', label: 'WATER RESISTANT' },
      { icon: 'pocket', label: 'MULTI POCKETS' },
      { icon: 'focusCorners', label: 'ADJUSTABLE FIT' },
    ],
    images: ['PRODUCT IMAGE', 'PRODUCT IMAGE 2', 'PRODUCT IMAGE 3'],
  },
  {
    label: 'PRODUCT SHOWCASE',
    title: 'TECH CARGO HOODIE',
    price: 160,
    description: 'Technical cargo hoodie with modular pocket system. Durable water repellent finish and articulated patterning for unrestricted movement.',
    features: [
      { icon: 'drop', label: 'WATER RESISTANT' },
      { icon: 'pocket', label: 'MODULAR POCKETS' },
      { icon: 'focusCorners', label: 'ARTICULATED FIT' },
    ],
    images: ['PRODUCT IMAGE', 'PRODUCT IMAGE 2', 'PRODUCT IMAGE 3'],
  },
  {
    label: 'PRODUCT SHOWCASE',
    title: 'OVERSIZED T-SHIRT',
    price: 60,
    description: 'Heavyweight cotton tee with relaxed boxy fit. Garment-dyed for a lived-in feel. Screen printed graphics with water-based inks.',
    features: [
      { icon: 'drop', label: 'HEAVYWEIGHT COTTON' },
      { icon: 'pocket', label: 'BOXY FIT' },
      { icon: 'focusCorners', label: 'GARMENT DYED' },
    ],
    images: ['PRODUCT IMAGE', 'PRODUCT IMAGE 2', 'PRODUCT IMAGE 3'],
  },
];

export default function ProductShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = showcaseSlides[currentSlide];

  return (
    <section className="bg-mist py-16" aria-labelledby="showcase-heading">
      <div className="max-w-wide mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Left Column - Text */}
          <div className="lg:pt-8 space-y-6">
            <span className="font-sans font-bold uppercase text-[13px] tracking-label text-ink">
              {slide.label}
            </span>
            <h2 id="showcase-heading" className="font-display font-extrabold uppercase leading-none text-3xl lg:text-4xl text-ink">
              {slide.title}
            </h2>
            <div className="font-sans font-bold text-[13px] text-ink"><Price amount={slide.price} /></div>
            <p className="text-graphite leading-relaxed text-sm lg:text-base max-w-xs">
              {slide.description}
            </p>
            <Button variant="solid" className="w-full lg:w-auto">
              VIEW PRODUCT
            </Button>
            {/* Mini carousel control */}
            <div className="flex items-center gap-3 font-sans font-medium uppercase text-xs tracking-label text-ink pt-4 border-t border-line">
              <button
                onClick={() => setCurrentSlide((currentSlide - 1 + showcaseSlides.length) % showcaseSlides.length)}
                className="text-graphite hover:text-ink transition-colors"
                aria-label="Previous product"
              >
                <Icon name="arrowLeft" size={16} />
              </button>
              <span className="w-8 text-center">{String(currentSlide + 1).padStart(2, '0')}</span>
              <div className="w-16 h-[1px] bg-ink" />
              <span className="w-8 text-center">03</span>
              <button
                onClick={() => setCurrentSlide((currentSlide + 1) % showcaseSlides.length)}
                className="text-graphite hover:text-ink transition-colors"
                aria-label="Next product"
              >
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </div>

          {/* Center Column - Large Product Image */}
          <div className="relative aspect-[4/5] bg-mist overflow-hidden lg:aspect-[3/4]">
            <Placeholder ratio="aspect-[4/5]" label={slide.images[0]} className="transition-opacity duration-300" />
          </div>

          {/* Right Column - Features */}
          <div className="space-y-8 lg:pt-8">
            {slide.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-ink">
                  <Icon name={feature.icon} size={40} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="font-sans font-bold uppercase text-[12px] tracking-label text-ink block leading-tight">
                    {feature.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}