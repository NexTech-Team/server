const jwt = require("jsonwebtoken");

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("Auth header", authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Jwt Token", token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.error("Error verifying JWT", err);
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.cookies?.jwt;
        if (!refreshToken) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify the refresh token
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (err, decodedRefresh) => {
            if (err) {
              console.error("Error verifying refresh token", err);
              return res.status(403).json({ message: "Forbidden" });
            }

            // Generate a new access token
            const newAccessToken = jwt.sign(
              {
                id: decodedRefresh.id,
                name: decodedRefresh.name,
                role: decodedRefresh.role,
              },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "15m" } // Adjust the expiration time as needed
            );

            // Optional: Set the new access token in the response header or body
            res.setHeader("Authorization", `Bearer ${newAccessToken}`);

            // Continue with the request using the new access token
            req.id = decodedRefresh.id;
            req.user = decodedRefresh.name;
            req.roles = decodedRefresh.role;
            next();
          }
        );
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else {
      console.log("Decode user", decoded);
      req.id = decoded.id;
      req.user = decoded.name;
      req.roles = decoded.role;
      next();
    }
  });
};

module.exports = verifyJWT;
