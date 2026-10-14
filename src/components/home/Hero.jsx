import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Placeholder from '../ui/Placeholder';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

const heroSlides = [
  { 
    eyebrow: 'NEW COLLECTION SS26',
    headline: ['DESIGNED', 'FOR THE', 'UNDEFINED.'],
    subtext: 'Minimal design. Maximum impact. Built for the present. Worn into the future.',
    modelLabel: 'MODEL IMAGE'
  },
  { 
    eyebrow: 'SPRING SUMMER 2026',
    headline: ['CRAFTED', 'FOR THE', 'UNBOUND.'],
    subtext: 'Precision tailoring meets street sensibility. Every stitch tells a story.',
    modelLabel: 'MODEL IMAGE 2'
  },
  { 
    eyebrow: 'LIMITED EDITION DROP',
    headline: ['DEFINED', 'BY THE', 'UNSEEN.'],
    subtext: 'Exclusive pieces for those who define their own path. Limited quantities.',
    modelLabel: 'MODEL IMAGE 3'
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative min-h-[560px] lg:min-h-[720px] overflow-hidden" aria-label="Hero carousel">
      <div className="max-w-wide mx-auto px-6 lg:px-8 h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 h-full items-start">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center lg:pt-12 z-10">
            <span className="font-sans font-semibold uppercase text-xs tracking-label text-ink mb-4">
              {slide.eyebrow}
            </span>
            <h1 className="font-display font-black uppercase leading-[0.9] tracking-tight text-ink mb-6 lg:mb-8">
              {slide.headline.map((line, i) => (
                <div key={i} className="text-5xl lg:text-6xl xl:text-7xl">
                  {line}
                </div>
              ))}
            </h1>
            <p className="font-sans text-base lg:text-lg text-graphite leading-relaxed mb-8 lg:mb-10 max-w-md">
              {slide.subtext}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="w-full sm:w-auto">
                SHOP NOW
              </Button>
              <Button variant="link" size="lg" className="w-full sm:w-auto justify-start">
                VIEW LOOKBOOK
              </Button>
            </div>
          </div>

          {/* Right Column - Model Image */}
          <div className="relative lg:pt-8">
            <div className="relative aspect-[3/4] bg-mist overflow-hidden">
              <Placeholder ratio="aspect-[3/4]" label={slide.modelLabel} className="transition-opacity duration-300" />
              
              {/* Vertical text label - Desktop only */}
              <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 -translate-x-[40px] transform">
                <div className="writing-mode-vertical-rl text-right">
                  <span className="font-sans font-bold uppercase text-[12px] tracking-label text-ink">
                    SS26 COLLECTION
                  </span>
                  <div className="w-[1px] h-36 bg-ink mx-auto mt-4" />
                </div>
              </div>
            </div>

            {/* Carousel Controls - Bottom Right */}
            <div className="absolute bottom-6 right-0 flex items-center gap-4">
              <div className="flex items-center gap-3 font-sans font-medium uppercase text-xs tracking-label text-ink">
                <span className="w-8 text-center">{String(currentSlide + 1).padStart(2, '0')}</span>
                <div className="w-16 h-[1px] bg-ink" />
                <span className="w-8 text-center">03</span>
              </div>
              <div className="w-[80px] h-[56px] bg-ink flex items-center justify-center gap-4">
                <button
                  onClick={prevSlide}
                  disabled={isAnimating}
                  className="w-10 h-10 flex items-center justify-center text-paper hover:bg-ink/80 transition-colors disabled:opacity-50"
                  aria-label="Previous slide"
                >
                  <Icon name="arrowLeft" size={18} />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={isAnimating}
                  className="w-10 h-10 flex items-center justify-center text-paper hover:bg-ink/80 transition-colors disabled:opacity-50"
                  aria-label="Next slide"
                >
                  <Icon name="arrowRight" size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}