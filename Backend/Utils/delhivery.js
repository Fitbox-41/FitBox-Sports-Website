import axios from 'axios';

export const createDelhiveryShipment = async (order) => {
  try {
    const format = "json";
    
    const address = order.shippingAddress || { street: '', zip: '', city: '', state: '', country: '' };
    
    // Calculate total weight of the order in grams
    const totalWeight = order.items.reduce((acc, item) => acc + ((item.weight || 500) * (item.quantity || 1)), 0);

    const payload = {
      "shipments": [{
        "name": "Customer Name", // Should fetch dynamically in a real scenario
        "add": address.street,
        "pin": address.zip,
        "city": address.city,
        "state": address.state,
        "country": address.country,
        "phone": "9876543210",
        "order": order._id.toString(),
        "weight": (totalWeight / 1000).toFixed(2), // weight in kg
        "payment_mode": "Prepaid",
        "return_pin": "400001",
        "return_city": "Mumbai",
        "return_phone": "9876543210",
        "return_add": "Your_Warehouse_Address",
        "return_state": "Maharashtra",
        "return_country": "India"
      }],
      "pickup_location": {
        "name": "Your_Warehouse_Name",
        "add": "Your_Warehouse_Address",
        "city": "Mumbai",
        "pin": "400001",
        "country": "India",
        "phone": "9876543210"
      }
    };

    const response = await axios.post(`${process.env.DELHIVERY_BASE_URL}/api/cmu/create.json`, `format=${format}&data=${JSON.stringify(payload)}`, {
      headers: {
        'Authorization': `Token ${process.env.DELHIVERY_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data; 
  } catch (error) {
    throw new Error('Delhivery shipment creation failed: ' + error.message);
  }
};
