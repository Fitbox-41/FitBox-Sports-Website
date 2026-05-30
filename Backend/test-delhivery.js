import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const testDelhivery = async () => {
  try {
    const format = "json";
    
    const payload = {
      "shipments": [{
        "name": "Customer Name",
        "add": "123 Test Street",
        "pin": "400001",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "phone": "9876543210",
        "order": "123456789",
        "payment_mode": "COD",
        "cod_amount": 499,
        "return_pin": "400001",
        "return_city": "Mumbai",
        "return_phone": "9876543210",
        "return_add": "Your_Warehouse_Address",
        "return_state": "Maharashtra",
        "return_country": "India"
      }],

    };

    const response = await axios.post(`${process.env.DELHIVERY_BASE_URL}/api/cmu/create.json`, `format=${format}&data=${JSON.stringify(payload)}`, {
      headers: {
        'Authorization': `Token ${process.env.DELHIVERY_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log("SUCCESS:");
    console.log(response.data);
    if (response.data.packages && response.data.packages.length > 0) {
      console.log("Remarks:", response.data.packages[0].remarks);
    }
  } catch (error) {
    console.error("FAILED:");
    console.error(error.response?.data || error.message);
  }
};

testDelhivery();
