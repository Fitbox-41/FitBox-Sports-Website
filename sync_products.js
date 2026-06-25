const fs = require('fs');
const path = require('path');

// Read the updated product.json
const jsonPath = path.join('Frontend', 'src', 'data', 'product.json');
const jsPath = path.join('Frontend', 'src', 'data', 'products.js');

const jsonContent = fs.readFileSync(jsonPath, 'utf8');

// Wrap as JS module export
const jsContent = `// Auto-generated from product.json - do not edit manually
const products = ${jsonContent};

export default products;
`;

fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('products.js updated successfully from product.json');
