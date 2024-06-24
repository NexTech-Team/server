const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUserProfile = async (req, res) => {
  try {
    console.log("User ", req.id);
    const user = await User.findByPk(req.id, {
      attributes: ["name", "email", "phone", "role"],
    });
    console.log("User profile", user);
    res.json(user);
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  console.log("Update profile", req.body);
  const { name, email, phone } = req.body;
  try {
    const user = await User.findByPk(req.id);
    user.name = name;
    user.email = email;
    user.phone = phone;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Failed to update user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const changeUserPassword = async (req, res) => {
  console.log("Change password", req.body);
  console.log("User", req.id);
  const { newPassword } = req.body;
  try {
    const user = await User.findByPk(req.id);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Failed to change password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.id);
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserProfile,
};
