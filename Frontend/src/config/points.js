// FitBox points economy — client-side defaults + helpers.
//
// The live values come from admin settings via SettingsContext (`usePoints()`);
// these constants are only the fallback used before settings load or if that
// request fails. Never hardcode a rate in a page — read it from the context, so
// changing it in the admin portal updates every surface at once.
//
// Note the cap is deliberately NOT advertised on the cart or checkout: those
// screens show a "*" pointing at the Terms page, where the exact value and cap
// are disclosed. The server clamps regardless.
export const DEFAULT_POINT_VALUE_INR = 0.1;
export const DEFAULT_REDEEM_CAP_PERCENT = 10;

// Back-compat for older imports; prefer usePoints() from SettingsContext.
export const POINT_VALUE_INR = DEFAULT_POINT_VALUE_INR;

/// Points a given subtotal allows, before the user's balance is considered.
export const maxRedeemablePoints = (
  subtotal,
  pointValueInr = DEFAULT_POINT_VALUE_INR,
  redeemCapPercent = DEFAULT_REDEEM_CAP_PERCENT,
) => {
  const value = Number(pointValueInr) > 0 ? Number(pointValueInr) : DEFAULT_POINT_VALUE_INR;
  const cap = Number(redeemCapPercent) >= 0 ? Number(redeemCapPercent) : DEFAULT_REDEEM_CAP_PERCENT;
  if (!(Number(subtotal) > 0)) return 0;
  return Math.floor((Number(subtotal) * (cap / 100)) / value);
};

/// "₹0.10" — formatted for the T&C copy.
export const formatPointValue = (pointValueInr) =>
  `₹${Number(pointValueInr ?? DEFAULT_POINT_VALUE_INR).toFixed(2)}`;
