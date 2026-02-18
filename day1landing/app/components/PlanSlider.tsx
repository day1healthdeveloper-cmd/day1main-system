"use client";

import {
  SliderBtnGroup,
  ProgressSlider,
  SliderBtn,
  SliderContent,
  SliderWrapper,
} from '@/app/components/ui/progressive-carousel';

const slides = [
  {
    name: "Ultra Value Plus Starter",
    price: 189,
    ageRange: "Ages 18-40",
    bgImage: "/img1.JPG",
    sliderName: 'starter',
    pricing: { spouse: 140, child: 70 },
    benefits: [
      {
        title: "Accident Cover",
        icon: "🚗",
        details: ["R50,000 cover during the first 3 months", "R100,000 cover after 3 months of continuous membership", "Cover applies per incident", "Immediate Cover"]
      },
      {
        title: "Hospital Cover",
        icon: "🏥",
        details: ["Private In-Hospital Illness Cover", "R10,000 paid to a private hospital for each 24 hour day, up to 3 days", "1 incident per annum | A 3 month general waiting period and a 12-month pre-existing conditions exclusion applies"]
      },
      {
        title: "Ambulance Assist",
        icon: "🚑",
        details: ["24 Hour Ambulance Assist. Authorisation required prior to hospital admission", "Immediate Cover"]
      },
      {
        title: "Virtual Doctor Visits",
        icon: "👨‍⚕️",
        details: ["Access to pay-as-you-go virtual doctor consultations as and when necessary", "Immediate Cover", "Pre-authorisation required"]
      }
    ]
  },
  {
    name: "Ultra Value Plus Priority",
    price: 249,
    ageRange: "Ages 18-64",
    bgImage: "/img2.JPG",
    sliderName: 'priority',
    pricing: { spouse: 140, child: 70 },
    benefits: [
      {
        title: "Accident Cover",
        icon: "🚗",
        details: ["R50,000 cover during the first 3 months", "R100,000 cover after 3 months", "Cover applies per incident", "Immediate Cover"]
      },
      {
        title: "Hospital Cover",
        icon: "🏥",
        details: ["Private In-Hospital Illness Cover", "R10,000 per 24-hour day (up to 3 days)", "1 incident per annum", "3 month waiting period applies"]
      },
      {
        title: "Ambulance Assist",
        icon: "🚑",
        details: ["24 Hour Ambulance Assist", "Pre-authorisation required", "Immediate Cover"]
      },
      {
        title: "Funeral Cover",
        icon: "⚰️",
        details: ["R20,000 Funeral Cover", "3-day Car Hire", "Airtime & Electricity"]
      }
    ]
  },
  {
    name: "Value Plus Hospital",
    price: 390,
    ageRange: "Ages 18-64",
    bgImage: "/img1.JPG",
    sliderName: 'valueplus',
    pricing: { spouse: 312, child: 156 },
    benefits: [
      {
        title: "Unlimited Events",
        icon: "♾️",
        details: ["Unlimited Accident & Illness Events", "No annual caps", "Comprehensive coverage"]
      },
      {
        title: "Hospital Cover",
        icon: "🏥",
        details: ["Private In-Hospital Illness Cover", "Enhanced daily benefits", "Multiple incidents covered"]
      },
      {
        title: "Ambulance Assist",
        icon: "🚑",
        details: ["24 Hour Ambulance Assist", "Pre-authorisation required", "Immediate Cover"]
      },
      {
        title: "Virtual Doctor Visits",
        icon: "👨‍⚕️",
        details: ["Pay-as-you-go consultations", "Immediate Cover"]
      }
    ]
  },
  {
    name: "Executive Hospital",
    price: 640,
    ageRange: "Premium Coverage",
    bgImage: "/img2.JPG",
    sliderName: 'executive',
    pricing: { spouse: 512, child: 256 },
    benefits: [
      {
        title: "Maximum Cover",
        icon: "⭐",
        details: ["Highest accident cover", "Critical Illness cover", "Accidental Permanent Disability"]
      },
      {
        title: "Hospital Cover",
        icon: "🏥",
        details: ["Premium In-Hospital Cover", "Illness top-up benefit", "Unlimited events"]
      },
      {
        title: "Enhanced Benefits",
        icon: "💎",
        details: ["Enhanced funeral benefits", "24/7 Ambulance Assist", "Priority service"]
      },
      {
        title: "Virtual Doctor Visits",
        icon: "👨‍⚕️",
        details: ["Unlimited consultations", "Immediate Cover"]
      }
    ]
  },
];

