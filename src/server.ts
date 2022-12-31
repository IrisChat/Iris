import express from "express";
import config from "./config/config.json";
import Logger from "./utils/Logger";
import { wss } from "./socket/WebSocket";
import createDatabase from "./Database/DB";
import cors from "cors";

// endpoints
import register from "./api/Auth/register";
import login from "./api/Auth/login";
import create from "./api/Friend/create";
import pending from "./api/Friend/pending";
import pending from './api/Friend/pending';
import about from "./api/User/About";
import SendMessage from './api/Message/SendMessage';
import conversations from "./api/Conversations/Base";
import conversations__ID from "./api/Conversations/UID";
import conversations__Time from "./api/Conversations/UNIX";
import avatar from "./api/User/Avatar";
import status from "./api/User/Status";
import UID from "./api/User/UID";

const app = express();
const port = process.env.PORT || config.port;
app.use(cors());

app.use(register);
app.use(login);
app.use(create);
app.use(outgoing);
app.use(pending);
app.use(about);
app.use(avatar);
app.use(conversations);
app.use(conversations__ID);
app.use(conversations__Time);
app.use(status);
app.use(UID);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

createDatabase();

const server = app.listen(port, () => {
  Logger.INFO(`Iris:Server running on port [${port}]`);
});

// Register the WebSocket as a service
// @ts-ignore
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (websocket: any) => {
    wss.emit("connection", websocket, request);
  });
});
