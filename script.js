/* =========================================================
   FAMILY BAZAR
   ULTRA PREMIUM JAVASCRIPT
   Complete script.js
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const FamilyBazar = {
  cart: JSON.parse(localStorage.getItem("familyBazarCart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("familyBazarWishlist") || "[]"),
  products: [],
  currency: "৳"
};

/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveCart() {
  localStorage.setItem(
    "familyBazarCart",
    JSON.stringify(FamilyBazar.cart)
  );
}

function saveWishlist() {
  localStorage.setItem(
    "familyBazarWishlist",
    JSON.stringify(FamilyBazar.wishlist)
  );
}

/* =========================================================
   MONEY
   ========================================================= */

function formatPrice(price) {
  const number = Number(price) || 0;

  return FamilyBazar.currency +
    number.toLocaleString("en-BD", {
      maximumFractionDigits: 0
    });
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
  let toast = $(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.familyBazarToastTimer);

  window.familyBazarToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {
  const menuToggle = $(".menu-toggle");
  const navLinks = $(".nav-links");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    const isOpen = navLinks.classList.contains("active");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  $$(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", event => {
    if (
      !navLinks.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      navLinks.classList.remove("active");
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* =========================================================
   HEADER SCROLL EFFECT
   ========================================================= */

function initHeaderScroll() {
  const header = $(".site-header");

  if (!header) return;

  const updateHeader = () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  updateHeader();

  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );
}

/* =========================================================
   SCROLL TO TOP
   ========================================================= */

function initScrollTop() {
  let button = $(".scroll-top");

  if (!button) {
    button = document.createElement("button");
    button.className = "scroll-top";
    button.type = "button";
    button.innerHTML = "↑";
    button.setAttribute("aria-label", "Scroll to top");

    document.body.appendChild(button);
  }

  const update = () => {
    if (window.scrollY > 500) {
      button.classList.add("show");
    } else {
      button.classList.remove("show");
    }
  };

  window.addEventListener(
    "scroll",
    update,
    { passive: true }
  );

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  update();
}

/* =========================================================
   REVEAL ANIMATION
   ========================================================= */

function initRevealAnimations() {
  const elements = $$(".reveal");

  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach(el => {
      el.classList.add("visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  elements.forEach(element => {
    observer.observe(element);
  });
}

/* =========================================================
   PRODUCT DATA
   ========================================================= */

function collectProducts() {
  const cards = $$(".product-card");

  FamilyBazar.products = cards.map((card, index) => {
    const name =
      $(".product-name", card)?.textContent.trim() ||
      `Product ${index + 1}`;

    const priceText =
      $(".current-price", card)?.textContent || "0";

    const price =
      Number(
        priceText
          .replace(/[^\d.]/g, "")
      ) || 0;

    const image =
      $(".product-image img", card)?.src || "";

    const category =
      $(".product-category", card)?.textContent.trim() || "";

    const id =
      card.dataset.productId ||
      `product-${index + 1}`;

    card.dataset.productId = id;

    return {
      id,
      name,
      price,
      image,
      category
    };
  });
}

/* =========================================================
   CART
   ========================================================= */

function getCartQuantity() {
  return FamilyBazar.cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );
}

function getCartTotal() {
  return FamilyBazar.cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
      Number(item.quantity || 0),
    0
  );
}

function addToCart(product) {
  if (!product) return;

  const existing = FamilyBazar.cart.find(
    item => item.id === product.id
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    FamilyBazar.cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  updateCartCount();

  showToast(`${product.name} added to cart`);
}

function removeFromCart(id) {
  FamilyBazar.cart =
    FamilyBazar.cart.filter(
      item => item.id !== id
    );

  saveCart();
  renderCart();
  updateCartCount();
}

function changeCartQuantity(id, amount) {
  const item = FamilyBazar.cart.find(
    product => product.id === id
  );

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
  updateCartCount();
}

function clearCart() {
  FamilyBazar.cart = [];

  saveCart();
  renderCart();
  updateCartCount();
}

/* =========================================================
   CART COUNT
   ========================================================= */

function updateCartCount() {
  const count = getCartQuantity();

  $$(".cart-count").forEach(element => {
    element.textContent = count;
  });
}

/* =========================================================
   CART DRAWER
   ========================================================= */

function createCartDrawer() {
  let drawer = $(".cart-drawer");
  let overlay = $(".cart-overlay");

  if (!drawer) {
    drawer = document.createElement("aside");

    drawer.className = "cart-drawer";

    drawer.innerHTML = `
      <div class="cart-header">
        <h2>Your Cart</h2>
        <button
          class="cart-close"
          type="button"
          aria-label="Close cart"
        >
          ✕
        </button>
      </div>

      <div class="cart-items"></div>

      <div class="cart-footer">
        <div class="cart-total">
          <span>Total</span>
          <strong class="cart-total-value">৳0</strong>
        </div>

        <button
          class="btn btn-dark cart-checkout"
          type="button"
        >
          Proceed to Checkout
        </button>
      </div>
    `;

    document.body.appendChild(drawer);
  }

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "cart-overlay";
    document.body.appendChild(overlay);
  }

  return {
    drawer,
    overlay
  };
}

function openCart() {
  const { drawer, overlay } =
    createCartDrawer();

  renderCart();

  drawer.classList.add("active");
  overlay.classList.add("active");

  document.body.style.overflow = "hidden";
}

function closeCart() {
  const drawer = $(".cart-drawer");
  const overlay = $(".cart-overlay");

  if (drawer) {
    drawer.classList.remove("active");
  }

  if (overlay) {
    overlay.classList.remove("active");
  }

  document.body.style.overflow = "";
}

function renderCart() {
  const { drawer } =
    createCartDrawer();

  const container =
    $(".cart-items", drawer);

  const totalElement =
    $(".cart-total-value", drawer);

  if (!container) return;

  if (!FamilyBazar.cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some beautiful products to your cart.</p>
      </div>
    `;

    if (totalElement) {
      totalElement.textContent = "৳0";
    }

    return;
  }

  container.innerHTML =
    FamilyBazar.cart
      .map(item => `
        <div
          class="cart-item"
          data-cart-id="${escapeHtml(item.id)}"
        >
          <div class="cart-item-image">
            ${
              item.image
                ? `<img
                    src="${escapeHtml(item.image)}"
                    alt="${escapeHtml(item.name)}"
                    loading="lazy"
                  >`
                : ""
            }
          </div>

          <div>
            <h4>${escapeHtml(item.name)}</h4>

            <p>
              ${formatPrice(item.price)}
              × ${item.quantity}
            </p>

            <div
              style="
                display:flex;
                align-items:center;
                gap:6px;
                margin-top:8px;
              "
            >
              <button
                type="button"
                class="quantity-minus"
                data-id="${escapeHtml(item.id)}"
                style="
                  width:26px;
                  height:26px;
                  border:0;
                  border-radius:6px;
                  background:#f1f2ee;
                "
              >−</button>

              <span
                style="
                  min-width:25px;
                  text-align:center;
                  font-size:11px;
                  font-weight:700;
                "
              >
                ${item.quantity}
              </span>

              <button
                type="button"
                class="quantity-plus"
                data-id="${escapeHtml(item.id)}"
                style="
                  width:26px;
                  height:26px;
                  border:0;
                  border-radius:6px;
                  background:#f1f2ee;
                "
              >+</button>
            </div>
          </div>

          <button
            type="button"
            class="remove-item"
            data-id="${escapeHtml(item.id)}"
            aria-label="Remove ${escapeHtml(item.name)}"
          >
            ✕
          </button>
        </div>
      `)
      .join("");

  if (totalElement) {
    totalElement.textContent =
      formatPrice(getCartTotal());
  }
}

/* =========================================================
   CART EVENTS
   ========================================================= */

function initCart() {
  createCartDrawer();
  updateCartCount();
  renderCart();

  document.addEventListener("click", event => {

    const cartButton =
      event.target.closest(
        ".cart-btn, [data-cart-open]"
      );

    if (cartButton) {
      event.preventDefault();
      openCart();
      return;
    }

    const closeButton =
      event.target.closest(
        ".cart-close"
      );

    if (closeButton) {
      closeCart();
      return;
    }

    if (
      event.target.classList.contains(
        "cart-overlay"
      )
    ) {
      closeCart();
      return;
    }

    const removeButton =
      event.target.closest(
        ".remove-item"
      );

    if (removeButton) {
      removeFromCart(
        removeButton.dataset.id
      );

      showToast("Product removed");
      return;
    }

    const plusButton =
      event.target.closest(
        ".quantity-plus"
      );

    if (plusButton) {
      changeCartQuantity(
        plusButton.dataset.id,
        1
      );
      return;
    }

    const minusButton =
      event.target.closest(
        ".quantity-minus"
      );

    if (minusButton) {
      changeCartQuantity(
        minusButton.dataset.id,
        -1
      );
      return;
    }

    const checkoutButton =
      event.target.closest(
        ".cart-checkout"
      );

    if (checkoutButton) {
      handleCheckout();
    }
  });
}

/* =========================================================
   ADD TO CART BUTTONS
   ========================================================= */

function initAddToCart() {
  $$(".add-cart").forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();

        const card =
          button.closest(".product-card");

        if (!card) return;

        const product =
          productFromCard(card);

        addToCart(product);

        button.textContent =
          "✓ Added";

        button.classList.add("added");

        setTimeout(() => {
          button.textContent =
            "Add to Cart";

          button.classList.remove("added");
        }, 1300);
      }
    );
  });
}

function productFromCard(card) {
  const id =
    card.dataset.productId ||
    `product-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

  card.dataset.productId = id;

  const name =
    $(".product-name", card)?.textContent.trim() ||
    "Product";

  const priceText =
    $(".current-price", card)?.textContent || "0";

  const price =
    Number(
      priceText.replace(/[^\d.]/g, "")
    ) || 0;

  const image =
    $(".product-image img", card)?.src || "";

  const category =
    $(".product-category", card)?.textContent.trim() ||
    "";

  return {
    id,
    name,
    price,
    image,
    category
  };
}

/* =========================================================
   WISHLIST
   ========================================================= */

function initWishlist() {

  $$(".product-wishlist").forEach(button => {

    const card =
      button.closest(".product-card");

    if (!card) return;

    const product =
      productFromCard(card);

    updateWishlistButton(
      button,
      product.id
    );

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();

        const id = product.id;

        const exists =
          FamilyBazar.wishlist.includes(id);

        if (exists) {

          FamilyBazar.wishlist =
            FamilyBazar.wishlist.filter(
              item => item !== id
            );

          showToast("Removed from wishlist");

        } else {

          FamilyBazar.wishlist.push(id);

          showToast("Added to wishlist");
        }

        saveWishlist();

        updateWishlistButton(
          button,
          id
        );
      }
    );
  });
}

function updateWishlistButton(button, id) {

  const active =
    FamilyBazar.wishlist.includes(id);

  button.textContent =
    active ? "♥" : "♡";

  button.setAttribute(
    "aria-pressed",
    String(active)
  );
}

/* =========================================================
   SEARCH MODAL
   ========================================================= */

function createSearchModal() {

  let modal = $(".search-modal");

  if (modal) return modal;

  modal = document.createElement("div");

  modal.className = "search-modal";

  modal.innerHTML = `
    <div class="search-box">

      <div class="search-box-header">

        <span
          style="
            font-size:20px;
            color:#0d5c45;
          "
        >
          ⌕
        </span>

        <input
          type="search"
          class="site-search-input"
          placeholder="Search products..."
          autocomplete="off"
        >

        <button
          class="search-close"
          type="button"
          aria-label="Close search"
        >
          ✕
        </button>

      </div>

      <div
        class="search-results"
        style="margin-top:20px;"
      ></div>

    </div>
  `;

  document.body.appendChild(modal);

  return modal;
}

function openSearch() {

  const modal =
    createSearchModal();

  modal.classList.add("active");

  document.body.style.overflow =
    "hidden";

  const input =
    $(".site-search-input", modal);

  if (input) {
    setTimeout(() => {
      input.focus();
    }, 100);
  }
}

function closeSearch() {

  const modal =
    $(".search-modal");

  if (!modal) return;

  modal.classList.remove("active");

  document.body.style.overflow =
    "";
}

function initSearch() {

  createSearchModal();

  document.addEventListener(
    "click",
    event => {

      const searchButton =
        event.target.closest(
          ".search-btn, [data-search-open]"
        );

      if (searchButton) {
        event.preventDefault();
        openSearch();
        return;
      }

      const closeButton =
        event.target.closest(
          ".search-close"
        );

      if (closeButton) {
        closeSearch();
      }
    }
  );

  const modal =
    $(".search-modal");

  if (!modal) return;

  const input =
    $(".site-search-input", modal);

  if (!input) return;

  input.addEventListener(
    "input",
    () => {

      const query =
        input.value
          .trim()
          .toLowerCase();

      renderSearchResults(query);
    }
  );

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {
        closeSearch();
      }
    }
  );
}

