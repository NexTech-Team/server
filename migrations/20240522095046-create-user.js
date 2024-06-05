"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, // Ensure UUID is automatically generated
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true, // Allows null initially for phone-based registration until verification is done
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true, // Allows null for users registering with phone number
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true, // Allows null initially for phone-based registration until verification is done
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true, // Allows null for users registering with email
        unique: true,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "user", // Default role is 'user'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "inactive", // Default status is 'inactive'
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

    // // Adding a check constraint to ensure either email or phoneNumber is provided
    // await queryInterface.sequelize.query(`
    //   ALTER TABLE "Users"
    //   ADD CONSTRAINT "email_or_phone_check"
    //   CHECK (
    //     ("email" IS NOT NULL AND LENGTH("email") > 0)
    //     OR ("phoneNumber" IS NOT NULL AND LENGTH("phoneNumber") > 0)
    //   );
    // `);

    // Adding indexes to email and phoneNumber for better query performance
    await queryInterface.addIndex("Users", ["email"], {
      unique: true,
      where: {
        email: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    await queryInterface.addIndex("Users", ["phoneNumber"], {
      unique: true,
      where: {
        phoneNumber: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
