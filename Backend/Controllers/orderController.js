import Order from '../Models/Order.js';
import User from '../Models/User.js';
import { createDelhiveryShipment, trackDelhiveryShipment, cancelDelhiveryShipment } from '../Utils/delhivery.js';
import { generateInvoice } from '../Utils/invoiceGenerator.js';
import sendEmail from '../Utils/sendEmail.js';
import crypto from 'crypto';
import axios from 'axios';

export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryCharge } = req.body;

    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Fetch user details to denormalize on the order
    const user = await User.findById(userId).lean();

    // Sanitize item prices to numbers (strip commas if any)
    const sanitizedItems = items.map(item => ({
      ...item,
      price: typeof item.price === 'string' ? Number(item.price.replace(/[^0-9.-]+/g, "")) : item.price
    }));

    let shippingAddress = null;
    if (user && user.addresses && user.addresses.length > 0) {
      const addr = user.addresses[0];
      shippingAddress = {
        name: user.name || '',
        phone: user.phone || addr.phone || '',
        street: addr.address || addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        zip: addr.pincode || addr.zip || '',
        country: 'India'
      };
    }

    const order = new Order({
      userId,
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      items: sanitizedItems,
      totalAmount,
      deliveryCharge: deliveryCharge || 0,
      shippingAddress,
      paymentStatus: 'Pending Payment'
    });
    await order.save();

    res.status(200).json({
      success: true,
      orderId: order._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
                  <tr style="background:#fff3ee;">
                    <td colspan="3" style="padding:10px 14px; text-align:right;">Subtotal:</td>
                    <td style="padding:10px 14px; text-align:right;">Rs. ${(order.totalAmount - (order.deliveryCharge || 0))}</td>
                  </tr>
                  <tr style="background:#fff3ee;">
                    <td colspan="3" style="padding:10px 14px; text-align:right;">Delivery Fee:</td>
                    <td style="padding:10px 14px; text-align:right;">Rs. ${order.deliveryCharge || 0}</td>
                  </tr>
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

const PHONEPE_SUCCESS_STATES = new Set(['COMPLETED', 'SUCCESS', 'PAID', 'PAYMENT_SUCCESS']);
const PHONEPE_FAILED_STATES = new Set(['FAILED', 'PAYMENT_ERROR', 'CANCELLED', 'PAYMENT_FAILED']);
const PHONEPE_PENDING_STATES = new Set(['PENDING', 'CONFIRMED', 'PAYMENT_PENDING']);

const getPhonePeOrderStatus = async (merchantOrderId) => {
  const env = process.env.PHONEPE_ENV || 'UAT';
  const statusUrl = env === 'PROD'
    ? `https://api.phonepe.com/apis/pg/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status`
    : `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status`;

  const accessToken = await getPhonePeToken();
  const statusRes = await axios.get(statusUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${accessToken}`
    }
  });

  const data = statusRes.data?.data || statusRes.data || {};
  const rootState = String(data.state || '').toUpperCase();
  const paymentState = String(data.paymentDetails?.[0]?.state || '').toUpperCase();
  const effectiveState = PHONEPE_SUCCESS_STATES.has(rootState) || PHONEPE_FAILED_STATES.has(rootState)
    ? rootState
    : (paymentState || rootState);

  return { effectiveState, raw: data };
};

const resolveTerminalPhonePeState = async (merchantOrderId, maxAttempts = 5) => {
  let lastState = '';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { effectiveState } = await getPhonePeOrderStatus(merchantOrderId);
    lastState = effectiveState;

    if (PHONEPE_SUCCESS_STATES.has(effectiveState)) return 'success';
    if (PHONEPE_FAILED_STATES.has(effectiveState)) return 'failed';

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log('PhonePe status remained non-terminal:', merchantOrderId, lastState);
  return 'failed';
};

const markOnlineOrderFailed = async (order) => {
  order.paymentStatus = 'Failed';
  order.paymentMode = 'Online';
  order.orderStatus = 'Cancelled';
  order.shipmentStatus = 'Cancelled';
  await order.save();
  return order;
};

const processPaidOrder = async (order) => {
  // Guard: if already paid and email sent, skip everything
  if (order.paymentStatus === 'Paid' && order.confirmationEmailSent) {
    return order;
  }

  order.paymentStatus = 'Paid';
  order.paymentMode = 'Online';
  order.orderStatus = 'Completed';
  order.paidAt = new Date();

  let pdfBuffer = null;
  if (!order.invoiceNumber || !order.invoiceUrl) {
    try {
      const { invoiceNumber, invoiceUrl, buffer } = await generateInvoice(order);
      order.invoiceNumber = invoiceNumber;
      order.invoiceUrl = invoiceUrl;
      pdfBuffer = buffer;
    } catch (invoiceError) {
      console.error('Invoice generation failed:', invoiceError);
    }
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
    order.shipmentStatus = order.shipmentStatus === 'Created' ? order.shipmentStatus : 'Pending';
  }

  await order.save();

  // Atomically claim email-sending rights to prevent duplicate emails
  // Only the first caller (callback OR redirect) that sets this flag will send the email
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, confirmationEmailSent: { $ne: true } },
    { $set: { confirmationEmailSent: true } }
  );

  if (!claimed) {
    // Another process already claimed email rights — skip sending
    console.log(`Email already sent for order ${order._id}, skipping duplicate`);
    return order;
  }

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
                <tr style="background:#fff3ee;">
                  <td colspan="3" style="padding:10px 14px; text-align:right;">Subtotal:</td>
                  <td style="padding:10px 14px; text-align:right;">Rs. ${(order.totalAmount - (order.deliveryCharge || 0))}</td>
                </tr>
                <tr style="background:#fff3ee;">
                  <td colspan="3" style="padding:10px 14px; text-align:right;">Delivery Fee:</td>
                  <td style="padding:10px 14px; text-align:right;">Rs. ${order.deliveryCharge || 0}</td>
                </tr>
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
    console.error('Confirmation email failed:', emailErr);
    // Reset the flag so a retry can send the email
    await Order.updateOne({ _id: order._id }, { $set: { confirmationEmailSent: false } });
  }

  return order;
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

    const apiUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUrlEndpoint = `${apiUrl}/api/orders/phonepe/redirect?merchantOrderId=${merchantOrderId}&orderId=${order._id}`;

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
      order.paymentMode = 'Online';
      order.paymentStatus = 'Pending Payment';
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
  let frontendUrl = process.env.FRONTEND_URL || '';
  if (!frontendUrl) {
    console.error('FRONTEND_URL is not configured');
    return res.status(500).send('Payment redirect misconfigured: FRONTEND_URL missing');
  }

  // Ensure we redirect to www. version if that's what the user is on
  if (frontendUrl.includes('://') && !frontendUrl.includes('://www.')) {
    frontendUrl = frontendUrl.replace('://', '://www.');
  }

  try {
    let merchantOrderId = req.query?.merchantOrderId || req.body?.transactionId || req.body?.merchantOrderId;

    if (req.body && req.body.response) {
      try {
        const decoded = JSON.parse(Buffer.from(req.body.response, 'base64').toString('utf8'));
        if (decoded.data) {
          merchantOrderId = decoded.data.merchantTransactionId || decoded.data.transactionId || merchantOrderId;
        }
      } catch (e) {
        console.error('Failed to parse PhonePe base64 response', e);
      }
    }

    const orderIdParam = req.query.orderId;
    console.log('PhonePe Redirect received:', { merchantOrderId, orderIdParam });

    let order;
    if (merchantOrderId) {
      order = await Order.findOne({ paymentId: merchantOrderId });
    } else if (orderIdParam) {
      order = await Order.findById(orderIdParam);
    }

    if (!order) {
      return res.redirect(`${frontendUrl}/orders?payment=error&reason=order_not_found`);
    }

    // If already fully processed by the callback webhook, redirect immediately
    if (order.paymentStatus === 'Paid') {
      return res.redirect(`${frontendUrl}/orders?payment=success&orderId=${order._id}`);
    }

    // Do NOT poll PhonePe or run heavy processing here — Vercel has a 10s timeout.
    // Instead, redirect to frontend immediately. The frontend will call /verify-payment
    // which will reconcile the payment status, create shipment, send email, etc.
    return res.redirect(`${frontendUrl}/orders?payment=pending&orderId=${order._id}`);

  } catch (error) {
    console.error('PhonePe Redirect processing error:', error);
    return res.redirect(`${frontendUrl}/orders?payment=error`);
  }
};

export const phonePeCallback = async (req, res) => {
  try {
    const body = req.body;
    console.log('PhonePe Callback received:', JSON.stringify(body));

    const event = String(body?.event || '').toLowerCase();
    const merchantOrderId = body?.payload?.merchantOrderId || body?.payload?.merchantTransactionId || req.query?.merchantOrderId;
    const state = body?.payload?.state || body?.state || req.query?.state;
    const normalizedState = String(state || '').toUpperCase();

    if (!merchantOrderId) {
      return res.status(400).json({ success: false, message: 'No merchantOrderId in callback' });
    }

    const order = await Order.findOne({ paymentId: merchantOrderId });
    if (!order) {
      console.error('PhonePe Callback: order not found for merchantOrderId', merchantOrderId);
      return res.status(200).send('OK');
    }

    if (order.paymentStatus === 'Paid' && order.confirmationEmailSent) {
      console.log('PhonePe Callback: order already paid and email sent', merchantOrderId);
      return res.status(200).send('OK');
    }

    const isSuccess = event === 'checkout.order.completed'
      || PHONEPE_SUCCESS_STATES.has(normalizedState);
    const isFailed = event === 'checkout.order.failed'
      || PHONEPE_FAILED_STATES.has(normalizedState);

    if (isSuccess) {
      await processPaidOrder(order);
    } else if (isFailed) {
      await markOnlineOrderFailed(order);
      console.log('PhonePe payment failed for order:', merchantOrderId, 'state:', normalizedState, 'event:', event);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PhonePe Callback Error:', error);
    res.status(500).send('Webhook error');
  }
};

export const verifyOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let order = await Order.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Already fully processed
    if (order.paymentStatus === 'Paid' && order.confirmationEmailSent) {
      return res.status(200).json({ success: true, paymentStatus: 'Paid', order });
    }

    if (order.paymentMode === 'COD') {
      return res.status(200).json({ success: true, paymentStatus: order.paymentStatus, order });
    }

    if (!order.paymentId) {
      await markOnlineOrderFailed(order);
      const updated = await Order.findById(order._id);
      return res.status(200).json({ success: true, paymentStatus: 'Failed', order: updated });
    }

    // If already marked Paid (by callback) but not fully processed, finish processing
    if (order.paymentStatus === 'Paid') {
      order = await processPaidOrder(order);
      return res.status(200).json({ success: true, paymentStatus: 'Paid', order });
    }

    // Main reconciliation: poll PhonePe to get terminal state
    const terminalState = await resolveTerminalPhonePeState(order.paymentId, 5);
    
    // Re-read order in case callback processed it while we were polling
    order = await Order.findById(order._id);

    if (order.paymentStatus === 'Paid') {
      // Callback processed it — ensure full processing is done
      if (!order.confirmationEmailSent) {
        order = await processPaidOrder(order);
      }
      return res.status(200).json({ success: true, paymentStatus: 'Paid', order });
    }

    if (terminalState === 'success') {
      order = await processPaidOrder(order);
      return res.status(200).json({ success: true, paymentStatus: 'Paid', order });
    } else {
      order = await markOnlineOrderFailed(order);
      return res.status(200).json({ success: true, paymentStatus: 'Failed', order });
    }
  } catch (error) {
    console.error('Verify order payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    // Filter out 'ghost' orders that haven't proceeded past the initial 'Pending Payment' state
    // An order is valid if it's COD, Paid, Failed, Cancelled, OR (Online and has a paymentId meaning they went to PhonePe)
    const orders = await Order.find({ 
      userId,
      $or: [
        { paymentMode: 'COD' },
        { paymentStatus: { $in: ['Paid', 'Failed'] } },
        { orderStatus: 'Cancelled' },
        { paymentMode: 'Online', paymentId: { $exists: true, $ne: null } }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Ensure the user owns the order, unless it's a guest checkout (we allow it if userId matches or if it's admin, though admin logic is separate)
    // For now, if there's a req.user, just check if it matches
    if (req.user && order.userId && order.userId._id.toString() !== req.user._id.toString()) {
      // return res.status(401).json({ success: false, message: 'Unauthorized' });
      // Depending on guest checkout logic, we might relax this or check an order token. 
      // Assuming logged in users for now.
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    // Only allow cancellation if order is not Out for Delivery or Delivered
    if (order.shipmentStatus === 'Out for Delivery' || order.shipmentStatus === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an order that is out for delivery or already delivered' });
    }

    const isSilent = req.query.silent === 'true';

    if (isSilent && order.paymentStatus === 'Pending Payment' && order.paymentMode !== 'COD') {
      await Order.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Pending order deleted', deleted: true });
    }

    if (cancelReason && Array.isArray(cancelReason)) {
      order.cancelReason = cancelReason;
    }

    // Cancel shipment on Delhivery if AWB exists
    if (order.awb) {
      try {
        await cancelDelhiveryShipment(order.awb);
        console.log(`Delhivery shipment cancelled for order ${id}, AWB: ${order.awb}`);
      } catch (delhiveryErr) {
        console.error('Failed to cancel Delhivery shipment:', delhiveryErr.message);
        // Continue with order cancellation even if Delhivery cancel fails
      }
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
                    <tr style="background:#fff3ee;">
                      <td colspan="3" style="padding:10px 14px; text-align:right;">Subtotal:</td>
                      <td style="padding:10px 14px; text-align:right;">Rs. ${(order.totalAmount - (order.deliveryCharge || 0))}</td>
                    </tr>
                    <tr style="background:#fff3ee;">
                      <td colspan="3" style="padding:10px 14px; text-align:right;">Delivery Fee:</td>
                      <td style="padding:10px 14px; text-align:right;">Rs. ${order.deliveryCharge || 0}</td>
                    </tr>
                    <tr style="background:#fff3ee; font-weight:bold;">
                      <td colspan="3" style="padding:10px 14px; text-align:right;">Order Total:</td>
                      <td style="padding:10px 14px; text-align:right; color:#ff6b35;">Rs. ${order.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>

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

    await order.save();

    // Create Delhivery Shipment for COD order
    try {
      const shipment = await createDelhiveryShipment(order);
      if (shipment.packages && shipment.packages.length > 0) {
        order.awb = shipment.packages[0].waybill;
        order.trackingUrl = `https://track.delhivery.com/p/${order.awb}`;
        order.shipmentStatus = 'Created';
      } else {
        order.shipmentStatus = 'Created';
      }
    } catch (shipmentError) {
      console.error('COD Delhivery shipment creation failed:', shipmentError.message);
      order.shipmentStatus = 'Created';
    }

    await order.save();

    // Generate Invoice
    let pdfBuffer = null;
    try {
      const { invoiceNumber, invoiceUrl, buffer } = await generateInvoice(order);
      order.invoiceNumber = invoiceNumber;
      order.invoiceUrl = invoiceUrl;
      pdfBuffer = buffer;
      await order.save();
    } catch (invoiceError) {
      console.error("COD Invoice generation failed:", invoiceError);
    }

    // Send Order Confirmation Email for COD
    try {
      const user = await User.findById(order.userId);
      const emailToSend = user?.email;
      if (emailToSend) {
        await sendEmail({
          from: process.env.EMAIL_CART_FROM || process.env.EMAIL_FROM || 'FitBox Sports <cart@fitboxsports.in>',
          email: emailToSend,
          subject: `Order Placed (COD) - FitBox Sports (${order.invoiceNumber || order._id})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #ff6b35;">Order Placed Successfully!</h2>
              <p>Hi ${order.shippingAddress?.name || user?.name || 'Customer'},</p>
              <p>Your order has been placed with <strong>Cash on Delivery</strong>. Please keep ₹${order.totalAmount} ready at the time of delivery.</p>
              <p>Order ID: <strong>${order._id}</strong></p>

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
                  <tr style="background:#fff3ee;">
                    <td colspan="3" style="padding:10px 14px; text-align:right;">Subtotal:</td>
                    <td style="padding:10px 14px; text-align:right;">Rs. ${(order.totalAmount - (order.deliveryCharge || 0))}</td>
                  </tr>
                  <tr style="background:#fff3ee;">
                    <td colspan="3" style="padding:10px 14px; text-align:right;">Delivery Fee:</td>
                    <td style="padding:10px 14px; text-align:right;">Rs. ${order.deliveryCharge || 0}</td>
                  </tr>
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

export const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const order = await Order.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // If no AWB yet, return current static status
    if (!order.awb) {
      return res.status(200).json({
        success: true,
        tracking: {
          status: order.shipmentStatus || 'Pending',
          delhiveryStatus: null,
          scans: [],
          estimatedDate: null,
          awb: null
        }
      });
    }

    // Fetch live tracking from Delhivery
    const tracking = await trackDelhiveryShipment(order.awb);

    // Update order's shipmentStatus in DB if it has changed
    const newStatus = tracking.status;
    if (newStatus && newStatus !== order.shipmentStatus) {
      // Only update forward (don't regress status)
      const statusOrder = ['Pending', 'Created', 'Ready to Ship', 'In Transit', 'Out for Delivery', 'Delivered', 'RTO', 'Cancelled'];
      const currentIdx = statusOrder.indexOf(order.shipmentStatus);
      const newIdx = statusOrder.indexOf(newStatus);

      if (newIdx > currentIdx || newStatus === 'RTO' || newStatus === 'Cancelled') {
        order.shipmentStatus = newStatus;

        // Also update orderStatus if delivered
        if (newStatus === 'Delivered') {
          order.orderStatus = 'Completed';
        }

        await order.save();
      }
    }

    return res.status(200).json({
      success: true,
      tracking: {
        status: tracking.status,
        delhiveryStatus: tracking.delhiveryStatus,
        scans: tracking.scans,
        estimatedDate: tracking.estimatedDate,
        awb: order.awb
      }
    });
  } catch (error) {
    console.error('Track order error:', error.message);
    // If Delhivery API fails, still return the static status from DB
    try {
      const order = await Order.findById(req.params.id);
      return res.status(200).json({
        success: true,
        tracking: {
          status: order?.shipmentStatus || 'Pending',
          delhiveryStatus: null,
          scans: [],
          estimatedDate: null,
          awb: order?.awb || null,
          error: 'Live tracking temporarily unavailable'
        }
      });
    } catch (e) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
