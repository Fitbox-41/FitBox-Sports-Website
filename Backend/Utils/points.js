// FitBox points economy — SINGLE SOURCE OF TRUTH (server side).
//
// DO NOT change these values without owner sign-off. They are a business/legal
// term, not a style choice: the value is published in the website Terms page
// ("FitBox Points & Rewards"), stated in the app's in-app T&C, and used by the
// admin portal to compute the outstanding points liability. Changing it here
// alone silently desyncs all three and mis-prices every redemption.
//
// Agreed model: 1 point = ₹0.10, earned at 10 points/km on in-app runs,
// redeemable for at most 50% of an order's pre-discount subtotal.
//
// A checkout that reverted this to ₹1 (a 10x over-valuation) shipped once
// already — if you are editing this line, that is the bug you are re-creating.
export const POINT_VALUE_INR = 0.1;

// Maximum share of the order subtotal that points may cover.
export const MAX_REDEEM_FRACTION = 0.5;

// Points a given subtotal allows, before the user's balance is considered.
export const maxRedeemablePoints = (subtotal) =>
  Math.floor((Number(subtotal) * MAX_REDEEM_FRACTION) / POINT_VALUE_INR);
