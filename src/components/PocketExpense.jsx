import React, { useState, useEffect } from 'react';
import { api } from '../api';

const PocketExpense = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('meals');
  const [billable, setBillable] = useState(false);
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error);
    // Set default user if available (e.g. current user) - assuming window.totemSettings.user.id
    if (window.totemSettings?.user?.id) {
        setUserId(window.totemSettings.user.id);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await api.submitExpense({
          amount,
          category,
          billable,
          user_id: userId
      });
      setMessage('Expense saved successfully!');
      setAmount('');
      setBillable(false);
    } catch (err) {
      setMessage('Error saving expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-panel p-6">
      <h2 className="text-xl font-bold mb-6">Totem Pocket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Assigned To</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 outline-none"
            required
          >
            <option value="">Select Staff...</option>
            {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 outline-none"
          >
            <option value="meals">Meals</option>
            <option value="transport">Transport</option>
            <option value="supplies">Supplies</option>
            <option value="software">Software</option>
          </select>
        </div>

        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="billable"
            checked={billable}
            onChange={(e) => setBillable(e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded"
          />
          <label htmlFor="billable" className="text-sm font-medium">Bill to Client?</label>
        </div>

        {/* Placeholder for Camera/File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 hover:bg-gray-50 cursor-pointer">
          📷 Upload Receipt (Coming Soon)
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn btn-primary py-3 text-lg"
        >
          {submitting ? 'Saving...' : 'Save Expense'}
        </button>

        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
};

export default PocketExpense;
