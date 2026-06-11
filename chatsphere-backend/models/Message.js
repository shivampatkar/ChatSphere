import mongoose from 'mongoose';

/*
  Message schema
  --------------
  Fields:
    senderId   - ObjectId reference to the User who sent the message
    senderName - stored directly (denormalized) so the chat screen never
                 needs a separate DB join just to show who sent it
    text       - the actual message content
    timestamps - createdAt is used for sorting and displaying time on bubbles
*/
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
