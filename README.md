# Chat-Bot: FUAARK E-Commerce Assistant

A mobile-sized, conversational shopping assistant prototype for [FUAARK](https://fuaark.com/) — premium gymwear & sports clothing for men and women.

---

## 🔗 Live Links
- 🚀 **Live Chatbot Application**: [https://sv96.github.io/Chat-Bot/ecommerce-chatbot-12/](https://sv96.github.io/Chat-Bot/ecommerce-chatbot-12/)
- 📱 **WhatsApp Screenshots Interactive Gallery**: [https://sv96.github.io/Chat-Bot/ecommerce-chatbot-12/whatsapp-preview/](https://sv96.github.io/Chat-Bot/ecommerce-chatbot-12/whatsapp-preview/)
- 📱 **WhatsApp Prototype Viewer**: [https://sv96.github.io/Chat-Bot/ChatbotPrototype/Whastapp/](https://sv96.github.io/Chat-Bot/ChatbotPrototype/Whastapp/)
- 🎬 **Video Preview Player**: [https://sv96.github.io/Chat-Bot/ChatbotPrototype/Website/](https://sv96.github.io/Chat-Bot/ChatbotPrototype/Website/)
- 📥 **Direct Video Download (MP4)**: [https://sv96.github.io/Chat-Bot/ChatbotPrototype/Website/fuaark-demo.mp4](https://sv96.github.io/Chat-Bot/ChatbotPrototype/Website/fuaark-demo.mp4)
- 🏠 **Root Redirect**: [https://sv96.github.io/Chat-Bot/](https://sv96.github.io/Chat-Bot/)

---

## Project Structure

```
Chat-Bot/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow for GitHub Pages deployment
├── ChatbotPrototype/           # Prototype assets and recordings
│   ├── Website/
│   │   ├── index.html          # Interactive video preview player
│   │   ├── fuaark-demo.mp4     # Faststart screen recording walkthrough (MP4)
│   │   └── WebsiteDemo*.png    # UI captures
│   └── Whastapp/
│       ├── index.html          # WhatsApp screenshots interactive viewer
│       └── whatsapp_*.png      # WhatsApp Business conversational flow mockups
├── ecommerce-chatbot-12/       # Main chatbot web application
│   ├── index.html              # Chatbot web interface
│   ├── css/
│   │   └── styles.css          # Theme matched to fuaark.com
│   ├── js/
│   │   ├── app.js              # Chat engine (auth, cart, flows, routing)
│   │   └── data.js             # Catalog, dummy users, orders, policies
│   ├── logo.png                # Circular FUAARK bot logo
│   ├── fuaarkScript.txt        # Full user-bot conversation script
│   ├── whatsapp-preview/       # Interactive WhatsApp preview gallery web app
│   └── whatsapp-ss/            # Quick alias redirect
├── index.html                  # Root entry redirect to ecommerce-chatbot-12/
└── README.md
```

## Features
- **Mobile-First & Embeddable**: Optimized for mobile screens and clean iframe integration.
- **Login & Gating**: OTP-based authentication (returning users with order history, new users with `GET10` offer).
- **Catalog Exploration**: Men's, women's, and accessories collections with ratings, filters, and size selection.
- **Cart & Checkout**: Conversational address capture, pincode validation, multiple payment methods (UPI, COD, Card).
- **Order Tracking & Returns**: Real-time status pipeline and 7-day return request flow with ticket generation.
- **WhatsApp Screenshots & Simulator**: Device simulator and gallery showcasing WhatsApp Business conversational flows.
- **Video Walkthrough**: Complete screen-recorded walkthrough previewable directly in browser.
