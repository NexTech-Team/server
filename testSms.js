const axios = require("axios");

const sendSms = async () => {
  const url = "https://app.fitsms.lk/api/v3/sms/send";
  const token = "93|ePMU3jHjIdIIvXktgJ6hUX5jJCJJew1C1KBHu6EM ";
  const data = {
    recipient: "94773000961",
    sender_id: "CarSeek",
    type: "plain",
    message: "This is a test message",
    // schedule_time: '2021-12-20 07:00'
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log("Response:", response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};

sendSms();
