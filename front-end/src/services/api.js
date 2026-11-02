import axios from "axios";
import { getData, removeData } from "../utils/LocalStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT access token to protected requests.
api.interceptors.request.use(
  (config) => {
    const token = getData("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
);

// Handle expired or invalid access tokens.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeData("accessToken");
      removeData("refreshToken");
      removeData("user");
      removeData("token");
    }

    return Promise.reject(error);
  },
);

export default api;
