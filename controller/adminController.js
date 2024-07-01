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
  console.log("Approved Ads");
  try {
    const approvedAds = await CarAds.findAll({
      where: {
        adminId: { [Op.not]: null },
      },
    });
    console.log("Approved Ads", approvedAds);

    const adminName = await User.findByPk(approvedAds.adminId);
    console.log("Admin Name", adminName);
    console.log("Approved Ads", approvedAds);
    res.status(200).json({ approvedAds, adminName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getPendings,
  getApprovedAds,
};
