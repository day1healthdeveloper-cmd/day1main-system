export type Plan = {
  id: string;
  name: string;
  tagline: string;
  bullets: string[];
  pricing: {
    main: number;
    spouse: number;
    child: number;
  };
  badges: string[];
  image: string;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Ultra Value Plus Starter",
    tagline: "Ages 18-40",
    bullets: [
      "Accident Cover: R50K (first 3 months) → R100K",
      "24/7 Ambulance Assist",
      "Private In-Hospital Illness Cover: R10K/day (3 days max)",
      "Virtual Doctor Consultations",
    ],
    pricing: {
      main: 189,
      spouse: 140,
      child: 70,
    },
    badges: ["Immediate Cover", "Ages 18-40"],
    image: "/plans/starter.jpg",
  },
  {
    id: "priority",
    name: "Ultra Value Plus Priority",
    tagline: "Ages 18-64",
    bullets: [
      "Accident Cover: R50K (first 3 months) → R100K",
      "24/7 Ambulance Assist",
      "Private In-Hospital Illness Cover: R10K/day (3 days max)",
      "R20,000 Funeral Cover + Car Hire + Airtime",
    ],
    pricing: {
      main: 249,
      spouse: 140,
      child: 70,
    },
    badges: ["Immediate Cover", "Best Value"],
    image: "/plans/priority.jpg",
  },
  {
    id: "value-plus",
    name: "Value Plus Hospital",
    tagline: "Ages 18-64",
    bullets: [
      "Unlimited Accident & Illness Events",
      "Private In-Hospital Illness Cover",
      "24/7 Ambulance Assist",
      "Virtual Doctor Consultations",
    ],
    pricing: {
      main: 390,
      spouse: 312,
      child: 156,
    },
    badges: ["Unlimited Events", "Ages 18-64"],
    image: "/plans/value-plus.jpg",
  },
  {
    id: "senior",
    name: "Value Plus Senior",
    tagline: "Ages 65+",
    bullets: [
      "Unlimited Accident & Illness Events",
      "Private In-Hospital Illness Cover",
      "24/7 Ambulance Assist",
      "Virtual Doctor Consultations",
    ],
    pricing: {
      main: 580,
      spouse: 580,
      child: 0,
    },
    badges: ["Ages 65+", "Unlimited Events"],
    image: "/plans/senior.jpg",
  },
  {
    id: "platinum",
    name: "Platinum Hospital",
    tagline: "Premium protection",
    bullets: [
      "Unlimited Accident & Illness Events",
      "Critical Illness Cover",
      "Accidental Permanent Disability",
      "Private In-Hospital Illness Cover",
    ],
    pricing: {
      main: 560,
      spouse: 448,
      child: 224,
    },
    badges: ["Critical Illness", "Premium"],
    image: "/plans/platinum.jpg",
  },
  {
    id: "executive",
    name: "Executive Hospital",
    tagline: "Maximum coverage",
    bullets: [
      "All Platinum Benefits",
      "Higher Accident Cover",
      "Illness Top-Up Benefit",
      "Enhanced Funeral Benefits",
    ],
    pricing: {
      main: 640,
      spouse: 512,
      child: 256,
    },
    badges: ["Top Tier", "Maximum Cover"],
    image: "/plans/executive.jpg",
  },
];
