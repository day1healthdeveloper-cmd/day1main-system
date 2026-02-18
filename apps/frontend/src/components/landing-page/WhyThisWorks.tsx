'use client';

import { useEffect, useState, useRef } from 'react';

export function WhyThisWorks() {
  const [step1Visible, setStep1Visible] = useState(false);
  const [line1Visible, setLine1Visible] = useState(false);
  const [step2Visible, setStep2Visible] = useState(false);
  const [line2Visible, setLine2Visible] = useState(false);
  const [step3Visible, setStep3Visible] = useState(false);
  const [circle1Pop, setCircle1Pop] = useState(false);
  const [circle2Pop, setCircle2Pop] = useState(false);
  const [circle3Pop, setCircle3Pop] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start animation sequence
            setTimeout(() => setStep1Visible(true), 200);
            setTimeout(() => setLine1Visible(true), 800);
            setTimeout(() => setStep2Visible(true), 1600);
            setTimeout(() => setLine2Visible(true), 2200);
            setTimeout(() => setStep3Visible(true), 3000);
            // Pop animations after all steps are visible
            setTimeout(() => setCircle1Pop(true), 3400);
            setTimeout(() => setCircle2Pop(true), 4400);
            setTimeout(() => setCircle3Pop(true), 5400);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-16 px-4 md:px-6 overflow-hidden bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pick the <span className="text-green-600">ONE</span> cover you need. We'll show you the plan.
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              Traditional medical aid makes you choose a full plan first. Day1Health flips that.
            </p>
          </div>
        </div>

        {/* 3-Step Process with Squiggly Lines */}
        <div className="relative mt-16">
          {/* Squiggly connecting lines */}
          <div className="hidden md:block absolute top-[60px] left-0 right-0 h-[40px] pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 4" preserveAspectRatio="none">
              {/* First squiggly line - between step 1 and 2 */}
              <path 
                d="M 20,2 Q 23,0.5 26,2 T 32,2 T 38,2 T 44,2 T 47,2" 
                fill="none" 
                stroke="#9ca3af" 
                strokeWidth="0.3" 
                strokeDasharray="1,1"
                className={`transition-all duration-700 ${line1Visible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  strokeDasharray: line1Visible ? '1,1' : '100',
                  strokeDashoffset: line1Visible ? '0' : '100',
                }}
              />
              {/* Second squiggly line - between step 2 and 3 */}
              <path 
                d="M 53,2 Q 56,0.5 59,2 T 65,2 T 71,2 T 77,2 T 80,2" 
                fill="none" 
                stroke="#9ca3af" 
                strokeWidth="0.3" 
                strokeDasharray="1,1"
                className={`transition-all duration-700 ${line2Visible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  strokeDasharray: line2Visible ? '1,1' : '100',
                  strokeDashoffset: line2Visible ? '0' : '100',
                }}
              />
            </svg>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className={`flex flex-col items-center text-center transition-all duration-700 ${step1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="mb-4 text-2xl font-bold text-gray-900">1</div>
              <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 relative z-10 border-2 border-gray-200 shadow-sm transition-transform duration-300 ${circle1Pop ? 'animate-pop' : ''}`}>
                <img src="/animated icons/pick 1 cover first.gif" alt="Pick One Cover" className="w-12 h-12 opacity-60" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pick ONE cover first</h3>
              <p className="text-sm text-gray-600">
                Start with what matters most to you right now
              </p>
            </div>

            {/* Step 2 */}
            <div className={`flex flex-col items-center text-center transition-all duration-700 ${step2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="mb-4 text-2xl font-bold text-gray-900">2</div>
              <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 relative z-10 border-2 border-gray-200 shadow-sm transition-transform duration-300 ${circle2Pop ? 'animate-pop' : ''}`}>
                <img src="/animated icons/layers.gif" alt="Layers" className="w-12 h-12 opacity-60" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">See plans that include it</h3>
              <p className="text-sm text-gray-600">
                We match you to plans with your chosen cover
              </p>
            </div>

            {/* Step 3 */}
            <div className={`flex flex-col items-center text-center transition-all duration-700 ${step3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="mb-4">
                <img src="/animated icons/umbrella.gif" alt="Protection" className="w-12 h-12 opacity-60" />
              </div>
              <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 relative z-10 border-2 border-gray-200 shadow-sm transition-transform duration-300 ${circle3Pop ? 'animate-pop' : ''}`}>
                <img src="/animated icons/one.gif" alt="One" className="w-12 h-12 opacity-60" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Covered from Day 1</h3>
              <p className="text-sm text-gray-600">
                No waiting periods. Protection starts immediately
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
