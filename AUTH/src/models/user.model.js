const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    fullName: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    role: {
      type: String,
      enum: ["user", "seller"],
      default: "user",
    },
    profilePic: {
      type: String,
      default:
        "https://ik.imagekit.io/oruoqrvqm/AIMart/default_profile_pic.webp?updatedAt=1759827350283",
    },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
