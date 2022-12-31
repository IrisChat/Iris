import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema({
  id: { type: Number, required: true },
  participants: {
    type: Array,
    required: true,
    default: [1672455460, 1672455513],
  },
  messages: {
    type: Array,
    required: true,
    default: [],
  },
});

export default mongoose.model("Room", roomSchema);
