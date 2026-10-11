# Chat-Bot: FUAARK E-Commerce Assistant

A mobile-sized, conversational shopping assistant prototype for [FUAARK](https://fuaark.com/) — premium gymwear & sports clothing for men and women.

🚀 **Live Demo**: [https://sv96.github.io/Chat-Bot/ecommerce-chatbot-12/](https://sv96.github.io/Chat-Bot/ecommerce-chatbot-12/) (root redirect: [https://sv96.github.io/Chat-Bot/](https://sv96.github.io/Chat-Bot/))

---

## Project Structure

```
Chat-Bot/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow for GitHub Pages deployment
├── ecommerce-chatbot-12/       # Main application directory
│   ├── index.html              # Chatbot web interface
│   ├── css/
│   │   └── styles.css          # Theme matched to fuaark.com
│   ├── js/
│   │   ├── app.js              # Chat engine (auth, cart, flows, routing)
│   │   └── data.js             # Catalog, dummy users, orders, policies
│   ├── logo.png                # Circular FUAARK bot logo
│   ├── fuaarkScript.txt        # Full user-bot conversation script
│   ├── whatsapp_screenshots/   # WhatsApp Business UI flow mockups
│   └── README.md
├── index.html                  # Root entry redirect to ecommerce-chatbot-12/
└── README.md
```

## Features
- **Mobile-First & Embeddable**: Optimized for mobile screens and clean iframe integration.
- **Login & Gating**: OTP-based authentication (returning users with order history, new users with `GET10` offer).
- **Catalog Exploration**: Men's, women's, and accessories collections with ratings, filters, and size selection.
- **Cart & Checkout**: Conversational address capture, pincode validation, multiple payment methods (UPI, COD, Card).
- **Order Tracking & Returns**: Real-time status pipeline and 7-day return request flow with ticket generation.
- **WhatsApp Business Mockups**: Generated conversational screenshots matching WhatsApp Business interface.
