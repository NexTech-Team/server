// const models = require("../models");
// const Validator = require("fastest-validator");
// const Sequelize = require("sequelize");

// const advertisementSchema = {
//   title: { type: "string", optional: true, max: 100 },
//   brand: { type: "string", optional: false, max: 100 },
//   model: { type: "string", optional: false, max: 100 },
//   year: { type: "number", min: 1980, max: new Date().getFullYear() },
//   mileage: { type: "number", positive: true },
//   engineCapacity: { type: "number", optional: false, positive: true },
//   condition: { type: "string", optional: true },
//   description: { type: "string", optional: true },
//   location: { type: "string", optional: true },
//   price: { type: "number", positive: true },
// };

// const validator = new Validator();

// async function validateAdvertisement(advertisement) {
//   try {
//     return await validator.validate(advertisement, advertisementSchema);
//   } catch (error) {
//     throw new Error("Validation failed");
//   }
// }

// async function save(req, res) {
//   try {
//     const advertisement = ({
//       title,
//       brand,
//       model,
//       year,
//       mileage,
//       engineCapacity,
//       condition,
//       description,
//       location,
//       price,
//       isApproved,
//       userId,
//       adminId,
//     } = req.body);

//     const validationResponse = await validateAdvertisement(advertisement);

//     if (validationResponse !== true) {
//       return res.status(400).json({
//         message: "Validation failed",
//         errors: validationResponse,
//       });
//     }

//     await models.Advertisment.create(advertisement);
//     res.status(201).json({
//       message: "Ad created successfully",
//       post: advertisement,
//     });
//   } catch (error) {
//     console.error("Error saving advertisement:", error);
//     res.status(500).json({
//       message: "Something went wrong...",
//       error: error.message,
//     });
//   }
// }

// async function show(req, res) {
//   try {
//     const id = req.params.id;
//     const advertisment = await models.Advertisment.findByPk(id);

//     if (!advertisment) {
//       return res.status(404).json({ message: "Ad not found!" });
//     }

//     res.status(200).json(advertisment);
//   } catch (error) {
//     console.error("Error getting ad:", error);
//     res.status(500).json({
//       message: "Error getting ad",
//       error: error.message,
//     });
//   }
// }

// //pagination

// const getPagination = (page, size) => {
//   const limit = size ? +size : null;
//   const offset = page ? (page == 1 ? 0 : (page - 1) * limit) : 0;

//   return { limit, offset };
// };

// const getPagingData = (data, page, limit) => {
//   const { count: totalAdvertisments, rows: advertisments } = data;
//   const currentPage = page ? +page : 0;
//   const totalPages = Math.ceil(totalAdvertisments / limit);

//   return { totalAdvertisments, advertisments, totalPages, currentPage };
// };

// async function getAll(req, res) {
//   const { page, size } = req.query;

//   try {
//     const { limit, offset } = getPagination(page, size);

//     const advertisments = await models.Advertisment.findAndCountAll({
//       limit,
//       offset,
//       order: [[Sequelize.literal("updatedAt DESC")]],
//     });
//     const response = getPagingData(advertisments, page, limit);
//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching advertisements:", error);
//     res.status(500).json({
//       message: "Failed to retrieve advertisements",
//       error: error.message,
//     });
//   }
// }
// const getTotalRecords = async (col) => {
//   try {
//     const totalRecords = await models.Advertisment.count({
//       distinct: true,
//       col: col,
//     });
//     console.log("Total Records", totalRecords);
//     return totalRecords;
//   } catch (error) {
//     console.error("Error getting total records:", error);
//   }
// };

// const getCurentTotalPage = (page, totalRecords, limit) => {
//   try {
//     const currentPage = page ? +page : 0;
//     const totalPages = Math.ceil(totalRecords / limit);
//     console.log("Total Pages", totalPages);
//     console.log("Current Page", currentPage);
//     return { totalPages, currentPage };
//   } catch (error) {
//     console.error("Error getting current page:", error);
//   }
// };
// //Get vehicles by brand
// async function getVehicleBrandData(req, res) {
//   const { page, size } = req.query;
//   try {
//     const { limit, offset } = getPagination(page, size);

//     const brandData = await models.Advertisment.findAll({
//       limit,
//       offset,
//       attributes: [
//         "brand",
//         [Sequelize.fn("COUNT", Sequelize.col("id")), "vehicleCount"],
//       ],
//       group: ["brand"],
//       order: [[Sequelize.literal("vehicleCount DESC")]],
//     });
//     console.log("Brand Data", brandData);
//     const totalRecords = await getTotalRecords("brand");
//     const { totalPages, currentPage } = getCurentTotalPage(
//       page,
//       totalRecords,
//       limit
//     );

