FitBox Sports – Premium Home Gym & Fitness Solutions

FitBox Sports is a leading provider of high-quality, durable, and affordable home gym equipment. Our mission is to make professional-grade fitness accessible to everyone, empowering individuals to achieve their health goals from the comfort of their own homes.
 Our Product Range

We specialize in versatile equipment designed for both beginners and seasoned athletes. Our core offerings include:

    Adjustable Dumbbell Sets: Ranging from 8kg to 40kg, featuring durable PVC/Rubber weight plates.

    Home Gym Combos: Comprehensive kits including straight rods, curl rods, and multiple weight configurations.

    Strength Training Accessories: High-quality dumbbell rods, gym bags, and essential workout gear.

    Specialized Kits: Targeted solutions like the "Intruder" series for heavy-duty strength training.

 Key Features

    Space-Efficient Design: Equipment engineered to provide a full-body workout without requiring a dedicated commercial space.

    Durability: Built with high-grade materials to withstand rigorous daily use.

    Versatility: Adjustable weights and modular rods allow for hundreds of exercise variations (Chest, Shoulders, Back, Biceps, and Legs).

    Affordability: Premium quality at a price point that makes home fitness a reality for every budget.

 Workout Guides

Our equipment is optimized for a variety of functional movements:

    Upper Body: Shoulder Press, Lateral Raises, Bicep Curls, and Tricep Extensions.

    Core & Back: DB Rowing and Weighted Planks.

    Lower Body: Squats, Lunges, and Romanian Deadlifts (RDL).

 Connect With Us

Stay updated on new product launches, fitness tips, and exclusive deals:

    Official Website: fitboxsports.com

    Customer Support: Available via the website for inquiries regarding orders, warranty, and assembly.

 The Application

This repository holds the storefront and its API:

- `Frontend/` — React + Vite. Product catalogue, Under ₹99 page, cart and
  checkout, customer account + wallet, configurable header ribbon and store
  content via `SettingsContext`.
- `Backend/` — Node/Express + Mongoose. Auth (email/password, OTP, Google),
  orders, PhonePe payment initiation and webhooks, Delhivery shipment creation
  and tracking, PDF invoice generation, and wallet redemption.

Deployed on Vercel (auto-deploys from `main`) at
`https://fit-box-sports-website-efns.vercel.app`. It shares one MongoDB Atlas
database and one customer account with the FitBox app and admin portal; auth is
this backend's JWT (payload `{ id }`, the customer's Mongo `_id`), which the app
backend verifies with the same `JWT_SECRET`.

 FitBox Points & Rewards

Customers earn FitBox Points through activity in the FitBox app (recording runs,
completing challenges). Points can be redeemed at checkout on this website:

- 1 point = ₹0.10 (ten paise).
- Points can cover up to 50% of an order's value; the rest is paid normally.
- Points carry no cash value and are non-transferable. Full terms are on the
  website Terms & Conditions page ("FitBox Points & Rewards").

Points redemption is handled in `Backend/Controllers/orderController.js`; the
wallet balance and ledger live in the shared MongoDB Atlas database (same
account as the FitBox app).

**The point value and the redemption cap are configured in the admin portal**
(admin → Website Settings → *FitBox Points*) and stored on the shared `settings`
document. Read them, never hardcode them:

- `Backend/Utils/points.js` → `getPointsConfig()` / `maxRedeemablePointsFor()`
- `Frontend/src/config/points.js` (defaults + helpers) via
  `usePoints()` from `SettingsContext`

The constants in those files are **fallbacks only**, used before settings load or
if the read fails. Changing the value in admin re-prices every point already
issued and updates the checkout clamp, the cart, the wallet page, the published
Terms clause and the mobile app at once — with no deploy and no app release.

A checkout rework once re-declared the value locally as ₹1 and shipped a 10×
over-valuation of every point, which is why it lives in one place.

Note the cart and checkout deliberately **do not state the redemption limit** —
they show "*Terms and conditions apply" linking to the Terms page, where the
current value and cap are rendered from the same config. The server clamps
regardless, so hiding the rule can't be exploited.

Customers can see their full ledger at `/account/wallet` (history, filter, CSV
export, save-as-PDF via the browser print dialog); the account page shows the
balance plus the last three transactions.

### Working in this repo alongside the app

Before starting a change, `git pull` — the app developer pushes to `main` here
too (auth, CORS, wallet, checkout points). Two things must not be broken:

- `X-Client` must stay in the CORS `allowedHeaders` in `Backend/server.js`.
  Removing it makes the browser preflight fail and **every website login breaks**
  with a generic network error. The header is how the admin portal tells website
  users from app users.
- The point value / 50% cap constants above.

If you cloned before 29 July 2026, re-clone or `git fetch origin && git reset
--hard origin/main` — history was rewritten then, and committing on top of the
old history duplicates commits when it merges.

 License

Information and branding materials are property of FitBox Sports. This repository serves as a digital footprint/documentation for the brand's online presence.

    "Work for progress, not perfection. Build your best self with FitBox Sports."
