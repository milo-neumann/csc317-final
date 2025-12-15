total = 0;
for (purchase of cart_items){
    total += purchase.price * purchase.quantity;
}
document.getElementById('total').innerText = 'Total: $' + total.toFixed(2);

populateTable();

// populates the cart
function populateTable() {
    const tableBody = document.getElementById("dataTableBody");

    // Loop through the data array
    cart_items.forEach(purchase => {
        const row = document.createElement("tr");

        const symbol_cell = document.createElement("td");
        symbol_cell.textContent = purchase.symbol;
        row.appendChild(symbol_cell);

        const quantity_cell = document.createElement("td");
        quantity_cell.textContent = purchase.quantity;
        row.appendChild(quantity_cell);

        const price_cell = document.createElement("td");
        price_cell.textContent = purchase.price.toFixed(2);
        row.appendChild(price_cell);

        tableBody.appendChild(row);
    });
}

const purchase_button = document.getElementById('purchase');
const dump_button = document.getElementById('dump');
purchase_button.addEventListener("click", function () {
  dump(cart_items[0].user);
  alert("Purchase complete!");
  location.reload();
});
dump_button.addEventListener("click", function () {
  dump(cart_items[0].user);
  alert("Cart emptied!");
  location.reload();
});

async function dump(user) {
    try {
    const response = await fetch("/api/dump_cart", {
      method: "POST",
      body: JSON.stringify({ user}),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    if (!response.ok) {
      throw new Error("Failed to empty cart; maybe it was already empty?");
    }

    const data = await response.json();
    

        
  } catch (err) {
    console.error("Error emptying cart:", err);    
  }
}