// Private API [REQ AUTH]

import express, { Router } from "express";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";
import config from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/************** ERROR VALUES */
const ERR_NOTFOUND =
  "The specified user could not be found using the provided ID.";

/*************************** */

/* REQUEST BODY
{
    "token": TOKEN // In Auth header
    "ID": UID // UserID as param
    "avatar": STRING // Is NOT present on DELETE
}
*/

/**
   @brief Add avatar to user.
   @params Request body must contain an ID and avatar binary data or HTTP link
   @authentication Must be present
*/

app.post("/api/v0/user/avatar/:userID", async (req, res) => {
  // Find user
  let Authorization = req.headers.authorization;
  const UID: string = req.params.userID;
  const Avatar: string = req.body.avatar;

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
      return res.json({
        message: ERR_NOTFOUND,
        status: false,
      });
    });
    // Check existence
    if (!user) {
      return res.json({
        message: ERR_NOTFOUND,
        status: false,
      });
    }

    // Check Authorization header
    if (Authorization) {
      // @ts-ignore
      const isValidPassword = Authorization === user.password;
      if (!isValidPassword) {
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(403);
    }
    // Set avatar
    // @ts-ignore
    if (Avatar && Avatar != "") {
      // @ts-ignore
      user.avatar = Avatar;
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

app.delete("/api/v0/user/avatar/:userID", async (req, res) => {
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
      return res.json({
        message: ERR_NOTFOUND,
        status: false,
      });
    });
    // Check existence
    if (!user) {
      return res.json({
        message: ERR_NOTFOUND,
        status: false,
      });
    }

    // Check Authorization header
    if (Authorization) {
      // @ts-ignore
      const isValidPassword = Authorization === user.password;
      if (!isValidPassword) {
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(403);
    }
    // Set avatar
    // @ts-ignore
    user.avatar = config.defaultAvatar;

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
