"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { CreditsResponse } from "@/lib/ai-music-api";
import { 
  ChartBarIcon, 
  UsersIcon, 
  MusicalNoteIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

interface AdminStats {
  revenue: {
    total: number;
    monthly: number;
    growth: string;
  };
  users: {
    total: number;
    active: number;
    newLast30Days: number;
    growth: string;
  };
  songs: {
    total: number;
    growth: string;
  };
  genres: Array<{
    name: string;
    count: number;
    percentage: string;
  }>;
  recentActivity: Array<{
    user: string;
    action: string;
    time: string;
    timestamp?: Date;
  }>;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [fixingMetadata, setFixingMetadata] = useState(false);

  // Fetch real admin stats and credits from API
  useEffect(() => {
    fetchAdminStats();
    fetchCredits();
  }, []);

  const fetchAdminStats = async () => {
    try {
      console.log('📊 Fetching real admin stats...');
      const response = await fetch('/api/admin/system-stats', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real admin stats received:', data.stats);
        setStats(data.stats);
      } else {
        console.error('❌ Failed to fetch admin stats:', response.status);
        // Set empty stats on error
        setStats({
          revenue: { total: 0, monthly: 0, growth: '0%' },
          users: { total: 0, active: 0, newLast30Days: 0, growth: '0%' },
          songs: { total: 0, growth: '0%' },
          genres: [],
          recentActivity: []
        });
      }
    } catch (error) {
      console.error('❌ Error fetching admin stats:', error);
      // Set empty stats on error
      setStats({
        revenue: { total: 0, monthly: 0, growth: '0%' },
        users: { total: 0, active: 0, newLast30Days: 0, growth: '0%' },
        songs: { total: 0, growth: '0%' },
        genres: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCredits = async () => {
    try {
      console.log('💳 Admin: Fetching dual-API credits...');
      const response = await fetch('/api/music/credits', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const creditsData = await response.json();
        console.log('✅ Admin: Credits received:', creditsData);
        setCredits(creditsData);
      } else {
        console.error('❌ Admin: Failed to fetch credits:', response.status);
        setCredits(null);
      }
    } catch (error) {
      console.error('❌ Admin: Error fetching credits:', error);
      setCredits(null);
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleFixMetadata = async () => {
    if (!confirm('This will fix missing metadata for all songs. This may take a few minutes. Continue?')) {
      return;
    }

    setFixingMetadata(true);
    try {
      console.log('🔧 Starting metadata fix...');
      const response = await fetch('/api/admin/fix-metadata', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Metadata fix completed!\n\nStats:\n• Found: ${result.stats.totalFound} songs\n• Fixed: ${result.stats.totalFixed} songs\n• Errors: ${result.stats.totalErrors} songs`);
        console.log('✅ Metadata fix result:', result);
      } else {
        throw new Error('Failed to fix metadata');
      }
    } catch (error) {
      console.error('❌ Error fixing metadata:', error);
      alert('❌ Failed to fix metadata. Check console for details.');
    } finally {
      setFixingMetadata(false);
    }
  };

  if (session?.user?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your TuneForge platform performance</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : `$${stats?.revenue.total.toLocaleString()}`}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stats?.revenue.growth || '0%'} from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : `$${stats?.revenue.monthly.toLocaleString()}`}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stats?.users.growth || '0%'} from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* New Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Users (30d)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats?.users.newLast30Days.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-3.1% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Songs */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Songs Generated</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats?.songs.total.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stats?.songs.growth || '0%'} from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MusicalNoteIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* API Credits Monitoring */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">API Credits Status</h3>
            <button
              onClick={fetchCredits}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Refresh Credits
            </button>
          </div>

          {creditsLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading credits...</p>
            </div>
          ) : credits && credits.success ? (
            <div className="space-y-4">
              {/* Total Credits Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Total Available Credits</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-900">{credits.grand_total}</span>
                </div>
              </div>

              {/* Individual API Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SunoAPI.com Status */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-900">SunoAPI.com</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      credits.providers.sunoapi_com.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {credits.providers.sunoapi_com.success ? 'Online' : 'Error'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {credits.providers.sunoapi_com.total} credits
                  </div>
                  {credits.providers.sunoapi_com.credits > 0 && credits.providers.sunoapi_com.extra_credits > 0 && (
                    <div className="text-sm text-green-700">
                      {credits.providers.sunoapi_com.credits} regular + {credits.providers.sunoapi_com.extra_credits} bonus
                    </div>
                  )}
                  {!credits.providers.sunoapi_com.success && (
                    <div className="text-sm text-red-600 mt-2">
                      Error: {credits.providers.sunoapi_com.error}
                    </div>
                  )}
                </div>

                {/* SunoAPI.org Status */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-900">SunoAPI.org</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      credits.providers.sunoapi_org.success 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {credits.providers.sunoapi_org.success ? 'Online' : 'Error'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {credits.providers.sunoapi_org.total} credits
                  </div>
                  {!credits.providers.sunoapi_org.success && (
                    <div className="text-sm text-red-600 mt-2">
                      Error: {credits.providers.sunoapi_org.error}
                    </div>
                  )}
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-gray-500 text-center">
                Last updated: {new Date(credits.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-red-500">
              <p>Failed to load API credits. Please check API configuration.</p>
              <button
                onClick={fetchCredits}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart placeholder - integrate with Chart.js or similar</p>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart placeholder - integrate with Chart.js or similar</p>
            </div>
          </div>
        </div>

        {/* Popular Genres */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Genres</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(stats?.genres || []).slice(0, 4).map((item) => (
              <div key={item.name} className="text-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-tuneforge-gradient h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">{item.count} songs ({item.percentage}%)</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {(stats?.recentActivity || []).slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
            <UsersIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600 mb-4">View and manage user accounts</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Users
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
            <MusicalNoteIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Song Management</h3>
            <p className="text-sm text-gray-600 mb-4">Monitor generated songs</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              View Songs
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
            <ChartBarIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">Detailed platform analytics</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              View Analytics
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
            <MusicalNoteIcon className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Fix Metadata</h3>
            <p className="text-sm text-gray-600 mb-4">Fix missing song metadata (tempo, key, etc.)</p>
            <button 
              onClick={handleFixMetadata}
              disabled={fixingMetadata}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fixingMetadata ? 'Fixing...' : 'Fix Metadata'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
