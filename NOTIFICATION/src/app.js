require("dotenv").config();
const express = require("express");
const { connect, subscribeToQueue } = require("./broker/broker");
const setListeners = require("./broker/listners");

// Setup RabbitMQ listeners

const app = express();
connect().then(() => {
  setListeners();
});

module.exports = app;
