export function FinalCTA() {
  return (
    <section className="relative py-20 px-4 md:px-8 bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-60 mix-blend-overlay"
        style={{
          backgroundImage: 'url(/bg-pattern.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
        }}
      />
      
      {/* Subtle fade at edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-block bg-white p-4 mb-6" style={{ borderRadius: '11px' }}>
          <img src="/Logo.jpg" alt="Day1Health" className="h-16 w-auto" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          1 Minute. 1 Hour. Day1 Covered.
        </h2>
        <button className="bubble-button px-12 py-5 text-xl font-semibold shadow-xl">
          1-min sign up
        </button>
      </div>
    </section>
  );
}
