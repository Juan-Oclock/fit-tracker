import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function ActiveUserCountLabel() {
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveUsers() {
      setLoading(true);
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // last 5 minutes
      const { data, error } = await supabase
        .from('community_presence')
        .select('user_id', { count: 'exact', head: false })
        .gte('last_active', since);
      if (!error && data) {
        // Count unique user_ids
        const uniqueUsers = new Set(data.map((row: any) => row.user_id));
        setActiveCount(uniqueUsers.size);
      } else {
        setActiveCount(null);
      }
      setLoading(false);
    }
    fetchActiveUsers();
    // Optionally, poll every 30s for real-time update
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center text-blue-300 text-sm my-3">
      {loading ? (
        'Checking for active users...'
      ) : (
        <span>
          {activeCount === 1
            ? 'There is 1 person online and actively using the app.'
            : `There are ${activeCount ?? 0} people online and actively using the app.`}
        </span>
      )}
    </div>
  );
}
