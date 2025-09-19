import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatEther } from '../utils/ethers';

const Expenses = () => {
  const { expenses, addExpense, loading } = useWeb3();
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDescription, setExpenseDescription] = useState('');

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDescription) return;
    
    const success = await addExpense(expenseAmount, expenseCategory, expenseDescription);
    if (success) {
      setExpenseAmount('');
      setExpenseDescription('');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const expenseCategories = [
    'Food',
    'Transportation',
    'Housing',
    'Entertainment',
    'Healthcare',
    'Education',
    'Clothing',
    'Utilities',
    'Insurance',
    'Other'
  ];

  // Calculate expenses by category for the chart
  const expensesByCategory = {};
  if (expenses && expenses.length > 0) {
    expenses.forEach(expense => {
      const amount = parseFloat(formatEther(expense.amount));
      if (expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] += amount;
      } else {
        expensesByCategory[expense.category] = amount;
      }
    });
  }

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  id="expenseAmount"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                  className="form-input mt-1"
                  placeholder="0.0000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="expenseCategory" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="expenseCategory"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="form-select mt-1"
                >
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="expenseDescription" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  id="expenseDescription"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="form-input mt-1"
                  placeholder="What was this expense for?"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Add Expense'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (ETH)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses && expenses.length > 0 ? (
                  [...expenses].reverse().map((expense, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parseFloat(formatEther(expense.amount)).toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(expense.timestamp)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Expenses by Category</h3>
          </div>
          <div className="p-6">
            {totalExpenses > 0 ? (
              <div className="space-y-4">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-gray-500">{amount.toFixed(4)} ETH</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(amount / totalExpenses) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-medium text-gray-900">{totalExpenses.toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No expense data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;