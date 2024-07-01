const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const {
  getUsers,
  getPendings,
  getApprovedAds,
} = require("../controller/adminController");

router.get("/users/data", getUsers);
router.get("/pending-ads/data", getPendings);
router.get("/approved/data", getApprovedAds);

module.exports = router;
