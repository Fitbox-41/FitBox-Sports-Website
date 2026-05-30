import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import User from '../Models/User.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const generateInvoice = async (order) => {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'invoice.pdf');
    
    // Load the existing PDF template
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Invoice template not found at ${templatePath}`);
    }
    const existingPdfBytes = fs.readFileSync(templatePath);
    
    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Embed the fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const color = rgb(0, 0, 0); 
    
    // Fetch User Details
    const user = await User.findById(order.userId);
    const customerName = order.shippingAddress?.name || user?.name || 'Customer Name';
    const customerPhone = order.shippingAddress?.phone || user?.phone || 'N/A';
    const customerEmail = user?.email || 'N/A';
    const addr = order.shippingAddress || {};
    const addressString = `${addr.street || ''}, ${addr.city || ''}`;
    const addressString2 = `${addr.state || ''} ${addr.zip || ''}, ${addr.country || 'India'}`;

    // === TOP SECTION ===
    // Total Due on top
    firstPage.drawText(`Rs. ${order.totalAmount}`, { x: 480, y: 675, size: 16, font: fontBold, color });
    // Order No and Date
    firstPage.drawText(`${order._id.toString().substring(0, 8).toUpperCase()}`, { x: 450, y: 620, size: 10, font, color });
    firstPage.drawText(`${new Date().toLocaleDateString()}`, { x: 450, y: 602, size: 10, font, color });

    // === INVOICE TO SECTION ===
    firstPage.drawText(customerName, { x: 145, y: 668, size: 10, font, color });
    firstPage.drawText(customerPhone, { x: 145, y: 651, size: 10, font, color });
    firstPage.drawText(customerEmail, { x: 145, y: 634, size: 10, font, color });
    firstPage.drawText(addressString, { x: 145, y: 617, size: 10, font, color });
    firstPage.drawText(addressString2, { x: 145, y: 605, size: 10, font, color });

    // === TABLE SECTION ===
    let currentY = 500;
    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        const itemTotal = item.price * (item.quantity || 1);
        const variantText = item.selectedVariant ? ` (${item.selectedVariant})` : '';
        const sizeText = item.selectedSize ? ` - ${item.selectedSize}` : '';
        
        // Products
        firstPage.drawText(`${item.name}${variantText}${sizeText}`.substring(0, 35), { x: 100, y: currentY, size: 10, font: fontBold, color });
        // Qty
        firstPage.drawText(`${item.quantity || 1}`, { x: 330, y: currentY, size: 10, font, color });
        // Price
        firstPage.drawText(`Rs. ${item.price}`, { x: 400, y: currentY, size: 10, font, color });
        // Total
        firstPage.drawText(`Rs. ${itemTotal}`, { x: 480, y: currentY, size: 10, font, color });
        
        currentY -= 32; // Move down for next row
      });
    }

    // === BOTTOM SECTION ===
    // Sub-total, Tax, Total
    const subtotal = order.totalAmount;
    const tax = 0; // Assuming tax is inclusive or 0 for now
    firstPage.drawText(`Rs. ${subtotal}`, { x: 480, y: 285, size: 10, font, color });
    firstPage.drawText(`Rs. ${tax}`, { x: 480, y: 258, size: 10, font, color });
    firstPage.drawText(`Rs. ${subtotal + tax}`, { x: 480, y: 230, size: 12, font: fontBold, color });

    // Payment Method
    firstPage.drawText(`GoKwik / Online Payment`, { x: 180, y: 275, size: 10, font, color });
    firstPage.drawText(`N/A`, { x: 180, y: 258, size: 10, font, color });

    // Serialize to bytes
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    // Upload directly to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image", 
          folder: "fitbox_invoices",
          public_id: `Invoice-${order._id}`
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload failed:", error);
            return reject(error);
          }
          resolve({ invoiceNumber: `INV-${order._id}`, invoiceUrl: result.secure_url });
        }
      );
      uploadStream.end(buffer);
    });

  } catch (error) {
    console.error("Invoice generation failed:", error);
    throw error;
  }
};
