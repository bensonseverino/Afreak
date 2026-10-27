import { useEffect } from 'react';

/**
 * Applies CMS SEO fields to the document (audit row 16).
 *
 * Product pages get `seo_title` / `seo_description` from the API. The previous
 * title, and any existing description tag, are restored on unmount so client
 * side navigation back to another page does not keep the product's metadata.
 */
export default function useDocumentMeta(title, description) {
  useEffect(() => {
    if (!title) return undefined;

    const previousTitle = document.title;
    document.title = title;

    let tag = document.querySelector('meta[name="description"]');
    const created = !tag;
    const previousDescription = tag?.getAttribute('content') ?? null;
    const previousContent = description ?? null;

    if (description) {
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (!created) {
        if (previousDescription == null) tag?.removeAttribute('content');
        else tag?.setAttribute('content', previousDescription);
      } else if (previousContent != null || previousDescription == null) {
        tag?.remove();
      }
    };
  }, [title, description]);
}
