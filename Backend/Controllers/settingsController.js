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

// @desc    Update delivery fee and settings
// @route   POST /api/admin/settings/delivery-fee
// @access  Admin (Protected by admin secret if needed, or simple auth)
export const updateDeliveryFee = async (req, res) => {
  try {
    const { deliveryFee, freeDeliveryThreshold, saleRibbonText, saleRibbonColor, saleRibbonTextColor } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ deliveryFee, freeDeliveryThreshold, saleRibbonText, saleRibbonColor, saleRibbonTextColor });
    } else {
      if (deliveryFee !== undefined) settings.deliveryFee = deliveryFee;
      if (freeDeliveryThreshold !== undefined) settings.freeDeliveryThreshold = freeDeliveryThreshold;
      if (saleRibbonText !== undefined) settings.saleRibbonText = saleRibbonText;
      if (saleRibbonColor !== undefined) settings.saleRibbonColor = saleRibbonColor;
      if (saleRibbonTextColor !== undefined) settings.saleRibbonTextColor = saleRibbonTextColor;
      await settings.save();
    }
    
    res.status(200).json({ success: true, settings, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};
