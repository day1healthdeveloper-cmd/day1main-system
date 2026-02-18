"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

// Full plan data with all benefits
const fullPlanData: { [key: string]: any } = {
  'value-plus': {
    name: 'Value Plus Hospital Plan',
    ageRange: 'Under 65 years',
    pricing: {
      single: 390,
      couple: 702,
      family: [
        { label: 'Member + 1 Child', price: 546 },
        { label: 'Member + 2 Children', price: 702 },
        { label: 'Member + 3 Children', price: 858 },
        { label: 'Member + 4 Children', price: 1014 },
        { label: 'Couple', price: 702 },
        { label: 'Couple + 1 Child', price: 858 },
        { label: 'Couple + 2 Children', price: 1014 },
        { label: 'Couple + 3 Children', price: 1170 },
        { label: 'Couple + 4 Children', price: 1326 },
      ],
      addSpouse: 312,
      addChild: 156,
    },
    benefits: [
      {
        icon: '🏥',
        title: 'In-Hospital Illness Benefit',
        details: [
          'R10,000 after first 24 hours',
          'R10,000 for second day',
          'R1,500 for third day onwards',
          'Up to 21 days maximum',
        ],
        waitingPeriod: '3 months',
        preExisting: '12 months exclusion',
      },
      {
        icon: '🚗',
        title: 'Accident/Trauma Benefit',
        details: [
          'R150,000 single member',
          'R300,000 family incident',
        ],
        waitingPeriod: '1 month',
      },
      {
        icon: '⚰️',
        title: 'Funeral Benefit',
        details: [
          'R20,000 principal member',
          'R20,000 spouse',
          'R10,000 child over 14',
          'R5,000 child over 6',
          'R2,500 child over 0',
        ],
        waitingPeriod: '3 months',
      },
      {
        icon: '🚑',
        title: '24 Hour Emergency Services',
        details: [
          '24 Hour Ambulance Assist',
          'Pre-authorisation service',
          'Medical advice hotline',
          'Virtual Doctor Consultations',
        ],
        waitingPeriod: 'Immediate Cover',
      },
    ],
    partners: ['Life Healthcare', 'Mediclinic', 'Africa Health Care', 'Clinix', 'Africa Assist'],
  },
  'platinum': {
    name: 'Platinum Hospital Plan',
    ageRange: 'All ages',
    pricing: {
      single: 560,
      couple: 1008,
      family: [
        { label: 'Member + 1 Child', price: 784 },
        { label: 'Member + 2 Children', price: 1008 },
        { label: 'Member + 3 Children', price: 1232 },
        { label: 'Member + 4 Children', price: 1456 },
        { label: 'Couple', price: 1008 },
        { label: 'Couple + 1 Child', price: 1232 },
        { label: 'Couple + 2 Children', price: 1456 },
        { label: 'Couple + 3 Children', price: 1680 },
        { label: 'Couple + 4 Children', price: 1904 },
      ],
      addSpouse: 448,
      addChild: 224,
    },
    benefits: [
      {
        icon: '🏥',
        title: 'In-Hospital Illness Benefit',
        details: [
          'R10,000 after first 24 hours',
          'R10,000 for second day',
          'R10,000 for third day',
          'R1,500 per day thereafter',
          'Up to 21 days maximum',
        ],
        waitingPeriod: '3 months',
        preExisting: '12 months exclusion',
      },
      {
        icon: '🚗',
        title: 'Accident/Trauma Benefit',
        details: [
          'R150,000 single member',
          'R300,000 family incident',
          'Immediate cover',
        ],
        waitingPeriod: 'Immediate Cover',
      },
      {
        icon: '👶',
        title: 'Maternity Benefit',
        details: [
          'R20,000 for birth in hospital',
          'Available to members 16+',
        ],
        waitingPeriod: '12 months',
      },
      {
        icon: '❤️',
        title: 'Critical Illness Benefit',
        details: [
          'Up to R250,000 cover',
          'Cancer, Heart Attack, Stroke',
          'Kidney Failure, Organ Donor',
          '1 incident per family per year',
        ],
        waitingPeriod: '3 months',
      },
      {
        icon: '♿',
        title: 'Accidental Permanent Disability',
        details: [
          'R250,000 cover',
          'Principal member only',
        ],
        waitingPeriod: 'Immediate Cover',
      },
      {
        icon: '⚰️',
        title: 'Funeral Benefit',
        details: [
          'R20,000 principal member',
          'R20,000 spouse',
          'R10,000 child over 14',
          'R5,000 child over 6',
        ],
        waitingPeriod: '3 months',
      },
      {
        icon: '🚑',
        title: '24 Hour Emergency Services',
        details: [
          '24 Hour Ambulance Assist',
          'Virtual Doctor Consultations',
        ],
        waitingPeriod: 'Immediate Cover',
      },
    ],
    partners: ['Life Healthcare', 'Mediclinic', 'Africa Health Care', 'Clinix', 'Africa Assist'],
  },
  'executive': {
    name: 'Executive Hospital Plan',
    ageRange: 'All ages',
    pricing: {
      single: 640,
      couple: 1152,
      family: [
        { label: 'Member + 1 Child', price: 896 },
        { label: 'Member + 2 Children', price: 1152 },
        { label: 'Member + 3 Children', price: 1408 },
        { label: 'Member + 4 Children', price: 1664 },
        { label: 'Couple', price: 1152 },
        { label: 'Couple + 1 Child', price: 1408 },
        { label: 'Couple + 2 Children', price: 1664 },
        { label: 'Couple + 3 Children', price: 1920 },
        { label: 'Couple + 4 Children', price: 2176 },
      ],
      addSpouse: 512,
      addChild: 256,
    },
    benefits: [
      {
        icon: '🏥',
        title: 'In-Hospital Illness Benefit',
        details: [
          'R10,000 after first 24 hours',
          'R10,000 for second day',
          'R10,000 for third day',
          'R2,000 per day thereafter',
          'Up to 21 days maximum',
        ],
        waitingPeriod: '3 months',
        preExisting: '12 months exclusion',
      },
      {
        icon: '💊',
        title: 'Illness Top-Up',
        details: [
          'R25,000 per person per year',
          'Up to 2 events per family',
        ],
        waitingPeriod: '3 months',
      },
      {
        icon: '🚗',
        title: 'Accident/Trauma Benefit',
        details: [
          'R250,000 single member',
          'R500,000 family incident',
          'Immediate cover',
        ],
        waitingPeriod: 'Immediate Cover',
      },
      {
        icon: '👶',
        title: 'Maternity Benefit',
        details: [
          'R20,000 for birth in hospital',
          'Available to members 14+',
        ],
        waitingPeriod: '12 months',
      },
      {
        icon: '❤️',
        title: 'Critical Illness Benefit',
        details: [
          'R50,000 cover',
          'Cancer, Heart Attack, Stroke',
          'Kidney Failure, Organ Donor',
        ],
        waitingPeriod: '3 months',
      },
      {
        icon: '♿',
        title: 'Accidental Permanent Disability',
        details: [
          'R250,000 cover',
          'Principal member only',
        ],
        waitingPeriod: 'Immediate Cover',
      },
      {
        icon: '⚰️',
        title: 'Funeral Benefit',
        details: [
          'R30,000 principal member',
          'R30,000 spouse',
          'R10,000 child over 14',
          'R5,000 child over 6',
        ],
        waitingPeriod: '3 months',
      },
      {
        icon: '🚑',
        title: '24 Hour Emergency Services',
        details: [
          '24 Hour Ambulance Assist',
          'Virtual Doctor Consultations',
        ],
        waitingPeriod: 'Immediate Cover',
      },
    ],
    partners: ['Life Healthcare', 'Mediclinic', 'Africa Health Care', 'Clinix', 'Africa Assist'],
  },
  'value-plus-senior': {
    name: 'Value Plus Senior Plan',
    ageRange: '65 years & older',
    pricing: {
      single: 580,
      couple: 1160,
      family: [
        { label: 'Senior Member', price: 580 },
        { label: 'Senior Couple', price: 1160 },
      ],
      addSpouse: 580,
      addChild: 0,
    },
    benefits: [
      {
        icon: '🏥',
        title: 'In-Hospital Illness Benefit',
        details: [
          'R10,000 after first 24 hours',
          'R10,000 for second day',
          'R10,000 for third day',
          'R1,500 per day thereafter',
          'Up to 21 days maximum',
        ],
        waitingPeriod: '3 months',
        preExisting: '12 months exclusion',
      },
      {
        icon: '🚗',
        title: 'Accident/Trauma Benefit',
        details: [
          'R75,000 single member',
          'R150,000 family incident',
          'Max 2 events',
        ],
        waitingPeriod: '1 month',
      },
      {
        icon: '⚰️',
        title: 'Funeral Benefit',
        details: [
          'R5,000 principal member',
          'R5,000 spouse',
        ],
        waitingPeriod: '3 months',
      },
      {
        icon: '🚑',
        title: '24 Hour Emergency Services',
        details: [
          '24 Hour Ambulance Assist',
          'Virtual Doctor Consultations',
        ],
        waitingPeriod: 'Immediate Cover',
      },
    ],
    exclusions: ['Sports Injuries', 'Maternity Benefits'],
    partners: ['Life Healthcare', 'Mediclinic', 'Africa Health Care', 'Clinix', 'Africa Assist'],
  },
};