function renderSearchResults(query) {

  const container =
    $(".search-results");

  if (!container) return;

  if (!query) {

    container.innerHTML = `
      <p
        style="
          color:#777;
          font-size:12px;
          padding:15px 5px;
        "
      >
        Start typing to search Family Bazar products.
      </p>
    `;

    return;
  }

  const results =
    FamilyBazar.products.filter(
      product =>
        product.name
          .toLowerCase()
          .includes(query) ||
        product.category
          .toLowerCase()
          .includes(query)
    );

  if (!results.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⌕</div>
        <h3>No products found</h3>
        <p>Try another search term.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    results.map(product => `
      <div
        class="search-result"
        data-product-id="${escapeHtml(product.id)}"
        style="
          display:grid;
          grid-template-columns:60px 1fr auto;
          gap:12px;
          align-items:center;
          padding:12px 0;
          border-bottom:1px solid #eee;
          cursor:pointer;
        "
      >

        <img
          src="${escapeHtml(product.image)}"
          alt="${escapeHtml(product.name)}"
          style="
            width:60px;
            height:60px;
            object-fit:cover;
            border-radius:10px;
          "
        >

        <div>
          <strong
            style="
              display:block;
              font-size:12px;
              color:#171717;
            "
          >
            ${escapeHtml(product.name)}
          </strong>

          <span
            style="
              color:#777;
              font-size:10px;
            "
          >
            ${escapeHtml(product.category)}
          </span>
        </div>

        <strong
          style="
            color:#0d5c45;
            font-size:12px;
          "
        >
          ${formatPrice(product.price)}
        </strong>

      </div>
    `).join("");

  $$(".search-result").forEach(result => {

    result.addEventListener(
      "click",
      () => {

        const id =
          result.dataset.productId;

        const product =
          FamilyBazar.products.find(
            item => item.id === id
          );

        if (product) {
          addToCart(product);
          closeSearch();
          openCart();
        }
      }
    );
  });
}

/* =========================================================
   CHECKOUT
   ========================================================= */

function handleCheckout() {

  if (!FamilyBazar.cart.length) {
    showToast("Your cart is empty");
    return;
  }

  /*
    If a checkout page already exists,
    use it automatically.
  */

  const checkoutLink =
    document.querySelector(
      'a[href*="checkout"], [data-checkout-url]'
    );

  if (checkoutLink) {

    const url =
      checkoutLink.dataset.checkoutUrl ||
      checkoutLink.getAttribute("href");

    if (
      url &&
      url !== "#" &&
      !url.startsWith("javascript:")
    ) {
      window.location.href = url;
      return;
    }
  }

  /*
    Fallback:
    show order summary.
  */

  const orderText =
    FamilyBazar.cart
      .map(item =>
        `${item.name} × ${item.quantity} — ${formatPrice(
          item.price * item.quantity
        )}`
      )
      .join("\n");

  const total =
    formatPrice(getCartTotal());

  const message =
    `Family Bazar Order\n\n` +
    `${orderText}\n\n` +
    `Total: ${total}`;

  const whatsappNumber =
    document.body.dataset.whatsapp ||
    "";

  if (whatsappNumber) {

    const cleanNumber =
      whatsappNumber.replace(/\D/g, "");

    const url =
      `https://wa.me/${cleanNumber}?text=` +
      encodeURIComponent(message);

    window.open(url, "_blank");

    return;
  }

  showToast(
    "Checkout page is not configured yet"
  );
}

/* =========================================================
   NEWSLETTER
   ========================================================= */

function initNewsletter() {

  $$(".newsletter-form").forEach(form => {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const input =
          $("input[type='email']", form);

        if (!input) return;

        const email =
          input.value.trim();

        if (!email) {
          showToast("Please enter your email");
          return;
        }

        if (!isValidEmail(email)) {
          showToast("Please enter a valid email");
          return;
        }

        localStorage.setItem(
          "familyBazarNewsletter",
          email
        );

        input.value = "";

        showToast(
          "You're successfully subscribed!"
        );
      }
    );
  });
}

