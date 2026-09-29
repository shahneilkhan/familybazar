```javascript
/* =========================================================
   FAMILY BAZAR
   Main JavaScript
   File: script.js

   Features:
   - Cart
   - Wishlist
   - Product search
   - Category filtering
   - Cart count
   - Wishlist count
   - LocalStorage
   - Newsletter
   - Mobile navigation
   - Header scroll effect
   - Toast notifications
   - Image fallback
   ========================================================= */

"use strict";

/* =========================================================
   01. STORAGE KEYS
   ========================================================= */

const STORAGE_KEYS = {
  cart: "familyBazarCart",
  wishlist: "familyBazarWishlist",
  search: "familyBazarSearch"
};


/* =========================================================
   02. GLOBAL STATE
   ========================================================= */

let cart = loadStorage(STORAGE_KEYS.cart, []);
let wishlist = loadStorage(STORAGE_KEYS.wishlist, []);
let activeCategory = "all";
let currentSearch = "";


/* =========================================================
   03. DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initSearch();
  initCartButtons();
  initWishlistButtons();
  initCategoryButtons();
  initNewsletter();
  initMobileNavigation();
  initHeaderScroll();
  initImageFallback();
  initNavigationLinks();

  updateCartUI();
  updateWishlistUI();

});


/* =========================================================
   04. STORAGE HELPERS
   ========================================================= */

function loadStorage(key, fallback) {

  try {

    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return parsed ?? fallback;

  } catch (error) {

    console.warn(
      "Family Bazar storage error:",
      error
    );

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

    console.warn(
      "Family Bazar save error:",
      error
    );

  }

}


/* =========================================================
   05. CART
   ========================================================= */

function initCartButtons() {

  document.addEventListener("click", (event) => {

    const button = event.target.closest(
      ".add-cart-btn"
    );

    if (!button) {
      return;
    }

    const productCard =
      button.closest(".product-card");

    if (!productCard) {
      return;
    }

    const product = getProductFromCard(
      productCard
    );

    if (!product.id) {

      showToast(
        "Product information not found.",
        "error"
      );

      return;
    }

    addToCart(product);

  });

}


function getProductFromCard(card) {

  const id =
    card.dataset.productId ||
    card.getAttribute("data-product-id") ||
    "";

  const title =
    card.dataset.productName ||
    card.querySelector(".product-title")?.textContent.trim() ||
    "Product";

  const priceElement =
    card.querySelector(".product-price");

  const oldPriceElement =
    card.querySelector(".product-old-price");

  const image =
    card.querySelector(
      ".product-image-wrap img"
    )?.src || "";

  const price =
    parsePrice(
      priceElement?.textContent || "0"
    );

  const oldPrice =
    parsePrice(
      oldPriceElement?.textContent || "0"
    );

  return {

    id: String(id),

    title,

    price,

    oldPrice,

    image,

    quantity: 1

  };

}


function parsePrice(value) {

  if (!value) {
    return 0;
  }

  const cleaned =
    String(value)
      .replace(/৳/g, "")
      .replace(/Tk/gi, "")
      .replace(/BDT/gi, "")
      .replace(/,/g, "")
      .replace(/[^\d.]/g, "");

  const number =
    Number.parseFloat(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;

}


function addToCart(product) {

  if (!product.id) {
    return;
  }

  const existing =
    cart.find(
      item => item.id === product.id
    );

  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({
      ...product,
      quantity: 1
    });

  }

  saveStorage(
    STORAGE_KEYS.cart,
    cart
  );

  updateCartUI();

  showToast(
    `${product.title} added to cart.`,
    "success"
  );

  animateCartButton(product.id);

}


function removeFromCart(productId) {

  const product =
    cart.find(
      item => item.id === productId
    );

  cart =
    cart.filter(
      item => item.id !== productId
    );

  saveStorage(
    STORAGE_KEYS.cart,
    cart
  );

  updateCartUI();

  if (product) {

    showToast(
      `${product.title} removed from cart.`,
      "warning"
    );

  }

}


function changeCartQuantity(
  productId,
  change
) {

  const item =
    cart.find(
      product => product.id === productId
    );

  if (!item) {
    return;
  }

  item.quantity += change;

  if (item.quantity <= 0) {

    removeFromCart(productId);

    return;
  }

  saveStorage(
    STORAGE_KEYS.cart,
    cart
  );

  updateCartUI();

}


function clearCart() {

  cart = [];

  saveStorage(
    STORAGE_KEYS.cart,
    cart
  );

  updateCartUI();

  showToast(
    "Cart cleared.",
    "success"
  );

}


function getCartCount() {

  return cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

}


function getCartSubtotal() {

  return cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
      Number(item.quantity || 0),
    0
  );

}


/* =========================================================
   06. CART UI
   ========================================================= */

function updateCartUI() {

  updateCartBadges();

  renderCartDrawer();

}


function updateCartBadges() {

  const count =
    getCartCount();

  const selectors = [

    "#cartCount",

    ".cart-count",

    "[data-cart-count]",

    ".mobile-cart-count"

  ];

  selectors.forEach(selector => {

    document
      .querySelectorAll(selector)
      .forEach(element => {

        element.textContent = count;

        if (count > 0) {

          element.classList.remove(
            "hidden"
          );

        }

      });

  });

}


function renderCartDrawer() {

  const container =
    document.querySelector(
      ".cart-items"
    );

  if (!container) {
    return;
  }

  if (!cart.length) {

    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to continue shopping.</p>
      </div>
    `;

    updateCartSubtotalUI();

    return;
  }

  container.innerHTML =
    cart.map(item => {

      const subtotal =
        Number(item.price || 0) *
        Number(item.quantity || 0);

      return `
        <div
          class="cart-item"
          data-cart-id="${escapeHTML(item.id)}"
        >

          <div class="cart-item-image">

            <img
              src="${escapeHTML(item.image || "")}"
              alt="${escapeHTML(item.title)}"
              loading="lazy"
            >

          </div>

          <div class="cart-item-info">

            <h3>
              ${escapeHTML(item.title)}
            </h3>

            <div class="cart-item-price">
              ৳${formatNumber(subtotal)}
            </div>

            <div class="cart-quantity">

              <button
                type="button"
                class="cart-minus"
                data-product-id="${escapeHTML(item.id)}"
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>
                ${item.quantity}
              </span>

              <button
                type="button"
                class="cart-plus"
                data-product-id="${escapeHTML(item.id)}"
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>

          </div>

          <button
            type="button"
            class="cart-remove"
            data-product-id="${escapeHTML(item.id)}"
            aria-label="Remove product"
          >
            ✕
          </button>

        </div>
      `;

    }).join("");

  updateCartSubtotalUI();

}


