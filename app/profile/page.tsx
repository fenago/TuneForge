"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  dashboardUrl: string;
  subscription: {
    status: string;
    plan: string;
    currentPeriodEnd?: string;
  };
  usage: {
    songsCreated: number;
    songsThisMonth: number;
    creditsRemaining: number;
    totalCredits: number;
  };
  profile: {
    bio?: string;
    website?: string;
    location?: string;
    musicGenres: string[];
    notifications: {
      email: boolean;
      marketing: boolean;
      updates: boolean;
    };
    preferences: {
      theme: string;
      language: string;
      timezone?: string;
    };
  };
  limits: {
    canCreateSongs: boolean;
    remainingLimit: number | 'unlimited';
  };
  createdAt: string;
}

const musicGenres = [
  'pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical',
  'country', 'r&b', 'reggae', 'folk', 'blues', 'metal',
  'punk', 'indie', 'ambient', 'house', 'techno', 'dubstep'
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.user);
        setEditData({
          name: data.user.name || '',
          profile: {
            bio: data.user.profile?.bio || '',
            website: data.user.profile?.website || '',
            location: data.user.profile?.location || '',
            musicGenres: data.user.profile?.musicGenres || [],
            notifications: data.user.profile?.notifications || {
              email: true,
              marketing: false,
              updates: true,
            },
            preferences: data.user.profile?.preferences || {
              theme: 'light',
              language: 'en',
            },
          },
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        await fetchProfile(); // Refresh profile data
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-600 bg-red-100 border-red-200';
      case 'MAX': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'PAID': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'FREE': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Full system access with unlimited features';
      case 'MAX': return 'Premium plan with unlimited song generation';
      case 'PAID': return 'Credit-based plan with advanced features';
      case 'FREE': return 'Free plan with basic features';
      default: return 'Unknown plan';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-tuneforge-blue-violet border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-inter text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="font-inter text-red-600 mb-4">Failed to load profile</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-dm-serif text-4xl font-bold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="font-inter text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-dm-serif">Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div className="text-center">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt="Profile"
                      width={100}
                      height={100}
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {profile.name?.charAt(0) || profile.email.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-dm-serif text-xl font-semibold text-gray-900">
                    {profile.name || 'No name set'}
                  </h3>
                  <p className="font-inter text-gray-600 text-sm">
                    {profile.email}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(profile.role)}`}>
                    {profile.role} Plan
                  </span>
                  <p className="font-inter text-xs text-gray-500 mt-1">
                    {getRoleDescription(profile.role)}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-gray-600">Songs Created:</span>
                    <span className="font-inter text-sm font-medium">{profile.usage.songsCreated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-gray-600">This Month:</span>
                    <span className="font-inter text-sm font-medium">{profile.usage.songsThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-gray-600">Remaining:</span>
                    <span className="font-inter text-sm font-medium">
                      {profile.limits.remainingLimit === 'unlimited' ? '∞' : profile.limits.remainingLimit}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={() => router.push(profile.dashboardUrl)}
                    className="w-full bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white"
                  >
                    Go to Dashboard
                  </Button>
                  {profile.role === 'FREE' && (
                    <Button
                      variant="outline"
                      className="w-full border-tuneforge-blue-violet text-tuneforge-blue-violet hover:bg-tuneforge-blue-violet hover:text-white"
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-dm-serif">Personal Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isSaving}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-inter text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="font-inter text-gray-900">{profile.name || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-inter text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="font-inter text-gray-600">{profile.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block font-inter text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.profile.bio}
                      onChange={(e) => setEditData({
                        ...editData,
                        profile: { ...editData.profile, bio: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="font-inter text-gray-900">{profile.profile.bio || 'No bio added'}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-inter text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editData.profile.website}
                        onChange={(e) => setEditData({
                          ...editData,
                          profile: { ...editData.profile, website: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet"
                        placeholder="https://yourwebsite.com"
                      />
                    ) : (
                      <p className="font-inter text-gray-900">
                        {profile.profile.website ? (
                          <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" className="text-tuneforge-blue-violet hover:underline">
                            {profile.profile.website}
                          </a>
                        ) : (
                          'Not set'
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block font-inter text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.profile.location}
                        onChange={(e) => setEditData({
                          ...editData,
                          profile: { ...editData.profile, location: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet"
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="font-inter text-gray-900">{profile.profile.location || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Music Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="font-dm-serif">Music Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                    Favorite Genres
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {musicGenres.map((genre) => (
                        <label key={genre} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editData.profile.musicGenres.includes(genre)}
                            onChange={(e) => {
                              const genres = editData.profile.musicGenres;
                              if (e.target.checked) {
                                setEditData({
                                  ...editData,
                                  profile: { ...editData.profile, musicGenres: [...genres, genre] }
                                });
                              } else {
                                setEditData({
                                  ...editData,
                                  profile: { ...editData.profile, musicGenres: genres.filter((g: string) => g !== genre) }
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-tuneforge-blue-violet focus:ring-tuneforge-blue-violet"
                          />
                          <span className="font-inter text-sm capitalize">{genre}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.profile.musicGenres.length > 0 ? (
                        profile.profile.musicGenres.map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-tuneforge-blue-violet/10 text-tuneforge-blue-violet rounded-full text-sm font-inter capitalize"
                          >
                            {genre}
                          </span>
                        ))
                      ) : (
                        <p className="font-inter text-gray-500">No genres selected</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="font-dm-serif">Notifications & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-inter font-medium text-gray-900 mb-3">Email Notifications</h4>
                  <div className="space-y-2">
                    {Object.entries(profile.profile.notifications).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between">
                        <span className="font-inter text-sm text-gray-700 capitalize">
                          {key === 'email' ? 'General Notifications' : 
                           key === 'marketing' ? 'Marketing Emails' : 
                           'Product Updates'}
                        </span>
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={editData.profile.notifications[key]}
                            onChange={(e) => setEditData({
                              ...editData,
                              profile: {
                                ...editData.profile,
                                notifications: {
                                  ...editData.profile.notifications,
                                  [key]: e.target.checked
                                }
                              }
                            })}
                            className="rounded border-gray-300 text-tuneforge-blue-violet focus:ring-tuneforge-blue-violet"
                          />
                        ) : (
                          <span className={`text-sm font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>
                            {value ? 'Enabled' : 'Disabled'}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block font-inter text-sm font-medium text-gray-700 mb-1">
                      Theme
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.profile.preferences.theme}
                        onChange={(e) => setEditData({
                          ...editData,
                          profile: {
                            ...editData.profile,
                            preferences: { ...editData.profile.preferences, theme: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    ) : (
                      <p className="font-inter text-gray-900 capitalize">{profile.profile.preferences.theme}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-inter text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.profile.preferences.language}
                        onChange={(e) => setEditData({
                          ...editData,
                          profile: {
                            ...editData.profile,
                            preferences: { ...editData.profile.preferences, language: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-tuneforge-blue-violet"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    ) : (
                      <p className="font-inter text-gray-900">
                        {profile.profile.preferences.language === 'en' ? 'English' :
                         profile.profile.preferences.language === 'es' ? 'Spanish' :
                         profile.profile.preferences.language === 'fr' ? 'French' :
                         profile.profile.preferences.language === 'de' ? 'German' : 'English'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-dm-serif">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-inter font-medium text-gray-700">Member since:</span>
                <span className="font-inter text-gray-900 ml-2">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-inter font-medium text-gray-700">Account ID:</span>
                <span className="font-mono text-gray-600 ml-2 text-xs">
                  {profile.id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
