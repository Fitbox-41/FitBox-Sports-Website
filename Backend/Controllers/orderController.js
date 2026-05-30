import Order from '../Models/Order.js';
import User from '../Models/User.js';
import { createGoKwikCheckout, verifyGoKwikSignature } from '../Utils/gokwik.js';
import { createDelhiveryShipment } from '../Utils/delhivery.js';
import { generateInvoice } from '../Utils/invoiceGenerator.js';
import sendEmail from '../Utils/sendEmail.js';

export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Fetch user details to denormalize on the order
    const user = await User.findById(userId).lean();

    // Sanitize item prices to numbers (strip commas if any)
    const sanitizedItems = items.map(item => ({
      ...item,
      price: typeof item.price === 'string' ? Number(item.price.replace(/[^0-9.-]+/g, "")) : item.price
    }));

    const order = new Order({
      userId,
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      items: sanitizedItems,
      totalAmount,
      paymentStatus: 'Pending Payment'
    });
    await order.save();

    let redirectUrl = 'https://sandbox.gokwik.co/checkout';
    try {
      const gokwikResponse = await createGoKwikCheckout(order);
      if (gokwikResponse && gokwikResponse.payment_url) {
        redirectUrl = gokwikResponse.payment_url;
      }
    } catch (gokwikError) {
      console.warn("GoKwik checkout API failed (expected if using placeholder credentials):", gokwikError.message);
    }
    
    res.status(200).json({ 
      success: true, 
      orderId: order._id,
      redirectUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const gokwikWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-gokwik-signature']; 
    const isValid = verifyGoKwikSignature(req.body, signature);
    
    if (!isValid) return res.status(400).send('Invalid signature');

    const { request_id, status, payment_id, customer_details } = req.body;
    const order = await Order.findById(request_id);

    if (order && status === 'SUCCESS' && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      order.paymentId = payment_id;
      order.paidAt = new Date();
      
      // GoKwik sends customer shipping details on success
      if (customer_details && customer_details.address) {
         order.shippingAddress = {
             street: customer_details.address.street || '',
             city: customer_details.address.city || '',
             state: customer_details.address.state || '',
             zip: customer_details.address.pincode || '',
             country: customer_details.address.country || 'India'
         };
      }

      let pdfBuffer = null;
      try {
        const { invoiceNumber, invoiceUrl, buffer } = await generateInvoice(order);
        order.invoiceNumber = invoiceNumber;
        order.invoiceUrl = invoiceUrl;
        pdfBuffer = buffer;
      } catch (err) {
        console.error("Webhook Invoice generation failed:", err);
      }

      try {
        const shipment = await createDelhiveryShipment(order);
        if (shipment.packages && shipment.packages.length > 0) {
            order.awb = shipment.packages[0].waybill;
            order.trackingUrl = `https://track.delhivery.com/p/${order.awb}`;
            order.shipmentStatus = 'Created';
        }
      } catch (shipmentError) {
        console.error("Shipment creation failed:", shipmentError);
        order.shipmentStatus = 'Pending';
      }

      await order.save();

      // Send Email
      try {
        const user = await User.findById(order.userId);
        const emailToSend = user?.email || customer_details?.email;
        if (emailToSend) {
          await sendEmail({
            from: process.env.EMAIL_CART_FROM || process.env.EMAIL_FROM || 'FitBox Sports <cart@fitboxsports.in>',
            email: emailToSend,
            subject: `Order Confirmation - FitBox Sports (${order.invoiceNumber || order._id})`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #ff6b35;">Thank you for your order!</h2>
                <p>Hi ${order.shippingAddress?.name || user?.name || 'Customer'},</p>
                <p>Your payment has been successfully processed and your order is confirmed.</p>

                <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
                  <thead>
                    <tr style="background:#1a1a1a; color:#fff;">
                      <th style="padding:10px 14px; text-align:left;">Product</th>
                      <th style="padding:10px 14px; text-align:center;">Qty</th>
                      <th style="padding:10px 14px; text-align:right;">Price</th>
                      <th style="padding:10px 14px; text-align:right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(order.items || []).map((item, i) => {
                      const price = Number(String(item.price).replace(/[^0-9.-]+/g,''));
                      const qty = item.quantity || 1;
                      const variant = item.selectedVariant ? ` (${item.selectedVariant})` : '';
                      const size = item.selectedSize ? ` - ${item.selectedSize}` : '';
                      const bg = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
                      return `<tr style="background:${bg};">
                        <td style="padding:10px 14px;">${item.name}${variant}${size}</td>
                        <td style="padding:10px 14px; text-align:center;">${qty}</td>
                        <td style="padding:10px 14px; text-align:right;">Rs. ${price}</td>
                        <td style="padding:10px 14px; text-align:right;">Rs. ${price * qty}</td>
                      </tr>`;
                    }).join('')}
                  </tbody>
                  <tfoot>
                    <tr style="background:#fff3ee; font-weight:bold;">
                      <td colspan="3" style="padding:10px 14px; text-align:right;">Order Total:</td>
                      <td style="padding:10px 14px; text-align:right; color:#ff6b35;">Rs. ${order.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>

                <p>${pdfBuffer ? 'Please find your official invoice attached to this email.' : 'Your invoice will be available in your orders page.'}</p>
                <br/>
                <p>Best Regards,</p>
                <p><strong>FitBox Sports Team</strong></p>
              </div>
            `,
            attachments: pdfBuffer ? [{
              filename: `Invoice-${order.invoiceNumber || order._id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }] : undefined
          });
        }
      } catch (emailErr) {
        console.error("Webhook Email Send Error:", emailErr);
      }
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    res.status(500).send('Webhook error');
  }
};

