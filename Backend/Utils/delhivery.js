import axios from 'axios';

// --- Mock Mode ---
// Set DELHIVERY_MOCK=true in .env to test without hitting the real Delhivery API.
// All functions will return realistic simulated data.
const isMock = () => process.env.DELHIVERY_MOCK === 'true';

// Generate a fake AWB number
const generateMockAWB = () => 'MOCK' + Date.now().toString().slice(-10);

// --- Warehouse / Return Address (FitBox Sports, Jalandhar) ---
const WAREHOUSE = {
  name: 'FitBox Sports',
  address: '41, Wariana Industrial Complex',
  city: 'Jalandhar',
  state: 'Punjab',
  pin: '144002',
  country: 'India',
  phone: '8568989898'
};

/**
 * Map a Delhivery status string to the app's shipmentStatus enum.
 * Delhivery statuses: Manifested, In Transit, Out For Delivery, Delivered,
 *                     RTO Initiated, RTO In Transit, RTO Delivered, Cancelled, Pending, etc.
 */
export const mapDelhiveryStatus = (delhiveryStatus) => {
  if (!delhiveryStatus) return 'Pending';
  const s = delhiveryStatus.toLowerCase().trim();

  if (s === 'delivered') return 'Delivered';
  if (s.includes('out for delivery') || s === 'out for delivery') return 'Out for Delivery';
  if (s === 'in transit' || s.includes('in transit')) return 'In Transit';
  if (s === 'dispatched' || s.includes('dispatched')) return 'In Transit';
  if (s === 'picked up' || s.includes('picked up')) return 'In Transit';
  if (s === 'manifested' || s === 'ready for pickup' || s.includes('manifest')) return 'Ready to Ship';
  if (s.includes('rto')) return 'RTO';
  if (s === 'cancelled' || s.includes('cancel')) return 'Cancelled';

  return 'In Transit'; // Default for any unknown mid-journey status
};

/**
 * Create a Delhivery shipment for a paid order.
 * Uses actual customer and warehouse details.
 */
