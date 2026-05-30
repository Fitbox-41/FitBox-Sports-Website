import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const generateInvoice = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const invoiceName = `Invoice-${order._id}.pdf`;
      const invoiceDir = path.join(process.cwd(), 'public', 'invoices');
      const invoicePath = path.join(invoiceDir, invoiceName);
      
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(invoicePath);
      doc.pipe(writeStream);

      doc.fontSize(20).text('FitBox Sports - Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Order ID: ${order._id}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Payment Status: ${order.paymentStatus}`);
      doc.moveDown();
      doc.text(`Total Amount: Rs. ${order.totalAmount}`);
      
      doc.end();
      
      writeStream.on('finish', async () => {
        try {
          if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
             // If Cloudinary is not configured yet, fallback to local URL
             console.log("Cloudinary not configured, returning local PDF URL.");
             return resolve({ invoiceNumber: `INV-${order._id}`, invoiceUrl: `/invoices/${invoiceName}` });
          }

          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(invoicePath, {
            resource_type: "image", // Cloudinary handles PDFs under 'image' resource type to bypass strict raw delivery blocks
            folder: "fitbox_invoices",
            public_id: `Invoice-${order._id}` // Auto appends .pdf when uploaded as image type
          });
          
          // Optionally delete the local file after successful upload
          // fs.unlinkSync(invoicePath);
          
          resolve({ invoiceNumber: `INV-${order._id}`, invoiceUrl: result.secure_url });
        } catch (uploadError) {
          console.error("Cloudinary upload failed:", uploadError);
          // Fallback to local file if upload fails
          resolve({ invoiceNumber: `INV-${order._id}`, invoiceUrl: `/invoices/${invoiceName}` });
        }
      });

      writeStream.on('error', (err) => {
         reject(err);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};
