"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  UserIcon, 
  BellIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
  CameraIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface UserSettings {
  name: string;
  email: string;
  bio: string;
  website: string;
  favoriteGenres: string[];
  notifications: {
    email: boolean;
    songComplete: boolean;
    weeklyDigest: boolean;
    promotions: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showLibrary: boolean;
    allowCollaborations: boolean;
  };
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    bio: "",
    website: "",
    favoriteGenres: [],
    notifications: {
      email: true,
      songComplete: true,
      weeklyDigest: false,
      promotions: false
    },
    privacy: {
      profilePublic: false,
      showLibrary: false,
      allowCollaborations: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const genres = [
    "Pop", "Rock", "Electronic", "Jazz", "Classical", "Hip-Hop", 
    "Country", "R&B", "Indie", "Folk", "Reggae", "Blues"
  ];

  useEffect(() => {
    if (session?.user) {
      setSettings(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || ""
      }));
      setLoading(false);
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the database
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Update the session if name changed
        if (settings.name !== session?.user?.name) {
          await update({ name: settings.name });
        }
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "privacy", name: "Privacy", icon: ShieldCheckIcon },
    { id: "preferences", name: "Music Preferences", icon: MusicalNoteIcon },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  
                  {/* Profile Picture */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          className="w-20 h-20 rounded-full"
                          width={80}
                          height={80}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {settings.name.charAt(0) || "U"}
                        </div>
                      )}
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <CameraIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-600">Update your profile picture</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={settings.bio}
                      onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself and your music..."
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">{settings.bio.length}/500 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={settings.website}
                      onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://your-website.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, email: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Song Generation Complete</h3>
                        <p className="text-sm text-gray-600">Get notified when your songs are ready</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.songComplete}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, songComplete: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Weekly Digest</h3>
                        <p className="text-sm text-gray-600">Weekly summary of your activity</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.weeklyDigest}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, weeklyDigest: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Promotions & Updates</h3>
                        <p className="text-sm text-gray-600">Special offers and product updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.promotions}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, promotions: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Public Profile</h3>
                        <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.profilePublic}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, profilePublic: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Show Music Library</h3>
                        <p className="text-sm text-gray-600">Allow others to see your created songs</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showLibrary}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, showLibrary: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Allow Collaborations</h3>
                        <p className="text-sm text-gray-600">Let other users invite you to collaborate</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.allowCollaborations}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, allowCollaborations: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Music Preferences</h2>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Favorite Genres</h3>
                    <p className="text-sm text-gray-600 mb-4">Select your favorite music genres to get personalized recommendations</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => handleGenreToggle(genre)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            settings.favoriteGenres.includes(genre)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
