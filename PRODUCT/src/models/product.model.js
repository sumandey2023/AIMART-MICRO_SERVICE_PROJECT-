const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ["INR", "USD"],
    default: "INR",
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  images: [
    {
      url: String,
      thumbnail: String,
      id: String,
    },
  ],
  category: {
    type: String,
  },
});

productSchema.index({ title: "text", description: "text", category: "text" });
const Product = mongoose.model("product", productSchema);

module.exports = Product;
