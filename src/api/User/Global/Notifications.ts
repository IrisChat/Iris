// Private API [REQ AUTH]

import express, { Router } from "express";
import User from "../../../Database/models/User";
import Notification from "../../../Database/models/Notification";
import { Error as LoggerError } from "../../../utils/Logger";
import {
  Error as HTTPError,
  ERR_BADPARAMS,
  ERR_NOACCESS,
  ERR_NOTFOUND,
  ERR_DATANOTFOUND,
} from "../../Errors/Errors";
import { API_BASE } from "../../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Get the most recent notification
app.get(`${API_BASE}user/global/notifications`, async (req, res) => {
  try {
    const latest = await Notification.countDocuments() - 1;
    const notification = await Notification.findOne({ index: latest });
    if (!notification) return res.status(404).json(HTTPError(ERR_DATANOTFOUND));
    res.status(200).json({
      type: notification?.type,
      body: notification?.body,
      author: notification?.author,
      timestamp: notification?.timestamp,
    });
  } catch (err: any) {
    res.sendStatus(400); // Bad request
    LoggerError(err);
  }
});

/**
   @brief Write notifications
   @params Request body must the fields `type` and `body` in JSON format
   @authentication Must be present
*/

app.post(`${API_BASE}user/global/notifications`, async (req, res) => {
  const { type, body } = req.body;
  // Find user
  let Authorization: any = req.headers.authorization;
  const About: string = req.body.aboutme;

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
  try {
    const user = await User.findOne({
      token: Authorization,
      role: "Administrator",
    }).catch((error) => {
      LoggerError(error);
      return res.status(404).json(HTTPError(ERR_NOTFOUND));
    });
    // Check existence
    if (!user) {
      return res.status(403).json(HTTPError(ERR_NOACCESS));
    }

    // Check Authorization header
    if (Authorization) {
      // @ts-ignore
      const isValidPassword = Authorization === user.token;
      if (!isValidPassword) {
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(403);
    }
    // Check for `type` and `body`
    if (!type || !body) {
      return res.status(422).json(HTTPError(ERR_BADPARAMS));
    }
    await Notification.create({
      index: await Notification.countDocuments(),
      type,
      body, // @ts-ignore
      author: user.username,
    });
    res.sendStatus(200);
  } catch (err: any) {
    res.sendStatus(400); // Bad request
    LoggerError(err);
  }
});

export = app;