export const createDelhiveryShipment = async (order) => {
  // --- MOCK MODE ---
  if (isMock()) {
    const mockAWB = generateMockAWB();
    console.log(`[MOCK] Delhivery shipment created — AWB: ${mockAWB}, Order: ${order._id}`);
    return {
      packages: [{
        waybill: mockAWB,
        refnum: order._id.toString(),
        status: 'Success',
        remarks: ['[MOCK] Shipment created successfully']
      }],
      cash_pickups_count: 0,
      package_count: 1,
      upload_wbn: 'MOCK_UPLOAD_' + Date.now(),
      replacement_count: 0,
      pickups_count: 0,
      packages_update: 0,
      cod_count: order.paymentMode === 'COD' ? 1 : 0,
      success: true
    };
  }

  try {
    const format = 'json';
    const address = order.shippingAddress || {};

    // Calculate total weight of the order in grams
    const totalWeight = order.items.reduce(
      (acc, item) => acc + ((item.weight || 500) * (item.quantity || 1)),
      0
    );

    const payload = {
      shipments: [{
        name: address.name || order.customerName || 'Customer',
        add: address.street || '',
        pin: address.zip || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || 'India',
        phone: address.phone || order.customerPhone || '',
        order: order._id.toString(),
        weight: (totalWeight / 1000).toFixed(2), // weight in kg
        payment_mode: order.paymentMode === 'COD' ? 'COD' : 'Prepaid',
        cod_amount: order.paymentMode === 'COD' ? order.totalAmount : 0,
        return_pin: WAREHOUSE.pin,
        return_city: WAREHOUSE.city,
        return_phone: WAREHOUSE.phone,
        return_add: WAREHOUSE.address,
        return_state: WAREHOUSE.state,
        return_country: WAREHOUSE.country,
        return_name: WAREHOUSE.name
      }],
      pickup_location: {
        name: process.env.DELHIVERY_CLIENT_NAME || WAREHOUSE.name,
        add: WAREHOUSE.address,
        city: WAREHOUSE.city,
        pin_code: WAREHOUSE.pin,
        country: WAREHOUSE.country,
        phone: WAREHOUSE.phone
      }
    };

    const response = await axios.post(
      `${process.env.DELHIVERY_BASE_URL}/api/cmu/create.json`,
      `format=${format}&data=${encodeURIComponent(JSON.stringify(payload))}`,
      {
        headers: {
          'Authorization': `Token ${process.env.DELHIVERY_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new Error('Delhivery shipment creation failed: ' + (error.response?.data ? JSON.stringify(error.response.data) : error.message));
  }
};

/**
 * Track a Delhivery shipment by AWB number.
 * Uses the Delhivery Pull API: GET /api/v1/packages/json/?waybill={AWB}
 *
 * Returns: { status, statusCode, scans[], estimatedDate, rawData }
 */
export const trackDelhiveryShipment = async (awb) => {
  // --- MOCK MODE ---
  if (isMock()) {
    // Simulate a shipment progressing through stages based on time.
    // Each mock AWB was created with a timestamp — we use time elapsed to simulate progress.
    const awbTimestamp = awb.startsWith('MOCK') ? parseInt(awb.replace('MOCK', '')) : Date.now();
    const elapsedMinutes = (Date.now() - awbTimestamp) / 60000;

    let mockStatus = 'Manifested';
    let mappedStatus = 'Ready to Ship';
    const scans = [];
    const baseTime = new Date(awbTimestamp);

    // Always add the initial scan
    scans.push({
      status: 'Manifest uploaded',
      statusCode: 'X-UCI',
      location: `${WAREHOUSE.city} (${WAREHOUSE.state})`,
      timestamp: baseTime.toISOString(),
      scanType: 'UD'
    });

    if (elapsedMinutes > 2) {
      mockStatus = 'In Transit';
      mappedStatus = 'In Transit';
      scans.unshift({
        status: 'Picked up and In Transit to destination',
        statusCode: 'T',
        location: `${WAREHOUSE.city} Hub (${WAREHOUSE.state})`,
        timestamp: new Date(baseTime.getTime() + 2 * 60000).toISOString(),
        scanType: 'UD'
      });
    }

    if (elapsedMinutes > 5) {
      scans.unshift({
        status: 'Arrived at destination hub',
        statusCode: 'T',
        location: 'Sorting Facility',
        timestamp: new Date(baseTime.getTime() + 5 * 60000).toISOString(),
        scanType: 'UD'
      });
    }

    if (elapsedMinutes > 8) {
      mockStatus = 'Out for Delivery';
      mappedStatus = 'Out for Delivery';
      scans.unshift({
        status: 'Out for delivery — with delivery executive',
        statusCode: 'OD',
        location: 'Local Delivery Hub',
        timestamp: new Date(baseTime.getTime() + 8 * 60000).toISOString(),
        scanType: 'UD'
      });
    }

    if (elapsedMinutes > 12) {
      mockStatus = 'Delivered';
      mappedStatus = 'Delivered';
      scans.unshift({
        status: 'Delivered — signed by customer',
        statusCode: 'DL',
        location: 'Customer Address',
        timestamp: new Date(baseTime.getTime() + 12 * 60000).toISOString(),
        scanType: 'DL'
      });
    }

    const estimatedDate = new Date(baseTime.getTime() + 12 * 60000).toISOString();

    console.log(`[MOCK] Tracking AWB: ${awb} — Status: ${mockStatus} (elapsed: ${elapsedMinutes.toFixed(1)} min)`);

    return {
      status: mappedStatus,
      delhiveryStatus: mockStatus,
      statusCode: scans[0]?.statusCode || '',
      scans,
      estimatedDate,
      rawData: { mock: true }
    };
  }

  try {
    const response = await axios.get(
      `${process.env.DELHIVERY_BASE_URL}/api/v1/packages/json/`,
      {
        params: { waybill: awb },
        headers: {
          'Authorization': `Token ${process.env.DELHIVERY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;

    // Delhivery returns ShipmentData array
    const shipmentData = data?.ShipmentData?.[0] || null;
    if (!shipmentData) {
      return {
        status: 'Pending',
        statusCode: null,
        scans: [],
        estimatedDate: null,
        rawData: data
      };
    }

    const shipment = shipmentData.Shipment || {};
    const currentStatus = shipment.Status?.Status || '';
    const statusCode = shipment.Status?.StatusCode || '';
    const estimatedDate = shipment.EstimatedDate || shipment.ExpectedDeliveryDate || null;

    // Parse scan history
    const rawScans = shipment.Scans || [];
    const scans = rawScans.map((scan) => {
      const s = scan.ScanDetail || scan;
      return {
        status: s.Instructions || s.Status || '',
        statusCode: s.StatusCode || '',
        location: s.ScannedLocation || s.StatusLocation || '',
        timestamp: s.ScanDateTime || s.StatusDateTime || '',
        scanType: s.ScanType || ''
      };
    });

    return {
      status: mapDelhiveryStatus(currentStatus),
      delhiveryStatus: currentStatus,
      statusCode,
      scans,
      estimatedDate,
      rawData: data
    };
  } catch (error) {
    console.error('Delhivery tracking failed:', error.response?.data || error.message);
    throw new Error('Delhivery tracking failed: ' + (error.response?.data ? JSON.stringify(error.response.data) : error.message));
  }
};

/**
 * Cancel a Delhivery shipment by AWB number.
 * Uses the Delhivery Cancel API: POST /api/p/edit
 * Only works for shipments in: Manifested, In Transit, Pending, Open, or Scheduled status.
 */
export const cancelDelhiveryShipment = async (awb) => {
  // --- MOCK MODE ---
  if (isMock()) {
    console.log(`[MOCK] Delhivery shipment cancelled — AWB: ${awb}`);
    return { status: 'Cancelled', waybill: awb, mock: true };
  }

  try {
    const response = await axios.post(
      `${process.env.DELHIVERY_BASE_URL}/api/p/edit`,
      JSON.stringify({ waybill: awb, cancellation: 'true' }),
      {
        headers: {
          'Authorization': `Token ${process.env.DELHIVERY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Delhivery shipment cancelled for AWB: ${awb}`, response.data);
    return response.data;
  } catch (error) {
    console.error('Delhivery cancellation failed for AWB:', awb, error.response?.data || error.message);
    // Don't throw — cancellation failure shouldn't block order cancellation
    return { error: true, message: error.response?.data || error.message };
  }
};
