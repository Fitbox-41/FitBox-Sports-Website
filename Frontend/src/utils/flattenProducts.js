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
          // Determine the main images for this variant
          const variantImages = variant.images && variant.images.length > 0 ? variant.images : product.showcaseImages;
          const imgSrc = variantImages[0] || product.imgSrc;
          const hoverImgSrc = variantImages[1] || variantImages[0] || product.hoverImgSrc;

          flattened.push({
            ...product,
            // Create a unique ID for mapping in React
            displayId: `${product.id}-v${vIdx}`,
            // Modify the name to include the color for the card display
            name: `${product.name} - ${variant.color}`,
            // Pass the selected variant so the Link can append ?color=...
            selectedVariant: variant.color,
            // Override images
            imgSrc: imgSrc,
            hoverImgSrc: hoverImgSrc,
            // Override stock status based on variant
            isOutOfStock: variant.isOutOfStock !== undefined ? variant.isOutOfStock : product.isOutOfStock
          });
        });
    } else {
      // No variants, just push the original product
      flattened.push({ ...product, displayId: `${product.id}` });
    }
  });

  return flattened;
};
