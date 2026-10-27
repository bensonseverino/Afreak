import { useState } from 'react';
import Placeholder from './Placeholder';

/**
 * CMS image (CMS CONNECTION FIX §5.4).
 *
 * Handles the three ways a CMS image breaks (cause C-8): no image row at all,
 * an empty URL, or a URL that 404s. Every case renders a labelled placeholder
 * and warns the console with the exact failing URL, so a broken media key is
 * never an invisible gap.
 */
export default function CmsImage({
  image,
  alt = '',
  ratio = 'aspect-[3/4]',
  className = '',
  imgClassName = '',
  sizes,
  priority = false,
  grayscale = false,
}) {
  const [failed, setFailed] = useState(false);
  const src = image?.url || null;
  const label = image?.alt || alt || 'IMAGE';

  if (!src || failed) {
    return (
      <Placeholder
        ratio={ratio}
        label={failed ? 'IMAGE UNAVAILABLE' : label}
        className={className}
      />
    );
  }

  return (
    <div className={`${ratio} ${className} bg-mist overflow-hidden`}>
      <img
        src={src}
        alt={label}
        width={image?.width || undefined}
        height={image?.height || undefined}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onError={() => {
          console.warn('[cms] image failed to load:', src);
          setFailed(true);
        }}
        className={`w-full h-full object-cover ${grayscale ? 'grayscale' : ''} ${imgClassName}`}
      />
    </div>
  );
}
