const express = require("express");
const validator = require("../middlewares/validator.middleware");
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

//POST /api/auth/register
router.post(
  "/register",
  validator.registerUservalidations,
  authController.registerUser
);

//POST /api/auth/login
router.post("/login", validator.loginUservalidations, authController.loginUser);

//GET /api/auth/me
router.get("/me", authMiddleware.authmiddleware, authController.getCurrentUser);

//GET /api/auth/logout
router.get("/logout", authController.logoutUser);

//GET /api/auth/users/me/addresses
router.get(
  "/users/me/addresses",
  authMiddleware.authmiddleware,
  authController.getUserAddresses
);

//POST /api/auth/users/me/addresses
router.post(
  "/users/me/addresses",
  authMiddleware.authmiddleware,
  validator.addUserAddressValidations,
  authController.addUserAddress
);

//DELETE /api/auth/users/me/addresses/:addressId
router.delete(
  "/users/me/addresses/:addressId",
  authMiddleware.authmiddleware,
  authController.deleteUSerAddress
);

module.exports = router;
