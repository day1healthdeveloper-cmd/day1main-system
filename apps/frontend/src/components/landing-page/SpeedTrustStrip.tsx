'use client';

import { Clock, CheckCircle, Shield } from 'lucide-react';
import { Counter } from '@/components/ui/counter';

export function SpeedTrustStrip() {
  return (
    <section className="py-8 px-4 md:px-8 bg-white border-y border-slate-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex items-baseline gap-1">
              <Counter end={60} duration={60} fontSize={18} className="text-slate-700 font-bold" />
              <span className="text-sm text-slate-600">seconds registration</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <span className="text-base md:text-lg font-medium text-slate-700">
              1 hour policy confirmation
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
            <span className="text-base md:text-lg font-medium text-slate-700">
              Covered in 1 day
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
