"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MagicLinkLogin from "@/components/MagicLinkLogin";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"google" | "email">("google");

  // Redirect if already authenticated
  if (status === "authenticated") {
    router.push("/dashboard");
    return null;
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-tuneforge-blue-violet rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-tuneforge-medium-purple rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/tuneforge_logo.png"
              alt="TuneForge"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <h1 className="font-dm-serif text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="font-inter text-gray-600">
            Sign in to continue creating amazing music
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("google")}
              className={`flex-1 py-2 px-4 rounded-md font-inter font-medium transition-all duration-200 ${
                activeTab === "google"
                  ? "bg-white text-tuneforge-blue-violet shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Quick Sign In
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`flex-1 py-2 px-4 rounded-md font-inter font-medium transition-all duration-200 ${
                activeTab === "email"
                  ? "bg-white text-tuneforge-blue-violet shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "google" ? (
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-inter font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="text-center">
                <p className="font-inter text-sm text-gray-500">
                  Quick and secure sign in with your Google account
                </p>
              </div>
            </div>
          ) : (
            <MagicLinkLogin />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="font-inter text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/" className="text-tuneforge-blue-violet hover:text-tuneforge-medium-purple font-medium">
              Start creating for free
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="font-inter text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to TuneForge
          </Link>
        </div>
      </div>
    </div>
  );
}
