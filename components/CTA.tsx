import Link from "next/link";
import { Button } from "./ui/button";
import ButtonSignin from "./ButtonSignin";

// TuneForge Final CTA: Last conversion opportunity
const CTA = () => {
  return (
    <section className="relative bg-gradient-to-br from-purple-100 via-blue-50 to-white py-20 md:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tuneforge-blue-violet rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tuneforge-medium-purple rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Floating Music Notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-tuneforge-medium-purple/20 animate-bounce">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute top-40 right-20 text-tuneforge-slate-blue/20 animate-bounce animation-delay-1000">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute bottom-32 left-20 text-tuneforge-blue-violet/20 animate-bounce animation-delay-3000">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Main Content */}
        <div className="mb-12">
          <h2 className="font-dm-serif font-bold text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight hover:text-tuneforge-blue-violet transition-colors duration-500 cursor-default">
            Ready to Create Your{" "}
            <span className="bg-tuneforge-gradient bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 inline-block cursor-default">
              Masterpiece?
            </span>
          </h2>
          <p className="font-inter text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto hover:text-gray-700 transition-colors duration-300 cursor-default">
            Join thousands of creators who are already making incredible music with TuneForge. 
            Your next hit song is just seconds away.
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-xl px-10 py-5 group bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-inter font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <span>Start Creating for Free</span>
            <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <span className="font-inter text-sm">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <span className="font-inter text-sm">Commercial rights included</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <span className="font-inter text-sm">Create in 30 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
