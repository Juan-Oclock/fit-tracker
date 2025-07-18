import { useWorkoutStats } from '@/hooks/use-workouts';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Flame, Award, Dumbbell } from 'lucide-react';

const ACHIEVEMENT_MILESTONES = [
  { count: 1, label: 'First Workout', icon: <Star className="w-4 h-4 mr-1" /> },
  { count: 10, label: '10 Workouts', icon: <Flame className="w-4 h-4 mr-1" /> },
  { count: 50, label: '50 Workouts', icon: <Award className="w-4 h-4 mr-1" /> },
  { count: 100, label: '100 Workouts', icon: <Trophy className="w-4 h-4 mr-1" /> },
];

export default function AchievementsWidget() {
  const { data: stats, isLoading, error } = useWorkoutStats();

  // Determine which milestones are achieved
  const achievedMilestones = (stats?.totalWorkouts ? ACHIEVEMENT_MILESTONES.filter(m => stats.totalWorkouts >= m.count) : []);

  // Weekly goal streak badge
  const weeklyGoalAchieved = stats && stats.thisWeek >= stats.weeklyGoal;

  // Personal Record badge
  const hasPersonalRecord = stats?.personalRecords != null;

  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full flex flex-col items-center justify-center w-full min-h-[220px]">
      <h3 className="text-lg font-semibold mb-2 text-white">Achievements</h3>
      {isLoading ? (
        <div className="text-slate-400">Loading achievements...</div>
      ) : error ? (
        <div className="text-red-400">Error loading achievements</div>
      ) : !stats || (achievedMilestones.length === 0 && !weeklyGoalAchieved && !hasPersonalRecord) ? (
        <div className="text-slate-400 text-center">No achievements yet. Start working out to earn your first badge!</div>
      ) : (
        <div className="flex flex-col items-center w-full space-y-4">
          {/* Milestone Badges */}
          {achievedMilestones.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {achievedMilestones.map(m => (
                <Badge key={m.count} variant="secondary" className="flex items-center gap-1 bg-slate-700 text-yellow-300 border-yellow-400">
                  {m.icon}
                  {m.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Weekly Goal Badge */}
          {weeklyGoalAchieved && (
            <Badge variant="default" className="flex items-center gap-1 bg-green-700 text-green-200 border-green-400">
              <Trophy className="w-4 h-4 mr-1" />
              Weekly Goal Achieved
            </Badge>
          )}

          {/* Personal Record Badge */}
          {hasPersonalRecord && stats.personalRecords && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-700 text-blue-200 border-blue-400">
              <Dumbbell className="w-4 h-4 mr-1" />
              PR: {stats.personalRecords.exerciseName} - {stats.personalRecords.weight}kg
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
