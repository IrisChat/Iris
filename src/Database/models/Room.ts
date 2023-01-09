import Logger from "../../utils/Logger";
import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, default: "CONVERSATION" }, // ["conversation" || "guild"]
  participants: {
    type: Array,
    required: true,
    default: [],
  },
  messages: {
    type: Array,
    required: true,
    default: [],
  },
});

const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

roomSchema.methods.saveWithRetries = async function () {
  if (arguments.length) {
    console.warn(
      new Error("Warning: saveWithRetries doesn't support callbacks")
    );
  }
  const room = this;
  const nRetries = 5;
  let debounceTime = 100;
  try {
    return await room.save();
  } catch (err) {
    // @ts-ignore
    if (err.name !== "ParallelSaveError") {
      // @ts-ignore
      Logger.WARN(err);
    }
    for (var i = 0; i < nRetries; i++) {
      console.log("ParallelSaveError - retry in " + debounceTime);
      await sleep(debounceTime);
      try {
        return await room.save();
      } catch (err2) {
        // @ts-ignore
        if (err.name !== "ParallelSaveError") {
          // @ts-ignore
          Logger.WARN(err2);
        }
        debounceTime *= 2;
      }
    }
    // @ts-ignore
    Logger.WARN(err);
  }
};

export default mongoose.model("Room", roomSchema);
