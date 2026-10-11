/* ============================================================
   FUAARK Shopping Assistant — dummy data (prototype)
   Catalog, prices and policies are grounded in a crawl of
   https://fuaark.com/ (Oct 2026). Orders, users & OTP are dummy.
   ============================================================ */

const DEMO_OTP = "246810";

/* ---------- Registered users (dummy) ---------- */

const USERS_DB = {
  "9876543210": {
    name: "Aarav Sharma",
    orders: [
      {
        id: "FUA-78412",
        status: "delivered",
        placedOn: "28 Sep 2026",
        deliveredOn: "2 Oct 2026",
        items: [
          { productId: "p-compression-black", name: "Compression T-shirt Black", size: "M", qty: 1, price: 1049 },
          { productId: "p-ankle-socks", name: "Classic Ankle Socks Black", size: "Free", qty: 2, price: 299 },
        ],
        total: 1647,
      },
      {
        id: "FUA-79120",
        status: "transit",
        placedOn: "6 Oct 2026",
        eta: "12 Oct 2026",
        items: [{ productId: "p-core-backpack", name: "Core Backpack Bag Black 30L", size: "30L", qty: 1, price: 1499 }],
        total: 1499,
      },
    ],
  },
  "9812345678": {
    name: "Priya Nair",
    orders: [
      {
        id: "FUA-79005",
        status: "delivered",
        placedOn: "30 Sep 2026",
        deliveredOn: "4 Oct 2026",
        items: [{ productId: "p-sports-bra", name: "Active Full Support Sports Bra Navy", size: "S", qty: 1, price: 1199 }],
        total: 1199,
      },
    ],
  },
};

/* ---------- Catalog ---------- */

