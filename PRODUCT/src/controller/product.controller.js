const { uploadImage } = require("../service/imagekit.service");
const Product = require("../models/product.model");
const mongoose = require("mongoose");

//CREATE PRODUCT
async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, category, priceCurrency } =
      req.body;
    if (!title || !priceAmount) {
      return res.status(400).json({ message: "Title and Price are required" });
    }
    const seller = req.user.id;
    const price = {
      price: Number(priceAmount),
      currency: priceCurrency || "INR",
    };

    const images = await Promise.all(
      (req.files || []).map((file) => uploadImage({ buffer: file.buffer }))
    );
    const product = await Product.create({
      title,
      description,
      price: price.price,
      currency: price.currency,
      category,
      seller,
      images,
    });
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("Error creating product:", error);
  }
}

//GET PRODUCTS
async function getProducts(req, res) {
  const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;
  const filter = {};
  if (q) {
    filter.$text = { $search: q };
  }
  if (minprice) {
    filter["price.price"] = {
      ...filter["price.price"],
      $gte: Number(minprice),
    };
  }
  if (maxprice) {
    filter["price.price"] = {
      ...filter["price.price"],
      $lte: Number(maxprice),
    };
  }

  const products = await Product.find(filter)
    .skip(Number(skip))
    .limit(Math.min(Number(limit), 20))
    .sort({ createdAt: -1 });
  res.status(200).json({ data: products });
}

//GET PRODUCT BY ID
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
}

//UPDATE PRODUCT
async function updateProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (product.seller.toString() !== req.user.id && req.user.role !== "seller") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const allowedUpdates = ["title", "description", "price", "category"];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });
  await product.save();
  res.status(200).json({ message: "Product updated", product });
}

//DELETE PRODUCT
async function deleteProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (product.seller.toString() !== req.user.id && req.user.role !== "seller") {
    return res.status(403).json({ message: "Forbidden" });
  }
  await Product.findByIdAndDelete(id);
  res.status(200).json({ message: "Product deleted" });
}

//GET PRODUCT BY SELLER
async function getProductsBySeller(req, res) {
  const sellerId = req.user.id;
  const { skip = 0, limit = 20 } = req.query;
  const products = await Product.find({ seller: sellerId })
    .skip(Number(skip))
    .limit(Math.min(Number(limit), 20))
    .sort({ createdAt: -1 });
  res.status(200).json({ data: products });
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
};
