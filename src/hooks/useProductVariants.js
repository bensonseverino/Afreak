import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Canonical size run; unknown labels sort last. */
const SIZE_RUN = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

/** Slugify a string for URL query params. */
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Parse JSON array from API. */
function parseIds(raw) {
  if (Array.isArray(raw)) return raw.map((v) => Number(v)).filter(Number.isFinite);
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((v) => Number(v)).filter(Number.isFinite)
      : [];
  } catch {
    return [];
  }
}

/**
 * Hook that owns the variant selection state for a product.
 * Returns derived values and actions for the UI.
 */
export function useProductVariants(product) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selection, setSelection] = useState({ Color: null, Size: null });

  // Extract options + variants
  const options = product?.options ?? [];
  const variants = product?.variants ?? [];
  const colorOption = options.find((o) => o.type === 'color');
  const sizeOption = options.find((o) => o.type === 'size');

  // All available color/size values. `product.colors` / `product.sizes` are
  // already mapped by the API layer (`detailToProduct`); raw `options` values
  // use `value` instead of `name`, so normalise both to one shape.
  const allColorValues = useMemo(() => {
    const mapped = (product?.colors ?? [])
      .map((c) => ({
        name: c.name ?? c.value,
        hex: c.hex ?? c.swatchHex ?? '#000000',
        swatchImageUrl: c.swatchImageUrl ?? null,
        optionValueId: c.optionValueId ?? c.id,
      }))
      .filter((c) => Boolean(c.name));
    if (mapped.length) return mapped;
    return (colorOption?.values ?? [])
      .map((v) => ({
        name: v.name ?? v.value,
        hex: v.swatchHex ?? v.hex ?? '#000000',
        swatchImageUrl: v.swatchImageUrl ?? null,
        optionValueId: v.optionValueId ?? v.id,
      }))
      .filter((c) => Boolean(c.name));
  }, [product?.colors, colorOption]);

  const allSizeValues = useMemo(() => {
    // The API returns option values alphabetically; restore the storefront's size run.
    const rank = (label) => {
      const i = SIZE_RUN.indexOf(label);
      return i === -1 ? SIZE_RUN.length : i;
    };
    const mapped = (product?.sizes ?? [])
      .map((s) => (typeof s === 'string' ? s : s?.label ?? s?.value))
      .filter(Boolean)
      .sort((a, b) => rank(a) - rank(b));
    if (mapped.length) return mapped;
    return (sizeOption?.values ?? []).map((v) => v.value ?? v.name).filter(Boolean);
  }, [product?.sizes, sizeOption]);

  /** Find a variant matching the current selection. */
  const selectedVariant = useMemo(() => {
    if (!selection.Color || !selection.Size) return null;
    return variants.find(
      (v) =>
        v.colorName === selection.Color &&
        v.size === selection.Size &&
        v.active !== false &&
        (v.trackStock === false || v.stock > 0),
    ) ?? null;
  }, [variants, selection]);

  /** Check if a specific color/size combo has an active, in-stock variant. */
  const isComboAvailable = (colorName, sizeLabel) => {
    return variants.some(
      (v) =>
        v.colorName === colorName &&
        v.size === sizeLabel &&
        v.active !== false &&
        (v.trackStock === false || v.stock > 0),
    );
  };

  /** Available sizes for the currently selected color. */
  const availableSizes = useMemo(() => {
    const color = selection.Color;
    if (!color) return allSizeValues.map((label) => ({ label, available: true }));
    return allSizeValues.map((label) => ({
      label,
      available: isComboAvailable(color, label),
      stock: variants.find((v) => v.colorName === color && v.size === label)?.stock ?? 0,
    }));
  }, [allSizeValues, selection.Color, variants]);

  /** Whether each color has any available variant. */
  const colorAvailability = useMemo(() => {
    return allColorValues.map((c) => {
      const hasStock = allSizeValues.some((s) => isComboAvailable(c.name, s));
      return {
        name: c.name,
        hex: c.hex,
        swatchImageUrl: c.swatchImageUrl,
        available: hasStock,
        optionValueId: c.optionValueId,
      };
    });
  }, [allColorValues, allSizeValues, variants]);

  /** Gallery images for the selected color (color-specific first, then general). */
  const galleryImages = useMemo(() => {
    // `product.imageObjects` carries the CMS metadata (colour, primary flag);
    // `product.images` is a plain URL list kept for cards and cart lines.
    const all = (product?.imageObjects?.length
      ? product.imageObjects
      : (product?.images ?? []).map((url) =>
          typeof url === 'string'
            ? { url, optionValueId: null, colorName: null, isPrimary: false, position: 0 }
            : { ...url, isPrimary: Boolean(url?.isPrimary) },
        )
    ).filter((img) => Boolean(img?.url));
    if (!all.length) return [];

    const color = selection.Color;
    const colorKey = allColorValues.find((c) => c.name === color)?.optionValueId ?? color;
    const colorSpecific = all.filter(
      (img) =>
        (img.optionValueId && colorKey && img.optionValueId === colorKey) ||
        (img.colorName && color && img.colorName === color),
    );
    const general = all.filter((img) => !img.optionValueId && !img.colorName);
    // Colour-specific shots first (the selected colour's lead image), then the
    // product's general shots, so a colour with one photo still has a gallery.
    const seen = new Set();
    const pool = [...colorSpecific, ...general, ...all].filter((img) => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
    // Sort by isPrimary first, then position
    return [...pool].sort(
      (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || (a.position ?? 0) - (b.position ?? 0),
    ).map((i) => i.url);
  }, [product?.imageObjects, product?.images, selection.Color, allColorValues]);

  /** Current effective price (variant override or base). */
  const price = useMemo(() => {
    if (selectedVariant?.price != null) return selectedVariant.price;
    return product?.price ?? 0;
  }, [selectedVariant, product?.price]);

  /** Compare-at price (variant or base). */
  const compareAtPrice = useMemo(() => {
    if (selectedVariant?.compareAtPrice != null) return selectedVariant.compareAtPrice;
    return product?.oldPrice ?? null;
  }, [selectedVariant, product?.oldPrice]);

  /** Whether the current selection is in stock. */
  const inStock = useMemo(() => {
    if (!selection.Color || !selection.Size) return true;
    return selectedVariant != null;
  }, [selection, selectedVariant]);

  /** Low stock count for selected variant. */
  const lowStock = useMemo(() => {
    if (!selectedVariant) return 0;
    return selectedVariant.trackStock && selectedVariant.stock > 0 && selectedVariant.stock <= 3
      ? selectedVariant.stock
      : 0;
  }, [selectedVariant]);

  /** Update selection and URL. */
  const updateSelection = (nextColor, nextSize) => {
    setSelection({ Color: nextColor, Size: nextSize });
    const params = new URLSearchParams(searchParams);
    if (nextColor) params.set('color', slugify(nextColor));
    else params.delete('color');
    if (nextSize) params.set('size', nextSize);
    else params.delete('size');
    setSearchParams(params, { replace: true });
  };

  /** Select a color; reset size if not available in new color. */
  const selectColor = (colorName) => {
    const newSize = isComboAvailable(colorName, selection.Size)
      ? selection.Size
      : allSizeValues.find((s) => isComboAvailable(colorName, s)) ?? null;
    updateSelection(colorName, newSize);
  };

  /** Select a size. */
  const selectSize = (sizeLabel) => {
    updateSelection(selection.Color, sizeLabel);
  };

  // Initialize from URL params on product load
  useEffect(() => {
    if (!product) return;
    const urlColor = searchParams.get('color');
    const urlSize = searchParams.get('size');

    // Match URL color to option value (by slug or exact name)
    const colorMatch = allColorValues.find(
      (c) => slugify(c.name) === urlColor || (c.name ?? '').toLowerCase() === (urlColor ?? '').toLowerCase(),
    );
    const sizeMatch = allSizeValues.find((s) => s.toLowerCase() === (urlSize ?? '').toLowerCase());

    // Default fallback color — predictable in the common case (no selected color, no URL color)
    const fallbackColor = allColorValues[0]?.name ?? null;

    // Default: URL color, else first color that has any available size, else first color, else null
    const defaultColor =
      colorMatch?.name ??
      allColorValues.find((c) => allSizeValues.some((s) => isComboAvailable(c.name, s)))?.name ??
      fallbackColor;

    // If the chosen/default color has no stock at all, fall back to the first color
    // that does; once no color can be stocked, leave the color empty.
    const chosenColor = defaultColor ?? fallbackColor;
    const defaultSize =
      sizeMatch ??
      allSizeValues.find((s) => isComboAvailable(chosenColor, s)) ??
      (chosenColor ? allSizeValues[0] : null);

    // If the URL size is not available in the chosen color, pick the first available
    // size for that color (or keep the chosen size if it is still a valid value).
    if (chosenColor && !isComboAvailable(chosenColor, defaultSize)) {
      const picked = allSizeValues.find((s) => isComboAvailable(chosenColor, s));
      if (picked) {
        setSelection({ Color: chosenColor, Size: picked });
      } else if (defaultColor || fallbackColor) {
        setSelection({ Color: defaultColor ?? fallbackColor, Size: defaultSize });
      } else {
        setSelection({ Color: null, Size: null });
      }
    } else if (defaultColor || fallbackColor) {
      setSelection({ Color: defaultColor ?? fallbackColor, Size: defaultSize });
    } else {
      // Keep selection idle when no color is chosen and no stock is available.
      setSelection({ Color: null, Size: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, searchParams.toString()]);

  return {
    // Raw state
    selection,
    setSelection: updateSelection,
    // Derived
    selectedColor: selection.Color,
    selectedSize: selection.Size,
    selectedVariant,
    galleryImages,
    price,
    compareAtPrice,
    inStock,
    lowStock,
    availableSizes,
    colorAvailability,
    allColorValues: allColorValues.map((c) => ({
      name: c.name,
      hex: c.hex,
      swatchImageUrl: c.swatchImageUrl,
      optionValueId: c.optionValueId,
    })),
    allSizeValues,
    // Actions
    selectColor,
    selectSize,
  };
}

/** Helper to get available values for a specific option name. */
export function useAvailableValuesFor(product, optionName, currentSelection) {
  const options = product?.options ?? [];
  const option = options.find((o) => o.name === optionName);
  const variants = product?.variants ?? [];

  if (!option) return [];

  return option.values.map((value) => {
    const otherOption = options.find((o) => o.name !== optionName);
    const otherValue = otherOption ? currentSelection[otherOption.name] : null;
    let available = true;
    if (otherOption && otherValue) {
      available = variants.some(
        (v) =>
          v[optionName === 'Color' ? 'colorName' : 'size'] === value.value &&
          v[otherOption.name === 'Color' ? 'colorName' : 'size'] === otherValue &&
          v.active !== false &&
          (v.trackStock === false || v.stock > 0),
      );
    } else {
      available = variants.some(
        (v) =>
          v[optionName === 'Color' ? 'colorName' : 'size'] === value.value &&
          v.active !== false &&
          (v.trackStock === false || v.stock > 0),
      );
    }
    return { ...value, available };
  });
}