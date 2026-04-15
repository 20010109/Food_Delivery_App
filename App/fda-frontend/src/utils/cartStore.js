// Simple localStorage-based cart store (per restaurant/store)

const LS_CART_KEY = "cart_v1";
const listeners = new Set();

function readCart() {
  try {
    const raw = localStorage.getItem(LS_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCart(cart) {
  localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
  listeners.forEach((fn) => fn());
}

export function subscribeCart(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getOrderType(storeId) {
  const cart = readCart();
  return cart?.[storeId]?.orderType || "delivery";
}

export function setOrderType(storeId, orderType) {
  const cart = readCart();
  const store = cart[storeId] || { items: [], orderType: "delivery" };
  cart[storeId] = { ...store, orderType };
  writeCart(cart);
}

export function getItemsForStore(storeId) {
  const cart = readCart();
  return cart?.[storeId]?.items || [];
}

export function addItemToCart({
  storeId,
  itemId,
  name,
  price,
  image_url,
  qty = 1,
  notes = "",
  unavailableAction = "remove",
}) {
  const cart = readCart();
  const store = cart[storeId] || { items: [], orderType: "delivery" };

  const existing = store.items.find((x) => x.itemId === itemId);
  let nextItems;

  if (existing) {
    nextItems = store.items.map((x) =>
      x.itemId === itemId
        ? {
            ...x,
            qty: x.qty + qty,
            notes: notes || x.notes,
            unavailableAction: unavailableAction || x.unavailableAction,
          }
        : x
    );
  } else {
    nextItems = [
      ...store.items,
      { itemId, name, price, image_url, qty, notes, unavailableAction },
    ];
  }

  cart[storeId] = { ...store, items: nextItems };
  writeCart(cart);
}

export function updateQty(storeId, itemId, nextQty) {
  const cart = readCart();
  const store = cart[storeId];
  if (!store) return;

  const qty = Math.max(0, Number(nextQty) || 0);

  const nextItems =
    qty === 0
      ? store.items.filter((x) => x.itemId !== itemId)
      : store.items.map((x) => (x.itemId === itemId ? { ...x, qty } : x));

  cart[storeId] = { ...store, items: nextItems };
  writeCart(cart);
}

export function calcSubtotalForStore(storeId) {
  const items = getItemsForStore(storeId);
  return items.reduce((sum, x) => sum + Number(x.price) * Number(x.qty), 0);
}