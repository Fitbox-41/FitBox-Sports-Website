const fs = require('fs');
const path = require('path');

const jsPath = path.join('Frontend', 'src', 'data', 'products.js');
const content = fs.readFileSync(jsPath, 'utf8');
fs.writeFileSync(jsPath, content, 'utf8');
console.log('products.js is the single source of truth. No product.json sync required.');
