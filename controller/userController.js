const { User } = require("../models");

exports.getUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone } = req.body;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.phone = phone;
  await user.save();
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  await user.destroy();
  res.json({ message: "User deleted" });
};
