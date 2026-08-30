export const DEFAULT_MONTHLY_INCOME = 3500;

export const DEFAULT_EXPENSES = [
  { id: 1, title: "Rent & Utilities", amount: 1200, category: "Needs" },
  { id: 2, title: "Groceries", amount: 450, category: "Needs" },
  { id: 3, title: "Dining & Entertainment", amount: 300, category: "Wants" },
  { id: 4, title: "Emergency Savings", amount: 500, category: "Savings" },
];

export const DEFAULT_GOALS = [
  {
    id: 1,
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 4500,
    monthlyContribution: 500,
  },
  {
    id: 2,
    name: "House Down Payment",
    targetAmount: 25000,
    currentAmount: 8000,
    monthlyContribution: 600,
  },
  {
    id: 3,
    name: "Tech / Equipment Upgrade",
    targetAmount: 2500,
    currentAmount: 1800,
    monthlyContribution: 200,
  },
];

export const DEFAULT_INVESTMENT = {
  initialDeposit: 1000,
  monthlyContribution: 200,
  timeHorizonYears: 10,
  expectedReturnRate: 7,
};
