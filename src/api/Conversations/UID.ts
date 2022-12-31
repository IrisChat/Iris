// Private API

import express, { Router } from "express";
import Room from "../../Database/models/Room";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/************** ERROR VALUES */

const ERR_NOTFOUND =
  "The specified user could not be found using the provided ID.";
const ERR_RNOTFOUND = "The room ID provided does not exist.";

/*************************** */

app.post("/api/v0/conversations/:userID/:roomID", async (req, res) => {
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
  //   Fake Room
  //   await Room.create({
  //   id: 1,
  //     messages: [
  //       {
  //         sender: 1672455513,
  //         type: 1,
  //         content: "Hello!",
  //         timestamp: 215235235235235,
  //       },
  //       {
  //         sender: 1672455460,
  //         type: 1,
  //         content: "Hi!",
  //         timestamp: 23523553552,
  //       },
  //     ],
  //   });

  // Check user presence in room
  let Rlength = req.body[0];
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

  if (!user || !RID || !UID) {
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

  if (!room) {
    return res.json({
      message: ERR_RNOTFOUND,
      status: false,
    });
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
