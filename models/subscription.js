"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // define association here
      Subscription.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Subscription.belongsTo(models.Package, {
        foreignKey: "packageId",
        as: "package",
      });
      Subscription.belongsTo(models.BillingCycle, {
        foreignKey: "billingCycleId",
        as: "billingCycle",
      });
    }
  }
  Subscription.init(
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      packageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Packages",
          key: "id",
        },
      },
      billingCycleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "BillingCycles",
          key: "id",
        },
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Subscription",
    }
  );
  return Subscription;
};
