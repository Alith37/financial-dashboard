import axios from "axios";
import { fromApiBudget, toApiBudget } from "./utils/mappers.js";

export const resolveApiBaseUrl = (
  env = typeof import.meta !== "undefined" ? (import.meta.env ?? {}) : {},
  location = typeof globalThis !== "undefined"
    ? (globalThis.location ?? {})
    : {},
) => {
  if (env.VITE_API_URL) {
    return env.VITE_API_URL.replace(/\/$/, "");
  }

  const hostname = (location.hostname || "").toLowerCase();
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

  if (isLocalhost) {
    return "http://127.0.0.1:8000/api";
  }

  if (!location.protocol || !location.host) {
    return "/api";
  }

  return `${location.protocol}//${location.host}/api`;
};

const API_BASE_URL = resolveApiBaseUrl(
  typeof import.meta !== "undefined" ? (import.meta.env ?? {}) : {},
  typeof globalThis !== "undefined" ? (globalThis.location ?? {}) : {},
);
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const SESSION_EXPIRY_KEY = "financial_dashboard_session_expires_at";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getSessionTimeoutMs = () => SESSION_TIMEOUT_MS;

export const setSessionExpiry = () => {
  if (!localStorage.getItem("financial_dashboard_token")) {
    return;
  }

  const expiryTime = Date.now() + SESSION_TIMEOUT_MS;
  localStorage.setItem(SESSION_EXPIRY_KEY, String(expiryTime));
};

export const clearSessionExpiry = () => {
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};

export const isSessionExpired = () => {
  const expiryTime = Number(localStorage.getItem(SESSION_EXPIRY_KEY));
  return !expiryTime || Date.now() >= expiryTime;
};

export const refreshSessionExpiry = () => {
  if (localStorage.getItem("financial_dashboard_token")) {
    setSessionExpiry();
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("financial_dashboard_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  localStorage.setItem("financial_dashboard_token", response.data.access_token);
  localStorage.setItem("financial_dashboard_user", credentials.username);
  setSessionExpiry();
  return response.data;
};

export const register = async (credentials) => {
  const response = await api.post("/auth/register", credentials);
  localStorage.setItem("financial_dashboard_token", response.data.access_token);
  localStorage.setItem("financial_dashboard_user", credentials.username);
  setSessionExpiry();
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("financial_dashboard_token");
  localStorage.removeItem("financial_dashboard_user");
  clearSessionExpiry();
};

export const getBudget = async (userId) => {
  const response = await api.get(`/budget/${userId}`);
  return fromApiBudget(response.data);
};

export const saveBudget = async (dashboardData) => {
  const response = await api.post("/budget/save", toApiBudget(dashboardData));
  return response.data;
};

export default api;
