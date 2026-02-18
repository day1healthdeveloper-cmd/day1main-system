'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Bot, FileText, Mic, Brain, TrendingUp } from 'lucide-react';

export default function AIAutomationPage() {
  const aiMetrics = {
    chatbot: { interactions: 3456, resolved: 2401, resolutionRate: 69.5, avgResponseTime: '1.8s', satisfaction: 4.5 },
    ocr: { processed: 1423, successful: 1392, accuracy: 97.8, avgTime: '2.3s', autoApproved: 90 },
    voice: { calls: 892, transcribed: 867, accuracy: 97.2, avgDuration: '3:45', answered: 45 },
    underwriting: { applications: 756, autoApproved: 605, accuracy: 95.2, avgTime: '45s', manualReview: 20 }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI & Automation</h1>
            <p className="text-gray-600 mt-1">AI-powered automation performance metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Automation Rate</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">99%</p>
                </div>
                <Zap className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Accuracy</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">96.9%</p>
                </div>
                <Brain className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-3xl font-bold mt-1">2,340h</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost Savings</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">R234k</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Chatbot Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Interactions</p>
                  <p className="text-2xl font-bold">{aiMetrics.chatbot.interactions.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{aiMetrics.chatbot.resolved.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{aiMetrics.chatbot.resolutionRate}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-blue-600">{aiMetrics.chatbot.satisfaction}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                OCR Document Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Processed</p>
                  <p className="text-2xl font-bold">{aiMetrics.ocr.processed.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{aiMetrics.ocr.successful.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">{aiMetrics.ocr.accuracy}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Auto-Approved</p>
                  <p className="text-2xl font-bold text-blue-600">{aiMetrics.ocr.autoApproved}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Calls Made</p>
                  <p className="text-2xl font-bold">{aiMetrics.voice.calls.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Transcribed</p>
                  <p className="text-2xl font-bold text-green-600">{aiMetrics.voice.transcribed.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">{aiMetrics.voice.accuracy}%</p>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <p className="text-sm text-gray-600">Answer Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{aiMetrics.voice.answered}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Underwriting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="text-2xl font-bold">{aiMetrics.underwriting.applications.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Auto-Approved</p>
                  <p className="text-2xl font-bold text-green-600">{aiMetrics.underwriting.autoApproved.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">{aiMetrics.underwriting.accuracy}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Avg Time</p>
                  <p className="text-2xl font-bold text-blue-600">{aiMetrics.underwriting.avgTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
