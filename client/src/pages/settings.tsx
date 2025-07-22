// Card components removed in favor of custom styled divs
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Palette, Database, Bell, Download, AlertTriangle, User, Globe } from "lucide-react";
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
      const response = await apiRequest('GET', '/api/export/data', {});
      
      // Create a blob from the response data
      const blob = new Blob([JSON.stringify(response)], { type: 'text/csv' });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `fit-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
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
      
      // Show success message
      toast({
        title: "Data Cleared",
        description: "All your workout data has been deleted. You will be logged out shortly.",
      });
      
      // Wait a moment before logging out
      setTimeout(() => {
        // Log the user out
        supabase.auth.signOut().then(() => {
          console.log('[Clear Data] User logged out after data deletion');
          // Redirect to login page
          window.location.href = '/login';
        });
      }, 3000);
    } catch (error) {
      console.error('[Clear Data] Error:', error);
      toast({
        title: "Error",
        description: "Failed to clear data. Please try again.",
        variant: "destructive"
      });
      setClearingData(false);
      setShowClearConfirm(false);
    }
  };

  // Handles avatar image selection and upload to Supabase Storage
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !user?.id) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file);
    
    if (uploadError) {
      alert('Error uploading image: ' + uploadError.message);
      return;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);
    
    // Update state with the new URL
    setProfileImageUrl(data.publicUrl);
  };


  return (
    <div className="settings-page px-4 md:px-6 pb-20">
      <style>{`
        .settings-page input::placeholder,
        .settings-page textarea::placeholder {
          color: #666666 !important;
          font-size: 0.75rem !important;
          opacity: 0.8 !important;
        }
      `}</style>
    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
      {/* Main Profile Section */}
      <div className="w-full">
        {/* Greeting Section - Moved from bottom to top */}
        {username && (
          <div className="mb-8 p-6 border border-slate-800 shadow text-white text-xl font-semibold w-full flex flex-col items-center" style={{borderRadius: 'var(--radius)', backgroundColor: '#10141c'}}>
            <span role="img" aria-label="wave" className="text-3xl mb-2">👋</span>
            Hello, {username}!
          </div>
        )}
        
        {/* Username Edit Form */}
        <div className="mb-8 border border-slate-800 p-4" style={{borderRadius: 'var(--radius)', backgroundColor: '#10141c'}}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5" style={{color: '#FFD300'}} />
              <span>Profile</span>
            </h3>
          </div>
          <form onSubmit={handleProfileSave} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full">
              <Label className="text-white font-medium">Username</Label>
              <input
                className="w-full mt-1 border px-3 py-2 bg-[#090C11] text-white border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FFD300] focus:border-[#FFD300]"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                maxLength={32}
                style={{borderRadius: 'var(--radius)'}}
              />
            </div>
            <Button
              type="submit"
              className="mt-2 sm:mt-6 px-4 py-2 bg-[#FFD300] text-black font-bold hover:bg-[#FFE14D] disabled:opacity-60 transition-colors"
              style={{borderRadius: 'var(--radius)'}}
              disabled={savingProfile || !username.trim()}
            >
              {savingProfile ? "Saving..." : "Save Username"}
            </Button>
          </form>
        </div>

      <div className="space-y-6 w-full max-w-2xl mx-auto md:mx-0">
        {/* Community Sharing */}
        <div className="border border-slate-800 p-4" style={{borderRadius: 'var(--radius)', backgroundColor: '#10141c'}}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5" style={{color: '#FFD300'}} />
              <span>Community Sharing</span>
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <Label className="text-white font-medium">Share my activity on Community Dashboard</Label>
              <p className="text-sm text-slate-400">
                Opt-in to show your workout activity to other users in real time.
              </p>
            </div>
            <Switch
              checked={showInCommunity}
              onCheckedChange={handleCommunityToggle}
              disabled={loadingCommunity}
            />
          </div>
        </div>
        {/* Appearance Settings */}
        <div className="border border-slate-800 p-4" style={{borderRadius: 'var(--radius)', backgroundColor: '#10141c'}}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5" style={{color: '#FFD300'}} />
              <span>Appearance</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-white font-medium">Theme</Label>
                <p className="text-sm text-slate-400">Choose your preferred theme</p>
              </div>
              <Select value={theme} onValueChange={(value: "light" | "dark") => setTheme(value)}>
                <SelectTrigger className="w-32 border-slate-700" style={{borderRadius: 'var(--radius)'}}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Workout Settings */}
        <div className="border border-slate-800 p-4" style={{borderRadius: 'var(--radius)', backgroundColor: '#10141c'}}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" style={{color: '#FFD300'}} />
              <span>Workout Preferences</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-white font-medium">Default Rest Timer</Label>
                <p className="text-sm text-slate-400">Default rest time between sets</p>
              </div>
              <Select 
                value={preferences.defaultRestTime.toString()} 
                onValueChange={(value) => setDefaultRestTime(parseInt(value))}
              >
                <SelectTrigger className="w-32 border-slate-700" style={{borderRadius: 'var(--radius)'}}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 sec</SelectItem>
                  <SelectItem value="45">45 sec</SelectItem>
                  <SelectItem value="60">60 sec</SelectItem>
                  <SelectItem value="90">90 sec</SelectItem>
                  <SelectItem value="120">2 min</SelectItem>
                  <SelectItem value="180">3 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Uncomment when implementing this feature
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label>Auto-start rest timer</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Automatically start rest timer after completing a set
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            */}
          </div>
        </div>

        {/* Notifications */}
        <div className="border border-slate-800 p-4" style={{borderRadius: 'var(--radius)', backgroundColor: '#10141c'}}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5" style={{color: '#FFD300'}} />
              <span>Notifications</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-white font-medium">Workout reminders</Label>
                <p className="text-sm text-slate-400">Get reminded to work out</p>
              </div>
              <Switch 
                checked={notificationPrefs.workoutReminders}
                onCheckedChange={setWorkoutReminders}
              />
            </div>
            {/* Uncomment when implementing this feature
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label>Rest timer alerts</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when rest timer completes
                </p>
              </div>
              <Switch 
                checked={notificationPrefs.restTimerAlerts}
                onCheckedChange={setRestTimerAlerts}
              />
            </div>
            */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-white font-medium">Personal record alerts</Label>
                <p className="text-sm text-slate-400">Celebrate when you hit a new PR</p>
              </div>
              <Switch 
                checked={notificationPrefs.personalRecordAlerts}
                onCheckedChange={setPersonalRecordAlerts}
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="border border-slate-800 p-4 pb-6 mb-20" style={{borderRadius: 'var(--radius)', backgroundColor: '#10141c'}}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5" style={{color: '#FFD300'}} />
              <span>Data Management</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-white font-medium">Export Data</Label>
                <p className="text-sm text-slate-400">Download your workout data</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={exportingData}
                className="border-slate-700 hover:border-slate-600 transition-colors flex items-center space-x-2" 
                style={{borderRadius: 'var(--radius)'}}
              >
                <Download className="w-4 h-4" />
                <span>{exportingData ? "Exporting..." : "Export CSV"}</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-white font-medium">Clear All Data</Label>
                <p className="text-sm text-slate-400">Permanently delete all your workout data</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                {showClearConfirm ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-slate-700 hover:border-slate-600 transition-colors"
                      style={{borderRadius: 'var(--radius)'}}
                      onClick={() => setShowClearConfirm(false)}
                      disabled={clearingData}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      style={{borderRadius: 'var(--radius)'}}
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
                    style={{borderRadius: 'var(--radius)'}}
                    onClick={() => setShowClearConfirm(true)}
                    disabled={clearingData}
                  >
                    Clear Data
                  </Button>
                )}
              </div>
            </div>
            {showClearConfirm && (
              <div className="mt-3 p-3 bg-red-950/20 border border-red-800" style={{borderRadius: 'var(--radius)'}}>
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
          </div>
        </div>
      </div> {/* CLOSE .space-y-6 */}
    </div>   {/* CLOSE main profile section */}
    
    {/* Hidden file input for profile image upload */}
    <input 
      type="file" 
      ref={fileInputRef} 
      className="hidden" 
      accept="image/*"
      onChange={handleProfileImageChange}
    />
  </div>
  </div>
);
}
