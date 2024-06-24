const { Vonage } = require("@vonage/server-sdk");
require("dotenv").config();

//const twilio = require("twilio");
// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// const sendSMS = async (phone, countryCode, code) => {
//   try {
//     const message = await client.messages.create({
//       body: `Your verification code is ${code}`,
//       messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
//       to: `${countryCode}${phone}`,
//     });
//     console.log(`Message sent successfully: ${message.sid}`);
//   } catch (error) {
//     console.error("Failed to send message:", error);
//   }
// };

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendSMS = async function (phone, countryCode, code) {
  console.log(`${countryCode}${phone}`);
  const from = "Vonage APIs";
  const to = `${countryCode}${phone}`;
  const text = `Carseek Verification code is ${code}. Valid for 10 minutes`;
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

module.exports = { sendSMS };
