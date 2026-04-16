import { useState } from 'react';
import { BenefitValidationRequest, BenefitValidationResponse } from '@/types/benefit-validation';

export function useBenefitValidation() {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<BenefitValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateBenefit = async (request: BenefitValidationRequest): Promise<BenefitValidationResponse | null> => {
    setValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await fetch('/api/claims/validate-benefit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data: BenefitValidationResponse = await response.json();
      
      setValidationResult(data);
      
      if (!response.ok && !data.valid) {
        setError(data.error || 'Validation failed');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate benefit';
      setError(errorMessage);
      return null;
    } finally {
      setValidating(false);
    }
  };

  const clearValidation = () => {
    setValidationResult(null);
    setError(null);
  };

  return {
    validateBenefit,
    validating,
    validationResult,
    error,
    clearValidation
  };
}
