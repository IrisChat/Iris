/*
 * Preferences API [POST/DEL] - Requires authentication
 * What it does: takes in JSON and appends to user.preferences database schema member
 * onPOST = Modify preferences
 * onDELETE = Reset to default
 */

import express, { Router } from "express";
import User from "../../Database/models/User";
import { API_BASE } from "../../config/config.json";
import Logger from "../../utils/Logger";

const app = Router();

const ERR_NOTFOUND =
  "The specified user could not be found using the provided ID.";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}user/preferences/:userID`, async (req, res) => {
  let Authorization = req.headers.authorization;
  const UID: string = req.params.userID;
  const Preference: string = req.body;

  if (Authorization) {
    if (Authorization.startsWith("Bearer ")) {
      Authorization = Authorization.substring(7, Authorization.length);
    } else {
      res.sendStatus(422);
    }
  } else {
    return res.sendStatus(422);
  }

  try {
    if (!req.params.userID || req.params.userID === null) {
      return res.sendStatus(422);
    }

    const user: any = await User.findOne({ UID }).catch((error) => {
      Logger.ERROR(error);
      return res.status(404).json(Error(ERR_NOTFOUND));
    });

    if (!user) {
      return res.status(404).json(Error(ERR_NOTFOUND));
    }

    if (Authorization) {
      // @ts-ignore
      const isValidPassword = Authorization === user.token;
      if (!isValidPassword) {
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(403);
    }

    // set Preferences
    if (Preference && Preference != "" && user) {
      // @ts-ignore
      user.preferences = Preference;
      user.save();

      return res.json({
        // @ts-ignore
        preferences: user.preferences,
        // @ts-ignore
        UID: user.UID,
        // @ts-ignore
        username: user.username,
      });
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    Logger.ERROR(err);
  }
});

app.delete(`${API_BASE}user/preferences/:userID`, async (req, res) => {
  let Authorization = req.headers.authorization;
  const UID: string = req.params.userID;

  if (Authorization) {
    if (Authorization.startsWith("Bearer ")) {
      Authorization = Authorization.substring(7, Authorization.length);
    } else {
      res.sendStatus(422);
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

    if (!user) {
      return res.status(404).json(Error(ERR_NOTFOUND));
    }

    if (Authorization) {
      // @ts-ignore
      const isValidPassword = Authorization === user.token;
      if (!isValidPassword) {
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(403);
    }

    // set Preferences
    // @ts-ignore
    user.preferences = "Hi this a test!";

    // @ts-ignore
    user.save();

    return res.json({
      // @ts-ignore
      preferences: user.preferences,
      // @ts-ignore
      UID: user.UID,
      // @ts-ignore
      username: user.username,
    });
  } catch (err) {
    Logger.ERROR(err);
  }
});

export = app;
