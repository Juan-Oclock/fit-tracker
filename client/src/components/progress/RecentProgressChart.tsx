import { useWorkoutsWithExercises } from '@/hooks/use-workouts';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function getFavoriteExercise(workouts: any[]) {
  const freq: Record<string, number> = {};
  workouts?.forEach(w => {
    w.exercises.forEach(e => {
      const name = e.exercise?.name || 'Unknown';
      freq[name] = (freq[name] || 0) + 1;
    });
  });
  let max = 0, fav = '';
  for (const name in freq) {
    if (freq[name] > max) {
      max = freq[name];
      fav = name;
    }
  }
  return fav;
}

function getProgressData(workouts: any[], exerciseName: string) {
  // For each workout, find the best weight for the given exercise
  const points = workouts?.map(w => {
    const sets = w.exercises.filter(e => e.exercise?.name === exerciseName);
    if (sets.length === 0) return null;
    const bestWeight = Math.max(...sets.map(e => Number(e.weight) || 0));
    return {
      date: w.date,
      weight: bestWeight,
    };
  }).filter(Boolean) || [];
  // Sort by date
  points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return points;
}

import { useState } from 'react';

export default function RecentProgressChart() {
  const { data: workouts, isLoading, error } = useWorkoutsWithExercises();
  // Get unique exercise names
  const exerciseNames = useMemo(() => {
    const set = new Set<string>();
    workouts?.forEach(w => w.exercises.forEach(e => set.add(e.exercise?.name || 'Unknown')));
    return Array.from(set).sort();
  }, [workouts]);

  const favoriteExercise = useMemo(() => getFavoriteExercise(workouts), [workouts]);
  const [selectedExercise, setSelectedExercise] = useState<string | undefined>(undefined);
  const exerciseToShow = selectedExercise || favoriteExercise;
  const progressData = useMemo(() => getProgressData(workouts, exerciseToShow), [workouts, exerciseToShow]);

  const chartData = {
    labels: progressData.map((p: any) => new Date(p.date).toLocaleDateString()),
    datasets: [
      {
        label: exerciseToShow ? `${exerciseToShow} (Best Weight)` : 'Best Weight',
        data: progressData.map((p: any) => p.weight),
        fill: false,
        borderColor: '#22c55e',
        backgroundColor: '#22c55e',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y} kg`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#cbd5e1' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#cbd5e1' },
      },
    },
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full w-full">
      <h3 className="text-lg font-semibold mb-4 text-white">Recent Progress</h3>
      {isLoading ? (
        <div className="text-slate-400">Loading...</div>
      ) : error ? (
        <div className="text-red-400">Error loading data</div>
      ) : !exerciseToShow ? (
        <div className="text-slate-400">No exercise data found.</div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="exercise-select" className="block text-xs font-medium text-slate-300 mb-1">Select Exercise:</label>
            <select
              id="exercise-select"
              className="bg-slate-700 text-white rounded px-3 py-2"
              value={exerciseToShow}
              onChange={e => setSelectedExercise(e.target.value)}
            >
              {exerciseNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="mb-2 text-slate-400 text-xs">{exerciseToShow} (best weight per session)</div>
          <Line data={chartData} options={chartOptions} height={220} />
        </>
      )}
    </div>
  );
}
