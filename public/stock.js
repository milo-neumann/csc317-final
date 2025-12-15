// buy and sell
const buy_button = document.getElementById("buy_button");
const sell_button = document.getElementById("sell_button");
const quantity = document.getElementById("quantity").value;
buy_button.addEventListener("click", function () {
  const quantity = document.getElementById("quantity").value;
  add_to_cart(user, symbol, quantity, price);
});
sell_button.addEventListener("click", function () {
  const quantity = document.getElementById("quantity").value;
  add_to_cart(user, symbol, -1 * quantity, price);
});

async function add_to_cart(user, symbol, quantity, price) {
  try {
    const response = await fetch("/api/add_to_cart", {
      method: "POST",
      body: JSON.stringify({ user, symbol, quantity, price }),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    if (!response.ok) {
      throw new Error("Failed to add item to cart");
    }

    const data = await response.json();
    console.log("Cart updated:", data);
    console.log(data.data);
    document.getElementById("cart_response").innerText = data.data.symbol + " added to cart!";
  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("Something went wrong. Please try again.");
  }
}

// turn the rows into something usable by the chart maker
price_arrays = [];
for (obj of prices) {
  price_arrays.push([obj.day, obj.price]);
}

// prep for drawing the chart
google.charts.load("current", { packages: ["corechart", "line"] });
google.charts.setOnLoadCallback(drawAxisTickColors);

// draws the actual chart
function drawAxisTickColors() {
  var data = new google.visualization.DataTable();
  data.addColumn("number", "X");
  data.addColumn("number", "");
  data.addRows(price_arrays);
  var options = {
    backgroundColor: "transparent",
    legend: { position: "none" },
    hAxis: {
      title: "Day",
      textStyle: {
        color: "#1f2933",
        fontSize: 20,
        fontName: "Arial",
        bold: true,
        italic: true,
      },
      titleTextStyle: {
        color: "#1f2933",
        fontSize: 20,
        fontName: "Arial",
        bold: false,
        italic: false,
      },
    },
    vAxis: {
      format: "$#####.##",
      title: "Price",
      textStyle: {
        color: "#1f2933",
        fontSize: 16,
        bold: false,
      },
      titleTextStyle: {
        color: "#1f2933",
        fontSize: 20,
        bold: false,
        italic: false,
      },
    },
    colors: ["green"],
  };
  var chart = new google.visualization.LineChart(document.getElementById("chart_div"));
  chart.draw(data, options);
}
