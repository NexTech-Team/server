const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const { sendSMS } = require("../utils/sendSMS");
const redisClient = require("../utils/redisClient");
const dotenv = require("dotenv");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");

dotenv.config();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  redisClient.set(user.id.toString(), refreshToken, {
    EX: process.env.REDIS_EXP || 259200, // Default to 3 days if not set
  });
  return { accessToken, refreshToken };
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .padStart(6, "0");
};

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
  await redisClient.set(email, code.toString(), { EX: 300 });

  await sendEmail.sendActivationEmail(email, code, newUser.name, "verifyEmail");

  res.status(200).json({
    message: "User created successfully. Verification email sent.",
  });
});

const emailLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }
  if (user.status === "inactive") {
    return res.status(400).json({ message: "User not verified" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }
  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, message: "User logged in successfully" });
});

const emailVerification = asyncHandler(async (req, res) => {
  const { email, code } = req.params;
  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }
  const storedCode = await redisClient.get(email);
  if (!storedCode) {
    return res.status(400).json({ message: "Verification code expired" });
  }
  if (storedCode !== code) {
    return res.status(400).json({ message: "Invalid verification code" });
  }
  redisClient.del(email); // Delete the key after successful verification
  const user = await User.findOne({ where: { email } });
  if (user.status === "active") {
    return res.status(400).json({ message: "User already verified" });
  }
  await User.update({ status: "active" }, { where: { email } });
  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, message: "Email verified successfully" });
});

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
  await redisClient.set(email, code.toString(), { EX: 300 });

  await sendEmail.sendActivationEmail(email, code, user.name, "verifyEmail");

  res.status(200).json({
    message: "Verification email sent",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const token = jwt.sign(
    { email: user.email, id: user.id },
    process.env.RESET_PASSWORD_SECRET,
    { expiresIn: "15m" }
  );
  const passwordResetURL = `${process.env.AUTH_URL}/resetPassword/${user.id}/${token}`;

  await sendEmail.sendActivationEmail(
    user.email,
    passwordResetURL,
    user.name,
    "resetPassword"
  );

  res.status(200).json({ message: "Password reset email sent" });
});

const passwordReset = asyncHandler(async (req, res) => {
  const { id, token, password, confirmPassword } = req.body;
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
    return res.status(400).json({ message: "User not found" });
  }
  const payload = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
  if (payload.id !== id) {
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

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ user, accessToken, message: "Phone verified successfully" });
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
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

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

      res.json({ accessToken });
    }
  );
});

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
};
