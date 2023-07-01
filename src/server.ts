import express, { Application } from "express";
import { setConfigurations } from "./utils/serverConfigurations";
import environment from "../environment";
import Database from "./db/Database";
import Logger from "./utils/logging";

import Auth from "./routes/API/Auth";

export default class Server {
  private app: Application;
  private port = process.env.PORT || environment.PORT;

  constructor() {
    this.app = express();
  }

  /**
   * Set the Server configurations.
   */
  setConfigurations(): void {
    return setConfigurations(this.app);
  }

  /**
   * Starts the express Server.
   */
  start(): void {
    this.setConfigurations();

    this.app.listen(this.port, () => {
      Logger.log(`Iris has started on port - ${this.port}`);
    });

    this.dbConnect();
    this.route();
  }

  /**
   * Connects to our database.
   */
  dbConnect(): Promise<void> {
    const db = Database;

    return db();
  }

  /**
   * Every Route we will be needing.
   */
  route(): void {
    this.app.use("/api/v0/auth", Auth);
  }
}
