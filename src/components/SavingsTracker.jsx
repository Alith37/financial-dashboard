import React, { useState } from "react";
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { DEFAULT_GOALS } from "../constants/defaults.js";

export default function SavingsTracker({
  goals: externalGoals,
  setGoals: externalSetGoals,
}) {
  const [internalGoals, setInternalGoals] = useState(DEFAULT_GOALS);
  const goals = externalGoals ?? internalGoals;
  const setGoals = externalSetGoals ?? setInternalGoals;

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    setGoals([
      ...goals,
      {
        id: Date.now(),
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        monthlyContribution: parseFloat(monthlyContribution) || 0,
      },
    ]);
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setMonthlyContribution("");
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const handleQuickAdd = (id, amount) => {
    setGoals(
      goals.map((g) => {
        if (g.id === id) {
          const updated = g.currentAmount + amount;
          return {
            ...g,
            currentAmount:
              updated > g.targetAmount ? g.targetAmount : updated,
          };
        }
        return g;
      }),
    );
  };

  const calculateMonthsRemaining = (target, current, monthly) => {
    if (current >= target) return 0;
    if (!monthly || monthly <= 0) return Infinity;
    return Math.ceil((target - current) / monthly);
  };

  const formatCompletionDate = (months) => {
    if (months === 0) return "Goal Completed!";
    if (months === Infinity) return "No monthly deposit set";
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-8">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <Target className="text-purple-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">
            Savings Goals Tracker
          </h2>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
          {goals.length} Active Goals
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progressPercent = Math.min(
            Math.round((goal.currentAmount / goal.targetAmount) * 100),
            100,
          );
          const monthsLeft = calculateMonthsRemaining(
            goal.targetAmount,
            goal.currentAmount,
            goal.monthlyContribution,
          );
          const completionDate = formatCompletionDate(monthsLeft);

          return (
            <div
              key={goal.id}
              className="bg-slate-900 p-5 rounded-lg border border-slate-700 flex flex-col justify-between space-y-4 relative group"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    {progressPercent === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                    )}
                    {goal.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-baseline mt-4 mb-1">
                  <span className="text-2xl font-extrabold text-white">
                    ${goal.currentAmount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    of ${goal.targetAmount.toLocaleString()} ({progressPercent}
                    %)
                  </span>
                </div>

                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progressPercent === 100
                        ? "bg-emerald-400"
                        : "bg-purple-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Monthly Contribution:</span>
                  <span className="text-slate-200 font-semibold">
                    ${goal.monthlyContribution}/mo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
                    Estimated Finish:
                  </span>
                  <span className="text-purple-300 font-bold">
                    {completionDate}
                  </span>
                </div>
              </div>

              {progressPercent < 100 && (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleQuickAdd(goal.id, 50)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 rounded border border-slate-700 transition"
                  >
                    +$50
                  </button>
                  <button
                    onClick={() => handleQuickAdd(goal.id, 100)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 rounded border border-slate-700 transition"
                  >
                    +$100
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleAddGoal}
        className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/60 space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-200">
          Set a New Financial Goal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Goal Name (e.g. Vacation)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <input
            type="number"
            placeholder="Target Amount ($)"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <input
            type="number"
            placeholder="Current Saved ($)"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <input
            type="number"
            placeholder="Monthly Deposit ($)"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-6 rounded transition flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </form>
    </div>
  );
}
