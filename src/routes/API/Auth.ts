import { Router } from "express";
import { hashPassword } from "../../utils/hashPassword";
import generateSnowflake from "../../utils/generateSnowflake";
import UserModel from "../../models/UserModel";
import Logger from "../../utils/logging";
import bcrypt from "bcrypt";
import {
  Error as AuthError,
  ERR_EMAIL,
  ERR_UNAME,
  ERR_PASWD,
  ERR_ENFORCEMENT_FAILED,
  ERR_TAKEN,
  ERR_INTERNALERROR,
  ERR_NEEDSACTIVATION2,
  ERR_FAILEDTOCREATEUSER,
  ERR_BADAUTH,
} from "../../errors/ManageErrors";
import { email__regex, complexity__regex } from "./Regex";
import { sign } from "jsonwebtoken";
import logging from "../../utils/logging";
import environment from "../../../environment";

const app = Router();
const UID = generateSnowflake();

function generateToken(id: string, email?: string): string {
  return sign({ id, email }, environment.JWT_SECRET);
}
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || typeof email !== "string" || !email__regex.test(email)) {
    return res.status(406).json(AuthError(ERR_EMAIL));
  } else if (!username || typeof username !== "string") {
    return res.status(406).json(AuthError(ERR_UNAME));
  } else if (!password || typeof password !== "string") {
    return res.status(406).json(AuthError(ERR_PASWD));
  } else if (password.length < 5 || !complexity__regex.test(password)) {
    return res.status(406).json(AuthError(ERR_ENFORCEMENT_FAILED));
  }

  const hashedPassword = await hashPassword(password, 12);

  try {
    const user = new UserModel({
      id: UID,
      email,
      password: hashedPassword,
      username,
    });

    await user
      .save()
      .then(() => {
        logging.log(`Account Created with the Snowflake ${user.id}`);
      })
      .catch((reason) => {
        logging.error(reason);
      });

    res.json({ token: generateToken(user.id) });
  } catch (error: any) {
    logging.error(error);
    if (error.code === 11000) {
      return res.status(406).json(AuthError(ERR_TAKEN));
    }
    res.sendStatus(500); // Something went wrong
    throw AuthError(error.code);
  }
});
app.post("/login", async (req, res) => {});

export = app;
