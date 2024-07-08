const express = require("express");
const advertismentController = require("../controller/advertismentController");
const { getFloatingData } = require("../service/advertismentServices");
const router = express.Router();

router.get("/", advertismentController.getAll);
router.post(
  "/getAdvertisementById",
  advertismentController.getAdvertismentById
);
router.get("/brands/data", advertismentController.getBrands);
router.get("/models/data", advertismentController.getModels);
router.get("/averagePrice/data", advertismentController.getFloatingData);
router.get("/marketData/data", advertismentController.getMarketData);

module.exports = router;
