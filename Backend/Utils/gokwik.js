import axios from 'axios';
import crypto from 'crypto';

export const createGoKwikCheckout = async (order) => {
  try {
    const payload = {
      request_id: order._id.toString(),
      total: order.totalAmount,
      // Expand as per exact GoKwik docs
    };
    
    const response = await axios.post(`${process.env.GOKWIK_BASE_URL}/api/v1/order/create`, payload, {
      headers: {
        'app-id': process.env.GOKWIK_APP_ID,
        'app-secret': process.env.GOKWIK_APP_SECRET
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('GoKwik checkout creation failed: ' + error.message);
  }
};

export const verifyGoKwikSignature = (payload, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.GOKWIK_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  return expectedSignature === signature;
};
