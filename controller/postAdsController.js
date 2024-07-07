const { CarAds } = require("../models"); // Adjust the path to your models
const multer = require("multer");
const path = require("path");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
} = require("@azure/storage-blob");
require("dotenv").config(); // Ensure dotenv is configured

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }).array(
  "photos",
  5
);

// Read environment variables
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const CONTAINER_NAME = "carseek"; // Define the container name here

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error(
    "AZURE_STORAGE_CONNECTION_STRING is not defined in environment variables"
  );
}

// Log the connection string for debugging (without sensitive information)
console.log(
  "AZURE_STORAGE_CONNECTION_STRING:",
  AZURE_STORAGE_CONNECTION_STRING.split(";")
    .map((part) => (part.startsWith("AccountKey") ? "AccountKey=***" : part))
    .join(";")
);

// Ensure the connection string is valid
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage Connection String is not defined.");
}

// Create the BlobServiceClient object
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

// Function to generate SAS URL for blob
const generateSasUrl = (containerClient, blobName) => {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_ACCOUNT_KEY
  );
  const sasOptions = {
    containerName: CONTAINER_NAME,
    blobName: blobName,
    permissions: ContainerSASPermissions.parse("r"), // Read permissions
    startsOn: new Date(), // Token is valid from now
    expiresOn: new Date(new Date().valueOf() + 30 * 24 * 60 * 60 * 1000), // Token expires in 1 month
  };
  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();
  const sasUrl = `${containerClient.url}/${blobName}?${sasToken}`;
  return sasUrl;
};

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

      const photoUrls = [];
      const containerClient =
        blobServiceClient.getContainerClient(CONTAINER_NAME);

      for (const file of req.files) {
        const blobName = `${userId}-${Date.now()}${path.extname(
          file.originalname
        )}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: { blobContentType: file.mimetype },
        });

        const photoUrl = generateSasUrl(containerClient, blobName);
        photoUrls.push(photoUrl);
      }
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
        contactPhoneNumber: phoneNumber,
        hidePhoneNumber,
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
