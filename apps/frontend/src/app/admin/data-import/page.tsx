'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Database, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';

interface ImportFile {
  id: string;
  name: string;
  type: 'members' | 'policies' | 'claims' | 'financial' | 'products' | 'providers' | 'brokers';
  size: number;
  status: 'pending' | 'analyzing' | 'ready' | 'importing' | 'completed' | 'error';
  records?: number;
  errors?: string[];
  preview?: any[];
}

export default function DataImportPage() {
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ImportFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);

  const importTypes = [
    { 
      type: 'members', 
      label: 'Members', 
      icon: '👥',
      description: 'Import member data (names, IDs, contact details)',
      expectedColumns: ['ID Number', 'First Name', 'Last Name', 'Email', 'Phone', 'Date of Birth']
    },
    { 
      type: 'policies', 
      label: 'Policies', 
      icon: '📋',
      description: 'Import policy data (policy numbers, coverage, premiums)',
      expectedColumns: ['Policy Number', 'Member ID', 'Product', 'Premium', 'Start Date', 'Status']
    },
    { 
      type: 'claims', 
      label: 'Claims', 
      icon: '🏥',
      description: 'Import claims history (submissions, approvals, payments)',
      expectedColumns: ['Claim Number', 'Policy Number', 'Date', 'Amount', 'Status', 'Provider']
    },
    { 
      type: 'financial', 
      label: 'Financial', 
      icon: '💰',
      description: 'Import financial data (premiums, payments, balances)',
      expectedColumns: ['Account Code', 'Description', 'Debit', 'Credit', 'Date', 'Reference']
    },
    { 
      type: 'products', 
      label: 'Products', 
      icon: '📦',
      description: 'Import product definitions (plans, benefits, pricing)',
      expectedColumns: ['Product Code', 'Name', 'Premium', 'Hospital Cover', 'Ambulance', 'Benefits']
    },
    { 
      type: 'providers', 
      label: 'Providers', 
      icon: '🏨',
      description: 'Import provider network (doctors, hospitals, pharmacies)',
      expectedColumns: ['Provider ID', 'Name', 'Type', 'Address', 'Contact', 'Network Status']
    },
    { 
      type: 'brokers', 
      label: 'Brokers', 
      icon: '🤝',
      description: 'Import broker data (agents, commission rates)',
      expectedColumns: ['Broker ID', 'Name', 'Email', 'Commission Rate', 'Status']
    },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      
      const tempId = `${Date.now()}-${i}`;
      const newFile: ImportFile = {
        id: tempId,
        name: file.name,
        type: type as any,
        size: file.size,
        status: 'analyzing',
      };

      setFiles(prev => [...prev, newFile]);

      try {
        // Upload to backend
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/data-import/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();

        setFiles(prev => prev.map(f => 
          f.id === tempId 
            ? { 
                ...f, 
                id: data.fileId,
                status: 'ready', 
                records: data.totalRecords,
                preview: data.preview
              } 
            : f
        ));
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === tempId 
            ? { 
                ...f, 
                status: 'error',
                errors: ['Failed to upload file']
              } 
            : f
        ));
      }
    }
  };

  const handleImport = async (fileId: string) => {
    setImporting(true);
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'importing' } : f
    ));

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/data-import/import/${fileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const data = await response.json();

      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'completed',
              errors: data.errors || []
            } 
          : f
      ));
    } catch (error) {
      console.error('Import error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'error',
              errors: ['Failed to import file']
            } 
          : f
      ));
    } finally {
      setImporting(false);
    }
  };

  const handleImportAll = async () => {
    setImporting(true);
    const readyFiles = files.filter(f => f.status === 'ready');
    
    for (const file of readyFiles) {
      await handleImport(file.id);
    }
    
    setImporting(false);
  };

  const getStatusIcon = (status: ImportFile['status']) => {
    switch(status) {
      case 'analyzing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'importing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ImportFile['status']) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800',
      analyzing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      importing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.toUpperCase()}
    </span>;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Import Center</h1>
            <p className="text-gray-600 mt-1">Import Excel files to populate the system with real data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open('/templates/import-templates.zip')}>
              <Download className="w-4 h-4 mr-2" />
              Download Templates
            </Button>
            {files.some(f => f.status === 'ready') && (
              <Button onClick={handleImportAll} disabled={importing}>
                <Database className="w-4 h-4 mr-2" />
                Import All Ready Files
              </Button>
            )}
          </div>
        </div>

        {/* Import Statistics */}
        {files.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{files.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Files Uploaded</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {files.filter(f => f.status === 'ready').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Ready to Import</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {files.filter(f => f.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {files.reduce((sum, f) => sum + (f.records || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Records</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Import Types */}
        <Card>
          <CardHeader>
            <CardTitle>Select Data Type to Import</CardTitle>
            <CardDescription>Choose the type of data you want to import from Excel files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importTypes.map((importType) => (
                <div key={importType.type} className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{importType.icon}</div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, importType.type)}
                      />
                      <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                    </label>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{importType.label}</h3>
                  <p className="text-sm text-gray-600 mb-3">{importType.description}</p>
                  <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">Expected columns:</p>
                    <p className="line-clamp-2">{importType.expectedColumns.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>Review and import your uploaded files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {getStatusIcon(file.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{file.name}</h4>
                            {getStatusBadge(file.status)}
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {file.type.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{(file.size / 1024).toFixed(2)} KB</span>
                            {file.records && <span>{file.records.toLocaleString()} records found</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {file.status === 'ready' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedFile(file);
                                setShowPreview(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleImport(file.id)}
                              disabled={importing}
                            >
                              <Database className="w-4 h-4 mr-1" />
                              Import
                            </Button>
                          </>
                        )}
                        {file.status === 'completed' && (
                          <span className="text-sm text-green-600 font-medium">✓ Imported Successfully</span>
                        )}
                      </div>
                    </div>
                    {file.errors && file.errors.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-medium text-red-900 mb-1">Errors found:</p>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {file.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Modal */}
        {showPreview && selectedFile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Preview: {selectedFile.name}</CardTitle>
                    <CardDescription>First 3 rows of {selectedFile.records} records</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {selectedFile.preview && selectedFile.preview.length > 0 && 
                          Object.keys(selectedFile.preview[0]).map((key) => (
                            <th key={key} className="px-4 py-2 text-left font-medium text-gray-700 border">
                              {key}
                            </th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFile.preview?.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          {Object.values(row).map((value: any, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-2 border">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
                  <Button onClick={() => {
                    handleImport(selectedFile.id);
                    setShowPreview(false);
                  }}>
                    Import This File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Import Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>✓ <strong>Supported formats:</strong> Excel (.xlsx, .xls) and CSV (.csv)</p>
            <p>✓ <strong>File size:</strong> Maximum 50MB per file</p>
            <p>✓ <strong>Column headers:</strong> First row must contain column names</p>
            <p>✓ <strong>Data validation:</strong> System will check for errors before importing</p>
            <p>✓ <strong>Formulas:</strong> Excel formulas will be converted to system logic</p>
            <p>✓ <strong>Duplicates:</strong> System will detect and skip duplicate records</p>
            <p>✓ <strong>Backup:</strong> All imports are logged and can be reversed if needed</p>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
