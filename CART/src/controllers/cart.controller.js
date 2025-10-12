const cartModel = require("../models/cart.model");

async function addItemsToCart(req, res) {
  const { productId, qty } = req.body;
  const user = req.user;

  let cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    cart = new cartModel({ user: user.id, items: [] });
  }
  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += qty;
  } else {
    cart.items.push({ productId, quantity: qty });
  }
  await cart.save();
  res.status(200).json({ message: "Items added to cart", cart });
}

async function getCartItems(req, res) {
  const user = req.user;
  let cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    cart = new cartModel({ user: user.id, items: [] });
    await cart.save();
  }
  res.status(200).json({
    message: "Cart items fetched successfully",
    cart,
    totals: {
      itemCount: cart.items.length,
      totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
}

async function updateItem(req, res) {
  const user = req.user;
  const itemId = req.params.id;
  const { qty } = req.body;
  let cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === itemId
  );
  if (itemIndex < 0) {
    return res.status(404).json({ message: "Item not found in cart" });
  }
  cart.items[itemIndex].quantity = qty;
  await cart.save();
  res.status(200).json({ message: "Item quantity updated successfully", cart });
}

async function deleteItem(req, res) {
  const user = req.user;
  const itemId = req.params.id;
  let cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === itemId
  );
  if (itemIndex < 0) {
    return res.status(404).json({ message: "Item not found in cart" });
  }
  cart.items.splice(itemIndex, 1);
  await cart.save();
  res
    .status(200)
    .json({ message: "Item removed from cart successfully", cart });
}

module.exports = { addItemsToCart, getCartItems, updateItem, deleteItem };
