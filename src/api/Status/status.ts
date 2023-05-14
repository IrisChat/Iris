import { Router } from "express";
import { API_BASE } from "../../config/config.json";
import statusConfig, { name, status, message } from "../../config/status.json";
import { ServerStatus } from "../../utils/Status/StatusInterface";
const app = Router();

app.get(`${API_BASE}status`, (req, res) => {
  const status: ServerStatus = {
    name,
    status: statusConfig.status,
    message,
    timestamp: new Date(),
  };

  res.json({
    status,
  });
});

export = app;
