// Guilds - DeleteMessage

import express, { Router } from "express";
import Message from "../../Database/models/GuildMessage";
import { ERROR } from "../../utils/Logger";
import { ERR_BADPARAMS } from "../Errors/Errors";
import { API_BASE } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.delete(`${API_BASE}guild/delete/:messageId`, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ status: false, error: "This message does not exist!" });
    }

    message.deletedBySender = true;
    message.deletedByReceiver = true;

    await message.save();
    return res.status(200).json({ status: true, deletedMessage: message });
  } catch (err) {
    res.status(400).json(Error(ERR_BADPARAMS));
    ERROR(err);
  }
});

export = app;
