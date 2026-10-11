# FUAARK E-Shopping Chat Bot (Prototype)

A mobile-sized, iframe-embeddable shopping assistant for [fuaark.com](https://fuaark.com/) —
premium gymwear for men & women. Vanilla HTML/CSS/JS, **no build step, no backend — all data is dummy.**

The UI theme is matched to the live site: light `#ededed`/`#ffffff` surfaces, `#141416` ink,
Archivo + Montserrat typography, `#ef590c` orange accents and the `#dbff00` lime cart badge.

## Run it

```bash
cd e-shopping-chat-bot
python3 -m http.server 8080
# or: npx serve .
```

Open http://localhost:8080 — the chat block renders at phone size (400×740), and goes
full-bleed automatically inside small viewports.

## Embed in any website (iframe)

```html
<iframe
  src="https://your-host/e-shopping-chat-bot/index.html"
  style="width:400px; height:740px; border:0; border-radius:22px; box-shadow:0 24px 70px rgba(0,0,0,.25)"
  title="FUAARK Assistant"></iframe>
```

At ≤480px viewport width the block fills the iframe edge-to-edge, so the same URL works
for a full-screen mobile embed.

## Demo walkthrough

| Step | What happens |
|---|---|
| 1. Welcome | Chips offered immediately — no forced login: **Login with Mobile** · **Explore Products** · **Return Policy** · **Offers**. Typing also works. |
| 2. Explore (no login needed) | Men / Women / Accessories → sub-category → product cards with prices, ratings & discounts. |
| 3. Login gate | Adding to bag / orders / tracking / returns ask for login **once**, then resume exactly where the user left off (e.g. size picker reappears after OTP). |
| 4a. Returning user | `9876543210` or `9812345678` → greeted by name, then: **My Orders**, **Track Order**, **Return / Exchange**, **Product Description**, **Return Policy**, **Shipping Info**, **Offers**, **Shop Now**. |
| 4b. New user | Any other valid 10-digit number → welcome offer (GET10), then shop by category. |
| 5. Checkout | Bot asks name → address → pincode → payment mode (UPI / COD / Card) → order confirmation with Order ID; first order auto-applies 10% off. |

Free-text intents: *"my orders"*, *"track order"*, *"return policy"*, *"offers"*,
*"shop now"*, *"talk to human"* and more.

**Demo OTP:** `246810` (any 6 digits work — verification is dummy).

## What's real vs dummy

**Grounded in a live crawl of fuaark.com (Oct 2026):** collection names, product names,
fits, INR prices, the 7-day return/exchange policy, shipping times, and the GET10 offer.

**Dummy (prototype):** all users, orders, OTP verification, payments, return tickets,
checkout — the "database" lives in `js/data.js`.

## Project structure

```
e-shopping-chat-bot/
├── index.html        # Mobile-sized chat block (embeddable)
├── css/styles.css    # Theme matched to fuaark.com
├── js/data.js        # Dummy DB: users, orders, catalog, policies
└── js/app.js         # Chat engine: auth, gating, cart, flows, router
```

## Customising

- **Products / users / orders / OTP** → `js/data.js`
- **Welcome chips** → `bootChips()` in `js/app.js`
- **Logged-in menu buttons** → `homeChips()` in `js/app.js`
- **Free-text intents** → `routeFreeText()` in `js/app.js`
- **Colors / fonts** → `:root` variables in `css/styles.css`
