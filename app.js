const express = require("express");
const app = express();
const connectDB = require("./middleware/db");
const cors = require("cors");
const verifyToken = require("./middleware/auth");

// Connect to database
connectDB();
// app.use(express.json());
app.use(express.json());

// Cors
app.use(
  cors({
    origin: "*",
  })
);

console.log("FrontEnd running ", process.env.CLIENT_URL);

// Define Routes
app.use("/api/home", require("./routes/home"));
app.use("/api/analytics", verifyToken, require("./routes/analytics"));
app.use("/api/order", verifyToken, require("./routes/order"));
app.use("/api/global", require("./routes/global"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", verifyToken, require("./routes/user"));

module.exports = app;
