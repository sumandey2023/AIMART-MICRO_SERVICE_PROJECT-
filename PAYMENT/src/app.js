const express = require("express");
const cookieParser = require("cookie-parser");
const paymentRoutes = require("./routes/payment.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/payments", paymentRoutes);

module.exports = app;
