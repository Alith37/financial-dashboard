import React, { useState, useEffect, useRef } from "react";
import {
  getBudget,
  saveBudget,
  login,
  register,
  logout,
  getSessionTimeoutMs,
  isSessionExpired,
  refreshSessionExpiry,
} from "./api.js";
import BudgetPlanner from "./components/BudgetPlanner.jsx";
import SavingsTracker from "./components/SavingsTracker.jsx";
import InvestmentSimulator from "./components/InvestmentSimulator.jsx";
import {
  DEFAULT_MONTHLY_INCOME,
  DEFAULT_EXPENSES,
  DEFAULT_GOALS,
  DEFAULT_INVESTMENT,
} from "./constants/defaults.js";
import { getAuthErrorMessage } from "./authErrors.js";
import { calculateBudgetSummary } from "./utils/financial.js";

export default function App() {
  const [userId, setUserId] = useState(() => {
    const currentUser = localStorage.getItem("financial_dashboard_user");
    const tokenExists = Boolean(
      localStorage.getItem("financial_dashboard_token"),
    );

    if (tokenExists && isSessionExpired()) {
      logout();
      return null;
    }

    return currentUser;
  });
  const [authMode, setAuthMode] = useState("login");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState(DEFAULT_MONTHLY_INCOME);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [investment, setInvestment] = useState(DEFAULT_INVESTMENT);
  const [isSaving, setIsSaving] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [sessionCountdown, setSessionCountdown] = useState(0);
  const hasLoadedData = useRef(false);
  const inactivityTimeoutRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      hasLoadedData.current = false;
      setSessionCountdown(0);
      return undefined;
    }

    const updateSessionCountdown = () => {
      const expiryTime = Number(
        localStorage.getItem("financial_dashboard_session_expires_at"),
      );

      if (!expiryTime) {
        setSessionCountdown(0);
        return;
      }

      const remainingMs = Math.max(0, expiryTime - Date.now());
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      setSessionCountdown(remainingSeconds);

      if (remainingMs <= 0) {
        logout();
        setUserId(null);
        setCredentials({ username: "", password: "" });
        setAuthError(
          "Your session expired due to inactivity. Please sign in again.",
        );
      }
    };

    const clearAndSetSessionTimeout = () => {
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }

      refreshSessionExpiry();
      updateSessionCountdown();
      inactivityTimeoutRef.current = window.setTimeout(() => {
        logout();
        setUserId(null);
        setCredentials({ username: "", password: "" });
        setAuthError(
          "Your session expired due to inactivity. Please sign in again.",
        );
      }, getSessionTimeoutMs());
    };

    clearAndSetSessionTimeout();
    const countdownIntervalId = window.setInterval(
      updateSessionCountdown,
      1000,
    );

    const handleActivity = () => {
      clearAndSetSessionTimeout();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });

    return () => {
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }
      window.clearInterval(countdownIntervalId);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      hasLoadedData.current = false;
      return undefined;
    }

    hasLoadedData.current = false;
    async function loadData() {
      try {
        const data = await getBudget(userId);
        if (data) {
          setMonthlyIncome(data.monthlyIncome ?? DEFAULT_MONTHLY_INCOME);
          setExpenses(data.expenses?.length ? data.expenses : DEFAULT_EXPENSES);
          setGoals(data.goals?.length ? data.goals : DEFAULT_GOALS);
          setInvestment(data.investment ?? DEFAULT_INVESTMENT);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        if (err.response?.status === 401) {
          logout();
          setUserId(null);
        } else {
          setSaveStatus("Failed to load dashboard data.");
        }
      } finally {
        hasLoadedData.current = true;
        setLoadedUserId(userId);
      }
    }
    loadData();
  }, [userId]);

  useEffect(() => {
    if (!userId || !hasLoadedData.current) return undefined;

    const timeoutId = setTimeout(async () => {
      try {
        await saveBudget({
          userId,
          monthlyIncome,
          expenses,
          goals,
          investment,
        });
        setSaveStatus("Saved automatically.");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        console.error("Autosave failed:", err);
        setSaveStatus("Failed to save changes.");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [monthlyIncome, expenses, goals, investment, userId]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthError("");
    try {
      const authenticate = authMode === "login" ? login : register;
      await authenticate(credentials);
      setUserId(credentials.username);
      setCredentials({ username: "", password: "" });
    } catch (err) {
      setAuthError(getAuthErrorMessage(err, "Authentication failed."));
    }
  };

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6">
        <form
          onSubmit={handleAuth}
          className="w-full max-w-sm bg-slate-800 p-5 sm:p-8 rounded-2xl border border-slate-700 space-y-5 shadow-xl"
        >
          <h1 className="text-2xl font-bold text-white">
            PetroTech Financial Dashboard
          </h1>
          <p className="text-slate-400">
            {authMode === "login"
              ? "Sign in to your dashboard"
              : "Create your dashboard account"}
          </p>
          <input
            required
            minLength={3}
            pattern="[A-Za-z0-9_]+"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
          />
          <input
            required
            minLength={8}
            type="password"
            placeholder="Password (8+ characters)"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
          />
          {authError && <p className="text-sm text-rose-400">{authError}</p>}
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded">
            {authMode === "login" ? "Sign In" : "Register"}
          </button>
          {authMode === "login" && (
            <button
              type="button"
              onClick={() =>
                setAuthError(
                  "Password recovery is not configured. Please contact the administrator.",
                )
              }
              className="w-full text-sm text-sky-300 hover:text-sky-200"
            >
              Forgot password?
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setAuthMode(authMode === "login" ? "register" : "login")
            }
            className="w-full text-sm text-blue-400 hover:text-blue-300"
          >
            {authMode === "login"
              ? "Create an account"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </main>
    );
  }

  if (loadedUserId !== userId) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6">
        <p className="text-lg text-slate-300">
          Loading your financial dashboard...
        </p>
      </main>
    );
  }

  const handleSaveDashboard = async () => {
    setIsSaving(true);
    setSaveStatus("");
    try {
      await saveBudget({
        userId,
        monthlyIncome,
        expenses,
        goals,
        investment,
      });
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const dashboardSummary = calculateBudgetSummary(monthlyIncome, expenses);
  const sessionMinutes = Math.floor(sessionCountdown / 60);
  const sessionSeconds = sessionCountdown % 60;
  const isSessionWarning = sessionCountdown > 0 && sessionCountdown <= 60;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {isSessionWarning && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 shadow-lg shadow-amber-900/20">
            Warning: your session will expire in {sessionMinutes}:
            {String(sessionSeconds).padStart(2, "0")}. Please continue
            interacting or sign out now.
          </div>
        )}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              PetroTech Financial Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {saveStatus && (
              <span
                className={`text-sm ${saveStatus.includes("Failed") ? "text-red-400" : "text-emerald-400"}`}
              >
                {saveStatus}
              </span>
            )}
            {sessionCountdown > 0 && (
              <span
                className={`text-sm font-medium ${isSessionWarning ? "text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-full" : "text-slate-300"}`}
              >
                Session expires in {sessionMinutes}:
                {String(sessionSeconds).padStart(2, "0")}
              </span>
            )}
            <button
              onClick={() => {
                logout();
                setUserId(null);
                setCredentials({ username: "", password: "" });
              }}
              className="text-sm text-sky-300 hover:text-sky-200"
            >
              Sign out
            </button>
            <button
              onClick={handleSaveDashboard}
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Entire Dashboard"}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Income
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              ${Number(monthlyIncome || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Expenses
            </p>
            <p className="mt-2 text-2xl font-bold text-rose-400">
              ${dashboardSummary.totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Free Cash
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              ${dashboardSummary.remainingCashflow.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Savings Goal
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-400">
              ${dashboardSummary.targetSavings.toLocaleString()}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BudgetPlanner
            monthlyIncome={monthlyIncome}
            setMonthlyIncome={setMonthlyIncome}
            expenses={expenses}
            setExpenses={setExpenses}
          />

          <SavingsTracker goals={goals} setGoals={setGoals} />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-2 shadow-xl">
          <InvestmentSimulator
            investment={investment}
            setInvestment={setInvestment}
          />
        </div>
      </div>
    </div>
  );
}
