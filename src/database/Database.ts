import { connect } from "mongoose";
import enviroment from "../../enviroment";
import logger from "../utils/logger";

export default class Database {
  static connect(): Promise<void> {
    return connect(enviroment.database)
      .then(() => {
        return logger.log("Connected to MongoDB");
      })
      .catch((err) => {
        return logger.error(err as string);
      });
  }
}
