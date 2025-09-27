"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  freeUsers: number;
  paidUsers: number;
  maxUsers: number;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
  createdAt: string;
  dashboardUrl: string;
}

export default function TestRolesPage() {
  const { data: session, status } = useSession();
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Check admin status on load
  useEffect(() => {
    checkAdminStatus();
    if (session?.user) {
      getUserProfile();
    }
  }, [session]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/init');
      const data = await response.json();
      setAdminStatus(data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const initializeAdmin = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
      
      // Refresh admin status
      await checkAdminStatus();
    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Failed to initialize admin',
        details: error 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      setUserProfile(data.user);
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-600 bg-red-100';
      case 'MAX': return 'text-purple-600 bg-purple-100';
      case 'PAID': return 'text-blue-600 bg-blue-100';
      case 'FREE': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-dm-serif text-4xl font-bold text-gray-900 mb-4">
            🔐 TuneForge Role System Test
          </h1>
          <p className="font-inter text-gray-600">
            Test and initialize the user role system and database
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Session Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="font-dm-serif text-2xl font-bold text-gray-900 mb-4">
              Current Session
            </h2>
            
            {status === 'loading' && (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-tuneforge-blue-violet border-t-transparent rounded-full mx-auto"></div>
                <p className="font-inter text-gray-600 mt-2">Loading session...</p>
              </div>
            )}

            {status === 'unauthenticated' && (
              <div className="text-center py-4">
                <p className="font-inter text-gray-600 mb-4">Not authenticated</p>
                <a 
                  href="/login"
                  className="bg-tuneforge-gradient text-white font-inter font-medium px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Sign In to Test
                </a>
              </div>
            )}

            {status === 'authenticated' && session?.user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <img 
                      src={session.user.image} 
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-inter font-semibold text-gray-900">
                      {session.user.name || 'No name'}
                    </p>
                    <p className="font-inter text-sm text-gray-600">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                {userProfile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-inter text-sm font-medium text-gray-700">Role:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userProfile.role)}`}>
                        {userProfile.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-inter text-sm font-medium text-gray-700">Dashboard:</span>
                      <a 
                        href={userProfile.dashboardUrl}
                        className="text-tuneforge-blue-violet hover:text-tuneforge-medium-purple text-sm underline"
                      >
                        {userProfile.dashboardUrl}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-sm font-medium text-gray-700">Can Create Songs:</span>
                      <span className={`text-sm font-medium ${userProfile.limits?.canCreateSongs ? 'text-green-600' : 'text-red-600'}`}>
                        {userProfile.limits?.canCreateSongs ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {userProfile.limits?.remainingLimit !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="font-inter text-sm font-medium text-gray-700">Remaining:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {userProfile.limits.remainingLimit}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin System Status */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="font-dm-serif text-2xl font-bold text-gray-900 mb-4">
              Admin System Status
            </h2>

            {adminStatus && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-inter text-sm font-medium text-gray-700">Admin User Exists:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      adminStatus.exists ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                    }`}>
                      {adminStatus.exists ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {adminStatus.exists && adminStatus.user && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-inter text-sm font-medium text-gray-700">Email:</span>
                        <span className="text-sm text-gray-900">{adminStatus.user.email}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-inter text-sm font-medium text-gray-700">Role:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(adminStatus.user.role)}`}>
                          {adminStatus.user.role}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {adminStatus.stats && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-inter font-semibold text-gray-900 mb-2">User Statistics</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{adminStatus.stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Admin:</span>
                        <span className="font-medium text-red-600">{adminStatus.stats.adminUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Free:</span>
                        <span className="font-medium text-green-600">{adminStatus.stats.freeUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-medium text-blue-600">{adminStatus.stats.paidUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max:</span>
                        <span className="font-medium text-purple-600">{adminStatus.stats.maxUsers}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={initializeAdmin}
                  disabled={isLoading}
                  className="w-full bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-inter font-medium"
                >
                  {isLoading ? 'Initializing...' : 'Initialize/Update Admin User'}
                </Button>
              </div>
            )}

            {result && (
              <div className={`mt-4 p-4 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-inter font-semibold mb-2 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅ Success' : '❌ Error'}
                </h3>
                <p className={`font-inter text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message || result.error}
                </p>
                {result.user && (
                  <div className="mt-2 text-xs">
                    <strong>User ID:</strong> {result.user.id}<br/>
                    <strong>Role:</strong> {result.user.role}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8 space-x-4">
          <a
            href="/dashboard"
            className="font-inter text-tuneforge-blue-violet hover:text-tuneforge-medium-purple font-medium"
          >
            → Go to Dashboard
          </a>
          <a
            href="/login"
            className="font-inter text-tuneforge-blue-violet hover:text-tuneforge-medium-purple font-medium"
          >
            → Test Authentication
          </a>
          <a
            href="/"
            className="font-inter text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Back to TuneForge
          </a>
        </div>
      </div>
    </div>
  );
}
