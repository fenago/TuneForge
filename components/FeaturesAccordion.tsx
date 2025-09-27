"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import Image from "next/image";

interface Feature {
  title: string;
  description: string;
  type?: "video" | "image";
  path?: string;
  format?: string;
  alt?: string;
  svg?: JSX.Element;
}

// TuneForge Features: Interactive accordion showcasing key capabilities
const features = [
  {
    title: "AI-Powered Vocals & Instrumentals",
    description:
      "Generate songs with realistic vocals or create purely instrumental tracks in any genre. Our advanced AI understands musical structure, harmony, and emotion to create professional-quality compositions.",
    type: "image",
    path: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop",
    alt: "AI music generation dashboard interface",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    ),
  },
  {
    title: "Customize and Remix",
    description:
      "Extend your creations, swap out sounds, or replace sections to make every track uniquely yours. Our AI understands your creative intent and helps you iterate until it's perfect.",
    type: "image",
    path: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop",
    alt: "Music customization and remixing interface",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
        />
      </svg>
    ),
  },
  {
    title: "Commercial-Ready & Royalty-Free",
    description:
      "Use your music in any project, from YouTube videos to commercial products, with complete peace of mind. Every track comes with full commercial licensing included.",
    type: "image",
    path: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop",
    alt: "Commercial music licensing and business use",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    title: "Simple for Beginners, Powerful for Pros",
    description:
      "Whether you're just starting out or you're a seasoned producer, TuneForge adapts to your workflow. Intuitive for newcomers, with advanced features that professionals love.",
    type: "image",
    path: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&auto=format&fit=crop",
    alt: "User-friendly music production interface",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
        />
      </svg>
    ),
  },
] as Feature[];

// An SEO-friendly accordion component including the title and a description (when clicked.)
const Item = ({
  feature,
  isOpen,
  setFeatureSelected,
}: {
  index: number;
  feature: Feature;
  isOpen: boolean;
  setFeatureSelected: () => void;
}) => {
  const accordion = useRef(null);
  const { title, description, svg } = feature;

  return (
    <li className={`group border-l-4 transition-all duration-500 cursor-pointer ${
      isOpen 
        ? 'border-tuneforge-blue-violet bg-gradient-to-r from-tuneforge-blue-violet/10 to-transparent shadow-lg' 
        : 'border-gray-200 hover:border-tuneforge-medium-purple hover:shadow-md'
    }`}>
      <button
        className="relative flex gap-4 items-center w-full py-6 px-6 text-left transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent"
        onClick={(e) => {
          e.preventDefault();
          setFeatureSelected();
        }}
        aria-expanded={isOpen}
      >
        <span className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? "bg-tuneforge-gradient text-white shadow-xl scale-110 animate-pulse" 
            : "bg-gray-100 text-gray-600 group-hover:bg-tuneforge-gradient group-hover:text-white group-hover:scale-105 group-hover:rotate-12"
        }`}>
          {svg}
        </span>
        <div className="flex-1">
          <h3 className={`font-inter font-semibold text-lg transition-all duration-300 ${
            isOpen ? "text-tuneforge-blue-violet transform scale-105" : "text-gray-900 group-hover:text-tuneforge-blue-violet group-hover:transform group-hover:translate-x-2"
          }`}>
            {title}
          </h3>
          {!isOpen && (
            <p className="font-inter text-sm text-gray-500 mt-1 group-hover:text-tuneforge-blue-violet/70 transition-colors duration-300">
              Click to explore this feature →
            </p>
          )}
          {isOpen && (
            <div className="flex items-center gap-2 mt-2 animate-fadeIn">
              <div className="w-2 h-2 bg-tuneforge-gradient rounded-full animate-pulse"></div>
              <span className="text-xs text-tuneforge-blue-violet font-medium">Currently viewing</span>
            </div>
          )}
        </div>
        <div className={`transition-all duration-300 ${
          isOpen 
            ? 'rotate-90 text-tuneforge-blue-violet scale-110' 
            : 'group-hover:translate-x-1 group-hover:text-tuneforge-blue-violet'
        }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'animate-slideDown' : ''
        }`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="px-6 pb-6 pt-2 border-l-2 border-tuneforge-gradient ml-6">
          <p className="font-inter text-gray-600 leading-relaxed mb-4">{description}</p>
          <div className="flex items-center gap-2 text-sm text-tuneforge-blue-violet">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Available now</span>
          </div>
        </div>
      </div>
    </li>
  );
};

// TuneForge Media Display: Shows feature images with enhanced styling
const Media = ({ feature }: { feature: Feature }) => {
  const { type, path, format, alt } = feature;
  const style = "rounded-2xl aspect-video w-full shadow-2xl border border-gray-200";
  const size = {
    width: 600,
    height: 400,
  };

  if (type === "video") {
    return (
      <video
        className={style}
        autoPlay
        muted
        loop
        playsInline
        controls
        width={size.width}
        height={size.height}
      >
        <source src={path} type={format} />
      </video>
    );
  } else if (type === "image") {
    return (
      <Image
        src={path}
        alt={alt}
        className={`${style} object-cover object-center`}
        width={size.width}
        height={size.height}
      />
    );
  } else {
    return <div className={`${style} !border-none`}></div>;
  }
};

// TuneForge Features Accordion: Interactive showcase of key capabilities
const FeaturesAccordion = () => {
  const [featureSelected, setFeatureSelected] = useState<number>(0);

  return (
    <section
      className="py-16 md:py-24 bg-white"
      id="features"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-dm-serif font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 hover:text-tuneforge-blue-violet transition-colors duration-500 cursor-default">
            Everything You Need to Sound Amazing
          </h2>
          <p className="font-inter text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed hover:text-gray-700 transition-colors duration-300 cursor-default">
            Discover the powerful features that make TuneForge the ultimate music creation platform 
            for creators of all levels.
          </p>
        </div>

        {/* Features Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Features List */}
          <div className="space-y-4">
            <ul className="w-full">
              {features.map((feature, i) => (
                <Item
                  key={feature.title}
                  index={i}
                  feature={feature}
                  isOpen={featureSelected === i}
                  setFeatureSelected={() => setFeatureSelected(i)}
                />
              ))}
            </ul>
          </div>

          {/* Media Display */}
          <div className="lg:sticky lg:top-24">
            <Media feature={features[featureSelected]} key={featureSelected} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesAccordion;
