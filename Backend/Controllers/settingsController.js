import Settings from '../Models/Settings.js';

// @desc    Get global settings
// @route   GET /api/admin/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// @desc    Update delivery fee
// @route   POST /api/admin/settings/delivery-fee
// @access  Admin (Protected by admin secret if needed, or simple auth)
export const updateDeliveryFee = async (req, res) => {
  try {
    const { deliveryFee } = req.body;
    
    // In a real app, you'd verify admin credentials here
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ deliveryFee });
    } else {
      settings.deliveryFee = deliveryFee;
      await settings.save();
    }
    
    res.status(200).json({ success: true, settings, message: 'Delivery fee updated successfully' });
  } catch (error) {
    console.error('Error updating delivery fee:', error);
    res.status(500).json({ success: false, message: 'Failed to update delivery fee' });
  }
};
