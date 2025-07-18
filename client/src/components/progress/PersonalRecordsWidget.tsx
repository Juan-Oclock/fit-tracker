import { useWorkoutsWithExercises } from '@/hooks/use-workouts';

function getBestRecords(workouts) {
  // Map: exerciseName => { bestWeight, bestWeightReps, bestWeightDate, bestReps, bestRepsWeight, bestRepsDate }
  const records = {};
  workouts?.forEach(w => {
    w.exercises.forEach(e => {
      const name = e.exercise?.name || 'Unknown';
      const weight = Number(e.weight);
      const reps = Number(e.reps);
      const date = w.date;
      if (!records[name]) {
        records[name] = {
          bestWeight: weight,
          bestWeightReps: reps,
          bestWeightDate: date,
          bestReps: reps,
          bestRepsWeight: weight,
          bestRepsDate: date,
        };
      } else {
        // Best weight
        if (weight > records[name].bestWeight) {
          records[name].bestWeight = weight;
          records[name].bestWeightReps = reps;
          records[name].bestWeightDate = date;
        }
        // Best reps
        if (reps > records[name].bestReps) {
          records[name].bestReps = reps;
          records[name].bestRepsWeight = weight;
          records[name].bestRepsDate = date;
        }
      }
    });
  });
  return records;
}

export default function PersonalRecordsWidget() {
  const { data: workouts, isLoading, error } = useWorkoutsWithExercises();
  const records = getBestRecords(workouts);
  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full w-full">
      <h3 className="text-lg font-semibold mb-4 text-white">Personal Records</h3>
      {isLoading ? (
        <div className="text-slate-400">Loading...</div>
      ) : error ? (
        <div className="text-red-400">Error loading records</div>
      ) : Object.keys(records).length === 0 ? (
        <div className="text-slate-400">No records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-slate-300">
                <th className="px-2 py-1 text-left">Exercise</th>
                <th className="px-2 py-1 text-left">Best Weight</th>
                <th className="px-2 py-1 text-left">Reps (at best weight)</th>
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-left">Best Reps</th>
                <th className="px-2 py-1 text-left">Weight (at best reps)</th>
                <th className="px-2 py-1 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(records).map(([name, rec]) => (
                <tr key={name} className="border-t border-slate-700">
                  <td className="px-2 py-1 font-semibold text-white">{name}</td>
                  <td className="px-2 py-1">{isNaN(rec.bestWeight) ? 0 : rec.bestWeight}</td>
                  <td className="px-2 py-1">{isNaN(rec.bestWeightReps) ? 0 : rec.bestWeightReps}</td>
                  <td className="px-2 py-1">{rec.bestWeightDate ? new Date(rec.bestWeightDate).toLocaleDateString() : ''}</td>
                  <td className="px-2 py-1">{isNaN(rec.bestReps) ? 0 : rec.bestReps}</td>
                  <td className="px-2 py-1">{isNaN(rec.bestRepsWeight) ? 0 : rec.bestRepsWeight}</td>
                  <td className="px-2 py-1">{rec.bestRepsDate ? new Date(rec.bestRepsDate).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
