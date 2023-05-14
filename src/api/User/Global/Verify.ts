// Public API

import express, { Router } from "express";
import User from "../../../Database/models/User";
import { Error as LoggerError } from "../../../utils/Logger";
import {
  Error as FinderError,
  ERR_NOTFOUND
} from "../../Errors/Errors";
import { API_BASE } from "../../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}user/global/verify/`, async (req, res) => {
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
      activation_token: Authorization,
    });
  } catch (error) {
    return res.status(400).json(FinderError("That user was not found."));
  }
  const user = userRequest;

  try {
    if (!user) {
      return res.status(404).json(FinderError(ERR_NOTFOUND));
    }

    user.activated = true;
    user.activation_token = undefined;
    user.save();
    return res.json({
      status: true,
    });
  } catch (err: any) {
    res.status(400).json(FinderError("That user was not found.")); // Bad request
    LoggerError(err);
  }
});

export = app;
