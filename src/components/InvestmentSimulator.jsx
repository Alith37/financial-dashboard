import { calculateInvestmentProjection } from "../utils/investment.js";

export default function InvestmentSimulator({ investment, setInvestment }) {
  const handleChange = (field, value) => {
    setInvestment((prev) => ({
      ...prev,
      [field]:
        field === "timeHorizonYears"
          ? parseInt(value, 10) || 0
          : parseFloat(value) || 0,
    }));
  };

  const projection = calculateInvestmentProjection(investment);
  const formatCurrency = (value) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
      <h2 className="text-xl font-bold text-white">Investment Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-slate-300">
          Initial Deposit ($):
          <input
            type="number"
            value={investment.initialDeposit}
            onChange={(e) => handleChange("initialDeposit", e.target.value)}
            className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Monthly Contribution ($):
          <input
            type="number"
            value={investment.monthlyContribution}
            onChange={(e) =>
              handleChange("monthlyContribution", e.target.value)
            }
            className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Time Horizon (years):
          <input
            type="number"
            value={investment.timeHorizonYears}
            onChange={(e) => handleChange("timeHorizonYears", e.target.value)}
            className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Expected Return Rate (%):
          <input
            type="number"
            value={investment.expectedReturnRate}
            onChange={(e) => handleChange("expectedReturnRate", e.target.value)}
            className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Projected Value</p>
          <p className="text-xl font-bold text-emerald-400">
            {formatCurrency(projection.projectedValue)}
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Total Contributions</p>
          <p className="text-xl font-bold text-blue-400">
            {formatCurrency(projection.totalContributions)}
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Estimated Growth</p>
          <p className="text-xl font-bold text-amber-400">
            {formatCurrency(projection.estimatedGrowth)}
          </p>
        </div>
      </div>
    </div>
  );
}
