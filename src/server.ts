import express from "express";
import config from "./config/config.json";
import { Server } from "./utils";
// Websocket
import { ws_main } from "./socket/WebSocket";
import socket from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { API_BASE } from "./config/config.json";
/*****************************************   */
import createDatabase from "./Database/DB";
import cors from "cors";

// Routes
import Routes from "./routes";

const app = express();
const port = process.env.PORT || config.port;
app.use(cors());

app.use(Routes);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

createDatabase();

const server = app.listen(port, () => {
  Server(`Started on 127.0.0.1:${port}`);
});

// Register the WebSocket as a service
const io = new socket.Server(server, {
  path: `${API_BASE}conversations/socket`,
  cors: {
    // NOTICE: Remove debug afterward
    origin: [
      "http://127.0.0.1:5173",
      "http://iris-frontend.fly.dev",
      "https://iris-frontend.fly.dev",
      "https://admin.socket.io",
    ],
  },
  maxHttpBufferSize: 1e8, // 100MB
});

instrument(io, { auth: false });
ws_main(io);
