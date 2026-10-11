/* ============================================================
   FUAARK Shopping Assistant — chat engine (prototype)
   Vanilla JS, no build step. All data is dummy.
   ============================================================ */

"use strict";

/* ---------------- State ---------------- */

const state = {
  mobile: null,
  user: null,          // { name, orders: [] } — deep-copied from USERS_DB or created fresh
  cart: [],            // { productId, size, qty }
  awaiting: null,      // pending free-text handler key
  awaitingMobile: null,// active phone number prompt handler
  awaitingOtp: null,   // active OTP prompt handler
  checkout: {},        // temp checkout fields
  afterLogin: null,    // action to resume after a login gate
  busy: false,
};

/* ---------------- DOM refs ---------------- */

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("composer-input");
const sendBtn = document.getElementById("send-btn");
const bagBtn = document.getElementById("bag-btn");
const bagCountEl = document.getElementById("bag-count");
const restartBtn = document.getElementById("restart-btn");

/* ---------------- Utils ---------------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmt = (n) => "₹" + n.toLocaleString("en-IN");
const now = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function scrollBottom() {
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function catById(id) {
  for (const c of CATEGORIES) {
    const sub = c.sub.find((s) => s.id === id);
    if (sub) return { group: c, sub };
  }
  return null;
}

/* ---------------- Message primitives ---------------- */

function botAvatar() {
  return h(`<div class="msg-avatar"><img src="logo.png" alt="FUAARK" class="msg-avatar-img" /></div>`);
}

function addRow(who, node) {
  const row = h(`<div class="msg-row ${who}"></div>`);
  if (who === "bot") {
    row.appendChild(botAvatar());
  }
  const wrap = h(`<div></div>`);
  wrap.appendChild(node);
  wrap.appendChild(h(`<span class="msg-time">${now()}</span>`));
  row.appendChild(wrap);
  messagesEl.appendChild(row);
  scrollBottom();
  return row;
}

function bubble(text) {
  const b = h(`<div class="bubble"></div>`);
  b.textContent = text;
  return b;
}

function userSay(text) {
  addRow("user", bubble(text));
}

async function botSay(text, delay) {
  const row = h(`<div class="msg-row bot"></div>`);
  row.appendChild(botAvatar());
  const wrap = h(`<div></div>`);
  const typing = h(`<div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div>`);
  wrap.appendChild(typing);
  row.appendChild(wrap);
  messagesEl.appendChild(row);
  scrollBottom();

  await sleep(delay ?? 550 + Math.random() * 450);

  const bubbleEl = bubble(text);
  typing.replaceWith(bubbleEl);
  wrap.appendChild(h(`<span class="msg-time">${now()}</span>`));
  scrollBottom();
  return row;
}

function botWidget(node) {
  addRow("bot", node);
}

/* ---------------- Quick-reply options (rendered in chat body) ---------------- */

let activeOptionsEl = null;

function deactivateOptions() {
  if (!activeOptionsEl) return;
  activeOptionsEl.querySelectorAll(".opt-btn").forEach((b) => (b.disabled = true));
  activeOptionsEl = null;
}

function setChips(chips) {
  deactivateOptions();
  const bubble = h(`<div class="bubble options-bubble"></div>`);
  for (const c of chips) {
    const b = h(`<button class="opt-btn ${c.accent ? "accent" : ""}"></button>`);
    b.textContent = c.label;
    b.onclick = () => {
      if (b.disabled) return;
      if (c.silent !== true) userSay(c.label);
      deactivateOptions();
      c.run();
    };
    bubble.appendChild(b);
  }
  addRow("bot", bubble);
  activeOptionsEl = bubble;
}

function clearChips() {
  deactivateOptions();
}

function setComposer(enabled, placeholder) {
  inputEl.disabled = !enabled;
  sendBtn.disabled = !enabled;
  if (placeholder !== undefined) inputEl.placeholder = placeholder;
}

/* ---------------- Bag ---------------- */

function bagQty() {
  return state.cart.reduce((n, i) => n + i.qty, 0);
}

function refreshBag() {
  const q = bagQty();
  bagCountEl.hidden = q === 0;
  bagCountEl.textContent = q;
}

