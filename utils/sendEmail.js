const nodemailer = require("nodemailer");
const activationTemplate = require("../shared/emailTemplates/emailActivation");
const resetPassTemplate = require("../shared/emailTemplates/resetPass");
const dotenv = require("dotenv");

dotenv.config();

exports.sendActivationEmail = async function (
  userEmail,
  emailLink,
  user,
  type
) {
  let emailHTML;
  let subject;

  try {
    switch (type) {
      case "resetPassword":
        emailHTML = resetPassTemplate(emailLink, user);
        subject = "Reset Password Link";
        break;
      case "verifyEmail":
        emailHTML = activationTemplate(emailLink, user);
        subject = "Account Verification Link";
        break;
      default:
        throw new Error("Invalid email type provided");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: subject,
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);

    console.log(`${subject} sent to: ${userEmail}`);
  } catch (error) {
    console.error(`Error in sending ${subject || "email"}: ${error.message}`);
    throw new Error(`Error in sending ${subject || "email"}: ${error.message}`);
  }
};
