//#region Requirements
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const Symbol = require("./models/Symbol");
const configDB = require("./config/mongo.js");
const fetchData = require("./config/stockData.js");
const removeData = require("./config/removeStockData.js");
//#endregion

//#region Configure database
mongoose.connect(configDB.url, { useMongoClient: true });
mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);
mongoose.connection.once(
  "open",
  console.log.bind(console, "Connected to Mongoose")
);
//#endregion

// App setup
server.listen(process.env.PORT || 3000);

// Static files
app.use(express.static("public"));

//#region Routes
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "public", "index.html"));
});

app.get("/api/stocks", (req, res) => {
  Symbol.find({}, (err, data, next) => {
    if (err) return next(err);
    return res.status(200).json(data);
  });
});
//#endregion

// Socket setup
io.on("connection", function(socket) {
  console.log(`${socket.id} has connected`);

  // Handle add stock
  socket.on("add", function(data) {
    fetchData(data, io.sockets);
  });

  // Handle remove stock
  socket.on("remove", function(data) {
    removeData(data);
    io.sockets.emit("remove", data);
  });
});
