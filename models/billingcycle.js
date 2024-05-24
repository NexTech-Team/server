"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BillingCycle extends Model {
    static associate(models) {
      // define association here
      BillingCycle.hasMany(models.Subscription, {
        foreignKey: "billingCycleId",
        as: "subscriptions",
      });
    }
  }
  BillingCycle.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      durationInMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "BillingCycle",
    }
  );
  return BillingCycle;
};
