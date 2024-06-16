const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const { sendSMS } = require("../utils/sendSMS");
const redisClient = require("../utils/redisClient");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3d" }
  );
  redisClient.set(user.id.toString(), refreshToken, {
    EX: process.env.REDIS_EXP || 259200,
  }); // Default to 3 days if not set
  return { accessToken, refreshToken };
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .padStart(6, "0");
};

const generateEmailToken = async (userId) => {
  try {
    const token = crypto.randomBytes(16).toString("hex");
    await redisClient.set(token, userId.toString(), {
      EX: process.env.EMAIL_EXP || 300,
    }); // Default to 5 minutes if not set
    return token;
  } catch (error) {
    throw new Error("Error in generateEmailToken: " + error.message);
  }
};

const generateEmailLink = (token, userId) => {
  try {
    return `${process.env.AUTH_URL}/emailVerified/${userId}/${token}`;
  } catch (error) {
    throw new Error("Error in generateEmailLink: " + error.message);
  }
};

// Email Registration Handler
const emailRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      if (existingUser.status === "active") {
        return res
          .status(400)
          .json({ message: "User already exists. Please log in." });
      } else {
        return res
          .status(400)
          .json({ message: "User already exists but not verified" });
      }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      status: "inactive",
    });
    const code = generateVerificationCode();
    // const emailToken = await generateEmailToken(newUser.id);
    // const emailLink = generateEmailLink(emailToken, newUser.id);

    await sendEmail.sendActivationEmail(
      email,
      code,
      newUser.name,
      "verifyEmail"
    );

    return res
      .status(200)
      .json({ message: "User created successfully. Verification email sent." });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Something went wrong: " + error.message });
  }
};

// Email Login Handler
const emailLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (user.status === "inactive") {
      return res.status(400).json({ message: "User not verified" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const tokens = generateTokens(user);
    return res
      .status(200)
      .json({ tokens, message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Email Verification Handler
const emailVerification = async (req, res) => {
  const { id, token } = req.params;
  if (!id || !token) {
    return res.status(400).json({ message: "User ID and token are required" });
  }
  try {
    const userId = await redisClient.get(token);
    if (!userId || userId !== id) {
      return res
        .status(400)
        .json({ message: "Invalid token or your token is expired" });
    }
    const user = await User.findOne({ where: { id: userId } });
    if (user.status === "active") {
      return res.status(400).json({ message: "User already verified" });
    }

    await User.update({ status: "active" }, { where: { id } });
    res.json({ message: "Email verified" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Resend Email Confirmation Link Handler
const resendEmailConfirmationLink = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const emailToken = await generateEmailToken(id);
    const emailLink = generateEmailLink(emailToken, id);
    const user = await User.findOne({ where: { id } });
    await sendEmail.sendActivationEmail(
      user.email,
      emailLink,
      user.name,
      "verifyEmail"
    );
    res.json({
      message: "A new verification email has been sent to your email address",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Forgot Password Handler
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
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
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Password Reset Handler
const passwordReset = async (req, res) => {
  const { id, token, password, confirmPassword } = req.body;
  if (!id || !token || !password || !confirmPassword) {
    return res.status(400).json({
      message: "ID, token, password, and confirm password are required",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const payload = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    if (payload.id !== id) {
      return res.status(400).json({ message: "Invalid token" });
    }
    await User.update(
      { password: bcrypt.hashSync(password, 10) },
      { where: { id } }
    );
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Phone Login Handler
const phoneLogin = async (req, res) => {
  const { phone, countryCode } = req.body;
  if (!phone || !countryCode) {
    return res
      .status(400)
      .json({ message: "Phone and country code are required" });
  }
  try {
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.json({ message: "User not active, please register first" });
    }

    const code = generateVerificationCode();
    console.log("Verification code: ", code);
    await sendSMS(phone, countryCode, code);
    await redisClient.set(phone, code.toString(), { EX: 300 });
    return res
      .status(200)
      .json({ message: `Verification code sent to ${phone}` });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Phone Registration Handler
const phoneRegister = async (req, res) => {
  console.log(req.body);
  const { phone, name, countryCode } = req.body;
  if (!phone || !name || !countryCode) {
    return res
      .status(400)
      .json({ message: "Phone, name, and country code are required" });
  }
  try {
    const code = generateVerificationCode();
    console.log("Verification code: ", code);
    await sendSMS(phone, countryCode, code);
    await redisClient.set(phone, code.toString(), { EX: 300 });

    const user = await User.create({
      phone,
      name,
      status: "inactive",
    });

    return res.status(200).json({ message: "User Register Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Phone Verification Handler
const phoneVerification = async (req, res) => {
  console.log(req.body);
  const { phoneNumber: phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ message: "Phone and code are required" });
  }
  try {
    const storedCode = await redisClient.get(phone);
    console.log("Stored code: ", storedCode);

    if (storedCode !== code) {
      return res.status(202).json({
        message: "Invalid verification code,Please recheck again!",
      });
    }
    if (!storedCode) {
      return res.status(202).json({
        message: "Verification code expired, Please request a new one!",
      });
    }

    // Delete the code from redis
    await redisClient.del(phone);

    // Check if user exists and is inactive
    let user = await User.findOne({ where: { phone } });
    console.log(user);
    if (user && user.status === "inactive") {
      await User.update({ status: "active" }, { where: { phone } });
    }

    // Generate tokens
    const tokens = generateTokens(user);
    return res
      .status(200)
      .json({ tokens: tokens, message: "Phone verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Resend Phone Verification Code Handler
const resendPhoneVerificationCode = async (req, res) => {
  const { phone, countryCode } = req.body;
  if (!phone || !countryCode) {
    return res
      .status(400)
      .json({ message: "Phone and country code are required" });
  }
  try {
    const code = generateVerificationCode();
    await sendSMS(phone, countryCode, code);
    await redisClient.set(phone, code.toString(), { EX: 300 });
    return res
      .status(200)
      .json({ message: `Verification code sent to ${phone}` });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Export all handlers
module.exports = {
  emailRegister,
  emailLogin,
  emailVerification,
  resendEmailConfirmationLink,
  forgotPassword,
  passwordReset,
  phoneLogin,
  phoneRegister,
  phoneVerification,
  resendPhoneVerificationCode,
};
