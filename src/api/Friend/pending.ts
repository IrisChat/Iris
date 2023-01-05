import express, { Router } from "express";
import Friend from "../../Database/models/Friend";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`${API_BASE}friend/pending`, async (req, res) => {
  const friendRequest = await Friend.find({ toUser: req.body.id, status: true })
    .populate({ path: "toUser" })
    .populate({ path: "fromUser" });

  res.status(200).send(friendRequest);
});

export = app;
