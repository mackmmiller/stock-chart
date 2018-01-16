require("dotenv").config();
const fetch = require("node-fetch");
const Symbol = require("../models/Symbol.js");
const apiKey = process.env.API_KEY;

module.exports = function(symbol) {
  Symbol.find({ symbol: symbol })
    .remove()
    .exec();
  console.log(`${symbol} has been removed`);
};
