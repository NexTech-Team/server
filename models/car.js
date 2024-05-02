"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Car extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Car.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      brand: DataTypes.STRING,
      model: DataTypes.STRING,
      capacity: DataTypes.INTEGER,
      price: DataTypes.FLOAT,
      location: DataTypes.STRING,
      mileage: DataTypes.FLOAT,
      fuelType: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
      postUrl: DataTypes.STRING,
      postedDate: DataTypes.DATE,
      rank: DataTypes.INTEGER,
      source: DataTypes.STRING,
      transmission: DataTypes.STRING,
      year: DataTypes.INTEGER,
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        // references: {
        //   model: "Users",
        //   key: "id",
        // },
      },
      adminId: {
        type: DataTypes.UUID,
        allowNull: true,
        // references: {
        //   model: "Admins",
        //   key: "id",
        // },
      },
    },
    {
      sequelize,
      modelName: "Car",
    }
  );
  return Car;
};
