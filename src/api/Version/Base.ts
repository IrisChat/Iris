import express, { Router } from "express";
import { API_BASE, API_VERSION, RS, BRANCH } from "../../config/config.json";

const app = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`${API_BASE}version/`, async (req, res) => {
  res.json({
    version: API_VERSION,
    base: API_BASE,
    RS,
    branch: BRANCH,
  });
});

export = app;
