import { Router } from "express";
import { hashPassword } from "../../utils/hashPassword";
import UserModel from "../../models/UserModel";
import Logger from "../../utils/logging";
import bcrypt from "bcrypt";

const app = Router();

app.post("/register", async (req, res) => {});
app.post("/login", async (req, res) => {});

export = app;
