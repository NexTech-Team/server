const express = require("express");
const cors = require("cors"); // Import the 'cors' package
const bodyParser = require("body-parser");
require("./utils/redisClient");
const app = express();
const port = process.env.PORT || 5000;

const advertismentRouter = require("./routes/advertisments");
const userRouter = require("./routes/authRoute");
const { sequelize } = require("./models");
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

app.use("/api/advertisments/", advertismentRouter);
app.use("/auth/", userRouter);

// ... other route setups

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
