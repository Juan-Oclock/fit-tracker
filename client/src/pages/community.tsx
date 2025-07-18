import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Dumbbell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface CommunityUserActivity {
  user_id: string;
  username: string;
  profile_image_url?: string | null;
  workout_name: string;
  exercise_name: string;
  last_active: string; // ISO string
}

export default function CommunityDashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<CommunityUserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [optedIn, setOptedIn] = useState(false);

  // Fetch opt-in status
  useEffect(() => {
    async function fetchOptIn() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('users')
        .select('show_in_community')
        .eq('id', user.id)
        .single();
      if (!error && data) setOptedIn(!!data.show_in_community);
    }
    fetchOptIn();
  }, [user]);

  // Fetch and subscribe to presence
  useEffect(() => {
    let subscription: any;
    async function fetchActivities() {
      setLoading(true);
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('community_presence')
        .select('*')
        .gte('last_active', since)
        .order('last_active', { ascending: false });
      if (!error && data) setActivities(data);
      setLoading(false);
    }
    fetchActivities();
    // Subscribe to realtime changes
    subscription = supabase
      .channel('community_presence_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_presence' }, () => {
        fetchActivities();
      })
      .subscribe();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-4">Community Dashboard</h1>
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Community Feed</h2>
            <p className="text-slate-400 text-sm">See what others are working on in real time (opt-in required).</p>
          </div>
          <span className={`rounded px-3 py-1 text-xs font-bold ${optedIn ? 'bg-green-700 text-green-200' : 'bg-slate-700 text-slate-400'}`}>
            {optedIn ? 'Sharing Enabled' : 'Private'}
          </span>
        </CardContent>
      </Card>
      {!optedIn ? (
        <div className="text-center text-slate-400 py-12">
          Enable sharing in your Settings to join the live community feed!
        </div>
      ) : loading ? (
        <div className="text-center text-slate-400 py-12">Loading community activity...</div>
      ) : (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              No community activity yet. Be the first to finish a workout!
            </div>
          ) : (
            activities.map((activity) => (
              <Card key={activity.user_id} className="bg-slate-800">
                <CardContent className="flex items-center gap-4 p-4">
                  {activity.profile_image_url ? (
                    <img
                      src={activity.profile_image_url}
                      alt={activity.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                    />
                  ) : (
                    <User className="w-10 h-10 text-blue-400 bg-slate-700 rounded-full p-1" />
                  )}
                  <div className="flex-1">
                    <span className="font-semibold text-white">{activity.username}</span>
                    <span className="text-slate-400"> just finished </span>
                    <span className="font-semibold text-green-400">{activity.workout_name}</span>
                    <span className="text-slate-400"> doing </span>
                    <span className="font-semibold text-yellow-300 flex items-center gap-1">
                      <Dumbbell className="inline w-4 h-4" />{activity.exercise_name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(activity.last_active).toLocaleTimeString()}</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
