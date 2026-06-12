import { useEffect, useRef, useState, useCallback } from "react";
import { messagesAPI } from "../services/api";
import { socketService } from "../services/socket";
import useAuthStore from "../store/useAuthStore";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const user = useAuthStore((s) => s.user);

  // Load history from server
  const loadHistory = useCallback(async () => {
    try {
      const res = await messagesAPI.getHistory();
      setMessages(res.data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup socket
  const setupSocket = useCallback(() => {
    const socket = socketService.connect();
    if (!socket) return;

    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("reconnecting");
    });

    socket.on("connect_error", () => {
      setConnectionStatus("reconnecting");
    });

    socket.on("reconnecting", () => {
      setConnectionStatus("reconnecting");
    });

    socket.on("new_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
  }, []);

  useEffect(() => {
    loadHistory();
    setupSocket();

    return () => {
      socketService.off("connect");
      socketService.off("disconnect");
      socketService.off("connect_error");
      socketService.off("reconnecting");
      socketService.off("new_message");
    };
  }, []);

  console.log("Chat Hook - Messages:", messages);

  const sendMessage = useCallback((text) => {
    socketService.emit("send_message", { text });
  }, []);

  return {
    messages,
    isLoading,
    connectionStatus,
    sendMessage,
    currentUserId: user?.id,
  };
}
