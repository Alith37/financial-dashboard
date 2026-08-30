const calculateMonthsRemaining = (target, current, monthly) => {
  if (current >= target) return 0;
  if (!monthly || monthly <= 0) return Infinity;
  return Math.ceil((target - current) / monthly);
};

const computeTargetDate = (target, current, monthly) => {
  const months = calculateMonthsRemaining(target, current, monthly);
  if (months === Infinity) return "";
  const date = new Date();
  if (months > 0) date.setMonth(date.getMonth() + months);
  return date.toISOString().split("T")[0];
};

export function fromApiExpense(expense) {
  return {
    id: expense.id,
    title: expense.name,
    amount: expense.amount,
    category: expense.category,
  };
}

export function toApiExpense(expense) {
  return {
    id: String(expense.id),
    name: expense.title,
    amount: expense.amount,
    category: expense.category,
  };
}

export function fromApiGoal(goal) {
  return {
    id: goal.id,
    name: goal.title,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    monthlyContribution: goal.monthly_contribution,
  };
}

export function toApiGoal(goal) {
  return {
    id: String(goal.id),
    title: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    monthly_contribution: goal.monthlyContribution,
    target_date: computeTargetDate(
      goal.targetAmount,
      goal.currentAmount,
      goal.monthlyContribution,
    ),
  };
}

export function fromApiInvestment(investment) {
  return {
    initialDeposit: investment.initial_deposit,
    monthlyContribution: investment.monthly_contribution,
    timeHorizonYears: investment.time_horizon_years,
    expectedReturnRate: investment.expected_return_rate,
  };
}

export function toApiInvestment(investment) {
  return {
    initial_deposit: investment.initialDeposit,
    monthly_contribution: investment.monthlyContribution,
    time_horizon_years: investment.timeHorizonYears,
    expected_return_rate: investment.expectedReturnRate,
  };
}

export function fromApiBudget(data) {
  return {
    userId: data.user_id,
    monthlyIncome: data.monthly_income,
    expenses: (data.expenses ?? []).map(fromApiExpense),
    goals: (data.goals ?? []).map(fromApiGoal),
    investment: fromApiInvestment(data.investment ?? {}),
  };
}

export function toApiBudget({ userId, monthlyIncome, expenses, goals, investment }) {
  return {
    user_id: userId,
    monthly_income: parseFloat(monthlyIncome) || 0,
    expenses: expenses.map(toApiExpense),
    goals: goals.map(toApiGoal),
    investment: toApiInvestment(investment),
  };
}
