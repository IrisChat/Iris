import express, { Application } from "express";
import cors from "cors";
import Logger from "../utils/logging";

export function setConfigurations(app: Application): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());

  return Logger.log("All server configurations have been set.");
}
