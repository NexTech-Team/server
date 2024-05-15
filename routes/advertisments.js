const express = require("express");
const advertismentController = require("../controller/advertismentController");
const router = express.Router();

router.get("/", advertismentController.getAll);
router.get("/brands/data", advertismentController.getBrands);
router.get("/models/data", advertismentController.getModels);

module.exports = router;
