import { useState } from 'react';
import Placeholder from '../ui/Placeholder';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';

export default function Gallery({ 
  images = [], 
  badges = [], 
  isMobile = false,
  onWishlistToggle 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isMobile) {
    return (
      <div className="relative" role="region" aria-label="Product gallery">
        <div className="slider-container">
          <div 
            className="slider-track" 
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 aspect-[3/4] bg-card relative">
                <Placeholder ratio="aspect-[3/4]" label="PRODUCT IMAGE" src={image} alt={`Product view ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        {badges.map((badge, i) => (
          <Badge key={i} variant={badge.type} className="absolute top-4 left-4 z-10">
            {badge.label}
          </Badge>
        ))}

        {/* Wishlist */}
        <button
          onClick={onWishlistToggle}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-paper border border-line flex items-center justify-center hover:bg-mist transition-colors"
          aria-label="Add to wishlist"
          type="button"
        >
          <Icon name="heart" size={20} />
        </button>

        {/* Thumbnail dots */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Product images">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-ink w-6' : 'bg-stone hover:bg-graphite'
                }`}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`View image ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop: 3-image grid layout (1 tall left, 2 stacked right)
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-4" role="region" aria-label="Product gallery">
      {/* Left - Tall image */}
      <div className="relative aspect-[3/4] bg-card overflow-hidden">
        <Placeholder ratio="aspect-[3/4]" label="PRODUCT IMAGE" src={images[0]} alt="Main product view" />
        {badges.map((badge, i) => (
          <Badge key={i} variant={badge.type} className="absolute top-4 left-4 z-10">
            {badge.label}
          </Badge>
        ))}
      </div>

      {/* Right - Two stacked images */}
      <div className="grid grid-rows-[1fr_1fr] gap-4">
        <div className="relative aspect-[3/4] bg-card overflow-hidden">
          <Placeholder ratio="aspect-[3/4]" label="PRODUCT IMAGE" src={images[1]} alt="Product detail view 1" />
        </div>
        <div className="relative aspect-[4/3] bg-card overflow-hidden">
          <Placeholder ratio="aspect-[4/3]" label="PRODUCT IMAGE" src={images[2]} alt="Product detail view 2" />
        </div>
      </div>
    </div>
  );
}