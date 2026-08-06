// FitBox points economy — SINGLE SOURCE OF TRUTH (client side).
//
// Must stay identical to Backend/Utils/points.js. The server clamps redemption
// independently, so a mismatch here shows the customer a discount the server
// then rejects (or silently reduces) at checkout.
//
// DO NOT change these values without owner sign-off — the value is published in
// the website Terms page and the app's in-app T&C, and the admin portal prices
// the outstanding points liability with it.
//
// Agreed model: 1 point = ₹0.10, redeemable for at most 50% of an order.
export const POINT_VALUE_INR = 0.1;

export const MAX_REDEEM_FRACTION = 0.5;

export const maxRedeemablePoints = (subtotal) =>
  Math.floor((Number(subtotal) * MAX_REDEEM_FRACTION) / POINT_VALUE_INR);
