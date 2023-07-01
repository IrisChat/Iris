import { model, Schema } from "mongoose";
import enviroment from "../../../enviroment";

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
    default: enviroment.preferences,
  },
  activated: {
    type: Boolean,
    default: false,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
    unique: false,
    default: enviroment.defaultAvatar,
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
    default: "Hi!",
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

export default model("Users", userSchema);
