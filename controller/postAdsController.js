const { CarAds } = require("../models");
const multer = require("multer");
const { google } = require("googleapis");
const path = require("path");
const { Readable } = require("stream");
require("dotenv").config();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }).array(
  "photos",
  5
); // Limit file size to 5MB

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const postAd = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading files", err);
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

      // Create a unique folder name
      const folderName = `Ad_${userId}_${Date.now()}`;

      // Create a folder in Google Drive
      const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: ["1QXlEB8rXFgjpn_-umtT0sgEwpuh3Bm20"], // Replace with your Google Drive folder ID
      };
      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });
      const folderId = folder.data.id;

      for (const file of req.files) {
        const fileMetadata = {
          name: `${userId}-${Date.now()}${path.extname(file.originalname)}`,
          parents: [folderId], // Use the created folder ID
        };
        const media = {
          mimeType: file.mimetype,
          body: bufferToStream(file.buffer),
        };
        const response = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: "id, webViewLink, webContentLink",
        });
        console.log("File ID: ", response.data.id);
        console.log("File WebViewLink: ", response.data.webViewLink);
        console.log("File WebContentLink: ", response.data.webContentLink);

        // Modify URL to remove '&export=download'
        const photoUrl = response.data.webContentLink.replace(
          "&export=download",
          ""
        );
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
        negotiable,
        imageUrl: photoUrls, // Store array of image URLs
        contactName: name,
        contactEmail: email,
        contactPhoneNumber: phoneNumber,
        hidePhoneNumber,
        isApproved: false,
        userId,
      });
      console.log("Car Ad", carAd);

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
