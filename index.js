require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.PORT || 5000;

const advertismentRouter = require("./routes/advertisments");
const { sequelize } = require("./models");
// const disctrictRouter = require("./routes/districts");

// const swaggerUi = require("swagger-ui-express");
// /**
//  * Represents the Swagger file used for API documentation.
//  * @type {object}
//  */
// const swaggerFile = require("./swagger-output.json");

app.use("/api/advertisments", advertismentRouter);
// app.use("/api/districts", disctrictRouter);

// // Routes using async/await with promises
// app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

(async () => {
  try {
    await sequelize.sync();
    console.log("Database synced successfully");
    app.listen(5000 || process.env.PORT, () => {
      console.log("Server is running on port 5000");
    });
  } catch (err) {
    console.error("Error syncing database:", err);
  }
})();

module.exports = app;
