'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RunDebitOrdersPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [actionDate, setActionDate] = useState('');
  const [instruction, setInstruction] = useState<'Sameday' | 'TwoDay'>('TwoDay');
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, dateRes] = await Promise.all([
        fetch('/api/netcash/summary'),
        fetch('/api/netcash/next-debit-date?daysAhead=2'),
      ]);

      const summaryData = await summaryRes.json();
      const dateData = await dateRes.json();

      setSummary(summaryData);
      setActionDate(dateData.formatted);

      // Select all brokers by default
      if (summaryData?.byBroker) {
        setSelectedBrokers(Object.keys(summaryData.byBroker));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBrokerToggle = (broker: string) => {
    setSelectedBrokers((prev) =>
      prev.includes(broker) ? prev.filter((b) => b !== broker) : [...prev, broker]
    );
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBrokers([]);
    } else {
      setSelectedBrokers(Object.keys(summary?.byBroker || {}));
    }
    setSelectAll(!selectAll);
  };

  const calculateTotals = () => {
    if (!summary?.byBroker) return { members: 0, amount: 0 };

    return selectedBrokers.reduce(
      (acc, broker) => {
        const data = summary.byBroker[broker];
        return {
          members: acc.members + data.count,
          amount: acc.amount + data.premium,
        };
      },
      { members: 0, amount: 0 }
    );
  };

  const handleSubmit = async () => {
    if (selectedBrokers.length === 0) {
      setError('Please select at least one broker group');
      return;
    }

    if (!actionDate) {
      setError('Please select an action date');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Convert date to CCYYMMDD format
      const formattedDate = actionDate.replace(/-/g, '');

      const response = await fetch('/api/netcash/generate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionDate: formattedDate,
          instruction,
          brokerGroups: selectAll ? undefined : selectedBrokers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate batch');
      }

      const result = await response.json();

      // Redirect to batch details
      router.push(`/operations/debit-orders/${result.runId}`);
    } catch (error: any) {
      console.error('Error generating batch:', error);
      setError(error.message || 'Failed to generate batch');
    } finally {
      setProcessing(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Run Monthly Debit Orders</h1>
        <p className="text-gray-600 mt-2">Generate and submit debit order batch to Netcash</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Date
            </label>
            <input
              type="date"
              value={actionDate}
              onChange={(e) => setActionDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Date when debits will be processed by banks
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Debit Type
            </label>
            <select
              value={instruction}
              onChange={(e) => setInstruction(e.target.value as 'Sameday' | 'TwoDay')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TwoDay">Two-day (Recommended)</option>
              <option value="Sameday">Same-day</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {instruction === 'TwoDay'
                ? 'Submit 2 business days before action date'
                : 'Submit before 10:59 AM on action date'}
            </p>
          </div>
        </div>
      </div>

      {/* Broker Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Broker Groups</h2>
          <button
            onClick={handleSelectAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {selectAll ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {summary?.byBroker &&
            Object.entries(summary.byBroker)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([broker, data]: [string, any]) => (
                <label
                  key={broker}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedBrokers.includes(broker)}
                      onChange={() => handleBrokerToggle(broker)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 font-medium">{broker}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.count} members • R{data.premium.toFixed(2)}
                  </div>
                </label>
              ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Batch Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-2xl font-bold text-blue-600">{totals.members}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">R{totals.amount.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Action Date</p>
          <p className="font-semibold">{new Date(actionDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={processing || selectedBrokers.length === 0}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? '⏳ Generating Batch...' : '🚀 Submit to Netcash'}
        </button>
      </div>
    </div>
  );
}
