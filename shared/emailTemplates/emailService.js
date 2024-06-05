const nodemailer = require("nodemailer");
const activationTemplate = require("../shared/emailTemplates/emailActivation");
const resetPassTemplate = require("../shared/emailTemplates/resetPass");
const dotenv = require("dotenv");

dotenv.config();

// Function to send activation email
exports.sendActivationEmail = async function (
  userEmail,
  emailLink,
  user,
  type
) {
  try {
    let emailHTML;
    let subject;

    if (type === "resetPassword") {
      emailHTML = resetPassTemplate(emailLink, user);
      subject = "Reset Password Link";
    } else if (type === "verifyEmail") {
      emailHTML = activationTemplate(emailLink, user);
      subject = "Account Verification Link";
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

    // Log email sent
    console.log(`${subject} sent to: ${userEmail}`);
  } catch (error) {
    throw new Error(`Error in send ${subject}:  ${error.message}`);
  }
};
