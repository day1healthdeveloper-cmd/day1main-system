import { Building2, Zap, Phone, DollarSign, Smartphone, Users } from "lucide-react";

export function WhatYouGet() {
  const benefits = [
    { icon: Building2, text: "Private hospitals" },
    { icon: Zap, text: "Instant accident cover" },
    { icon: Phone, text: "Nurse & doctor access" },
    { icon: DollarSign, text: "No hidden fees" },
    { icon: Smartphone, text: "Fast digital onboarding" },
    { icon: Users, text: "Family-friendly pricing" },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-navy-900 text-center mb-12">
          Every Day1Health plan includes
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200"
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-lg font-medium text-slate-700">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
