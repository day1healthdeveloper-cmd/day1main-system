'use client';
import { useState } from 'react';
import { Building2, Zap, Truck, Video, Heart, Baby, Activity, UserX, TrendingUp, Phone } from 'lucide-react';
import { FaAmbulance, FaHospital, FaBolt, FaVideo, FaHeart, FaBaby, FaStethoscope, FaWheelchair, FaArrowUp, FaPhoneAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { MovingBorderContainer } from '@/components/ui/moving-border';

const covers = [
  { 
    id: 'hospital', 
    name: 'Private Room in Hospital', 
    icon: '/icons/private room in hospital.png',
    benefits: ['Private room accommodation', 'Personal space for recovery', 'Enhanced comfort and privacy'],
    waitingPeriod: '30-day',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800',
    headline: 'Privacy when you need it most',
    description: 'Recover in comfort with your own private hospital room'
  },
  { 
    id: 'accident', 
    name: 'Accident / Trauma Cover', 
    icon: '/icons/accident and trauma.png',
    benefits: ['Immediate coverage from day one', 'Emergency medical treatment', 'Accidental injuries covered'],
    waitingPeriod: 'immediate',
    image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=800',
    headline: 'Protection when life takes an unexpected turn',
    description: 'Financial support after accidents or traumatic events'
  },
  { 
    id: 'ambulance', 
    name: '24-Hour Ambulance', 
    icon: '/icons/ambulance.png',
    benefits: ['24/7 emergency response', 'Professional paramedic care', 'Fast response times'],
    waitingPeriod: 'immediate',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=800',
    headline: 'Help that arrives when seconds matter',
    description: 'Emergency ambulance assistance, day or night'
  },
  { 
    id: 'virtual-doctor', 
    name: 'Virtual Doctor', 
    icon: '/icons/virtual doctor.png',
    benefits: ['Instant access to doctors', 'No travel required', 'Available 24/7'],
    waitingPeriod: 'immediate',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800',
    headline: 'Medical advice without the waiting room',
    description: 'Speak to a qualified doctor when you need guidance'
  },
  { 
    id: 'funeral', 
    name: 'Funeral Cover', 
    icon: '/icons/funeral cover.png',
    benefits: ['Financial support for funeral', 'Burial or cremation costs', 'Reduces family burden'],
    waitingPeriod: '30-day',
    image: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=800',
    headline: 'Support when your family needs it most',
    description: 'Financial help to ease the burden during loss'
  },
  { 
    id: 'maternity', 
    name: 'Maternity Cover', 
    icon: '/icons/maternity.png',
    benefits: ['Prenatal and postnatal care', 'Delivery and hospital costs', 'Newborn care included'],
    waitingPeriod: '30-day',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=800',
    headline: "Care for life's biggest new beginning",
    description: 'Support for pregnancy and maternity-related needs'
  },
  { 
    id: 'critical-illness', 
    name: 'Critical Illness', 
    icon: '/icons/critical illness.png',
    benefits: ['Lump sum payment on diagnosis', 'Covers cancer, heart attack, stroke', 'Financial support for treatment'],
    waitingPeriod: '30-day',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800',
    headline: 'Support when health takes a serious turn',
    description: 'Cover for major conditions including cancer, heart attack, stroke'
  },
  { 
    id: 'disability', 
    name: 'Disability Cover', 
    icon: '/icons/disability.png',
    benefits: ['Monthly income replacement', 'Permanent disability coverage', 'Financial security for family'],
    waitingPeriod: '30-day',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800',
    headline: 'Protection when work is no longer possible',
    description: 'Financial support if permanent disability occurs'
  },
  { 
    id: 'illness-topup', 
    name: 'Illness Top-Up', 
    icon: '/icons/critical illness.png',
    benefits: ['Additional coverage beyond primary', 'Extra financial support', 'Covers gaps in existing cover'],
    waitingPeriod: '30-day',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=800',
    headline: 'Extra support when cover needs backup',
    description: 'Additional financial help during serious illness'
  },
  { 
    id: 'hotline', 
    name: '24/7 Hotline', 
    icon: '/icons/virtual doctor.png',
    benefits: ['Medical professionals 24/7', 'Guidance on symptoms', 'Trusted medical support'],
    waitingPeriod: 'immediate',
    image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=800',
    headline: 'A calm, trusted voice — anytime',
    description: 'Medical guidance available day or night'
  },
];

export function SingleCoverSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCover = covers[activeIndex];

  return (
    <section id="plans-section" className="py-6 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Main container wrapping both sections */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-6xl mx-auto mb-4 relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Find the <span className="text-emerald-600">ONE</span> cover that matters Now!
          </h2>
          
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'url(/bg-pattern.webp)',
              backgroundRepeat: 'repeat',
              backgroundSize: 'auto',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Glass focus container for plan preview */}
            <div className="glass-focus p-8 md:p-10 transition-all duration-300 ease-out">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" style={{ minHeight: '320px' }}>
            {/* Left Column - Benefits */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img src={activeCover.icon} alt={activeCover.name} className="w-9 h-9" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{activeCover.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Comprehensive coverage</p>
                </div>
              </div>
              <div className="space-y-3">
                {activeCover.benefits.map((benefit, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-3.5 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Column - Video/Image */}
            <div className="lg:col-span-6 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCover.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                  style={{ minHeight: '320px' }}
                >
                  <div className="relative h-full w-full">
                    <img
                      src={activeCover.image}
                      alt={activeCover.name}
                      className="h-full w-full rounded-2xl object-cover shadow-2xl border-4 border-white"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/800x600/10b981/ffffff?text=${activeCover.name.charAt(0)}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <p className="text-base font-semibold italic mb-1.5 leading-snug">{activeCover.headline}</p>
                      <p className="text-xs text-white/95 leading-relaxed">{activeCover.description}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column - Actions */}
            <div className="lg:col-span-2 flex flex-col justify-center items-stretch gap-5">
              <div className={`px-5 py-4 rounded-2xl text-center shadow-xl border-2 ${activeCover.waitingPeriod === 'immediate' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-blue-600 border-blue-700 text-white'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-90">
                  {activeCover.waitingPeriod === 'immediate' ? 'Activated' : 'Waiting Period'}
                </p>
                <p className="text-lg font-bold leading-tight">
                  {activeCover.waitingPeriod === 'immediate' ? 'Immediately' : '30 Days'}
                </p>
              </div>
              <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 px-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-sm border-2 border-emerald-800">
                View Full Plan
              </button>
              <div className="text-center pt-1.5">
                <p className="text-[10px] text-gray-500 font-medium">Click to explore details</p>
              </div>
            </div>
          </div>
          
          {/* Navigation buttons - connected to top section */}
          <div className="border-t-2 border-gray-200 pt-6 mt-6">
            <div className="flex justify-center">
              <MovingBorderContainer
                borderRadius="1rem"
                duration={35000}
                containerClassName="max-w-4xl"
                className="bg-white/80"
              >
                <div className="grid grid-cols-5 gap-2 p-3.5">
                  {covers.map((cover, index) => {
                    return (
                      <button
                        key={cover.id}
                        onClick={() => setActiveIndex(index)}
                        className={`p-2 rounded-lg border-2 text-center transition-all ${
                          activeIndex === index
                            ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105'
                            : 'border-gray-200 bg-white hover:border-emerald-400 hover:shadow-md hover:scale-105'
                        }`}
                      >
                        <img src={cover.icon} alt={cover.name} className="w-10 h-10 mx-auto" />
                        <p className="text-[11px] font-medium text-gray-700 mt-1">{cover.name}</p>
                      </button>
                    );
                  })}
                </div>
              </MovingBorderContainer>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
