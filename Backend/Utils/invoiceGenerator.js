import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import User from '../Models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const generateInvoice = async (order) => {
  try {
    const numItems = order.items?.length || 0;
    const templateName = numItems > 10 ? 'invoice-2pages.pdf' : 'invoice.pdf';
    const templatePath = path.join(__dirname, '..', 'public', templateName);
    
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
    const secondPage = pages.length > 1 ? pages[1] : null;
    const bottomPage = secondPage || firstPage;
    const color = rgb(0, 0, 0); 
    
    // Fetch User Details
    const user = await User.findById(order.userId);
    const customerName = order.customerName || order.shippingAddress?.name || user?.name || 'Customer Name';
    const customerPhone = order.customerPhone || order.shippingAddress?.phone || user?.phone || 'N/A';
    const customerEmail = order.customerEmail || user?.email || 'N/A';
    const addr = order.shippingAddress || {};
    const addressString = `${addr.street || ''}, ${addr.city || ''}`;
    const addressString2 = `${addr.state || ''} ${addr.zip || ''}, ${addr.country || 'India'}`;

    // === TOP SECTION === (Always on page 1)
    firstPage.drawText(`Rs. ${order.totalAmount}`, { x: 475, y: 650, size: 14, font: fontBold, color });
    firstPage.drawText(String(order._id).substring(0, 8).toUpperCase(), { x: 500, y: 608, size: 10, font: fontBold, color });
    firstPage.drawText(new Date().toLocaleDateString(), { x: 500, y: 588, size: 10, font: fontBold, color });

    // === INVOICE TO SECTION === (Always on page 1)
    firstPage.drawText(String(customerName),    { x: 120, y: 648, size: 10, font: fontBold, color });
    firstPage.drawText(String(customerPhone),   { x: 120, y: 631, size: 10, font: fontBold, color });
    firstPage.drawText(String(customerEmail),   { x: 120, y: 614, size: 10, font: fontBold, color });
    firstPage.drawText(String(addressString),   { x: 120, y: 597, size: 10, font: fontBold, color });
    firstPage.drawText(String(addressString2),  { x: 120, y: 582, size: 10, font: fontBold, color });

    // Draw Items
    if (order.items && numItems > 0) {
      let currentY = 500; // Start printing from y=500 on page 1
      let currentPage = firstPage;
      const maxItemsPage1 = 15; // Page 1 of 2pages can hold around 15 comfortably
      
      order.items.forEach((item, index) => {
        // Switch to second page if necessary
        if (numItems > 10 && index === maxItemsPage1 && secondPage) {
           currentPage = secondPage;
           currentY = 680; // Table headers are higher up on page 2
        }

        // Calculate dynamic row heights if there are too many items to fit
        let fontSize = 10;
        let rowHeight = 25;
        if (currentPage === firstPage && numItems > 10 === false) {
           rowHeight = numItems > 8 ? 240 / numItems : 28;
           fontSize = numItems > 8 ? Math.max(7, 10 - (numItems - 8) * 0.4) : 10;
        } else if (currentPage === secondPage) {
           const itemsOnPage2 = numItems - maxItemsPage1;
           rowHeight = itemsOnPage2 > 15 ? 400 / itemsOnPage2 : 25;
           fontSize = itemsOnPage2 > 15 ? Math.max(7, 10 - (itemsOnPage2 - 15) * 0.4) : 10;
        }

        const numericPrice = Number(String(item.price).replace(/[^0-9.-]+/g,""));
        const itemTotal = numericPrice * (item.quantity || 1);
        const variantText = item.selectedVariant ? ` (${item.selectedVariant})` : '';
        const sizeText = item.selectedSize ? ` - ${item.selectedSize}` : '';
        
        const productLabel = `${item.name}${variantText}${sizeText}`.substring(0, 30);
        const qtyLabel = `${item.quantity || 1}`;
        const priceLabel = `Rs. ${numericPrice}`;
        const totalLabel = `Rs. ${itemTotal}`;

        currentPage.drawText(productLabel, { x: 110, y: currentY, size: fontSize, font: fontBold, color });
        currentPage.drawText(qtyLabel,     { x: 345, y: currentY, size: fontSize, font: fontBold, color });
        currentPage.drawText(priceLabel,   { x: 415, y: currentY, size: fontSize, font: fontBold, color });
        currentPage.drawText(totalLabel,   { x: 490, y: currentY, size: fontSize, font: fontBold, color });
        
        currentY -= rowHeight;
      });
    }

    // === BOTTOM SECTION === (Always on the last page)
    const subtotal = order.totalAmount;
    const tax = 0;

    bottomPage.drawText(`Rs. ${subtotal}`,       { x: 510, y: 248, size: 10, font: fontBold, color });
    bottomPage.drawText(`Rs. ${tax}`,            { x: 510, y: 222, size: 10, font: fontBold, color });
    bottomPage.drawText(`Rs. ${subtotal + tax}`, { x: 510, y: 193, size: 10, font: fontBold, color });

    bottomPage.drawText(`Online Payment`, { x: 155, y: 222, size: 10, font: fontBold, color });
    bottomPage.drawText(`N/A`,            { x: 155, y: 193, size: 10, font: fontBold, color });

    // Serialize to bytes
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    // Upload directly to Cloudinary (use resource_type: image for native browser PDF preview)
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "fitbox_invoices",
          public_id: `Invoice-${order._id}`,
          format: "pdf"
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
