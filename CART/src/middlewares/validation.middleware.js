const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const validateAddItemsToCart = [
  body("productId")
    .isString()
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Product ID"),
  body("qty")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be an integer greater than 0"),
  validateRequest,
];

module.exports = { validateAddItemsToCart };
