const { User } = require("../models");

exports.getUserById = async (id) => {
  return await User.findByPk(id);
};

exports.updateUserById = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }
  user.firstName = data.firstName;
  user.lastName = data.lastName;
  user.email = data.email;
  user.phone = data.phone;
  await user.save();
  return user;
};

exports.deleteUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }
  await user.destroy();
};
