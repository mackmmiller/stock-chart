// Make connection
var socket = io.connect("http://localhost:3000");

//#region Variables
// Query the DOM
var btn = document.querySelector("button");
var newSymbol = document.querySelector("input");
var stocks = document.querySelector(".stocks");
var stockChart = document.querySelector(".stock-chart");
var stockInstance = document.querySelectorAll(".stock");
var addStock = document.querySelector(".add");
// Constants
const url = "/api/stocks";
let seriesOptions = [];
let seriesCounter = 0;
//#endregion

//#region Function Definitions
async function getStocks() {
  console.log("Querying the database");
  const response = await fetch(url);
  return await response.json();
}

function chartStocks() {
  console.log("Charting stocks");
  Highcharts.stockChart(stockChart, {
    rangeSelector: {
      selected: 4
    },

    yAxis: {
      labels: {
        formatter: function() {
          return (this.value > 0 ? " + " : "") + this.value + "%";
        }
      },
      plotlines: [
        {
          value: 0,
          width: 2,
          color: "silver"
        }
      ]
    },
    plotOptions: {
      series: {
        compare: "percent",
        showInNavigator: true
      }
    },
    tooltip: {
      pointFormat:
        '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br />`',
      valueDecimals: 2,
      split: true
    },
    series: seriesOptions
  });
}

function addStockTile(data) {
  var newStock = document.createElement("div");
  newStock.className = `stock ${data}`;
  newStock.innerHTML = `<span class="close">&times;</span><h2 class="symbol">${data}</h2>`;
  newStock.firstChild.addEventListener("click", () => remove(data));
  stocks.appendChild(newStock);
}
//#endregion

//#region Add Listeners
btn.addEventListener("click", () => add(newSymbol.value));
//#endregion

//#region Socket Emitters
function add(symbol) {
  socket.emit("add", symbol);
}

function remove(symbol) {
  socket.emit("remove", symbol);
}
//#endregion

socket.on("remove", function(data) {
  console.log(`${socket.id} has removed ${data}`);
  const domTarget = document.querySelector(`.${data}`);
  const target = seriesOptions.findIndex(i => i.name === data);
  seriesOptions.splice(target, 1);
  seriesCounter--;
  stocks.removeChild(domTarget);
  chartStocks();
});

socket.on("update", function(data) {
  console.log("New data available\nUpdating...");
  console.log(data);
  getStocks()
    .then(response => {
      const comparator = data.toUpperCase();
      const filteredData = response.filter(stock => stock.symbol == comparator);
      return filteredData;
    })
    .then(newStock => {
      seriesOptions[seriesCounter] = {
        name: newStock[0].symbol,
        data: newStock[0].prices
      };
      seriesCounter++;
      addStockTile(newStock[0].symbol);
      chartStocks();
    });
});
//#endregion

getStocks()
  .then(data => {
    data.forEach((stock, i) => {
      addStockTile(stock.symbol);
      seriesOptions[i] = {
        name: stock.symbol,
        data: stock.prices
      };
      seriesCounter += 1;
      if (seriesCounter === data.length) {
        chartStocks();
      }
    });
  })
  .catch(err => console.error(err));
