import { useWorkoutsWithExercises } from '@/hooks/use-workouts';
import { ChartContainer } from '@/components/ui/chart';
import * as Recharts from 'recharts';
import { useMemo } from 'react';
import { DEFAULT_MUSCLE_GROUPS } from '@/lib/constants';

const COLORS = [
  '#22d3ee', '#818cf8', '#f472b6', '#facc15', '#34d399', '#f87171', '#a78bfa', '#fb7185', '#fbbf24', '#60a5fa', '#10b981', '#f59e42', '#6ee7b7', '#f43f5e', '#6366f1', '#eab308', '#3b82f6'
];

export default function MuscleGroupWidget() {
  const { data: workouts, isLoading, error } = useWorkoutsWithExercises();

  // Aggregate muscle group frequencies from all workouts
  const distribution = useMemo(() => {
    if (!workouts) return [];
    const freq: Record<string, number> = {};
    workouts.forEach(w => {
      w.exercises.forEach(e => {
        const mg = e.exercise?.muscleGroup || 'Unknown';
        freq[mg] = (freq[mg] || 0) + 1;
      });
    });
    const arr = Object.entries(freq).map(([muscle, count]) => ({ muscle, count }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [workouts]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full flex flex-col items-center justify-center min-h-[240px] w-full">
      <h3 className="text-lg font-semibold mb-2 text-white">Muscle Group Distribution</h3>
      {isLoading ? (
        <div className="text-slate-400">Loading...</div>
      ) : error ? (
        <div className="text-red-400">Error loading data</div>
      ) : !distribution.length ? (
        <div className="text-slate-400">No muscle group data found.</div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="mb-2 text-slate-400 text-xs">Based on all tracked workouts</div>
          <ChartContainer config={{}} className="w-full flex justify-center">
            <Recharts.PieChart width={260} height={220}>
              <Recharts.Pie
                data={distribution}
                dataKey="count"
                nameKey="muscle"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                label={({ percent, muscle }) => percent > 0.06 ? `${muscle} ${(percent * 100).toFixed(0)}%` : ''}
                isAnimationActive={false}
              >
                {distribution.map((entry, idx) => (
                  <Recharts.Cell key={`cell-${entry.muscle}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Recharts.Pie>
              <Recharts.Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const { muscle, count, percent } = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white rounded px-3 py-2 shadow text-xs">
                      <div className="font-semibold">{muscle}</div>
                      <div>{count} times trained</div>
                      <div>{(percent * 100).toFixed(1)}%</div>
                    </div>
                  );
                }}
              />
            </Recharts.PieChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