interface PlanDetailProps {
  planId: string;
  onClose: () => void;
  familyType: string;
}

export function PlanDetail({ planId, onClose, familyType }: PlanDetailProps) {
  const plan = fullPlanData[planId];
  const [familyOption, setFamilyOption] = useState<'single' | 'couple' | 'family'>('single');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  
  if (!plan) return null;

  const calculateTotalPrice = () => {
    let total = plan.pricing.single;
    
    if (familyOption === 'couple') {
      total = plan.pricing.single + plan.pricing.addSpouse;
    } else if (familyOption === 'family') {
      total = plan.pricing.single + (adults - 1) * plan.pricing.addSpouse + children * plan.pricing.addChild;
    }
    
    return total;
  };

  const handleAdultsChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(4, adults + delta));
    setAdults(newValue);
  };

  const handleChildrenChange = (delta: number) => {
    const maxChildren = Math.max(0, 4 - adults);
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

  const getDisplayPrice = () => {
    return calculateTotalPrice();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">{plan.name}</h2>
            <p className="text-green-100 mt-1">{plan.ageRange}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Price Banner - Smaller */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 mb-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Starting from</p>
            <p className="text-3xl font-bold text-green-600">R{getDisplayPrice()}</p>
            <p className="text-gray-500 text-sm">per month</p>
          </div>

          {/* Family Configuration - Compact */}
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Configure Your Plan</h3>
            <div className="space-y-2">
              {/* Options Dropdown */}
              <div>
                <label className="block text-gray-600 text-xs mb-1">Options</label>
                <select 
                  value={familyOption}
                  onChange={(e) => handleFamilyOptionChange(e.target.value as 'single' | 'couple' | 'family')}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:border-green-600 outline-none"
                >
                  <option value="single">Single</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                </select>
              </div>

              {/* Adults Counter */}
              <div>
                <label className="block text-gray-600 text-xs mb-1">Adults 18+</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAdultsChange(-1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-600 text-base hover:bg-gray-50"
                  >-</button>
                  <div className="w-14 h-8 rounded-lg border border-green-400 bg-green-50 flex items-center justify-center text-green-600 text-base font-semibold">{adults}</div>
                  <button 
                    onClick={() => handleAdultsChange(1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-600 text-base hover:bg-gray-50"
                  >+</button>
                </div>
              </div>

              {/* Children Counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-600 text-xs">Children 0-21</label>
                  <span className="text-gray-400 text-[10px]">0-{4 - adults}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleChildrenChange(-1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-600 text-base hover:bg-gray-50"
                  >-</button>
                  <div className="w-14 h-8 rounded-lg border border-green-400 bg-green-50 flex items-center justify-center text-green-600 text-base font-semibold">{children}</div>
                  <button 
                    onClick={() => handleChildrenChange(1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-600 text-base hover:bg-gray-50"
                  >+</button>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Monthly Premium:</span>
                  <span className="text-2xl font-bold text-green-600">R{calculateTotalPrice()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Plan Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {plan.benefits.map((benefit: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{benefit.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{benefit.title}</h4>
                    <ul className="mt-2 space-y-1">
                      {benefit.details.map((detail: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        benefit.waitingPeriod === 'Immediate Cover' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {benefit.waitingPeriod === 'Immediate Cover' ? '✓ Immediate' : `⏱ ${benefit.waitingPeriod} wait`}
                      </span>
                      {benefit.preExisting && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {benefit.preExisting}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exclusions */}
          {plan.exclusions && (
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-red-800 mb-2">Exclusions</h4>
              <ul className="text-sm text-red-700">
                {plan.exclusions.map((exc: string, i: number) => (
                  <li key={i}>• {exc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing Table */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Full Pricing</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              {plan.pricing.family.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between py-2 px-3 bg-white rounded-lg">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-bold text-green-600">R{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Hospitals */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Partner Hospitals</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {plan.partners.map((partner: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {partner}
              </span>
            ))}
          </div>

          {/* Sign Up Form */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Sign Up Now</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Full Name"
                className="px-4 py-3 rounded-lg text-gray-900 w-full"
              />
              <input 
                type="tel" 
                placeholder="Phone Number"
                className="px-4 py-3 rounded-lg text-gray-900 w-full"
              />
            </div>
            <input 
              type="email" 
              placeholder="Email Address"
              className="px-4 py-3 rounded-lg text-gray-900 w-full mb-4"
            />
            <Button className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg rounded-lg">
              Complete 1-Minute Sign Up
            </Button>
            <p className="text-xs text-green-100 text-center mt-3">
              By signing up you agree to our Terms & Conditions and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