function addToCart(productId, size, qty = 1) {
  const line = state.cart.find((i) => i.productId === productId && i.size === size);
  if (line) line.qty += qty;
  else state.cart.push({ productId, size, qty });
  refreshBag();
}

/* ============================================================
   FLOWS
   ============================================================ */

/* ---------- Boot ---------- */

function bootChips() {
  setChips([
    { label: "🔐 Login with Mobile", accent: true, run: () => startLogin() },
    { label: "🛍️ Explore Products", run: () => shopFlow(true) },
    { label: "📋 Return Policy", run: () => showInfo(INFO.returnPolicy) },
    { label: "🏷️ Offers", run: () => showInfo(INFO.offers) },
  ]);
}

async function boot() {
  await botSay("Welcome to FUAARK ⚡", 650);
  await botSay(
    "Premium gymwear & sports clothing for men and women. I'm your shopping assistant — explore the collection right away, or login to track orders and shop.",
    650
  );
  setComposer(true, "Type a message…");
  bootChips();
}

/* ---------- Login: mobile ---------- */

async function startLogin(after) {
  setComposer(false);
  if (after) state.afterLogin = after;
  await botSay("Please enter your registered mobile number.", 400);

  const form = h(`
    <div class="bubble" style="min-width:280px">
      <div class="chat-form">
        <div class="phone-wrap">
          <span class="phone-prefix">+91</span>
          <input type="tel" maxlength="10" inputmode="numeric" placeholder="10-digit mobile number" />
        </div>
        <button class="cta-btn">Send OTP</button>
      </div>
    </div>`);

  const phoneInput = form.querySelector("input");
  const cta = form.querySelector(".cta-btn");

  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    phoneInput.classList.remove("err");
  });
  phoneInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") cta.click();
  });

  cta.onclick = async () => {
    const num = phoneInput.value;
    if (!/^[6-9]\d{9}$/.test(num)) {
      phoneInput.classList.add("err");
      return;
    }
    form.closest(".msg-row")?.remove();
    state.awaitingMobile = null;
    userSay("+91 " + num.replace(/(\d{5})(\d{5})/, "$1 $2"));
    state.mobile = num;
    await sendOtp(num);
  };

  botWidget(form);
  phoneInput.focus();
  setComposer(true, "10-digit mobile number…");
  state.awaitingMobile = { form, phoneInput, cta };
}

/* ---------- Login gate ---------- */

async function gate(msg, after) {
  await botSay(msg, 400);
  await startLogin(after);
}

/* ---------- Login: OTP ---------- */

async function sendOtp(mobile) {
  await botSay(`We have sent OTP to ${mobile}. Please enter OTP.`, 500);
  showOtpWidget();
}

function showOtpWidget() {
  const boxes = DEMO_OTP.split("")
    .map(() => `<input class="otp-box" type="text" inputmode="numeric" maxlength="1" autocomplete="one-time-code" />`)
    .join("");

  const widget = h(`
    <div class="bubble" style="min-width:300px">
      <div class="chat-form">
        <div class="otp-row">${boxes}</div>
        <div class="form-note">
          Didn't receive code? <b class="otp-resend">Resend OTP</b>
        </div>
        <button class="cta-btn" disabled>Verify &amp; Login</button>
      </div>
    </div>`);

  const inputs = [...widget.querySelectorAll(".otp-box")];
  const verifyBtn = widget.querySelector(".cta-btn");
  const resend = widget.querySelector(".otp-resend");

  const isComplete = () => inputs.every((i) => i.value.length === 1);
  const refresh = () => {
    inputs.forEach((i) => i.classList.toggle("filled", i.value.length === 1));
    verifyBtn.disabled = !isComplete();
  };

  inputs.forEach((box, idx) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\D/g, "").slice(0, 1);
      if (box.value && idx < inputs.length - 1) inputs[idx + 1].focus();
      refresh();
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && idx > 0) {
        inputs[idx - 1].focus();
        inputs[idx - 1].value = "";
        refresh();
      } else if (e.key === "ArrowLeft" && idx > 0) {
        inputs[idx - 1].focus();
      } else if (e.key === "ArrowRight" && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
      if (e.key === "Enter" && isComplete()) verifyBtn.click();
    });
    box.addEventListener("paste", (e) => {
      e.preventDefault();
      const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
      digits.split("").forEach((d, i) => {
        if (inputs[i]) inputs[i].value = d;
      });
      refresh();
      if (digits.length === 6) verifyBtn.focus();
    });
  });

  if (resend) {
    resend.onclick = async () => {
      userSay("Resend OTP");
      widget.closest(".msg-row")?.remove();
      state.awaitingOtp = null;
      await sendOtp(state.mobile);
    };
  }

  verifyBtn.onclick = async () => {
    if (!isComplete()) return;
    const typedOtp = inputs.map((i) => i.value).join("");
    widget.closest(".msg-row")?.remove();
    state.awaitingOtp = null;
    userSay(typedOtp);
    await verifyLogin();
  };

  botWidget(widget);
  inputs[0].focus();
  setComposer(true, "Enter 6-digit OTP…");
  state.awaitingOtp = { widget, inputs, verifyBtn };
}

