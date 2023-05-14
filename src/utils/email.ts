import User from "../Database/models/User";
import cryptoRandomString from "crypto-random-string";
import process from "node:process";
import nodemailer from "nodemailer";

async function generateActivationToken(user_email: string) {
  const user = await User.findOne({ email: user_email.toLowerCase() });
  if (!user) {
    return -1;
  }
  const AKey = `IAT.${cryptoRandomString({
    length: 256,
    type: "alphanumeric",
  })}`;
  user.activation_token = AKey; // generate and return random token if password is correct
  user.save();
  return AKey;
}

async function sendEmail(
  email: string,
  subject: string,
  body: string,
  html_body: string | null
) {
  let transporter = nodemailer.createTransport({
    // irischat.mailservice@gmail.com --- unmonitored
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "irischat.mailservice@gmail.com", // full email-address (username)
      pass: process.env.MAIL_PASSWORD || "unset", // password (App password)
    },
  });

  const genericText = body;
  let info = await transporter.sendMail({
    from: '"Iris Chat (Messaging Service)" <iris@iris-api.fly.dev>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: genericText, // plain text body
    html: html_body || body, // html body
  });
}

function EmailTemplate(email_type: string, token: string, html: Boolean){
}

export { generateActivationToken, sendEmail, EmailTemplate };