//     return res.status(200).json({
//       brand: brandData,
//       totalPages: totalPages,
//       currentPage: currentPage,
//     });
//   } catch (error) {
//     console.error("Error retrieving vehicle brand data:", error);
//     return res.status(500).json({
//       message: "Failed to retrieve vehicle brand data",
//       error: error.message,
//     });
//   }
// }

// //Get vehicles by Models
// async function getVehicleModelData(req, res) {
//   const { page, size } = req.query;
//   try {
//     const { limit, offset } = getPagination(page, size);

//     const modelData = await models.Advertisment.findAll({
//       limit,
//       offset,
//       attributes: [
//         "brand",
//         "model",
//         [Sequelize.fn("COUNT", Sequelize.col("model")), "vehicleCount"],
//         "year",
//       ],
//       group: ["brand", "model", "year"],
//       order: [[Sequelize.literal("vehicleCount DESC")]],
//     });
//     const totalRecords = await getTotalRecords("model");
//     const { totalPages, currentPage } = getCurentTotalPage(
//       page,
//       totalRecords,
//       limit
//     );

//     return res.status(200).json({
//       model: modelData,
//       totalPages: totalPages,
//       currentPage: currentPage,
//     });
//   } catch (error) {
//     console.error("Error retrieving vehicle models data:", error);
//     return res.status(500).json({
//       message: "Failed to retrieve vehicle models data",
//       error: error.message,
//     });
//   }
// }

// async function getDataForFloatingPanel(req, res) {
//   try {
//     const { brand, model, year } = req.query; // Adjust to use query parameters instead of body

//     // Use explicit error handling for missing parameters
//     if (!brand || !model || !year) {
//       return res.status(400).json({
//         message: "Missing parameters: brand, model, and year are required.",
//       });
//     }

//     // Replace with your actual database model
//     const advertisements = await models.Advertisement.findAll({
//       where: { brand: brand, model: model, year: year },
//     });

//     // Use strict comparison to check for empty array
//     if (!advertisements || advertisements.length === 0) {
//       return res.status(404).json({ message: "Advertisement not found." });
//     }

//     // Calculate average price using Array.reduce and arrow function
//     const totalPrices = advertisements.reduce((sum, ad) => sum + ad.price, 0);
//     const averagePrice = totalPrices / advertisements.length;

//     // Use meaningful HTTP status codes
//     res.status(200).json({ averagePrice });
//   } catch (error) {
//     console.error("Error getting advertisement:", error);

//     // Send internal server error with error details
//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// }

// async function update(req, res) {
//   try {
//     const id = req.params.id;
//     const updatedAdvertisement = ({
//       title,
//       brand,
//       model,
//       year,
//       mileage,
//       engineCapacity,
//       condition,
//       description,
//       location,
//       price,
//       imageUrl,
//     } = req.body);

//     const validationResponse = await validateAdvertisement(
//       updatedAdvertisement
//     );

//     if (validationResponse !== true) {
//       return res.status(400).json({
//         message: "Validation failed",
//         errors: validationResponse,
//       });
//     }

//     const [updateRowsCount] = await models.Advertisment.update(
//       updatedAdvertisement,
//       {
//         where: { id },
//       }
//     );

//     if (updateRowsCount > 0) {
//       res.status(200).json({ message: "Ad updated successfully" });
//     } else {
//       res.status(404).json({ message: "Ad not found or permission denied" });
//     }
//   } catch (error) {
//     console.error("Error updating advertisement:", error);
//     res.status(500).json({
//       message: "Something went wrong...",
//       error: error.message,
//     });
//   }
// }

// async function destroy(req, res) {
//   try {
//     const id = req.params.id;
//     const deletedRows = await models.Advertisment.destroy({
//       where: { id },
//     });

//     if (deletedRows > 0) {
//       res.status(200).json({ message: "Ad deleted successfully" });
//     } else {
//       res.status(404).json({ message: "Ad not found or permission denied" });
//     }
//   } catch (error) {
//     console.error("Error deleting advertisement:", error);
//     res.status(500).json({
//       message: "Something went wrong...",
//       error: error.message,
//     });
//   }
// }

// module.exports = {
//   save,
//   show,
//   getAll,
//   update,
//   destroy,
//   getVehicleBrandData,
//   getVehicleModelData,
//   getDataForFloatingPanel,
// };
