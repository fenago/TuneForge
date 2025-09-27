"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestEmailPage() {
  const [email, setEmail] = useState("learningscience92@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to send test email', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-dm-serif text-4xl font-bold text-gray-900 mb-4">
            🧪 TuneForge Email Test
          </h1>
          <p className="font-inter text-gray-600">
            Test your Resend integration before testing magic links
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to test"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet transition-colors font-inter"
              />
            </div>

            <Button
              onClick={sendTestEmail}
              disabled={isLoading || !email}
              className="w-full bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-inter font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sending Test Email...
                </div>
              ) : (
                "Send Test Email"
              )}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {result.success ? (
                  <div>
                    <h3 className="font-inter font-semibold text-green-800 mb-2">
                      ✅ Test Email Sent Successfully!
                    </h3>
                    <p className="font-inter text-green-700 text-sm mb-2">
                      {result.message}
                    </p>
                    {result.emailId && (
                      <p className="font-inter text-green-600 text-xs">
                        Email ID: {result.emailId}
                      </p>
                    )}
                    <div className="mt-3 p-3 bg-green-100 rounded">
                      <p className="font-inter text-green-800 text-sm font-medium">
                        ✨ Next Steps:
                      </p>
                      <ul className="font-inter text-green-700 text-sm mt-1 list-disc list-inside">
                        <li>Check your email inbox</li>
                        <li>If successful, magic links are ready to test!</li>
                        <li>Go to <code>/login</code> to test magic link authentication</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-inter font-semibold text-red-800 mb-2">
                      ❌ Test Email Failed
                    </h3>
                    <p className="font-inter text-red-700 text-sm">
                      {result.error}
                    </p>
                    {result.details && (
                      <pre className="font-mono text-red-600 text-xs mt-2 bg-red-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/login"
            className="font-inter text-tuneforge-blue-violet hover:text-tuneforge-medium-purple font-medium"
          >
            → Test Magic Links Authentication
          </a>
        </div>

        <div className="text-center mt-4">
          <a
            href="/"
            className="font-inter text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to TuneForge
          </a>
        </div>
      </div>
    </div>
  );
}
