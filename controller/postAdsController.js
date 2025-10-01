const { CarAds } = require("../models"); // Adjust the path to your models
const multer = require("multer");
const path = require("path");
// const {
//   BlobServiceClient,
//   StorageSharedKeyCredential,
//   generateBlobSASQueryParameters,
//   ContainerSASPermissions,
// } = require("@azure/storage-blob");
require("dotenv").config(); // Ensure dotenv is configured

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }).array(
  "photos",
  5
);

// Function to handle posting an ad
const postAd = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading files", err);
      return res.status(400).send({ message: "Error uploading files" });
    }

    try {
      const {
        brand,
        model,
        engineCapacity,
        price,
        location,
        mileage,
        fuel,
        postUrl,
        transmission,
        year,
        body,
        condition,
        description,
        name,
        email,
        phoneNumber,
      } = req.body;
      const userId = req.id;
      console.log("User id", userId);
      console.log("Req body", req.body);

      if (!userId) {
        return res.status(401).send({ message: "Unauthorized" });
      }

      if (
        !brand ||
        !model ||
        !engineCapacity ||
        !price ||
        !location ||
        !mileage ||
        !fuel ||
        !transmission ||
        !year ||
        !name ||
        !email ||
        !phoneNumber
      ) {
        return res.status(400).send({ message: "All fields are required" });
      }

      let negotiable =
        req.body.negotiable !== "undefined" ? req.body.negotiable : false;
      let hidePhoneNumber =
        req.body.hidePhoneNumber !== "undefined"
          ? req.body.hidePhoneNumber
          : false;

      const photoUrls = req.files.map((file) => `/uploads/${file.filename}`);
      console.log("Photo Urls", photoUrls);
      const carAd = await CarAds.create({
        brand,
        model,
        capacity: engineCapacity,
        price,
        location,
        mileage,
        fuelType: fuel,
        postUrl,
        postedDate: new Date(),
        transmission,
        year,
        body,
        condition,
        description,
        negotiable,
        imageUrl: photoUrls,
        contactName: name,
        contactEmail: email,
        contactPhone: phoneNumber,
        hidePhone: hidePhoneNumber,
        isApproved: false,
        userId,
      });

      res.status(201).send({ message: "Ad posted successfully.", carAd });
    } catch (error) {
      console.error("Server error", error);
      res.status(500).send({ message: "Server error" });
    }
  });
};

module.exports = {
  postAd,
};
