import express, { Application } from "express";
import enviroment from "../enviroment";
import setConfigs from "./utils/setConfigs";
import Database from "./database/Database";
import logger from "./utils/logger";

import Auth from "./routes/Auth";

export default class Server {
  private app: Application;
  private port = process.env.PORT || enviroment.PORT;

  constructor() {
    this.app = express();
  }

  setServerConfigs(): void {
    return setConfigs(this.app);
  }

  /**
   * Start the express server.
   */
  listen(): void {
    this.setServerConfigs();

    this.app.listen(this.port, () => {
      logger.log(`Iris is now listening on port ${this.port}`);
    });

    this.connectDB();
    this.route();
  }

  /**
   * Connects to the mongodb database.
   */
  connectDB(): Promise<void> {
    const db = Database;

    return db.connect();
  }

  /**
   * Every route for our api.
   */
  route(): void {
    this.app.use("/api/v0/auth", Auth);
  }
}