function updateCartSubtotalUI() {

  const subtotal =
    getCartSubtotal();

  const selectors = [

    ".cart-subtotal",

    "#cartSubtotal",

    "[data-cart-subtotal]"

  ];

  selectors.forEach(selector => {

    document
      .querySelectorAll(selector)
      .forEach(element => {

        element.textContent =
          `৳${formatNumber(subtotal)}`;

      });

  });

}


/* =========================================================
   07. CART DRAWER EVENTS
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const plus =
      event.target.closest(
        ".cart-plus"
      );

    if (plus) {

      const id =
        plus.dataset.productId;

      changeCartQuantity(id, 1);

      return;
    }


    const minus =
      event.target.closest(
        ".cart-minus"
      );

    if (minus) {

      const id =
        minus.dataset.productId;

      changeCartQuantity(id, -1);

      return;
    }


    const remove =
      event.target.closest(
        ".cart-remove"
      );

    if (remove) {

      const id =
        remove.dataset.productId;

      removeFromCart(id);

      return;
    }


    const cartTrigger =
      event.target.closest(
        "[data-open-cart], .cart-action"
      );

    if (cartTrigger) {

      openCartDrawer();

      return;
    }


    const closeTrigger =
      event.target.closest(
        "[data-close-cart], .cart-close"
      );

    if (closeTrigger) {

      closeCartDrawer();

      return;
    }


    const overlay =
      event.target.closest(
        ".cart-drawer-overlay"
      );

    if (
      overlay &&
      !event.target.closest(".cart-drawer")
    ) {

      closeCartDrawer();

    }

  }
);


function openCartDrawer() {

  const drawer =
    document.querySelector(
      ".cart-drawer"
    );

  const overlay =
    document.querySelector(
      ".cart-drawer-overlay"
    );

  if (!drawer) {
    return;
  }

  drawer.classList.add("active");

  overlay?.classList.add("active");

  document.body.classList.add(
    "no-scroll"
  );

}


function closeCartDrawer() {

  const drawer =
    document.querySelector(
      ".cart-drawer"
    );

  const overlay =
    document.querySelector(
      ".cart-drawer-overlay"
    );

  drawer?.classList.remove(
    "active"
  );

  overlay?.classList.remove(
    "active"
  );

  document.body.classList.remove(
    "no-scroll"
  );

}


/* =========================================================
   08. WISHLIST
   ========================================================= */

