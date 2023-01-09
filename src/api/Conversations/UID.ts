// Private API

import express, { Router } from "express";
import Room from "../../Database/models/Room";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";
import { Error, ERR_NOTFOUND, ERR_RNOTFOUND } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}conversations/:userID/:roomID`, async (req, res) => {
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
  let Rlength = req.body[0];
  const RID = req.params.roomID;
  const UID = parseInt(req.params.userID);
  const user = await User.findOne({ UID }).catch((error) => {
    Logger.ERROR(error);
    return res.status(404).json(Error(ERR_NOTFOUND));
  });

  // Check if user exists

  if (!user || !RID || !UID) {
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

  const room = await Room.findOne({ id: RID, participants: UID.toString() });
  if (!room) {
    return res.status(404).json(Error(ERR_RNOTFOUND));
  }
  if (isNaN(Rlength)) {
    return res.sendStatus(422);
  }

  const MessageLength = room.messages.length;

  if (Rlength > MessageLength) {
    // Return full room data
    res.json(JSON.parse(JSON.stringify(room.messages)));
  } else {
    const data = room.messages.slice(MessageLength - Rlength);
    // Return room data
    res.json(JSON.parse(JSON.stringify(data)));
  }
});

export = app;
