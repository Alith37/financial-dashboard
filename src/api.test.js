import test from "node:test";
import assert from "node:assert/strict";
import { resolveApiBaseUrl } from "./api.js";

test("uses localhost backend during local development", () => {
  const apiBaseUrl = resolveApiBaseUrl(
    {},
    { hostname: "localhost", host: "localhost:5173", protocol: "http:" },
  );

  assert.equal(apiBaseUrl, "http://127.0.0.1:8000/api");
});

test("uses the current Vercel origin for deployed production builds", () => {
  const apiBaseUrl = resolveApiBaseUrl(
    {},
    {
      hostname: "financial-dashboard.vercel.app",
      host: "financial-dashboard.vercel.app",
      protocol: "https:",
    },
  );

  assert.equal(apiBaseUrl, "https://financial-dashboard.vercel.app/api");
});

test("prefers an explicitly configured API URL when one is provided", () => {
  const apiBaseUrl = resolveApiBaseUrl(
    { VITE_API_URL: "https://api.example.com/v1" },
    {
      hostname: "financial-dashboard.vercel.app",
      host: "financial-dashboard.vercel.app",
      protocol: "https:",
    },
  );

  assert.equal(apiBaseUrl, "https://api.example.com/v1");
});

test("uses the same-origin API path when no environment override is provided on Vercel", () => {
  const apiBaseUrl = resolveApiBaseUrl(
    {},
    {
      hostname: "financial-dashboard.vercel.app",
      host: "financial-dashboard.vercel.app",
      protocol: "https:",
    },
  );

  assert.equal(apiBaseUrl, "https://financial-dashboard.vercel.app/api");
});
