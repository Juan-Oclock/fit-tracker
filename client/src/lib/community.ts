import { supabase } from '@/lib/supabase';

export async function getShowInCommunity(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('show_in_community')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return !!data?.show_in_community;
}

export async function setShowInCommunity(userId: string, value: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ show_in_community: value })
    .eq('id', userId);
  if (error) throw error;
}

/**
 * Upserts user presence/activity to the community_presence table if opted in.
 * @param userId User's id
 * @param username User's username
 * @param workoutName Name of the workout completed
 * @param exerciseName Name of the last exercise completed
 */
export async function upsertCommunityPresence({
  userId,
  username,
  workoutName,
  exerciseName,
  profileImageUrl,
}: {
  userId: string;
  username?: string;
  workoutName: string;
  exerciseName: string;
  profileImageUrl?: string | null;
}) {
  console.log('[community] upsertCommunityPresence called with:', { userId, username, workoutName, exerciseName, profileImageUrl });
  // Check if user is opted in and get username/profile image if not provided
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('show_in_community, username, profile_image_url')
    .eq('id', userId)
    .single();
  console.log('[community] user lookup:', { user, userError });
  if (userError) {
    console.error('[community] user lookup error:', userError);
    throw userError;
  }
  if (!user?.show_in_community) {
    console.warn('[community] User is not opted in for community presence:', userId);
    return;
  }

  const finalUsername = username || user?.username || '';
  const finalProfileImageUrl = profileImageUrl !== undefined ? profileImageUrl : user?.profile_image_url || null;

  const { data: upsertData, error } = await supabase.from('community_presence').upsert({
    user_id: userId,
    username: finalUsername,
    profile_image_url: finalProfileImageUrl,
    workout_name: workoutName,
    exercise_name: exerciseName,
    last_active: new Date().toISOString(),
  });
  console.log('[community] upsert result:', { upsertData, error });
  if (error) {
    console.error('[community] upsert error:', error);
    throw error;
  }
}
