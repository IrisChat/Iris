import mongoose from "mongoose";
import Logger from "../utils/logging";
import Config from "../../environment";

export default function connect(): Promise<void> {
  return mongoose.connect(Config.database).then(() => {
    Logger.log("Database connection has been established.");
  });
}
