require("dotenv").config();
const express = require("express");
const { connect, subscribeToQueue } = require("./broker/broker");
const setListeners = require("./broker/listners");

// Setup RabbitMQ listeners

const app = express();
connect().then(() => {
  setListeners();
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Notification Service is running." });
});

module.exports = app;
