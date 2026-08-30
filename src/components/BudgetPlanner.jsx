import React, { useState } from "react";
import { PieChart, Plus, Trash2, TrendingUp } from "lucide-react";
import {
  DEFAULT_MONTHLY_INCOME,
  DEFAULT_EXPENSES,
} from "../constants/defaults.js";
import { calculateBudgetSummary } from "../utils/financial.js";

export default function BudgetPlanner({
  monthlyIncome: externalIncome,
  setMonthlyIncome: externalSetIncome,
  expenses: externalExpenses,
  setExpenses: externalSetExpenses,
}) {
  const [internalIncome, setInternalIncome] = useState(DEFAULT_MONTHLY_INCOME);
  const [internalExpenses, setInternalExpenses] = useState(DEFAULT_EXPENSES);

  const monthlyIncome = externalIncome ?? internalIncome;
  const setMonthlyIncome = externalSetIncome ?? setInternalIncome;
  const expenses = externalExpenses ?? internalExpenses;
  const setExpenses = externalSetExpenses ?? setInternalExpenses;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Needs");

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    setExpenses([
      ...expenses,
      { id: Date.now(), title, amount: parseFloat(amount), category },
    ]);
    setTitle("");
    setAmount("");
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((item) => item.id !== id));
  };

  const summary = calculateBudgetSummary(monthlyIncome, expenses);
  const totalExpenses = summary.totalExpenses;
  const remainingCashflow = summary.remainingCashflow;
  const needsTotal = summary.needsTotal;
  const wantsTotal = summary.wantsTotal;
  const savingsTotal = summary.savingsTotal;
  const targetNeeds = summary.targetNeeds;
  const targetWants = summary.targetWants;
  const targetSavings = summary.targetSavings;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-8">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <PieChart className="text-blue-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">
            Interactive Budget Planner
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-300">
            Monthly Net Income:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">$</span>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-white font-bold w-32 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Total Expenses</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">
            ${totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Remaining Cash Flow</p>
          <p
            className={`text-2xl font-bold mt-1 ${remainingCashflow >= 0 ? "text-emerald-400" : "text-red-500"}`}
          >
            ${remainingCashflow.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Budget Usage</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {monthlyIncome > 0
              ? Math.round((totalExpenses / monthlyIncome) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
              Financial health
            </p>
            <p className="mt-1 text-sm text-slate-200">
              {summary.savingsTargetStatus} This means your remaining cash flow
              is
              <span className="font-semibold text-white">
                {` ${summary.cashFlowPercentOfIncome}%`}
              </span>
              of income after expenses.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-slate-900/50 p-5 rounded-lg border border-slate-700/60">
        <h3 className="text-md font-bold text-slate-200">
          50 / 30 / 20 Rule Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">
                Needs (Target 50%)
              </span>
              <span className="text-slate-400">
                ${needsTotal} / ${targetNeeds}
              </span>
            </div>
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${needsTotal > targetNeeds ? "bg-rose-500" : "bg-blue-500"}`}
                style={{
                  width: `${Math.min((needsTotal / (targetNeeds || 1)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">
                Wants (Target 30%)
              </span>
              <span className="text-slate-400">
                ${wantsTotal} / ${targetWants}
              </span>
            </div>
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${wantsTotal > targetWants ? "bg-rose-500" : "bg-amber-500"}`}
                style={{
                  width: `${Math.min((wantsTotal / (targetWants || 1)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">
                Savings (Target 20%)
              </span>
              <span className="text-slate-400">
                ${savingsTotal} / ${targetSavings}
              </span>
            </div>
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${savingsTotal >= targetSavings ? "bg-emerald-400" : "bg-purple-500"}`}
                style={{
                  width: `${Math.min((savingsTotal / (targetSavings || 1)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <form
          onSubmit={handleAddExpense}
          className="space-y-4 bg-slate-900 p-4 rounded-lg border border-slate-700"
        >
          <h4 className="text-sm font-bold text-white mb-2">
            Add New Line Item
          </h4>
          <div>
            <input
              type="text"
              placeholder="Expense Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Needs">Needs (Essential)</option>
              <option value="Wants">Wants (Discretionary)</option>
              <option value="Savings">Savings / Investments</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </form>

        <div className="md:col-span-2 bg-slate-900 p-4 rounded-lg border border-slate-700 overflow-hidden">
          <h4 className="text-sm font-bold text-white mb-4">
            Expense Breakdown
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-800 p-3 rounded-md border border-slate-700/70"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {item.title}
                  </p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      item.category === "Needs"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : item.category === "Wants"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-200">
                    ${item.amount}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
