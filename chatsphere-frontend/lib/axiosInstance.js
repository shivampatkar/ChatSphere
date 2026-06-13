import axios from "axios";

export const BASE_URL = "https://chatsphere-16nw.onrender.com";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const { token } = require("../store/useAuthStore").default.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
