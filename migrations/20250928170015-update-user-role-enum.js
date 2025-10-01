"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM(
        "user",
        "admin",
        "super_admin",
        "operation_manager",
        "promotion_officer",
        "insurance_agent",
        "finance_agent",
        "dealer",
        "normal_user",
        "moderator"
      ),
      defaultValue: "user",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM("user", "admin"),
      defaultValue: "user",
    });
  },
};
