import React from 'react';

const SolutionCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => {
  return (
    <div className="group bg-gradient-to-br from-tuneforge-blue-violet/10 to-tuneforge-medium-purple/10 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 border border-tuneforge-medium-purple/20 hover:border-tuneforge-blue-violet/50 cursor-pointer relative overflow-hidden">
      {/* Animated background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-tuneforge-blue-violet/5 to-tuneforge-medium-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:animate-pulse shadow-lg group-hover:shadow-xl">
          {icon}
        </div>
        <h3 className="font-inter font-bold text-xl text-gray-900 group-hover:text-tuneforge-blue-violet transition-colors duration-300 group-hover:scale-105 transform">
          {title}
        </h3>
        <p className="font-inter text-gray-600 group-hover:text-gray-700 leading-relaxed transition-colors duration-300">
          {description}
        </p>
        
        {/* Hover indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-2 text-tuneforge-blue-violet text-sm font-medium">
            <svg className="w-4 h-4 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Learn more</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// TuneForge Solution Section: Position TuneForge as the solution to stated problems
const Solution = () => {
  return (
    <section className="relative bg-gradient-to-br from-purple-50 to-blue-50 py-16 md:py-24 overflow-hidden">
      {/* Floating Music Notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-12 text-tuneforge-blue-violet/20 animate-bounce animation-delay-500">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute bottom-20 left-8 text-tuneforge-medium-purple/20 animate-bounce animation-delay-1500">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute top-1/3 left-1/4 text-tuneforge-slate-blue/15 animate-bounce animation-delay-2500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-dm-serif font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 hover:text-tuneforge-blue-violet transition-colors duration-500 cursor-default">
            TuneForge is Your Creative Breakthrough
          </h2>
          <p className="font-inter text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed hover:text-gray-700 transition-colors duration-300 cursor-default">
            Transform the way you create music with AI-powered technology that removes barriers 
            and unleashes your creativity.
          </p>
        </div>

        {/* Solution Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <SolutionCard
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            }
            title="Create More, Spend Less"
            description="Generate unlimited royalty-free tracks for a fraction of the cost of traditional methods. No expensive software or licensing fees required."
          />

          <SolutionCard
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            }
            title="From Idea to Anthem in Seconds"
            description="Our intuitive AI lets you create full songs instantly. Simply describe what you want, and watch your musical vision come to life in under 30 seconds."
          />

          <SolutionCard
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Your Infinite Music Engine"
            description="Never run out of ideas again. Explore endless styles, genres, and moods with a single click. From cinematic scores to upbeat pop - the possibilities are limitless."
          />
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <p className="font-inter text-gray-700 font-medium">
              Ready to experience the future of music creation?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
