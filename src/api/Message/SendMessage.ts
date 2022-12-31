// Guilds - SendMessage

import express, { Router } from 'express';
import Message from '../../Database/models/Message';
import Guild from '../../Database/models/Guild';
import Logger, { ERROR } from '../../utils/Logger';
import Friend from '../../Database/models/Friend';
import User from '../../Database/models/User';

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/api/v0/guild/message', async (req, res) => {
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
    ERROR(err);
  }
});

export = app;
