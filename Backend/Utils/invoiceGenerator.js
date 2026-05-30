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
    // Placed amount below the black line under TOTAL DUE, centered
    firstPage.drawText(`Rs. ${order.totalAmount}`, { x: 475, y: 650, size: 14, font: fontBold, color });
    
    // Adjusted No and Date to perfectly align horizontally with labels
    firstPage.drawText(`${order._id.toString().substring(0, 8).toUpperCase()}`, { x: 500, y: 608, size: 10, font: fontBold, color });
    firstPage.drawText(`${new Date().toLocaleDateString()}`, { x: 500, y: 588, size: 10, font: fontBold, color });

    // === INVOICE TO SECTION ===
    firstPage.drawText(customerName,    { x: 120, y: 648, size: 10, font: fontBold, color });
    firstPage.drawText(customerPhone,   { x: 120, y: 631, size: 10, font: fontBold, color });
    firstPage.drawText(customerEmail,   { x: 120, y: 614, size: 10, font: fontBold, color });
    firstPage.drawText(addressString,   { x: 120, y: 597, size: 10, font: fontBold, color });
    firstPage.drawText(addressString2,  { x: 120, y: 582, size: 10, font: fontBold, color });

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
        
        const productLabel = `${item.name}${variantText}${sizeText}`.substring(0, 25);
        const qtyLabel = `${item.quantity || 1}`;
        const priceLabel = `Rs. ${numericPrice}`;
        const totalLabel = `Rs. ${itemTotal}`;

        // RIGHT-align product name inside Products column (right edge ~x:305)
        const nameWidth = fontBold.widthOfTextAtSize(productLabel, fontSize);
        const nameX = Math.max(55, 305 - nameWidth);
        firstPage.drawText(productLabel, { x: nameX, y: currentY, size: fontSize, font: fontBold, color });

        // LEFT-align QTY, PRICE, TOTAL from the start of each column
        firstPage.drawText(qtyLabel,   { x: 318, y: currentY, size: fontSize, font: fontBold, color });
        firstPage.drawText(priceLabel, { x: 400, y: currentY, size: fontSize, font: fontBold, color });
        firstPage.drawText(totalLabel, { x: 478, y: currentY, size: fontSize, font: fontBold, color });
        
        currentY -= rowHeight;
      });
    }

    // === BOTTOM SECTION ===
    const subtotal = order.totalAmount;
    const tax = 0;

    // Right column values (Sub-total, Tax, Total) — aligned with right-side box
    firstPage.drawText(`Rs. ${subtotal}`,     { x: 510, y: 248, size: 10, font: fontBold, color });
    firstPage.drawText(`Rs. ${tax}`,          { x: 510, y: 222, size: 10, font: fontBold, color });
    firstPage.drawText(`Rs. ${subtotal + tax}`, { x: 510, y: 193, size: 10, font: fontBold, color });

    // Payment Method — values inline with their labels (Bank Name / Bank Account rows)
    firstPage.drawText(`Online Payment`, { x: 155, y: 222, size: 10, font: fontBold, color });
    firstPage.drawText(`N/A`,            { x: 155, y: 193, size: 10, font: fontBold, color });

    // Serialize to bytes
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    // Upload directly to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image", // using image format to serve pdf directly if desired or raw
          folder: "fitbox_invoices",
          public_id: `Invoice-${order._id}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve({ 
              invoiceNumber: `INV-${order._id}`, 
              invoiceUrl: result.secure_url,
              buffer: buffer 
            });
          }
        }
      );uploadStream.end(buffer);
    });

  } catch (error) {
    console.error("Invoice generation failed:", error);
    throw error;
  }
};
