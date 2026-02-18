'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClaimLine {
  id: string;
  diagnosisCode: string;
  procedureCode: string;
  tariffCode: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export default function ClaimSubmissionPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Patient Information
  const [memberNumber, setMemberNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Claim Information
  const [serviceDate, setServiceDate] = useState('');
  const [claimType, setClaimType] = useState('consultation');
  const [referenceNumber, setReferenceNumber] = useState('');

  // Claim Lines
  const [claimLines, setClaimLines] = useState<ClaimLine[]>([
    {
      id: '1',
      diagnosisCode: '',
      procedureCode: '',
      tariffCode: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
    },
  ]);

  // Documents
  const [documents, setDocuments] = useState<File[]>([]);

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

  const addClaimLine = () => {
    const newLine: ClaimLine = {
      id: Date.now().toString(),
      diagnosisCode: '',
      procedureCode: '',
      tariffCode: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
    };
    setClaimLines([...claimLines, newLine]);
  };

  const removeClaimLine = (id: string) => {
    if (claimLines.length > 1) {
      setClaimLines(claimLines.filter((line) => line.id !== id));
    }
  };

  const updateClaimLine = (id: string, field: keyof ClaimLine, value: any) => {
    setClaimLines(
      claimLines.map((line) => {
        if (line.id === id) {
          const updated = { ...line, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.totalAmount = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return line;
      })
    );
  };

  const calculateTotal = () => {
    return claimLines.reduce((sum, line) => sum + line.totalAmount, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        // Reset all fields
        setMemberNumber('');
        setPatientName('');
        setIdNumber('');
        setServiceDate('');
        setClaimType('consultation');
        setReferenceNumber('');
        setClaimLines([
          {
            id: '1',
            diagnosisCode: '',
            procedureCode: '',
            tariffCode: '',
            quantity: 1,
            unitPrice: 0,
            totalAmount: 0,
          },
        ]);
        setDocuments([]);
      }, 3000);
    }, 1500);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit Claim</h1>
          <p className="text-gray-600 mt-1">
            Submit a new claim for services rendered to a patient
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-green-900">Claim Submitted Successfully!</p>
                  <p className="text-sm text-green-700">
                    Claim number: CLM-20240111-{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Enter patient details for claim submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="memberNumber" className="text-sm font-medium">
                    Member Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="memberNumber"
                    placeholder="M-2024-5678"
                    value={memberNumber}
                    onChange={(e) => setMemberNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="patientName" className="text-sm font-medium">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="patientName"
                    placeholder="John Smith"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="idNumber" className="text-sm font-medium">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="idNumber"
                    placeholder="8001015800083"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Information */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Information</CardTitle>
              <CardDescription>Service details and claim type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="serviceDate" className="text-sm font-medium">
                    Service Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="serviceDate"
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="claimType" className="text-sm font-medium">
                    Claim Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="claimType"
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="consultation">Consultation</option>
                    <option value="procedure">Procedure</option>
                    <option value="hospitalization">Hospitalization</option>
                    <option value="pathology">Pathology</option>
                    <option value="radiology">Radiology</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="dental">Dental</option>
                    <option value="optical">Optical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="referenceNumber" className="text-sm font-medium">
                    Reference Number
                  </label>
                  <Input
                    id="referenceNumber"
                    placeholder="Optional internal reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Lines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Claim Lines</CardTitle>
                  <CardDescription>Add diagnosis, procedures, and charges</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addClaimLine}>
                  + Add Line
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claimLines.map((line, index) => (
                  <div key={line.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Line {index + 1}</h4>
                      {claimLines.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeClaimLine(line.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Diagnosis Code <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="ICD-10 (e.g., J00)"
                          value={line.diagnosisCode}
                          onChange={(e) =>
                            updateClaimLine(line.id, 'diagnosisCode', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Procedure Code <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g., 0101"
                          value={line.procedureCode}
                          onChange={(e) =>
                            updateClaimLine(line.id, 'procedureCode', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Tariff Code <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g., NHRPL"
                          value={line.tariffCode}
                          onChange={(e) =>
                            updateClaimLine(line.id, 'tariffCode', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) =>
                            updateClaimLine(line.id, 'quantity', parseInt(e.target.value) || 1)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Unit Price (R) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateClaimLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Line Total</p>
                        <p className="text-lg font-bold">R{line.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Claim Total</p>
                    <p className="text-2xl font-bold text-primary">
                      R{calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>
                Upload invoices, prescriptions, or other supporting documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fileUpload"
                    className="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50"
                  >
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                    </div>
                    <input
                      id="fileUpload"
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Uploaded Files */}
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded Documents ({documents.length})</p>
                    {documents.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/provider/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Required Information:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Valid member number and patient details</li>
                  <li>Service date (must be within last 4 months)</li>
                  <li>ICD-10 diagnosis codes</li>
                  <li>Procedure and tariff codes</li>
                  <li>Accurate pricing information</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Supporting Documents:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Invoice or receipt</li>
                  <li>Prescription (if applicable)</li>
                  <li>Clinical notes (for complex procedures)</li>
                  <li>Pre-authorization approval (if required)</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Claims are typically processed within 5-7 business days. You will receive email
                notifications on claim status updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
