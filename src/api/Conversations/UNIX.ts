// Private API

import express, { Router } from "express";
import Room from "../../Database/models/Room";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";
import { Error, ERR_BADPARAMS, ERR_RNOTFOUND } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(
  `${API_BASE}conversations/:userID/:roomID/:UNIXtime`,
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
      return res.status(400).json(Error(ERR_BADPARAMS));
    });

    // Check if user exists

    if (!user || !RID || !UID || !UNIXTime) {
      return res.status(400).json(Error(ERR_BADPARAMS));
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

    const room = await Room.findOne({ id: RID, participants: UID });

    if (!room) {
      return res.status(404).json(Error(ERR_RNOTFOUND));
    }
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
