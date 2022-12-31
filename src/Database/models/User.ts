import mongoose, { Schema } from "mongoose";
import config from "../../config/config.json";

const userSchema = new Schema({
  UID: {
    type: Number,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    required: true,
    unique: false,
    default: config.defaultAvatar,
  },
  status: {
    type: String,
    required: false,
    default: "online",
  },
  aboutme: {
    type: String,
    required: false,
    unique: false,
    default: "",
  },
  tagId: {
    type: String,
    required: false,
  },
  conversations: {
    type: Array,
    required: false,
    default: [],
  },
  role: {
    type: String,
    default: "User",
  },
});

export default mongoose.model("User", userSchema);
