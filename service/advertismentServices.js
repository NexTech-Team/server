const models = require("../models");
const sequelize = require("sequelize");
const { getPagination, getPagingData } = require("../utils/pagination");
const { CarAds } = require("../models");
const buildWhereCondition = (filter) => {
  const whereCondition = {};

  if (filter.brand) {
    whereCondition.brand = filter.brand;
  }
  if (filter.model) {
    whereCondition.model = filter.model;
  }
  if (filter.transmission) {
    whereCondition.transmission = filter.transmission;
  }
  if (filter.fuelType) {
    whereCondition.fuelType = filter.fuelType;
  }
  if (filter.location) {
    whereCondition.location = filter.location;
  }
  if (filter.year) {
    whereCondition.year = {
      [sequelize.Op.between]: [filter.year.min, filter.year.max],
    };
  }
  if (filter.price) {
    whereCondition.price = {
      [sequelize.Op.between]: [filter.price.min, filter.price.max],
    };
  }
  if (filter.mileage) {
    whereCondition.mileage = {
      [sequelize.Op.between]: [filter.mileage.min, filter.mileage.max],
    };
  }
  if (filter.capacity) {
    whereCondition.capacity = {
      [sequelize.Op.between]: [filter.capacity.min, filter.capacity.max],
    };
  }

  return whereCondition;
};

const getAdvertismentById = async (id) => {
  console.log("Get advertisement by ID:", id);
  try {
    const data = await models.CarAds.findOne({
      where: { id: id },
    });
    console.log("Get advertisement Data:", data);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllCars = async (page, size, filter, sortFilter) => {
  console.log("getAll Filter:", filter);
  console.log("Sort Filter:", sortFilter);
  try {
    const { limit, offset } = getPagination(page, size);
    const whereCondition = buildWhereCondition(filter);

    console.log("Where Condition:", whereCondition);

    const order = sortFilter
      ? [[sortFilter.field, sortFilter.order]]
      : [["updatedAt", "DESC"]];

    const data = await models.CarAds.findAndCountAll({
      where: whereCondition,
      order,
      limit,
      offset,
    });

    // console.log("Data:", data.rows);

    return getPagingData(data, page, limit);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to retrieve data");
  }
};

const getBrands = async (page, size) => {
  try {
    const { limit, offset } = getPagination(page, size);
    const data = await models.CarAds.findAndCountAll({
      limit,
      offset,
      attributes: [
        "brand",
        [sequelize.fn("COUNT", sequelize.col("brand")), "count"],
      ],
      group: ["brand"],
      order: [[sequelize.literal("count"), "DESC"]],
    });
    return getPagingData(data, page, limit);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getModels = async (page, size, filter) => {
  console.log("Models Filter:", filter);
  try {
    const { limit, offset } = getPagination(page, size);
    const whereCondition = buildWhereCondition(filter);

    const data = await models.CarAds.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      attributes: [
        "brand",
        "model",
        "year",
        [sequelize.fn("COUNT", sequelize.col("model")), "count"],
      ],
      group: ["brand", "model", "year"],
      order: [[sequelize.literal("count"), "DESC"]],
    });
    return getPagingData(data, page, limit);
  } catch (error) {
    console.error("Error fetching models:", error);
    throw new Error(error.message);
  }
};

const getFloatingData = async (brand, model, year) => {
  try {
    if (!brand || !model || !year) {
      return res.status(400).json({
        message: "Missing parameters: brand, model, and year are required.",
      });
    }
    const data = await models.CarAds.findAll({
      where: { brand: brand, model: model, year: year },
    });

    // Calculate average price using Array.reduce and arrow function
    const totalPrices = data.reduce((sum, ad) => sum + ad.price, 0);
    const averagePrice = totalPrices / data.length;

    return averagePrice;
  } catch (error) {}
};
const getMarketData = async (filter) => {
  console.log("Market Data Filter:", filter);

  try {
    const data = await models.CarAds.findAndCountAll({
      where: filter,
    });

    const totalCars = data.count;
    const totalPrice = data.rows.reduce((sum, ad) => sum + ad.price, 0);
    const averagePrice = totalPrice / totalCars;
    const highestPrice = Math.max(...data.rows.map((ad) => ad.price));
    const lowestPrice = Math.min(...data.rows.map((ad) => ad.price));

    return {
      totalCars,
      averagePrice,
      highestPrice,
      lowestPrice,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to retrieve data");
  }
};

module.exports = {
  getAllCars,
  getBrands,
  getModels,
  getFloatingData,
  getMarketData,
  getAdvertismentById,
};
