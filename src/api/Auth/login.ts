import express, { Router } from "express";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";
import bcrypt from "bcryptjs";
import { Error, ERR_BADAUTH } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";
import cryptoRandomString from "crypto-random-string";

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
      return res.status(403).json(Error(ERR_BADAUTH));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(403).json(Error(ERR_BADAUTH));
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
  } catch (err) {
    res.sendStatus(400); // Bad request
    Logger.ERROR(err);
  }
});

export = app;
