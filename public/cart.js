// Calculate and display total + populate table in one pass,
// handling negative quantities as "sell" orders.
// Build the cart table, handle buys/sells, and totals
renderCart();

function renderCart() {
  const tableBody = document.getElementById("dataTableBody");
  const totalElement = document.getElementById("total");

  if (!tableBody || !totalElement || !Array.isArray(cart_items)) {
    return;
  }

  tableBody.innerHTML = "";
  let total = 0;

  cart_items.forEach((purchase, index) => {
    const row = document.createElement("tr");

    const qty = Number(purchase.quantity);
    const rawPrice = Number(purchase.price);

    const unitPrice = Math.abs(rawPrice);
    const isSell = qty < 0;
    const absQty = Math.abs(qty);

    const signedValue = (isSell ? -1 : 1) * unitPrice * absQty;
    total += signedValue;

    // Symbol
    const symbol_cell = document.createElement("td");
    symbol_cell.textContent = purchase.symbol;
    row.appendChild(symbol_cell);

    // Quantity
    const quantity_cell = document.createElement("td");
    quantity_cell.textContent = qty;
    row.appendChild(quantity_cell);

    // Line total (price column)
    const lineTotal = unitPrice * absQty;
    const price_cell = document.createElement("td");
    price_cell.textContent = `${isSell ? "-" : ""}$${lineTotal.toFixed(2)}`;
    row.appendChild(price_cell);

    // Action cell with delete button
    const action_cell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Remove";
    deleteBtn.className = "cart-delete-btn";
    deleteBtn.addEventListener("click", () => {
      removeCartItem(index);
    });
    action_cell.appendChild(deleteBtn);
    row.appendChild(action_cell);

    tableBody.appendChild(row);
  });

  totalElement.innerText = "Total: $" + total.toFixed(2);
}

// Remove a single item from the cart (front-end) and re-render
function removeCartItem(index) {
  if (!Array.isArray(cart_items)) return;
  cart_items.splice(index, 1);
  renderCart();
}


// Safely figure out the current username
function getUsername() {
  // Prefer global `user` if cart.pug sets it
  if (typeof user !== "undefined" && user) {
    return user;
  }
  // Fallback to first cart item if it has a user field
  if (Array.isArray(cart_items) && cart_items.length > 0 && cart_items[0].user) {
    return cart_items[0].user;
  }
  return null;
}

const purchase_button = document.getElementById("purchase");
const dump_button = document.getElementById("dump");

// PURCHASE: send to /api/checkout (saves to purchases + clears cart)
purchase_button.addEventListener("click", async function () {
  const username = getUsername();
  if (!username) {
    alert("Could not determine user. Please log in again.");
    return;
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ user: username }),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Checkout error:", text);
      alert("Failed to complete purchase.");
      return;
    }

    const data = await response.json();
    if (data.error) {
      alert(data.error);
      return;
    }

    alert(data.message || "Purchase complete!");
    // Reload so the cart page refreshes (now empty)
    location.reload();
    // If you later want to jump straight to portfolio instead:
    // window.location.href = "/portfolio";
  } catch (err) {
    console.error("Error during checkout:", err);
    alert("Error completing purchase. Please try again.");
  }
});

// CLEAR ALL: still uses /api/dump_cart
dump_button.addEventListener("click", async function () {
  const username = getUsername();
  if (!username) {
    alert("Could not determine user. Please log in again.");
    return;
  }

  await dump(username);
  alert("Cart emptied!");
  location.reload();
});

async function dump(user) {
  try {
    const response = await fetch("/api/dump_cart", {
      method: "POST",
      body: JSON.stringify({ user }),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    if (!response.ok) {
      throw new Error("Failed to empty cart; maybe it was already empty?");
    }

    // Your API returns JSON; we parse it even if we don't use it,
    // to avoid unhandled promises.
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error emptying cart:", err);
  }
}
