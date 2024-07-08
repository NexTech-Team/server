const { User, CarAds, FavouriteAds } = require("../models");
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

const getYourAds = async (req, res) => {
  try {
    const userAds = await CarAds.findAll({
      where: {
        userId: req.id,
      },
    });

    console.log("User ads", userAds);
    res.json(userAds);
  } catch (error) {
    console.error("Failed to fetch user ads:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUserAds = async (req, res) => {
  const { id } = req.body;
  try {
    const ad = await CarAds.findByPk(id);
    if (ad.userId !== req.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await ad.destroy();
    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Failed to delete ad:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addFavouriteAd = async (req, res) => {
  const { id } = req.body;
  try {
    const favouriteAd = await FavouriteAds.create({
      userId: req.id,
      carId: id,
    });
    console.log("Favourite ad", favouriteAd);
    res.json({ message: "Ad added to favourites" });
  } catch (error) {
    console.error("Failed to add favourite ad:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const fetchFavouriteAds = async (req, res) => {
  try {
    // Step 1: Fetch all favourite ads for the user
    const favouriteAds = await FavouriteAds.findAll({
      where: {
        userId: req.id,
      },
    });

    // Step 2: Check if no favourite ads found
    if (favouriteAds.length === 0) {
      return res.status(404).json({ message: "No favourite ads found" });
    }

    // Step 3: Extract carIds from the favourite ads
    const carIds = favouriteAds.map((favouriteAd) => favouriteAd.carId);

    // Step 4: Fetch the related car ads using carIds
    const carAds = await CarAds.findAll({
      where: {
        id: carIds,
      },
    });

    // Step 5: Merge favourite ads info with car ads
    const result = carAds.map((carAd) => {
      const favouriteAd = favouriteAds.find((fav) => fav.carId === carAd.id);
      return {
        ...carAd.toJSON(),
        favouriteAdId: favouriteAd.id, // Adding favouriteAdId for reference
      };
    });
    console.log("Favourite ads", result);
    // Step 6: Respond with the fetched car ads and favourite ad information
    res.json(result);
  } catch (error) {
    console.error("Failed to fetch favourite ads:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeFavourites = async (req, res) => {
  const { id } = req.body;
  const userId = req.id;

  if (!id) return res.status(400).json({ message: "Not Valid Car Id" });
  if (!userId) return res.status(400).json({ message: "Unotherize" });

  try {
    const favouriteAd = await FavouriteAds.findOne({
      where: {
        carId: id,
        userId: userId,
      },
    });
    if (!favouriteAd) {
      return res.status(404).json({ message: "Favourite ad not found" });
    }
    if (favouriteAd.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You does not have access to remove this ads" });
    }
    await favouriteAd.destroy();
    res.json({ message: "Favourite ad removed" });
  } catch (error) {
    console.error("Failed to remove favourite ad:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getYourAds,
  deleteUserAds,
  addFavouriteAd,
  fetchFavouriteAds,
  removeFavourites,
};
