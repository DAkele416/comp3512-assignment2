//Container where the product cards will appear
const productList = document.querySelector("#product-list");

let selectedProduct = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let allProducts = [];

// Build product cards for the supplied list of products.
function displayProducts(products) {

   productList.replaceChildren();

   let i = 0;

   while (i < products.length) {
      const product = products[i];

      // Creating a container for this product
      const card = document.createElement("div");
      card.className = "product-card";

      // Creating the product image 
      const image = document.createElement("img");
      image.src = product.thumbnail;
      image.alt = product.title;

      // Open the details for the clicked product
      image.addEventListener("click", function () {
         loadSingleProduct(product.id);
      });

      // Creating the product title
      const title = document.createElement("h3");
      title.textContent = product.title;
      const titleButton = document.createElement("button");
      titleButton.type = "button";
      titleButton.textContent = product.title;

      title.replaceChildren();
      title.appendChild(titleButton);

      titleButton.addEventListener("click", function () {
         loadSingleProduct(product.id);
      });

      // Creating the product price
      const price = document.createElement("p");
      price.textContent = "$" + product.price.toFixed(2);

      // Click action button for Add to Cart
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Add to Cart";

      button.addEventListener("click", function () {
         addToCart(product, 1);
      });

      // Placing the image, title, and price in the card
      card.appendChild(image);
      card.appendChild(title);
      card.appendChild(price);
      card.appendChild(button);

      // Publishes the complete card to the webpage
      productList.appendChild(card);

      i++;
   }
}

// Hide all views, then display the requested view.
function showView(viewId) {

   const homeView = document.querySelector("#home-view");
   homeView.style.display = "none";

   const browseView = document.querySelector("#browse-view");
   browseView.style.display = "none";

   const singleView = document.querySelector("#single-view");
   singleView.style.display = "none";

   const cartView = document.querySelector("#cart-view");
   cartView.style.display = "none";

   const selectedView = document.querySelector("#" + viewId);
   selectedView.style.display = "block";
}

const homeButton = document.querySelector("#home-button");
homeButton.addEventListener("click", function () {
   showView("home-view");
});

const browseButton = document.querySelector("#browse-button");
browseButton.addEventListener("click", function () {
   showView("browse-view");
});

const cartButton = document.querySelector("#cart-button");
cartButton.addEventListener("click", function () {
   displayCart();
   showView("cart-view");
});

const aboutButton = document.querySelector("#about-button");
const aboutPopup = document.querySelector("#about-popup");

aboutButton.addEventListener("click", function () {
   aboutPopup.style.display = "block";
});

const closeAboutButton = document.querySelector("#close-about-button");
closeAboutButton.addEventListener("click", function () {
   aboutPopup.style.display = "none";
});

// Use saved products when available; otherwise fetch and save them.
const savedProducts = localStorage.getItem("products");
if (savedProducts !== null) {
   allProducts = JSON.parse(savedProducts);
   displayCategories();
   applyFilters();
   displayFeaturedProducts();
} else {
   fetch("https://dummyjson.com/products?limit=100")
      .then(response => {
         if (response.ok) {
            return response.json();
         } else {
            throw new Error("Unable to load product data.");
         }
      })
      .then(data => {
         localStorage.setItem("products", JSON.stringify(data.products));

         allProducts = data.products;
         displayCategories();
         applyFilters();
         displayFeaturedProducts();
      })
      .catch(error => {
         console.error(error);

         document.querySelector("#browse-message").textContent = "Unable to load products. Please refresh to try again.";

         document.querySelector("#featured-products").textContent = "Unable to load featured products. Please refresh to try again.";
      });
}

