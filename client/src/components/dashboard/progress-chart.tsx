import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProgressChart() {
  // Mock data for the chart - in a real app, this would come from API
  const weeklyData = [
    { week: "W1", workouts: 3 },
    { week: "W2", workouts: 4 },
    { week: "W3", workouts: 3 },
    { week: "W4", workouts: 5 },
    { week: "W5", workouts: 4 },
    { week: "W6", workouts: 4 },
    { week: "W7", workouts: 5 },
    { week: "W8", workouts: 3 },
    { week: "W9", workouts: 4 },
    { week: "W10", workouts: 5 },
    { week: "W11", workouts: 6 },
    { week: "W12", workouts: 4 },
  ];

  const maxWorkouts = Math.max(...weeklyData.map(d => d.workouts));

  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Progress</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Workout frequency over the last 12 weeks</p>
          </div>
          <Select defaultValue="12weeks">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12weeks">Last 12 weeks</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {weeklyData.map((data) => (
            <div key={data.week} className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ 
                  height: `${(data.workouts / maxWorkouts) * 100}%`,
                  minHeight: "4px"
                }}
                title={`${data.workouts} workouts`}
              ></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">{data.week}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
