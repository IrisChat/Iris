import mongoose, { Schema, SchemaTypes } from 'mongoose';

const objectId = SchemaTypes.ObjectId;

const messageSchema = new Schema({
  senderId: {
    type: String,
  },
  message: {
    type: String,
  },
  guildId: {
    type: String,
  },
});

export default mongoose.model('Message', messageSchema);