async function verifyLogin() {
  await sleep(600);
  const dbUser = USERS_DB[state.mobile];
  state.user = dbUser
    ? JSON.parse(JSON.stringify(dbUser))
    : { name: null, orders: [] };

  if (dbUser) await returningUserFlow();
  else await newUserFlow();

  // Resume whatever the user was trying to do before the login gate
  const next = state.afterLogin;
  state.afterLogin = null;
  if (next) await next();
}

/* ---------- Returning user ---------- */

async function returningUserFlow() {
  const u = state.user;
  const n = u.orders.length;
  await botSay(`Verified ✅ Welcome back, ${u.name.split(" ")[0]}!`, 500);
  await botSay(
    n > 0
      ? `I can see you have ${n} order${n > 1 ? "s" : ""} with us. What would you like to do?`
      : `You have no past orders yet. Want to explore the collection?`,
    600
  );
  setComposer(true, "Type a message…");
  homeChips();
}

function homeChips() {
  const chips = [
    { label: "📦 My Orders", run: showOrders },
    { label: "🚚 Track Order", run: () => trackFlow() },
    { label: "🔄 Return / Exchange", run: () => returnFlow() },
    { label: "🔍 Product Description", run: productDescriptionFlow },
    { label: "📋 Return Policy", run: () => showInfo(INFO.returnPolicy) },
    { label: "🚛 Shipping Info", run: () => showInfo(INFO.shipping) },
    { label: "🏷️ Offers", run: () => showInfo(INFO.offers) },
    { label: "🛍️ Shop Now", run: () => shopFlow() },
  ];
  if (bagQty() > 0) chips.unshift({ label: `🛒 Bag (${bagQty()})`, accent: true, run: cartFlow });
  setChips(chips);
}

/* ---------- New user ---------- */

async function newUserFlow() {
  await botSay("Verified ✅ Welcome to FUAARK!", 500);
  await botSay(
    `Looks like you're new here. As a welcome gift, use code GET10 for flat 10% off your first order 🎉\n\nLet's find your fit — which collection would you like to explore?`,
    700
  );
  setComposer(true, "Type a message…");
  shopFlow(true);
}

/* ---------- Shopping ---------- */

async function shopFlow(fresh) {
  if (fresh !== true) await botSay("Which collection are you in the mood for?", 450);
  setChips(
    CATEGORIES.map((c) => ({
      label: `${c.icon} ${c.label}`,
      run: () => showSubCats(c),
    }))
  );
}

async function showSubCats(group) {
  await botSay(`${group.label} — great choice. Pick a category:`, 450);
  setChips([
    ...group.sub.map((s) => ({ label: s.label, run: () => listProducts(s.id) })),
    { label: "← All collections", run: () => shopFlow() },
  ]);
}

