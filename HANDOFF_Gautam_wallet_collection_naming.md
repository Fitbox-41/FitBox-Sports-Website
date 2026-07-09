# Handoff — Wallet collection naming (Gautam → Diwakar)

**Branch:** `Gautam`  ·  **Date:** 9 July 2026  ·  **Author:** Gautam

## What changed
Pinned explicit MongoDB collection names on the two wallet models so the **app** and the **website**
read/write the *same* collections (single source of truth for the shared wallet).

- `Backend/Models/Wallet.js` → collection **`wallets`**
- `Backend/Models/WalletTransaction.js` → collection **`wallet_transactions`**

```js
// before
export default mongoose.model('WalletTransaction', WalletTransactionSchema);
// after
export default mongoose.model('WalletTransaction', WalletTransactionSchema, 'wallet_transactions');
```

## Why
Without an explicit 3rd argument, Mongoose auto-names the collection by pluralising the model name:
- `Wallet` → `wallets` (fine)
- `WalletTransaction` → **`wallettransactions`** (no underscore)

The FitBox **app backend** (`Fitbox-41/FitBox-App`, `backend/`) pins **`wallet_transactions`** (with underscore).
If the website stayed on the Mongoose default, the two systems would write to **different collections** and
the wallet balance would not be shared. This change makes both sides use `wallet_transactions`.

Nothing else changes — all wallet code already goes through the Mongoose models (`walletRoutes.js`,
`orderController.js`), so pinning the model's collection name applies everywhere automatically.

## ⚠️ Deploy sequencing & data (please read before merging)
1. **Deploy the website and the app backend together** on this naming. Until both use `wallet_transactions`,
   don't run them against the same live DB, or writes will split across two collections.
2. **Existing data:** if the shared DB already has a `wallettransactions` collection with test rows, migrate or
   drop it (it was only test data). Production has no real wallet data yet, so this should be a non-issue —
   please confirm on your side.

## Separate recommendation (not changed here — your call)
In `Backend/Controllers/orderController.js`, the checkout redeem builds a **new random** `idempotencyKey`
each call:
```js
idempotencyKey: 'checkout_' + new mongoose.Types.ObjectId().toString(),
```
Because the key is different every time, a retried checkout request could **double-debit** points. Recommend
deriving it from something stable per redemption (e.g. `'checkout_' + orderId`) so a retry is a safe no-op.
Happy to prep this on the `Gautam` branch if you'd like.

## Test
1. `cd Backend && npm install && npm start` (needs `.env` with `MONGO_URI`, `JWT_SECRET`).
2. Log in, GET `/api/wallet` → returns balance + transactions.
3. In MongoDB, confirm the ledger collection is now **`wallet_transactions`**.
4. Place an order applying points → a `debit` row appears in `wallet_transactions`; balance drops.
