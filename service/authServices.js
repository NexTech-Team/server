const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redisClient");

exports.verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token not found" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid access token" });
    }
    req.user = user;
    next();
  });
};

exports.verifyRefreshToken = (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ message: "Refresh token not found" });
  }
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    req.user = user;
    next();
  });
};

exports.refreshTokens = async (req, res) => {
  const { user } = req;
  const storedRefreshToken = await redisClient.get(user.id.toString());
  if (!storedRefreshToken) {
    return res.status(403).json({ message: "Refresh token expired" });
  }
  const newAccessToken = jwt.sign(
    { id: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const newRefreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3d" }
  );
  redisClient.set(user.id.toString(), newRefreshToken);
  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};
