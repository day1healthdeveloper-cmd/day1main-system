"use client";

import { useState, useEffect } from 'react';

const slides = [
  {
    name: "Value Plus Hospital",
    price: 390,
    ageRange: "Ages 18-64",
    bgImage: "/bg1.jpg",
    sliderName: 'value-plus',
    pricing: { spouse: 312, child: 156, maxMembers: 4 },
    benefits: [
      {
        icon: "/icons/private room in hospital.png",
        title: "Hospital Cover",
        details: ["R10,000/day up to 21 days", "Private In-Hospital Illness", "3 month waiting period"]
      },
      {
        icon: "/icons/accident and trauma.png",
        title: "Accident Cover",
        details: ["R150,000 single / R300,000 family", "Cover per incident", "1 month waiting"]
      },
      {
        icon: "/icons/ambulance.png",
        title: "24hr Ambulance",
        details: ["24 Hour emergency services", "Pre-authorization required", "Immediate Cover"]
      },
      {
        icon: "/icons/virtual doctor.png",
        title: "Virtual Doctor",
        details: ["Pay-as-you-go consultations", "Available when needed", "Immediate Cover"]
      },
      {
        icon: "/icons/funeral cover.png",
        title: "Funeral Cover",
        details: ["R20,000 member & spouse", "R10,000 child 14+", "3 month waiting period"]
      },
      {
        icon: "/icons/private room in hospital.png",
        title: "In-Hospital Benefits",
        details: ["Up to 21 days coverage", "R10,000 first 2 days", "R1,500 thereafter"]
      },
      {
        icon: "/icons/ambulance.png",
        title: "Emergency Services",
        details: ["Africa Assist 24/7", "Medical advice", "Immediate access"]
      },
      {
        icon: "/icons/private room in hospital.png",
        title: "Comprehensive",
        details: ["No sports injuries", "Hospital illness covered", "Family protection"]
      }
    ]
  },
  {
    name: "Platinum Hospital",
    price: 560,
    ageRange: "All ages",
    bgImage: "/img2.JPG",
    sliderName: 'platinum',
    pricing: { spouse: 448, child: 224, maxMembers: 4 },
    benefits: [
      {
        icon: "/icons/private room in hospital.png",
        title: "Hospital Cover",
        details: ["R10,000/day up to 21 days", "Enhanced 3rd day benefit", "3 month waiting period"]
      },
      {
        icon: "/icons/accident and trauma.png",
        title: "Accident Cover",
        details: ["R150,000 single / R300,000 family", "Immediate cover", "No waiting period"]
      },
      {
        icon: "/icons/ambulance.png",
        title: "24hr Ambulance",
        details: ["24 Hour emergency services", "Pre-authorization required", "Immediate Cover"]
      },
      {
        icon: "/icons/virtual doctor.png",
        title: "Virtual Doctor",
        details: ["Unlimited consultations", "Available 24/7", "Immediate Cover"]
      },
      {
        icon: "/icons/maternity.png",
        title: "Maternity",
        details: ["R20,000 birth benefit", "Hospital delivery", "12 month waiting period"]
      },
      {
        icon: "/icons/critical illness.png",
        title: "Critical Illness",
        details: ["Up to R250,000", "Limited to R50,000 without exam", "3 month waiting"]
      },
      {
        icon: "/icons/disability.png",
        title: "Disability",
        details: ["R250,000 cover", "Principal member only", "Immediate cover"]
      },
      {
        icon: "/icons/funeral cover.png",
        title: "Funeral Cover",
        details: ["R20,000 member & spouse", "R10,000 child 14+", "3 month waiting period"]
      }
    ]
  },
  {
    name: "Executive Hospital",
    price: 640,
    ageRange: "All ages",
    bgImage: "/bg1.jpg",
    sliderName: 'executive',
    pricing: { spouse: 512, child: 256, maxMembers: 4 },
    benefits: [
      {
        icon: "/icons/private room in hospital.png",
        title: "Hospital Cover",
        details: ["R10,000/day + R25,000 top-up", "Enhanced daily rate R2,000", "3 month waiting period"]
      },
      {
        icon: "/icons/accident and trauma.png",
        title: "Accident Cover",
        details: ["R250,000 single / R500,000 family", "Immediate cover", "Premium protection"]
      },
      {
        icon: "/icons/ambulance.png",
        title: "24hr Ambulance",
        details: ["24 Hour emergency services", "Pre-authorization required", "Immediate Cover"]
      },
      {
        icon: "/icons/virtual doctor.png",
        title: "Virtual Doctor",
        details: ["Unlimited consultations", "Available 24/7", "Immediate Cover"]
      },
      {
        icon: "/icons/maternity.png",
        title: "Maternity",
        details: ["R20,000 birth benefit", "Hospital delivery", "12 month waiting period"]
      },
      {
        icon: "/icons/critical illness.png",
        title: "Critical Illness",
        details: ["R50,000 cover", "Cancer, heart, stroke", "3 month waiting"]
      },
      {
        icon: "/icons/disability.png",
        title: "Disability",
        details: ["R250,000 cover", "Principal member only", "Immediate cover"]
      },
      {
        icon: "/icons/funeral cover.png",
        title: "Funeral Cover",
        details: ["R30,000 member & spouse", "R10,000 child 14+", "3 month waiting period"]
      }
    ]
  },
  {
    name: "Value Plus Senior",
    price: 580,
    ageRange: "Ages 65+",
    bgImage: "/img2.JPG",
    sliderName: 'value-plus-senior',
    pricing: { spouse: 580, child: 0, maxMembers: 2 },
    benefits: [
      {
        icon: "🏥",
        title: "Hospital Cover",
        details: ["R10,000/day up to 21 days", "Enhanced 3 day benefit", "3 month waiting period"]
      },
      {
        icon: "🚗",
        title: "Accident Cover",
        details: ["R75,000 single / R150,000 couple", "Max 2 events", "1 month waiting"]
      },
      {
        icon: "🚑",
        title: "24hr Ambulance",
        details: ["24 Hour emergency services", "Pre-authorization required", "Immediate Cover"]
      },
      {
        icon: "👨‍⚕️",
        title: "Virtual Doctor",
        details: ["Pay-as-you-go consultations", "Available when needed", "Immediate Cover"]
      },
      {
        icon: "⚰️",
        title: "Funeral Cover",
        details: ["R5,000 member & spouse", "Senior coverage", "3 month waiting period"]
      },
      {
        icon: "🏥",
        title: "Senior Benefits",
        details: ["Tailored for 65+", "No maternity", "No sports injuries"]
      },
      {
        icon: "🚨",
        title: "Emergency Services",
        details: ["Africa Assist 24/7", "Medical advice", "Immediate access"]
      },
      {
        icon: "💼",
        title: "Senior Protection",
        details: ["Age-appropriate cover", "Couple options", "Comprehensive care"]
      }
    ]
  },
];

