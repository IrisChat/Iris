// Private API [REQ AUTH]

import express, { Router } from "express";
import User from "../../Database/models/User";
import { Error as LoggerError } from "../../utils/Logger";
import { API_BASE } from "../../config/config.json";
import { ERR_NOTFOUND, Error as AuthError} from "../Errors/Errors";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* REQUEST BODY
{
    "token": TOKEN // In Auth header
    "ID": UID // UserID as param
    "status": STRING // Is NOT present on DELETE
}
*/

/**
   @brief Add status to user.
   @params Request body must contain an ID and status binary data or HTTP link
   @authentication Must be present
*/

app.post(`${API_BASE}user/status/`, async (req, res) => {
  // Find user
  let Authorization = req.headers.authorization;
  const Status: string = req.body.status;

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
    const user = await User.findOne({ token: Authorization }).catch((error) => {
      LoggerError(error);
      return res.status(404).json(AuthError(ERR_NOTFOUND));
    });
    // Check existence
    if (!user) {
      return res.status(404).json(AuthError(ERR_NOTFOUND));
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
    // Set status
    // @ts-ignore
    if (
      (Status && Status != "" && Status === "online") ||
      Status === "offline" ||
      Status === "DnD" ||
      Status === "invisible"
    ) {
      // @ts-ignore
      user.status = Status;
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
  } catch (err: any) {
    res.sendStatus(400); // Bad request
    LoggerError(err);
  }
});

export = app;
