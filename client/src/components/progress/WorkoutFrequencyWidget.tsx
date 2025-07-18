import { useWorkoutsWithExercises } from '@/hooks/use-workouts';
import { format, startOfWeek, addWeeks, isAfter, isBefore } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getWeeklyCounts(workouts: any[] = [], numWeeks: number) {
  const now = new Date();
  const weekStarts: Date[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    weekStarts.push(startOfWeek(addWeeks(now, -i), { weekStartsOn: 1 }));
  }
  const counts = weekStarts.map((start, idx) => {
    const end = idx < weekStarts.length - 1 ? weekStarts[idx + 1] : addWeeks(start, 1);
    const count = workouts?.filter(w => {
      const d = new Date(w.date);
      return (isAfter(d, start) || d.getTime() === start.getTime()) && isBefore(d, end);
    }).length || 0;
    return { week: format(start, 'MMM d'), count };
  });
  return counts;
}

export default function WorkoutFrequencyWidget() {
  const { data: workouts, isLoading, error } = useWorkoutsWithExercises();
  const weeklyCounts = getWeeklyCounts(workouts, 8);
  const chartData = {
    labels: weeklyCounts.map(w => w.week),
    datasets: [
      {
        label: 'Workouts',
        data: weeklyCounts.map(w => w.count),
        backgroundColor: '#22c55e',
        borderRadius: 6,
        barThickness: 28,
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
          label: (ctx: any) => ` ${ctx.parsed.y} workout${ctx.parsed.y === 1 ? '' : 's'}`,
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
        ticks: { color: '#cbd5e1', stepSize: 1 },
        precision: 0,
      },
    },
  };
  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full w-full">
      <h3 className="text-lg font-semibold mb-4 text-white">Workout Frequency</h3>
      {isLoading ? (
        <div className="text-slate-400">Loading...</div>
      ) : error ? (
        <div className="text-red-400">Error loading data</div>
      ) : (
        <div>
          <div className="mb-2 text-slate-400 text-xs">Last 8 weeks</div>
          <Bar data={chartData} options={chartOptions} height={240} />
        </div>
      )}
    </div>
  );
}