export function PlanSlider() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
      <ProgressSlider 
        vertical={false} 
        activeSlider='starter'
        className="h-full"
        duration={8000}
      >
        <SliderContent>
          {slides.map((slide, index) => (
            <SliderWrapper key={index} value={slide.sliderName}>
              <div className="relative" style={{ minHeight: '85vh' }}>
                {/* Background Image */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${slide.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-white/60" />

                {/* Content */}
                <div className="relative grid lg:grid-cols-2" style={{ minHeight: '85vh' }}>
                  {/* Left Column - Benefits Info */}
                  <div className="relative flex flex-col justify-center items-end p-8 lg:pl-16 lg:pr-2 pt-24">
                    <div className="bg-white/40 backdrop-blur-md rounded-lg p-4 mb-24 shadow-lg border border-white/20 max-w-xl mr-8">
                      {/* Benefits Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {slide.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex gap-2">
                            {/* Icon */}
                            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <span className="text-xl">{benefit.icon}</span>
                            </div>
                            {/* Content */}
                            <div className="flex-1">
                              <h4 className="font-bold text-navy-900 mb-1 text-sm">{benefit.title}</h4>
                              <ul className="space-y-0.5">
                                {benefit.details.map((detail, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="text-navy-900 text-xs mt-0.5">•</span>
                                    <span className="text-xs text-slate-700 leading-tight">{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Price Banner */}
                      <div className="relative bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 text-center mb-3 overflow-hidden">
                        {/* Background Pattern */}
                        <div 
                          className="absolute inset-0 opacity-30 mix-blend-overlay"
                          style={{
                            backgroundImage: 'url(/bg-pattern.webp)',
                            backgroundRepeat: 'repeat',
                            backgroundSize: 'auto',
                          }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <p className="text-white text-lg font-semibold">ONLY</p>
                            <p className="text-yellow-400 text-3xl font-bold">R{slide.price}</p>
                            <p className="text-white text-base">PER MONTH</p>
                          </div>
                          <p className="text-white/90 text-xs">Terms and Conditions apply</p>
                        </div>
                      </div>

                      {/* Family Pricing */}
                      <div className="text-center">
                        <p className="text-green-700 text-sm font-bold mb-0.5">
                          Spouse - R{slide.pricing.spouse} | Children - R{slide.pricing.child}
                        </p>
                        <p className="text-slate-600 text-xs">Max 4 Children per plan</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Signup Card */}
                  <div className="relative flex flex-col items-end justify-center p-8 lg:pl-4 lg:pr-8">
                    <div className="bg-white shadow-2xl w-full max-w-md border-2 border-green-600" style={{ borderRadius: '11px' }}>
                      {/* Brand Message - Top of Card */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-3 border-b border-slate-200" style={{ borderTopLeftRadius: '11px', borderTopRightRadius: '11px' }}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                              <span className="text-white text-sm">⏱️</span>
                            </div>
                            <span className="text-xs font-semibold text-navy-900">1 Minute<br/><span className="text-xs text-slate-600">Signup</span></span>
                          </div>
                          <div className="w-px h-8 bg-slate-300" />
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                              <span className="text-white text-sm">⚡</span>
                            </div>
                            <span className="text-xs font-semibold text-navy-900">1 Hour<br/><span className="text-xs text-slate-600">Confirmed</span></span>
                          </div>
                          <div className="w-px h-8 bg-slate-300" />
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                              <span className="text-white text-sm">☂️</span>
                            </div>
                            <span className="text-xs font-semibold text-navy-900">Day1<br/><span className="text-xs text-slate-600">Covered</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-8">
                      {/* Plan Name with Logo */}
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <img src="/Logo.jpg" alt="Day1Health" className="h-[65px] w-auto" />
                        <div className="text-right flex-1">
                          <h3 className="text-2xl font-bold text-navy-900">{slide.name}</h3>
                          <p className="text-sm text-slate-600">{slide.ageRange}</p>
                        </div>
                      </div>
                      <div className="mb-4"></div>

                      {/* Price */}
                      <div className="text-center mb-4 py-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <p className="text-xs text-slate-600 mb-1">Starting from</p>
                        <p className="text-3xl font-bold text-green-600">R{slide.price}</p>
                        <p className="text-xs text-slate-600">Per month</p>
                      </div>

                      {/* Form Field */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none transition-all"
                          placeholder="Enter your name"
                        />
                      </div>

                      {/* CTA Button */}
                      <button className="w-full py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-lg mb-4 text-lg">
                        1-min sign up
                      </button>

                      {/* Disclaimer */}
                      <p className="text-xs text-slate-500 text-center">
                        By clicking 1-MIN SIGN UP you are agreeing to our privacy policy
                      </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SliderWrapper>
          ))}
        </SliderContent>

        <SliderBtnGroup className='absolute bottom-8 left-8 w-auto h-fit text-black bg-white/40 backdrop-blur-md overflow-hidden flex gap-2 rounded-md p-2'>
          {slides.map((slide, index) => (
            <SliderBtn
              key={index}
              value={slide.sliderName}
              className='text-center cursor-pointer p-3 rounded-lg'
              progressBarClass='bg-green-600 h-full rounded-lg'
            >
              <h2 className='text-sm font-semibold text-gray-900'>
                {slide.name}
              </h2>
            </SliderBtn>
          ))}
        </SliderBtnGroup>
      </ProgressSlider>
    </section>
  );
}
