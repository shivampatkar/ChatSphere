import { getRecentMessages } from "./message.repository.js";

const fetchMessages = async (req, res) => {
  try {
    const messages = await getRecentMessages(100);
    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export { fetchMessages };
