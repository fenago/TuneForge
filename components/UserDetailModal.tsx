"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon, MusicalNoteIcon, CalendarIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface UserStats {
  totalSongs: number;
  totalDuration: number;
  avgDuration: number;
  genres: string[];
  accountAge: number;
}

interface RecentSong {
  id: string;
  title: string;
  genre: string;
  duration: number;
  createdAt: string;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  subscription?: {
    status: string;
    plan: string;
  };
  adminData?: any;
  stats: UserStats;
  recentSongs: RecentSong[];
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function UserDetailModal({ isOpen, onClose, userId }: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setError('Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
      setError('An error occurred while loading user details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      FREE: "bg-gray-100 text-gray-800",
      PAID: "bg-blue-100 text-blue-800",
      MAX: "bg-purple-100 text-purple-800",
      ADMIN: "bg-red-100 text-red-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">⚠️</div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchUserDetail}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.subscription?.status || 'active')}`}>
                          {user.subscription?.status || 'active'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Account Age: {user.stats.accountAge} days</p>
                    <p>Joined: {formatDate(user.createdAt)}</p>
                    {user.lastLoginAt && (
                      <p>Last Login: {formatDate(user.lastLoginAt)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <MusicalNoteIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{user.stats.totalSongs}</p>
                  <p className="text-sm text-gray-600">Songs Created</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <CalendarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(user.stats.totalDuration / 60)}m</p>
                  <p className="text-sm text-gray-600">Total Music</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <UserIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(user.stats.avgDuration)}</p>
                  <p className="text-sm text-gray-600">Avg Song Length (s)</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <ShieldCheckIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{user.stats.genres.length}</p>
                  <p className="text-sm text-gray-600">Genres Explored</p>
                </div>
              </div>

              {/* Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Account Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID:</span>
                      <span className="font-mono text-gray-900">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email Verified:</span>
                      <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                        {user.emailVerified ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscription Plan:</span>
                      <span className="font-medium">{user.subscription?.plan || 'FREE'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span>{formatDate(user.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Favorite Genres */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Music Preferences</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Favorite Genres:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.stats.genres.slice(0, 5).map((genre, index) => (
                          <span 
                            key={index}
                            className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                        {user.stats.genres.length > 5 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            +{user.stats.genres.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Songs */}
              {user.recentSongs.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Recent Songs</h5>
                  <div className="space-y-2">
                    {user.recentSongs.map((song) => (
                      <div key={song.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{song.title}</p>
                          <p className="text-sm text-gray-600">{song.genre}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{formatDuration(song.duration)}</p>
                          <p>{formatDate(song.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Data */}
              {user.adminData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-900 mb-3">Admin Notes</h5>
                  <div className="text-sm text-yellow-800">
                    {user.adminData.suspendedAt && (
                      <p>Suspended on: {formatDate(user.adminData.suspendedAt)}</p>
                    )}
                    {user.adminData.adminNotes && (
                      <p>Notes: {user.adminData.adminNotes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
