```javascript
/* =========================================================
   FAMILY BAZAR
   STEP 3 — MAIN JAVASCRIPT
   File: script.js

   Features:
   - Cart count
   - Add to cart
   - Wishlist
   - Search
   - Product filtering
   - Toast notifications
   - Smooth navigation
   - Newsletter
   - Mobile navigation
   - LocalStorage
   ========================================================= */


/* =========================================================
   FAMILY BAZAR STORAGE
   ========================================================= */

const FB_STORAGE = {
  cart: "familyBazarCart",
  wishlist: "familyBazarWishlist",
  search: "familyBazarSearch"
};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let cart = loadStorage(FB_STORAGE.cart, []);
let wishlist = loadStorage(FB_STORAGE.wishlist, []);


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeFamilyBazar();
});


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeFamilyBazar() {
  updateCartCount();
  updateWishlistButtons();
  setupSearch();
  setupCartButtons();
  setupWishlistButtons();
  setupCategoryLinks();
  setupNavigation();
  setupNewsletter();
  setupHeroButtons();
  setupMobileNavigation();
  setupScrollEffects();
  setupImageFallbacks();
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return parsed;
  } catch (error) {
    console.warn("Family Bazar storage error:", error);
    return fallback;
  }
}


function saveStorage(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.warn("Family Bazar save error:", error);
  }
}


/* =========================================================
   CART
   ========================================================= */

function setupCartButtons() {
  const buttons = document.querySelectorAll(
    ".add-cart-btn, [data-add-cart]"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const card =
        button.closest(".product-card") ||
        button.closest("[data-product]");

      const product = getProductFromCard(card);

      addToCart(product);
    });
  });
}


function getProductFromCard(card) {
  if (!card) {
    return {
      id: createId(),
      name: "Family Bazar Product",
      price: 0,
      quantity: 1
    };
  }

  const id =
    card.dataset.productId ||
    card.getAttribute("data-id") ||
    createId();

  const nameElement =
    card.querySelector(
      ".product-name, [data-product-name]"
    );

  const priceElement =
    card.querySelector(
      ".product-price, [data-product-price]"
    );

  const imageElement =
    card.querySelector("img");

  const name =
    nameElement?.textContent?.trim() ||
    "Family Bazar Product";

  const priceText =
    priceElement?.textContent?.trim() ||
    "0";

  const price =
    extractNumber(priceText);

  const image =
    imageElement?.src || "";

  return {
    id,
    name,
    price,
    image,
    quantity: 1
  };
}


function addToCart(product) {
  const existingProduct =
    cart.find(
      (item) => String(item.id) === String(product.id)
    );

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push(product);
  }

  saveStorage(FB_STORAGE.cart, cart);

  updateCartCount();

  showToast(
    `${product.name} added to cart`
  );
}


function removeFromCart(productId) {
  cart = cart.filter(
    (item) =>
      String(item.id) !== String(productId)
  );

  saveStorage(FB_STORAGE.cart, cart);

  updateCartCount();
}


function changeCartQuantity(productId, quantity) {
  const product =
    cart.find(
      (item) =>
        String(item.id) === String(productId)
    );

  if (!product) {
    return;
  }

  product.quantity =
    Math.max(1, Number(quantity) || 1);

  saveStorage(FB_STORAGE.cart, cart);

  updateCartCount();
}


function clearCart() {
  cart = [];

  saveStorage(FB_STORAGE.cart, cart);

  updateCartCount();

  showToast("Cart cleared");
}


function getCartTotalItems() {
  return cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );
}


function getCartSubtotal() {
  return cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
      Number(item.quantity || 1),
    0
  );
}


function updateCartCount() {
  const count =
    getCartTotalItems();

  const elements =
    document.querySelectorAll(
      ".cart-count, [data-cart-count]"
    );

  elements.forEach((element) => {
    element.textContent = count;
  });
}


/* =========================================================
   CART OPEN BUTTON
   ========================================================= */

document.addEventListener("click", (event) => {
  const cartButton =
    event.target.closest(
      ".cart-btn, [data-cart-open]"
    );

  if (!cartButton) {
    return;
  }

  event.preventDefault();

  const cartPage =
    cartButton.getAttribute("href");

  if (
    cartPage &&
    cartPage !== "#" &&
    !cartPage.startsWith("javascript:")
  ) {
    window.location.href = cartPage;
    return;
  }

  showToast(
    `You have ${getCartTotalItems()} item(s) in your cart`
  );
});


/* =========================================================
   WISHLIST
   ========================================================= */

function setupWishlistButtons() {
  const buttons = document.querySelectorAll(
    ".wishlist-icon, [data-wishlist]"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const card =
        button.closest(".product-card") ||
        button.closest("[data-product]");

      const product =
        getProductFromCard(card);

      toggleWishlist(
        product,
        button
      );
    });
  });
}


function toggleWishlist(product, button) {
  const index =
    wishlist.findIndex(
      (item) =>
        String(item.id) ===
        String(product.id)
    );

  if (index === -1) {
    wishlist.push(product);

    button.classList.add("active");

    button.setAttribute(
      "aria-pressed",
      "true"
    );

    showToast(
      `${product.name} added to wishlist`
    );
  } else {
    wishlist.splice(index, 1);

    button.classList.remove("active");

    button.setAttribute(
      "aria-pressed",
      "false"
    );

    showToast(
      `${product.name} removed from wishlist`
    );
  }

  saveStorage(
    FB_STORAGE.wishlist,
    wishlist
  );
}


function updateWishlistButtons() {
  const buttons = document.querySelectorAll(
    ".wishlist-icon, [data-wishlist]"
  );

  buttons.forEach((button) => {
    const card =
      button.closest(".product-card") ||
      button.closest("[data-product]");

    const product =
      getProductFromCard(card);

    const exists =
      wishlist.some(
        (item) =>
          String(item.id) ===
          String(product.id)
      );

    button.classList.toggle(
      "active",
      exists
    );

    button.setAttribute(
      "aria-pressed",
      exists ? "true" : "false"
    );
  });
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
  const searchForms =
    document.querySelectorAll(
      ".search-box"
    );

  searchForms.forEach((form) => {
    const input =
      form.querySelector(
        "input"
      );

    const button =
      form.querySelector(
        "button"
      );

    if (input) {
      input.addEventListener(
        "input",
        () => {
          filterProducts(
            input.value.trim()
          );
        }
      );

      input.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            event.preventDefault();

            performSearch(
              input.value.trim()
            );
          }
        }
      );
    }

    if (button) {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          performSearch(
            input?.value?.trim() || ""
          );
        }
      );
    }
  });
}


function performSearch(query) {
  const cleanQuery =
    String(query || "").trim();

  if (!cleanQuery) {
    showToast(
      "Please enter a product name"
    );

    return;
  }

  saveStorage(
    FB_STORAGE.search,
    cleanQuery
  );

  filterProducts(cleanQuery);

  const productSection =
    document.querySelector(
      "#products, #best-selling, .products-section"
    );

  if (productSection) {
    productSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  showToast(
    `Searching for "${cleanQuery}"`
  );
}


function filterProducts(query) {
 
```