// Fetch one product and populate its details, specifications, and reviews.
function loadSingleProduct(productId) {
   showView("single-view");

   // Prevent adding the previous product while the new product loads.
   selectedProduct = null;

   singleAddButton.disabled = true;

   document.querySelector("#single-title").textContent = "Loading product...";

   fetch("https://dummyjson.com/products/" + productId)
      .then(response => {
         if (response.ok) {
            return response.json();
         } else {
            throw new Error("Unable to load product data.");
         }
      })
      .then(product => {

         selectedProduct = product;

         document.querySelector("#single-title").textContent = product.title;

         const singleImage = document.querySelector("#single-image");
         singleImage.src = product.images[0];
         singleImage.alt = product.title;

         document.querySelector("#single-description").textContent = product.description;

         document.querySelector("#single-price").textContent = "$" + product.price.toFixed(2);

         document.querySelector("#single-breadcrumb").textContent = "Home > " + product.category + " > " + product.title;

         document.querySelector("#single-sku").textContent = "SKU: " + product.sku;

         const stockMessage = document.querySelector("#single-stock");
         if (product.stock > 0) {
            stockMessage.textContent = "In stock";
         } else {
            stockMessage.textContent = "Out of stock";
         }

         const tagsContainer = document.querySelector("#single-tags");
         tagsContainer.replaceChildren();

         for (const tag of product.tags) {
            const tagBox = document.createElement("span");
            tagBox.textContent = tag;
            tagBox.className = "product-tag";
            tagsContainer.appendChild(tagBox);
         }

         let stars = "";

         for (let i = 1; i <= 5; i++) {
            if (i <= product.rating) {
               stars += "★";
            } else {
               stars += "☆";
            }
         }

         document.querySelector("#single-rating").textContent = stars + " (" + product.rating + "/5)";

         document.querySelector("#single-quantity").value = 1;

         specificationsPanel.style.display = "block";
         reviewsPanel.style.display = "none";

         document.querySelector("#single-weight").textContent = "Weight: " + product.weight + " kg";

         document.querySelector("#single-dimensions").textContent =

            "Dimensions: " + product.dimensions.width + " × " +
            product.dimensions.height + " × " +
            product.dimensions.depth + " cm (width × height × depth)";

         document.querySelector("#single-warranty").textContent = "Warranty: " + product.warrantyInformation;

         document.querySelector("#single-shipping").textContent = "Shipping: " + product.shippingInformation;

         document.querySelector("#single-return").textContent = "Return policy: " + product.returnPolicy;

         const reviewsContainer = document.querySelector("#single-reviews");
         reviewsContainer.replaceChildren();

         for (const review of product.reviews) {
            const reviewBox = document.createElement("div");
            reviewBox.className = "product-review";

            const name = document.createElement("h3");
            name.textContent = review.reviewerName;

            let stars = "";

            for (let i = 1; i <= 5; i++) {
               if (i <= review.rating) {
                  stars += "★";
               } else {
                  stars += "☆";
               }
            }

            const rating = document.createElement("p");
            rating.textContent = stars;

            const comment = document.createElement("p");
            comment.textContent = review.comment;

            const date = document.createElement("p");
            date.textContent = "Date: " + review.date.substring(0, 10);

            reviewBox.appendChild(name);
            reviewBox.appendChild(rating);
            reviewBox.appendChild(comment);
            reviewBox.appendChild(date);

            reviewsContainer.appendChild(reviewBox);
         }

         singleAddButton.disabled = false;

      })
      .catch(error => {
         console.error(error);

         document.querySelector("#single-title").textContent = "Unable to load this product. Please try again.";
      });
}


const singleAddButton = document.querySelector("#single-add-button");
singleAddButton.addEventListener("click", function () {

   const quantity = Number(document.querySelector("#single-quantity").value);

   if (quantity >= 1 && quantity % 1 === 0) {
      addToCart(selectedProduct, quantity);
   } else {
      alert("Please enter a whole number of 1 or more.");
   }
});

// Display cart items and calculate shipping, tax, and the total.
function displayCart() {
   const cartItems = document.querySelector("#cart-items");
   cartItems.replaceChildren();

   const cartMessage = document.querySelector("#cart-message");

   if (cart.length === 0) {
      cartMessage.textContent = "Your shopping cart is empty.";
   } else {
      cartMessage.textContent = "";
   }

   document.querySelector("#shipping-method").disabled = cart.length === 0;

   document.querySelector("#shipping-destination").disabled = cart.length === 0;

   document.querySelector("#checkout-button").disabled = cart.length === 0;

   let merchandiseTotal = 0;

   for (const item of cart) {

      merchandiseTotal += item.product.price * item.quantity;

      const row = document.createElement("tr");

      const removeCell = document.createElement("td");

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";

      removeButton.addEventListener("click", function () {
         cart = cart.filter(function (cartItem) {
            return cartItem.product.id !== item.product.id;
         });

         localStorage.setItem("cart", JSON.stringify(cart));
         updateCartCount();
         displayCart();
      });

      removeCell.appendChild(removeButton);

      const imageCell = document.createElement("td");
      const image = document.createElement("img");
      image.src = item.product.thumbnail;
      image.alt = item.product.title;
      image.width = 80;
      imageCell.appendChild(image);

      const titleCell = document.createElement("td");
      titleCell.textContent = item.product.title;

      const priceCell = document.createElement("td");
      priceCell.textContent = "$" + item.product.price.toFixed(2);

      const quantityCell = document.createElement("td");
      quantityCell.textContent = item.quantity;

      const subtotalCell = document.createElement("td");
      subtotalCell.textContent =
         "$" + (item.product.price * item.quantity).toFixed(2);

      row.appendChild(removeCell);
      row.appendChild(imageCell);
      row.appendChild(titleCell);
      row.appendChild(priceCell);
      row.appendChild(quantityCell);
      row.appendChild(subtotalCell);

      cartItems.appendChild(row);
   }

   document.querySelector("#cart-merchandise").textContent = "$" + merchandiseTotal.toFixed(2);

   const shippingMethod = document.querySelector("#shipping-method").value;

   const destination = document.querySelector("#shipping-destination").value;

   let shippingCost = 0;

   // Shipping is free for an empty cart or merchandise over $500.
   if (cart.length > 0 && merchandiseTotal <= 500) {
      if (shippingMethod === "standard") {
         if (destination === "canada") {
            shippingCost = 10;
         } else if (destination === "usa") {
            shippingCost = 15;
         } else {
            shippingCost = 20;
         }

      } else if (shippingMethod === "express") {
         if (destination === "international") {
            shippingCost = 30;
         } else {
            shippingCost = 25;
         }
      } else {
         if (destination === "canada") {
            shippingCost = 35;
         } else {
            shippingCost = 50;
         }
      }
   }

   document.querySelector("#cart-shipping").textContent = "$" + shippingCost.toFixed(2);

   // Apply 5% tax to merchandise only for Canadian destinations.
   let tax = 0;

   if (destination === "canada") {
      tax = merchandiseTotal * 0.05;
   }

   const total = merchandiseTotal + shippingCost + tax;

   document.querySelector("#cart-tax").textContent = "$" + tax.toFixed(2);

   document.querySelector("#cart-total").textContent = "$" + total.toFixed(2);

}

