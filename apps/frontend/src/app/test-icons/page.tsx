'use client';

import { Fingerprint, ScanFace, ScanLine, Scan, Shield, ShieldCheck } from 'lucide-react';

export default function TestIconsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Fingerprint & Biometric Icons</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {/* Fingerprint */}
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <Fingerprint className="w-16 h-16 text-blue-600" />
            <p className="text-sm font-medium text-slate-700">Fingerprint</p>
          </div>

          {/* ScanFace */}
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <ScanFace className="w-16 h-16 text-green-600" />
            <p className="text-sm font-medium text-slate-700">ScanFace</p>
          </div>

          {/* ScanLine */}
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <ScanLine className="w-16 h-16 text-purple-600" />
            <p className="text-sm font-medium text-slate-700">ScanLine</p>
          </div>

          {/* Scan */}
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <Scan className="w-16 h-16 text-orange-600" />
            <p className="text-sm font-medium text-slate-700">Scan</p>
          </div>

          {/* Shield */}
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <Shield className="w-16 h-16 text-red-600" />
            <p className="text-sm font-medium text-slate-700">Shield</p>
          </div>

          {/* ShieldCheck */}
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <ShieldCheck className="w-16 h-16 text-emerald-600" />
            <p className="text-sm font-medium text-slate-700">ShieldCheck</p>
          </div>
        </div>

        <div className="mt-12 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Different Sizes</h2>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <Fingerprint className="w-8 h-8 text-blue-600" />
              <p className="text-xs text-slate-600">Small</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Fingerprint className="w-12 h-12 text-blue-600" />
              <p className="text-xs text-slate-600">Medium</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Fingerprint className="w-16 h-16 text-blue-600" />
              <p className="text-xs text-slate-600">Large</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Fingerprint className="w-24 h-24 text-blue-600" />
              <p className="text-xs text-slate-600">X-Large</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-slate-900">With Different Colors</h2>
          <div className="flex items-center gap-8">
            <Fingerprint className="w-16 h-16 text-blue-600" />
            <Fingerprint className="w-16 h-16 text-green-600" />
            <Fingerprint className="w-16 h-16 text-purple-600" />
            <Fingerprint className="w-16 h-16 text-orange-600" />
            <Fingerprint className="w-16 h-16 text-red-600" />
            <Fingerprint className="w-16 h-16 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
