import User from "../../Database/models/User";
import express, { Router } from "express";
import Friend from "../../Database/models/Friend";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}friend/outgoing`, async (req, res) => {
  // @ts-ignore
  const { username } = req.body; // test

  const user = await User.findOne({ username });

  const outgoingRequestData = await Friend.create({
    fromUser: username,
    toUser: user?._id,
    status: "OUTGOING",
  });

  res.json({ status: true, outgoingRequestData });
});

export = app;
