// Public API

import express, { Router } from "express";
import User from "../../Database/models/User";
import { Error as LoggerError } from "../../utils/Logger";
import { Error as FinderError, ERR_NOTFOUND } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}user/global/find/`, async (req, res) => {
  const { username, id } = req.body;
  let userRequest;

  try {
    userRequest =
      (await User.findOne({ username })) ||
      (await User.findOne({ UID: parseInt(id) }));
  } catch (error) {
    return res.sendStatus(400);
  }
  const user = userRequest;

  try {
    if (!user) {
      return res.status(404).json(FinderError(ERR_NOTFOUND));
    }
    return res.json({
      avatar: user.avatar,
      username: user.username,
      ID: user.UID, // User IDs should be in UNIX time of join date
      about: user.aboutme,
      status: user.status,
    });
  } catch (err: any) {
    res.sendStatus(400); // Bad request
    LoggerError(err);
  }
});

export = app;
