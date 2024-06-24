"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Ads extends Model {
    static associate(models) {
      // define association here if necessary
    }
  }

  Ads.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      brand: DataTypes.STRING,
      model: DataTypes.STRING,
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: DataTypes.FLOAT,
      location: DataTypes.STRING,
      mileage: DataTypes.FLOAT,
      fuelType: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      postUrl: DataTypes.STRING,
      postedDate: DataTypes.DATE,
      rank: DataTypes.INTEGER,
      source: DataTypes.STRING,
      transmission: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      year: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      isApproved: {
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
      body: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      condition: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      negotiable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      photos: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactPhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hidePhoneNumber: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Ads",
    }
  );

  return Ads;
};
