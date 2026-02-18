'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Hero } from '@/components/landing-page/Hero';
import { WhyThisWorks } from '@/components/landing-page/WhyThisWorks';
import { SingleCoverSlider } from '@/components/landing-page/SingleCoverSlider';
import { FromConfusionToCover } from '@/components/landing-page/FromConfusionToCover';
import { WhatMattersMost } from '@/components/landing-page/WhatMattersMost';
import { SpeedProcessConfirmation } from '@/components/landing-page/SpeedProcessConfirmation';
import { PlanComparisonDemoted } from '@/components/landing-page/PlanComparisonDemoted';
import { FinalCTA } from '@/components/landing-page/FinalCTA';
import { BottomCTA } from '@/components/landing-page/BottomCTA';
import { Footer } from '@/components/landing-page/Footer';

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  template: string;
  content: any;
  status: string;
}

export default function LandingPageView() {
  const params = useParams();
  const slug = params.slug as string;
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLandingPage() {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/public/landing-pages/slug/${slug}`);
        
        if (!response.ok) {
          throw new Error('Landing page not found');
        }

        const data = await response.json();
        setLandingPage(data);
        
        // Update page title and meta
        if (data.title) {
          document.title = data.title;
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLandingPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The landing page you are looking for does not exist.'}</p>
          <a href="/" className="text-green-600 hover:text-green-700 font-semibold">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Render based on template
  if (landingPage.template === 'day1health') {
    return (
      <main className="min-h-screen">
        <Hero />
        <WhyThisWorks />
        <SingleCoverSlider />
        <WhatMattersMost />
        <SpeedProcessConfirmation />
        <PlanComparisonDemoted />
        <BottomCTA />
        <Footer />
      </main>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Template Not Supported</h1>
        <p className="text-gray-600">This landing page template is not yet implemented.</p>
      </div>
    </div>
  );
}
