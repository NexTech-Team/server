"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cars", {
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
        type: Sequelize.STRING,
      },
      imageUrl: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
      },
      year: {
        type: Sequelize.INTEGER,
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        // references: {
        //   model: "Users",
        //   key: "id",
        // },
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: true,
        // references: {
        //   model: "Admins",
        //   key: "id",
        // },
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
    await queryInterface.dropTable("Cars");
  },
};
