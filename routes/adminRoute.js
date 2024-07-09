const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const {
  getUsers,
  getPendings,
  getApprovedAds,
  deleteUserAds,
  changeUserRole,
  deleteUser,
  approveAds,
} = require("../controller/adminController");

router.get("/users/data", verifyJWT, getUsers);
router.get("/pending-ads/data", verifyJWT, getPendings);
router.get("/approved/data", verifyJWT, getApprovedAds);
router.delete("/deleteUserAds", verifyJWT, deleteUserAds);
router.post("/change-user-status", verifyJWT, changeUserRole);
router.delete("/deleteUser", verifyJWT, deleteUser);
router.post("/approve-ad", verifyJWT, approveAds);

module.exports = router;
