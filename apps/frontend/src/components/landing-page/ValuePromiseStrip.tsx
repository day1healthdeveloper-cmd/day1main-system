import { Building2, Zap, Phone, Stethoscope } from "lucide-react";

export function ValuePromiseStrip() {
  const promises = [
    { icon: Building2, text: "Private Hospitals" },
    { icon: Zap, text: "Instant Accident Cover" },
    { icon: Phone, text: "Nurse Hotline" },
    { icon: Stethoscope, text: "R285 Doctor Consults" },
  ];

  return (
    <div className="relative bg-gradient-to-r from-green-600 to-green-700 py-6 overflow-hidden">
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
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {promises.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-white">
              <item.icon className="w-5 h-5 text-white" />
              <span className="text-sm md:text-base font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
