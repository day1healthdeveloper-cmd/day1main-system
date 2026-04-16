'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';
import { getAllClaimTypes, getClaimFormConfig, type ClaimFormConfig } from '@/lib/claim-form-config';
import { uploadClaimDocuments, generateTempClaimNumber } from '@/lib/storage';

export default function MemberClaimSubmissionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimNumber, setClaimNumber] = useState('');
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Get member data from localStorage
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    const memberSession = localStorage.getItem('member_session');
    const memberDataStr = localStorage.getItem('member_data');
    
    if (!memberSession || !memberDataStr) {
      router.push('/member-login');
      return;
    }

    try {
      const data = JSON.parse(memberDataStr);
      setMemberData(data);
    } catch (error) {
      console.error('Error parsing member data:', error);
      router.push('/member-login');
    }
  }, [router]);

  // Claim type selection
  const [selectedBenefitType, setSelectedBenefitType] = useState('doctor_visits');
  const [claimConfig, setClaimConfig] = useState<ClaimFormConfig | null>(null);
  const availableClaimTypes = getAllClaimTypes();

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
  }, [selectedBenefitType]);

  // Update form field value
  const updateFormField = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Calculate total amount
  const calculateTotal = () => {
    if (!claimConfig) return 0;
    
    // Sum all numeric fields that represent amounts
    let total = 0;
    claimConfig.fields.forEach(field => {
      if (field.type === 'number' && formData[field.name]) {
        total += parseFloat(formData[field.name]) || 0;
      }
    });
    return total;
  };

  // Handle document selection
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberData) {
      alert('Member data not found. Please log in again.');
      return;
    }

    // Validate required fields
    if (!claimConfig) {
      alert('Please select a claim type');
      return;
    }

    // Check required fields
    const missingFields = claimConfig.fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Check documents
    if (claimConfig.requiredDocuments.length > 0 && documents.length === 0) {
      alert(`Please upload required documents: ${claimConfig.requiredDocuments.join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Generate temporary claim number
      const tempClaimNumber = generateTempClaimNumber();
      
      // Upload documents
      let documentUrls: string[] = [];
      if (documents.length > 0) {
        setUploadProgress('Uploading documents...');
        documentUrls = await uploadClaimDocuments(tempClaimNumber, documents);
      }

      // Prepare claim data
      const claimData = {
        member_id: memberData.id,
        provider_id: null, // Member-submitted claim (refund claim)
        benefit_type: selectedBenefitType,
        service_date: formData.service_date || new Date().toISOString().split('T')[0],
        claimed_amount: calculateTotal(),
        claim_data: formData,
        document_urls: documentUrls,
        submission_type: 'member_refund'
      };

      setUploadProgress('Submitting claim...');

      // Submit claim
      const response = await fetch('/api/member/claims/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit claim');
      }

      const result = await response.json();
      setClaimNumber(result.claim_number);
      setShowSuccess(true);

    } catch (error) {
      console.error('Error submitting claim:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  if (!memberData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted Successfully!</h2>
                <p className="text-gray-600 mb-6">Your claim has been received and is being processed.</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 mb-1">Claim Number</p>
                  <p className="text-xl font-mono font-bold text-blue-900">{claimNumber}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-8">
                  <p>✓ Your claim will be reviewed within 2-3 business days</p>
                  <p>✓ You'll receive an email notification once processed</p>
                  <p>✓ Track your claim status in "My Claims"</p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/member/claims')}
                  >
                    View My Claims
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowSuccess(false);
                      setFormData({});
                      setDocuments([]);
                      setClaimNumber('');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Another Claim
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submit a Claim</h1>
            <p className="text-gray-600 mt-1">Submit a refund claim for out-of-pocket expenses</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Information */}
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
              <CardDescription>Your details (auto-filled)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Member Number</label>
                  <Input value={memberData.member_number} disabled className="bg-gray-50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input 
                    value={`${memberData.first_name} ${memberData.last_name}`} 
                    disabled 
                    className="bg-gray-50" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Plan</label>
                  <Input value={memberData.plan_name} disabled className="bg-gray-50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input value={memberData.email} disabled className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Type</CardTitle>
              <CardDescription>Select the type of service you received</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={selectedBenefitType}
                onChange={(e) => setSelectedBenefitType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {availableClaimTypes.map((type) => (
                  <option key={type.benefitType} value={type.benefitType}>
                    {type.displayName}
                  </option>
                ))}
              </select>

              {claimConfig?.preAuthRequired && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-800">
                    ⚠️ <strong>Pre-authorization required:</strong> This type of claim requires pre-authorization. 
                    Please ensure you have obtained approval before submitting.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Claim Details */}
          {claimConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Claim Details</CardTitle>
                <CardDescription>Provide information about the service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claimConfig.fields.map((field) => (
                    <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                      <label className="text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.name] || ''}
                          onChange={(e) => updateFormField(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : field.type === 'select' && field.options ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => updateFormField(field.name, e.target.value)}
                          required={field.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select...</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type={field.type}
                          value={formData[field.name] || ''}
                          onChange={(e) => updateFormField(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                          step={field.type === 'number' ? '0.01' : undefined}
                          min={field.type === 'number' ? '0' : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Claimed Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>
                {claimConfig?.requiredDocuments.length 
                  ? `Required: ${claimConfig.requiredDocuments.join(', ')}`
                  : 'Upload relevant documents'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <label className="cursor-pointer">
                    <span className="text-green-600 hover:text-green-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, JPG, PNG up to 10MB each
                  </p>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                    {documents.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{uploadProgress}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
