const { CarAds, User } = require("../models");

const getUsers = async (req, res) => {
  //   const { page, size } = req.query;
  try {
    const users = await User.findAll({
      //   limit: size,
      //   offset: page * size,
    });
    // console.log("Users", users);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendings = async (req, res) => {
  try {
    const pendings = await CarAds.findAll({
      where: {
        adminId: null,
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
    console.log("Get Approved Ads");
    const { Op } = require("sequelize");
    const approvedAds = await CarAds.findAll({
      where: {
        adminId: { [Op.not]: null },
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

module.exports = {
  getUsers,
  getPendings,
  getApprovedAds,
};
