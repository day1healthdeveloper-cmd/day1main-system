'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PreAuthSubmissionPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Patient Information
  const [memberNumber, setMemberNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Pre-Auth Information
  const [procedureType, setProcedureType] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('');
  const [procedureCode, setProcedureCode] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [urgency, setUrgency] = useState('routine');

  // Clinical Information
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

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
        setProcedureType('');
        setDiagnosisCode('');
        setProcedureCode('');
        setProposedDate('');
        setEstimatedCost('');
        setUrgency('routine');
        setClinicalNotes('');
        setMedicalHistory('');
        setTreatmentPlan('');
        setDocuments([]);
      }, 3000);
    }, 1500);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Pre-Authorization</h1>
          <p className="text-gray-600 mt-1">
            Submit a pre-authorization request for planned procedures
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
                  <p className="font-medium text-green-900">
                    Pre-Authorization Request Submitted!
                  </p>
                  <p className="text-sm text-green-700">
                    Reference: PA-20240111-{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}
                  </p>
                  <p className="text-sm text-green-700">
                    You will receive a response within 24-48 hours
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
              <CardDescription>Enter patient details for pre-authorization</CardDescription>
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

          {/* Procedure Information */}
          <Card>
            <CardHeader>
              <CardTitle>Procedure Information</CardTitle>
              <CardDescription>Details of the planned procedure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="procedureType" className="text-sm font-medium">
                      Procedure Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="procedureType"
                      value={procedureType}
                      onChange={(e) => setProcedureType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select procedure type</option>
                      <option value="surgery">Surgery</option>
                      <option value="hospitalization">Hospitalization</option>
                      <option value="specialist_consultation">Specialist Consultation</option>
                      <option value="diagnostic_imaging">Diagnostic Imaging (MRI, CT)</option>
                      <option value="oncology">Oncology Treatment</option>
                      <option value="chronic_medication">Chronic Medication</option>
                      <option value="dental_procedure">Dental Procedure</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="urgency" className="text-sm font-medium">
                      Urgency <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="urgency"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="routine">Routine (7+ days)</option>
                      <option value="urgent">Urgent (2-7 days)</option>
                      <option value="emergency">Emergency (within 24 hours)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="diagnosisCode" className="text-sm font-medium">
                      Diagnosis Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="diagnosisCode"
                      placeholder="ICD-10 (e.g., C50.9)"
                      value={diagnosisCode}
                      onChange={(e) => setDiagnosisCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="procedureCode" className="text-sm font-medium">
                      Procedure Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="procedureCode"
                      placeholder="e.g., 3001"
                      value={procedureCode}
                      onChange={(e) => setProcedureCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="estimatedCost" className="text-sm font-medium">
                      Estimated Cost (R) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="proposedDate" className="text-sm font-medium">
                    Proposed Procedure Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="proposedDate"
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Information</CardTitle>
              <CardDescription>
                Provide detailed clinical justification for the procedure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="clinicalNotes" className="text-sm font-medium">
                    Clinical Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="clinicalNotes"
                    rows={4}
                    placeholder="Describe the patient's condition and symptoms..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="medicalHistory" className="text-sm font-medium">
                    Relevant Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    rows={3}
                    placeholder="Previous treatments, chronic conditions, allergies..."
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="treatmentPlan" className="text-sm font-medium">
                    Treatment Plan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="treatmentPlan"
                    rows={4}
                    placeholder="Describe the proposed treatment and expected outcomes..."
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>
                Upload clinical notes, test results, or specialist referrals
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
              {isSubmitting ? 'Submitting...' : 'Submit Pre-Authorization Request'}
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
            <CardTitle>Pre-Authorization Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">When is Pre-Authorization Required?</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>All surgical procedures</li>
                  <li>Hospital admissions (planned)</li>
                  <li>Specialist consultations (certain plans)</li>
                  <li>Advanced diagnostic imaging (MRI, CT, PET scans)</li>
                  <li>Oncology treatments</li>
                  <li>Chronic medication (high-cost)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Response Times:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Routine requests: 48-72 hours</li>
                  <li>Urgent requests: 24 hours</li>
                  <li>Emergency requests: 4-6 hours</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Required Documentation:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Detailed clinical notes</li>
                  <li>Relevant test results or imaging</li>
                  <li>Specialist referral letter (if applicable)</li>
                  <li>Treatment plan and cost estimate</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Incomplete requests may be returned for additional information, delaying approval.
                Ensure all required fields and documents are provided.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
