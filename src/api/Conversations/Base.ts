// Private API

import express, { Router } from "express";
import { API_BASE } from "../../config/config.json";
import User from "../../Database/models/User";
import { Warn as LoggerWarn, Error as LoggerError } from "../../utils/Logger";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`${API_BASE}conversations/`, async (req, res) => {
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

  let userRequest;

  try {
    userRequest = await User.findOne({
      token: Authorization,
    });
  } catch (error) {
    return res.sendStatus(400);
  }
  const user = userRequest;

  try {
    const conversationUsers: any = user?.conversations?.map((UID: any) => {
      return User.findOne({ UID }).exec();
    });

    const resolvedConversationUsers = await Promise.all(conversationUsers);

    const response = resolvedConversationUsers.map((user: any) => ({
      avatar: user?.avatar,
      username: user?.username,
      ID: user?.UID, // User IDs should be in UNIX time of join date
      about: user?.aboutme,
      status: user?.status,
    }));

    // Return array of user conversations
    return res.json(response);
  } catch (err) {
    res.sendStatus(400); // Bad request
    LoggerError("HANDLED ERROR: BAD_AUTH: " + err);
  }
});

export = app;
