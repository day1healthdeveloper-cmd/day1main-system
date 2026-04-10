'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Plus1UpgradePage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [currentPlan, setCurrentPlan] = useState('');
  const [upgradedPlan, setUpgradedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberFound, setMemberFound] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);

  const [availablePlans, setAvailablePlans] = useState<Array<{id: string; name: string; price: number}>>([]);

  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  const fetchAvailablePlans = async () => {
    try {
      console.log('Fetching plans from /api/products/list...');
      const response = await fetch('/api/products/list');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Plans fetched:', data);
        setAvailablePlans(data);
      } else {
        console.error('Failed to fetch plans, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSearch = async () => {
    if (!mobileNumber) {
      alert('Please enter your mobile number');
      return;
    }

    setLoading(true);
    try {
      // Search for Plus1 member
      const response = await fetch(`/api/plus1/search-member?mobile=${encodeURIComponent(mobileNumber)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.found) {
          setMemberFound(true);
          setMemberData(data.member);
          setCurrentPlan(data.member.coverPlanName || 'No plan');
        } else {
          alert('Member not found. Please check your mobile number.');
          setMemberFound(false);
        }
      } else {
        alert('Error searching for member. Please try again.');
      }
    } catch (error) {
      console.error('Error searching member:', error);
      alert('Error searching for member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!upgradedPlan) {
      alert('Please select an upgraded plan');
      return;
    }

    if (upgradedPlan === currentPlan) {
      alert('Please select a different plan to upgrade');
      return;
    }

    setLoading(true);
    try {
      // Submit upgrade request
      const response = await fetch('/api/plus1/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
          currentPlan,
          upgradedPlan,
          memberData,
        }),
      });

      if (response.ok) {
        alert('Upgrade request submitted successfully! Our team will contact you shortly.');
        // Reset form
        setMobileNumber('');
        setCurrentPlan('');
        setUpgradedPlan('');
        setMemberFound(false);
        setMemberData(null);
      } else {
        alert('Error submitting upgrade request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting upgrade:', error);
      alert('Error submitting upgrade request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/day1.png"
              alt="Day1Health Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Plus1 Member Plan Upgrade
          </h1>
          <p className="text-gray-600">
            Upgrade your medical cover to get more benefits
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Upgrade Your Plan</CardTitle>
            <CardDescription className="text-blue-100">
              Enter your details to upgrade your Plus1 medical cover
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Step 1: Member Search */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plus1 Member Mobile Number *
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={memberFound}
                  />
                  {!memberFound && (
                    <Button
                      onClick={handleSearch}
                      disabled={loading || !mobileNumber}
                      className="bg-blue-600 hover:bg-blue-700 px-6"
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </Button>
                  )}
                  {memberFound && (
                    <Button
                      onClick={() => {
                        setMemberFound(false);
                        setMemberData(null);
                        setCurrentPlan('');
                        setUpgradedPlan('');
                      }}
                      variant="outline"
                      className="px-6"
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>

              {memberFound && memberData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-800 font-medium">Member Found</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {memberData.firstName} {memberData.lastName}
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Current Plan Display */}
            {memberFound && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Plan
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <p className="font-medium text-gray-900">{currentPlan}</p>
                    {memberData.coverPlanPrice && (
                      <p className="text-sm text-gray-600 mt-1">
                        R{memberData.coverPlanPrice}/month
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 3: Upgraded Plan Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Upgraded Plan *
                  </label>
                  <select
                    value={upgradedPlan}
                    onChange={(e) => setUpgradedPlan(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select a plan --</option>
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name} - R{plan.price}/month
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upgrade Summary */}
                {upgradedPlan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Upgrade Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium text-gray-900">{currentPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium text-blue-600">{upgradedPlan}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !upgradedPlan}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold"
                  >
                    {loading ? 'Submitting...' : 'Submit Upgrade Request'}
                  </Button>
                </div>

                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Important Information</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your upgrade request will be reviewed by our team. We will contact you soon to confirm your upgraded plan details and your new premium amount.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
