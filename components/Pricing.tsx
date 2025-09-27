import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import ButtonSignin from "./ButtonSignin";

// TuneForge Pricing: Clear pricing tiers encouraging free trial
const Pricing = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-blue-50 py-16 md:py-24 overflow-hidden" id="pricing">
      {/* Floating Music Notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-12 text-tuneforge-blue-violet/15 animate-bounce animation-delay-700">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute bottom-32 right-16 text-tuneforge-medium-purple/15 animate-bounce animation-delay-1800">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="absolute top-2/3 right-8 text-tuneforge-slate-blue/10 animate-bounce animation-delay-2800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-dm-serif font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 hover:text-tuneforge-blue-violet transition-colors duration-500 cursor-default">
            Simple, Transparent Pricing
          </h2>
          <p className="font-inter text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed hover:text-gray-700 transition-colors duration-300 cursor-default">
            Start creating for free, then choose the plan that fits your creative needs. 
            No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {/* Free Trial Card */}
          <Card className="group cursor-pointer hover:scale-105 transition-all duration-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2 group-hover:text-tuneforge-blue-violet transition-colors duration-300">Free Trial</CardTitle>
              <div className="mb-4">
                <span className="font-dm-serif text-5xl font-bold text-gray-900 group-hover:animate-pulse">$0</span>
              </div>
              <p className="font-inter text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Perfect for trying TuneForge</p>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter text-gray-700 group-hover:text-gray-800 transition-colors duration-300">1 Free Song</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter text-gray-700 group-hover:text-gray-800 transition-colors duration-300">Access to core features</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter text-gray-700 group-hover:text-gray-800 transition-colors duration-300">Commercial Use Rights</span>
                </li>
              </ul>

              <Link
                href="/login"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-inter font-medium py-2 px-4 rounded-lg text-center transition-colors duration-200"
              >
                Start for Free
              </Link>
            </CardContent>
          </Card>

          {/* Creator+ Card - Featured */}
          <Card className="group relative cursor-pointer hover:scale-105 transition-all duration-500 border-2 border-tuneforge-blue-violet">
            {/* Featured Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 group-hover:animate-bounce">
              <span className="bg-tuneforge-gradient text-white font-inter font-semibold px-6 py-2 rounded-full text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                RECOMMENDED
              </span>
            </div>

            <CardHeader className="text-center mt-4">
              <CardTitle className="text-2xl mb-2 group-hover:text-tuneforge-blue-violet transition-colors duration-300">Creator+</CardTitle>
              <div className="mb-4">
                <span className="font-dm-serif text-5xl font-bold bg-tuneforge-gradient bg-clip-text text-transparent group-hover:animate-pulse">$2</span>
                <span className="font-inter text-lg text-gray-600 ml-2 group-hover:text-gray-700 transition-colors duration-300">/ song</span>
              </div>
              <p className="font-inter text-gray-600 group-hover:text-gray-700 transition-colors duration-300">For serious creators</p>
            </CardHeader>

            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter text-gray-700 group-hover:text-gray-800 transition-colors duration-300">Pay-as-you-go</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter text-gray-700 group-hover:text-gray-800 transition-colors duration-300">All AI models</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter text-gray-700 group-hover:text-gray-800 transition-colors duration-300">Priority Support</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-200">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter text-gray-700 group-hover:text-gray-800 transition-colors duration-300">Commercial Rights</span>
                </li>
              </ul>

              <Link
                href="/login"
                className="w-full bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-inter font-medium py-2 px-4 rounded-lg text-center transition-colors duration-200"
              >
                Buy Credits
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="font-inter text-gray-500 text-sm">
            All plans include commercial licensing and royalty-free usage. No hidden fees.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
