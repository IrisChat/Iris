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
  body: string | null,
  html_body: string | null
) {
  let transporter = nodemailer.createTransport({
    // irischat.mailservice@gmail.com --- unmonitored
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "irischat.mailservice@googlemail.com", // full email-address (username)
      pass: process.env.MAIL_PASSWORD || "unset", // password (App password)
    },
  });

  const genericText = body || "";
  let info = await transporter.sendMail({
    from: '"Iris Chat (Messaging Service)" <iris@iris-api.fly.dev>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: genericText || "", // plain text body
    html: html_body || genericText || "", // html body
  });
}

function EmailTemplate(email_type: string, name: string | null, token: string) {
  let title,
    body,
    subtitle = "";
  switch (email_type) {
    case "ACTIVATE":
      const VerificationTemplate = fs.readFileSync(
        path.join(__dirname, "verify.html")
      );
      // These are used in the template ------------------------------------
      const VerificationLink = `https://iris-app.fly.dev/auth/verify?activation_token=${token}`;
      title = "";
      body =
        "In order finish creating your Iris account and help us verify that you're human, we need to verify your email address.";
      subtitle =
        "You're receiving this email because you recently created a new Iris account. If this wasn't you, please ignore this email.";
      // ---------------------------------------------------
      return eval("`" + VerificationTemplate.toString() + "`");  // Evaluate the template and return it

    case "PASSWORD_RESET":
      const PasswordTemplate = fs.readFileSync(
        path.join(__dirname, "reset.html")
      );
      // These are used in the template ------------------------------------
      title =
        "Hi, it seems as if you requested a password reset link. Here you go! Please do not share this link with anyone. If you did not request this email, please ignore it.";
      body = `<br/>
        <a href="https://iris-app.fly.dev/auth/reset?reset_token=${token}">https://iris-app.fly.dev/auth/reset?reset_token=${token}</a>`;
      subtitle = "";
      // ---------------------------------------------------
      return eval("`" + PasswordTemplate.toString() + "`"); // Evaluate the template and return it
  }
}

export { generateActivationToken, sendEmail, EmailTemplate };
