"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function FixAdminPage() {
  const [email, setEmail] = useState("learningscienceai1@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Load debug info on component mount
  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const response = await fetch('/api/admin/setup');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Failed to load debug info:', error);
    }
  };

  const updateUserRole = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
      
      // Reload debug info after update
      if (data.success) {
        await loadDebugInfo();
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Failed to update role',
        details: error 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-dm-serif text-4xl font-bold text-gray-900 mb-4">
            🔧 Fix Admin Role
          </h1>
          <p className="font-inter text-gray-600">
            Update user role to ADMIN manually
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet transition-colors font-inter"
                placeholder="Enter email to make admin"
              />
            </div>

            <Button
              onClick={updateUserRole}
              disabled={isLoading || !email}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-inter font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Updating Role...
                </div>
              ) : (
                "Update to ADMIN Role"
              )}
            </Button>

            {/* Debug Information */}
            {debugInfo && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-inter font-semibold text-gray-900 mb-2">
                  🔍 Database Debug Info
                </h3>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Total Users:</strong> {debugInfo.totalUsers}
                  </div>
                  <div>
                    <strong>Searching for:</strong> {debugInfo.searchEmail}
                  </div>
                  <div>
                    <strong>Exact Match:</strong> {debugInfo.exactMatch ? 'Found' : 'Not Found'}
                  </div>
                  
                  {debugInfo.possibleMatches && debugInfo.possibleMatches.length > 0 && (
                    <div>
                      <strong>Possible Matches:</strong>
                      <ul className="ml-4 mt-1">
                        {debugInfo.possibleMatches.map((user: any, index: number) => (
                          <li key={index} className="text-xs">
                            {user.email} - {user.role} - {user.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {debugInfo.allUsers && debugInfo.allUsers.length > 0 && (
                    <div>
                      <strong>All Users:</strong>
                      <ul className="ml-4 mt-1">
                        {debugInfo.allUsers.map((user: any, index: number) => (
                          <li key={index} className="text-xs">
                            {user.email} - {user.role}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {result.success ? (
                  <div>
                    <h3 className="font-inter font-semibold mb-2">
                      ✅ Role Updated Successfully!
                    </h3>
                    <p className="font-inter text-sm mb-2">
                      {result.message}
                    </p>
                    {result.user && (
                      <div className="text-xs bg-green-100 p-2 rounded mt-2">
                        <strong>User:</strong> {result.user.email}<br/>
                        <strong>Role:</strong> {result.user.role}<br/>
                        <strong>ID:</strong> {result.user.id}
                      </div>
                    )}
                    <div className="mt-4">
                      <p className="font-inter text-green-700 text-sm font-medium">
                        ✨ Next Steps:
                      </p>
                      <ul className="font-inter text-green-600 text-sm mt-1 list-disc list-inside">
                        <li>Sign out and sign back in</li>
                        <li>Check your profile page</li>
                        <li>Role should now show as "ADMIN Plan"</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-inter font-semibold mb-2">
                      ❌ Update Failed
                    </h3>
                    <p className="font-inter text-sm">
                      {result.error}
                    </p>
                    {result.details && (
                      <pre className="font-mono text-xs mt-2 bg-red-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 space-x-4">
          <a
            href="/profile"
            className="font-inter text-tuneforge-blue-violet hover:text-tuneforge-medium-purple font-medium"
          >
            → Check Profile
          </a>
          <a
            href="/dashboard"
            className="font-inter text-tuneforge-blue-violet hover:text-tuneforge-medium-purple font-medium"
          >
            → Go to Dashboard
          </a>
          <a
            href="/"
            className="font-inter text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
