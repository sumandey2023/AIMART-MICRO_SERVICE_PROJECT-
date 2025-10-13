const express = require("express");
const router = express.Router();
const createMiddleware = require("../middlewares/auth.middleware");
const cartController = require("../controllers/cart.controller");
const validation = require("../middlewares/validation.middleware");

router.get("/", createMiddleware(["user"]), cartController.getCart);

router.post(
  "/items",
  validation.validateAddItemsToCart,
  createMiddleware(["user"]),
  cartController.addItemsToCart
);

router.get(
  "/getitems",
  createMiddleware(["user"]),
  cartController.getCartItems
);
router.patch(
  "/updatecart/:id",
  createMiddleware(["user"]),
  cartController.updateItem
);
router.delete(
  "/deletecartitem/:id",
  createMiddleware(["user"]),
  cartController.deleteItem
);

module.exports = router;