async function listProducts(catId) {
  const found = catById(catId);
  const items = PRODUCTS.filter((p) => p.cat === catId);
  await botSay(`Here's what's hot in ${found.sub.label} right now:`, 500);
  for (const p of items.slice(0, 4)) botWidget(productCard(p));
  setChips([
    { label: "← More categories", run: () => shopFlow() },
    ...(bagQty() ? [{ label: `🛒 Go to Bag (${bagQty()})`, accent: true, run: cartFlow }] : []),
  ]);
}

function productCard(p) {
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const card = h(`
    <div class="product-card">
      <div class="product-thumb" style="background:linear-gradient(150deg, hsl(${p.hue} 45% 26%), hsl(${p.hue + 30} 55% 14%))">${p.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-fit">${p.fit} · ★ ${p.rating}</div>
        <div class="product-price">${fmt(p.price)}<s>${fmt(p.mrp)}</s><span class="off">${off}% off</span></div>
        <div class="card-actions">
          <button class="mini-btn act-view">Details</button>
          <button class="mini-btn solid act-add">Add to Bag</button>
        </div>
      </div>
    </div>`);
  card.querySelector(".act-view").onclick = () => { userSay(`Details: ${p.name}`); productDetail(p.id); };
  card.querySelector(".act-add").onclick = () => { userSay("Add to Bag"); quickAdd(p.id); };
  return card;
}

async function quickAdd(productId) {
  const p = findProduct(productId);
  if (!state.user) {
    state.afterLogin = () => quickAdd(productId);
    await gate(`Please login to add "${p.name}" to your bag — it takes 10 seconds.`);
    return;
  }
  if (p.sizes.length === 1) {
    addToCart(p.id, p.sizes[0]);
    await botSay(`Added ${p.name} to your bag ✅`, 350);
    afterCart();
  } else {
    productDetail(productId, true);
  }
}

function afterCart() {
  setChips([
    { label: "🛒 View Bag", accent: true, run: cartFlow },
    { label: "🛍️ Continue Shopping", run: () => shopFlow() },
  ]);
}

async function productDetail(productId, pickSize = false) {
  const p = findProduct(productId);
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);

  const widget = h(`
    <div class="bubble" style="min-width:300px">
      <div style="display:flex;gap:14px;align-items:flex-start">
        <div class="product-thumb" style="width:72px;height:88px;background:linear-gradient(150deg, hsl(${p.hue} 45% 26%), hsl(${p.hue + 30} 55% 14%))">${p.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</div>
        <div>
          <strong style="font-family:var(--font-display)">${p.name}</strong>
          <div class="product-fit">${p.fit} · ★ ${p.rating} (2.1k reviews)</div>
          <div class="product-price">${fmt(p.price)} <s>${fmt(p.mrp)}</s> <span class="off">${off}% off</span></div>
        </div>
      </div>
      <p style="margin:12px 0;color:var(--muted);font-size:13px;line-height:1.7">${p.desc}</p>
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px">Select size</div>
      <div class="size-row">
        ${p.sizes.map((s) => `<button class="size-pill">${s}</button>`).join("")}
      </div>
      <button class="cta-btn act-addbag" style="margin-top:14px" disabled>Add to Bag</button>
    </div>`);

  let selected = null;
  const addBtn = widget.querySelector(".act-addbag");
  widget.querySelectorAll(".size-pill").forEach((pill) => {
    pill.onclick = () => {
      widget.querySelectorAll(".size-pill").forEach((x) => x.classList.remove("sel"));
      pill.classList.add("sel");
      selected = pill.textContent;
      addBtn.disabled = false;
    };
  });
  addBtn.onclick = async () => {
    if (!state.user) {
      addBtn.closest(".msg-row")?.remove();
      userSay(`${p.name} — Size ${selected}`);
      state.afterLogin = async () => {
        addToCart(p.id, selected);
        await botSay(`Added to your bag ✅ (${p.name}, Size ${selected})`, 350);
        afterCart();
      };
      await gate("Almost there! Please login to add items to your bag.");
      return;
    }
    addToCart(p.id, selected);
    addBtn.closest(".msg-row")?.remove();
    userSay(`${p.name} — Size ${selected}`);
    await botSay(`Added to your bag ✅ (${p.name}, Size ${selected})`, 350);
    afterCart();
  };

  botWidget(widget);
  if (pickSize) await botSay("Pick a size to add it to your bag:", 400);
}

