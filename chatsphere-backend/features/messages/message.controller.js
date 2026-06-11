import { getRecentMessages } from './message.repository.js';

/*
  fetchMessages  →  GET /messages
  --------------------------------
  Protected by authMiddleware (see message.routes.js).
  Called once when the chat screen mounts to load history.

  Flow:
    1. authMiddleware verifies JWT → req.user is populated
    2. Fetches last 100 messages from MongoDB sorted oldest first
    3. Returns them as a JSON array to the mobile app
    4. Mobile app renders them in the FlatList before the socket connects

  Why 100? Reasonable history without overloading the initial load.
  You can paginate later if needed.
*/
const fetchMessages = async (req, res) => {
  try {
    const messages = await getRecentMessages(100);
    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export { fetchMessages };
