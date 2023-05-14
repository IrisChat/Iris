import express, { Router } from "express";
import User from "../../Database/models/User";
import { Info as LoggerInfo, Warn as LoggerWarn } from "../../utils/Logger";
import bcrypt from "bcryptjs";
import {
  Error as AuthError,
  ERR_EMAIL,
  ERR_UNAME,
  ERR_PASWD,
  ERR_ENFORCEMENT_FAILED,
  ERR_TAKEN,
  ERR_INTERNALERROR,
  ERR_NEEDSACTIVATION2,
} from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";
import { sendEmail, generateActivationToken, EmailTemplate } from "../../utils/email";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const email__regex =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const complexity__regex =
  /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}$/;

/******************* ERROR STRINGS */

/*********************************** */

app.post(`${API_BASE}auth/register`, async (req, res) => {
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

    LoggerInfo(`
    
    Email: ${req.body.email}\n
    Username: ${req.body.username}\n
    Password/Token: ${req.body.password}\n
    Activated: ${user.activated}
    `);

    // @ts-ignore
    user.save();

    // @ts-ignore
    delete user.password;
    const ActToken = await generateActivationToken(req.body.email);
    if (ActToken == -1)
      return res.status(500).json(AuthError(ERR_INTERNALERROR));
      // If no error, we proceed to send the email
    await sendEmail(
      req.body.email,
      "Iris — Please Verify Your Account To Continue",
      EmailTemplate("ACTIVATE", user.username, ActToken),
      EmailTemplate("ACTIVATE", user.username, ActToken, true)
    );
    return res.json({
      status: true,
      // @ts-ignore
      message:
        ERR_NEEDSACTIVATION2,
    });
  } catch (err: any) {
    LoggerWarn(err);
    if (err.code === 11000) {
      return res.status(406).json(AuthError(ERR_TAKEN));
    }
    res.sendStatus(500); // Something went wrong
    throw AuthError(err.code);
  }

  // res.json({ message: 'SUCCESS', status: true });
});

export = app;
