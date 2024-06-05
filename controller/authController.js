const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const { sendSMS } = require("../utils/sendSMS");
const redisClient = require("../utils/redisClient");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { stat } = require("fs");

dotenv.config();

const generateTokens = (user) => {
  //What are thingmust be sent as token and how it is work
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
  redisClient.set(user.id.toString(), refreshToken);
  if (process.env.REDIS_EXP) {
    redisClient.expire(refreshToken, process.env.REDIS_EXP);
  }
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
    await redisClient.set(token, userId.toString(), "EX", 300);
    if (process.env.EMAIL_EXP) {
      redisClient.expire(token, process.env.EMAIL_EXP);
    }
    return token;
  } catch (error) {
    throw new Error("Error in generateEmailToken: " + error.message);
  }
};

const generateEmailLink = async (token, userId) => {
  try {
    return `${process.env.AUTH_URL}/emailVerified/${userId}/${token}`;
  } catch (error) {
    throw new Error("Error in generateEmailLink: " + error.message);
  }
};

// exports.emailVerification = async (req, res) => {
//   const { email, token } = req.body;
//   if (!email || !token) {
//     return res.status(400).json({ message: "Email and token are required" });
//   }
//   try {
//     const userEmail = await redisClient.get(token);
//     if (email !== userEmail) {
//       return res.status(400).json({ message: "Invalid token" });
//     }
//     res.json({ message: "Email verified" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error: " + error.message });
//   }
// };

const emailRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      message: "Name, email, password, and confirm password are required",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.status === "active") {
      return res
        .status(400)
        .json({ message: "User already exists. Please log in." });
    }
    if (existingUser && existingUser.status === "inactive") {
      return res
        .status(400)
        .json({ message: "User already exists but not verified" });
    }

    const newUser = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      status: "inactive",
    });
    console.log("newUser: ", newUser.id);

    const emailToken = await generateEmailToken(newUser.id);
    const emailLink = await generateEmailLink(emailToken, newUser.id);

    await sendEmail.sendActivationEmail(
      email,
      emailLink,
      newUser.name,
      "verifyEmail"
    );

    return res.status(200).json({
      message: "User created successfully. Verification email sent.",
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Something went wrong: " + error.message });
  }
};

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
      .json({ tokens: tokens, message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

const emailVerification = async (req, res) => {
  //TODO : Create Interface for after user click on email link
  const { id, token } = req.params;
  console.log("id: ", id);
  console.log("token: ", token);
  if (!id || !token) {
    return res.status(400).json({ message: "User ID and token are required" });
  }
  try {
    const userId = await redisClient.get(token);
    console.log("userId: ", userId);
    if (!userId && userId !== id) {
      return res
        .status(400)
        .json({ message: "Invalid token or your token is expired" });
    }
    if (userId) {
      const user = await User.findOne({ where: { userId } });
      if (user.status === "active") {
        return res.status(400).json({ message: "User already verified" });
      }
    }

    await User.update({ status: "active" }, { where: { id } });
    res.json({ message: "Email verified" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

const resendEmailConfirmationLink = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const emailToken = await generateEmailToken(id);
    const emailLink = await generateEmailLink(emailToken, id);
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
    res.status(500).json({
      message: "Server error: " + error.message,
    });
  }
};

const phoneLogin = async (req, res) => {
  const { phone, countryCode } = req.body;
  console.log("phone: ", phone);
  if (!phone || !countryCode) {
    return res
      .status(400)
      .json({ message: "Phone and country code are required" });
  }
  try {
    const user = await User.findOne({ where: { phone: phone } });

    const code = generateVerificationCode();
    await sendSMS(phone, countryCode, code);
    await redisClient.set(phone, code.toString(), "EX", 300);

    if (process.env.PHONE_EXP) {
      redisClient.expire(phone, process.env.PHONE_EXP);
    }
    if (!user) {
      const newUser = await User.create({ phone: phone });
      // return res.status(400).json({ message: "User not found" });
      //Send Request to Phone Register
    }
    //TODO: User to five intruction about code expire time
    console.log("Phone login Done");

    return res.status(200).json({ message: `Verification code sent ${phone}` });
  } catch (error) {
    console.log("Phone Error", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

const phoneRegister = async (req, res) => {
  const { name, phone, countryCode } = req.body;
  if (!name || !phone || !countryCode) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    if (await User.findOne({ where: { phone } })) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    await User.create({ name, phone });

    res.json({ message: "User Created Succsesfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

const phoneVerification = async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ message: "Phone and code are required" });
  }
  try {
    const redisCode = await redisClient.get(phone);
    if (!redisCode) {
      return res.status(400).json({ message: "Code Expired" });
    }
    if (code !== redisCode) {
      return res.status(400).json({ message: "Invalid code" });
    }
    const user = await User.findOne({ where: { phone } });
    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

const resentPhoneVerificationCode = async (req, res) => {
  const { phone, countryCode } = req.body;
  if (!phone || !countryCode) {
    return res
      .status(400)
      .json({ message: "Phone and country code are required" });
  }
  try {
    const code = generateVerificationCode();
    await sendSMS(phone, countryCode, code);
    await redisClient.set(phone, code.toString(), "EX", 300);
    if (process.env.PHONE_EXP) {
      redisClient.expire(phone, process.env.PHONE_EXP);
    }
    res.json({ message: "User created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

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

    // let payload = {
    //   email: user.email,
    //   id: user._id,
    // };
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "15m" }
    );

    //Create interface for user to reset password
    const passwordResetURL = `${process.env.AUTH_URL}/resetPassword/${user.id}/${token}`;

    await emailService.sendActivationEmail(
      user.email,
      passwordResetURL,
      user.first_name,
      "resetPassword"
    );
    await redisClient.set(email, code.toString(), "EX", 300);
    res.json({ message: "Verification code sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

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
    const secret = process.env.RESET_PASSWORD_SECRET;
    const payload = jwt.verify(token, secret);
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

// exports.logout = async (req, res) => {
//   const { userId } = req.body;
//   if (!userId) {
//     return res.status(400).json({ message: "User ID is required" });
//   }
//   try {
//     await redisClient.del(userId.toString());
//     res.json({ message: "Logged out" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error: " + error.message });
//   }
// };

module.exports = {
  emailRegister,
  emailLogin,
  emailVerification,
  resendEmailConfirmationLink,
  forgotPassword,
  phoneLogin,
  phoneRegister,
  resentPhoneVerificationCode,
  phoneVerification,
  passwordReset,

  // forgotPassword,
  // logout,
};
