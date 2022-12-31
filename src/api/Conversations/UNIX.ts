// Private API

import express, { Router } from "express";
import Room from "../../Database/models/Room";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/************** ERROR VALUES */

const ERR_NOTFOUND = "The parameters provided are incorrect.";
const ERR_RNOTFOUND = "The room ID provided does not exist.";

/*************************** */

app.post(
  "/api/v0/conversations/:userID/:roomID/:UNIXtime",
  async (req, res) => {
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

    // Check user presence in room
    const UNIXTime = parseInt(req.params.UNIXtime);
    const RID: Number = parseInt(req.params.roomID);
    const UID: Number = parseInt(req.params.userID);
    const user = await User.findOne({ UID }).catch((error) => {
      Logger.ERROR(error);
      return res.json({
        message: ERR_NOTFOUND,
        status: false,
      });
    });

    // Check if user exists

    if (!user || !RID || !UID || !UNIXTime) {
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

    const room = await Room.findOne({ id: RID, participants: UID });

    //   if (!room) {
    //     return res.json({
    //       message: ERR_RNOTFOUND,
    //       status: false,
    //     });
    //   }
    let room_: object;

    room?.messages.forEach((message) => {
      if (parseInt(message.timestamp) == UNIXTime) {
        room_ = message;
        // Return room data if found
        return res.json(JSON.parse(JSON.stringify(room_)));
      }
    });

    // If message is not found
    try {
      res.sendStatus(404);
    } catch (err) {
      // Do nothing
    }
  }
);

export = app;
