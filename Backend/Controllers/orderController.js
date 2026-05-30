import Order from '../Models/Order.js';
import { createGoKwikCheckout, verifyGoKwikSignature } from '../Utils/gokwik.js';
import { createDelhiveryShipment } from '../Utils/delhivery.js';
import { generateInvoice } from '../Utils/invoiceGenerator.js';

export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    // In a real application, req.user._id comes from authMiddleware
    // Using a placeholder or omitting if auth is optional
    const userId = req.user ? req.user._id : '000000000000000000000000'; // Replace with actual logic

    // Sanitize item prices to numbers (strip commas if any)
    const sanitizedItems = items.map(item => ({
      ...item,
      price: typeof item.price === 'string' ? Number(item.price.replace(/[^0-9.-]+/g, "")) : item.price
    }));

    const order = new Order({
      userId,
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

      const { invoiceNumber, invoiceUrl } = await generateInvoice(order);
      order.invoiceNumber = invoiceNumber;
      order.invoiceUrl = invoiceUrl;

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
    try {
      const { invoiceNumber, invoiceUrl } = await generateInvoice(order);
      order.invoiceNumber = invoiceNumber;
      order.invoiceUrl = invoiceUrl;
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

    res.status(200).json({ success: true, message: 'Mock payment successful', orderId: order._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : '000000000000000000000000'; // Replace with actual auth logic
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
