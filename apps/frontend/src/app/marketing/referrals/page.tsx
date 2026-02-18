'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  TrendingUp, 
  DollarSign, 
  Award,
  Copy,
  CheckCircle,
  Users,
  Target,
  BarChart3,
  Gift
} from 'lucide-react';

export default function MarketingReferralsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const referrals = [
    { 
      id: '1', 
      referrer: 'John Smith', 
      email: 'john.s@email.com',
      code: 'JOHN-1234', 
      referred: 12, 
      converted: 9, 
      pending: 3,
      rewards: 900,
      totalValue: 45000,
      status: 'active',
      joinDate: '2025-11-15',
      lastReferral: '2 days ago'
    },
    { 
      id: '2', 
      referrer: 'Jane Doe', 
      email: 'jane.d@email.com',
      code: 'JANE-5678', 
      referred: 18, 
      converted: 14, 
      pending: 4,
      rewards: 1400,
      totalValue: 67000,
      status: 'active',
      joinDate: '2025-10-20',
      lastReferral: '5 hours ago'
    },
    { 
      id: '3', 
      referrer: 'Bob Johnson', 
      email: 'bob.j@email.com',
      code: 'BOB-9012', 
      referred: 25, 
      converted: 19, 
      pending: 6,
      rewards: 1900,
      totalValue: 89000,
      status: 'active',
      joinDate: '2025-09-10',
      lastReferral: '1 day ago'
    },
    { 
      id: '4', 
      referrer: 'Alice Williams', 
      email: 'alice.w@email.com',
      code: 'ALICE-3456', 
      referred: 8, 
      converted: 6, 
      pending: 2,
      rewards: 600,
      totalValue: 28000,
      status: 'active',
      joinDate: '2025-12-01',
      lastReferral: '3 days ago'
    },
  ];

  const programStats = {
    totalReferrals: 156,
    converted: 98,
    pending: 58,
    conversionRate: 62.8,
    totalRewards: 9800,
    avgRewardPerReferrer: 245,
    topReferrer: 'Bob Johnson',
    totalValue: 489000,
  };

  const recentActivity = [
    { referrer: 'Jane Doe', action: 'New referral', referred: 'Sarah Chen', time: '5 hours ago' },
    { referrer: 'Bob Johnson', action: 'Conversion', referred: 'Michael Brown', time: '1 day ago' },
    { referrer: 'John Smith', action: 'New referral', referred: 'Emma Wilson', time: '2 days ago' },
    { referrer: 'Alice Williams', action: 'Conversion', referred: 'David Lee', time: '3 days ago' },
  ];

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
            <p className="text-gray-600 mt-1">Track referrals and rewards (R100 per successful conversion)</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Gift className="w-4 h-4 mr-2" />
            Generate Code
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-3xl font-bold mt-1">{programStats.totalReferrals}</p>
                  <p className="text-xs text-gray-500 mt-1">{programStats.pending} pending</p>
                </div>
                <UserPlus className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Converted</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{programStats.converted}</p>
                  <p className="text-xs text-green-600 mt-1">+12 this month</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">{programStats.conversionRate}%</p>
                  <p className="text-xs text-green-600 mt-1">+3.2% vs last month</p>
                </div>
                <Target className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Rewards</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">R{programStats.totalRewards.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">R{programStats.avgRewardPerReferrer} avg/referrer</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Referral Program Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Top Referrer</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{programStats.topReferrer}</p>
                <p className="text-xs text-purple-700">25 referrals • 19 converted</p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Total Value Generated</span>
                </div>
                <p className="text-2xl font-bold text-green-600">R{programStats.totalValue.toLocaleString()}</p>
                <p className="text-xs text-green-700">From converted referrals</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Active Referrers</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{referrals.filter(r => r.status === 'active').length}</p>
                <p className="text-xs text-blue-700">Generating referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Referrers Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Top Referrers Leaderboard
                  </CardTitle>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrals.map((ref, index) => (
                    <div key={ref.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' :
                            'bg-purple-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{ref.referrer}</p>
                            <p className="text-xs text-gray-500">{ref.email}</p>
                            <p className="text-xs text-gray-500">Member since {ref.joinDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-purple-100 rounded-lg font-mono text-sm font-medium text-purple-700">
                            {ref.code}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyCode(ref.code)}
                          >
                            {copiedCode === ref.code ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Referred</p>
                          <p className="text-lg font-bold">{ref.referred}</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-xs text-gray-600">Converted</p>
                          <p className="text-lg font-bold text-green-600">{ref.converted}</p>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <p className="text-xs text-gray-600">Pending</p>
                          <p className="text-lg font-bold text-yellow-600">{ref.pending}</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <p className="text-xs text-gray-600">Rewards</p>
                          <p className="text-lg font-bold text-purple-600">R{ref.rewards}</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-xs text-gray-600">Value</p>
                          <p className="text-lg font-bold text-blue-600">R{(ref.totalValue / 1000).toFixed(0)}k</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>Last referral: {ref.lastReferral}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          {((ref.converted / ref.referred) * 100).toFixed(0)}% conversion
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Rewards Calculator */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {activity.action === 'Conversion' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <UserPlus className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="text-sm font-medium">{activity.action}</span>
                      </div>
                      <p className="text-xs text-gray-600">{activity.referrer} → {activity.referred}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rewards Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-4 h-4" />
                  Rewards Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-900 mb-2">Reward per conversion</p>
                    <p className="text-3xl font-bold text-purple-600">R100</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">5 conversions</span>
                      <span className="font-medium">R500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">10 conversions</span>
                      <span className="font-medium">R1,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">25 conversions</span>
                      <span className="font-medium">R2,500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">50 conversions</span>
                      <span className="font-medium">R5,000</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-600 mb-2">Program Benefits:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>✓ Unlimited referrals</li>
                      <li>✓ Instant reward tracking</li>
                      <li>✓ Monthly payouts</li>
                      <li>✓ Bonus for top referrers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
