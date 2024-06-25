const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // Ensure you have dotenv installed for local development
require("./utils/redisClient");
const app = express();
const port = process.env.PORT || 5000;

const advertismentRouter = require("./routes/advertisments");
const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const postAdsRoute = require("./routes/postAdsRoute");
const { sequelize } = require("./models");

// Update CORS settings to use environment variable
const allowedOrigins = [
  "http://localhost:3000", // For local development
  "https://www.carseek.live", // For production
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", postAdsRoute);
app.use("/api/advertisments/", advertismentRouter);
app.use("/api/auth/", authRouter);
app.use("/api/user/", userRouter);

(async () => {
  try {
    await sequelize.sync();
    console.log("Database synced successfully");
    app.listen(port, () => {
      // Use the 'port' variable for the server to listen on
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Error syncing database:", err);
  }
})();
