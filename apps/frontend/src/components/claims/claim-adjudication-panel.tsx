/**
 * Claim Adjudication Panel
 * Provides UI for claims assessors to approve, reject, or pend claims
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, XCircle, Calculator } from 'lucide-react';
import { getAllRejectionCodes, getPendReasons, type RejectionCode } from '@/lib/rejection-codes';
import { calculateBenefitAmount, validateClaimAmount, calculateFraudRiskScore, requiresManualReview, type BenefitCalculationResult } from '@/lib/benefit-calculation';

interface ClaimAdjudicationPanelProps {
  claim: {
    id: string;
    claim_number: string;
    claimed_amount: string;
    benefit_type: string;
    service_date: string;
    submission_date: string;
    icd10_codes?: string[];
    tariff_codes?: string[];
    is_pmb: boolean;
    pre_auth_number?: string;
    pre_auth_required: boolean;
    fraud_risk_score: number;
    document_urls?: string[];
    member: {
      plan_id?: string;
    };
    provider?: {
      provider_tier?: string;
    };
  };
  onAction: (action: 'approve' | 'reject' | 'pend', data: any) => Promise<void>;
  onClose: () => void;
}

export function ClaimAdjudicationPanel({ claim, onAction, onClose }: ClaimAdjudicationPanelProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'pend' | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Approval fields
  const [approvedAmount, setApprovedAmount] = useState(claim.claimed_amount);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [calculation, setCalculation] = useState<BenefitCalculationResult | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Rejection fields
  const [rejectionCode, setRejectionCode] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Pend fields
  const [pendReason, setPendReason] = useState('');
  const [additionalInfoRequested, setAdditionalInfoRequested] = useState('');
  
  // Validation
  const [amountValidation, setAmountValidation] = useState<{ valid: boolean; warning?: string }>({ valid: true });
  const [fraudAnalysis, setFraudAnalysis] = useState<{ score: number; factors: string[] } | null>(null);
  const [manualReviewRequired, setManualReviewRequired] = useState<{ required: boolean; reason: string } | null>(null);

  const rejectionCodes = getAllRejectionCodes();
  const pendReasons = getPendReasons();
  
  // Group rejection codes by category
  const rejectionCodesByCategory = rejectionCodes.reduce((acc, code) => {
    if (!acc[code.category]) {
      acc[code.category] = [];
    }
    acc[code.category].push(code);
    return acc;
  }, {} as Record<string, RejectionCode[]>);

  // Run validations on mount
  useEffect(() => {
    // Validate claim amount
    const validation = validateClaimAmount(parseFloat(claim.claimed_amount), claim.benefit_type);
    setAmountValidation(validation);

    // Calculate fraud risk
    const fraud = calculateFraudRiskScore({
      claimedAmount: parseFloat(claim.claimed_amount),
      benefitType: claim.benefit_type,
      serviceDate: claim.service_date,
      submissionDate: claim.submission_date,
      hasDocumentation: (claim.document_urls?.length || 0) > 0
    });
    setFraudAnalysis(fraud);

    // Check if manual review required
    const review = requiresManualReview({
      claimedAmount: parseFloat(claim.claimed_amount),
      benefitType: claim.benefit_type,
      fraudRiskScore: fraud.score,
      isPMB: claim.is_pmb,
      hasPreAuth: !!claim.pre_auth_number,
      preAuthRequired: claim.pre_auth_required
    });
    setManualReviewRequired(review);
  }, [claim]);

  // Calculate benefit amount
  const handleCalculateBenefit = async () => {
    try {
      const result = await calculateBenefitAmount({
        claimedAmount: parseFloat(claim.claimed_amount),
        benefitType: claim.benefit_type,
        memberPlanId: claim.member.plan_id || '',
        serviceDate: claim.service_date,
        icd10Codes: claim.icd10_codes,
        tariffCodes: claim.tariff_codes,
        isPMB: claim.is_pmb,
        providerTier: claim.provider?.provider_tier as any
      });
      
      setCalculation(result);
      setApprovedAmount(result.approvedAmount.toFixed(2));
      setShowCalculation(true);
    } catch (error) {
      console.error('Error calculating benefit:', error);
      alert('Failed to calculate benefit amount');
    }
  };

  const handleSubmit = async () => {
    if (!action) return;

    // Validation
    if (action === 'approve') {
      if (!approvedAmount || parseFloat(approvedAmount) <= 0) {
        alert('Please enter a valid approved amount');
        return;
      }
      if (parseFloat(approvedAmount) > parseFloat(claim.claimed_amount)) {
        const confirm = window.confirm(
          'Approved amount exceeds claimed amount. Are you sure you want to continue?'
        );
        if (!confirm) return;
      }
    }

    if (action === 'reject') {
      if (!rejectionCode) {
        alert('Please select a rejection code');
        return;
      }
      if (!rejectionReason.trim()) {
        alert('Please provide a rejection reason');
        return;
      }
    }

    if (action === 'pend') {
      if (!pendReason) {
        alert('Please select a pend reason');
        return;
      }
      if (!additionalInfoRequested.trim()) {
        alert('Please specify what additional information is required');
        return;
      }
    }

    setLoading(true);
    try {
      const data: any = {};
      
      if (action === 'approve') {
        data.approved_amount = parseFloat(approvedAmount);
        data.approval_notes = approvalNotes;
        if (calculation) {
          data.calculation_details = calculation;
        }
      } else if (action === 'reject') {
        data.rejection_code = rejectionCode;
        data.rejection_reason = rejectionReason;
      } else if (action === 'pend') {
        data.pended_reason = pendReason;
        data.additional_info_requested = additionalInfoRequested;
      }
      
      await onAction(action, data);
      onClose();
    } catch (error) {
      console.error(`Error ${action}ing claim:`, error);
      alert(`Failed to ${action} claim. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Alerts */}
      {!amountValidation.valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Amount Validation Failed</p>
              <p className="text-sm text-red-700 mt-1">{amountValidation.warning}</p>
            </div>
          </div>
        </div>
      )}

      {amountValidation.valid && amountValidation.warning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-900">Amount Warning</p>
              <p className="text-sm text-yellow-700 mt-1">{amountValidation.warning}</p>
            </div>
          </div>
        </div>
      )}

      {fraudAnalysis && fraudAnalysis.score > 50 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-900">High Fraud Risk Score: {fraudAnalysis.score}/100</p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                {fraudAnalysis.factors.map((factor, idx) => (
                  <li key={idx}>• {factor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {manualReviewRequired && manualReviewRequired.required && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Manual Review Required</p>
              <p className="text-sm text-blue-700 mt-1">{manualReviewRequired.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Selection */}
      {!action && (
        <Card>
          <CardHeader>
            <CardTitle>Select Action</CardTitle>
            <CardDescription>Choose how to process this claim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setAction('approve')}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-8 h-8" />
                <span>Approve Claim</span>
              </Button>
              <Button
                onClick={() => setAction('pend')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Clock className="w-8 h-8" />
                <span>Pend for Info</span>
              </Button>
              <Button
                onClick={() => setAction('reject')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-8 h-8" />
                <span>Reject Claim</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Form */}
      {action === 'approve' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Approve Claim
                </CardTitle>
                <CardDescription>Set approved amount and add notes</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAction(null)}>
                Change Action
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Benefit Calculator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <p className="font-medium text-blue-900">Benefit Calculator</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCalculateBenefit}
                  disabled={showCalculation}
                >
                  {showCalculation ? 'Calculated' : 'Calculate'}
                </Button>
              </div>
              <p className="text-sm text-blue-700">
                Calculate the approved amount based on plan benefits, tariff rates, and co-payments
              </p>
            </div>

            {/* Calculation Results */}
            {showCalculation && calculation && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Calculation Breakdown</h4>
                <div className="space-y-2">
                  {calculation.calculation.map((step, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{step.step}</span>
                      <span className="font-medium">R{step.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Scheme Payment</p>
                      <p className="text-lg font-bold text-green-600">
                        R{calculation.schemePayment.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Member Responsibility</p>
                      <p className="text-lg font-bold text-orange-600">
                        R{calculation.memberResponsibility.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                {calculation.adjustmentReason && (
                  <p className="text-xs text-gray-600 italic">
                    Note: {calculation.adjustmentReason}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Claimed Amount
              </label>
              <Input
                type="text"
                value={`R${parseFloat(claim.claimed_amount).toLocaleString()}`}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Approved Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                step="0.01"
                min="0"
                max={claim.claimed_amount}
                placeholder="Enter approved amount"
              />
              {parseFloat(approvedAmount) < parseFloat(claim.claimed_amount) && (
                <p className="text-xs text-orange-600">
                  Shortfall: R{(parseFloat(claim.claimed_amount) - parseFloat(approvedAmount)).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Approval Notes</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Add any notes about this approval..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : 'Approve Claim'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Form */}
      {action === 'reject' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Reject Claim
                </CardTitle>
                <CardDescription>Select rejection code and provide reason</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAction(null)}>
                Change Action
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rejection Category <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setRejectionCode('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select category...</option>
                <option value="coverage">Coverage Issues</option>
                <option value="documentation">Documentation Issues</option>
                <option value="authorization">Authorization Issues</option>
                <option value="eligibility">Eligibility Issues</option>
                <option value="duplicate">Duplicate Claims</option>
                <option value="fraud">Fraud/Abuse</option>
                <option value="other">Other</option>
              </select>
            </div>

            {selectedCategory && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rejection Code <span className="text-red-500">*</span>
                </label>
                <select
                  value={rejectionCode}
                  onChange={(e) => setRejectionCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select rejection code...</option>
                  {rejectionCodesByCategory[selectedCategory]?.map((code) => (
                    <option key={code.code} value={code.code}>
                      {code.code} - {code.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Provide detailed reason for rejection..."
                required
              />
              <p className="text-xs text-gray-500">
                This reason will be communicated to the provider/member
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Processing...' : 'Reject Claim'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pend Form */}
      {action === 'pend' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Pend Claim
                </CardTitle>
                <CardDescription>Request additional information</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAction(null)}>
                Change Action
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Pend Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={pendReason}
                onChange={(e) => setPendReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select reason...</option>
                {pendReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Additional Information Required <span className="text-red-500">*</span>
              </label>
              <textarea
                value={additionalInfoRequested}
                onChange={(e) => setAdditionalInfoRequested(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Specify what additional information or documentation is needed..."
                required
              />
              <p className="text-xs text-gray-500">
                Be specific about what is needed to process this claim
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Processing...' : 'Pend Claim'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