function initWishlistButtons() {

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          ".wishlist-btn"
        );

      if (!button) {
        return;
      }

      const card =
        button.closest(
          ".product-card"
        );

      if (!card) {
        return;
      }

      const product =
        getProductFromCard(card);

      toggleWishlist(product);

    }
  );

}


function toggleWishlist(product) {

  if (!product.id) {
    return;
  }

  const index =
    wishlist.findIndex(
      item => item.id === product.id
    );

  if (index >= 0) {

    wishlist.splice(index, 1);

    showToast(
      `${product.title} removed from wishlist.`,
      "warning"
    );

  } else {

    wishlist.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image
    });

    showToast(
      `${product.title} added to wishlist.`,
      "success"
    );

  }

  saveStorage(
    STORAGE_KEYS.wishlist,
    wishlist
  );

  updateWishlistUI();

}


function updateWishlistUI() {

  const count =
    wishlist.length;

  document
    .querySelectorAll(
      ".wishlist-btn"
    )
    .forEach(button => {

      const card =
        button.closest(
          ".product-card"
        );

      if (!card) {
        return;
      }

      const id =
        card.dataset.productId;

      const active =
        wishlist.some(
          item => item.id === id
        );

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        active
          ? "true"
          : "false"
      );

      const icon =
        button.querySelector(
          ".wishlist-icon"
        );

      if (icon) {

        icon.textContent =
          active ? "♥" : "♡";

      }

    });


  document
    .querySelectorAll(
      "#wishlistCount, .wishlist-count, [data-wishlist-count]"
    )
    .forEach(element => {

      element.textContent =
        count;

    });

}


/* =========================================================
   09. SEARCH
   ========================================================= */

function initSearch() {

  const forms =
    document.querySelectorAll(
      ".search-form"
    );

  forms.forEach(form => {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const input =
          form.querySelector(
            "input"
          );

        const value =
          input?.value.trim() || "";

        currentSearch =
          value.toLowerCase();

        saveStorage(
          STORAGE_KEYS.search,
          currentSearch
        );

        filterProducts();

        if (currentSearch) {

          scrollToProducts();

        }

      }
    );

  });


  const savedSearch =
    loadStorage(
      STORAGE_KEYS.search,
      ""
    );

  if (
    typeof savedSearch === "string" &&
    savedSearch.length
  ) {

    currentSearch =
      savedSearch;

  }

}


/* =========================================================
   10. PRODUCT FILTER
   ========================================================= */

function filterProducts() {

  const cards =
    document.querySelectorAll(
      ".product-card"
    );

  let visibleCount = 0;

  cards.forEach(card => {

    const title =
      (
        card.querySelector(
          ".product-title"
        )?.textContent || ""
      ).toLowerCase();

    const brand =
      (
        card.querySelector(
          ".product-brand"
        )?.textContent || ""
      ).toLowerCase();

    const category =
      (
        card.dataset.category || ""
      ).toLowerCase();

    const combined =
      `${title} ${brand} ${category}`;


    const searchMatch =
      !currentSearch ||
      combined.includes(
        currentSearch
      );


    const categoryMatch =
      activeCategory === "all" ||
      category ===
        activeCategory.toLowerCase();


    const show =
      searchMatch &&
      categoryMatch;


    card.classList.toggle(
      "filtered-out",
      !show
    );

    if (show) {
      visibleCount++;
    }

  });


  showSearchResultMessage(
    visibleCount
  );

}


function showSearchResultMessage(
  visibleCount
) {

  const grids =
    document.querySelectorAll(
      ".product-grid"
    );

  grids.forEach(grid => {

    const oldMessage =
      grid.querySelector(
        ".search-results-message"
      );

    oldMessage?.remove();


    if (
      currentSearch &&
      visibleCount === 0
    ) {

      const message =
        document.createElement(
          "div"
        );

      message.className =
        "search-results-message";

      message.innerHTML = `
        <strong>
          No products found.
        </strong>
        <br>
        Try another search.
      `;

      grid.appendChild(
        message
      );

    }

  });

}


