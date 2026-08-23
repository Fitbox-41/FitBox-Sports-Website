// Point expiry helpers (website side).
//
// Mirrors FitBox_App/backend/pointsExpiry.js — the two must agree, the same way
// Utils/points.js mirrors the app's config. Points expire 99 days after they are
// earned and are spent oldest-first, so a redemption here has to say which
// credits it consumed or the FIFO buckets drift out of step with the balance.
import WalletTransaction from '../Models/WalletTransaction.js';

export const EXPIRY_DAYS = 99;

/// When a credit issued now should expire (used by refunds, which re-credit).
export function creditExpiry(from = new Date()) {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + EXPIRY_DAYS);
  return d;
}

/// Marks `amount` points as spent, oldest live credit first.
///
/// Best-effort: the balance is what the customer can actually spend, and it has
/// already been debited atomically by the caller. This only decides which points
/// expire next, so it must never throw into a committed checkout.
export async function consumeOldestFirst(userId, amount) {
  try {
    let left = Number(amount) || 0;
    if (left <= 0) return 0;

    const live = await WalletTransaction.find({
      userId,
      type: 'credit',
      remaining: { $gt: 0 },
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: { $exists: false } }],
    })
      .sort({ createdAt: 1 })
      .lean();

    for (const credit of live) {
      if (left <= 0) break;
      const take = Math.min(left, Number(credit.remaining) || 0);
      if (take <= 0) continue;
      await WalletTransaction.updateOne(
        { _id: credit._id },
        { $inc: { remaining: -take } },
      );
      left -= take;
    }
    return (Number(amount) || 0) - left;
  } catch (err) {
    console.error('FIFO attribution failed:', err.message);
    return 0;
  }
}