/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}

/* =========================================================
   NAV ACTIVE STATE
   ========================================================= */

function initActiveNavigation() {

  const links =
    $$(".nav-links a");

  if (!links.length) return;

  const current =
    window.location.pathname
      .split("/")
      .pop() || "index.html";

  links.forEach(link => {

    const href =
      link.getAttribute("href");

    if (!href) return;

    const linkPage =
      href.split("#")[0]
        .split("/")
        .pop();

    if (
      linkPage === current ||
      (
        current === "" &&
        linkPage === "index.html"
      )
    ) {
      link.classList.add("active");
    }
  });
}

/* =========================================================
   SMOOTH ANCHOR LINKS
   ========================================================= */

function initSmoothLinks() {

  $$('a[href^="#"]').forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const id =
          link.getAttribute("href");

        if (
          !id ||
          id === "#"
        ) {
          return;
        }

        const target =
          $(id);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    );
  });
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

function initKeyboardControls() {

  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {
        closeCart();
        closeSearch();
      }
    }
  );
}

/* =========================================================
   IMAGE ERROR HANDLING
   ========================================================= */

function initImageFallbacks() {

  $$("img").forEach(img => {

    img.addEventListener(
      "error",
      () => {

        if (
          img.dataset.fallbackApplied
        ) {
          return;
        }

        img.dataset.fallbackApplied =
          "true";

        img.style.objectFit =
          "contain";

        img.style.padding =
          "25px";

        img.src =
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="500"
              height="500"
              viewBox="0 0 500 500"
            >
              <rect
                width="500"
                height="500"
                fill="#f2f3ef"
              />
              <text
                x="250"
                y="250"
                text-anchor="middle"
                dominant-baseline="middle"
                font-family="Arial"
                font-size="24"
                fill="#0d5c45"
              >
                Family Bazar
              </text>
            </svg>
          `);
      }
    );
  });
}

/* =========================================================
   PRODUCT CARD HOVER
   ========================================================= */

function initProductCards() {

  $$(".product-card").forEach(card => {

    card.addEventListener(
      "mouseenter",
      () => {
        card.classList.add("is-hovered");
      }
    );

    card.addEventListener(
      "mouseleave",
      () => {
        card.classList.remove("is-hovered");
      }
    );
  });
}

/* =========================================================
   PREVENT DOUBLE SUBMISSION
   ========================================================= */

function protectForms() {

  $$("form").forEach(form => {

    form.addEventListener(
      "submit",
      () => {

        const submitButton =
          form.querySelector(
            'button[type="submit"]'
          );

        if (!submitButton) return;

        setTimeout(() => {

          submitButton.disabled =
            true;

          setTimeout(() => {
            submitButton.disabled =
              false;
          }, 2500);

        }, 0);
      }
    );
  });
}

/* =========================================================
   YEAR
   ========================================================= */

function initCurrentYear() {

  $$("[data-current-year]").forEach(
    element => {
      element.textContent =
        new Date().getFullYear();
    }
  );

  const year =
    $("#currentYear");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }
}

/* =========================================================
   PAGE LOADER
   ========================================================= */

function initPageLoader() {

  window.addEventListener(
    "load",
    () => {

      document.body.classList.add(
        "page-loaded"
      );
    }
  );
}

/* =========================================================
   INTERSECTION OBSERVER FOR PRODUCT CARDS
   ========================================================= */

function initProductReveal() {

  const cards =
    $$(".product-card");

  if (!cards.length) return;

  if (
    !("IntersectionObserver" in window)
  ) {
    return;
  }

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target.style.opacity =
              "1";

            entry.target.style.transform =
              "translateY(0)";

            observer.unobserve(
              entry.target
            );
          }
        });

      },
      {
        threshold: .08
      }
    );

  cards.forEach((card, index) => {

    card.style.opacity = "0";

    card.style.transform =
      "translateY(18px)";

    card.style.transition =
      `opacity .6s ease ${index * 45}ms,
       transform .6s ease ${index * 45}ms`;

    observer.observe(card);
  });
}

/* =========================================================
   BACKDROP SCROLL LOCK
   ========================================================= */

function updateBodyScrollLock() {

  const cartOpen =
    $(".cart-drawer")?.classList.contains(
      "active"
    );

  const searchOpen =
    $(".search-modal")?.classList.contains(
      "active"
    );

  if (cartOpen || searchOpen) {
    document.body.style.overflow =
      "hidden";
  } else {
    document.body.style.overflow =
      "";
  }
}

/* =========================================================
   ONLINE / OFFLINE STATUS
   ========================================================= */

function initConnectionStatus() {

  window.addEventListener(
    "offline",
    () => {
      showToast(
        "You're currently offline"
      );
    }
  );

  window.addEventListener(
    "online",
    () => {
      showToast(
        "You're back online"
      );
    }
  );
}

/* =========================================================
   DOUBLE CLICK PROTECTION
   ========================================================= */

function initButtonProtection() {

  $$("button").forEach(button => {

    button.addEventListener(
      "dblclick",
      event => {
        event.preventDefault();
      }
    );
  });
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initFamilyBazar() {

  collectProducts();

  initMobileMenu();

  initHeaderScroll();

  initScrollTop();

  initRevealAnimations();

  initCart();

  initAddToCart();

  initWishlist();

  initSearch();

  initNewsletter();

  initActiveNavigation();

  initSmoothLinks();

  initKeyboardControls();

  initImageFallbacks();

  initProductCards();

  protectForms();

  initCurrentYear();

  initPageLoader();

  initProductReveal();

  initConnectionStatus();

  initButtonProtection();

  updateCartCount();

  renderCart();

  console.log(
    "Family Bazar — Ultra Premium system initialized."
  );
}

/* =========================================================
   START
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initFamilyBazar
  );

} else {

  initFamilyBazar();

}
