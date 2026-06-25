// Utility to flatten products with variants into separate product cards
export const flattenProducts = (products) => {
  if (!products || !Array.isArray(products)) return [];

  const flattened = [];
  const validColors = ['black', 'brown', 'red', 'pink', 'orange', 'grey', 'dark grey', 'beige', 'multicolor', 'green', 'blue', 'tan', 'white', 'yellow', 'purple'];

  products.forEach(product => {
    // Check if the variants actually contain simple colors we want to split by
    const hasColorVariants = product.variants && product.variants.length > 1 && 
      product.variants.some(v => v.color && validColors.some(validColor => {
        const regex = new RegExp(`\\b${validColor}\\b`, 'i');
        return regex.test(v.color);
      }));

    if (hasColorVariants) {
      // Explode into multiple products
      product.variants.forEach((variant, vIdx) => {
          // Prioritize variant images first, then fallback to base product images
          const vImg0 = variant.images && variant.images[0] && variant.images[0] !== '/.webp' ? variant.images[0] : null;
          const vImg1 = variant.images && variant.images[1] && variant.images[1] !== '/.webp' ? variant.images[1] : null;
          
          const imgSrc = vImg0 || (product.imgSrc && product.imgSrc !== '/.webp' ? product.imgSrc : '');
          const hoverImgSrc = vImg1 || (product.hoverImgSrc && product.hoverImgSrc !== '/.webp' ? product.hoverImgSrc : '');

          // Effective price: use variant price if set, else fall back to product base price
          const effectivePrice = (variant.price && variant.price > 0) ? variant.price : (product.price || 0);
          const effectiveOldPrice = (variant.oldPrice && variant.oldPrice > 0) ? variant.oldPrice : (product.oldPrice || 0);

          flattened.push({
            ...product,
            displayId: `${product.id}-v${vIdx}`,
            name: `${product.name} - ${variant.color}`,
            selectedVariant: variant.color,
            imgSrc: imgSrc,
            hoverImgSrc: hoverImgSrc,
            price: effectivePrice,
            oldPrice: effectiveOldPrice,
            isOutOfStock: product.isOutOfStock || (variant.isOutOfStock === true)
          });
        });
    } else {
      // No variants, just push the original product with its set images
      const imgSrc = product.imgSrc && product.imgSrc !== '/.webp' ? product.imgSrc 
        : (product.variants && product.variants[0]?.images?.[0]) || '';
      const hoverImgSrc = product.hoverImgSrc && product.hoverImgSrc !== '/.webp' ? product.hoverImgSrc 
        : (product.variants && product.variants[0]?.images?.[1]) || '';
      
      flattened.push({ 
        ...product, 
        displayId: `${product.id}`,
        imgSrc: imgSrc,
        hoverImgSrc: hoverImgSrc,
        price: product.price || 0,
        oldPrice: product.oldPrice || 0
      });
    }
  });

  return flattened;
};