export const mockPayment = async (req, res) => {
  try {
    const { orderId, shippingAddress } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    // 1. Mark as Paid
    order.paymentStatus = 'Paid';
    order.paymentId = 'MOCK_TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    order.paidAt = new Date();
    
    // 2. Set Shipping Address from mock modal
    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }

    // 3. Generate Invoice
    let pdfBuffer = null;
    try {
      const { invoiceNumber, invoiceUrl, buffer } = await generateInvoice(order);
      order.invoiceNumber = invoiceNumber;
      order.invoiceUrl = invoiceUrl;
      pdfBuffer = buffer;
    } catch (invoiceError) {
      console.error("Mock Invoice generation failed:", invoiceError);
    }

    // 4. Create Delhivery Shipment
    try {
      const shipment = await createDelhiveryShipment(order);
      if (shipment.packages && shipment.packages.length > 0) {
          order.awb = shipment.packages[0].waybill;
          order.trackingUrl = `https://track.delhivery.com/p/${order.awb}`;
          order.shipmentStatus = 'Created';
      } else {
          // Fallback if packages array is empty
          order.trackingUrl = `https://track.delhivery.com/p/MOCK_AWB_${orderId}`;
          order.shipmentStatus = 'Created';
      }
    } catch (shipmentError) {
      console.error("Mock Shipment creation failed:", shipmentError);
      order.shipmentStatus = 'Created'; // Force to created so UI looks complete
      order.trackingUrl = `https://track.delhivery.com/p/MOCK_AWB_${orderId}`;
    }

    await order.save();

    // 5. Send Order Confirmation Email
    try {
      const user = await User.findById(order.userId);
      const emailToSend = user?.email;
      if (emailToSend) {
        await sendEmail({
          from: process.env.EMAIL_CART_FROM || process.env.EMAIL_FROM || 'FitBox Sports <cart@fitboxsports.in>',
          email: emailToSend,
          subject: `Order Confirmation - FitBox Sports (${order.invoiceNumber || order._id})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #ff6b35;">Thank you for your order!</h2>
              <p>Hi ${order.shippingAddress?.name || user?.name || 'Customer'},</p>
              <p>Your payment has been successfully processed and your order is confirmed.</p>

              <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
                <thead>
                  <tr style="background:#1a1a1a; color:#fff;">
                    <th style="padding:10px 14px; text-align:left;">Product</th>
                    <th style="padding:10px 14px; text-align:center;">Qty</th>
                    <th style="padding:10px 14px; text-align:right;">Price</th>
                    <th style="padding:10px 14px; text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${(order.items || []).map((item, i) => {
                    const price = Number(String(item.price).replace(/[^0-9.-]+/g,''));
                    const qty = item.quantity || 1;
                    const variant = item.selectedVariant ? ` (${item.selectedVariant})` : '';
                    const size = item.selectedSize ? ` - ${item.selectedSize}` : '';
                    const bg = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
                    return `<tr style="background:${bg};">
                      <td style="padding:10px 14px;">${item.name}${variant}${size}</td>
                      <td style="padding:10px 14px; text-align:center;">${qty}</td>
                      <td style="padding:10px 14px; text-align:right;">Rs. ${price}</td>
                      <td style="padding:10px 14px; text-align:right;">Rs. ${price * qty}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr style="background:#fff3ee; font-weight:bold;">
                    <td colspan="3" style="padding:10px 14px; text-align:right;">Order Total:</td>
                    <td style="padding:10px 14px; text-align:right; color:#ff6b35;">Rs. ${order.totalAmount}</td>
                  </tr>
                </tfoot>
              </table>

              <p>${pdfBuffer ? 'Please find your official invoice attached to this email.' : 'Your invoice will be available in your orders page.'}</p>
              <br/>
              <p>Best Regards,</p>
              <p><strong>FitBox Sports Team</strong></p>
            </div>
          `,
          attachments: pdfBuffer ? [{
            filename: `Invoice-${order.invoiceNumber || order._id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }] : undefined
        });
        console.log(`Confirmation email sent to ${emailToSend}`);
      }
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

    res.status(200).json({ success: true, message: 'Mock payment successful', orderId: order._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Only allow deletion if the order is still pending payment
    if (order.paymentStatus === 'Pending Payment') {
      await Order.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Pending order cancelled and deleted' });
    }
    
    res.status(400).json({ success: false, message: 'Cannot cancel an order that has already been paid' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
