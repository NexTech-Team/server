"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    static associate(models) {
      // define association here
      Package.hasMany(models.Subscription, {
        foreignKey: "packageId",
        as: "subscriptions",
      });
    }
  }
  Package.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Package",
    }
  );
  return Package;
};
