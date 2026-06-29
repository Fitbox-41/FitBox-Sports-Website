// Utility to flatten products with variants into separate product cards
export const flattenProducts = (products) => {
  if (!products || !Array.isArray(products)) return [];

  const flattened = [];

  products.forEach(product => {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const baseImg = product.imgSrc && product.imgSrc !== '/.webp' ? product.imgSrc : '';
    const baseHoverImg = product.hoverImgSrc && product.hoverImgSrc !== '/.webp' ? product.hoverImgSrc : '';

    if (variants.length > 0) {
      variants.forEach((variant, vIdx) => {
        const variantName = variant.color ? variant.color.toString().trim() : `Variant ${vIdx + 1}`;
        const variantImages = Array.isArray(variant.images) ? variant.images : [];
        const variantImgSrc = variantImages[0] && variantImages[0] !== '/.webp' ? variantImages[0] : baseImg;
        const variantHoverImgSrc = variantImages[1] && variantImages[1] !== '/.webp' ? variantImages[1] : baseHoverImg;

        const sizes = Array.isArray(variant.sizes) && variant.sizes.length > 0 ? variant.sizes : [null];

        sizes.forEach((size, sIdx) => {
          const sizeLabel = size && size.name ? size.name.toString().trim() : null;
          const displayName = [product.name, variantName, sizeLabel].filter(Boolean).join(' - ');

          const effectivePrice = size && typeof size.price === 'number' && size.price > 0
            ? size.price
            : typeof variant.price === 'number' && variant.price > 0
              ? variant.price
              : typeof product.price === 'number' && product.price > 0
                ? product.price
                : 0;

          const effectiveOldPrice = size && typeof size.oldPrice === 'number' && size.oldPrice > 0
            ? size.oldPrice
            : typeof variant.oldPrice === 'number' && variant.oldPrice > 0
              ? variant.oldPrice
              : typeof product.oldPrice === 'number' && product.oldPrice > 0
                ? product.oldPrice
                : 0;

          flattened.push({
            ...product,
            displayId: `${product.id}-v${vIdx}${sizeLabel ? `-s${sIdx}` : ''}`,
            name: displayName,
            selectedVariant: variantName,
            selectedSize: sizeLabel,
            variant: { ...variant, color: variantName },
            size: size ? { ...size } : null,
            imgSrc: variantImgSrc || baseImg,
            hoverImgSrc: variantHoverImgSrc || baseHoverImg,
            price: effectivePrice,
            oldPrice: effectiveOldPrice,
            isOutOfStock: product.isOutOfStock || variant.isOutOfStock === true || (size && size.isOutOfStock === true),
          });
        });
      });
    } else {
      flattened.push({
        ...product,
        displayId: `${product.id}`,
        name: product.name,
        selectedVariant: null,
        selectedSize: null,
        imgSrc: baseImg,
        hoverImgSrc: baseHoverImg,
        price: product.price || 0,
        oldPrice: product.oldPrice || 0,
      });
    }
  });

  return flattened;
};
