const fs = require('fs');
const path = require('path');

const jsPath = path.join('Frontend', 'src', 'data', 'products.js');

const parseProductsJs = (content) => {
    const match = content.match(/const products =\s*([\s\S]*?)\n\nexport default products;\s*$/);
    if (!match) throw new Error('Unable to parse products.js');
    return JSON.parse(match[1]);
};

const stringifyProductsJs = (data) => `const products = ${JSON.stringify(data, null, 4)};\n\nexport default products;\n`;

const content = fs.readFileSync(jsPath, 'utf8');
const products = parseProductsJs(content);
const validProducts = products.filter(p => p.name && p.name.trim() !== '' && p.category && p.category.trim() !== '');

validProducts.forEach(p => {
    if (p.sizes) {
        p.sizes = p.sizes.filter(s => s.name && s.name.trim() !== '');
    }
    if (p.variants) {
        p.variants = p.variants.filter(v => v.color && v.color.trim() !== '');
    }
});

const jsContent = stringifyProductsJs(validProducts);
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('Successfully filtered empty products in products.js. Total products:', validProducts.length);
