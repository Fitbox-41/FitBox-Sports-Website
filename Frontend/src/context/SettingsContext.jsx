import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { DEFAULT_POINT_VALUE_INR, DEFAULT_REDEEM_CAP_PERCENT } from '../config/points';

export const SettingsContext = createContext();

export const useSettings = () => {
  return useContext(SettingsContext);
};

/// The live points economy (rate + redemption cap), configured in the admin
/// portal. Use this instead of importing the constants, so an admin change
/// takes effect everywhere without a deploy.
export const usePoints = () => {
  const s = useContext(SettingsContext) || {};
  return {
    pointValueInr: s.pointValueInr ?? DEFAULT_POINT_VALUE_INR,
    redeemCapPercent: s.redeemCapPercent ?? DEFAULT_REDEEM_CAP_PERCENT,
  };
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
  const [pointValueInr, setPointValueInr] = useState(DEFAULT_POINT_VALUE_INR);
  const [redeemCapPercent, setRedeemCapPercent] = useState(DEFAULT_REDEEM_CAP_PERCENT);
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
          if (Number(res.data.settings.pointValueInr) > 0) {
            setPointValueInr(Number(res.data.settings.pointValueInr));
          }
          // 0 is a valid cap (redemption switched off), so check for null/undefined
          // rather than truthiness.
          if (res.data.settings.redeemCapPercent !== undefined && res.data.settings.redeemCapPercent !== null) {
            setRedeemCapPercent(Number(res.data.settings.redeemCapPercent));
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
    <SettingsContext.Provider value={{ deliveryFee, freeDeliveryThreshold, saleRibbonText, saleRibbonColor, saleRibbonTextColor, pointValueInr, redeemCapPercent, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
