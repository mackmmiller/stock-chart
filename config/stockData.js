require("dotenv").config();
const fetch = require("node-fetch");
const Symbol = require("../models/Symbol.js");
const apiKey = process.env.API_KEY;

function saveSymbol(data) {
  let newSymbol = new Symbol();
  let newPrices = [];
  for (const prop in data["Time Series (Daily)"]) {
    newPrices.push([
      Date.parse(prop),
      parseFloat(data["Time Series (Daily)"][prop]["4. close"])
    ]);
  }
  const sortedPrices = newPrices.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    // a[0]<b[0]? -1:1;
  });
  newSymbol.symbol = data["Meta Data"]["2. Symbol"];
  newSymbol.prices = sortedPrices;
  newSymbol.save(function(err) {
    if (err) throw err;
    console.log(`${newSymbol.symbol} saved!`);
    return null, newSymbol;
  });
}

module.exports = function(symbol, server) {
  console.log(`Fetching ${symbol}`);
  fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol.toUpperCase()}&apikey=${apiKey}`
  )
    .then(response => {
      return response.json();
    })
    .then(data => {
      return saveSymbol(data);
    })
    .then(newStock => {
      server.emit("update", symbol);
    })
    .catch(err => console.error(err));
};
