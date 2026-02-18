'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Target,
  DollarSign,
  Users,
  Mail,
  MessageSquare,
  Phone,
  Calendar
} from 'lucide-react';

export default function MarketingAnalyticsPage() {
  const conversionFunnel = [
    { stage: 'Landing Page Visits', count: 5420, percentage: 100, dropoff: 0 },
    { stage: 'Lead Capture', count: 1628, percentage: 30, dropoff: 70 },
    { stage: 'Application Started', count: 814, percentage: 15, dropoff: 50 },
    { stage: 'KYC Completed', count: 651, percentage: 12, dropoff: 20 },
    { stage: 'Plan Selected', count: 570, percentage: 10.5, dropoff: 12.4 },
    { stage: 'Payment Setup', count: 489, percentage: 9, dropoff: 14.2 },
    { stage: 'Policy Activated', count: 434, percentage: 8, dropoff: 11.2 },
  ];

  const channelPerformance = [
    { channel: 'Email', sent: 12500, opened: 3125, clicked: 625, converted: 156, cost: 2500, revenue: 78000, roi: 3020 },
    { channel: 'WhatsApp', sent: 8900, opened: 7120, clicked: 1780, converted: 267, cost: 1780, revenue: 133500, roi: 7400 },
    { channel: 'SMS', sent: 15600, opened: 15288, clicked: 1560, converted: 234, cost: 3120, revenue: 117000, roi: 3650 },
    { channel: 'Voice', sent: 3400, opened: 1530, clicked: 765, converted: 89, cost: 6800, revenue: 44500, roi: 554 },
  ];

  const leadSourceROI = [
    { source: 'Website', leads: 89, converted: 25, cost: 4500, revenue: 125000, roi: 2678, cpl: 51 },
    { source: 'Referrals', leads: 64, converted: 22, cost: 2200, revenue: 110000, roi: 4900, cpl: 34 },
    { source: 'Campaigns', leads: 52, converted: 11, cost: 7800, revenue: 55000, roi: 605, cpl: 150 },
    { source: 'Brokers', leads: 28, converted: 13, cost: 5600, revenue: 65000, roi: 1061, cpl: 200 },
    { source: 'Social Media', leads: 14, converted: 3, cost: 2100, revenue: 15000, roi: 614, cpl: 150 },
  ];

  const cohortAnalysis = [
    { cohort: 'Jan 2026', month1: 100, month2: 92, month3: 87, ltv: 12450 },
    { cohort: 'Dec 2025', month1: 100, month2: 89, month3: 82, ltv: 11890 },
    { cohort: 'Nov 2025', month1: 100, month2: 94, month3: 88, ltv: 13200 },
    { cohort: 'Oct 2025', month1: 100, month2: 91, month3: 85, ltv: 12100 },
  ];

  const campaignEffectiveness = [
    { campaign: 'Summer Promo', impressions: 45000, clicks: 2250, leads: 89, converted: 28, spend: 5000, revenue: 140000, roas: 28 },
    { campaign: 'Product Launch', impressions: 32000, clicks: 1920, leads: 64, converted: 45, spend: 3000, revenue: 225000, roas: 75 },
    { campaign: 'Referral Drive', impressions: 28000, clicks: 1680, leads: 52, converted: 89, spend: 4000, revenue: 445000, roas: 111 },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Analytics</h1>
          <p className="text-gray-600 mt-1">Performance metrics, ROI analysis, and insights</p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lead Conversion Rate</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">23.5%</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +2.3% vs last month
                  </p>
                </div>
                <Target className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Campaign ROI</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">385%</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +45% vs last month
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost Per Lead</p>
                  <p className="text-3xl font-bold mt-1">R245</p>
                  <p className="text-xs text-green-600 mt-1">-R35 vs last month</p>
                </div>
                <Users className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Customer LTV</p>
                  <p className="text-3xl font-bold mt-1">R12,450</p>
                  <p className="text-xs text-green-600 mt-1">+R1,200 vs last month</p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Conversion Funnel Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversionFunnel.map((stage, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{stage.count.toLocaleString()} ({stage.percentage}%)</span>
                      {i > 0 && (
                        <span className="text-xs text-red-600">-{stage.dropoff}% drop-off</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-400 h-3 rounded-full transition-all" 
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Channel Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Multi-Channel Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Channel</th>
                    <th className="text-right py-3 px-4 font-medium">Sent</th>
                    <th className="text-right py-3 px-4 font-medium">Opened</th>
                    <th className="text-right py-3 px-4 font-medium">Clicked</th>
                    <th className="text-right py-3 px-4 font-medium">Converted</th>
                    <th className="text-right py-3 px-4 font-medium">Cost</th>
                    <th className="text-right py-3 px-4 font-medium">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {channelPerformance.map((channel, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {channel.channel === 'Email' && <Mail className="w-4 h-4 text-purple-600" />}
                          {channel.channel === 'WhatsApp' && <MessageSquare className="w-4 h-4 text-green-600" />}
                          {channel.channel === 'SMS' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                          {channel.channel === 'Voice' && <Phone className="w-4 h-4 text-orange-600" />}
                          <span className="font-medium">{channel.channel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">{channel.sent.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        {channel.opened.toLocaleString()}
                        <span className="text-xs text-gray-500 ml-1">({((channel.opened/channel.sent)*100).toFixed(0)}%)</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {channel.clicked.toLocaleString()}
                        <span className="text-xs text-gray-500 ml-1">({((channel.clicked/channel.sent)*100).toFixed(0)}%)</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">{channel.converted}</td>
                      <td className="py-3 px-4 text-right">R{channel.cost.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium">R{channel.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                          {channel.roi}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Source ROI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Lead Source ROI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leadSourceROI.map((source, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{source.source}</span>
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                        {source.roi}% ROI
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Leads</p>
                        <p className="font-medium">{source.leads}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Converted</p>
                        <p className="font-medium text-green-600">{source.converted}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">CPL</p>
                        <p className="font-medium">R{source.cpl}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium">R{(source.revenue/1000).toFixed(0)}k</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Campaign Effectiveness Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaignEffectiveness.map((campaign, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{campaign.campaign}</span>
                      <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {campaign.roas}x ROAS
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                      <div>
                        <p className="text-gray-500">Impressions</p>
                        <p className="font-medium">{(campaign.impressions/1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Clicks</p>
                        <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Leads</p>
                        <p className="font-medium">{campaign.leads}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Converted</p>
                        <p className="font-medium text-green-600">{campaign.converted}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Spend: R{campaign.spend.toLocaleString()}</span>
                      <span className="font-medium text-green-600">Revenue: R{campaign.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cohort Retention Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Cohort</th>
                    <th className="text-center py-3 px-4 font-medium">Month 1</th>
                    <th className="text-center py-3 px-4 font-medium">Month 2</th>
                    <th className="text-center py-3 px-4 font-medium">Month 3</th>
                    <th className="text-right py-3 px-4 font-medium">LTV</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortAnalysis.map((cohort, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{cohort.cohort}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {cohort.month1}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                          {cohort.month2}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                          {cohort.month3}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">R{cohort.ltv.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
