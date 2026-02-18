import { PlanSlider } from "./components/PlanSlider";
import { ValuePromiseStrip } from "./components/ValuePromiseStrip";
import { ThreePlanCards } from "./components/ThreePlanCards";
import { UnlimitedEventsBanner } from "./components/UnlimitedEventsBanner";
import { WhatYouGet } from "./components/WhatYouGet";
import { BrochureDownloads } from "./components/BrochureDownloads";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <PlanSlider />
      <ValuePromiseStrip />
      <ThreePlanCards />
      <UnlimitedEventsBanner />
      <WhatYouGet />
      <BrochureDownloads />
      <FinalCTA />
      <Footer />
    </main>
  );
}
