export function getAuthErrorMessage(
  error,
  fallbackText = "Authentication failed.",
) {
  if (!error) return fallbackText;

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Backend unavailable. Start the API or set VITE_API_URL to your deployed backend.";
  }

  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }

  if (typeof detail === "string") {
    const normalized = detail.toLowerCase();
    if (normalized.includes("invalid username or password")) {
      return "Invalid username or password. Create an account first or check your credentials.";
    }

    return detail;
  }

  return fallbackText;
}
