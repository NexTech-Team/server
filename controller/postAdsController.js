const { CarAds } = require("../models");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
require("dotenv").config();

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "carseek";
const containerClient = blobServiceClient.getContainerClient(containerName);

const storage = multer.memoryStorage();
const upload = multer({ storage }).array("photos", 5);

const postAd = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: "Error uploading files" });
    }
    console.log("Request Body", req.body);
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

      let negotiable =
        req.body.hidePhoneNumber !== "undefined"
          ? req.body.hidePhoneNumber
          : false;
      let hidePhoneNumber =
        req.body.hidePhoneNumber !== "undefined"
          ? req.body.hidePhoneNumber
          : false;

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
      if (negotiable === "undefined") {
        negotiable = false;
      }
      if (hidePhoneNumber === "undefined") {
        hidePhoneNumber = false;
      }

      const photoUrls = [];

      for (const file of req.files) {
        const blobName = `${userId}-${Date.now()}${path.extname(
          file.originalname
        )}`;
        console.log("Blob Name", blobName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: {
            blobContentType: file.mimetype,
          },
        });

        const photoUrl = blockBlobClient.url;
        photoUrls.push(photoUrl);
      }

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
        negotiable: negotiable || false,
        imageUrl: photoUrls, // Store array of image URLs
        contactName: name,
        contactEmail: email,
        contactPhoneNumber: phoneNumber,
        hidePhoneNumber: hidePhoneNumber || false,
        isApproved: false,
        userId,
      });
      console.log("Car Ad", carAd);

      res.status(201).send({ message: "Ad posted successfully.", carAd });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  });
};

module.exports = {
  postAd,
};
