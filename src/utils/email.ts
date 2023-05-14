import User from "../Database/models/User";
import cryptoRandomString from "crypto-random-string";
import process from "node:process";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

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

function EmailTemplate(
  email_type: string,
  name: string | null,
  token: string,
  html: Boolean | null
) {
  let title,
    body,
    subtitle = "";
  switch (email_type) {
    case "ACTIVATE":
      const VerificationTemplate = fs.readFileSync(
        path.join(__dirname, "verify.html")
      );
      const VerificationLink = `https://iris-app.fly.dev/auth/verify?activation_token=${token}`;
      title = "";
      body =
        "In order finish creating your Iris account and help us verify that you're human, we need to verify your email address.";
      subtitle =
        "You're receiving this email because you recently created a new Iris account. If this wasn't you, please ignore this email.";
      if (html) {
        return eval("`" + VerificationTemplate.toString() + "`");
      } else {
        return `
    Almost done, @${name}!
    ${body}
    
    Click the button below to verify your email address: Activate Account
    This will let you receive notifications and password resets from the service.
    
    Link not working? Try using this: ${VerificationLink}
    This will let you receive notifications and password resets from the service.
    
    ${subtitle}`;
      }

    case "PASSWORD_RESET":
      const PasswordTemplate = fs.readFileSync(
        path.join(__dirname, "reset.html")
      );
      title =
        "Hi, it seems as if you requested a password reset link. Here you go! Please do not share this link with anyone. If you did not request this email, please ignore it.";
      body = `<br/>
        <a href="https://iris-app.fly.dev/auth/reset?reset_token=${token}">https://iris-app.fly.dev/auth/reset?reset_token=${token}</a>`;
      subtitle = "";
      if (html) {
        return eval("`" + PasswordTemplate.toString() + "`");
      } else {
        return `
        ${title}
        ${body}
        `;
      }
  }
}

export { generateActivationToken, sendEmail, EmailTemplate };
