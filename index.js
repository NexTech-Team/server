const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("./utils/redisClient");
const app = express();
const port = process.env.PORT || 5000;

const advertismentRouter = require("./routes/advertisments");
const userRouter = require("./routes/authRoute");
const { sequelize } = require("./models");
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/advertisments/", advertismentRouter);
app.use("/auth/", userRouter);

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
