import mongoose, { Schema } from 'mongoose';

const friendSchema = new Schema({
  fromUser: {
    type: String,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: String,
    ref: 'User',
    required: true,
  },
  tagId: {
    type: String,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    default: false,
  },
});

export default mongoose.model('Friend', friendSchema);
