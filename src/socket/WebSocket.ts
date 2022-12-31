import { WebSocketServer } from "ws";
import Logger from "../utils/Logger";

const wss = new WebSocketServer({
  noServer: true,
});

wss.on("connection", (WebsocketConnection) => {
  Logger.INFO("Client Connected.");

  WebsocketConnection.on("message", (msg) => {
    // @ts-ignore
    let data;
    try {
      // @ts-ignore
      data = JSON.parse(msg);
    } catch (error) {
      WebsocketConnection.send(
        JSON.stringify({
          // @ts-ignore
          type: 0,
          status: -1,
        })
      );
      Logger.WARN("[WEBSOCKET] Spec Violation: Unsupported Format!");
    }
    
    console.log(data);
  });
});

export { wss };
