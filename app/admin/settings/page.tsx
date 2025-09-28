"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  CogIcon,
  ServerIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowUserRegistration: boolean;
    maxSongsPerUser: number;
    maxSongDuration: number;
  };
  api: {
    sunoApiKey: string;
    sunoApiUrl: string;
    maxConcurrentGenerations: number;
    defaultMusicModel: string;
    apiTimeout: number;
  };
  billing: {
    stripePublicKey: string;
    stripeSecretKey: string;
    defaultCredits: number;
    creditPricing: {
      basic: number;
      premium: number;
      pro: number;
    };
  };
  notifications: {
    emailNotifications: boolean;
    welcomeEmails: boolean;
    marketingEmails: boolean;
    systemAlerts: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    adminApprovalRequired: boolean;
    passwordMinLength: number;
  };
}

interface SystemStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    byRole: Record<string, number>;
  };
  songs: {
    total: number;
    successful: number;
    todayCount: number;
    successRate: string;
  };
  system: {
    status: string;
    uptime: string;
    apiStatus: string;
    sunoApiHealthy: boolean;
    maintenanceMode: boolean;
  };
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Fetch real system data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📊 ADMIN: Fetching real system stats...');
        
        // Fetch system stats
        const statsResponse = await fetch('/api/admin/system-stats', {
          method: 'GET',
          credentials: 'include',
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('✅ ADMIN: Received real stats:', statsData.stats);
          setStats(statsData.stats);
        } else {
          console.error('❌ ADMIN: Failed to fetch stats:', statsResponse.status);
        }

        // Load settings (for now, use default values - later you'd fetch from API)
        setSettings({
          general: {
            siteName: "TuneForge",
            siteDescription: "AI-Powered Music Creation Platform",
            maintenanceMode: false,
            allowUserRegistration: true,
            maxSongsPerUser: 100,
            maxSongDuration: 300
          },
          api: {
            sunoApiKey: "sk-***************",
            sunoApiUrl: "https://api.suno.ai",
            maxConcurrentGenerations: 10,
            defaultMusicModel: "chirp-v4",
            apiTimeout: 60000
          },
          billing: {
            stripePublicKey: "pk_test_***************",
            stripeSecretKey: "sk_test_***************",
            defaultCredits: 10,
            creditPricing: {
              basic: 9.99,
              premium: 19.99,
              pro: 39.99
            }
          },
          notifications: {
            emailNotifications: true,
            welcomeEmails: true,
            marketingEmails: false,
            systemAlerts: true,
            smtpHost: "smtp.resend.com",
            smtpPort: 587,
            smtpUser: "resend"
          },
          security: {
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            requireEmailVerification: true,
            adminApprovalRequired: false,
            passwordMinLength: 8
          }
        });

      } catch (error) {
        console.error('❌ ADMIN: Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (session?.user?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access admin settings.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setUnsavedChanges(false);
      alert("Settings saved successfully!");
    }, 2000);
  };

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "api", name: "API Settings", icon: ServerIcon },
    { id: "billing", name: "Billing", icon: CurrencyDollarIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon }
  ];

  if (loading || !settings) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600 mt-2">Configure system settings and preferences</p>
          </div>
          {unsavedChanges && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-600">
                <ExclamationCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">System Status</h3>
                <p className={`text-lg font-bold ${
                  stats?.system.status === 'operational' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats?.system.status ? 
                    stats.system.status.charAt(0).toUpperCase() + stats.system.status.slice(1) : 
                    'Loading...'
                  }
                </p>
              </div>
              {stats?.system.status === 'operational' ? (
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              ) : (
                <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">API Status</h3>
                <p className={`text-lg font-bold ${
                  stats?.system.apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats?.system.apiStatus ? 
                    stats.system.apiStatus.charAt(0).toUpperCase() + stats.system.apiStatus.slice(1) : 
                    'Loading...'
                  }
                </p>
              </div>
              <ServerIcon className={`w-8 h-8 ${
                stats?.system.apiStatus === 'connected' ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.system.uptime ? `${stats.system.uptime}%` : 'Loading...'}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.users.total !== undefined ? stats.users.total.toLocaleString() : 'Loading...'}
                </p>
                {stats?.users.active !== undefined && (
                  <p className="text-xs text-gray-500">
                    {stats.users.active} active (30d)
                  </p>
                )}
              </div>
              <UserGroupIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Songs Per User
                    </label>
                    <input
                      type="number"
                      value={settings.general.maxSongsPerUser}
                      onChange={(e) => handleSettingChange("general", "maxSongsPerUser", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => handleSettingChange("general", "maintenanceMode", e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Maintenance Mode
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.general.allowUserRegistration}
                        onChange={(e) => handleSettingChange("general", "allowUserRegistration", e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Allow User Registration
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">API Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suno API Key
                    </label>
                    <input
                      type="password"
                      value={settings.api.sunoApiKey}
                      onChange={(e) => handleSettingChange("api", "sunoApiKey", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API URL
                    </label>
                    <input
                      type="url"
                      value={settings.api.sunoApiUrl}
                      onChange={(e) => handleSettingChange("api", "sunoApiUrl", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Concurrent Generations
                    </label>
                    <input
                      type="number"
                      value={settings.api.maxConcurrentGenerations}
                      onChange={(e) => handleSettingChange("api", "maxConcurrentGenerations", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Music Model
                    </label>
                    <select
                      value={settings.api.defaultMusicModel}
                      onChange={(e) => handleSettingChange("api", "defaultMusicModel", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="chirp-v3-5">Chirp v3.5</option>
                      <option value="chirp-v4">Chirp v4</option>
                      <option value="chirp-v4-5">Chirp v4.5</option>
                      <option value="chirp-v4-5-plus">Chirp v4.5 Plus</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleSettingChange("security", "maxLoginAttempts", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.requireEmailVerification}
                        onChange={(e) => handleSettingChange("security", "requireEmailVerification", e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Require Email Verification
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.adminApprovalRequired}
                        onChange={(e) => handleSettingChange("security", "adminApprovalRequired", e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Admin Approval Required for New Users
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add other tab content sections here */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
