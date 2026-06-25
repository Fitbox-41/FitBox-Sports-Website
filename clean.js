const fs = require('fs');
let content = fs.readFileSync('./Frontend/src/data/product.json', 'utf8');
content = content.replace(/"weight":\s*,/g, '"weight": 0,');
content = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
content = content.replace(/,\s*([\]}])/g, '$1');
content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, ' '); // Replace all control characters
content = content.replace(/\}\s*\{/g, '}, {'); // Add missing commas between objects
content = content.replace(/\]\s*\[/g, '], ['); // Add missing commas between arrays

try {
    const data = JSON.parse(content);
    
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

    const jsContent = `const products = ${JSON.stringify(data, null, 4)};\n\nexport default products;\n`;
    fs.writeFileSync('./Frontend/src/data/products.js', jsContent);
    fs.writeFileSync('./Frontend/src/data/product.json', JSON.stringify(data, null, 4));
    console.log('Successfully cleaned product.json and created products.js. Total products:', data.length);
} catch(e) {
    console.error('Parse Error:', e.message);
    const lineIndex = parseInt(e.message.match(/at position (\d+)/)?.[1] || 0);
    if (lineIndex) {
        console.log('Context:', content.substring(lineIndex - 50, lineIndex + 50));
    }
}
