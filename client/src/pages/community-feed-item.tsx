import { Card, CardContent } from '@/components/ui/card';
import { User, Dumbbell, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CommunityUserActivity {
  user_id: string;
  username: string;
  profile_image_url?: string | null;
  workout_name: string;
  exercise_name: string;
  last_active: string; // ISO string
}

interface Props {
  activity: CommunityUserActivity;
}

export function CommunityFeedItem({ activity }: Props) {
  const [goalPercent, setGoalPercent] = useState<number | null>(null);
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);

  // Fetch Google avatar if not present in activity
  useEffect(() => {
    async function fetchGoogleAvatar() {
      if (activity.user_id) {
        // Try to fetch user_metadata from Supabase Auth users table
        const { data, error } = await supabase
          .from('users')
          .select('google_avatar_url, user_metadata')
          .eq('id', activity.user_id)
          .single();
        if (!error) {
          // Prefer explicit google_avatar_url or user_metadata.avatar_url
          setGoogleAvatar(data?.google_avatar_url || data?.user_metadata?.avatar_url || null);
        }
      }
    }
    fetchGoogleAvatar();
  }, [activity.user_id]);

  // Fetch goal percent for the current user activity
  useEffect(() => {
    async function fetchGoalPercent() {
      // Get current month and year
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      // Fetch monthly goal
      const { data: goalData } = await supabase
        .from('monthly_goals')
        .select('target_workouts')
        .eq('user_id', activity.user_id)
        .eq('month', month)
        .eq('year', year)
        .single();
      // Fetch completed workouts for this user in current month
      const { count: completedCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', activity.user_id)
        .gte('date', new Date(year, month - 1, 1).toISOString())
        .lte('date', new Date(year, month, 0, 23, 59, 59).toISOString());
      if (goalData?.target_workouts && completedCount !== null) {
        setGoalPercent(Math.min(100, Math.round((completedCount / goalData.target_workouts) * 100)));
      } else {
        setGoalPercent(null);
      }
    }
    fetchGoalPercent();
    // eslint-disable-next-line
  }, [activity.user_id]);

  return (
    <Card className="bg-slate-800">
      <CardContent className="flex items-center gap-4 p-4">
        {/* Prefer Google avatar if available, then profile_image_url, then default */}
        {googleAvatar ? (
          <img
            src={googleAvatar}
            alt={activity.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
          />
        ) : activity.profile_image_url ? (
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
        {goalPercent !== null ? (
          <span className="flex items-center gap-1 text-xs text-blue-300 bg-blue-900 px-2 py-1 rounded-full">
            <Target className="w-4 h-4" /> Goal: {goalPercent}%
          </span>
        ) : (
          <span className="text-xs text-slate-500">No goal</span>
        )}
        <span className="text-xs text-slate-500 ml-4">{new Date(activity.last_active).toLocaleTimeString()}</span>
      </CardContent>
    </Card>
  );
}
