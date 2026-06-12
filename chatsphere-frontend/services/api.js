import axiosInstance from "../lib/axiosInstance";

export const authAPI = {
  register: (data) => axiosInstance.post("/auth/register", data),
  login: (data) => axiosInstance.post("/auth/login", data),
};

export const messagesAPI = {
  getHistory: () => axiosInstance.get("/messages"),
};
