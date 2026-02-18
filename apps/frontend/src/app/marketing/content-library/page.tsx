'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Phone,
  Image,
  Edit,
  Copy,
  Trash2,
  Eye,
  Search
} from 'lucide-react';
import { useState } from 'react';

export default function ContentLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const templates = [
    { id: '1', name: 'Welcome Email', type: 'email', category: 'Onboarding', uses: 45, lastUsed: '2 hours ago', status: 'active' },
    { id: '2', name: 'Product Announcement', type: 'email', category: 'Product', uses: 32, lastUsed: '1 day ago', status: 'active' },
    { id: '3', name: 'Referral Incentive SMS', type: 'sms', category: 'Referral', uses: 28, lastUsed: '3 hours ago', status: 'active' },
    { id: '4', name: 'WhatsApp Promo', type: 'whatsapp', category: 'Promotion', uses: 19, lastUsed: '5 hours ago', status: 'active' },
    { id: '5', name: 'Voice Follow-up Script', type: 'voice', category: 'Follow-up', uses: 12, lastUsed: '2 days ago', status: 'active' },
    { id: '6', name: 'Abandoned Cart Email', type: 'email', category: 'Retention', uses: 67, lastUsed: '30 min ago', status: 'active' },
    { id: '7', name: 'Quote Reminder SMS', type: 'sms', category: 'Sales', uses: 54, lastUsed: '1 hour ago', status: 'active' },
    { id: '8', name: 'Policy Renewal WhatsApp', type: 'whatsapp', category: 'Retention', uses: 23, lastUsed: '4 hours ago', status: 'active' },
  ];

  const brandAssets = [
    { id: '1', name: 'Logo Primary', type: 'image', size: '245 KB', downloads: 89 },
    { id: '2', name: 'Logo Secondary', type: 'image', size: '198 KB', downloads: 67 },
    { id: '3', name: 'Brand Colors', type: 'document', size: '12 KB', downloads: 156 },
    { id: '4', name: 'Typography Guide', type: 'document', size: '34 KB', downloads: 98 },
    { id: '5', name: 'Hero Banner', type: 'image', size: '1.2 MB', downloads: 45 },
  ];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'email': return <Mail className="w-4 h-4 text-purple-600" />;
      case 'sms': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'voice': return <Phone className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
            <p className="text-gray-600 mt-1">Manage templates, assets, and brand materials</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <FileText className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-2xl font-bold mt-1">{templates.filter(t => t.type === 'email').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">SMS</p>
                <p className="text-2xl font-bold mt-1">{templates.filter(t => t.type === 'sms').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">WhatsApp</p>
                <p className="text-2xl font-bold mt-1">{templates.filter(t => t.type === 'whatsapp').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Phone className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Voice</p>
                <p className="text-2xl font-bold mt-1">{templates.filter(t => t.type === 'voice').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Image className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Assets</p>
                <p className="text-2xl font-bold mt-1">{brandAssets.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search templates..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="voice">Voice</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option>All Categories</option>
                <option>Onboarding</option>
                <option>Product</option>
                <option>Promotion</option>
                <option>Retention</option>
                <option>Sales</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates ({filteredTemplates.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(template.type)}
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-xs text-gray-500">{template.category}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {template.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{template.uses} uses</span>
                        <span>Last used: {template.lastUsed}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Copy className="w-3 h-3 mr-1" />
                          Clone
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Brand Assets */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Brand Assets</CardTitle>
                  <Button size="sm" variant="outline">Upload</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {brandAssets.map((asset) => (
                    <div key={asset.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Image className="w-4 h-4 text-pink-600" />
                        <span className="text-sm font-medium">{asset.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{asset.size}</span>
                        <span>{asset.downloads} downloads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
