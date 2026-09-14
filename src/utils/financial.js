export function calculateBudgetSummary(monthlyIncome, expenses = []) {
  const normalizedExpenses = expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount || 0),
  }));

  const totalExpenses = normalizedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const remainingCashflow = monthlyIncome - totalExpenses;
  const targetNeeds = monthlyIncome * 0.5;
  const targetWants = monthlyIncome * 0.3;
  const targetSavings = monthlyIncome * 0.2;

  const savingsTargetGap = remainingCashflow - targetSavings;
  const savingsTargetStatus =
    remainingCashflow >= targetSavings
      ? `You are $${Math.abs(savingsTargetGap).toLocaleString()} above the 20% savings target.`
      : `You are $${Math.abs(savingsTargetGap).toLocaleString()} below the 20% savings target.`;

  const cashFlowPercentOfIncome =
    monthlyIncome > 0
      ? Number(((remainingCashflow / monthlyIncome) * 100).toFixed(1))
      : 0;

  return {
    totalExpenses,
    remainingCashflow,
    targetNeeds,
    targetWants,
    targetSavings,
    cashFlowPercentOfIncome,
    savingsTargetStatus,
    savingsTargetGap,
    needsTotal: normalizedExpenses
      .filter((item) => item.category === "Needs")
      .reduce((sum, item) => sum + item.amount, 0),
    wantsTotal: normalizedExpenses
      .filter((item) => item.category === "Wants")
      .reduce((sum, item) => sum + item.amount, 0),
    savingsTotal: normalizedExpenses
      .filter((item) => item.category === "Savings")
      .reduce((sum, item) => sum + item.amount, 0),
  };
}

export function calculateFinancialHealth(summary) {
  const income = Number(summary.targetSavings || 0) / 0.2;
  if (income <= 0) {
    return { score: 0, label: "Add income to calculate", color: "slate" };
  }

  const cashFlowScore = Math.max(
    0,
    Math.min(40, (summary.remainingCashflow / income) * 40),
  );
  const needsScore = Math.max(
    0,
    Math.min(25, (summary.targetNeeds / Math.max(summary.needsTotal, 1)) * 25),
  );
  const savingsScore = Math.max(
    0,
    Math.min(
      35,
      (summary.savingsTotal / Math.max(summary.targetSavings, 1)) * 35,
    ),
  );
  const score = Math.round(cashFlowScore + needsScore + savingsScore);

  if (score >= 80) {
    return { score, label: "Strong foundation", color: "emerald" };
  }
  if (score >= 60) {
    return { score, label: "Good momentum", color: "amber" };
  }
  return { score, label: "Room to improve", color: "rose" };
}
