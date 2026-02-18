'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DocumentsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const policyDocuments = [
    {
      id: 1,
      name: 'Policy Schedule',
      description: 'Comprehensive Medical Plan',
      type: 'Policy',
      date: '1 Jan 2024',
      size: '2.4 MB',
      icon: 'document',
      color: 'blue',
    },
    {
      id: 2,
      name: 'Certificate of Cover',
      description: 'Valid until 31 Dec 2024',
      type: 'Certificate',
      date: '1 Jan 2024',
      size: '1.2 MB',
      icon: 'certificate',
      color: 'green',
    },
    {
      id: 3,
      name: 'Benefit Guide',
      description: '2024 Edition',
      type: 'Guide',
      date: '1 Jan 2024',
      size: '5.8 MB',
      icon: 'book',
      color: 'purple',
    },
    {
      id: 4,
      name: 'Gap Cover Policy',
      description: 'Policy Schedule',
      type: 'Policy',
      date: '1 Jan 2024',
      size: '1.8 MB',
      icon: 'document',
      color: 'indigo',
    },
  ];

  const statements = [
    {
      id: 1,
      name: 'January 2026 Statement',
      description: 'Monthly statement',
      date: '31 Jan 2026',
      size: '856 KB',
      type: 'Statement',
    },
    {
      id: 2,
      name: 'December 2025 Statement',
      description: 'Monthly statement',
      date: '31 Dec 2025',
      size: '742 KB',
      type: 'Statement',
    },
    {
      id: 3,
      name: 'November 2025 Statement',
      description: 'Monthly statement',
      date: '30 Nov 2025',
      size: '698 KB',
      type: 'Statement',
    },
  ];

  const taxCertificates = [
    {
      id: 1,
      name: 'Tax Certificate 2025',
      description: 'Annual medical aid tax certificate',
      taxYear: '2025',
      date: '15 Jan 2026',
      size: '456 KB',
    },
    {
      id: 2,
      name: 'Tax Certificate 2024',
      description: 'Annual medical aid tax certificate',
      taxYear: '2024',
      date: '15 Jan 2025',
      size: '423 KB',
    },
  ];

  const claimDocuments = [
    {
      id: 1,
      name: 'Claim Receipt - CLM-20260115-001',
      description: 'General Consultation',
      date: '15 Jan 2026',
      size: '124 KB',
    },
    {
      id: 2,
      name: 'Claim Receipt - CLM-20260110-002',
      description: 'Prescription Medication',
      date: '10 Jan 2026',
      size: '98 KB',
    },
  ];

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      orange: 'bg-orange-100 text-orange-600',
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Access and download your policy documents, statements, and certificates
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Policy Documents</CardDescription>
              <CardTitle className="text-2xl">{policyDocuments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Statements</CardDescription>
              <CardTitle className="text-2xl">{statements.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tax Certificates</CardDescription>
              <CardTitle className="text-2xl">{taxCertificates.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Claim Documents</CardDescription>
              <CardTitle className="text-2xl">{claimDocuments.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Policy Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Documents</CardTitle>
            <CardDescription>Your policy schedules, certificates, and guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policyDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(doc.color)}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{doc.date}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tax Certificates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tax Certificates</CardTitle>
                <CardDescription>Annual medical aid tax certificates for SARS</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Request Certificate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taxCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cert.name}</p>
                      <p className="text-sm text-gray-600">{cert.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>Tax Year: {cert.taxYear}</span>
                        <span>•</span>
                        <span>Issued: {cert.date}</span>
                        <span>•</span>
                        <span>{cert.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statements */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Statements</CardTitle>
            <CardDescription>Your monthly account statements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statements.map((statement) => (
                <div
                  key={statement.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{statement.name}</p>
                      <p className="text-sm text-gray-600">{statement.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{statement.date}</span>
                        <span>•</span>
                        <span>{statement.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Claim Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Documents</CardTitle>
            <CardDescription>Receipts and documents from your claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claimDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
