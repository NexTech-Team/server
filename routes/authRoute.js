const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/email-register", authController.emailRegister);
router.post("/email-login", authController.emailLogin);
router.post("/verify-email", authController.emailVerification);
router.post(
  "/resend-email-confirmation",
  authController.resendEmailConfirmationLink
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.passwordReset);
router.post("/phone-login", authController.phoneLogin); // Ensure this is the correct route
router.post("/phone-register", authController.phoneRegister);
router.post("/phone-verify", authController.phoneVerification);
// router.post(
//   "/resend-phone-verification",
//   authController.resentPhoneVerificationCode
// );

module.exports = router;
