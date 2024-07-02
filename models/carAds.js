"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CarAds extends Model {
    static associate(models) {
      // define association here
    }
  }
  CarAds.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      brand: DataTypes.STRING,
      model: DataTypes.STRING,
      capacity: DataTypes.INTEGER,
      description: DataTypes.STRING, // Fixed typo
      price: DataTypes.FLOAT,
      negotiable: DataTypes.BOOLEAN,
      location: DataTypes.STRING,
      mileage: DataTypes.FLOAT,
      fuelType: DataTypes.STRING,
      imageUrl: DataTypes.JSON, // Use JSON to store array of strings
      postUrl: DataTypes.STRING,
      postedDate: DataTypes.DATE,
      transmission: DataTypes.STRING,
      year: DataTypes.INTEGER,
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      contactName: DataTypes.STRING,
      contactEmail: DataTypes.STRING,
      contactPhone: DataTypes.STRING,
      hidePhone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      adminId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CarAds",
    }
  );
  return CarAds;
};
