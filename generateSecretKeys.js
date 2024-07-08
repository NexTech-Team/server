const crypto = require("crypto");

const generateSecretKey = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

const accessTokenSecret = generateSecretKey(32); // 32 bytes = 64 characters in hex
const refreshTokenSecret = generateSecretKey(32); // 32 bytes = 64 characters in hex
const resetPasswordSecret = generateSecretKey(32); // 32 bytes = 64 characters in hex

console.log("ACCESS_TOKEN_SECRET:", accessTokenSecret);
console.log("REFRESH_TOKEN_SECRET:", refreshTokenSecret);
console.log("RESET_PASSWORD_SECRET:", resetPasswordSecret);
