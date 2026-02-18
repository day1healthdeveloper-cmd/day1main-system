"use client";

import { useState } from "react";
import { useSliderWithInput } from "@/components/hooks/use-slider-with-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { MovingBorderContainer } from "@/components/ui/moving-border";
import { User, Users, Home } from "lucide-react";
import { PlanDetail } from "./PlanDetail";

// Draggable benefit items
const benefitItems = [
  { id: 'hospital', label: 'Hospital Cover', icon: '🏥' },
  { id: 'accident', label: 'Accident Cover', icon: '🚗' },
  { id: 'ambulance', label: '24hr Ambulance', icon: '🚑' },
  { id: 'doctor', label: 'Virtual Doctor', icon: '👨‍⚕️' },
  { id: 'funeral', label: 'Funeral Cover', icon: '⚰️' },
  { id: 'maternity', label: 'Maternity', icon: '👶' },
  { id: 'critical', label: 'Critical Illness', icon: '❤️' },
  { id: 'disability', label: 'Disability', icon: '♿' },
  { id: 'cancer', label: 'Cancer Cover', icon: '🎗️' },
  { id: 'heart', label: 'Heart Attack', icon: '💔' },
  { id: 'stroke', label: 'Stroke Cover', icon: '🧠' },
  { id: 'kidney', label: 'Kidney Failure', icon: '🫘' },
];

