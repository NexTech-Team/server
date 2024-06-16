const crypto = require("crypto");

// Generate a random 32-byte (256-bit) hexadecimal string
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

const accessTokenSecret = generateSecretKey();
const refreshTokenSecret = generateSecretKey();

console.log("Generated Access Token Secret:", accessTokenSecret);
console.log("Generated Refresh Token Secret:", refreshTokenSecret);
