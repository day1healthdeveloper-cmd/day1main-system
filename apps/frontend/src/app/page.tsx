'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlowingButton } from '@/components/ui/glowing-button';

export default function Home() {
  return (
    <main className="min-h-screen">
      <section 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(/bg1.jpg)',
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <nav className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b-2 border-green-600">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <img src="/Logo.jpg" alt="Day1Health" className="h-12 w-auto" />
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Log-in</Button>
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 text-center" style={{ paddingTop: '170px' }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-12">
              <div className="relative inline-block p-8 bg-white/60 backdrop-blur-[10px] backdrop-saturate-[110%] border-2 border-green-600 rounded-2xl shadow-xl">
                <img src="/Logo.jpg" alt="Day1Health" className="h-40 w-auto" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Welcome to Day1Health
            </h1>
            <p className="text-2xl text-gray-700 mb-8">
              Transforming healthcare administration with intelligent automation, seamless compliance, and member-first innovation
            </p>

            <p className="text-xl text-gray-600 mb-6 font-semibold">
              Select your department to log in
            </p>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 max-w-6xl mx-auto">
              <Link href="/login">
                <GlowingButton glowColor="#ef4444" className="w-full">
                  Admin
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#6366f1" className="w-full">
                  Operations
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#ec4899" className="w-full">
                  Marketing
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#8b5cf6" className="w-full">
                  Broker
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#3b82f6" className="w-full">
                  Compliance
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#22d3ee" className="w-full">
                  Finance
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#10b981" className="w-full">
                  Claims
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#f59e0b" className="w-full">
                  Provider
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#14b8a6" className="w-full">
                  Call Centre
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#dc2626" className="w-full">
                  Ambulance
                </GlowingButton>
              </Link>
              <Link href="/login">
                <GlowingButton glowColor="#a3e635" className="w-full">
                  Member
                </GlowingButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-600">&copy; 2026 Day1Health. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
