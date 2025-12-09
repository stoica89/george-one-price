// Functionalitati magazin GeorgeOnePrice
// - gestiona cart cu localStorage
// - filtrare si cautare produse
// - feedback rapid pe butoane si anul curent in footer

const STORAGE_KEY = "gop_cart";
const DEFAULT_PRICE = 10; // pret unic per produs

const productCatalog = {
  1: {
    name: "Surubelnita universala",
    price: DEFAULT_PRICE,
    category: "unelte",
  },
  2: {
    name: "Saci de gunoi rezistenti",
    price: DEFAULT_PRICE,
    category: "consumabile",
  },
  3: {
    name: "Banda adeziva multifunctionala",
    price: DEFAULT_PRICE,
    category: "consumabile",
  },
  10: { name: "Patent universal", price: DEFAULT_PRICE, category: "unelte" },
  11: { name: "Set surubelnite", price: DEFAULT_PRICE, category: "unelte" },
  20: { name: "Saci de gunoi", price: DEFAULT_PRICE, category: "consumabile" },
  30: { name: "Lacat mic", price: DEFAULT_PRICE, category: "securitate" },
};

const qsAll = (selector) => Array.from(document.querySelectorAll(selector));

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch (err) {
    console.warn("Nu am putut citi cosul din localStorage", err);
    return fallback;
  }
}

function getCart() {
  return safeParse(localStorage.getItem(STORAGE_KEY), []);
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return `${value.toFixed(2)} lei`;
}

function updateCartCount(cart = getCart()) {
  const total = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  qsAll("#cart-count").forEach((node) => {
    node.textContent = total;
  });
}

function mergeProductData(id, card) {
  const catalogData = productCatalog[id] || {};
  if (!card) return catalogData;
  const name = card.querySelector("h3")?.textContent?.trim();
  const description = card.querySelector("p")?.textContent?.trim();
  return {
    ...catalogData,
    name: name || catalogData.name || `Produs #${id}`,
    description: description || catalogData.description,
  };
}

function addToCart(id, meta = {}) {
  const productId = Number(id);
  const catalogData = productCatalog[productId] || {};
  const baseProduct = {
    id: productId,
    name: meta.name || catalogData.name || `Produs #${productId}`,
    price: Number(meta.price || catalogData.price || DEFAULT_PRICE),
    category: meta.category || catalogData.category,
  };

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...baseProduct, qty: 1 });
  }

  saveCart(cart);
  updateCartCount(cart);
  renderCart();
}

function renderCart() {
  const tbody = document.getElementById("cart-items");
  if (!tbody) return;

  const cart = getCart();
  tbody.innerHTML = "";

  if (!cart.length) {
    tbody.innerHTML =
      '<tr class="cart-empty"><td colspan="5">Cosul tau este gol.</td></tr>';
    updateTotals(cart);
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <input type="number" min="1" value="${item.qty}" data-id="${
      item.id
    }" class="cart-qty" />
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>${formatPrice(item.price * item.qty)}</td>
      <td><button class="btn btn-small remove-from-cart" data-id="${
        item.id
      }">Sterge</button></td>
    `;
    tbody.appendChild(row);
  });

  updateTotals(cart);
}

function updateTotals(cart = getCart()) {
  const totals = cart.reduce(
    (acc, item) => {
      acc.items += item.qty || 0;
      acc.price += (item.qty || 0) * Number(item.price || DEFAULT_PRICE);
      return acc;
    },
    { items: 0, price: 0 }
  );

  const totalItemsEl = document.getElementById("cart-total-items");
  const totalPriceEl = document.getElementById("cart-total-price");

  if (totalItemsEl) totalItemsEl.textContent = totals.items;
  if (totalPriceEl) totalPriceEl.textContent = formatPrice(totals.price);
}

function handleCartInteractions() {
  const tbody = document.getElementById("cart-items");
  if (!tbody) return;

  tbody.addEventListener("input", (event) => {
    const input = event.target;
    if (!input.classList.contains("cart-qty")) return;

    const id = Number(input.dataset.id);
    const newQty = Math.max(1, Number(input.value) || 1);
    input.value = newQty;

    const cart = getCart();
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;

    item.qty = newQty;
    saveCart(cart);
    renderCart();
    updateCartCount(cart);
  });

  tbody.addEventListener("click", (event) => {
    const btn = event.target.closest(".remove-from-cart");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
    renderCart();
    updateCartCount(cart);
  });
}

function initAddToCartButtons() {
  qsAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.id;
      const card = btn.closest(".product-card");
      const meta = mergeProductData(productId, card);
      addToCart(productId, meta);

      const originalLabel = btn.textContent;
      btn.textContent = "Adaugat";
      btn.disabled = true;
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalLabel || "Adauga in cos";
      }, 1000);
    });
  });
}

function applyFilters() {
  const filterSelect = document.getElementById("categorie");
  const searchInput = document.getElementById("search");
  if (!filterSelect && !searchInput) return;

  const cards = qsAll(".product-card");
  const selectedCategory = filterSelect ? filterSelect.value : "toate";
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

  cards.forEach((card) => {
    const cardCategory = card.dataset.category || "toate";
    const text = `${card.querySelector("h3")?.textContent || ""} ${
      card.querySelector("p")?.textContent || ""
    }`
      .toLowerCase()
      .trim();

    const matchesCategory =
      selectedCategory === "toate" || cardCategory === selectedCategory;
    const matchesSearch = !searchTerm || text.includes(searchTerm);

    card.style.display = matchesCategory && matchesSearch ? "" : "none";
  });
}

function initFilters() {
  const filterSelect = document.getElementById("categorie");
  const searchInput = document.getElementById("search");
  if (filterSelect) filterSelect.addEventListener("change", applyFilters);
  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (filterSelect || searchInput) applyFilters();
}

function setCurrentYear() {
  qsAll("#year").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function initContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const nume = formData.get("nume") || "";
    const email = formData.get("email") || "";
    const mesaj = formData.get("mesaj") || "";

    const subject = encodeURIComponent(`Mesaj nou de la ${nume || "client"}`);
    const body = encodeURIComponent(
      `Nume: ${nume}\nEmail: ${email}\n\nMesaj:\n${mesaj}`
    );

    // Deschidem clientul de mail al utilizatorului cu detaliile precompletate
    window.location.href = `mailto:georgeoneprice@gmail.com?subject=${subject}&body=${body}`;

    form.reset();
    alert("Am deschis aplicația de e-mail cu mesajul precompletat.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  updateCartCount();
  initAddToCartButtons();
  initFilters();
  renderCart();
  handleCartInteractions();
  initContactForm();
});
