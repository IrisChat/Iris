import User from "../../Database/models/User";
import Friend from "../../Database/models/Friend";
import express, { Router } from "express";
import { USER_NOTFOUND, Error } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}friend/add`, async (req, res) => {
  let Authorization = req.headers.authorization;
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

  const { id, username } = req.body; // test

  const user = await User.findOne({ token: Authorization });

  const friendRequestData = await Friend.create({
    fromUser: user?.UID,
    toUser: username,
    tagId: id,
    status: "ADD",
  });

  // if (user?.username === username && user?.tagId === tagId) {
  //   res.json({ status: false, error: USER_CANNOTADDYOURSELF });
  // } else {
  //   res.json({ status: true, friendRequestData });
  // }

  if (!friendRequestData || !user?.username || !id) {
    res.status(400).json(Error(USER_NOTFOUND));
  } else {
    res.json({ status: true, friendRequestData });
    friendRequestData.save();
  }
});

export = app;
