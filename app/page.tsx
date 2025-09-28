import { Suspense, ReactNode } from 'react';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import Testimonials3 from "@/components/Testimonials3";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AnnouncementsBanner from "@/components/AnnouncementsBanner";
import { Metadata } from 'next';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'TuneForge - AI-Powered Music Creation Platform | Audio Experience',
  description: 'Create studio-quality music in seconds with TuneForge. AI-powered music generation platform for content creators, game developers, and music enthusiasts. No experience needed - just bring your ideas!',
  keywords: 'AI music generation, music creation, Suno API, royalty-free music, content creator music, game music, TuneForge, AI composer',
};

export default function Home(): JSX.Element {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main>
        {/* TuneForge - AI-powered music creation platform */}
        <div className="container mx-auto px-4">
          <AnnouncementsBanner />
        </div>
        <Hero />
        <Problem />
        <Solution />
        <FeaturesAccordion />
        <Pricing />
        <Testimonials3 />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
