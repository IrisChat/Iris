import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
  senderId: {
    type: String,
  },
  message: {
    type: String,
  },
  deletedBySender: {
    type: Boolean,
    default: false,
  },
  deletedByReceiver: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Message', messageSchema);