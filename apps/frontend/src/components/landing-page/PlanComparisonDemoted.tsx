'use client';

import { PlanSlider } from './PlanSlider';
import { useEffect, useState } from 'react';

export function PlanComparisonDemoted() {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  useEffect(() => {
    // Listen for plan selection events
    const handlePlanSelect = (event: CustomEvent) => {
      setSelectedPlanIndex(event.detail.planIndex);
    };

    window.addEventListener('selectPlan' as any, handlePlanSelect);
    return () => window.removeEventListener('selectPlan' as any, handlePlanSelect);
  }, []);

  return (
    <section id="plan-comparison-section" className="py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Plan Slider */}
        <div>
          <PlanSlider initialSlide={selectedPlanIndex} />
        </div>
      </div>
    </section>
  );
}
