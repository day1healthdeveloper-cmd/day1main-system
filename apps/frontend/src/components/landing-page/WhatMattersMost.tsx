'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Zap, 
  Truck, 
  Video, 
  Heart, 
  Baby, 
  Activity, 
  UserX, 
  TrendingUp, 
  Phone,
  User,
  Users,
  Home
} from 'lucide-react';
import { useSliderWithInput } from '@/components/hooks/use-slider-with-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { MovingBorderContainer } from '@/components/ui/moving-border';

interface CoverOption {
  id: string;
  name: string;
  icon: any;
  emoji: string;
}

interface MedicalPlan {
  id: string;
  name: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  price: number;
  couplePrice: number;
  familyPrice: number;
  spousePrice: number;
  childPrice: number;
  benefits: string[];
  highlights: Array<{
    icon: string;
    title: string;
    details: string;
  }>;
}

export function WhatMattersMost() {
  const coverOptions: CoverOption[] = [
    { id: 'hospital', name: 'Private Room in Hospital', icon: Building2, emoji: '/icons/private room in hospital.png' },
    { id: 'accident', name: 'Accident / Trauma', icon: Zap, emoji: '/icons/accident and trauma.png' },
    { id: 'ambulance', name: '24-Hour Ambulance', icon: Truck, emoji: '/icons/ambulance.png' },
    { id: 'doctor', name: 'Virtual Doctor', icon: Video, emoji: '/icons/virtual doctor.png' },
    { id: 'funeral', name: 'Funeral Cover', icon: Heart, emoji: '/icons/funeral cover.png' },
    { id: 'maternity', name: 'Maternity', icon: Baby, emoji: '/icons/maternity.png' },
    { id: 'critical', name: 'Critical Illness', icon: Activity, emoji: '/icons/critical illness.png' },
    { id: 'disability', name: 'Disability', icon: UserX, emoji: '/icons/disability.png' },
    { id: 'cancer', name: 'Cancer Cover', icon: TrendingUp, emoji: '/icons/cancer cover.png' },
    { id: 'heart', name: 'Heart Attack', icon: Heart, emoji: '/icons/heart attack.png' },
  ];

  const medicalPlans: MedicalPlan[] = [
    {
      id: 'value-plus',
      name: 'Value Plus Hospital',
      ageRange: 'Ages 18-64',
      minAge: 18,
      maxAge: 64,
      price: 390,
      couplePrice: 702,
      familyPrice: 858,
      spousePrice: 312,
      childPrice: 156,
      benefits: ['hospital', 'accident', 'ambulance', 'doctor', 'funeral'],
      highlights: [
        { icon: '/icons/private room in hospital.png', title: 'Hospital Cover', details: 'R10,000/day up to 21 days' },
        { icon: '/icons/accident and trauma.png', title: 'Accident Cover', details: 'R150,000 single / R300,000 family' },
        { icon: '/icons/ambulance.png', title: '24hr Ambulance', details: 'Immediate cover' },
        { icon: '/icons/funeral cover.png', title: 'Funeral Cover', details: 'R20,000 member & spouse' },
      ]
    },
    {
      id: 'platinum',
      name: 'Platinum Hospital',
      ageRange: 'All ages',
      minAge: 18,
      maxAge: 75,
      price: 560,
      couplePrice: 1008,
      familyPrice: 1232,
      spousePrice: 448,
      childPrice: 224,
      benefits: ['hospital', 'accident', 'ambulance', 'doctor', 'funeral', 'maternity', 'critical', 'disability', 'cancer', 'heart', 'stroke', 'kidney'],
      highlights: [
        { icon: '/icons/private room in hospital.png', title: 'Hospital Cover', details: 'R10,000/day up to 21 days' },
        { icon: '/icons/critical illness.png', title: 'Critical Illness', details: 'Up to R250,000' },
        { icon: '/icons/maternity.png', title: 'Maternity', details: 'R20,000 birth benefit' },
        { icon: '/icons/disability.png', title: 'Disability', details: 'R250,000 cover' },
      ]
    },
    {
      id: 'executive',
      name: 'Executive Hospital',
      ageRange: 'All ages',
      minAge: 18,
      maxAge: 75,
      price: 640,
      couplePrice: 1152,
      familyPrice: 1408,
      spousePrice: 512,
      childPrice: 256,
      benefits: ['hospital', 'accident', 'ambulance', 'doctor', 'funeral', 'maternity', 'critical', 'disability', 'cancer', 'heart', 'stroke', 'kidney'],
      highlights: [
        { icon: '/icons/private room in hospital.png', title: 'Hospital Cover', details: 'R10,000/day + R25,000 top-up' },
        { icon: '/icons/accident and trauma.png', title: 'Accident Cover', details: 'R250,000 single / R500,000 family' },
        { icon: '/icons/critical illness.png', title: 'Critical Illness', details: 'R50,000 cover' },
        { icon: '/icons/funeral cover.png', title: 'Funeral Cover', details: 'R30,000 member & spouse' },
      ]
    },
    {
      id: 'value-plus-senior',
      name: 'Value Plus Senior',
      ageRange: 'Ages 65+',
      minAge: 65,
      maxAge: 100,
      price: 580,
      couplePrice: 1160,
      familyPrice: 1160,
      spousePrice: 580,
      childPrice: 0,
      benefits: ['hospital', 'accident', 'ambulance', 'doctor', 'funeral'],
      highlights: [
        { icon: '/icons/private room in hospital.png', title: 'Hospital Cover', details: 'R10,000/day up to 21 days' },
        { icon: '/icons/accident and trauma.png', title: 'Accident Cover', details: 'R75,000 single / R150,000 couple' },
        { icon: '/icons/ambulance.png', title: '24hr Ambulance', details: 'Immediate cover' },
        { icon: '/icons/funeral cover.png', title: 'Funeral Cover', details: 'R5,000 member & spouse' },
      ]
    },
  ];

  const [selectedCoverType, setSelectedCoverType] = useState<string>('single');
  const [dropZones, setDropZones] = useState<{ [key: number]: string | null }>({
    0: null,
    1: null,
    2: null,
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  // Family configuration state for each plan
  const [planConfigs, setPlanConfigs] = useState<{ [planId: string]: { option: string; adults: number; children: number } }>({});
  
  // Carousel state for matching plans
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const minAge = 18;
  const maxAge = 75;
  const initialAge = [35];

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({ minValue: minAge, maxValue: maxAge, initialValue: initialAge });

  const coverTypes = [
    { id: 'single', label: 'Single', icon: User },
    { id: 'couple', label: 'Couple', icon: Users },
    { id: 'family', label: 'Family', icon: Home },
  ];

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (zoneIndex: number) => {
    if (draggedItem) {
      const newDropZones = { ...dropZones };
      Object.keys(newDropZones).forEach((key) => {
        if (newDropZones[Number(key)] === draggedItem) {
          newDropZones[Number(key)] = null;
        }
      });
      newDropZones[zoneIndex] = draggedItem;
      setDropZones(newDropZones);
      setDraggedItem(null);
    }
  };

  const handleRemoveFromZone = (zoneIndex: number) => {
    setDropZones({ ...dropZones, [zoneIndex]: null });
  };

  const getItemById = (id: string) => coverOptions.find(item => item.id === id);

  const isItemInDropZone = (itemId: string) => {
    return Object.values(dropZones).includes(itemId);
  };

  const allZonesFilled = dropZones[0] && dropZones[1] && dropZones[2];
  const selectedBenefits = Object.values(dropZones).filter(Boolean) as string[];
  const currentAge = sliderValue[0];

  // Auto-scroll to matching plans when all zones are filled
  useEffect(() => {
    if (allZonesFilled) {
      // Small delay to allow the plans to render first
      setTimeout(() => {
        const matchingPlansSection = document.getElementById('matching-plans-section');
        if (matchingPlansSection) {
          smoothScrollTo(matchingPlansSection, undefined, -1); // Scroll to show section with 10px padding from top
        }
      }, 300);
    }
  }, [allZonesFilled]);

  // Custom smooth scroll function with controlled speed
  const smoothScrollTo = (element: HTMLElement, callback?: () => void, offset: number = -80) => {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset + offset; // Custom offset
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800; // 0.8 seconds for faster scroll
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      window.scrollTo(0, startPosition + distance * easeInOutCubic);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else if (callback) {
        // Execute callback after scroll completes
        callback();
      }
    };

    requestAnimationFrame(animation);
  };

  // Reset function with scroll first, then reset
  const handleReset = () => {
    const topSection = document.getElementById('what-matters-section');
    if (topSection) {
      // Scroll first, then reset after scroll completes
      smoothScrollTo(topSection, () => {
        setDropZones({ 0: null, 1: null, 2: null });
      }, -20); // Scroll with 20px offset from top
    } else {
      // Fallback if section not found
      setDropZones({ 0: null, 1: null, 2: null });
    }
  };

  const matchingPlans = allZonesFilled
    ? medicalPlans
        .filter(plan => {
          const hasBenefits = selectedBenefits.every(benefit => plan.benefits.includes(benefit));
          const ageInRange = currentAge >= plan.minAge && currentAge <= plan.maxAge;
          return hasBenefits && ageInRange;
        })
        .sort((a, b) => {
          const priceA = selectedCoverType === 'single' ? a.price : selectedCoverType === 'couple' ? a.couplePrice : a.familyPrice;
          const priceB = selectedCoverType === 'single' ? b.price : selectedCoverType === 'couple' ? b.couplePrice : b.familyPrice;
          return priceA - priceB;
        })
    : [];

  const getDisplayPrice = (plan: MedicalPlan) => {
    switch (selectedCoverType) {
      case 'couple': return plan.couplePrice;
      case 'family': return plan.familyPrice;
      default: return plan.price;
    }
  };

  const getPriceLabel = () => {
    switch (selectedCoverType) {
      case 'couple': return 'for couple';
      case 'family': return 'for family';
      default: return 'per month';
    }
  };

  // Initialize plan config
  const getPlanConfig = (planId: string) => {
    if (!planConfigs[planId]) {
      return { option: 'single', adults: 1, children: 0 };
    }
    return planConfigs[planId];
  };

  // Update plan config
  const updatePlanConfig = (planId: string, updates: Partial<{ option: string; adults: number; children: number }>) => {
    setPlanConfigs(prev => ({
      ...prev,
      [planId]: { ...getPlanConfig(planId), ...updates }
    }));
  };

  // Calculate price based on family configuration
  const calculatePlanPrice = (plan: MedicalPlan, planId: string) => {
    const config = getPlanConfig(planId);
    let total = plan.price; // Main member
    
    if (config.option === 'single') {
      return total;
    }
    
    if (config.option === 'couple') {
      total += plan.spousePrice; // Add spouse
      return total;
    }
    
    if (config.option === 'family') {
      // Add adults (spouse)
      if (config.adults > 1) {
        total += plan.spousePrice * (config.adults - 1);
      }
      // Add children
      total += plan.childPrice * config.children;
    }
    
    return total;
  };

  return (
    <section className="relative py-8 px-4 md:px-6 overflow-hidden bg-white">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Glass focus container for interaction panel */}
        <div className="glass-focus p-6 md:p-8 max-w-6xl mx-auto mb-6 transition-all duration-300 ease-out relative overflow-hidden border-2 border-gray-200 shadow-lg">
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
          
          {/* Content - needs relative positioning to stay above background */}
          <div className="relative z-10">
          {/* Heading */}
          <div id="what-matters-section" className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
              What matters most to you right now?
            </h2>
            <p className="text-xl text-green-600 font-semibold mb-2">
              Drag your top 3.
            </p>
          </div>

          {/* Age and Cover Type Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Your Age */}
            <div>
              <div className="flex justify-center">
                <div className="bg-white/60 backdrop-blur-[10px] md:backdrop-blur-[18px] border-2 border-slate-200 rounded-xl p-3 inline-flex flex-col gap-2">
                  <Label htmlFor="age-slider" className="text-base font-semibold text-slate-700 text-left">
                    Your Age
                  </Label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">{minAge}</span>
                    <div className="w-64">
                      <Slider
                        id="age-slider"
                        min={minAge}
                        max={maxAge}
                        step={1}
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        className="w-full"
                        aria-label="Age slider"
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{maxAge}</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={inputValues[0]}
                      onChange={(e) => handleInputChange(e, 0)}
                      onBlur={(e) => validateAndUpdateValue(e.target.value, 0)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          validateAndUpdateValue(inputValues[0], 0);
                        }
                      }}
                      className="w-16 text-center font-bold h-10 px-2 py-1 bg-green-600 text-white border-green-700 focus:ring-2 focus:ring-green-500 focus:border-green-700 placeholder:text-green-200"
                      aria-label="Enter age"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Type */}
            <div>
              <div className="flex justify-center">
                <div className="bg-white/60 backdrop-blur-[10px] md:backdrop-blur-[18px] border-2 border-slate-200 rounded-xl p-3 inline-flex flex-col gap-2">
                  <Label className="text-base font-semibold text-slate-700 text-left">
                    Cover Type
                  </Label>
                  <div className="flex gap-6">
                    {coverTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedCoverType(type.id)}
                          className={`
                            flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all h-10
                            ${
                              selectedCoverType === type.id
                                ? 'bg-green-600 text-white shadow-lg scale-105'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drop Zones */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 ml-[100px]">
              {[0, 1, 2].map((zoneIndex) => {
                const droppedItem = dropZones[zoneIndex] ? getItemById(dropZones[zoneIndex]!) : null;
                return (
                  <div
                    key={zoneIndex}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(zoneIndex)}
                    className={`w-28 h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                      droppedItem 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 bg-white/60 hover:border-green-400 hover:bg-green-50/50'
                    }`}
                  >
                    {droppedItem ? (
                      <div 
                        className="text-center cursor-pointer"
                        onClick={() => handleRemoveFromZone(zoneIndex)}
                      >
                        <img src={droppedItem.emoji} alt={droppedItem.name} className="w-12 h-12 mx-auto" />
                        <p className="text-xs font-medium text-gray-700 mt-1">{droppedItem.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Click to remove</p>
                      </div>
                    ) : (
                      <>
                        <span className="text-xl text-gray-300">+</span>
                        <p className="text-xs text-gray-400 mt-1">Drop here</p>
                        <p className="text-xs font-bold text-green-600">#{zoneIndex + 1}</p>
                      </>
                    )}
                  </div>
                );
              })}
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-10 px-5 text-sm transition-all duration-200 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Draggable Items */}
          {!allZonesFilled && (
            <div className="flex justify-center">
              <MovingBorderContainer
                borderRadius="1rem"
                duration={35000}
                containerClassName="max-w-4xl"
                className="bg-white/80"
              >
                <div className="grid grid-cols-5 gap-2.5 p-4">
                  {coverOptions.map((item) => {
                    const isInZone = isItemInDropZone(item.id);
                    return (
                      <div
                        key={item.id}
                        draggable={!isInZone}
                        onDragStart={() => handleDragStart(item.id)}
                        className={`p-2.5 rounded-lg border-2 text-center cursor-grab active:cursor-grabbing transition-all ${
                          isInZone
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-green-400 hover:shadow-md hover:scale-105'
                        }`}
                      >
                        <img src={item.emoji} alt={item.name} className="w-12 h-12 mx-auto" />
                        <p className="text-xs font-medium text-gray-700 mt-1.5">{item.name}</p>
                      </div>
                    );
                  })}
                </div>
              </MovingBorderContainer>
            </div>
          )}
          </div>
        </div>

        {/* Matching Plans */}
        {allZonesFilled && (
          <div id="matching-plans-section" className="space-y-6">
            <p className="text-center text-lg text-gray-600">
              {matchingPlans.length > 0 
                ? `${matchingPlans.length} plan${matchingPlans.length > 1 ? 's' : ''} match your selection (Age ${currentAge}, ${selectedCoverType})`
                : `No plans available for age ${currentAge} with your selected benefits`}
            </p>
            
            {matchingPlans.length > 0 && (
              <div className="relative">
                {/* Navigation Arrows - Show if more than 3 plans */}
                {matchingPlans.length > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPlanIndex(Math.max(0, currentPlanIndex - 1))}
                      disabled={currentPlanIndex === 0}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-xl text-gray-700"
                    >
                      ←
                    </button>
                    
                    <button
                      onClick={() => setCurrentPlanIndex(Math.min(matchingPlans.length - 3, currentPlanIndex + 1))}
                      disabled={currentPlanIndex >= matchingPlans.length - 3}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-xl text-gray-700"
                    >
                      →
                    </button>
                  </>
                )}

                {/* Plans Grid - Show 3 at a time */}
                <div className="overflow-hidden px-12">
                  <div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-transform duration-300"
                    style={{
                      transform: `translateX(-${currentPlanIndex * (100 / 3)}%)`
                    }}
                  >
              {matchingPlans.map((plan) => {
                const config = getPlanConfig(plan.id);
                const calculatedPrice = calculatePlanPrice(plan, plan.id);
                const totalMembers = config.option === 'single' 
                  ? 1 
                  : config.option === 'couple' 
                    ? 2 + config.children 
                    : config.adults + config.children;
                
                return (
                  <div
                    key={plan.id}
                    className="p-6 transition-all duration-300 ease-out relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-gray-300 shadow-xl hover:shadow-2xl"
                    style={{ borderColor: '#d1d5db' }}
                  >
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
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-gray-900">{plan.name} <span className="text-sm text-gray-500 font-normal">• {plan.ageRange}</span></h4>
                    </div>

                    <div className="space-y-3 mb-4">
                      {plan.highlights.slice(0, 4).map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
                          <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
                            <img src={highlight.icon} alt={highlight.title} className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{highlight.title}</p>
                            <p className="text-xs text-gray-600">{highlight.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Family Configuration */}
                    <div className="mb-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Family Configuration</p>
                        
                        {/* Options Dropdown */}
                        <select
                          value={config.option}
                          onChange={(e) => {
                            const newOption = e.target.value;
                            updatePlanConfig(plan.id, { 
                              option: newOption,
                              adults: newOption === 'family' ? Math.max(1, config.adults) : newOption === 'couple' ? 2 : 1,
                              children: newOption === 'family' ? config.children : 0
                            });
                          }}
                          className="w-full px-3 py-2 text-sm border-2 border-green-500 rounded-lg bg-white font-semibold text-gray-800 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          <option value="single">Single</option>
                          <option value="couple">Couple</option>
                          <option value="family">Family</option>
                        </select>

                        {/* Adults and Children Counters */}
                        <div className="flex gap-2">
                          {/* Adults Counter */}
                          <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                            <button
                              onClick={() => {
                                if (config.option === 'family') {
                                  updatePlanConfig(plan.id, { adults: Math.max(1, config.adults - 1) });
                                }
                              }}
                              disabled={config.option !== 'family'}
                              className={`w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-sm font-semibold ${
                                config.option === 'family' ? 'hover:bg-gray-300 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                              }`}
                            >
                              -
                            </button>
                            <span className="text-xs">
                              <span className="text-gray-600">Adults </span>
                              <span className="font-semibold">
                                {config.option === 'single' ? 1 : config.option === 'couple' ? 2 : config.adults}
                              </span>
                            </span>
                            <button
                              onClick={() => {
                                if (config.option === 'family') {
                                  const maxAdults = 4 - config.children;
                                  updatePlanConfig(plan.id, { adults: Math.min(maxAdults, config.adults + 1) });
                                }
                              }}
                              disabled={config.option !== 'family'}
                              className={`w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-sm font-semibold ${
                                config.option === 'family' ? 'hover:bg-gray-300 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                              }`}
                            >
                              +
                            </button>
                          </div>

                          {/* Children Counter */}
                          <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                            <button
                              onClick={() => {
                                if (config.option === 'couple' || config.option === 'family') {
                                  updatePlanConfig(plan.id, { children: Math.max(0, config.children - 1) });
                                }
                              }}
                              disabled={config.option === 'single'}
                              className={`w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-sm font-semibold ${
                                config.option !== 'single' ? 'hover:bg-gray-300 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                              }`}
                            >
                              -
                            </button>
                            <span className="text-xs">
                              <span className="text-gray-600">Kids </span>
                              <span className="font-semibold">{config.children}</span>
                            </span>
                            <button
                              onClick={() => {
                                if (config.option === 'couple' || config.option === 'family') {
                                  // Couple can have up to 4 children, Family can have up to 4 total members
                                  const maxChildren = config.option === 'couple' ? 4 : 4 - config.adults;
                                  updatePlanConfig(plan.id, { children: Math.min(maxChildren, config.children + 1) });
                                }
                              }}
                              disabled={config.option === 'single'}
                              className={`w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-sm font-semibold ${
                                config.option !== 'single' ? 'hover:bg-gray-300 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Total Members Display */}
                      <p className="text-[10px] text-gray-500 text-center">
                        {config.option === 'single' && '1 member'}
                        {config.option === 'couple' && config.children === 0 && '2 adults'}
                        {config.option === 'couple' && config.children > 0 && `2 adults + ${config.children} ${config.children === 1 ? 'child' : 'children'}`}
                        {config.option === 'family' && config.children === 0 && `${config.adults} ${config.adults === 1 ? 'adult' : 'adults'}`}
                        {config.option === 'family' && config.children > 0 && `${config.adults} ${config.adults === 1 ? 'adult' : 'adults'} + ${config.children} ${config.children === 1 ? 'child' : 'children'}`}
                      </p>
                    </div>

                    {/* Compact pricing section */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-4 mb-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-white text-sm font-medium">R</span>
                        <span className="text-white text-3xl font-bold">{calculatedPrice}</span>
                        <span className="text-white/80 text-xs">/month</span>
                      </div>
                    </div>

                    {/* SOLID button - NO glass */}
                    <button 
                      onClick={() => {
                        // Map plan IDs to slider indices
                        const planIndexMap: { [key: string]: number } = {
                          'value-plus': 0,           // Value Plus Hospital (R390)
                          'platinum': 1,             // Platinum Hospital (R560)
                          'executive': 2,            // Executive Hospital (R640)
                          'value-plus-senior': 3,    // Value Plus Senior (R580)
                        };
                        
                        const planIndex = planIndexMap[plan.id] || 0;
                        
                        // Dispatch custom event with plan selection
                        window.dispatchEvent(new CustomEvent('selectPlan', { 
                          detail: { planIndex } 
                        }));
                        
                        // Scroll to plan comparison section
                        setTimeout(() => {
                          const planSection = document.getElementById('plan-comparison-section');
                          if (planSection) {
                            planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-md"
                    >
                      View This Plan
                    </button>
                    </div>
                  </div>
                );
              })}
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button Below Plans */}
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-12 px-6 transition-all duration-200 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
