// const express = require('express');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const { sendSMS } = require("../utils/sendSMS");
const redisClient = require("../utils/redisClient");
const dotenv = require("dotenv");
const asyncHandler = require("express-async-handler");

dotenv.config();

// Cookie settings for different environments
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // secure only in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // SameSite policy
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refreshToken
};

// Generate Tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "2h" }
  );
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" } // 30 days
  );
  redisClient.set(user.id.toString(), refreshToken, {
    EX: 2592000, // 30 days in seconds
  });
  return { accessToken, refreshToken };
};

// Generate Verification Code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .padStart(6, "0");
};

// Email Registration
const emailRegister = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      message:
        existingUser.status === "active"
          ? "User already exists, Please log in."
          : "User already exists but not verified",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    status: "inactive",
  });
  const code = generateVerificationCode();
  await redisClient.set(email, code.toString(), { EX: 300 }); // 5 minutes expiration

  await sendEmail.sendActivationEmail(email, code, newUser.name, "verifyEmail");

  res.status(200).json({
    message: "User created successfully. Verification email sent.",
  });
});

// Email Login
const emailLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res
      .status(400)
      .json({ message: "User not found. Please register first" });
  }
  if (user && user.password === null) {
    return res.status(400).json({
      message:
        "User has signed up with social login. Please login with social login",
    });
  }
  if (user.status === "inactive") {
    return res
      .status(400)
      .json({ message: "User not verified. Please verify first" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }
  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("jwt", refreshToken, cookieOptions);

  res.json({ accessToken, message: "User logged in successfully" });
});

// Email Verification
const emailVerification = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }
  const storedCode = await redisClient.get(email);
  if (!storedCode) {
    return res.status(400).json({
      message: "Verification code expired, please click resend otp button",
    });
  }
  if (storedCode !== code) {
    return res.status(400).json({ message: "Invalid verification code" });
  }
  await redisClient.del(email); // Delete the key after successful verification
  const user = await User.findOne({ where: { email } });
  if (user.status === "active") {
    return res.status(400).json({ message: "User already verified" });
  }
  await User.update({ status: "active" }, { where: { email } });
  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("jwt", refreshToken, cookieOptions);

  res.json({ accessToken, message: "Email verified successfully" });
});

// Resend Email Verification Code
const resendEmailVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const code = generateVerificationCode();
  await redisClient.set(email, code.toString(), { EX: 300 }); // 5 minutes expiration

  await sendEmail.sendActivationEmail(email, code, user.name, "verifyEmail");

  res.status(200).json({ message: "Verification email sent" });
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log("Email: ", email);
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  console.log("User: ", user);
  console.log("Reset Password Secret: ", process.env.RESET_PASSWORD_SECRET);
  console.log("Auth URL: ", process.env.AUTH_URL);

  const token = jwt.sign(
    { email: user.email, id: user.id },
    process.env.RESET_PASSWORD_SECRET,
    { expiresIn: "15m" }
  );
  const passwordResetURL = `${process.env.AUTH_URL}/password-reset?id=${user.id}&token=${token}`;

  await sendEmail.sendActivationEmail(
    user.email,
    passwordResetURL,
    user.name,
    "resetPassword"
  );

  res.status(200).json({ message: "Password reset email sent" });
});

// Password Reset
const passwordReset = asyncHandler(async (req, res) => {
  const { id, token, password, confirmPassword } = req.body;
  console.log("ID: ", id);
  console.log("Token: ", token);
  console.log("Password: ", password);
  console.log("Confirm Password: ", confirmPassword);

  if (!id || !token || !password || !confirmPassword) {
    return res.status(400).json({
      message: "ID, token, password, and confirm password are required",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  const user = await User.findOne({ where: { id } });
  if (!user) {
    return res
      .status(400)
      .json({ message: "User not found,Please recheck you entered Email" });
  }
  const payload = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
  console.log("Payload: ", payload);
  if (!payload) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
  if (payload.id !== user.id) {
    return res.status(400).json({ message: "Invalid token" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.update({ password: hashedPassword }, { where: { id } });

  res.status(200).json({ message: "Password reset successfully" });
});

const phoneLogin = asyncHandler(async (req, res) => {
  const { phone, countryCode } = req.body;
  if (!phone || !countryCode) {
    return res
      .status(400)
      .json({ message: "Phone and country code are required" });
  }
  const user = await User.findOne({ where: { phone } });
  if (!user) {
    return res
      .status(400)
      .json({ message: "User not found, please register first" });
  }
  const code = generateVerificationCode();
  console.log("Verification Code: ", code);
  await sendSMS(phone, countryCode, code);
  await redisClient.set(phone, code.toString(), { EX: 300 });
  res.status(200).json({ message: `Verification code sent to ${phone}` });
});

const phoneRegister = asyncHandler(async (req, res) => {
  const { phone, name, countryCode } = req.body;
  if (!phone || !name || !countryCode) {
    return res
      .status(400)
      .json({ message: "Phone, name, and country code are required" });
  }
  const code = generateVerificationCode();
  console.log("Verification Code: ", code);
  console.log("Phone: ", phone);
  console.log("Country Code: ", countryCode);
  await sendSMS(phone, countryCode, code);
  await redisClient.set(phone, code.toString(), { EX: 300 });

  const newUser = await User.create({
    phone,
    name,
    status: "inactive",
  });

  res
    .status(200)
    .json({ message: "User registered successfully. Verification code sent." });
});

const phoneVerification = asyncHandler(async (req, res) => {
  const { phoneNumber: phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ message: "Phone and code are required" });
  }
  const storedCode = await redisClient.get(phone);
  if (!storedCode) {
    return res.status(400).json({ message: "Verification code expired" });
  }
  if (storedCode !== code) {
    return res.status(400).json({ message: "Invalid verification code" });
  }
  const user = await User.findOne({ where: { phone } });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  if (user.status === "inactive") {
    await User.update({ status: "active" }, { where: { phone } });
  }
  await redisClient.del(phone);

  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("jwt", refreshToken, cookieOptions);

  res.json({ accessToken, message: "Phone verified successfully" });
});

const resendPhoneVerificationCode = asyncHandler(async (req, res) => {
  const { phone, countryCode } = req.body;
  if (!phone || !countryCode) {
    return res
      .status(400)
      .json({ message: "Phone and country code are required" });
  }
  const code = generateVerificationCode();
  await sendSMS(phone, countryCode, code);
  await redisClient.set(phone, code.toString(), { EX: 300 });
  res.status(200).json({ message: `Verification code sent to ${phone}` });
});

const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  console.log("Cookies: ", req.cookies.jwt);
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      console.log("Try to find User: ", decoded.id);
      const foundUser = await User.findOne({ where: { id: decoded.id } });
      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            userId: foundUser.id,
            username: foundUser.name,
            role: foundUser.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      console.log("In Refresh Access Token: ", accessToken);
      res.json({ accessToken });
    }
  );
});

const socialLogin = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      let newUser = await User.create({
        name,
        email,
        status: "active",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);
    console.log("Cookie Options: ", cookieOptions);
    console.log("Refresh Token: ", refreshToken);
    console.log("Access Token: ", accessToken);
    res.json({ accessToken, message: "User logged in successfully" });
  } catch (error) {
    console.error("Social login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  emailRegister,
  emailLogin,
  emailVerification,
  resendEmailVerificationCode,
  forgotPassword,
  passwordReset,
  phoneLogin,
  phoneRegister,
  phoneVerification,
  resendPhoneVerificationCode,
  refresh,
  logout,
  socialLogin,
};
