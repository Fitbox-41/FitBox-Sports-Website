import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import User from '../Models/User.js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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
    const templatePath = path.join(__dirname, '..', 'public', 'invoice-template.html');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Invoice HTML template not found at ${templatePath}`);
    }
    
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Fetch User Details
    const user = await User.findById(order.userId);
    const customerName = order.customerName || order.shippingAddress?.name || user?.name || 'Customer Name';
    const customerPhone = order.customerPhone || order.shippingAddress?.phone || user?.phone || 'N/A';
    const customerEmail = order.customerEmail || user?.email || 'N/A';
    const addr = order.shippingAddress || {};
    const addressString1 = `${addr.street || ''}, ${addr.city || ''}`;
    const addressString2 = `${addr.state || ''} ${addr.zip || ''}, ${addr.country || 'India'}`;

    // Build Table Rows
    let itemsTableHTML = '';
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const numericPrice = Number(String(item.price).replace(/[^0-9.-]+/g,""));
        const itemTotal = numericPrice * (item.quantity || 1);
        const variantText = item.selectedVariant ? ` (${item.selectedVariant})` : '';
        const sizeText = item.selectedSize ? ` - ${item.selectedSize}` : '';
        const productLabel = `${item.name}${variantText}${sizeText}`;
        
        itemsTableHTML += `
          <tr>
            <td>${productLabel}</td>
            <td class="center">${item.quantity || 1}</td>
            <td class="right">Rs. ${numericPrice}</td>
            <td class="right">Rs. ${itemTotal}</td>
          </tr>
        `;
      });
    }

    // Replace Placeholders — use replaceAll so duplicates are caught
    htmlContent = htmlContent
                             .replaceAll('{{CUSTOMER_NAME}}', customerName)
                             .replaceAll('{{CUSTOMER_PHONE}}', customerPhone)
                             .replaceAll('{{CUSTOMER_EMAIL}}', customerEmail)
                             .replaceAll('{{CUSTOMER_ADDRESS1}}', addressString1)
                             .replaceAll('{{CUSTOMER_ADDRESS2}}', addressString2)
                             .replaceAll('{{ORDER_ID}}', String(order._id).substring(0, 8).toUpperCase())
                             .replaceAll('{{ORDER_DATE}}', new Date(order.createdAt || Date.now()).toLocaleDateString())
                             .replaceAll('{{ORDER_SUBTOTAL}}', order.totalAmount)
                             .replaceAll('{{ORDER_TAX}}', 0)
                             .replaceAll('{{ORDER_TOTAL}}', order.totalAmount)
                             .replaceAll('{{ORDER_GRAND_TOTAL}}', order.totalAmount)
                             .replaceAll('{{ITEMS_TABLE}}', itemsTableHTML);

    // On Linux (Vercel), use the sparticuz compressed Chromium.
    // On Windows (local dev), use the installed Chrome directly.
    const isLinux = process.platform === 'linux';
    const executablePath = isLinux
      ? await chromium.executablePath()
      : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    const browser = await puppeteer.launch({
      args: isLinux ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1200, height: 800 },
      executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    // Load HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Convert to PDF Buffer
    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();
    const buffer = Buffer.from(pdfBytes);

    // Upload to Cloudinary (use resource_type: image for native browser PDF preview)
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "fitbox_invoices",
          public_id: `fitbox_invoices/FBX-${order._id.toString().slice(-8).toUpperCase()}`,
          format: "pdf"
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve({ 
              invoiceNumber: `FBX-${order._id.toString().slice(-8).toUpperCase()}`, 
              invoiceUrl: result.secure_url,
              buffer: buffer 
            });
          }
        }
      );
      uploadStream.end(buffer);
    });

  } catch (error) {
    console.error("HTML to PDF generation failed:", error);
    throw error;
  }
};
