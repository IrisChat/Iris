import Login from "./api/Auth/login";
import Register from "./api/Auth/register";
import CBase from "./api/Conversations/Base";
import CID from "./api/Conversations/UID";
import CNIX from "./api/Conversations/UNIX";
import CFND from "./api/Friend/create";
import OFND from "./api/Friend/outgoing";
import PFND from "./api/Friend/pending";
import UABT from "./api/User/About";
import UAVT from "./api/User/Avatar";
import PREF from "./api/User/Preferences";
import USTS from "./api/User/Status";
import URID from "./api/User/UID";
// The "global" (utility) routes
import UG_FND from "./api/User/Global/Find";
import UG_FPD from "./api/User/Global/ForgotPassword";
import UG_NTF from "./api/User/Global/Notifications";
// Miscellaneous
import VERSION from "./api/Version/Base";
import { WS } from "./socket/WebSocket";
import { Server, Error, print } from "./utils";

import express from "express";

const app = express.Router();

app.use([
  Login,
  Register,
  CBase,
  CID,
  CNIX,
  CFND,
  OFND,
  PFND,
  UABT,
  UAVT,
  PREF,
  USTS,
  URID,
  UG_FND,
  UG_FPD,
  UG_NTF,
  VERSION,
  WS,
]);

// Log Endpoints
app.stack.forEach(print.bind(null, []));

export = app;
