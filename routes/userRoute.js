const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getYourAds,
  deleteUserAds,
  addFavouriteAd,
  fetchFavouriteAds,
  removeFavourites,
} = require("../controller/userController");
const verifyJWT = require("../middleware/verifyJWT");

router.get("/profile", verifyJWT, getUserProfile);
router.put("/profile", verifyJWT, updateUserProfile);
router.put("/password", verifyJWT, changeUserPassword);
router.delete("/profile", verifyJWT, deleteUserProfile);
router.get("/getYourAds", verifyJWT, getYourAds);
router.delete("/deleteYourAds", verifyJWT, deleteUserAds);
router.post("/add-favourite", verifyJWT, addFavouriteAd);
router.get("/get-favourite", verifyJWT, fetchFavouriteAds);
router.delete("/remove-favourite", verifyJWT, removeFavourites);

module.exports = router;
