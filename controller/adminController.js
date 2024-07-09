const { CarAds, User } = require("../models");

const getUsers = async (req, res) => {
  try {
    isAdmin = req.roles === "admin" ? req.roles : null;
    console.log("isAdmin", isAdmin);
    if (isAdmin !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const users = await User.findAll();
    console.log("Users", users);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendings = async (req, res) => {
  try {
    isAdmin = req.roles === "admin" ? req.roles : null;
    console.log("isAdmin", isAdmin);
    if (isAdmin !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const pendings = await CarAds.findAll({
      where: {
        isApproved: false,
      },
    });
    console.log("Pendings", pendings);
    res.status(200).json(pendings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApprovedAds = async (req, res) => {
  try {
    isAdmin = req.roles === "admin" ? req.roles : null;
    console.log("isAdmin", isAdmin);
    if (isAdmin !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Get Approved Ads");
    const { Op } = require("sequelize");
    const approvedAds = await CarAds.findAll({
      where: {
        isApproved: true,
      },
    });
    console.log("Approved Ads", approvedAds);

    if (!approvedAds) {
      return res
        .status(400)
        .json({ message: "Admin No approved any ads yet." });
    }
    console.log("Approved Ads", approvedAds);

    // Fetch admin details for each approved ad
    const adminDetailsPromises = approvedAds.map(async (ad) => {
      const admin = await User.findByPk(ad.adminId);
      return {
        ...ad.dataValues, // Spread ad data
        adminName: admin ? admin.name : null, // Include admin name if admin exists
      };
    });

    const adsWithAdminDetails = await Promise.all(adminDetailsPromises);
    console.log("Ads with Admin Details", adsWithAdminDetails);

    res.status(200).json({ adsWithAdminDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUserAds = async (req, res) => {
  const { id } = req.body;
  try {
    isAdmin = req.roles === "admin" ? req.roles : null;
    console.log("isAdmin", isAdmin);
    if (isAdmin !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const ad = await CarAds.findByPk(id);
    // if (ad.userId !== req.id) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }
    await ad.destroy();
    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Failed to delete ad:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const changeUserRole = async (req, res) => {
  const { id, role } = req.body;
  console.log("id", id);
  console.log("role", role);
  console.log("req.roles", req.roles);
  try {
    isAdmin = req.roles === "admin" ? req.roles : null;
    console.log("isAdmin", isAdmin);
    if (isAdmin !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = role;
    await user.save();
    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Failed to update user role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.body;
  try {
    isAdmin = req.roles === "admin" ? req.roles : null;
    console.log("isAdmin", isAdmin);
    if (isAdmin !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getUsers,
  getPendings,
  getApprovedAds,
  deleteUserAds,
  changeUserRole,
  deleteUser,
};
