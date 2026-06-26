const fs = require('fs');
const path = require('path');

const jsPath = path.join('Frontend', 'src', 'data', 'products.js');

const parseProductsJs = (content) => {
    const match = content.match(/const products =\s*([\s\S]*?)\n\nexport default products;\s*$/);
    if (!match) throw new Error('Unable to parse products.js');
    return JSON.parse(match[1]);
};

const stringifyProductsJs = (data) => `const products = ${JSON.stringify(data, null, 4)};\n\nexport default products;\n`;

let content = fs.readFileSync(jsPath, 'utf8');
const data = parseProductsJs(content);

// Add default price and weight to variants/sizes if not present
data.forEach(product => {
    if (product.sizes) {
        product.sizes.forEach(size => {
            if (size.price === undefined) size.price = product.price || 0;
            if (size.weight === undefined) size.weight = 0;
        });
    }
    if (product.variants) {
        product.variants.forEach(variant => {
            if (variant.price === undefined) variant.price = product.price || 0;
            if (variant.weight === undefined) variant.weight = 0;
        });
    }
});

const jsContent = stringifyProductsJs(data);
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('Successfully cleaned products.js. Total products:', data.length);
