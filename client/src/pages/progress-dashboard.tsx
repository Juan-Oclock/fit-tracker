import PersonalRecordsWidget from '@/components/progress/PersonalRecordsWidget';
import WorkoutFrequencyWidget from '@/components/progress/WorkoutFrequencyWidget';
import RecentProgressChart from '@/components/progress/RecentProgressChart';
import GoalProgressWidget from '@/components/progress/GoalProgressWidget';
import MuscleGroupWidget from '@/components/progress/MuscleGroupWidget';
import AchievementsWidget from '@/components/progress/AchievementsWidget';

export default function ProgressDashboard() {
  return (
    <div className="space-y-8">
      {/* 1. Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AchievementsWidget />
        <GoalProgressWidget /> {/* 2. Goal Progress */}
      </div>
      {/* 3. Workout Frequency and 4. Personal Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WorkoutFrequencyWidget />
        <PersonalRecordsWidget />
      </div>
      {/* 5. PR (RecentProgressChart) and 6. Muscle Group Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentProgressChart />
        <MuscleGroupWidget />
      </div>
    </div>
  );
}
