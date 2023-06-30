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
  preferences: {
    type: String,
    required: false,
    unique: false,
    default: '{"theme":"dark","coverlay":"false"}', // TODO - Create default template
  },
  activated: {
    type: Boolean,
    default: false,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
    required: true,
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
    default: "Hey there! I'm using Iris.",
  },
  tagId: {
    type: String,
    required: false,
  },
  token: {
    type: String,
    required: false,
  },
  activation_token: {
    type: String,
    required: false,
  },
  reset_token: {
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
