const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Load environment variables from the correct .env file
const nodeEnv = process.env.NODE_ENV || "production";
dotenv.config({ path: `.env.${nodeEnv}` });

console.log("Environment:", nodeEnv);
require("./utils/redisClient");

const app = express();
const port = process.env.PORT || 5000;

const advertismentRouter = require("./routes/advertisments");
const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const postAdsRouter = require("./routes/postAdsRoute");

const { sequelize } = require("./models");

// Parse ALLOWED_ORIGINS environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["https://www.carseek.live"];

console.log("Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// API Routes
app.use("/api/advertisments/", advertismentRouter);
app.use("/api/auth/", authRouter);
app.use("/api/user/", userRouter);
app.use("/api/post-ads/", postAdsRouter);

// Sync database and start server
(async () => {
  try {
    await sequelize.sync();
    console.log("Database synced successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Error syncing database:", err);
  }
})();
