import { useMonthlyGoalData } from '@/hooks/use-monthly-goals';
import { GoalProgressBar } from '@/components/goal/goal-progress-bar';
import { MonthlyGoalSettingDialog } from '@/components/monthly-goal-setting-dialog';
import { useMemo } from 'react';

export default function GoalProgressWidget() {
  const today = useMemo(() => new Date(), []);
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const { data, isLoading, error } = useMonthlyGoalData(month, year);

  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full flex flex-col justify-between items-center min-h-[220px] w-full">
      <div className="w-full flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2 text-white">Goal Progress</h3>
        {isLoading ? (
          <div className="text-slate-400">Loading...</div>
        ) : error ? (
          <div className="text-red-400">Error loading goal data</div>
        ) : !data ? (
          <div className="text-slate-400">No goal set for this month.</div>
        ) : (
          <GoalProgressBar
            current={data.completedWorkouts}
            target={data.targetWorkouts}
            month={today.toLocaleString('default', { month: 'long' })}
          />
        )}
      </div>
      <div className="mt-4">
        <MonthlyGoalSettingDialog
          currentGoal={data?.targetWorkouts || 0}
          month={month}
          year={year}
        />
      </div>
    </div>
  );
}
