const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const loginLimiter = require("../middleware/loginLimiter");

router.post("/email-register", authController.emailRegister);
router.post("/email-login", loginLimiter, authController.emailLogin);
router.post("/verify-email", loginLimiter, authController.emailVerification);
router.post(
  "/resend-email-verification",
  authController.resendEmailVerificationCode
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.passwordReset);
router.post("/phone-login", loginLimiter, authController.phoneLogin); // Ensure this is the correct route
router.post("/phone-register", authController.phoneRegister);
router.post("/phone-verify", loginLimiter, authController.phoneVerification);
router.post(
  "/resend-phone-verification",
  authController.resendEmailVerificationCode
);
router.post("/logout", authController.logout);
router.get("/refresh", authController.refresh);

module.exports = router;
