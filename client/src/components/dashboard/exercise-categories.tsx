import { useExercises } from "@/hooks/use-exercises";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Heart, Flower } from "lucide-react";

export default function ExerciseCategories() {
  const { data: exercises, isLoading } = useExercises();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryStats = exercises?.reduce((acc, exercise) => {
    acc[exercise.category] = (acc[exercise.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalExercises = exercises?.length || 0;

  const categories = [
    { 
      name: "Strength", 
      count: categoryStats.strength || 0, 
      icon: Zap, 
      color: "bg-red-100 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-400"
    },
    { 
      name: "Cardio", 
      count: categoryStats.cardio || 0, 
      icon: Heart, 
      color: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      name: "Flexibility", 
      count: categoryStats.flexibility || 0, 
      icon: Flower, 
      color: "bg-green-100 dark:bg-green-900/50",
      iconColor: "text-green-600 dark:text-green-400"
    },
  ];

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Exercise Categories</h3>
        
        <div className="space-y-4">
          {categories.map((category) => {
            const percentage = totalExercises > 0 ? Math.round((category.count / totalExercises) * 100) : 0;
            const Icon = category.icon;
            
            return (
              <div key={category.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${category.color} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${category.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{category.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{category.count} exercises</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