const CATEGORIES = [
  {
    id: "men",
    label: "Men",
    icon: "🏋️",
    sub: [
      { id: "m-tshirts", label: "T-shirts" },
      { id: "m-stringers", label: "Stringers" },
      { id: "m-sweatshirts", label: "Sweatshirts & Pullovers" },
      { id: "m-jackets", label: "Jackets & Hoodies" },
      { id: "m-joggers", label: "Joggers & Track Pants" },
      { id: "m-shorts", label: "Shorts" },
    ],
  },
  {
    id: "women",
    label: "Women",
    icon: "🤸",
    sub: [
      { id: "w-tshirts", label: "T-shirts" },
      { id: "w-sports-bra", label: "Sports Bra" },
      { id: "w-tanks", label: "Tank Tops" },
      { id: "w-leggings", label: "Leggings & Bottoms" },
      { id: "w-hoodies", label: "Hoodies & Jackets" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    icon: "🎒",
    sub: [
      { id: "a-caps", label: "Caps" },
      { id: "a-bags", label: "Bags" },
      { id: "a-socks", label: "Socks" },
    ],
  },
];

const PRODUCTS = [
  // Men — T-shirts
  { id: "p-compression-black", cat: "m-tshirts", name: "Compression T-shirt Black", fit: "Compression Fit", price: 1049, mrp: 1749, rating: 4.8, sizes: ["S", "M", "L", "XL", "XXL"], hue: 14, desc: "Second-skin compression tee in breathable 4-way stretch knit. Wicks sweat fast, supports muscle movement and stays shape-true wash after wash." },
  { id: "p-compression-full-black", cat: "m-tshirts", name: "Compression Fullsleeves T-shirt Black", fit: "Compression Fit", price: 1099, mrp: 1899, rating: 4.7, sizes: ["S", "M", "L", "XL"], hue: 220, desc: "Full-sleeve compression layer for heavy lifts and cold morning runs. Flatlock seams, anti-odour finish and thumbhole-ready cuffs." },
  { id: "p-polo-black", cat: "m-tshirts", name: "Polo T-shirt Black", fit: "Slim Fit", price: 949, mrp: 1599, rating: 4.6, sizes: ["S", "M", "L", "XL", "XXL"], hue: 260, desc: "A gym-to-street polo with a soft structured collar and quick-dry piqué fabric. Sharp enough for brunch, stretchy enough for squats." },
  { id: "p-performance-black", cat: "m-tshirts", name: "Performance T-shirt Black", fit: "Slim Fit", price: 799, mrp: 1299, rating: 4.7, sizes: ["S", "M", "L", "XL"], hue: 160, desc: "The everyday workhorse. Lightweight performance knit with mesh zones under the arms and a hem that stays put through burpees." },
  { id: "p-contour-oversized", cat: "m-tshirts", name: "Contour Oversized T-shirt Dark Grey", fit: "Oversized", price: 1099, mrp: 1799, rating: 4.5, sizes: ["S", "M", "L", "XL"], hue: 30, desc: "Relaxed oversized drop-shoulder tee in heavyweight cotton-blend. Boxy drape, ribbed crew neck and tonal chest contour panel." },
  // Men — Stringers
  { id: "p-ribbed-tank", cat: "m-stringers", name: "Ribbed Tank Black", fit: "Slim Fit", price: 799, mrp: 1199, rating: 4.6, sizes: ["S", "M", "L", "XL"], hue: 340, desc: "Ribbed knit stringer with a deep-cut armhole for full range on presses and pulls. Stretch rib fabric hugs without squeezing." },
  { id: "p-deadlift-stringer", cat: "m-stringers", name: "DeadLift Stringer Beige", fit: "Regular Fit", price: 849, mrp: 1299, rating: 4.5, sizes: ["S", "M", "L", "XL"], hue: 40, desc: "Built for deadlift day. Extra-long back hem, racerback cut and a sand-washed beige tone that pairs with everything." },
  // Men — Sweatshirts
  { id: "p-thrive-pullover", cat: "m-sweatshirts", name: "Thrive Pullover Black", fit: "Slim Fit", price: 1249, mrp: 1999, rating: 4.7, sizes: ["S", "M", "L", "XL", "XXL"], hue: 200, desc: "Brushed-fleece pullover with a high collar and zipped pocket. Warm on the way in, breathable once you're moving." },
  // Men — Shorts
  { id: "p-2in1-shorts-black", cat: "m-shorts", name: "2 in 1 Compression Shorts Black", fit: "Compression Fit", price: 1149, mrp: 1899, rating: 4.8, sizes: ["S", "M", "L", "XL", "XXL"], hue: 190, desc: "Outer woven short over an inner compression short — one layer of support, zero chafe. Zip pocket fits a phone." },
  { id: "p-delta-cargo", cat: "m-shorts", name: "Delta Cargo Shorts Army Green", fit: "Regular Fit", price: 1299, mrp: 2099, rating: 4.5, sizes: ["S", "M", "L", "XL"], hue: 90, desc: "Ripstop cargo shorts with secure zip pockets and a gusseted crotch. From trail to training floor." },
  // Men — Joggers
  { id: "p-hybrid-tracks", cat: "m-joggers", name: "Hybrid Slim Tracks Black", fit: "Slim Fit", price: 1399, mrp: 2299, rating: 4.6, sizes: ["S", "M", "L", "XL"], hue: 280, desc: "Slim-tapered track pants in textured stretch knit. Zipped hems, deep pockets and a drawcord waist that stays flat under loads." },
  // Women — Sports bra
  { id: "p-sports-bra", cat: "w-sports-bra", name: "Active Full Support Sports Bra Navy", fit: "High Support", price: 1199, mrp: 1899, rating: 4.8, sizes: ["XS", "S", "M", "L"], hue: 230, desc: "High-impact support with molded cups, racerback straps and a wide underband. Tested for runs, jumps and heavy ropes." },
  // Women — Leggings
  { id: "p-highrise-leggings", cat: "w-leggings", name: "Active High Rise Leggings Navy", fit: "High Rise · Squat-proof", price: 1499, mrp: 2399, rating: 4.8, sizes: ["XS", "S", "M", "L", "XL"], hue: 250, desc: "Buttery-soft squat-proof leggings with a stay-put high waistband and hidden waist pocket. 4-way stretch, zero see-through." },
  // Women — Tanks
  { id: "p-brisk-crop", cat: "w-tanks", name: "Brisk Fuaark Cotton Crop Top Teal", fit: "Crop Fit", price: 699, mrp: 1099, rating: 4.5, sizes: ["XS", "S", "M", "L"], hue: 175, desc: "Soft cotton crop with a boxy cut and dropped armholes. Easy layer over any sports bra." },
  // Accessories
  { id: "p-camo-trucker", cat: "a-caps", name: "Camo Trucker Cap Olive", fit: "Adjustable", price: 499, mrp: 799, rating: 4.4, sizes: ["Free"], hue: 110, desc: "Structured camo trucker with a breathable mesh back and snap closure." },
  { id: "p-core-backpack", cat: "a-bags", name: "Core Backpack Bag Black 30L", fit: "30L · Laptop Sleeve", price: 1499, mrp: 2499, rating: 4.7, sizes: ["30L"], hue: 300, desc: "30L everyday training backpack with ventilated shoe tunnel, padded 15.6\" laptop sleeve and water-resistant shell." },
  { id: "p-duffle", cat: "a-bags", name: "Classic Duffle Bag Black", fit: "40L · Shoe Compartment", price: 1799, mrp: 2999, rating: 4.6, sizes: ["40L"], hue: 15, desc: "Weekender duffle with a separate ventilated shoe compartment, wet pocket and detachable shoulder strap." },
  { id: "p-ankle-socks", cat: "a-socks", name: "Classic Ankle Socks Black", fit: "Cushioned · 1 Pair", price: 299, mrp: 449, rating: 4.5, sizes: ["Free"], hue: 60, desc: "Cushioned ankle socks with arch compression and a tabbed heel to stop slipping mid-set." },
];

/* ---------- Static info ---------- */

const INFO = {
  returnPolicy: {
    title: "Return & Exchange Policy",
    points: [
      "Return or exchange within 7 days of delivery — requests after 7 days aren't accepted.",
      "One return / exchange per order.",
      "Wrong, missing, defective or damaged item? Report within 24 hours of delivery.",
      "Reverse pickup is arranged once approved (subject to pincode serviceability).",
      "No returns or exchanges on international orders.",
      "Defects must be reported within 7 days with images/videos to care@fuaark.com.",
    ],
    foot: "Full policy: fuaark.com/policies/refund-policy",
  },
  shipping: {
    title: "Shipping Information",
    points: [
      "Orders are dispatched within 1–2 business days.",
      "Delivery takes 4–6 business days across India.",
      "Free shipping on prepaid orders above ₹999 (otherwise ₹79 flat).",
      "Cash on Delivery available on orders up to ₹5,000.",
    ],
    foot: "Full policy: fuaark.com/policies/shipping-policy",
  },
  offers: {
    title: "Current Offers",
    points: [
      "GET10 — flat 10% off your first purchase.",
      "Final Sale — up to 50% off on selected styles.",
      "Free shipping on prepaid orders above ₹999.",
    ],
    foot: "Apply the code at checkout on fuaark.com",
  },
  support: {
    title: "Talk to a human",
    points: [
      "Email: care@fuaark.com (replies within 24 hours).",
      "Hours: Mon–Sat, 10am–6pm IST.",
      "For order issues, keep your Order ID handy.",
    ],
    foot: "This is a demo bot — no real agents are connected.",
  },
};

const FREE_TEXT_SUGGESTIONS = [
  "My orders",
  "Return policy",
  "Track order",
  "Offers",
  "Shop now",
  "Talk to human",
];

const RETURN_REASONS = ["Size too small", "Size too large", "Damaged / defective", "Wrong item received", "Changed my mind", "Quality not as expected"];

const PAYMENT_MODES = ["UPI", "Cash on Delivery", "Credit / Debit Card"];
