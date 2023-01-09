// Guilds - EditMessage

import express, { Router } from "express";
import Message from "../../Database/models/GuildMessage";
import { ERROR } from "../../utils/Logger";
import { ERR_BADPARAMS } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.put(`${API_BASE}guild/edit/:messageId`, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message, username } = req.body;

    const resultData = await Message.findOneAndUpdate(
      { _id: messageId, senderId: username },
      { message },
      { upsert: true, new: true }
    );

    res.status(200).json({ status: true, currentMessage: resultData });
  } catch (err) {
    res.status(400).json(Error(ERR_BADPARAMS));
    ERROR(err);
  }
});

export = app;