/* =========================================================
   11. CATEGORY BUTTONS
   ========================================================= */

function initCategoryButtons() {

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-category]"
        );

      if (!button) {
        return;
      }

      const category =
        button.dataset.category;

      if (!category) {
        return;
      }

      activeCategory =
        category.toLowerCase();

      document
        .querySelectorAll(
          "[data-category]"
        )
        .forEach(item => {

          item.classList.toggle(
            "active",
            item.dataset.category.toLowerCase() ===
              activeCategory
          );

        });

      filterProducts();

      scrollToProducts();

    }
  );

}


/* =========================================================
   12. SCROLL TO PRODUCTS
   ========================================================= */

function scrollToProducts() {

  const section =
    document.querySelector(
      "#products, .products-section"
    );

  if (!section) {
    return;
  }

  const header =
    document.querySelector(
      ".site-header"
    );

  const headerHeight =
    header?.offsetHeight || 0;

  const position =
    section.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    15;

  window.scrollTo({
    top: Math.max(0, position),
    behavior: "smooth"
  });

}


/* =========================================================
   13. NAVIGATION
   ========================================================= */

function initNavigationLinks() {

  document.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest(
          'a[href^="#"]'
        );

      if (!link) {
        return;
      }

      const href =
        link.getAttribute("href");

      if (
        !href ||
        href === "#"
      ) {
        return;
      }

      const target =
        document.querySelector(
          href
        );

      if (!target) {
        return;
      }

      event.preventDefault();

      const header =
        document.querySelector(
          ".site-header"
        );

      const offset =
        header?.offsetHeight || 0;

      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        offset -
        10;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth"
      });

    }
  );

}


/* =========================================================
   14. MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {

  document.addEventListener(
    "click",
    event => {

      const item =
        event.target.closest(
          ".mobile-bottom-item"
        );

      if (!item) {
        return;
      }

      document
        .querySelectorAll(
          ".mobile-bottom-item"
        )
        .forEach(button => {

          button.classList.remove(
            "active"
          );

        });

      item.classList.add(
        "active"
      );

    }
  );

}


/* =========================================================
   15. HEADER SCROLL EFFECT
   ========================================================= */

function initHeaderScroll() {

  const header =
    document.querySelector(
      ".site-header"
    );

  if (!header) {
    return;
  }

  const update =
    () => {

      header.classList.toggle(
        "scrolled",
        window.scrollY > 20
      );

    };

  update();

  window.addEventListener(
    "scroll",
    update,
    {
      passive: true
    }
  );

}


/* =========================================================
   16. NEWSLETTER
   ========================================================= */

function initNewsletter() {

  const forms =
    document.querySelectorAll(
      ".newsletter-form"
    );

  forms.forEach(form => {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const input =
          form.querySelector(
            "input[type='email']"
          );

        if (!input) {
          return;
        }

        const email =
          input.value.trim();

        if (!isValidEmail(email)) {

          showToast(
            "Please enter a valid email address.",
            "error"
          );

          input.focus();

          return;
        }

        let subscribers =
          loadStorage(
            "familyBazarNewsletter",
            []
          );

        if (
          !Array.isArray(
            subscribers
          )
        ) {

          subscribers = [];

        }

        const exists =
          subscribers.some(
            item =>
              item.toLowerCase() ===
              email.toLowerCase()
          );

        if (exists) {

          showToast(
            "You are already subscribed.",
            "warning"
          );

        } else {

          subscribers.push(email);

          saveStorage(
            "familyBazarNewsletter",
            subscribers
          );

          showToast(
            "Thank you for subscribing!",
            "success"
          );

        }

        form.reset();

      }
    );

  });

}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );

}


/* =========================================================
   17. IMAGE FALLBACK
   ========================================================= */

function initImageFallback() {

  document.addEventListener(
    "error",
    event => {

      const image =
        event.target;

      if (
        image.tagName !==
        "IMG"
      ) {
        return;
      }

      if (
        image.dataset.fallbackApplied
      ) {
        return;
      }

      image.dataset.fallbackApplied =
        "true";

      image.src =
        createFallbackImage(
          image.alt ||
          "Family Bazar"
        );

    },
    true
  );

}


