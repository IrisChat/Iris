import express, { Router } from "express";
import User from "../../Database/models/User";
import { Error as LoggerError } from "../../utils/Logger";
import bcrypt from "bcryptjs";
import {
  Error as AuthError,
  ERR_BADAUTH,
  ERR_NEEDSACTIVATION,
} from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";
import cryptoRandomString from "crypto-random-string";
import {
  sendEmail,
  EmailTemplate,
  generateActivationToken,
} from "../../utils/email";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}auth/login`, async (req, res) => {
  const { username, password } = req.body;

  const user =
    (await User.findOne({ username })) ||
    (await User.findOne({ email: username.toLowerCase() }));

  try {
    if (!user) {
      return res.status(403).json(AuthError(ERR_BADAUTH));
    }
    if (!user.activated || user.activation_token) {
      // Check if an activation token doest not exist
      if (!user.activation_token) {
        await generateActivationToken(user.email); // Run the activation script and exit
        return res
          .status(500)
          .json(
            AuthError(
              "Oops! Looks like something went wrong on our end! Please try that again."
            )
          );
      }
      const ActToken = user.activation_token;
      await sendEmail(
        user.email,
        "Iris — Please Verify Your Account To Continue",
        EmailTemplate("ACTIVATE", user.username, ActToken),
        EmailTemplate("ACTIVATE", user.username, ActToken, true)
      );
      return res.status(403).json(AuthError(ERR_NEEDSACTIVATION));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(403).json(AuthError(ERR_BADAUTH));
    }

    user.token = `IRK.${cryptoRandomString({
      length: 45,
      type: "alphanumeric",
    })}`; // generate and return random token if password is correct
    user.save();

    return res.json({
      status: true,
      loggedIn: true,
      id: user.UID,
      token: user.token,
    });
  } catch (err: any) {
    res.sendStatus(400); // Bad request
    LoggerError(err);
  }
});

export = app;
