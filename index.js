require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.PORT || 5000;

const advertismentRouter = require("./routes/advertisments");
const disctrictRouter = require("./routes/districts");

const swaggerUi = require("swagger-ui-express");
/**
 * Represents the Swagger file used for API documentation.
 * @type {object}
 */
const swaggerFile = require("./swagger-output.json");

app.use("/api/advertisments", advertismentRouter);
app.use("/api/districts", disctrictRouter);

// Routes using async/await with promises
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Database connection
try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

module.exports = app;
