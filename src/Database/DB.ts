import mongoose from 'mongoose';
import process from 'node:process';
mongoose.set('strictQuery', true);
import Logger, { ERROR } from '../utils/Logger';
import config from '../config/config.json';

const Database = process.env.DATABASE_URL || config.mongoURI

export default function connectDB() {
  try {
    mongoose.connect(Database).then(() => {
      Logger.INFO('Connected to MongoDB.');
    });
  } catch (err) {
    throw ERROR(err);
  }
}
