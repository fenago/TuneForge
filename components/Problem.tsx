"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Elegant Problem Card Component
const ProblemCard = ({ 
  title, 
  description, 
  icon, 
  stat,
  delay 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  stat: string;
  delay: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <Card className="group h-full cursor-pointer hover:scale-105 transition-all duration-500 border-gray-200 hover:border-tuneforge-blue-violet/30">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gray-100 group-hover:bg-tuneforge-blue-violet/10 rounded-full flex items-center justify-center text-gray-600 group-hover:text-tuneforge-blue-violet mx-auto mb-4 transition-all duration-300 group-hover:scale-110">
            {icon}
          </div>
          <CardTitle className="text-xl text-gray-900 group-hover:text-tuneforge-blue-violet transition-colors duration-300">
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="font-inter text-gray-600 group-hover:text-gray-700 leading-relaxed mb-4 transition-colors duration-300">
            {description}
          </p>
          
          {/* Stat that appears on hover */}
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <div className="inline-flex items-center px-3 py-2 bg-tuneforge-blue-violet/10 text-tuneforge-blue-violet rounded-full text-sm font-medium">
              {stat}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// TuneForge Problem Section: Articulate pain points elegantly
const Problem = () => {
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeaderVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-tuneforge-blue-violet/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-tuneforge-medium-purple/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="font-dm-serif font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 hover:text-tuneforge-blue-violet transition-colors duration-500 cursor-default">
            Tired of the Old Way of Making Music?
          </h2>
          <p className="font-inter text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed hover:text-gray-700 transition-colors duration-300 cursor-default">
            Traditional music creation comes with barriers that stifle creativity and drain resources. 
            Sound familiar?
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          <ProblemCard
            title="Expensive Software & Royalties"
            description="Traditional music production requires costly software licenses, expensive equipment, and licensing tracks can drain your budget before you even start creating."
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            }
            stat="💸 Costs can exceed $1000+ per year"
            delay={300}
          />

          <ProblemCard
            title="The Endless Learning Curve"
            description="Mastering complex music software takes years of practice. Your creative ideas shouldn't have to wait while you learn technical skills that have nothing to do with music."
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
            stat="⏰ 2-5 years to become proficient"
            delay={600}
          />

          <ProblemCard
            title="Stuck in a Creative Rut?"
            description="Finding the right sound, melody, or inspiration can be frustrating and time-consuming. Writer's block hits everyone, but it shouldn't stop your projects."
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            }
            stat="🚫 70% of projects never finish"
            delay={900}
          />
        </div>

        {/* Bottom CTA hint */}
        <div className="text-center">
          <div className="inline-block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-tuneforge-blue-violet/30">
            <p className="font-dm-serif text-xl md:text-2xl text-gray-900 font-bold mb-2 group-hover:text-tuneforge-blue-violet transition-colors duration-300">
              What if there was a better way?
            </p>
            <p className="font-inter text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              Discover how TuneForge changes everything 👇
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
