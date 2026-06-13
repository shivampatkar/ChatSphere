import { useEffect, useRef, useState, useCallback } from "react";
import { messagesAPI } from "../services/api";
import { socketService } from "../services/socket";
import useAuthStore from "../store/useAuthStore";
import { useToast } from "../components/Toast";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const user = useAuthStore((s) => s.user);
  const { show } = useToast();
  const connectionStatusRef = useRef(connectionStatus);

  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

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

    socket.on("message_error", (payload) => {
      show({
        type: "error",
        title: "Message not sent",
        message: payload?.message || "Please try again",
      });
    });
  }, [show]);

  useEffect(() => {
    loadHistory();
    setupSocket();

    return () => {
      socketService.off("connect");
      socketService.off("disconnect");
      socketService.off("connect_error");
      socketService.off("reconnecting");
      socketService.off("new_message");
      socketService.off("message_error");
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (connectionStatusRef.current !== "connected") {
        show({
          type: "error",
          title: "Message not sent",
          message: "You're offline. Reconnecting…",
        });
        return;
      }
      socketService.emit("send_message", { text });
    },
    [show],
  );

  return {
    messages,
    isLoading,
    connectionStatus,
    sendMessage,
    currentUserId: user?.id,
  };
}
