"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ChartBarIcon, 
  UsersIcon, 
  MusicalNoteIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

interface AdminStats {
  totalRevenue: number;
  monthlyRevenue: number;
  newUsers: number;
  totalSongs: number;
  activeUsers: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for now - in real implementation, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalRevenue: 45280,
        monthlyRevenue: 8950,
        newUsers: 127,
        totalSongs: 2840,
        activeUsers: 89,
        totalUsers: 456
      });
      setLoading(false);
    }, 1000);
  }, []);

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
                  {loading ? "..." : `$${stats?.totalRevenue.toLocaleString()}`}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5% from last month</span>
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
                  {loading ? "..." : `$${stats?.monthlyRevenue.toLocaleString()}`}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.2% from last month</span>
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
                  {loading ? "..." : stats?.newUsers.toLocaleString()}
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
                  {loading ? "..." : stats?.totalSongs.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15.7% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MusicalNoteIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
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
            {[
              { genre: "Pop", count: 847, percentage: 29.8 },
              { genre: "Electronic", count: 623, percentage: 21.9 },
              { genre: "Rock", count: 456, percentage: 16.1 },
              { genre: "Hip-Hop", count: 389, percentage: 13.7 },
            ].map((item) => (
              <div key={item.genre} className="text-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-tuneforge-gradient h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="font-medium text-gray-900">{item.genre}</p>
                <p className="text-sm text-gray-600">{item.count} songs ({item.percentage}%)</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { user: "john@example.com", action: "Generated a pop song", time: "2 minutes ago" },
              { user: "sarah@example.com", action: "Purchased 100 credits", time: "15 minutes ago" },
              { user: "mike@example.com", action: "Created account", time: "1 hour ago" },
              { user: "emma@example.com", action: "Generated an electronic song", time: "2 hours ago" },
              { user: "alex@example.com", action: "Downloaded song", time: "3 hours ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
