// src/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {"Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("auth.user");
      const resolvedToken = raw ? (JSON.parse(raw)?.token || null) : null;

      if (resolvedToken) {
        console.debug("[api] resolved token from auth.user (preview):", resolvedToken.slice(0, 40));
      } else {
        console.debug("[api] no auth.user token found in localStorage");
      }

      const existingHeader = config.headers?.Authorization ?? api.defaults.headers.common["Authorization"];
      if (existingHeader) {
        console.debug("[api] existing config Authorization preview:", (existingHeader + "").slice(0, 40));
      }

      if (resolvedToken) {
        config.headers.Authorization = `Bearer ${resolvedToken}`;
      } else {
        delete config.headers.Authorization;
      }

      console.debug("[api] outgoing Authorization header preview:", (config.headers.Authorization || "").slice(0, 40));
    } catch (e) {
      console.warn("[api] token parse error", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export default api;
