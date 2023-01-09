// Private API

import express, { Router } from "express";
import { API_BASE } from "../../config/config.json";
import User from "../../Database/models/User";
import Logger from "../../utils/Logger";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`${API_BASE}conversations/:userID`, async (req, res) => {
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
      UID: req.params["userID"],
      token: Authorization,
    });
  } catch (error) {
    return res.sendStatus(400);
  }
  const user = userRequest;

  try {
    let response: any = [];
    let index = 0;
    user?.conversations?.forEach(async (UID, _index, array) => {
      // For each user that is a part of the conversations array, we then create a response
      const user = await User.findOne({ UID });
      // console.log(user);
      response.push({
        avatar: user?.avatar,
        username: user?.username,
        ID: user?.UID, // User IDs should be in UNIX time of join date
        about: user?.aboutme,
        status: user?.status,
      });
      if (index === array.length - 1) {
        try {
          return res.json(response);
        } catch (error) {
          Logger.WARN("JOB LEFT HANGING. ABANDONING");
        }
      }
      index++;
    }); // Return array of user conversations

    // Kill job if it's taking too long

    setTimeout(() => {
      try {
        Logger.WARN("JOB KILLED AFTER 5000ms");
        return res.sendStatus(500);
      } catch (e) {
        // Do nothing
      }
    }, 5000);
  } catch (err) {
    res.sendStatus(400); // Bad request
    Logger.ERROR("HANDLED ERROR: BAD_AUTH: " + err);
  }
});

export = app;
