import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SettingsContext = createContext();

export const useSettings = () => {
  return useContext(SettingsContext);
};

const DEFAULT_SALE_TEXT = 'SUMMER SALE IS LIVE! GET UP TO 50% OFF ON ALL GYM EQUIPMENT • USE CODE: FIT50 • LIMITED TIME OFFER • FREE DELIVERY ON ORDERS ABOVE ₹999 • ';
const DEFAULT_RIBBON_COLOR = '#e53935';
const DEFAULT_TEXT_COLOR = '#ffffff';

export const SettingsProvider = ({ children }) => {
  const [deliveryFee, setDeliveryFee] = useState(99); // default
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(999); // default
  const [saleRibbonText, setSaleRibbonText] = useState(DEFAULT_SALE_TEXT);
  const [saleRibbonColor, setSaleRibbonColor] = useState(DEFAULT_RIBBON_COLOR);
  const [saleRibbonTextColor, setSaleRibbonTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        const res = await axios.get(`${apiUrl}/api/admin/settings`);
        if (res.data.success && res.data.settings) {
          setDeliveryFee(res.data.settings.deliveryFee);
          if (res.data.settings.freeDeliveryThreshold !== undefined) {
            setFreeDeliveryThreshold(res.data.settings.freeDeliveryThreshold);
          }
          if (res.data.settings.saleRibbonText !== undefined && res.data.settings.saleRibbonText.trim() !== '') {
            setSaleRibbonText(res.data.settings.saleRibbonText);
          }
          if (res.data.settings.saleRibbonColor) {
            setSaleRibbonColor(res.data.settings.saleRibbonColor);
          }
          if (res.data.settings.saleRibbonTextColor) {
            setSaleRibbonTextColor(res.data.settings.saleRibbonTextColor);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ deliveryFee, freeDeliveryThreshold, saleRibbonText, saleRibbonColor, saleRibbonTextColor, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
