'use client';

import { Counter } from '@/components/ui/counter';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center px-4 md:px-8 overflow-hidden">
      {/* Full-screen background image */}
      <div 
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: 'url(/hero9.jpg)',
          backgroundSize: '100% auto',
          backgroundPosition: 'center -75px',
        }}
      />
      
      {/* Text rail - premium backing layer */}
      <div className="relative md:absolute md:left-12 md:top-1/2 md:-translate-y-1/2 md:mt-[150px] max-w-xl bg-white/60 backdrop-blur-[10px] backdrop-saturate-[110%] border border-white/40 rounded-2xl px-8 py-4">
        {/* Main Headline */}
        <h1 className="text-[34px] md:text-[40px] font-semibold leading-tight tracking-tight text-gray-900 mb-2">
          The{' '}
          <span className="text-emerald-600 font-bold">ONE</span>
          {' '}cover<br />
          that matters{' '}
          <span className="text-emerald-600 font-bold">now.</span>
        </h1>
        
        {/* Proof indicators - confirmation style */}
        <div className="flex gap-6 mt-3 text-sm text-gray-700">
          <div className="flex flex-col items-center opacity-75">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/clock48.png" alt="Clock" className="w-[80%] h-[80%] opacity-90" />
              </div>
              <Counter start={60} end={1} duration={60} fontSize={15} className="text-gray-900 font-semibold" />
            </div>
            <p className="text-xs text-center"><span className="text-emerald-600 font-semibold">ONE</span> minute registration</p>
          </div>
          
          <div className="flex flex-col items-center opacity-75 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/1h64.png" alt="1 Hour" className="w-[80%] h-[80%] opacity-90" />
              </div>
              <span className="text-gray-900 font-semibold" style={{ fontSize: '15px' }}>1h</span>
            </div>
            <p className="text-xs text-center mt-[7px]"><span className="text-emerald-600 font-semibold">ONE</span> hour confirmed</p>
          </div>
          
          <div className="flex flex-col items-center opacity-75 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/day1.png" alt="Day 1" className="w-[80%] h-[80%] opacity-90" />
              </div>
              <span className="text-gray-900 font-semibold" style={{ fontSize: '15px' }}>Day1</span>
            </div>
            <p className="text-xs text-center mt-[7px]">Covered in <span className="text-emerald-600 font-semibold">ONE</span> day</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
