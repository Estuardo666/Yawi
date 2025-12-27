import React, { useState, useEffect } from 'react';
import { api } from '../api';

const FinanceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFinanceStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading Finance Data...</div>;

  const calculateMargin = (income, expenses) => {
    if (!income) return 0;
    return ((income - expenses) / income * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${stats?.income?.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-gray-500 text-sm">Expenses</h3>
          <p className="text-3xl font-bold text-red-500">${stats?.expenses?.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-gray-500 text-sm">Profit Margin</h3>
          <p className="text-3xl font-bold text-blue-600">
            {calculateMargin(stats?.income, stats?.expenses)}%
          </p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold mb-4">Smart Tips & Insights</h3>
        <div className="space-y-3">
          {stats?.tips?.length > 0 ? (
            stats.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <span className="text-2xl">💡</span>
                <p className="text-sm text-blue-900 pt-1">{tip}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No new insights available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
