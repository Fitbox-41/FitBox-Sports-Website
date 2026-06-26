const fs = require('fs');
const path = require('path');

const jsPath = path.join('Frontend', 'src', 'data', 'products.js');
let content = fs.readFileSync(jsPath, 'utf8');

const parseProductsJs = (content) => {
    const match = content.match(/const products =\s*([\s\S]*?)\n\nexport default products;\s*$/);
    if (!match) throw new Error('Unable to parse products.js');
    return JSON.parse(match[1]);
};

const stringifyProductsJs = (data) => `const products = ${JSON.stringify(data, null, 4)};\n\nexport default products;\n`;

const data = parseProductsJs(content);
let before = 0;

const normalizeImage = (img) => {
    if (typeof img !== 'string') return img;
    if (/^\/images\//i.test(img)) {
        before += 1;
        const fileName = img.replace(/^\/images\//i, '');
        return `/Images/${fileName}`;
    }
    return img;
};

const fixedData = data.map(product => ({
    ...product,
    imgSrc: normalizeImage(product.imgSrc),
    hoverImgSrc: normalizeImage(product.hoverImgSrc),
    showcaseImages: Array.isArray(product.showcaseImages) ? product.showcaseImages.map(normalizeImage) : product.showcaseImages,
    variants: Array.isArray(product.variants) ? product.variants.map(variant => ({
        ...variant,
        images: Array.isArray(variant.images) ? variant.images.map(normalizeImage) : variant.images
    })) : product.variants
}));

const after = fixedData.reduce((count, product) => {
    const imageFields = [product.imgSrc, product.hoverImgSrc, ...(product.showcaseImages || []), ...(product.variants || []).flatMap(v => v.images || [])];
    return count + imageFields.filter(img => typeof img === 'string' && img.toLowerCase().startsWith('/images/')).length;
}, 0);

fs.writeFileSync(jsPath, stringifyProductsJs(fixedData), 'utf8');
console.log(`Fixed ${before} /images/ paths in products.js. Remaining /images/ paths: ${after}`);
