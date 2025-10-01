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
      discription: DataTypes.STRING,
      price: DataTypes.FLOAT,
      negotiable: DataTypes.BOOLEAN,
      location: DataTypes.STRING,
      mileage: DataTypes.FLOAT,
      fuelType: DataTypes.STRING,
      imageUrl: {
        type: DataTypes.TEXT,
        get() {
          const value = this.getDataValue("imageUrl");
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          this.setDataValue("imageUrl", JSON.stringify(value));
        },
      },
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