// Medical plans with their benefits and pricing
// Pricing formula: Single = base, Couple = base + spouse, Family = base + spouse + child
const medicalPlans = [
  {
    id: 'value-plus',
    name: 'Value Plus Hospital',
    ageRange: 'Ages 18-64',
    minAge: 18,
    maxAge: 64,
    price: 390,        // Single base price
    spousePrice: 312,  // Additional spouse price
    childPrice: 156,   // Additional per child price
    benefits: ['hospital', 'accident', 'ambulance', 'doctor', 'funeral'],
    highlights: [
      { icon: '🏥', title: 'Hospital Cover', details: 'R10,000/day up to 21 days' },
      { icon: '🚗', title: 'Accident Cover', details: 'R150,000 single / R300,000 family' },
      { icon: '🚑', title: '24hr Ambulance', details: 'Immediate cover' },
      { icon: '⚰️', title: 'Funeral Cover', details: 'R20,000 member & spouse' },
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Hospital',
    ageRange: 'All ages',
    minAge: 18,
    maxAge: 75,
    price: 560,        // Single base price
    spousePrice: 448,  // Additional spouse price
    childPrice: 224,   // Additional per child price
    benefits: ['hospital', 'accident', 'ambulance', 'doctor', 'funeral', 'maternity', 'critical', 'disability', 'cancer', 'heart', 'stroke', 'kidney'],
    highlights: [
      { icon: '🏥', title: 'Hospital Cover', details: 'R10,000/day up to 21 days' },
      { icon: '❤️', title: 'Critical Illness', details: 'Up to R250,000' },
      { icon: '👶', title: 'Maternity', details: 'R20,000 birth benefit' },
      { icon: '♿', title: 'Disability', details: 'R250,000 cover' },
    ]
  },
  {
    id: 'executive',
    name: 'Executive Hospital',
    ageRange: 'All ages',
    minAge: 18,
    maxAge: 75,
    price: 640,        // Single base price
    spousePrice: 512,  // Additional spouse price
    childPrice: 256,   // Additional per child price
    benefits: ['hospital', 'accident', 'ambulance', 'doctor', 'funeral', 'maternity', 'critical', 'disability', 'cancer', 'heart', 'stroke', 'kidney'],
    highlights: [
      { icon: '🏥', title: 'Hospital Cover', details: 'R10,000/day + R25,000 top-up' },
      { icon: '🚗', title: 'Accident Cover', details: 'R250,000 single / R500,000 family' },
      { icon: '❤️', title: 'Critical Illness', details: 'R50,000 cover' },
      { icon: '⚰️', title: 'Funeral Cover', details: 'R30,000 member & spouse' },
    ]
  },
  {
    id: 'value-plus-senior',
    name: 'Value Plus Senior',
    ageRange: '65 years & older',
    minAge: 65,
    maxAge: 75,
    price: 580,        // Single base price
    spousePrice: 580,  // Additional spouse price (same as base for seniors)
    childPrice: 0,     // No children for senior plans
    benefits: ['hospital', 'accident', 'ambulance', 'doctor', 'funeral'],
    highlights: [
      { icon: '🏥', title: 'Hospital Cover', details: 'R10,000/day up to 21 days' },
      { icon: '🚗', title: 'Accident Cover', details: 'R75,000 single / R150,000 family' },
      { icon: '🚑', title: '24hr Ambulance', details: 'Immediate cover' },
      { icon: '⚰️', title: 'Funeral Cover', details: 'R5,000 member & spouse' },
    ]
  },
];

export function ThreePlanCards() {
  const [selectedFamily, setSelectedFamily] = useState<string>('single');
  const [dropZones, setDropZones] = useState<{ [key: number]: string | null }>({
    0: null,
    1: null,
    2: null,
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
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

  const familyTypes = [
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

  const getItemById = (id: string) => benefitItems.find(item => item.id === id);

  const isItemInDropZone = (itemId: string) => {
    return Object.values(dropZones).includes(itemId);
  };

  // Check if all 3 zones are filled
  const allZonesFilled = dropZones[0] && dropZones[1] && dropZones[2];

  // Get selected benefit IDs
  const selectedBenefits = Object.values(dropZones).filter(Boolean) as string[];

  // Get current age from slider
  const currentAge = sliderValue[0];

  // Filter and sort plans based on benefits, age, and family type
  const matchingPlans = allZonesFilled
    ? medicalPlans
        .filter(plan => {
          // Check if plan has all selected benefits
          const hasBenefits = selectedBenefits.every(benefit => plan.benefits.includes(benefit));
          // Check if age is within plan's range
          const ageInRange = currentAge >= plan.minAge && currentAge <= plan.maxAge;
          return hasBenefits && ageInRange;
        })
        .sort((a, b) => {
          // Sort by the price for selected family type
          const priceA = selectedFamily === 'single' ? a.price : selectedFamily === 'couple' ? a.price + a.spousePrice : a.price + a.spousePrice + a.childPrice;
          const priceB = selectedFamily === 'single' ? b.price : selectedFamily === 'couple' ? b.price + b.spousePrice : b.price + b.spousePrice + b.childPrice;
          return priceA - priceB;
        })
    : [];

  // Helper to get display price based on family type
  const getDisplayPrice = (plan: typeof medicalPlans[0]) => {
    switch (selectedFamily) {
      case 'couple': 
        return plan.price + plan.spousePrice; // Couple = base + spouse
      case 'family': 
        return plan.price + plan.spousePrice + plan.childPrice; // Family = couple + 1 child
      default: 
        return plan.price; // Single = base price
    }
  };

  // Helper to get price label
  const getPriceLabel = () => {
    switch (selectedFamily) {
      case 'couple': return 'for 2 adults';
      case 'family': return 'for 2 adults + 1 child';
      default: return 'per month';
    }
  };

  return (
    <section id="choose-cover" className="py-20 px-4 md:px-8 bg-white">
      <style jsx global>{`
        :root {
          --green-500: #22c55e;
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Choose the Cover that matters NOW!
          </h2>
        </div>

        {/* Age Slider + Family Selector Row */}
        <div className="flex items-center justify-center gap-8 -mt-4">
          <div className="flex-1 max-w-md">
            <Label className="text-lg font-bold text-gray-800 block mb-3">Your Age</Label>
            <MovingBorderContainer
              borderRadius="1rem"
              duration={35000}
              className="p-4"
              borderClassName="bg-[radial-gradient(#22c55e_40%,transparent_60%)]"
            >
              <div className="flex items-center gap-4 w-full">
                <span className="text-sm text-gray-500 font-medium">{minAge}</span>
                <Slider
                  className="flex-1"
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  min={minAge}
                  max={maxAge}
                  orientation="horizontal"
                  aria-label="Age slider"
                  showTooltip
                  tooltipContent={(value) => `${value} years`}
                />
                <span className="text-sm text-gray-500 font-medium">{maxAge}</span>
                <Input
                  className="h-10 w-16 px-2 py-1 text-center text-lg font-bold border-gray-300"
                  type="text"
                  inputMode="decimal"
                  value={inputValues[0]}
                  onChange={(e) => handleInputChange(e, 0)}
                  onBlur={() => validateAndUpdateValue(inputValues[0], 0)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      validateAndUpdateValue(inputValues[0], 0);
                    }
                  }}
                  aria-label="Enter age"
                />
              </div>
            </MovingBorderContainer>
          </div>

          <div>
            <Label className="text-lg font-bold text-gray-800 block mb-3">Cover Type</Label>
            <MovingBorderContainer
              borderRadius="0.5rem"
              duration={35000}
              className="p-3"
              borderClassName="bg-[radial-gradient(#22c55e_40%,transparent_60%)]"
            >
              <ButtonGroup size="lg" className="h-full">
                {familyTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedFamily === type.id;
                  return (
                    <Button
                      key={type.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setSelectedFamily(type.id)}
                      className={`transition-all duration-200 border-0 h-12 ${
                        isSelected 
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg scale-105' 
                          : 'hover:bg-green-50'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {type.label}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </MovingBorderContainer>
          </div>
        </div>

        {/* Drag and Drop Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
            What matters most to you? <span className="text-green-600">Drag your top 3</span>
          </h3>

          {/* 3 Drop Zones + Reset Button */}
          <div className="flex justify-center items-center gap-4 mb-8">
            {[0, 1, 2].map((zoneIndex) => {
              const droppedItem = dropZones[zoneIndex] ? getItemById(dropZones[zoneIndex]!) : null;
              return (
                <div
                  key={zoneIndex}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(zoneIndex)}
                  className={`w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    droppedItem 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50'
                  }`}
                >
                  {droppedItem ? (
                    <div 
                      className="text-center cursor-pointer"
                      onClick={() => handleRemoveFromZone(zoneIndex)}
                    >
                      <span className="text-3xl">{droppedItem.icon}</span>
                      <p className="text-xs font-medium text-gray-700 mt-1">{droppedItem.label}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Click to remove</p>
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl text-gray-300">+</span>
                      <p className="text-xs text-gray-400 mt-1">Drop here</p>
                      <p className="text-xs font-bold text-green-600">#{zoneIndex + 1}</p>
                    </>
                  )}
                </div>
              );
            })}
            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={() => setDropZones({ 0: null, 1: null, 2: null })}
              className="h-12 px-6 transition-all duration-200 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              Reset
            </Button>
          </div>

          {/* Show 12 items OR matching plans gallery */}
          {!allZonesFilled ? (
            /* 12 Draggable Items (4x3 grid) */
            <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
              {benefitItems.map((item) => {
                const isInZone = isItemInDropZone(item.id);
                return (
                  <div
                    key={item.id}
                    draggable={!isInZone}
                    onDragStart={() => handleDragStart(item.id)}
                    className={`p-4 rounded-xl border-2 text-center cursor-grab active:cursor-grabbing transition-all ${
                      isInZone
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-green-400 hover:shadow-md hover:scale-105'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-xs font-medium text-gray-700 mt-2">{item.label}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Matching Plans Gallery */
            <div className="space-y-6">
              <p className="text-center text-lg text-gray-600">
                {matchingPlans.length > 0 
                  ? `${matchingPlans.length} plan${matchingPlans.length > 1 ? 's' : ''} match your selection (Age ${currentAge}, ${selectedFamily})`
                  : `No plans available for age ${currentAge} with your selected benefits`}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all hover:scale-[1.02]"
                  >
                    {/* Plan Header */}
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-500">{plan.ageRange}</p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="space-y-3 mb-4">
                      {plan.highlights.slice(0, 4).map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <span className="text-sm">{highlight.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{highlight.title}</p>
                            <p className="text-xs text-gray-600">{highlight.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Banner */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-center mb-4">
                      <p className="text-white text-sm">
                        {selectedFamily === 'single' ? 'Starting from' : `Price ${getPriceLabel()}`}
                      </p>
                      <p className="text-yellow-400 text-3xl font-bold">R{getDisplayPrice(plan)}</p>
                      <p className="text-white text-xs">per month</p>
                    </div>

                    {/* Family Pricing */}
                    {selectedFamily === 'single' && (
                      <div className="text-center text-sm text-gray-600 mb-4">
                        <p>+Spouse: R{plan.spousePrice} | +Child: R{plan.childPrice}</p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button 
                      onClick={() => setSelectedPlan(plan.id)}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
                    >
                      View This Plan
                    </button>
                  </div>
                ))}
              </div>

              {/* Reset Button */}
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDropZones({ 0: null, 1: null, 2: null })}
                  className="h-12 px-6 transition-all duration-200 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <PlanDetail 
          planId={selectedPlan} 
          onClose={() => setSelectedPlan(null)}
          familyType={selectedFamily}
        />
      )}
    </section>
  );
}
