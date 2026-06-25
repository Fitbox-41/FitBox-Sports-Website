const fs = require('fs');
const data = require('./Frontend/src/data/products.js');

// `products.js` currently exports an array, but we need to parse it or just filter it.
// Wait, `products.js` is an ES module `export default products;`. We can't require it directly.
// Let's read `product.json` instead.

let content = fs.readFileSync('./Frontend/src/data/product.json', 'utf8');
const products = JSON.parse(content);
const validProducts = products.filter(p => p.name && p.name.trim() !== '' && p.category && p.category.trim() !== '');

// Also clean up sizes/variants that are empty objects
validProducts.forEach(p => {
    if (p.sizes) {
        p.sizes = p.sizes.filter(s => s.name && s.name.trim() !== '');
    }
    if (p.variants) {
        p.variants = p.variants.filter(v => v.color && v.color.trim() !== '');
    }
});

fs.writeFileSync('./Frontend/src/data/product.json', JSON.stringify(validProducts, null, 4));

const jsContent = `const products = ${JSON.stringify(validProducts, null, 4)};\n\nexport default products;\n`;
fs.writeFileSync('./Frontend/src/data/products.js', jsContent);
console.log('Successfully filtered empty products. Total products:', validProducts.length);
