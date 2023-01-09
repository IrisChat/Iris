import express from "express";
import config from "./config/config.json";
import Logger from "./utils/Logger";
// Websocket
import { ws_main } from "./socket/WebSocket";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { API_BASE } from "./config/config.json";
/*****************************************   */
import createDatabase from "./Database/DB";
import cors from "cors";

const app = express();
const port = process.env.PORT || config.port;
app.use(cors());

import Login from "./api/Auth/login";
import Register from "./api/Auth/register";
import CBase from "./api/Conversations/Base";
import CID from "./api/Conversations/UID";
import CNIX from "./api/Conversations/UNIX";
import CFND from "./api/Friend/create";
import OFND from "./api/Friend/outgoing";
import PFND from "./api/Friend/pending";
import GDEL from "./api/Guild/Delete";
import GEDT from "./api/Guild/Edit";
import GMSG from "./api/Guild/Message";
import UABT from "./api/User/About";
import UAVT from "./api/User/Avatar";
import PREF from "./api/User/Preferences";
import USTS from "./api/User/Status";
import URID from "./api/User/UID";
import UFND from "./api/User/Find";
import VERSION from "./api/Version/Base";

app.use([
  Login,
  Register,
  CBase,
  CID,
  CNIX,
  CFND,
  OFND,
  PFND,
  GDEL,
  GEDT,
  GMSG,
  UABT,
  UAVT,
  PREF,
  USTS,
  URID,
  UFND,
  VERSION,
]);

app.use(Login);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

createDatabase();

const server = app.listen(port, () => {
  Logger.INFO(`Iris:Server running on port [${port}]`);
});

// Register the WebSocket as a service
// @ts-ignore
const io = new Server(server, {
  path: `${API_BASE}conversations/socket`,
  cors: {
  // NOTICE: Remove debug afterward
    origin: ["http://127.0.0.1:5173", "http://iris-frontend.fly.dev", "https://admin.socket.io"],
  },
});

instrument(io, {auth: false});
ws_main(io);
