const express = require("express");
const advertismentController = require("../controller/advertismentController");
const router = express.Router();

router.get("/brands", advertismentController.getBrands);
router.get("/models", advertismentController.getModels);

module.exports = router;
