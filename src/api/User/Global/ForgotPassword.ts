// Public API

import express, { Router } from "express";
import nodemailer from "nodemailer";
import process from "node:process";
import User from "../../../Database/models/User";
import bcrypt from "bcryptjs";
import { Error as LoggerError } from "../../../utils/Logger";
import {
  Error as FinderError,
  ERR_NOTFOUND,
  ERR_PASWD,
  ERR_ENFORCEMENT_FAILED,
} from "../../Errors/Errors";
import { API_BASE } from "../../../config/config.json";
import cryptoRandomString from "crypto-random-string"; // For generating the password reset token
const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}user/global/forgotpassword/`, async (req, res) => {
  const { username, id } = req.body;
  let userRequest;

  try {
    userRequest =
      (await User.findOne({ username })) ||
      (await User.findOne({ UID: parseInt(id) }));
  } catch (error) {
    return res.status(400).json(FinderError("That user was not found."));
  }
  const user = userRequest;

  try {
    if (!user) {
      return res.status(404).json(FinderError(ERR_NOTFOUND));
    }

    /************************ */

    // create reusable transporter object using the default SMTP transport
    // https://support.google.com/mail/answer/7126229
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
    /////////////////////////////////////////////////
    // After logging in we generate the reset_token

    const rkey = `IPK.${cryptoRandomString({
      length: 128,
      type: "alphanumeric",
    })}`;
    user.reset_token = rkey; // generate and return random token if password is correct
    user.save();

    const genericText =
      "Hi, it seems as if you requested a password reset link. Here you go! Please do not share this link with anyone. If you did not request this email, please ignore it.";
    let info = await transporter.sendMail({
      from: '"Iris Chat (Messaging Service)" <iris@iris-api.fly.dev>', // sender address
      to: user.email, // list of receivers
      subject: "Your Password Reset Link", // Subject line
      text: genericText, // plain text body
      html: `
      <b>${genericText}</b>
      <br/>
      <a href="https://iris-app.fly.dev/auth/reset?reset_token=${rkey}">https://iris-app.fly.dev/auth/reset?reset_token=${rkey}</a>`, // html body
    });

    console.log("Password reset link sent: %s", info.messageId);

    /******************************** */

    return res.json({
      message: "Reset link sent. Please check your inbox.",
      status: true,
    });
  } catch (err: any) {
    res.status(400).json(FinderError("That user was not found.")); // Bad request
    LoggerError(err);
  }
});

// This does the actual resetting

app.patch(`${API_BASE}user/global/forgotpassword/`, async (req, res) => {
  const { password: text } = req.body;

  const complexity__regex =
    /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}$/;
  let Authorization = req.headers.authorization;

  // @ts-ignore
  if (Authorization) {
    if (Authorization.startsWith("Bearer ")) {
      // @ts-ignore
      Authorization = Authorization.substring(7, Authorization.length);
    } else {
      return res.sendStatus(422);
    }
  } else {
    return res.sendStatus(422);
  }

  let userRequest;

  try {
    userRequest = await User.findOne({
      reset_token: Authorization,
    });
  } catch (error) {
    return res.sendStatus(400);
  }
  const user = userRequest;
  if (!user) return res.sendStatus(400);

  if (!text || typeof text !== "string") {
    return res.status(406).json(FinderError(ERR_PASWD));
  } else if (text.length < 5 || !complexity__regex.test(text)) {
    return res.status(406).json(FinderError(ERR_ENFORCEMENT_FAILED));
  }

  if (bcrypt.compareSync(text, user.password)) {
    return res.json({
      message: "Please choose a different password.",
      status: false,
    });
  }
  const password = await bcrypt.hash(text, 10);

  user.password = password;
  user.reset_token = undefined;
  user.save();
  return res.json({
    status: true,
  });
});
export = app;
