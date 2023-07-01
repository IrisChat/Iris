import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../database/model/User";
import logger from "../utils/logger";
import { email__regex, complexity__regex } from "../regex/AuthRegex";
import {
  Error as AuthError,
  ERR_EMAIL,
  ERR_UNAME,
  ERR_PASWD,
  ERR_ENFORCEMENT_FAILED,
  ERR_TAKEN,
  ERR_INTERNALERROR,
  ERR_NEEDSACTIVATION2,
  ERR_BADAUTH,
  ERR_NEEDSACTIVATION,
} from "../Errors/Errors";
import generateToken from "../utils/generateToken";
import sendEmail from "../utils/sendEmail";
import EmailTemplate from "../utils/emailTemplate";

const app = Router();

app.post("/register", async (req, res) => {
  const { email, username, password: text } = req.body;

  if (!email || typeof email !== "string" || !email__regex.test(email)) {
    return res.status(406).json(AuthError(ERR_EMAIL));
  } else if (!username || typeof username !== "string") {
    return res.status(406).json(AuthError(ERR_UNAME));
  } else if (!text || typeof text !== "string") {
    return res.status(406).json(AuthError(ERR_PASWD));
  } else if (text.length < 5 || !complexity__regex.test(text)) {
    return res.status(406).json(AuthError(ERR_ENFORCEMENT_FAILED));
  }

  const password = await bcrypt.hash(text, 10);

  try {
    const UID = Math.round(new Date().getTime() / 1000).toString();
    const user = await User.create({
      UID,
      email,
      password,
      username,
    });

    if (!user) {
      return res.status(400).json({ error: "Failed to find user." });
    }

    user.save();

    // @ts-ignore
    delete user.password;
    const ActToken = await generateToken(req.body.email);
    if (ActToken == (-1 as any))
      return res.status(500).json(AuthError(ERR_INTERNALERROR));
    await sendEmail(
      req.body.email,
      "Iris — Please Verify Your Account To Continue",
      null,
      EmailTemplate("ACTIVATE", user.username, ActToken)
    );
    return res.json({
      status: true,
      message: ERR_NEEDSACTIVATION2,
    });
  } catch (err: any) {
    logger.error(err);
    if (err.code === 11000) {
      return res.status(406).json(AuthError(ERR_TAKEN));
    }
    res.sendStatus(500);
    throw AuthError(err.code);
  }
});

app.post("/login", async (req, res) => {
  let cryptoRandomString = await import("crypto-random-string");
  const { username, password } = req.body;

  const user =
    (await User.findOne({ username })) ||
    (await User.findOne({ email: username.toLowerCase() }));

  if (!user) {
    return res.status(403).json(AuthError(ERR_BADAUTH));
  }

  if (!user.activated || user.activation_token) {
    if (!user.activation_token) {
      await generateToken(user.email);

      return res
        .status(500)
        .json(
          AuthError(
            "Oops! Looks like something went wrong on our end! Please try that again"
          )
        );
    }

    const ActivationToken = user.activation_token;
    await sendEmail(
      user.email,
      "Iris — Please Verify Your Account To Continue",
      null,
      EmailTemplate("ACTIVATE", user.username, ActivationToken)
    );
    return res.status(403).json(AuthError(ERR_NEEDSACTIVATION));
  }

  try {
    const isValidPassword = await bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(403).json(AuthError(ERR_BADAUTH));
    }

    user.token = `IRK.${cryptoRandomString.default({
      length: 45,
      type: "alphanumeric",
    })}`;

    user.save();

    return res.json({
      status: true,
      loggedIn: true,
      id: user.UID,
      token: user.token,
    });
  } catch (err) {
    res.sendStatus(400);
    logger.error(err as string);
  }
});

export = app;
