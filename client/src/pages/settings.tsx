import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Palette, Database, Bell, Download, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useEffect, useState, useRef } from "react";
import { getShowInCommunity, setShowInCommunity } from "@/lib/community";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useWorkoutPreferences } from "@/hooks/use-workout-preferences";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { preferences, setDefaultRestTime } = useWorkoutPreferences();
  const { 
    preferences: notificationPrefs, 
    setWorkoutReminders, 
    setRestTimerAlerts, 
    setPersonalRecordAlerts 
  } = useNotificationPreferences();
  const [showInCommunity, setShowInCommunityState] = useState(false);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      setLoadingCommunity(true);
      getShowInCommunity(user.id)
        .then(setShowInCommunityState)
        .finally(() => setLoadingCommunity(false));
    }
  }, [user]);

  // Fetch profile info (username and profile_image_url) on mount/user change
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('users')
        .select('username, profile_image_url')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        setUsername(data.username || "");
        setProfileImageUrl(data.profile_image_url || null);
      }
    }
    fetchProfile();
  }, [user]);

  const handleCommunityToggle = async (checked: boolean) => {
    if (!user?.id) return;
    setLoadingCommunity(true);
    try {
      await setShowInCommunity(user.id, checked);
      setShowInCommunityState(checked);
    } finally {
      setLoadingCommunity(false);
    }
  };

  async function handleProfileSave(e: React.FormEvent) {
  e.preventDefault();
  if (!user?.id) return;
  setSavingProfile(true);
  const updates: any = { username };
  if (profileImageUrl) updates.profile_image_url = profileImageUrl;
  const { error } = await supabase.from('users').update(updates).eq('id', user.id);
  setSavingProfile(false);
  if (!error) {
    alert("Profile saved!");
    // Re-fetch BOTH username and profile_image_url from DB to ensure UI is up to date
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('username, profile_image_url')
      .eq('id', user.id)
      .single();
    if (!fetchError && data) {
      setUsername(data.username);
      setProfileImageUrl(data.profile_image_url || null);
    }
  } else {
    alert("Failed to save profile: " + (error.message || "Unknown error"));
  }
}

  // Handle data export
  async function handleExportData() {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to export data",
        variant: "destructive"
      });
      return;
    }

    setExportingData(true);
    try {
      // Make authenticated request to export endpoint
      const response = await fetch('/api/export/data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the CSV content
      const csvContent = await response.text();
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `fit-tracker-export-${timestamp}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your workout data has been downloaded as a CSV file",
        variant: "default"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setExportingData(false);
    }
  }

  // Handles clearing all user data with confirmation
  const handleClearData = async () => {
    if (!user?.id) return;

    setClearingData(true);
    try {
      console.log('[Clear Data] Starting data deletion for user:', user.id);
      
      const response = await apiRequest('DELETE', '/api/clear/data', {});
      
      console.log('[Clear Data] API response:', response);
      
      toast({
        title: "Data Cleared Successfully",
        description: "All your workout data has been permanently deleted. You will now be logged out.",
        variant: "default"
      });

      // Wait a moment for the toast to show, then logout
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
          // Force page reload to clear any cached data and go to landing page
          window.location.href = '/';
        } catch (logoutError) {
          console.error('[Clear Data] Logout error:', logoutError);
          // Force reload anyway
          window.location.href = '/';
        }
      }, 2000);
      
    } catch (error) {
      console.error('[Clear Data] Error:', error);
      toast({
        title: "Clear Data Failed",
        description: error instanceof Error ? error.message : "Failed to clear data",
        variant: "destructive"
      });
    } finally {
      setClearingData(false);
      setShowClearConfirm(false);
    }
  };

  // Handles avatar image selection and upload to Supabase Storage
async function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
  if (!user?.id || !e.target.files || e.target.files.length === 0) return;
  const file = e.target.files[0];
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}.${fileExt}`; // Save as <user.id>.<ext> in avatars bucket

  // Debug logging
  console.log("Uploading file:", file, file instanceof File, file.type, file.size);

  setSavingProfile(true);
  setProfileImageUrl(null);
  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    setSavingProfile(false);
    alert(`Upload failed: ${uploadError.message || "Unknown error"}`);
    return;
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  setProfileImageUrl(data.publicUrl);
  // Immediately update user's profile_image_url in DB
  await supabase.from('users').update({ profile_image_url: data.publicUrl }).eq('id', user.id);
  setSavingProfile(false);
}


  return (
    <div className="flex justify-between items-start">
      {/* Main Profile Section */}
      <div>
        <div className="mb-8 flex items-center gap-6">
        <div className="relative w-20 h-20">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" className="rounded-full w-20 h-20 object-cover border-2 border-slate-400" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-2xl text-white">👤</div>
          )}
          <button
            className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-1 border border-white"
            onClick={() => fileInputRef.current?.click()}
            title="Change avatar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5l-4 1 1-4L16.5 3.5Z"/></svg>
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
          />
        </div>
        <form onSubmit={handleProfileSave} className="flex flex-col gap-2 flex-1 max-w-xs">
          <label className="font-medium text-slate-900 dark:text-white">Username</label>
          <input
            className="rounded border px-3 py-2 bg-slate-900 text-white border-slate-700 focus:outline-none focus:ring focus:border-blue-500"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username"
            maxLength={32}
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded bg-blue-700 text-white font-bold hover:bg-blue-800 disabled:opacity-60"
            disabled={savingProfile || !username.trim()}
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {/* Community Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span role="img" aria-label="community">🌐</span>
              <span>Community Sharing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <Label>Share my activity on Community Dashboard</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Opt-in to show your workout activity to other users in real time.
              </p>
            </div>
            <Switch
              checked={showInCommunity}
              onCheckedChange={handleCommunityToggle}
              disabled={loadingCommunity}
            />
          </CardContent>
        </Card>
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Choose your preferred theme</p>
              </div>
              <Select value={theme} onValueChange={(value: "light" | "dark") => setTheme(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Workout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>Workout Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Default Rest Timer</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Default rest time between sets</p>
              </div>
              <Select 
                value={preferences.defaultRestTime.toString()} 
                onValueChange={(value) => setDefaultRestTime(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="90">1.5 minutes</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="180">3 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Temporarily hidden - will be implemented later
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-start rest timer</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Start timer automatically after completing a set</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show weight suggestions</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Suggest weights based on previous workouts</p>
              </div>
              <Switch defaultChecked />
            </div>
            */}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Workout reminders</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Get reminded to work out</p>
              </div>
              <Switch 
                checked={notificationPrefs.workoutReminders}
                onCheckedChange={setWorkoutReminders}
              />
            </div>

            {/* Rest timer alerts - temporarily hidden
            <div className="flex items-center justify-between">
              <div>
                <Label>Rest timer alerts</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Get notified when rest time is over</p>
              </div>
              <Switch 
                checked={notificationPrefs.restTimerAlerts}
                onCheckedChange={setRestTimerAlerts}
              />
            </div>
            */}

            <div className="flex items-center justify-between">
              <div>
                <Label>Personal record alerts</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Celebrate when you hit a new PR</p>
              </div>
              <Switch 
                checked={notificationPrefs.personalRecordAlerts}
                onCheckedChange={setPersonalRecordAlerts}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Export Data</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Download your workout data</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={exportingData}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{exportingData ? "Exporting..." : "Export CSV"}</span>
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Clear All Data</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Permanently delete all your workout data</p>
              </div>
              <div className="flex gap-2">
                {showClearConfirm ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowClearConfirm(false)}
                      disabled={clearingData}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleClearData}
                      disabled={clearingData}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>{clearingData ? "Clearing..." : "Confirm Delete"}</span>
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="destructive"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={clearingData}
                  >
                    Clear Data
                  </Button>
                )}
              </div>
            </div>
            {showClearConfirm && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium mb-1">This action cannot be undone!</p>
                    <p>This will permanently delete:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>All workout sessions and exercises</li>
                      <li>Personal records and achievements</li>
                      <li>Monthly goals and progress</li>
                      <li>Profile settings and preferences</li>
                    </ul>
                    <p className="mt-2 font-medium">You will be logged out after deletion.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div> {/* CLOSE .space-y-6 */}
    </div>   {/* CLOSE main profile section */}
    {/* Greeting Section */}
    {username && (
      <div className="ml-8 p-6 bg-slate-800 rounded-xl shadow text-white text-xl font-semibold min-w-[220px] flex flex-col items-center">
        <span role="img" aria-label="wave" className="text-3xl mb-2">👋</span>
        Hello, {username}!
      </div>
    )}
  </div>
);
}

