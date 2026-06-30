import Order from '../Models/Order.js';
import User from '../Models/User.js';
import { createGoKwikCheckout, verifyGoKwikSignature } from '../Utils/gokwik.js';
import { createDelhiveryShipment } from '../Utils/delhivery.js';
import { generateInvoice } from '../Utils/invoiceGenerator.js';
import sendEmail from '../Utils/sendEmail.js';
import crypto from 'crypto';
import axios from 'axios';

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
              const price = Number(String(item.price).replace(/[^0-9.-]+/g, ''));
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
    order.paymentMode = 'Online';
    order.orderStatus = 'Completed';
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
            const price = Number(String(item.price).replace(/[^0-9.-]+/g, ''));
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

// Helper: Get PhonePe V2 OAuth access token
const getPhonePeToken = async () => {
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1';
  const env = process.env.PHONEPE_ENV || 'UAT';

  const tokenUrl = env === 'PROD'
    ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_version', clientVersion);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  const tokenRes = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return tokenRes.data.access_token;
};

export const phonePeInitiate = async (req, res) => {
  try {
    const { orderId, shippingAddress } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus === 'Paid') return res.status(400).json({ success: false, message: 'Order already paid' });

    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
      await order.save();
    }

    const clientId = process.env.PHONEPE_CLIENT_ID;
    const env = process.env.PHONEPE_ENV || 'UAT';
    if (!clientId) return res.status(500).json({ success: false, message: 'PhonePe credentials not configured' });

    // Alphanumeric transaction ID, max 38 chars
    const merchantOrderId = 'TXN' + order._id.toString().replace(/[^a-zA-Z0-9]/g, '');

    // 1. Get OAuth access token
    let accessToken;
    try {
      accessToken = await getPhonePeToken();
    } catch (tokenErr) {
      const errData = tokenErr.response?.data;
      console.error('PhonePe Token Error:', tokenErr.response?.status, JSON.stringify(errData));
      return res.status(502).json({ success: false, message: errData?.message || errData?.error || 'Failed to authenticate with PhonePe', details: errData });
    }

    // 2. Initiate Pay Page
    const payUrl = env === 'PROD'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

    const redirectUrlEndpoint = `${process.env.API_URL || 'http://localhost:5000'}/api/orders/phonepe/redirect`;

    const payBody = {
      merchantOrderId,
      amount: Math.round(order.totalAmount * 100), // paise
      expireAfter: 1200, // 20 minutes
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: 'FitBox Sports Order Payment',
        merchantUrls: {
          redirectUrl: redirectUrlEndpoint
        }
      }
    };

    let payResponse;
    try {
      payResponse = await axios.post(payUrl, payBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`
        }
      });
    } catch (payErr) {
      const errData = payErr.response?.data;
      console.error('PhonePe Pay Error:', payErr.response?.status, JSON.stringify(errData));
      return res.status(502).json({ success: false, message: errData?.message || errData?.code || 'PhonePe payment initiation failed', details: errData });
    }

    const redirectUrl = payResponse.data?.redirectUrl;
    if (redirectUrl) {
      order.paymentId = merchantOrderId;
      await order.save();
      return res.status(200).json({ success: true, redirectUrl });
    } else {
      console.error('PhonePe no redirectUrl:', JSON.stringify(payResponse.data));
      return res.status(400).json({ success: false, message: 'Payment initiation failed — no redirect URL', data: payResponse.data });
    }

  } catch (error) {
    console.error('PhonePe Initiate Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const phonePeRedirect = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  let redirectPath = '/orders';
  let paymentResult = 'unknown';

  try {
    // PhonePe sends: transactionId (merchantOrderId), code (PAYMENT_SUCCESS / PAYMENT_ERROR / PAYMENT_PENDING)
    const merchantOrderId = req.body.transactionId || req.query.transactionId
      || req.body.merchantOrderId || req.query.merchantOrderId;
    const code = req.body.code || req.query.code || '';

    console.log('PhonePe Redirect received:', { merchantOrderId, code, body: req.body, query: req.query });

    if (!merchantOrderId) {
      console.error('PhonePe Redirect: No merchantOrderId received');
      return res.redirect(`${frontendUrl}/orders?payment=error&reason=missing_id`);
    }

    const order = await Order.findOne({ paymentId: merchantOrderId });

    if (!order) {
      console.error('PhonePe Redirect: Order not found for', merchantOrderId);
      return res.redirect(`${frontendUrl}/orders?payment=error&reason=order_not_found`);
    }

    // Idempotency: if already processed, just redirect appropriately
    if (order.paymentStatus === 'Paid') {
      return res.redirect(`${frontendUrl}/orders?payment=success&orderId=${order._id}`);
    }

    if (code === 'PAYMENT_SUCCESS') {
      paymentResult = 'success';
      order.paymentStatus = 'Paid';
      order.paymentMode = 'Online';
      order.orderStatus = 'Completed';
      order.paidAt = new Date();

      let pdfBuffer = null;
      try {
        const { invoiceNumber, invoiceUrl, buffer } = await generateInvoice(order);
        order.invoiceNumber = invoiceNumber;
        order.invoiceUrl = invoiceUrl;
        pdfBuffer = buffer;
      } catch (err) {
        console.error('Invoice generation failed:', err);
      }

      try {
        const shipment = await createDelhiveryShipment(order);
        if (shipment.packages && shipment.packages.length > 0) {
          order.awb = shipment.packages[0].waybill;
          order.trackingUrl = `https://track.delhivery.com/p/${order.awb}`;
          order.shipmentStatus = 'Created';
        }
      } catch (shipmentError) {
        console.error('Shipment creation failed:', shipmentError);
        order.shipmentStatus = 'Pending';
      }

      await order.save();

      // Send confirmation email
      try {
        const user = await User.findById(order.userId);
        const emailToSend = user?.email || order.customerEmail;
        if (emailToSend) {
          await sendEmail({
            from: process.env.EMAIL_CART_FROM || process.env.EMAIL_FROM || 'FitBox Sports <cart@fitboxsports.in>',
            email: emailToSend,
            subject: `Order Confirmed - FitBox Sports (#${order.invoiceNumber || order._id.toString().slice(-8).toUpperCase()})`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background: #ff6b35; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #fff; margin: 0; font-size: 24px;">Order Confirmed! 🎉</h1>
                </div>
                <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px;">Hi ${order.shippingAddress?.name || user?.name || 'Customer'},</p>
                  <p>Your payment was successful and your order is confirmed. We'll begin processing it shortly!</p>
                  <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
                    <thead>
                      <tr style="background:#1a1a1a; color:#fff;">
                        <th style="padding:10px 14px; text-align:left;">Product</th>
                        <th style="padding:10px 14px; text-align:center;">Qty</th>
                        <th style="padding:10px 14px; text-align:right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(order.items || []).map((item, i) => {
                        const price = Number(String(item.price).replace(/[^0-9.-]+/g, ''));
                        const qty = item.quantity || 1;
                        const variant = item.selectedVariant ? ` (${item.selectedVariant})` : '';
                        const size = item.selectedSize ? ` - ${item.selectedSize}` : '';
                        const bg = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
                        return `<tr style="background:${bg};">
                          <td style="padding:10px 14px;">${item.name}${variant}${size}</td>
                          <td style="padding:10px 14px; text-align:center;">${qty}</td>
                          <td style="padding:10px 14px; text-align:right;">₹${price * qty}</td>
                        </tr>`;
                      }).join('')}
                    </tbody>
                    <tfoot>
                      <tr style="background:#fff3ee; font-weight:bold;">
                        <td colspan="2" style="padding:10px 14px; text-align:right;">Order Total:</td>
                        <td style="padding:10px 14px; text-align:right; color:#ff6b35;">₹${order.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <p style="font-size:13px; color:#64748b;">
                    ${order.shippingAddress ? `Shipping to: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}` : ''}
                  </p>
                  <p>${pdfBuffer ? 'Your invoice is attached to this email.' : 'Your invoice will be available in your orders page.'}</p>
                  <br/>
                  <p>Best Regards,<br/><strong>FitBox Sports Team</strong></p>
                </div>
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
        console.error('Confirmation email failed:', emailErr);
      }

      redirectPath = `/orders?payment=success&orderId=${order._id}`;

    } else if (code === 'PAYMENT_ERROR') {
      paymentResult = 'error';
      order.paymentStatus = 'Failed';
      order.orderStatus = 'Cancelled';
      order.shipmentStatus = 'Cancelled';
      await order.save();

      // Send payment failure email
      try {
        const user = await User.findById(order.userId);
        const emailToSend = user?.email || order.customerEmail;
        if (emailToSend) {
          await sendEmail({
            from: process.env.EMAIL_CART_FROM || process.env.EMAIL_FROM || 'FitBox Sports <cart@fitboxsports.in>',
            email: emailToSend,
            subject: `Payment Failed - FitBox Sports`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background: #ef4444; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #fff; margin: 0; font-size: 24px;">Payment Failed</h1>
                </div>
                <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <p>Hi ${order.shippingAddress?.name || user?.name || 'Customer'},</p>
                  <p>Unfortunately, your payment for order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> could not be processed.</p>
                  <p>Your cart items are still saved. Please try placing the order again.</p>
                  <p><a href="${frontendUrl}/cart" style="display:inline-block; margin-top:10px; padding:12px 24px; background:#ff6b35; color:#fff; border-radius:6px; text-decoration:none; font-weight:600;">Go to Cart</a></p>
                  <br/>
                  <p>If the amount was deducted, it will be refunded within 5-7 business days.</p>
                  <p>Best Regards,<br/><strong>FitBox Sports Team</strong></p>
                </div>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Failure email error:', emailErr);
      }

      redirectPath = `/orders?payment=failed&orderId=${order._id}`;

    } else {
      // PAYMENT_PENDING or unknown — don't change order status, let webhook handle
      console.log('PhonePe Redirect: Unhandled code:', code, '- leaving order as pending');
      redirectPath = `/orders?payment=pending&orderId=${order._id}`;
    }

  } catch (error) {
    console.error('PhonePe Redirect processing error:', error);
    redirectPath = `/orders?payment=error`;
  }

  res.redirect(`${frontendUrl}${redirectPath}`);
};

export const phonePeCallback = async (req, res) => {
  try {
    // PhonePe V2 sends a JSON body with { type, payload: { merchantOrderId, state, ... } }
    const body = req.body;
    console.log('PhonePe Callback received:', JSON.stringify(body));

    // Support both the V2 event format and a manual redirect query (?merchantOrderId=...&status=...)
    const merchantOrderId = body?.payload?.merchantOrderId || req.query?.merchantOrderId;
    const state = body?.payload?.state || req.query?.state;

    if (!merchantOrderId) {
      return res.status(400).json({ success: false, message: 'No merchantOrderId in callback' });
    }

    // Find order by the stored paymentId (which we set to the merchantOrderId)
    const order = await Order.findOne({ paymentId: merchantOrderId });
    if (!order) {
      console.error('PhonePe Callback: order not found for merchantOrderId', merchantOrderId);
      return res.status(200).send('OK'); // Ack to PhonePe even if not found
    }

    if (state === 'COMPLETED' && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      order.paymentMode = 'Online';
      order.orderStatus = 'Completed';
      order.paidAt = new Date();

      let pdfBuffer = null;
      try {
        const { invoiceNumber, invoiceUrl, buffer } = await generateInvoice(order);
        order.invoiceNumber = invoiceNumber;
        order.invoiceUrl = invoiceUrl;
        pdfBuffer = buffer;
      } catch (err) {
        console.error('Webhook Invoice generation failed:', err);
      }

      try {
        const shipment = await createDelhiveryShipment(order);
        if (shipment.packages && shipment.packages.length > 0) {
          order.awb = shipment.packages[0].waybill;
          order.trackingUrl = `https://track.delhivery.com/p/${order.awb}`;
          order.shipmentStatus = 'Created';
        }
      } catch (shipmentError) {
        console.error('Shipment creation failed:', shipmentError);
        order.shipmentStatus = 'Pending';
      }

      await order.save();

      // Send confirmation email
      try {
        const user = await User.findById(order.userId);
        const emailToSend = user?.email || order.customerEmail;
        if (emailToSend) {
          await sendEmail({
            from: process.env.EMAIL_CART_FROM || process.env.EMAIL_FROM || 'FitBox Sports <cart@fitboxsports.in>',
            email: emailToSend,
            subject: `Order Confirmation - FitBox Sports (${order.invoiceNumber || order._id})`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #ff6b35;">Thank you for your order!</h2>
                <p>Hi ${order.shippingAddress?.name || user?.name || 'Customer'},</p>
                <p>Your payment has been successfully processed via PhonePe and your order is confirmed.</p>
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
              const price = Number(String(item.price).replace(/[^0-9.-]+/g, ''));
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
        console.error('Webhook Email Send Error:', emailErr);
      }
    } else if (state === 'FAILED') {
      order.paymentStatus = 'Failed';
      await order.save();
      console.log('PhonePe payment failed for order:', merchantOrderId);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PhonePe Callback Error:', error);
    res.status(500).send('Webhook error');
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

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    // Only allow cancellation if order is not Shipped or Delivered
    if (order.shipmentStatus === 'Shipped' || order.shipmentStatus === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an order that has already been shipped or delivered' });
    }

    const isSilent = req.query.silent === 'true';

    if (isSilent && order.paymentStatus === 'Pending Payment' && order.paymentMode !== 'COD') {
      await Order.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Pending order deleted', deleted: true });
    }

    order.orderStatus = 'Cancelled';
    order.shipmentStatus = 'Cancelled';
    await order.save();

    if (!isSilent) {
      try {
        const user = await User.findById(order.userId);
        const emailToSend = user?.email || order.customerEmail;
        if (emailToSend) {
          await sendEmail({
            from: process.env.EMAIL_CART_FROM || process.env.EMAIL_FROM || 'FitBox Sports <cart@fitboxsports.in>',
            email: emailToSend,
            subject: `Order Cancelled - FitBox Sports (${order._id})`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #ef4444;">Order Cancelled</h2>
                <p>Hi ${order.customerName || user?.name || 'Customer'},</p>
                <p>Your order (ID: ${order._id}) has been successfully cancelled.</p>
                ${order.paymentStatus === 'Paid' ? '<p>Your refund will be initiated shortly and should reflect in your original payment method within 5-7 business days.</p>' : ''}
                <br/>
                <p>If you have any questions, feel free to reply to this email.</p>
                <br/>
                <p>Best Regards,</p>
                <p><strong>FitBox Sports Team</strong></p>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error("Failed to send cancellation email:", emailErr);
      }
    }

    res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const codPayment = async (req, res) => {
  try {
    const { orderId, shippingAddress } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    // Mark as COD
    order.paymentMode = 'COD';
    order.paymentStatus = 'Pending Payment';
    order.orderStatus = 'Pending';

    // Set Shipping Address
    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }

    order.shipmentStatus = 'Created';

    await order.save();

    // Send Order Confirmation Email for COD
    try {
      const user = await User.findById(order.userId);
      const emailToSend = user?.email;
      if (emailToSend) {
        await sendEmail({
          from: process.env.EMAIL_CART_FROM || process.env.EMAIL_FROM || 'FitBox Sports <cart@fitboxsports.in>',
          email: emailToSend,
          subject: `Order Placed (COD) - FitBox Sports (${order._id})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #ff6b35;">Order Placed Successfully!</h2>
              <p>Hi ${order.shippingAddress?.name || user?.name || 'Customer'},</p>
              <p>Your order has been placed with <strong>Cash on Delivery</strong>. Please keep ₹${order.totalAmount} ready at the time of delivery.</p>
              <p>Order ID: <strong>${order._id}</strong></p>
              <br/>
              <p>Best Regards,</p>
              <p><strong>FitBox Sports Team</strong></p>
            </div>
          `
        });
        console.log(`COD confirmation email sent to ${emailToSend}`);
      }
    } catch (emailErr) {
      console.error("Failed to send COD confirmation email:", emailErr);
    }

    res.status(200).json({ success: true, message: 'COD order placed successfully', orderId: order._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
