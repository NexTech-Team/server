const https = require("follow-redirects").https;
require("dotenv").config();

const sendSMS = async function (phone, countryCode, code) {
  // Remove the leading + from the country code
  const formattedCountryCode = countryCode.replace(/^\+/, "");
  // Remove the leading 0 from the phone number
  const formattedPhone = phone.startsWith("0") ? phone.substring(1) : phone;
  const fullPhoneNumber = `${formattedCountryCode}${formattedPhone}`;
  const message = `Carseek Verification code is ${code}. Valid for 5 minutes`;
  console.log(`Sending SMS to: ${fullPhoneNumber}`);

  const options = {
    method: "POST",
    hostname: process.env.INFOBIP_BASE_URL,
    path: "/sms/2/text/advanced",
    headers: {
      Authorization: `App ${process.env.INFOBIP_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    maxRedirects: 20,
  };

  const postData = JSON.stringify({
    messages: [
      {
        destinations: [{ to: fullPhoneNumber }],
        from: "ServiceSMS",
        text: message,
      },
    ],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(options, function (res) {
      let chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body.toString());
      });

      res.on("error", function (error) {
        console.error(error);
        reject(error);
      });
    });

    req.write(postData);
    req.end();
  });
};

// Export the function for external use
exports.sendSMS = sendSMS;
