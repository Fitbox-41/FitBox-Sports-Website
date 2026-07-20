import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SettingsContext = createContext();

export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
  const [deliveryFee, setDeliveryFee] = useState(99); // default
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(999); // default
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
    <SettingsContext.Provider value={{ deliveryFee, freeDeliveryThreshold, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
