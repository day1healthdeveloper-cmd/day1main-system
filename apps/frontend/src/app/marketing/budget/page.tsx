'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, PieChart, BarChart3, AlertCircle } from 'lucide-react';

export default function BudgetROIPage() {
  const budgetOverview = {
    totalBudget: 50000,
    spent: 23450,
    remaining: 26550,
    revenue: 489000,
    roi: 1985,
    cpl: 95,
    cpa: 540
  };

  const channelBudgets = [
    { channel: 'Email', budget: 10000, spent: 2500, revenue: 78000, roi: 3020, leads: 89, conversions: 28 },
    { channel: 'WhatsApp', budget: 8000, spent: 1780, revenue: 133500, roi: 7400, leads: 64, conversions: 45 },
    { channel: 'SMS', budget: 12000, spent: 3120, revenue: 117000, roi: 3650, leads: 52, conversions: 34 },
    { channel: 'Voice', budget: 10000, spent: 6800, revenue: 44500, roi: 554, leads: 28, conversions: 12 },
    { channel: 'Social Media', budget: 10000, spent: 9250, revenue: 116000, roi: 1154, leads: 14, conversions: 15 }
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget & ROI</h1>
            <p className="text-gray-600 mt-1">Track spending, ROI, and budget allocation</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <PieChart className="w-4 h-4 mr-2" />
            Adjust Budget
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-3xl font-bold mt-1">R{budgetOverview.totalBudget.toLocaleString()}</p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="text-3xl font-bold mt-1 text-orange-600">R{budgetOverview.spent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{((budgetOverview.spent/budgetOverview.totalBudget)*100).toFixed(1)}% used</p>
                </div>
                <BarChart3 className="w-10 h-10 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">R{budgetOverview.revenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">{budgetOverview.roi}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelBudgets.map((channel, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{channel.channel}</h3>
                    <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded">
                      {channel.roi}% ROI
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-3 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Budget</p>
                      <p className="text-lg font-bold">R{(channel.budget/1000).toFixed(0)}k</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-gray-600">Spent</p>
                      <p className="text-lg font-bold text-orange-600">R{(channel.spent/1000).toFixed(1)}k</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">Revenue</p>
                      <p className="text-lg font-bold text-green-600">R{(channel.revenue/1000).toFixed(0)}k</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Leads</p>
                      <p className="text-lg font-bold text-blue-600">{channel.leads}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600">Conv.</p>
                      <p className="text-lg font-bold text-purple-600">{channel.conversions}</p>
                    </div>
                    <div className="text-center p-2 bg-pink-50 rounded">
                      <p className="text-xs text-gray-600">CPA</p>
                      <p className="text-lg font-bold text-pink-600">R{Math.round(channel.spent/channel.conversions)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-orange-600 h-3 rounded-full"
                      style={{ width: `${(channel.spent/channel.budget)*100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>R{(channel.budget - channel.spent).toLocaleString()} remaining</span>
                    <span>{((channel.spent/channel.budget)*100).toFixed(1)}% used</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
