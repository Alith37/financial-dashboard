import test from "node:test";
import assert from "node:assert/strict";
import { calculateInvestmentProjection } from "./investment.js";
import { calculateBudgetSummary } from "./financial.js";

test("investment projection includes compound growth and contributions", () => {
  const result = calculateInvestmentProjection({
    initialDeposit: 1000,
    monthlyContribution: 200,
    timeHorizonYears: 1,
    expectedReturnRate: 12,
  });

  assert.equal(result.totalContributions, 3400);
  assert.ok(result.projectedValue > result.totalContributions);
  assert.equal(
    Math.round(result.estimatedGrowth * 100) / 100,
    Math.round((result.projectedValue - result.totalContributions) * 100) / 100,
  );
});

test("budget summary explains remaining cash flow versus the 50/30/20 target", () => {
  const summary = calculateBudgetSummary(50000, [
    { id: 1, title: "Housing", amount: 15000, category: "Needs" },
    { id: 2, title: "Utilities", amount: 3200, category: "Needs" },
    { id: 3, title: "Groceries", amount: 2200, category: "Needs" },
    { id: 4, title: "Travel", amount: 800, category: "Wants" },
    { id: 5, title: "Subscriptions", amount: 900, category: "Wants" },
    { id: 6, title: "Insurance", amount: 2350, category: "Savings" },
  ]);

  assert.equal(summary.totalExpenses, 24450);
  assert.equal(summary.targetSavings, 10000);
  assert.equal(summary.remainingCashflow, 25550);
  assert.equal(summary.cashFlowPercentOfIncome, 51.1);
  assert.ok(summary.savingsTargetStatus.includes("above"));
  assert.equal(summary.savingsTargetGap, 15550);
});