export function PlanSlider({ initialSlide = 0 }: { initialSlide?: number }) {
  const [familyOption, setFamilyOption] = useState<'single' | 'couple' | 'family'>('single');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(initialSlide);

  useEffect(() => {
    setCurrentSlide(initialSlide);
  }, [initialSlide]);

  const calculateTotalPrice = (basePrice: number, spousePrice: number, childPrice: number) => {
    let total = basePrice;
    
    if (familyOption === 'couple') {
      total = basePrice + spousePrice;
    } else if (familyOption === 'family') {
      total = basePrice + (adults - 1) * spousePrice + children * childPrice;
    }
    
    return total;
  };

  const handleAdultsChange = (delta: number, maxMembers: number) => {
    const newValue = Math.max(1, Math.min(maxMembers, adults + delta));
    setAdults(newValue);
  };

  const handleChildrenChange = (delta: number, maxMembers: number) => {
    const maxChildren = Math.max(0, maxMembers - adults);
    const newValue = Math.max(0, Math.min(maxChildren, children + delta));
    setChildren(newValue);
  };

  const handleFamilyOptionChange = (option: 'single' | 'couple' | 'family') => {
    setFamilyOption(option);
    if (option === 'single') {
      setAdults(1);
      setChildren(0);
    } else if (option === 'couple') {
      setAdults(2);
      setChildren(0);
    } else {
      setAdults(2);
      setChildren(0);
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleSignup = (planName: string, planSlug: string) => {
    // Build URL with plan parameters
    const params = new URLSearchParams({
      plan: planSlug,
      planName: planName,
      config: familyOption,
      adults: adults.toString(),
      children: children.toString(),
      price: totalPrice.toString(),
    });
    
    window.location.href = `/apply?${params.toString()}`;
  };

  const currentPlan = slides[currentSlide];
  const totalPrice = calculateTotalPrice(currentPlan.price, currentPlan.pricing.spouse, currentPlan.pricing.child);
  const totalMembers = familyOption === 'single' ? 1 : familyOption === 'couple' ? 2 + children : adults + children;

  return (
    <section id="plan-slider-section" className="relative overflow-hidden h-screen">
      <div className="relative flex flex-col items-center justify-center h-full py-6 px-4">
        {/* Background Image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${currentPlan.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/70" />

        {/* Section Header - Outside container */}
        <div className="relative z-10 text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            View All Our <span className="text-emerald-600">Plans</span>
          </h2>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-green-600/80 backdrop-blur-md shadow-lg hover:bg-green-700 transition-all flex items-center justify-center text-xl text-white hover:scale-110"
        >
          ←
        </button>
        
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-green-600/80 backdrop-blur-md shadow-lg hover:bg-green-700 transition-all flex items-center justify-center text-xl text-white hover:scale-110"
        >
          →
        </button>

        {/* Single Centered Glassmorphism Card */}
        <div className="relative z-10 w-full max-w-6xl h-full flex items-center">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-3 shadow-2xl border-2 border-white/40 w-full max-h-[85vh] overflow-auto">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <img src="/Logo.jpg" alt="Day1Health" className="h-12 w-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-navy-900">{currentPlan.name}</h2>
                  <p className="text-xs text-slate-600">{currentPlan.ageRange}</p>
                </div>
              </div>
            </div>

            {/* Content Grid - Benefits and Signup side by side */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left: Benefits Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {currentPlan.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-2 bg-white rounded-lg p-2 border-2 border-gray-200 shadow-md items-start h-[87px]">
                    <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
                      <img src={benefit.icon} alt={benefit.title} className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 mb-0.5">{benefit.title}</h3>
                      <ul className="space-y-0">
                        {benefit.details.map((detail, i) => (
                          <li key={i} className="text-[10px] text-gray-600 leading-tight">• {detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Price Banner + Family Config + Signup */}
              <div className="space-y-3">
                {/* Modern Price Card */}
                <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-lg">
                  <div className="text-center mb-3">
                    <p className="text-[11px] text-gray-500 mb-1">Starting from</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">R{currentPlan.price}</span>
                      <span className="text-xs text-gray-600">/month</span>
                    </div>
                    <button className="text-[9px] text-emerald-600 hover:text-emerald-700 underline mt-1.5">Terms & Conditions</button>
                  </div>

                  {/* Plan Name */}
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-2.5 mb-3 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-gray-900">{currentPlan.name}</h3>
                      <p className="text-emerald-600 font-bold text-lg">R{totalPrice}</p>
                    </div>
                  </div>

                  {/* Family Configuration */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1.5">Coverage Type</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleFamilyOptionChange('single')}
                          className={`py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all border-2 ${
                            familyOption === 'single'
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                          }`}
                        >
                          Single
                        </button>
                        <button
                          onClick={() => handleFamilyOptionChange('couple')}
                          className={`py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all border-2 ${
                            familyOption === 'couple'
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                          }`}
                        >
                          Couple
                        </button>
                        <button
                          onClick={() => handleFamilyOptionChange('family')}
                          className={`py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all border-2 ${
                            familyOption === 'family'
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
                          }`}
                        >
                          Family
                        </button>
                      </div>
                    </div>

                    {(familyOption === 'single' || familyOption === 'family' || familyOption === 'couple') && (
                      <div className="bg-white rounded-lg p-2 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          {familyOption === 'family' && (
                            <>
                              <label className="text-[9px] font-semibold text-gray-600 whitespace-nowrap">Adults 18+</label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleAdultsChange(-1, currentPlan.pricing.maxMembers)}
                                  className="w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-all"
                                >
                                  -
                                </button>
                                <span className="text-sm font-bold text-gray-900 w-5 text-center">{adults}</span>
                                <button
                                  onClick={() => handleAdultsChange(1, currentPlan.pricing.maxMembers)}
                                  className="w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-all"
                                >
                                  +
                                </button>
                              </div>
                              <div className="w-px h-6 bg-gray-300"></div>
                            </>
                          )}
                          <label className="text-[9px] font-semibold text-gray-600 whitespace-nowrap">Children (0-21)</label>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleChildrenChange(-1, 4)}
                              className="w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-all"
                            >
                              -
                            </button>
                            <span className="text-sm font-bold text-gray-900 w-5 text-center">{children}</span>
                            <button
                              onClick={() => handleChildrenChange(1, 4)}
                              className="w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-emerald-50 rounded-lg p-1.5 border border-emerald-200">
                      <p className="text-[11px] text-emerald-700 text-center font-medium">
                        {familyOption === 'single' && '1 member'}
                        {familyOption === 'couple' && children === 0 && '2 adults'}
                        {familyOption === 'couple' && children > 0 && `2 adults + ${children} ${children === 1 ? 'child' : 'children'}`}
                        {familyOption === 'family' && children === 0 && `${adults} ${adults === 1 ? 'adult' : 'adults'}`}
                        {familyOption === 'family' && children > 0 && `${adults} ${adults === 1 ? 'adult' : 'adults'} + ${children} ${children === 1 ? 'child' : 'children'}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSignup(currentPlan.name, currentPlan.sliderName)}
                    className="w-full mt-3 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-sm border-2 border-emerald-800"
                  >
                    Sign Up Now - 1 Min
                  </button>

                  <p className="text-[9px] text-gray-500 text-center mt-2.5 leading-relaxed">
                    By clicking you agree to our <span className="text-emerald-600 hover:text-emerald-700 underline cursor-pointer font-medium">Terms & Conditions</span> and <span className="text-emerald-600 hover:text-emerald-700 underline cursor-pointer font-medium">Privacy Policy</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
