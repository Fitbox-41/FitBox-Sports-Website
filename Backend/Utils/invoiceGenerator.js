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
    // Placed amount below the black line under TOTAL DUE
    firstPage.drawText(`Rs. ${order.totalAmount}`, { x: 460, y: 645, size: 14, font: fontBold, color });
    
    // Adjusted No and Date to match the new higher template placement
    firstPage.drawText(`${order._id.toString().substring(0, 8).toUpperCase()}`, { x: 500, y: 610, size: 10, font: fontBold, color });
    firstPage.drawText(`${new Date().toLocaleDateString()}`, { x: 500, y: 590, size: 10, font: fontBold, color });

    // === INVOICE TO SECTION ===
    firstPage.drawText(customerName, { x: 145, y: 648, size: 10, font: fontBold, color });
    firstPage.drawText(customerPhone, { x: 145, y: 631, size: 10, font: fontBold, color });
    firstPage.drawText(customerEmail, { x: 145, y: 614, size: 10, font: fontBold, color });
    firstPage.drawText(addressString, { x: 145, y: 597, size: 10, font: fontBold, color });
    firstPage.drawText(addressString2, { x: 145, y: 582, size: 10, font: fontBold, color });

    // Calculate dynamic row heights based on item count
    const numItems = order.items?.length || 0;
    // The table is taller now (spans down to y=250)
    const rowHeight = numItems > 7 ? 270 / numItems : 35;

    // Draw Items
    if (order.items && order.items.length > 0) {
      const fontSize = numItems > 7 ? Math.max(7, 10 - (numItems - 7) * 0.5) : 10;
      let currentY = 500; // Start printing from y=500
      
      order.items.forEach((item) => {
        const numericPrice = Number(String(item.price).replace(/[^0-9.-]+/g,""));
        const itemTotal = numericPrice * (item.quantity || 1);
        const variantText = item.selectedVariant ? ` (${item.selectedVariant})` : '';
        const sizeText = item.selectedSize ? ` - ${item.selectedSize}` : '';
        
        // Truncate name to 25 chars to avoid crossing the vertical line
        firstPage.drawText(`${item.name}${variantText}${sizeText}`.substring(0, 25), { x: 55, y: currentY, size: fontSize, font: fontBold, color });
        // Shifted X coordinates to match the new wider column structure
        firstPage.drawText(`${item.quantity || 1}`, { x: 330, y: currentY, size: fontSize, font: fontBold, color });
        firstPage.drawText(`Rs. ${numericPrice}`, { x: 400, y: currentY, size: fontSize, font: fontBold, color });
        firstPage.drawText(`Rs. ${itemTotal}`, { x: 480, y: currentY, size: fontSize, font: fontBold, color });
        
        currentY -= rowHeight;
      });
    }

    // === BOTTOM SECTION ===
    const subtotal = order.totalAmount;
    const tax = 0;
    // Shifted bottom section down by ~90px to match new template
    firstPage.drawText(`Rs. ${subtotal}`, { x: 480, y: 235, size: 10, font: fontBold, color });
    firstPage.drawText(`Rs. ${tax}`, { x: 480, y: 205, size: 10, font: fontBold, color });
    firstPage.drawText(`Rs. ${subtotal + tax}`, { x: 480, y: 175, size: 12, font: fontBold, color });

    // Payment Method
    firstPage.drawText(`Online Payment`, { x: 155, y: 205, size: 10, font: fontBold, color });
    firstPage.drawText(`N/A`, { x: 155, y: 175, size: 10, font: fontBold, color });

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
