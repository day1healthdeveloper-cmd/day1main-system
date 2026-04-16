'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllClaimTypes, getClaimFormConfig, type ClaimFormConfig, type ClaimFormField } from '@/lib/claim-form-config';
import { uploadClaimDocuments, generateTempClaimNumber } from '@/lib/storage';
import { useBenefitValidation } from '@/hooks/useBenefitValidation';
import { BenefitValidationDisplay } from '@/components/claims/benefit-validation-display';

export default function ClaimSubmissionPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimNumber, setClaimNumber] = useState('');
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Benefit validation
  const { validateBenefit, validating, validationResult, clearValidation } = useBenefitValidation();
  const [showValidation, setShowValidation] = useState(false);

  // Claim type selection
  const [selectedBenefitType, setSelectedBenefitType] = useState('doctor_visits');
  const [claimConfig, setClaimConfig] = useState<ClaimFormConfig | null>(null);
  const availableClaimTypes = getAllClaimTypes();

  // Patient Information
  const [memberNumber, setMemberNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Dynamic form data based on selected claim type
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Documents
  const [documents, setDocuments] = useState<File[]>([]);

  // Update claim config when benefit type changes
  useEffect(() => {
    const config = getClaimFormConfig(selectedBenefitType);
    setClaimConfig(config);
    // Reset form data with default values
    const initialData: Record<string, any> = {};
    config?.fields.forEach(field => {
      initialData[field.name] = field.type === 'number' ? 0 : '';
    });
    setFormData(initialData);
    // Clear validation when benefit type changes
    clearValidation();
    setShowValidation(false);
  }, [selectedBenefitType]);

  // Update form field value
  const updateFormField = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear validation when form changes
    if (showValidation) {
      setShowValidation(false);
      clearValidation();
    }
  };

  // Validate benefit eligibility
  const handleValidateBenefit = async () => {
    if (!memberNumber) {
      alert('Please enter a member number first');
      return;
    }

    const result = await validateBenefit({
      memberNumber,
      benefitType: selectedBenefitType,
      claimedAmount: calculateTotal()
    });

    if (result) {
      setShowValidation(true);
    }
  };

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

  // Render form field based on config
  const renderFormField = (field: ClaimFormField) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <select
            id={field.name}
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            required={field.required}
            placeholder={field.label}
          />
        );
      
      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            value={value}
            onChange={(e) => updateFormField(field.name, parseFloat(e.target.value) || 0)}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            step="0.01"
          />
        );
      
      case 'date':
        return (
          <Input
            id={field.name}
            type="date"
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            required={field.required}
            max={new Date().toISOString().split('T')[0]}
          />
        );
      
      default:
        return (
          <Input
            id={field.name}
            type="text"
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            required={field.required}
            placeholder={field.label}
            pattern={field.validation?.pattern}
          />
        );
    }
  };

  const calculateTotal = () => {
    // Get claimed amount from form data
    return parseFloat(formData.claimedAmount || 0);
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

    // Check if benefit validation has been performed
    if (!showValidation || !validationResult) {
      const shouldContinue = window.confirm(
        'You have not checked benefit eligibility. Do you want to continue without validation?'
      );
      if (!shouldContinue) return;
    }

    // Warn if validation shows issues
    if (validationResult && !validationResult.valid) {
      const shouldContinue = window.confirm(
        `Warning: ${validationResult.error || 'Benefit validation failed'}. Do you want to submit anyway?`
      );
      if (!shouldContinue) return;
    }

    // Warn if there are validation warnings
    if (validationResult?.warnings && validationResult.warnings.length > 0) {
      const warningMessages = validationResult.warnings.map(w => w.message).join('\n');
      const shouldContinue = window.confirm(
        `Warning:\n${warningMessages}\n\nDo you want to submit anyway?`
      );
      if (!shouldContinue) return;
    }

    setIsSubmitting(true);
    setUploadProgress('');

    try {
      // Upload documents first if any
      let documentUrls: string[] = [];
      
      if (documents.length > 0) {
        setUploadProgress(`Uploading ${documents.length} document(s)...`);
        
        // Generate temporary claim number for uploads
        const tempClaimNumber = generateTempClaimNumber();
        
        try {
          documentUrls = await uploadClaimDocuments(documents, tempClaimNumber);
          setUploadProgress(`Documents uploaded successfully`);
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
          alert('Failed to upload documents. Please try again.');
          setIsSubmitting(false);
          setUploadProgress('');
          return;
        }
      }

      setUploadProgress('Submitting claim...');

      const response = await fetch('/api/provider/claims/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: user.id,
          memberNumber,
          patientName,
          idNumber,
          benefitType: selectedBenefitType,
          claimType: claimConfig?.displayName,
          formData,
          totalAmount: calculateTotal(),
          documentUrls
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to submit claim');
        setIsSubmitting(false);
        setUploadProgress('');
        return;
      }

      setClaimNumber(data.claimNumber);
      setIsSubmitting(false);
      setShowSuccess(true);
      setUploadProgress('');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/provider/claims/history');
      }, 3000);
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Failed to submit claim. Please try again.');
      setIsSubmitting(false);
      setUploadProgress('');
    }
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
                    Claim number: {claimNumber}
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
                    placeholder="DAY1XXXXXXX"
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

          {/* Claim Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Type</CardTitle>
              <CardDescription>Select the type of service provided</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label htmlFor="claimType" className="text-sm font-medium">
                  Claim Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="claimType"
                  value={selectedBenefitType}
                  onChange={(e) => setSelectedBenefitType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {availableClaimTypes.map((type) => (
                    <option key={type.benefitType} value={type.benefitType}>
                      {type.displayName}
                    </option>
                  ))}
                </select>
                {claimConfig && (
                  <p className="text-sm text-gray-600 mt-2">{claimConfig.description}</p>
                )}
                {claimConfig?.preAuthRequired && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Pre-Authorization Required</p>
                        <p className="text-sm text-yellow-700">This claim type requires pre-authorization before submission.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Claim Form Fields */}
          {claimConfig && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Claim Details</CardTitle>
                    <CardDescription>Enter service details for {claimConfig.displayName}</CardDescription>
                  </div>
                  {memberNumber && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleValidateBenefit}
                      disabled={validating || !memberNumber}
                    >
                      {validating ? 'Validating...' : 'Check Eligibility'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claimConfig.fields.map((field) => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label htmlFor={field.name} className="text-sm font-medium block mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderFormField(field)}
                      {field.validation?.message && (
                        <p className="text-xs text-gray-500 mt-1">{field.validation.message}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Amount Display */}
                {formData.claimedAmount > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Claim Total</p>
                        <p className="text-2xl font-bold text-primary">
                          R{parseFloat(formData.claimedAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Benefit Validation Result */}
          {showValidation && validationResult && (
            <Card>
              <CardHeader>
                <CardTitle>Benefit Eligibility Check</CardTitle>
                <CardDescription>Validation result for {claimConfig?.displayName}</CardDescription>
              </CardHeader>
              <CardContent>
                <BenefitValidationDisplay validation={validationResult} />
              </CardContent>
            </Card>
          )}

          {/* Required Documents Checklist */}
          {claimConfig && claimConfig.requiredDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>
                  Please ensure you have the following documents ready for upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {claimConfig.requiredDocuments.map((doc) => (
                    <li key={doc} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm capitalize">{doc.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Supporting Documents Upload */}
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
              {isSubmitting ? (uploadProgress || 'Submitting...') : 'Submit Claim'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/provider/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{uploadProgress}</span>
            </div>
          )}
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
                  <li>ICD-10 diagnosis codes (where applicable)</li>
                  <li>Procedure codes</li>
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