document.querySelector("#shipping-method").addEventListener("change", function () {
   displayCart();
});

document.querySelector("#shipping-destination").addEventListener("change", function () {
   displayCart();
});

// Display a confirmation message that the user can close.
function showNotification(message) {
   document.querySelector("#notification-message").textContent = message;

   document.querySelector("#notification").style.display = "block";
}

document.querySelector("#close-notification").addEventListener("click", function () {
   document.querySelector("#notification").style.display = "none";
});

document.querySelector("#checkout-button").addEventListener("click", function () {
   cart = [];
   localStorage.setItem("cart", JSON.stringify(cart));
   updateCartCount();
   displayCart();
   showView("home-view");
   showNotification("Checkout complete. Thank you for your order!");
});

const specificationsPanel = document.querySelector("#specifications-panel");

const reviewsPanel = document.querySelector("#reviews-panel");

document.querySelector("#specifications-button").addEventListener("click", function () {
   specificationsPanel.style.display = "block";
   reviewsPanel.style.display = "none";
});

document.querySelector("#reviews-button").addEventListener("click", function () {
   specificationsPanel.style.display = "none";
   reviewsPanel.style.display = "block";
});

// Apply the selected filters, then sort and display matching products.
function applyFilters() {

   const searchText = document.querySelector("#name-filter").value.toLowerCase();

   const selectedCategories = [];

   const categoryCheckboxes = document.querySelectorAll(".category-checkbox");

   for (const checkbox of categoryCheckboxes) {
      if (checkbox.checked) {
         selectedCategories.push(checkbox.value);
      }
   }

   const selectedRatings = [];

   const ratingCheckboxes = document.querySelectorAll(".rating-checkbox");

   for (const checkbox of ratingCheckboxes) {
      if (checkbox.checked) {
         selectedRatings.push(Number(checkbox.value));
      }
   }

   const underChecked = document.querySelector("#under-price-checkbox").checked;

   const overChecked = document.querySelector("#over-price-checkbox").checked;

   const underValue = document.querySelector("#under-price").value;
   const overValue = document.querySelector("#over-price").value;

   const filteredProducts = allProducts.filter(function (product) {
      const matchesName = product.title.toLowerCase().includes(searchText);

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      let matchesRating = selectedRatings.length === 0;

      // Group decimal ratings by whole stars: 4 stars includes 4.0 to below 5.0.
      for (const rating of selectedRatings) {
         if (product.rating >= rating && product.rating < rating + 1) {
            matchesRating = true;
         }
      }

      let matchesPrice = true;

      if (underChecked && underValue !== "") {
         matchesPrice = product.price < Number(underValue);
      }

      if (overChecked && overValue !== "") {
         matchesPrice = matchesPrice && product.price > Number(overValue);
      }

      // A product must match all four filter groups.
      return matchesName && matchesCategory && matchesRating && matchesPrice;
   });

   const sortBy = document.querySelector("#sort-products").value;

   filteredProducts.sort(function (a, b) {
      if (sortBy === "price") {
         return a.price - b.price;
      }

      let first = a.title.toLowerCase();
      let second = b.title.toLowerCase();

      if (sortBy === "category") {
         first = a.category.toLowerCase();
         second = b.category.toLowerCase();
      }

      if (first < second) {
         return -1;
      } else if (first > second) {
         return 1;
      } else {
         return 0;
      }
   });

   displayProducts(filteredProducts);

   const message = document.querySelector("#browse-message");

   if (filteredProducts.length === 0) {
      message.textContent = "No products match your filters.";
   } else {
      message.textContent = "";
   }
}

