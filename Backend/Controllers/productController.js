import Product from '../Models/Product.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../Utils/cloudinary.js';

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

export const addProductReview = async (req, res) => {
    try {
        const { rating, title, comment } = req.body;
        const productId = Number(req.params.id);

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required' });
        }

        const product = await Product.findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (!file.mimetype.startsWith('image/')) {
                    return res.status(400).json({ message: 'Only image files are allowed!' });
                }
                const url = await uploadToCloudinary(file.buffer);
                imageUrls.push(url);
            }
        }

        const review = {
            userId: req.user._id,
            userName: req.user.name,
            rating: Number(rating),
            title: title || '',
            comment: comment,
            images: imageUrls
        };

        product.reviews = product.reviews || [];
        product.reviews.push(review);

        await product.save();

        res.status(201).json({ message: 'Review added successfully', reviews: product.reviews });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const deleteProductReview = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const reviewId = req.params.reviewId;

        const product = await Product.findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const reviewIndex = product.reviews.findIndex(
            (r) => r._id.toString() === reviewId
        );

        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership
        if (product.reviews[reviewIndex].userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this review' });
        }

        const review = product.reviews[reviewIndex];
        // Delete all images associated with this review from Cloudinary
        if (review.images && review.images.length > 0) {
            for (const imgUrl of review.images) {
                await deleteFromCloudinary(imgUrl);
            }
        }

        product.reviews.splice(reviewIndex, 1);
        await product.save();

        res.status(200).json({ message: 'Review deleted successfully', reviews: product.reviews });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const markReviewHelpful = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const reviewId = req.params.reviewId;
        const userId = req.user._id;

        const product = await Product.findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = product.reviews.find((r) => r._id.toString() === reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.helpful = review.helpful || [];
        const userIndex = review.helpful.indexOf(userId);

        if (userIndex > -1) {
            review.helpful.splice(userIndex, 1);
        } else {
            review.helpful.push(userId);
        }

        await product.save();
        res.status(200).json({ message: 'Review helpful status updated', reviews: product.reviews });
    } catch (error) {
        console.error('Mark review helpful error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


