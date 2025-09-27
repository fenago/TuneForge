import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-blue-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-tuneforge-blue-violet rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-tuneforge-medium-purple rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-tuneforge-slate-blue rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Music Notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-tuneforge-blue-violet/30 animate-bounce">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute top-32 right-16 text-tuneforge-medium-purple/30 animate-bounce animation-delay-1000">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute bottom-40 left-16 text-tuneforge-slate-blue/30 animate-bounce animation-delay-2000">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute top-1/2 right-8 text-tuneforge-blue-violet/25 animate-bounce animation-delay-3000">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-8 text-center lg:text-left">
            {/* Headline */}
            <h1 className="font-dm-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-gray-900 animate-fadeIn">
              <span className="bg-tuneforge-gradient bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 inline-block cursor-default">
                Unleash Your Inner Composer.
              </span>
              <br />
              <span className="text-gray-900 hover:text-tuneforge-blue-violet transition-colors duration-500 cursor-default">
                Create Studio-Quality Music in Seconds.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="font-inter text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl hover:text-gray-700 transition-colors duration-300 cursor-default">
              TuneForge is your AI-powered music creation partner. No experience needed. 
              Just bring your ideas, and we'll handle the rest. Create your first song for free!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-tuneforge-gradient text-white font-inter font-semibold text-lg px-8 py-4 rounded-lg hover:bg-tuneforge-gradient-reverse transition-all duration-200 hover:shadow-lg w-full sm:w-auto"
              >
                Start Creating for Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center border-2 border-tuneforge-blue-violet text-tuneforge-blue-violet font-inter font-semibold text-lg px-8 py-4 rounded-lg hover:bg-tuneforge-blue-violet hover:text-white transition-all duration-200 w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                See TuneForge in Action
              </Link>
            </div>

          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop"
                alt="Musicians creating music with TuneForge"
                className="w-full h-auto"
                priority={true}
                width={600}
                height={400}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-tuneforge-gradient opacity-20"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-tuneforge-gradient p-4 rounded-full shadow-lg animate-bounce">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 3.828 1 1 0 11-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-inter">AI Generating...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
