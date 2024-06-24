// controllers/postAdsController.js
const { Ads } = require("../models");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
require("dotenv").config();

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "carseek"; // Your container name
const containerClient = blobServiceClient.getContainerClient(containerName);

const storage = multer.memoryStorage();

const upload = multer({ storage }).array("photos", 15);

const postAd = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: "Error uploading files" });
    }

    try {
      console.log("Request body", req.body);
      const {
        brand,
        model,
        capacity,
        price,
        location,
        mileage,
        fuelType,
        postUrl,
        postedDate,
        rank,
        source,
        transmission,
        year,
        body,
        condition,
        description,
        negotiable,
        contactName,
        contactEmail,
        contactPhoneNumber,
        hidePhoneNumber,
      } = req.body;
      const userId = req.id;
      const adminId = req.roles.includes("admin") ? req.id : null;

      const photoUrls = [];

      for (const file of req.files) {
        const blobName = `${userId}-${Date.now()}${path.extname(
          file.originalname
        )}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: {
            blobContentType: file.mimetype,
          },
        });

        const photoUrl = blockBlobClient.url;
        photoUrls.push(photoUrl);
      }

      const car = await Ads.create({
        brand,
        model,
        capacity,
        price,
        location,
        mileage,
        fuelType,
        // imageUrl: photoUrls.length > 0 ? photoUrls[0] : null,
        postUrl,
        postedDate: new Date(),
        rank,
        source,
        transmission,
        year,
        body,
        condition,
        description,
        negotiable,
        photos: photoUrls,
        contactName,
        contactEmail,
        contactPhoneNumber,
        hidePhoneNumber,
        isApproved: true, // Default to false unless approved elsewhere
        userId,
        adminId: adminId || null, // Optional field
      });

      res.status(201).send(car);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  });
};

module.exports = {
  postAd,
};
