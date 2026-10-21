import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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

  // All available color/size values from options (not just those with variants)
  const allColorValues = colorOption?.values ?? product?.colors?.map((c) => ({ name: c.name, hex: c.hex })) ?? [];
  const allSizeValues = sizeOption?.values?.map((v) => v.value) ?? product?.sizes ?? [];

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
    if (!product?.images?.length) return [];
    const color = selection.Color;
    const colorKey = colorOption?.values.find((v) => v.value === color)?.id ?? color;
    const colorSpecific = product.images.filter(
      (img) =>
        (img.optionValueId && colorKey && img.optionValueId === colorKey) ||
        (img.colorName && color && img.colorName === color),
    );
    const general = product.images.filter(
      (img) => !img.optionValueId && !img.colorName,
    );
    const pool = colorSpecific.length ? colorSpecific : general.length ? general : product.images;
    // Sort by isPrimary first, then position
    return [...pool].sort(
      (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || (a.position ?? 0) - (b.position ?? 0),
    ).map((i) => i.url);
  }, [product?.images, selection.Color, colorOption]);

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
      (c) => slugify(c.name) === urlColor || c.name.toLowerCase() === (urlColor ?? '').toLowerCase(),
    );
    const sizeMatch = allSizeValues.find((s) => s.toLowerCase() === (urlSize ?? '').toLowerCase());

    // Default: first color that has any available size
    let defaultColor = colorMatch?.name ?? allColorValues.find((c) => allSizeValues.some((s) => isComboAvailable(c.name, s)))?.name ?? allColorValues[0]?.name ?? null;
    let defaultSize = sizeMatch ?? allSizeValues.find((s) => isComboAvailable(defaultColor, s)) ?? allSizeValues[0] ?? null;

    // If URL size is not available in chosen color, pick first available
    if (!isComboAvailable(defaultColor, defaultSize)) {
      defaultSize = allSizeValues.find((s) => isComboAvailable(defaultColor, s)) ?? defaultSize;
    }

    setSelection({ Color: defaultColor, Size: defaultSize });
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