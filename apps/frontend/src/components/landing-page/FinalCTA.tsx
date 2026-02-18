export function FinalCTA() {
  const handleSignup = () => {
    // Scroll to PlanSlider section (View All Our Plans - full screen with glassmorphism card)
    const planSliderSection = document.getElementById('plan-slider-section');
    if (planSliderSection) {
      planSliderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative py-20 px-4 md:px-8 bg-green-600 overflow-hidden">
      <div
        className="absolute inset-0 opacity-60 mix-blend-overlay"
        style={{
          backgroundImage: 'url(/bg-pattern.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
        }}
      />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          1 minute. 1 hour. Day1 covered.
        </h2>
        <button 
          onClick={handleSignup}
          className="px-8 py-4 bg-white text-green-600 text-lg font-semibold rounded-full hover:bg-slate-50 transition-colors shadow-lg mb-4"
        >
          Start your 1-minute signup
        </button>
        <p className="text-lg text-white/90">
          No pressure. No confusion. Just cover that matters now.
        </p>
      </div>
    </section>
  );
}
