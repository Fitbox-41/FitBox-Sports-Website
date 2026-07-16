import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file buffer directly to Cloudinary.
 * @param {Buffer} fileBuffer - The binary file buffer from multer memoryStorage.
 * @param {string} folder - Target folder on Cloudinary.
 * @returns {Promise<string>} - Resolves with the secure upload URL.
 */
export const uploadToCloudinary = (fileBuffer, folder = 'product_reviews') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image', // Ensures only image types are processed
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary helper upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Extracts the public ID from a Cloudinary URL.
 * @param {string} url - Cloudinary image secure/insecure URL.
 * @returns {string|null} - Public ID of the asset.
 */
const getPublicIdFromUrl = (url) => {
  try {
    if (!url || typeof url !== 'string') return null;
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    
    const pathParts = parts[1].split('/');
    // Remove Cloudinary version component if present (e.g. "v1234567")
    if (pathParts[0].match(/^v\d+$/)) {
      pathParts.shift();
    }
    
    const pathWithExtension = pathParts.join('/');
    const dotIndex = pathWithExtension.lastIndexOf('.');
    if (dotIndex === -1) return pathWithExtension;
    return pathWithExtension.substring(0, dotIndex);
  } catch (e) {
    console.error('Error parsing Cloudinary URL:', e);
    return null;
  }
};

/**
 * Deletes an asset from Cloudinary using its URL.
 * @param {string} url - Cloudinary URL.
 * @returns {Promise<any>} - Resolves with Cloudinary API response.
 */
export const deleteFromCloudinary = async (url) => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted from Cloudinary: ${publicId}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${publicId}`, error);
  }
};

