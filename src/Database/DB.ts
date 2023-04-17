import mongoose from "mongoose";
import process from "node:process";
mongoose.set("strictQuery", true);
import { Database, Error } from "../utils";
import config from "../config/config.json";

const DatabaseURL = process.env.DATABASE_URL || config.mongoURI;

export default function connectDB() {
  try {
    mongoose.connect(DatabaseURL).then(() => {
      Database("Connected to MongoDB.");
    });
  } catch (err) {
    throw Error(`${err}`);
  }
}
