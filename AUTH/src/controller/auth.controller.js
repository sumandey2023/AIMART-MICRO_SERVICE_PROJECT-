const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { redis } = require("../db/redis");
const { publishToQueue } = require("../broker/broker");

async function registerUser(req, res) {
  try {
    const {
      username,
      email,
      password,
      fullName: { firstName, lastName },
      role,
    } = req.body;

    const isUserExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserExist) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      fullName: { firstName, lastName },
      role: role || "user",
    });

    await Promise.all([
      publishToQueue("AUTH_NOTIFICATION.USER_CREATED", {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }),
      // publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", user),
    ]);

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res
      .status(201)
      .json({ message: "User registered successfully", user, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

async function loginUser(req, res) {
  // Implementation for loginUser function
  try {
    const { username, email, password } = req.body;

    const user = await userModel
      .findOne({ $or: [{ email }, { username }] })
      .select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res
      .status(201)
      .json({ message: "User logged in successfully", user, token });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

async function getCurrentUser(req, res) {
  return res
    .status(200)
    .json({ message: "user fetched successfully", user: req.user });
}

async function logoutUser(req, res) {
  const token = req.cookies.token;
  if (token) {
    await redis.set(`blacklist:${token}`, "true", "EX", 24 * 60 * 60); // Set expiry to 1 day
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({ message: "Logged out successfully" });
}

async function getUserAddresses(req, res) {
  const userId = req.user._id;
  const user = await userModel.findById(userId).select("addresses");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({
    message: "Addresses fetched successfully",
    addresses: user.addresses,
  });
}

async function addUserAddress(req, res) {
  const userId = req.user._id;
  const { street, city, state, zip, country, isDefault } = req.body;

  const user = await userModel.findOneAndUpdate(
    { _id: userId },
    {
      $push: {
        addresses: { street, city, state, zip, country, isDefault },
      },
    },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({
    message: "Address added successfully",
    addresses: user.addresses,
  });
}

async function deleteUSerAddress(req, res) {
  const userId = req.user._id;
  const addressId = req.params.addressId;

  const isAddressExist = await userModel.findOne({
    _id: userId,
    "addresses._id": addressId,
  });

  if (!isAddressExist) {
    return res.status(404).json({ message: "Address not found" });
  }

  const user = await userModel.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({
    message: "Address deleted successfully",
    addresses: user.addresses,
  });
}
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getUserAddresses,
  addUserAddress,
  deleteUSerAddress,
};
