import Message from "../../models/Message.js";

const saveMessage = async ({ senderId, senderName, text }) => {
  const message = new Message({ senderId, senderName, text });
  return await message.save();
};

const getRecentMessages = async (limit = 100) => {
  return await Message.find().sort({ createdAt: 1 }).limit(limit).lean();
};

export { saveMessage, getRecentMessages };
