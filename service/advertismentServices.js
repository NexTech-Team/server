const models = require("../models");
const sequelize = require("sequelize");

const getBrands = async () => {
  try {
    const data = await models.Car.findAll({
      attributes: [
        "brand",
        [sequelize.fn("COUNT", sequelize.col("brand")), "count"],
      ],
      group: ["brand"],
      order: [[sequelize.literal("count"), "DESC"]],
    });
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getModels = async () => {
  try {
    const data = await models.Car.findAll({
      attributes: [
        "brand",
        "model",
        "year",
        [sequelize.fn("COUNT", sequelize.col("model")), "count"],
      ],
      group: ["brand", "model", "year"],
      order: [[sequelize.literal("count"), "DESC"]],
    });
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getBrands,
  getModels,
};
