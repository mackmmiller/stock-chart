const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var SymbolSchema = new Schema({
  symbol: { type: String, required: true },
  prices: []
});

SymbolSchema.methods.deleteSymbol = function(data) {
  console.log(`Deleting`);
};

module.exports = mongoose.model("Symbol", SymbolSchema);