document.querySelector("#name-filter").addEventListener("input", function () {
   applyFilters();
});

document.querySelector("#name-filter-button").addEventListener("click", function () {
   const panel = document.querySelector("#name-filter-panel");

   if (panel.style.display === "none") {
      panel.style.display = "block";
   } else {
      panel.style.display = "none";
   }
});

// Create category checkboxes using unique categories from the product data.
function displayCategories() {
   const categoryPanel = document.querySelector("#category-filter-panel");

   categoryPanel.replaceChildren();

   const categories = new Set();

   for (const product of allProducts) {
      categories.add(product.category);
   }

   for (const category of categories) {
      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = category;
      checkbox.className = "category-checkbox";

      const text = document.createElement("span");
      text.textContent = category;

      label.appendChild(checkbox);
      label.appendChild(text);
      categoryPanel.appendChild(label);
   }
}

document.querySelector("#category-filter-panel").addEventListener("change", function () {
   applyFilters();
});

document.querySelector("#category-filter-button").addEventListener("click", function () {
   const panel = document.querySelector("#category-filter-panel");

   if (panel.style.display === "none") {
      panel.style.display = "block";
   } else {
      panel.style.display = "none";
   }
});

document.querySelector("#rating-filter-panel").addEventListener("change", function () {
   applyFilters();
});

// Add a new cart item or increase its quantity, then save the cart.
function addToCart(product, quantity) {
   const existingItem = cart.find(function (item) {
      return item.product.id === product.id;
   });

   if (existingItem) {
      existingItem.quantity += quantity;
   } else {
      cart.push({
         product: product,
         quantity: quantity
      });
   }

   localStorage.setItem("cart", JSON.stringify(cart));
   updateCartCount();

   showNotification(quantity + " × " + product.title + " added to your cart.");
}

document.querySelector("#rating-filter-button").addEventListener("click", function () {
   const panel = document.querySelector("#rating-filter-panel");

   if (panel.style.display === "none") {
      panel.style.display = "block";
   } else {
      panel.style.display = "none";
   }
});

document.querySelector("#price-filter-panel").addEventListener("input", function () {
   applyFilters();
});

document.querySelector("#price-filter-button").addEventListener("click", function () {
   const panel = document.querySelector("#price-filter-panel");

   if (panel.style.display === "none") {
      panel.style.display = "block";
   } else {
      panel.style.display = "none";
   }
});

document.querySelector("#clear-filters-button").addEventListener("click", function () {
   document.querySelector("#name-filter").value = "";
   document.querySelector("#under-price").value = "";
   document.querySelector("#over-price").value = "";

   const checkboxes = document.querySelectorAll('#browse-view input[type="checkbox"]');

   for (const checkbox of checkboxes) {
      checkbox.checked = false;
   }

   applyFilters();
});

document.querySelector("#sort-products").addEventListener("change", function () {
   applyFilters();
});

document.querySelector("#shop-now-button").addEventListener("click", function () {
   showView("browse-view");
});

// Display the first three products as clickable featured items.
function displayFeaturedProducts() {
   const container = document.querySelector("#featured-products");
   container.replaceChildren();

   let count = 0;

   for (const product of allProducts) {
      if (count < 3) {
         const card = document.createElement("div");
         card.className = "product-card";

         const button = document.createElement("button");
         button.type = "button";

         const image = document.createElement("img");
         image.src = product.thumbnail;
         image.alt = product.title;

         const title = document.createElement("h3");
         title.textContent = product.title;

         const price = document.createElement("p");
         price.textContent = "$" + product.price.toFixed(2);

         button.appendChild(image);
         button.appendChild(title);

         button.addEventListener("click", function () {
            loadSingleProduct(product.id);
         });

         card.appendChild(button);
         card.appendChild(price);
         container.appendChild(card);

         count++;
      }
   }
}

// Count all units in the cart and update the header.
function updateCartCount() {
   let count = 0;

   for (const item of cart) {
      count += item.quantity;
   }

   document.querySelector("#cart-count").textContent = count;
}

updateCartCount();

document.querySelector("#logo-button").addEventListener("click", function () {
   showView("home-view");
});