/* ---------- Cart & checkout ---------- */

async function cartFlow() {
  if (!state.user) {
    return gate("Please login — then I can save your bag and place your order.", cartFlow);
  }
  if (state.cart.length === 0) {
    await botSay("Your bag is empty. Let's fix that — want to browse?", 400);
    return shopFlow();
  }

  const lines = state.cart.map((i) => {
    const p = findProduct(i.productId);
    return { ...i, p, lineTotal: p.price * i.qty };
  });
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const firstOrder = state.user.orders.length === 0;
  const discount = firstOrder ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  const widget = h(`
    <div class="order-card">
      <div class="order-head"><span class="order-id">Your Bag</span><span class="status-pill delivered">${bagQty()} item${bagQty() > 1 ? "s" : ""}</span></div>
      ${lines.map((l, idx) => `
        <div class="order-item">
          <span>${l.p.name} <small style="color:var(--muted)">(${l.size}) × ${l.qty}</small></span>
          <span>
            <b>${fmt(l.lineTotal)}</b>
            <button class="mini-btn act-rm" data-i="${idx}" style="margin-left:8px;padding:2px 8px">✕</button>
          </span>
        </div>`).join("")}
      <div class="order-item"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      ${firstOrder ? `<div class="order-item" style="color:var(--ok)"><span>Welcome offer GET10 (−10%)</span><span>− ${fmt(discount)}</span></div>` : ""}
      <div class="order-item"><span>Shipping</span><span>${shipping === 0 ? "FREE" : fmt(shipping)}</span></div>
      <div class="order-total"><span>Total</span><span>${fmt(total)}</span></div>
    </div>`);

  widget.querySelectorAll(".act-rm").forEach((btn) => {
    btn.onclick = () => {
      state.cart.splice(Number(btn.dataset.i), 1);
      refreshBag();
      btn.closest(".msg-row")?.remove();
      userSay("Remove item");
      cartFlow();
    };
  });

  botWidget(widget);
  setChips([
    { label: "✅ Checkout", accent: true, run: () => checkoutStart(total) },
    { label: "🛍️ Continue Shopping", run: () => shopFlow() },
    { label: "🗑️ Clear Bag", run: () => { state.cart = []; refreshBag(); userSay("Clear bag"); cartFlow(); } },
  ]);
}

async function checkoutStart(total) {
  await botSay(`Awesome — total payable is ${fmt(total)} (incl. taxes).\n\nFirst, what's your full name?`, 500);
  state.awaiting = "ck-name";
  inputEl.focus();
}

async function handleCheckoutStep(text, step) {
  if (step === "ck-name") {
    state.checkout.name = text.trim();
    state.user.name = state.checkout.name;
    state.awaiting = "ck-addr";
    await botSay(`Nice to meet you, ${state.checkout.name.split(" ")[0]}! 🙌\n\nWhere should we deliver? Please type your full address (house no, street, area, city, state).`, 450);
  } else if (step === "ck-addr") {
    if (text.trim().length < 12) {
      await botSay("That address looks a little short — please add your house/flat no., street, area and city.", 350);
      return;
    }
    state.checkout.address = text.trim();
    state.awaiting = "ck-pin";
    await botSay("Got it. And the 6-digit delivery pincode?", 400);
  } else if (step === "ck-pin") {
    if (!/^\d{6}$/.test(text.trim())) {
      await botSay("Please enter a valid 6-digit pincode (e.g. 560001).", 350);
      return;
    }
    state.checkout.pin = text.trim();
    state.awaiting = null;
    await botSay("Perfect. How would you like to pay?", 400);
    setChips(
      PAYMENT_MODES.map((m) => ({
        label: m,
        run: () => placeOrder(m),
      }))
    );
  }
}

