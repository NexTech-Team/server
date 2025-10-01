"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("MotorcycleAds", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      brand: {
        type: Sequelize.STRING,
      },
      model: {
        type: Sequelize.STRING,
      },
      capacity: {
        type: Sequelize.INTEGER,
      },
      description: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.FLOAT,
      },
      negotiable: {
        type: Sequelize.BOOLEAN,
      },
      location: {
        type: Sequelize.STRING,
      },
      mileage: {
        type: Sequelize.FLOAT,
      },
      fuelType: {
        type: Sequelize.STRING,
      },
      imageUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      postUrl: {
        type: Sequelize.STRING,
      },
      postedDate: {
        type: Sequelize.DATE,
      },
      transmission: {
        type: Sequelize.STRING,
      },
      year: {
        type: Sequelize.INTEGER,
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      contactName: {
        type: Sequelize.STRING,
      },
      contactEmail: {
        type: Sequelize.STRING,
      },
      contactPhone: {
        type: Sequelize.STRING,
      },
      hidePhone: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("MotorcycleAds");
  },
};
