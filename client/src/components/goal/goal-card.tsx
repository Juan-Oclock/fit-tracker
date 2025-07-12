import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MonthlyCalendar } from "./monthly-calendar";
import { GoalProgressBar } from "./goal-progress-bar";
import { MonthlyGoalSettingDialog } from "@/components/monthly-goal-setting-dialog";
import { ChevronLeft, ChevronRight, Calendar, Camera, Target } from "lucide-react";
import { format } from "date-fns";
import { useMonthlyGoalData, useWorkoutDatesForMonth } from "@/hooks/use-monthly-goals";
import { useWorkouts } from "@/hooks/use-workouts";
import { ImageUpload } from "@/components/image-upload";
import { useCreateGoalPhoto } from "@/hooks/use-goal-photos";

interface GoalCardProps {
  className?: string;
}

export function GoalCard({ className }: GoalCardProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Add the hook here
  const createGoalPhoto = useCreateGoalPhoto();
  
  // Fetch real workout data
  const { data: monthlyGoalData, isLoading: isGoalLoading } = useMonthlyGoalData(selectedMonth, selectedYear);
  const { data: allWorkouts = [] } = useWorkouts();
  
  // Use workout dates from monthlyGoalData instead of separate API call
  const workoutDates = monthlyGoalData?.workoutDates || [];
  
  // Calculate dynamic data from real workouts
  const currentMonthWorkouts = allWorkouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate.getMonth() + 1 === selectedMonth && workoutDate.getFullYear() === selectedYear;
  });
  
  const completedWorkouts = currentMonthWorkouts.length;
  const targetWorkouts = monthlyGoalData?.targetWorkouts || 20;
  
  // Get latest workout photo from any workout
  const allWorkoutsWithPhotos = allWorkouts
    .filter(workout => workout.imageUrl)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const latestWorkoutWithPhoto = currentMonthWorkouts
    .filter(workout => workout.imageUrl)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || allWorkoutsWithPhotos[0];
  
  // Get before photo for the selected month
  const beforePhoto = monthlyGoalData?.beforePhoto;
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };
  
  // Add the handler function here
  const handlePhotoUpload = async (imageUrl: string | null, type: 'before' | 'progress') => {
    if (imageUrl) {
      try {
        await createGoalPhoto.mutateAsync({
          month: selectedMonth,
          year: selectedYear,
          imageUrl,
          type,
          description: `${type} photo for ${selectedMonth}/${selectedYear}`
        });
      } catch (error) {
        console.error('Failed to upload photo:', error);
      }
    }
  };
  
  if (isGoalLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span className="hidden sm:inline">Monthly Goal Tracker</span>
            <span className="sm:hidden">Goal Tracker</span>
          </CardTitle>
          
          {/* Month Navigation and Goal Setting */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Monthly Goal Setting Button */}
            <MonthlyGoalSettingDialog 
              currentGoal={targetWorkouts}
              month={selectedMonth}
              year={selectedYear}
              trigger={
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1 px-2 sm:px-3"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Set Goal</span>
                  <span className="sm:hidden">Goal</span>
                </Button>
              }
            />
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select
              value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`}
              onValueChange={(value) => {
                const [year, month] = value.split('-');
                setSelectedYear(parseInt(year));
                setSelectedMonth(parseInt(month));
              }}
            >
              <SelectTrigger className="w-28 sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - 12 + i);
                  const year = date.getFullYear();
                  const month = date.getMonth() + 1;
                  return (
                    <SelectItem key={`${year}-${month}`} value={`${year}-${month.toString().padStart(2, '0')}`}>
                      {format(date, 'MMMM yyyy')}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Monthly Goal Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1 sm:space-y-0">
          <span className="text-xs sm:text-sm">
            Monthly Goal: {targetWorkouts} workouts • This Month: {completedWorkouts}/{targetWorkouts}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs sm:text-sm">
            {Math.round((completedWorkouts / targetWorkouts) * 100)}% complete
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <GoalProgressBar
          current={completedWorkouts}
          target={targetWorkouts}
          month={monthNames[selectedMonth - 1]}
        />
        
        {/* Calendar and Photos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Calendar */}
          <div>
            <MonthlyCalendar
              month={selectedMonth}
              year={selectedYear}
              workoutDates={workoutDates}
            />
          </div>
          
          {/* Progress Photos Section - CORRECTED */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Progress Photos</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Before Photo
                </label>
                {beforePhoto?.imageUrl ? (
                  <div className="aspect-square rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center relative" style={{ backgroundColor: '#262B32' }}>
                    <div className="relative w-full h-full">
                      <img 
                        src={beforePhoto.imageUrl} 
                        alt="Before photo" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded text-center">
                        {format(new Date(beforePhoto.timestamp), 'MMM dd')}
                      </div>
                      <div className="absolute top-1 right-1 bg-slate-800/80 text-white p-1 rounded">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ImageUpload 
                    onImageSelect={(imageUrl) => handlePhotoUpload(imageUrl, 'before')}
                    className="aspect-square"
                  />
                )}
              </div>
              
              {/* Latest Photo - Display Only */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Latest Photo
                </label>
                {latestWorkoutWithPhoto?.imageUrl ? (
                  <div className="aspect-square rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center relative" style={{ backgroundColor: '#262B32' }}>
                    <div className="relative w-full h-full">
                      <img 
                        src={latestWorkoutWithPhoto.imageUrl} 
                        alt="Latest workout photo" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded text-center">
                        {format(new Date(latestWorkoutWithPhoto.date), 'MMM dd')}
                      </div>
                      <div className="absolute top-1 right-1 bg-emerald-600/80 text-white p-1 rounded">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center" style={{ backgroundColor: '#262B32' }}>
                    <div className="text-center text-slate-500 dark:text-slate-400">
                      <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Latest photo from<br />workout sessions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Workout Summary */}
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#262B32' }}>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {completedWorkouts} / {targetWorkouts} workouts
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {Math.round((completedWorkouts / targetWorkouts) * 100)}% complete
              </p>
            </div>
            
            {/* Note about before photo */}
            {!beforePhoto && (
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                💡 Before photo is set automatically when you start your first workout of the month
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}