// sendSMS.js

const { Vonage } = require("@vonage/server-sdk");
require("dotenv").config();

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API,
  apiSecret: process.env.VONAGE_API_SECRET,
});

exports.sendSMS = async function (phone, countryCode, code) {
  console.log(`${countryCode}${phone}`);
  const from = "Vonage APIs";
  const to = `${countryCode}${phone}`;
  const text = `Carseek Verification code is ${code}. Valid for 10 minutes`;
  await vonage.sms
    .send({ to, from, text })
    .then((resp) => {
      console.log("Message sent successfully");
      console.log(resp);
    })
    .catch((err) => {
      console.log("There was an error sending the messages.");
      console.error(err);
    });
};
