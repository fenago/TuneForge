"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

interface MagicLinkLoginProps {
  className?: string;
}

const MagicLinkLogin = ({ className = "" }: MagicLinkLoginProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Failed to send magic link. Please try again.");
      } else {
        setIsSubmitted(true);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`text-center p-6 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="mb-4">
          <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-dm-serif text-xl font-semibold text-gray-900 mb-2">
          Check Your Email
        </h3>
        <p className="font-inter text-gray-600 mb-4">
          We've sent a magic link to <strong>{email}</strong>
        </p>
        <p className="font-inter text-sm text-gray-500">
          Click the link in your email to sign in to TuneForge. The link will expire in 24 hours.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setEmail("");
          }}
          className="mt-4 text-tuneforge-blue-violet hover:text-tuneforge-medium-purple font-inter text-sm underline"
        >
          Send to a different email
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block font-inter text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet transition-colors font-inter"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-inter text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-inter font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sending Magic Link...
            </div>
          ) : (
            "Send Magic Link"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="font-inter text-xs text-gray-500">
          We'll send you a secure link to sign in without a password.
        </p>
      </div>
    </div>
  );
};

export default MagicLinkLogin;
