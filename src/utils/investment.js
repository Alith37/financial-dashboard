export function calculateInvestmentProjection({
  initialDeposit,
  monthlyContribution,
  timeHorizonYears,
  expectedReturnRate,
}) {
  const months = Math.max(0, Math.round(timeHorizonYears * 12));
  const monthlyRate = expectedReturnRate / 100 / 12;
  let balance = initialDeposit;

  for (let month = 0; month < months; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }

  return {
    projectedValue: balance,
    totalContributions: initialDeposit + monthlyContribution * months,
    estimatedGrowth: balance - (initialDeposit + monthlyContribution * months),
  };
}