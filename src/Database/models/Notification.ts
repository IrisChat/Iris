import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
  index: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "INFO",
  },
  body: {
    type: String,
    ref: "User",
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    default: new Date().toISOString(),
  },
});

export default mongoose.model("Notification", notificationSchema);
