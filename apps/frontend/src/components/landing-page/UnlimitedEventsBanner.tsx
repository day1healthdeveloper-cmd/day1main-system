export function UnlimitedEventsBanner() {
  return (
    <div className="relative bg-gradient-to-r from-green-600 to-green-700 py-12 overflow-hidden">
      {/* Background Pattern - visible on top */}
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="text-4xl text-white">♾️</span>
          <h3 className="text-3xl md:text-4xl font-bold text-white">
            Unlimited Hospital Events
          </h3>
        </div>
        <p className="text-white/90 text-lg">
          Accident & illness events covered on selected plans — no caps, no surprises
        </p>
      </div>
    </div>
  );
}
