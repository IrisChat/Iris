import express, { Application } from "express";
import cors from "cors";
import logger from "./logger";

export default function setConfigs(app: Application): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());

  return logger.log("Configurations have been set.");
}
