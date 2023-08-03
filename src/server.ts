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
// Set ServerName
const ServerName = `Iris.${process.env.NODE_ENV || "dev"}.${
  require("os").hostname() || "container"
}.${process.platform}.${process.env.PROCESSOR_ARCHITECTURE || "undefined"}#${
  process.pid
}`;

const server = app.listen(port, () => {
  Server(`Running on port ${port}\n`);
  Server(`Hello! My name is: '${ServerName}'`);
});

// Register the WebSocket as a service
const io = new socket.Server(server, {
  path: `${API_BASE}conversations/socket`,
  cors: {
    // NOTICE: Remove debug afterward
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost",
      "http://iris-frontend.fly.dev",
      "https://iris-frontend.fly.dev",
      "http://iris-app.fly.dev",
      "https://iris-app.fly.dev",
      "https://admin.socket.io",
    ],
  },
  maxHttpBufferSize: 1e8, // 100MB
});

instrument(io, {
  auth: {
    type: "basic",
    username: "orchestrator",
    password: "$2a$10$Eel5o0U7zieUkPLPDcHbru3eOGZ1hbiQkKBPAfT8BGwgWEK4GhR42",
  },
  mode: "development",
  namespaceName: "/admin",
  serverId: ServerName,
});
ws_main(io);
