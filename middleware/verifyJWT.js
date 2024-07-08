const jwt = require("jsonwebtoken");

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.id = decoded.id;
    req.user = decoded.name;
    req.roles = decoded.role;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const refreshToken = req.cookies?.jwt;
      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const newAccessToken = jwt.sign(
          {
            id: decodedRefresh.id,
            name: decodedRefresh.name,
            role: decodedRefresh.role,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "2h" }
        );

        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        req.id = decodedRefresh.id;
        req.user = decodedRefresh.name;
        req.roles = decodedRefresh.role;
        next();
      } catch (refreshErr) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
};

module.exports = verifyJWT;
