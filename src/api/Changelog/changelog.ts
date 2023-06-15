import express, { Router } from "express";
import changelog from "../../config/changelog.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/iris/changelog", (req, res) => {
  res.json(changelog).status(200);
});

export = app;
