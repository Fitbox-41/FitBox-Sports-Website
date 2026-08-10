// FitBox points economy — SINGLE SOURCE OF TRUTH (server side).
//
// The live values are stored in the shared `settings` document and edited from
// the admin portal, so the rate can be changed without a website deploy or a
// mobile app release. The constants below are only the fallback used before an
// admin has ever saved settings, or if that read fails — never read them
// directly when you can await getPointsConfig().
//
// These are a business/legal term, not a style choice: the value is published on
// the website Terms page ("FitBox Points & Rewards"), shown in the app's in-app
// T&C, and used by the admin portal to price the outstanding points liability.
// Every one of those surfaces renders whatever is configured here, so they can't
// drift apart.
//
// Model: 1 point = ₹0.10 by default, earned from the app's weekly territory
// rewards, redeemable for at most 10% of an order's pre-discount subtotal.
//
// A checkout that hardcoded ₹1 shipped a 10x over-valuation once already — if
// you are about to re-declare a rate in a controller, that is the bug you are
// re-creating.
import Settings from '../Models/Settings.js';

export const DEFAULT_POINT_VALUE_INR = 0.1;
export const DEFAULT_REDEEM_CAP_PERCENT = 10;

// Back-compat for any older import; prefer getPointsConfig().
export const POINT_VALUE_INR = DEFAULT_POINT_VALUE_INR;

function sanitise(settings) {
  const rawValue = Number(settings && settings.pointValueInr);
  const rawCap = Number(settings && settings.redeemCapPercent);
  return {
    pointValueInr:
      Number.isFinite(rawValue) && rawValue > 0 ? rawValue : DEFAULT_POINT_VALUE_INR,
    // A 0% cap is meaningful (redemption switched off), so only fall back when
    // the value is missing or out of range.
    redeemCapPercent:
      Number.isFinite(rawCap) && rawCap >= 0 && rawCap <= 100
        ? rawCap
        : DEFAULT_REDEEM_CAP_PERCENT,
  };
}

/// The live points configuration. Falls back to the defaults if settings have
/// never been saved or the read fails — redemption must never break because a
/// config lookup did.
export async function getPointsConfig() {
  try {
    const settings = await Settings.findOne().lean();
    return sanitise(settings);
  } catch (_) {
    return {
      pointValueInr: DEFAULT_POINT_VALUE_INR,
      redeemCapPercent: DEFAULT_REDEEM_CAP_PERCENT,
    };
  }
}

/// Points a given subtotal allows, before the user's balance is considered.
export function maxRedeemablePointsFor(subtotal, config) {
  const { pointValueInr, redeemCapPercent } = sanitise(config);
  if (!(Number(subtotal) > 0) || pointValueInr <= 0) return 0;
  return Math.floor((Number(subtotal) * (redeemCapPercent / 100)) / pointValueInr);
}
