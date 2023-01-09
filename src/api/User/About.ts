// Private API [REQ AUTH]

import express, { Router } from "express";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";
import { ERR_NOTFOUND } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* REQUEST BODY
{
    "token": TOKEN // In Auth header
    "ID": UID // UserID as param
    "aboutme": STRING // Is NOT present on DELETE
}
*/

/**
   @brief Add about to user.
   @params Request body must contain an ID and about binary data or HTTP link
   @authentication Must be present
*/

app.post(`${API_BASE}user/about/:userID`, async (req, res) => {
  // Find user
  let Authorization = req.headers.authorization;
  const UID: string = req.params.userID;
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
    if (!req.params.userID || req.params.userID === null) {
      return res.sendStatus(422);
    }
    const user = await User.findOne({ UID }).catch((error) => {
      Logger.ERROR(error);
      return res.status(404).json(Error(ERR_NOTFOUND));
    });
    // Check existence
    if (!user) {
      return res.status(404).json(Error(ERR_NOTFOUND));
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
    // Set about
    // @ts-ignore
    if (About && About != "") {
      // @ts-ignore
      user.aboutme = About;
    }
    // Return back new user
    // @ts-ignore
    user.save();
    return res.json({
      // @ts-ignore
      avatar: user.avatar, // @ts-ignore
      username: user.username, // @ts-ignore
      ID: user.UID, // User IDs should be in UNIX time of join date
      // @ts-ignore
      about: user.aboutme, // @ts-ignore
      status: user.status,
    });
  } catch (err) {
    res.sendStatus(400); // Bad request
    Logger.ERROR(err);
  }
});

app.delete(`${API_BASE}user/about/:userID`, async (req, res) => {
  // Find user
  let Authorization = req.headers.authorization;
  const UID: string = req.params.userID;

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
    if (!req.params.userID || req.params.userID === null) {
      return res.sendStatus(422);
    }
    const user = await User.findOne({ UID }).catch((error) => {
      Logger.ERROR(error);
      return res.status(404).json(Error(ERR_NOTFOUND));
    });
    // Check existence
    if (!user) {
      return res.status(404).json(Error(ERR_NOTFOUND));
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
    // Set about
    // @ts-ignore

    user.aboutme = "";

    // Return back new user
    // @ts-ignore
    user.save();
    return res.json({
      // @ts-ignore
      avatar: user.avatar, // @ts-ignore
      username: user.username, // @ts-ignore
      ID: user.UID, // User IDs should be in UNIX time of join date
      // @ts-ignore
      about: user.aboutme, // @ts-ignore
      status: user.status,
    });
  } catch (err) {
    res.sendStatus(400); // Bad request
    Logger.ERROR(err);
  }
});

export = app;
