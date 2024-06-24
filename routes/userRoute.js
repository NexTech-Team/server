const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserProfile,
} = require("../controller/userController");
const verifyJWT = require("../middleware/verifyJWT");

router.get("/profile", verifyJWT, getUserProfile);
router.put("/profile", verifyJWT, updateUserProfile);
router.put("/password", verifyJWT, changeUserPassword);
router.delete("/profile", verifyJWT, deleteUserProfile);

module.exports = router;
