const { Vonage } = require("@vonage/server-sdk");
require("dotenv").config();

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API,
  apiSecret: process.env.VONAGE_API_SECRET,
});

exports.sendSMS = async function (phone, countryCode, code) {
  console.log(`Sending SMS to: ${countryCode}${phone}`);
  const from = "Vonage APIs";
  const to = `${countryCode}${phone}`;
  const text = `Carseek Verification code is ${code}. Valid for 10 minutes`;

  try {
    const resp = await vonage.sms.send({ to, from, text });
    console.log("Message sent successfully", resp);
  } catch (err) {
    console.error("There was an error sending the message:", err);
  }
};
