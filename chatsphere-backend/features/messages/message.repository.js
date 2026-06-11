import Message from '../../models/Message.js';

/*
  Message Repository
  ------------------
  All direct MongoDB operations for the Message collection.

  saveMessage
    Called by the socket handler every time a user sends a message.
    Persists the message so it survives server restarts and is
    available to new users who join later.

  getRecentMessages
    Called by GET /messages when the chat screen opens.
    Returns the last `limit` messages sorted oldest-first so the
    FlatList renders them in chronological order top to bottom.
*/

const saveMessage = async ({ senderId, senderName, text }) => {
  const message = new Message({ senderId, senderName, text });
  return await message.save();
};

const getRecentMessages = async (limit = 100) => {
  return await Message.find()
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
};

export { saveMessage, getRecentMessages };
