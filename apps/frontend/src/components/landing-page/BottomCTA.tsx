'use client';

export function BottomCTA() {
  const handleSignup = () => {
    // Scroll to PlanSlider section (View All Our Plans - full screen with glassmorphism card)
    const planSliderSection = document.getElementById('plan-slider-section');
    if (planSliderSection) {
      planSliderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative h-[60vh] flex items-center justify-center px-4 md:px-8 overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: 'url(/hero9.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 15%',
        }}
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      
      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Glass card - matching hero style */}
        <div className="max-w-xl mx-auto bg-white/60 backdrop-blur-[10px] backdrop-saturate-[110%] border border-white/40 rounded-2xl px-8 py-6 text-center">
          {/* Main Headline */}
          <h2 className="text-[34px] md:text-[40px] font-semibold leading-tight tracking-tight text-gray-900 mb-4">
            The{' '}
            <span className="text-emerald-600 font-bold">ONE</span>
            {' '}cover<br />
            that matters{' '}
            <span className="text-emerald-600 font-bold">now.</span>
          </h2>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-700">
            <div className="flex flex-col items-center opacity-75">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center">
                  <img src="/clock48.png" alt="Clock" className="w-[80%] h-[80%] opacity-90" />
                </div>
                <span className="text-gray-900 font-semibold" style={{ fontSize: '15px' }}>60</span>
              </div>
              <p className="text-xs text-center"><span className="text-emerald-600 font-semibold">ONE</span> minute</p>
            </div>
            <div className="flex flex-col items-center opacity-75 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center">
                  <img src="/1h64.png" alt="1 Hour" className="w-[80%] h-[80%] opacity-90" />
                </div>
                <span className="text-gray-900 font-semibold" style={{ fontSize: '15px' }}>1h</span>
              </div>
              <p className="text-xs text-center"><span className="text-emerald-600 font-semibold">ONE</span> hour</p>
            </div>
            <div className="flex flex-col items-center opacity-75 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center">
                  <img src="/day1.png" alt="Day 1" className="w-[80%] h-[80%] opacity-90" />
                </div>
                <span className="text-gray-900 font-semibold" style={{ fontSize: '15px' }}>Day1</span>
              </div>
              <p className="text-xs text-center">Covered in <span className="text-emerald-600 font-semibold">ONE</span> day</p>
            </div>
          </div>
          
          {/* CTA Button */}
          <button 
            onClick={handleSignup}
            className="block w-full text-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-lg mb-3"
          >
            Start your 1-minute signup
          </button>
          
          <p className="text-gray-600 text-xs">
            No pressure. No confusion. Just cover that matters now.
          </p>
        </div>
      </div>
    </section>
  );
}
