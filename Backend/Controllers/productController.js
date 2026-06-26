import Product from '../Models/Product.js';

const makeImageUrl = (req, imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return imagePath;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    if (normalizedPath.startsWith('/admin/public/')) {
        return `${req.protocol}://${req.get('host')}${normalizedPath}`;
    }

    // Preserve frontend public assets as relative paths so the browser resolves them from the frontend app origin.
    const frontendPrefixes = ['/Images/', '/images/', '/assets/', '/img/'];
    if (frontendPrefixes.some(prefix => normalizedPath.toLowerCase().startsWith(prefix))) {
        return normalizedPath;
    }

    // All other relative image paths should stay relative.
    return normalizedPath;
};

const normalizeProduct = (product, req) => {
    const normalized = JSON.parse(JSON.stringify(product));
    delete normalized.sizes;

    if (normalized.imgSrc) normalized.imgSrc = makeImageUrl(req, normalized.imgSrc);
    if (normalized.hoverImgSrc) normalized.hoverImgSrc = makeImageUrl(req, normalized.hoverImgSrc);
    if (Array.isArray(normalized.showcaseImages)) {
        normalized.showcaseImages = normalized.showcaseImages.map((img) => makeImageUrl(req, img));
    }
    if (Array.isArray(normalized.variants)) {
        normalized.variants = normalized.variants.map((variant) => {
            const v = { ...variant };
            if (Array.isArray(v.images)) {
                v.images = v.images.map((img) => makeImageUrl(req, img));
            }
            return v;
        });
    }

    return normalized;
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products.map((product) => normalizeProduct(product, req)));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ id: Number(req.params.id) });
        if (product) {
            res.status(200).json(normalizeProduct(product, req));
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
