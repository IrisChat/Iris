// Public API

import express, { Router } from "express";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/************** ERROR VALUES */
const ERR_NOTFOUND =
  "The specified user could not be found using the provided ID.";

/*************************** */

app.post("/api/v0/user/:userID", async (req, res) => {
  const UID: Number = parseInt(req.params.userID);
  const user = await User.findOne({ UID });

  try {
    if (!user || !UID) {
      return res.json({
        message: ERR_NOTFOUND,
        status: false,
      });
    }
    return res.json({
      avatar: user.avatar,
      username: user.username,
      ID: user.UID, // User IDs should be in UNIX time of join date
      about: user.aboutme,
      status: user.status,
    });
  } catch (err) {
    res.sendStatus(400); // Bad request
    Logger.ERROR(err);
  }
});

export = app;
