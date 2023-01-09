// Guilds - SendMessage

import express, { Router } from "express";
import Message from "../../Database/models/GuildMessage";
import { ERROR } from "../../utils/Logger";
import { ERR_BADPARAMS } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post(`${API_BASE}guild/message`, async (req, res) => {
  const { message, senderId, guildId } = req.body;
  try {
    const createMessage = await Message.create({
      senderId,
      message,
      guildId,
    });

    res.json({
      status: true,
      createMessage,
    });

    res.status(200).send(message);
  } catch (err) {
    res.status(400).json(Error(ERR_BADPARAMS));
    ERROR(err);
  }
});

export = app;