function createFallbackImage(
  text
) {

  const safeText =
    String(text)
      .replace(/[<>&"]/g, "")
      .slice(0, 35);

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="600"
      height="600"
      viewBox="0 0 600 600"
    >
      <rect
        width="600"
        height="600"
        fill="#eef8f1"
      />

      <circle
        cx="300"
        cy="245"
        r="95"
        fill="#d9f0e1"
      />

      <text
        x="300"
        y="265"
        text-anchor="middle"
        font-size="70"
      >
        🛒
      </text>

      <text
        x="300"
        y="390"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="28"
        font-weight="700"
        fill="#0f8f4f"
      >
        ${safeText}
      </text>

    </svg>
  `;

  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg)
  );

}


/* =========================================================
   18. CART BUTTON ANIMATION
   ========================================================= */

function animateCartButton(
  productId
) {

  const buttons =
    document.querySelectorAll(
      `.product-card[data-product-id="${CSS.escape(productId)}"] .add-cart-btn`
    );

  buttons.forEach(button => {

    const original =
      button.innerHTML;

    button.classList.add(
      "added"
    );

    button.innerHTML =
      "✓ Added to Cart";

    setTimeout(() => {

      button.classList.remove(
        "added"
      );

      button.innerHTML =
        original;

    }, 1200);

  });

}


/* =========================================================
   19. TOAST
   ========================================================= */

function showToast(
  message,
  type = "success"
) {

  let container =
    document.querySelector(
      ".toast-container"
    );

  if (!container) {

    container =
      document.createElement(
        "div"
      );

    container.className =
      "toast-container";

    document.body.appendChild(
      container
    );

  }

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `toast ${type}`;

  let icon = "✓";

  if (type === "error") {
    icon = "!";
  }

  if (type === "warning") {
    icon = "!";
  }

  toast.innerHTML = `
    <span>
      ${icon}
    </span>

    <span>
      ${escapeHTML(message)}
    </span>
  `;

  container.appendChild(
    toast
  );

  setTimeout(() => {

    toast.classList.add(
      "hide"
    );

    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 2800);

}


/* =========================================================
   20. FORMAT NUMBER
   ========================================================= */

function formatNumber(
  number
) {

  const value =
    Number(number || 0);

  return value.toLocaleString(
    "en-BD",
    {
      maximumFractionDigits: 2
    }
  );

}


/* =========================================================
   21. ESCAPE HTML
   ========================================================= */

function escapeHTML(
  value
) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   22. KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape"
    ) {

      closeCartDrawer();

    }

  }
);


/* =========================================================
   23. CHECKOUT BUTTON
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const checkout =
      event.target.closest(
        ".checkout-btn"
      );

    if (!checkout) {
      return;
    }

    if (!cart.length) {

      showToast(
        "Your cart is empty.",
        "warning"
      );

      return;
    }

    /*
      Step 7 will connect this
      to checkout.html.
    */

    window.location.href =
      "checkout.html";

  }
);


/* =========================================================
   24. PRODUCT CARD QUICK DATA
   ========================================================= */

function getCart() {

  return [...cart];

}


function getWishlist() {

  return [...wishlist];

}


/* =========================================================
   25. PUBLIC FAMILY BAZAR API
   ========================================================= */

window.FamilyBazar = {

  cart: {

    get: getCart,

    add: addToCart,

    remove: removeFromCart,

    increase: productId =>
      changeCartQuantity(
        productId,
        1
      ),

    decrease: productId =>
      changeCartQuantity(
        productId,
        -1
      ),

    clear: clearCart,

    count: getCartCount,

    subtotal: getCartSubtotal

  },

  wishlist: {

    get: getWishlist,

    toggle: toggleWishlist

  },

  search: {

    set: value => {

      currentSearch =
        String(value || "")
          .trim()
          .toLowerCase();

      filterProducts();

    },

    get: () =>
      currentSearch

  },

  category: {

    set: category => {

      activeCategory =
        String(category || "all")
          .toLowerCase();

      filterProducts();

    },

    get: () =>
      activeCategory

  },

  toast: showToast,

  cartDrawer: {

    open: openCartDrawer,

    close: closeCartDrawer

  }

};


/* =========================================================
   26. INITIAL FILTER
   ========================================================= */

setTimeout(() => {

  if (
    currentSearch ||
    activeCategory !== "all"
  ) {

    filterProducts();

  }

}, 0);


/* =========================================================
   FAMILY BAZAR JS — END
   ========================================================= */
```
