const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

// Set NODE_ENV to 'development' if not already set
const nodeEnv = process.env.NODE_ENV || "production";
require("dotenv").config({ path: `.env.${nodeEnv}` });

console.log("Environment:", process.env.NODE_ENV);
require("./utils/redisClient");

const app = express();
const port = process.env.PORT || 5000;

const advertismentRouter = require("./routes/advertisments");
// const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");

const { sequelize } = require("./models");

// Parse ALLOWED_ORIGINS environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : "https://www.carseek.live";
console.log("Allowed origins:", allowedOrigins);

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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Routes
app.use("/api/advertisments/", advertismentRouter);
// app.use("/api/auth/", authRouter);
app.use("/api/user/", userRouter);

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
