"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCredits, CreditsResponse } from "@/lib/ai-music-api";
import { 
  SparklesIcon, 
  CreditCardIcon,
  CheckIcon,
  StarIcon
} from "@heroicons/react/24/outline";

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  features: string[];
}

export default function CreditsPage() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const creditPacks: CreditPack[] = [
    {
      id: "starter",
      name: "Starter Pack",
      credits: 50,
      price: 9.99,
      features: [
        "50 song generations",
        "Standard quality",
        "MP3 downloads",
        "Basic support"
      ]
    },
    {
      id: "popular",
      name: "Popular Pack",
      credits: 150,
      price: 24.99,
      originalPrice: 29.99,
      popular: true,
      features: [
        "150 song generations",
        "High quality",
        "MP3 & WAV downloads",
        "Priority support",
        "Extended song length"
      ]
    },
    {
      id: "pro",
      name: "Pro Pack",
      credits: 300,
      price: 44.99,
      originalPrice: 59.99,
      features: [
        "300 song generations",
        "Premium quality",
        "All download formats",
        "24/7 priority support",
        "Commercial license",
        "Advanced AI models"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Pack",
      credits: 1000,
      price: 129.99,
      originalPrice: 199.99,
      features: [
        "1000 song generations",
        "Ultra quality",
        "All formats + stems",
        "Dedicated support",
        "Full commercial rights",
        "API access",
        "Custom AI training"
      ]
    }
  ];

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const creditsData = await getCredits();
      setCredits(creditsData);
    } catch (error) {
      console.error("Failed to load credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packId: string) => {
    setPurchasing(packId);
    
    try {
      // In a real implementation, this would:
      // 1. Create a Stripe checkout session
      // 2. Redirect to Stripe checkout
      // 3. Handle the webhook to add credits after successful payment
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Buy Credits</h1>
          <p className="text-gray-600 mt-2">Purchase credits to create more amazing music</p>
        </div>

        {/* Current Credits */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Current Balance</h3>
                <p className="text-sm text-gray-600">Available for music generation</p>
              </div>
            </div>
            <div className="text-right">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900">
                    {credits ? credits.credits + credits.extra_credits : 0}
                  </p>
                  <p className="text-sm text-gray-600">Credits</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Credit Packs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              className={`relative bg-white rounded-xl shadow-lg border-2 transition-all hover:shadow-xl ${
                pack.popular 
                  ? "border-blue-500 ring-2 ring-blue-200" 
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <StarIcon className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pack.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">${pack.price}</span>
                    {pack.originalPrice && (
                      <span className="text-lg text-gray-500 line-through ml-2">
                        ${pack.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <span className="text-2xl font-bold text-blue-600">{pack.credits}</span>
                    <span className="text-gray-600 ml-1">Credits</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    ${(pack.price / pack.credits).toFixed(3)} per credit
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {pack.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(pack.id)}
                  disabled={purchasing === pack.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    pack.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {purchasing === pack.id ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-4 h-4" />
                      Purchase Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Secure Payments</h4>
              <p className="text-sm text-gray-600 mb-4">
                All payments are processed securely through Stripe. We never store your payment information.
              </p>
              <div className="flex items-center gap-2">
                <img src="/stripe-badge.png" alt="Stripe" className="h-6" />
                <span className="text-xs text-gray-500">Powered by Stripe</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Credit Usage</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 1 credit = 1 song generation</li>
                <li>• Credits never expire</li>
                <li>• Unused credits roll over</li>
                <li>• Refunds available within 30 days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">How do credits work?</h4>
              <p className="text-sm text-gray-600">
                Each song generation uses 1 credit. Credits are deducted when you successfully generate a song.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Do credits expire?</h4>
              <p className="text-sm text-gray-600">
                No, your credits never expire. You can use them whenever you want to create music.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Can I get a refund?</h4>
              <p className="text-sm text-gray-600">
                Yes, we offer full refunds within 30 days of purchase if you're not satisfied.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">
                We accept all major credit cards, debit cards, and digital wallets through Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
