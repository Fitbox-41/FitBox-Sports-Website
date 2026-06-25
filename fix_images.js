const fs = require('fs');
const path = require('path');

const filePath = path.join('Frontend', 'src', 'data', 'product.json');
let content = fs.readFileSync(filePath, 'utf8');

// Fix: /images/X.X.X -> /Images/X.X.X.jpg  (case fix + add extension)
const before = (content.match(/\/images\//gi) || []).length;
content = content.replace(/"\/images\/([\d.]+)"/g, '"/Images/$1.jpg"');
const after = (content.match(/\/Images\//g) || []).length;

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Fixed ${before} image paths -> ${after} paths now use /Images/*.jpg`);
