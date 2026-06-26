import path from 'path';
import fs from 'fs';
import multer from 'multer';

const adminPublicDir = path.join(process.cwd(), 'admin', 'public');
if (!fs.existsSync(adminPublicDir)) {
  fs.mkdirSync(adminPublicDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, adminPublicDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP, and GIF files are allowed.'));
    }
  }
});

export const uploadProductImage = [
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/admin/public/${req.file.filename}`;
    res.status(200).json({
      success: true,
      fileName: req.file.filename,
      url: fileUrl,
    });
  }
];
