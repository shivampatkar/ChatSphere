import { io } from "socket.io-client";
import { BASE_URL } from "../lib/axiosInstance";
import useAuthStore from "../store/useAuthStore";

let socketInstance = null;

export const socketService = {
  connect() {
    const { token } = useAuthStore.getState();

    if (!token) return null;
    if (socketInstance?.connected) return socketInstance;

    socketInstance = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    return socketInstance;
  },

  getSocket() {
    return socketInstance;
  },

  disconnect() {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  },

  emit(event, data) {
    socketInstance?.emit(event, data);
  },

  on(event, callback) {
    socketInstance?.on(event, callback);
  },

  off(event, callback) {
    socketInstance?.off(event, callback);
  },
};
