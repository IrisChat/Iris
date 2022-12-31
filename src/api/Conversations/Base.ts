// Private API

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

app.get("/api/v0/conversations/", async (req, res) => {
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
  const user = await User.findOne({ password: Authorization });
  try {
    // @ts-ignore
    return res.json(user.conversations);
  } catch (err) {
    res.sendStatus(400); // Bad request
    Logger.ERROR(err);
  }
});

export = app;
