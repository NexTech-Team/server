"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Ads", {
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
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
      },
      location: {
        type: Sequelize.STRING,
      },
      mileage: {
        type: Sequelize.FLOAT,
      },
      fuelType: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      postUrl: {
        type: Sequelize.STRING,
      },
      postedDate: {
        type: Sequelize.DATE,
      },
      rank: {
        type: Sequelize.INTEGER,
      },
      source: {
        type: Sequelize.STRING,
      },
      transmission: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      year: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      isApproved: {
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
      body: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      condition: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      negotiable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      photos: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      contactName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hidePhoneNumber: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Ads");
  },
};
