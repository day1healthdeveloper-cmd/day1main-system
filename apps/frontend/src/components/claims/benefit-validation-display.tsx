import { BenefitValidationResponse } from '@/types/benefit-validation';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { WaitingPeriodTimeline } from './waiting-period-timeline';

interface BenefitValidationDisplayProps {
  validation: BenefitValidationResponse;
}

export function BenefitValidationDisplay({ validation }: BenefitValidationDisplayProps) {
  if (!validation.valid && validation.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Benefit Not Available</p>
            <p className="text-sm text-red-700 mt-1">{validation.error}</p>
            {validation.reason && (
              <p className="text-xs text-red-600 mt-1 font-mono">
                Reason: {validation.reason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!validation.member || !validation.benefit || !validation.usage) {
    return null;
  }

  const { member, benefit, usage, validation: checks, warnings } = validation;

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <div className={`border rounded-lg p-4 ${
        validation.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          {validation.valid ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${validation.valid ? 'text-green-900' : 'text-yellow-900'}`}>
              {validation.valid ? 'Benefit Available' : 'Benefit Available with Warnings'}
            </p>
            <p className={`text-sm mt-1 ${validation.valid ? 'text-green-700' : 'text-yellow-700'}`}>
              {benefit.name} is covered under {member.planName}
            </p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, idx) => (
            <div 
              key={idx}
              className={`border rounded-lg p-3 ${
                warning.severity === 'error' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  warning.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <p className={`text-sm ${
                  warning.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {warning.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Benefit Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Waiting Period */}
        {benefit.waitingPeriodDays > 0 && (
          <div className={`border rounded-lg p-4 ${
            benefit.waitingPeriodPassed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`w-4 h-4 ${benefit.waitingPeriodPassed ? 'text-green-600' : 'text-orange-600'}`} />
              <p className="text-sm font-medium text-gray-700">General Waiting Period</p>
            </div>
            <div>
              {benefit.waitingPeriodPassed ? (
                <>
                  <p className="text-2xl font-bold text-green-600">Passed ✓</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ended on {new Date(benefit.waitingPeriodEndDate).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-orange-600">{benefit.waitingPeriodRemaining} days</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ends on {new Date(benefit.waitingPeriodEndDate).toLocaleDateString()}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-orange-500"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, ((benefit.waitingPeriodDays - benefit.waitingPeriodRemaining) / benefit.waitingPeriodDays) * 100))}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {Math.round(((benefit.waitingPeriodDays - benefit.waitingPeriodRemaining) / benefit.waitingPeriodDays) * 100)}% complete
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Pre-Existing Condition Exclusion */}
        {benefit.preExistingExclusionDays > 0 && (
          <div className={`border rounded-lg p-4 ${
            benefit.preExistingExclusionPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-4 h-4 ${benefit.preExistingExclusionPassed ? 'text-green-600' : 'text-red-600'}`} />
              <p className="text-sm font-medium text-gray-700">Pre-Existing Exclusion</p>
            </div>
            <div>
              {benefit.preExistingExclusionPassed ? (
                <>
                  <p className="text-2xl font-bold text-green-600">Passed ✓</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ended on {new Date(benefit.preExistingExclusionEndDate).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-red-600">{benefit.preExistingExclusionRemaining} days</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ends on {new Date(benefit.preExistingExclusionEndDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-red-700 mt-2">
                    Pre-existing conditions not covered during this period
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Annual Limit */}
        <div className={`border rounded-lg p-4 ${
          benefit.annualLimit === 0 ? 'md:col-span-2' : ''
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <p className="text-sm font-medium text-gray-700">Annual Limit</p>
          </div>
          {benefit.annualLimit > 0 ? (
            <div>
              <p className="text-2xl font-bold">
                R{usage.remainingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                of R{benefit.annualLimit.toLocaleString()} remaining
              </p>
              {/* Progress Bar */}
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    usage.percentageUsed >= 90 ? 'bg-red-500' :
                    usage.percentageUsed >= 70 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usage.percentageUsed, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {usage.percentageUsed}% used
              </p>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-green-600">Unlimited</p>
              <p className="text-xs text-gray-600 mt-1">No annual limit applies</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Summary */}
      {usage.hasUsage && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-3">Usage Summary ({usage.year})</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Used</p>
              <p className="font-medium">R{usage.usedAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{usage.usedCount} claims</p>
            </div>
            <div>
              <p className="text-gray-600">Remaining</p>
              <p className="font-medium">R{usage.remainingAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{usage.remainingCount} available</p>
            </div>
            <div>
              <p className="text-gray-600">Total Limit</p>
              <p className="font-medium">
                {benefit.annualLimit > 0 ? `R${benefit.annualLimit.toLocaleString()}` : 'Unlimited'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Waiting Period Timeline */}
      {(benefit.waitingPeriodDays > 0 || benefit.preExistingExclusionDays > 0) && (
        <WaitingPeriodTimeline
          memberStartDate={member.startDate}
          daysSinceStart={member.daysSinceStart}
          waitingPeriodDays={benefit.waitingPeriodDays}
          waitingPeriodPassed={benefit.waitingPeriodPassed}
          waitingPeriodEndDate={benefit.waitingPeriodEndDate}
          preExistingExclusionDays={benefit.preExistingExclusionDays}
          preExistingExclusionPassed={benefit.preExistingExclusionPassed}
          preExistingExclusionEndDate={benefit.preExistingExclusionEndDate}
        />
      )}

      {/* Member Info */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <p>Member: {member.memberNumber} | Plan: {member.planName}</p>
        <p>Member since: {new Date(member.startDate).toLocaleDateString()} ({member.daysSinceStart} days)</p>
      </div>
    </div>
  );
}
