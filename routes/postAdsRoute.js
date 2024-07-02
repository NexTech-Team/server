const express = require("express");
const router = express.Router();
const { postAd } = require("../controller/postAdsController");
const verifyJWT = require("../middleware/verifyJWT");

router.post("/createAd", verifyJWT, postAd);

module.exports = router;