async function placeOrder(mode) {
  const lines = state.cart.map((i) => ({ ...i, p: findProduct(i.productId) }));
  const subtotal = lines.reduce((n, l) => n + l.p.price * l.qty, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const discount = state.user.orders.length === 0 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;
  const orderId = "FUA-" + Math.floor(79000 + Math.random() * 900);

  const order = {
    id: orderId,
    status: "transit",
    placedOn: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    eta: new Date(Date.now() + 5 * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    items: lines.map((l) => ({ productId: l.p.id, name: l.p.name, size: l.size, qty: l.qty, price: l.p.price })),
    total,
  };

  state.user.orders.unshift(order);
  USERS_DB[state.mobile] = state.user; // persist for this session
  state.cart = [];
  refreshBag();

  const widget = h(`
    <div class="order-card" style="text-align:center">
      <div class="success-ring" style="margin:6px auto 10px">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <div class="order-id" style="font-size:16px">Order placed! 🎉</div>
      <p style="color:var(--muted);font-size:12.5px;margin:8px 0">Order <b style="color:var(--text)">${orderId}</b> · ${mode}<br/>Arriving by ${order.eta}</p>
      <div class="order-item"><span style="color:var(--muted)">Amount paid${mode === "Cash on Delivery" ? " (on delivery)" : ""}</span><span><b>${fmt(total)}</b></span></div>
      ${lines.map((l) => `<div class="order-item"><span>${l.p.name} (${l.size}) × ${l.qty}</span><span>${fmt(l.p.price * l.qty)}</span></div>`).join("")}
    </div>`);

  await botSay(`Payment via ${mode} confirmed ✅`, 500);
  botWidget(widget);
  await botSay("You'll get order updates on SMS & WhatsApp. Anything else I can help with?", 550);
  homeChips();
}

/* ---------- Orders ---------- */

function orderCard(o, withTrack = false) {
  const isDelivered = o.status === "delivered";
  const steps = ["Placed", "Packed", "Shipped", "Out for delivery", "Delivered"];
  const progress = isDelivered ? 5 : 3;

  const card = h(`
    <div class="order-card">
      <div class="order-head">
        <span class="order-id">${o.id}</span>
        <span class="status-pill ${isDelivered ? "delivered" : "transit"}">${isDelivered ? "Delivered" : "In transit"}</span>
      </div>
      ${o.items.map((i) => `<div class="order-item"><span>${i.name} <small style="color:var(--muted)">(${i.size}) × ${i.qty}</small></span><span>${fmt(i.price * i.qty)}</span></div>`).join("")}
      <div class="order-total"><span>Total</span><span>${fmt(o.total)}</span></div>
      ${withTrack && !isDelivered ? `
        <div class="track-steps">
          ${steps.map((s, i) => `<div class="track-step ${i < progress ? "done" : ""}">${s}</div>`).join("")}
        </div>
        <p style="font-size:11.5px;color:var(--muted);margin-top:8px">Placed ${o.placedOn} · Expected by <b style="color:var(--text)">${o.eta}</b></p>` : ""}
      ${isDelivered ? `<p style="font-size:11.5px;color:var(--muted);margin-top:8px">Delivered on ${o.deliveredOn}</p>` : ""}
      <div class="card-actions" style="margin-top:10px">
        ${!isDelivered ? `<button class="mini-btn act-track">Track</button>` : ""}
        <button class="mini-btn act-ret">Return / Exchange</button>
      </div>
    </div>`);

  const trk = card.querySelector(".act-track");
  if (trk) trk.onclick = () => { userSay(`Track ${o.id}`); trackFlow(o.id); };
  card.querySelector(".act-ret").onclick = () => { userSay(`Return / Exchange ${o.id}`); returnFlow(o.id); };
  return card;
}

async function showOrders() {
  if (!state.user) return gate("Login with your mobile number to see your orders.", showOrders);
  if (state.user.orders.length === 0) {
    await botSay("You have no orders yet. Ready to place your first one?", 400);
    return shopFlow();
  }
  await botSay(`Here ${state.user.orders.length > 1 ? "are" : "is"} your order product list 📦`, 450);
  for (const o of state.user.orders) botWidget(orderCard(o));
  homeChips();
}

async function trackFlow(orderId) {
  if (!state.user) return gate("Login with your mobile number to track your orders.", () => trackFlow(orderId));
  if (state.user.orders.length === 0) {
    await botSay("You have no orders to track yet.", 400);
    return shopFlow();
  }
  if (orderId) {
    const o = state.user.orders.find((x) => x.id === orderId);
    await botSay(`Tracking ${o.id}:`, 400);
    botWidget(orderCard(o, true));
    return homeChips();
  }
  await botSay("Which order would you like to track?", 400);
  setChips([
    ...state.user.orders.map((o) => ({
      label: `${o.id} · ${o.status === "delivered" ? "Delivered" : "In transit"}`,
      run: () => trackFlow(o.id),
    })),
    { label: "← Back", run: () => homeChips() },
  ]);
}

/* ---------- Returns ---------- */

async function returnFlow(orderId) {
  if (!state.user) return gate("Login with your mobile number to request a return or exchange.", () => returnFlow(orderId));
  if (state.user.orders.length === 0) {
    await botSay("You have no orders yet — nothing to return 🙂", 400);
    return shopFlow();
  }
  if (!orderId) {
    await botSay("Which order do you want to return or exchange?", 400);
    return setChips([
      ...state.user.orders.map((o) => ({ label: `${o.id} · ${o.placedOn}`, run: () => returnFlow(o.id) })),
      { label: "← Back", run: () => homeChips() },
    ]);
  }
  const order = state.user.orders.find((x) => x.id === orderId);
  await botSay(`Order ${order.id} — which item?`, 400);
  setChips([
    ...order.items.map((i) => ({
      label: `${i.name} (${i.size})`,
      run: () => returnReason(orderId, i),
    })),
    { label: "← Back", run: () => homeChips() },
  ]);
}

async function returnReason(orderId, item) {
  await botSay("What's the reason?", 350);
  setChips(
    RETURN_REASONS.map((r) => ({
      label: r,
      run: () => returnConfirm(orderId, item, r),
    }))
  );
}

async function returnConfirm(orderId, item, reason) {
  const ticket = "RTN-" + Math.floor(1000 + Math.random() * 9000);
  await botSay(`Got it — ${reason}.`, 350);
  botWidget(h(`
    <div class="info-block">
      <h4>Return request raised ✅</h4>
      <ul>
        <li>Ticket: <b>${ticket}</b></li>
        <li>Order: ${orderId}</li>
        <li>Item: ${item.name} (${item.size})</li>
        <li>Reason: ${reason}</li>
      </ul>
      <div class="foot">A reverse pickup will be arranged within 24–48 hrs (subject to pincode serviceability). Refund hits the source account in 5–7 business days after pickup & QC.</div>
    </div>`));
  homeChips();
}

/* ---------- Product description ---------- */

async function productDescriptionFlow() {
  await botSay("Which product would you like to know more about?", 400);
  setChips(
    PRODUCTS.slice(0, 8).map((p) => ({ label: p.name, run: () => describeProduct(p.id) }))
      .concat([{ label: "← Back", run: () => homeChips() }])
  );
}

async function describeProduct(productId) {
  const p = findProduct(productId);
  botWidget(h(`
    <div class="info-block">
      <h4>${p.name}</h4>
      <ul>
        <li>${p.fit} · ★ ${p.rating}</li>
        <li>Price: ${fmt(p.price)} <s>${fmt(p.mrp)}</s></li>
        <li>Sizes: ${p.sizes.join(", ")}</li>
      </ul>
      <div class="foot">${p.desc}</div>
    </div>`));
  setChips([
    { label: "🛒 Add to Bag", accent: true, run: () => quickAdd(p.id) },
    { label: "🔍 Another product", run: productDescriptionFlow },
    { label: "← Back", run: () => homeChips() },
  ]);
}

/* ---------- Info blocks ---------- */

async function showInfo(info) {
  botWidget(h(`
    <div class="info-block">
      <h4>${info.title}</h4>
      <ul>${info.points.map((pt) => `<li>${pt}</li>`).join("")}</ul>
      <div class="foot">${info.foot}</div>
    </div>`));
  homeChips();
}

/* ---------- Free text router ---------- */

async function routeFreeText(raw) {
  const text = raw.toLowerCase().trim();

  if (state.awaitingOtp) {
    if (text === "resend" || text === "resend otp") {
      const activeWidget = state.awaitingOtp.widget;
      state.awaitingOtp = null;
      activeWidget.closest(".msg-row")?.remove();
      await sendOtp(state.mobile);
      return;
    }
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 6) {
      const activeWidget = state.awaitingOtp.widget;
      state.awaitingOtp = null;
      activeWidget.closest(".msg-row")?.remove();
      setComposer(false);
      await verifyLogin();
      return;
    } else {
      await botSay("Please enter a valid 6-digit OTP.", 400);
      return;
    }
  }

  if (state.awaitingMobile) {
    const rawDigits = raw.replace(/\D/g, "");
    if (rawDigits.length === 10 && /^[6-9]/.test(rawDigits)) {
      const activeForm = state.awaitingMobile.form;
      state.awaitingMobile = null;
      activeForm.closest(".msg-row")?.remove();
      setComposer(false);
      state.mobile = rawDigits;
      await sendOtp(rawDigits);
      return;
    } else {
      await botSay("Please enter a valid 10-digit mobile number.", 400);
      return;
    }
  }

  if (state.awaiting) {
    const step = state.awaiting;
    state.awaiting = null;
    return handleCheckoutStep(raw.trim(), step).then(() => {
      // If the step handler rejected the input (validation), stay on the same step
      if (!state.awaiting) state.awaiting = step;
    });
  }

  if (!state.user && /^(login|log in|sign in)$/.test(text)) {
    return startLogin();
  }

  if (!state.user) {
    const rawDigits = raw.replace(/\D/g, "");
    if (rawDigits.length === 10 && /^[6-9]/.test(rawDigits)) {
      state.mobile = rawDigits;
      return sendOtp(rawDigits);
    }
  }

  const hasOrders = state.user && state.user.orders.length > 0;

  if (/\b(hi|hii+|hello|hey|namaste|yo)\b/.test(text) && text.length < 20) {
    await botSay(`Hey${state.user?.name ? " " + state.user.name.split(" ")[0] : ""}! 👋 How can I help today?`, 400);
    return state.user ? homeChips() : bootChips();
  }
  if (/track|where.*(order|package|delivery)|order status/.test(text)) return trackFlow();
  if (/order|purchase|history/.test(text)) return showOrders();
  if (/return|exchange|refund/.test(text)) return state.user && hasOrders ? returnFlow() : showInfo(INFO.returnPolicy);
  if (/polic/.test(text)) return showInfo(INFO.returnPolicy);
  if (/ship|deliver/.test(text)) return showInfo(INFO.shipping);
  if (/offer|discount|coupon|sale|deal|promo/.test(text)) return showInfo(INFO.offers);
  if (/bag|cart|checkout/.test(text)) return cartFlow();
  if (/desc|detail|about|info/.test(text)) return productDescriptionFlow();
  if (/human|agent|support|help|complaint/.test(text)) return showInfo(INFO.support);
  if (/shop|browse|buy|collection|men|women|accessor/.test(text)) return shopFlow();

  await botSay(
    "I'm a demo assistant, so I only understand a few things right now 🙂 Try one of these:",
    450
  );
  setChips(FREE_TEXT_SUGGESTIONS.map((s) => ({
    label: s,
    run: () => routeFreeText(s.toLowerCase()),
  })));
}

/* ---------------- Wiring ---------------- */

async function onSend() {
  const text = inputEl.value.trim();
  if (!text || state.busy) return;
  inputEl.value = "";
  userSay(text);
  state.busy = true;
  await routeFreeText(text);
  state.busy = false;
}

sendBtn.addEventListener("click", onSend);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !inputEl.disabled) onSend();
});

bagBtn.addEventListener("click", async () => {
  if (!state.user) {
    return gate("Login with your mobile number to view your bag.", cartFlow);
  }
  userSay("View bag");
  cartFlow();
});

restartBtn.addEventListener("click", () => location.reload());

/* ---------------- Go ---------------- */

messagesEl.appendChild(h(`<div class="day-divider">Today · Demo prototype · all data is dummy</div>`));
boot();
