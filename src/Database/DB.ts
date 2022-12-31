import mongoose from 'mongoose';
mongoose.set('strictQuery', true);
import Logger, { ERROR } from '../utils/Logger';
import config from '../config/config.json';

export default function connectDB() {
  try {
    mongoose.connect(config.mongoURI).then(() => {
      Logger.INFO('Connected to MongoDB.');
    });
  } catch (err) {
    throw ERROR(err);
  }
}
