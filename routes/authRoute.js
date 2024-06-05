const express = require("express");
const authController = require("../controller/authController");
const authService = require("../service/authServices");

const router = express.Router();

router.post("/email-login", authController.emailLogin);
router.post("/email-register", authController.emailRegister);
router.post("/phone-login", authController.phoneLogin);
router.post("/phone-register", authController.phoneRegister);
// router.post("/auth/verification", authController.verification);
// // router.post("/auth/forgot-password", authController.forgotPassword);
// router.post("/auth/logout", authController.logout);
// router.post(
//   "/auth/refresh-token",
//   authService.verifyRefreshToken,
//   authService.refreshTokens
// );

module.exports = router;
