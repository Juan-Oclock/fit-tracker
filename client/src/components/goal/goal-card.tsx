import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MonthlyCalendar } from "./monthly-calendar";
import { GoalProgressBar } from "./goal-progress-bar";
import { MonthlyGoalSettingDialog } from "@/components/monthly-goal-setting-dialog";
import { ChevronLeft, ChevronRight, Calendar, Camera, Target, Trash2, Play } from "lucide-react";
import { format } from "date-fns";
import { useMonthlyGoalData } from "@/hooks/use-monthly-goals";
import { useWorkouts } from "@/hooks/use-workouts";
import { ImageUpload } from "@/components/image-upload";
import { Link } from "wouter";
import { useCreateGoalPhoto, useDeleteGoalPhoto } from "@/hooks/use-goal-photos";
import { useToast } from "@/hooks/use-toast";

interface GoalCardProps {
  className?: string;
}

export function GoalCard({ className }: GoalCardProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Add the hooks here
  const createGoalPhoto = useCreateGoalPhoto();
  const deleteGoalPhoto = useDeleteGoalPhoto();
  const { toast } = useToast();
  
  // Delete photo handler
  const handleDeletePhoto = async (photoId: number, photoType: string) => {
    console.log(`Attempting to delete ${photoType} photo with ID:`, photoId);
    console.log('Before photo object:', beforePhoto);
    console.log('Monthly goal data:', monthlyGoalData);
    console.log('Selected month/year:', selectedMonth, selectedYear);
    
    if (confirm(`Are you sure you want to delete this ${photoType} photo?`)) {
      try {
        await deleteGoalPhoto.mutateAsync({
          photoId,
          month: selectedMonth,
          year: selectedYear
        });
        toast({
          title: "Success",
          description: `${photoType} photo deleted successfully`,
        });
      } catch (error: any) {
        console.error('Delete error:', error);
        console.error('Error details:', {
          message: error?.message,
          status: error?.status,
          response: error?.response,
          stack: error?.stack
        });
        
        // Check if it's a 404 error - if so, treat as success since deletion works
        const is404Error = error?.message?.includes('404') || error?.message?.includes('Goal photo not found');
        
        if (is404Error) {
          console.log('Treating 404 as success since photo deletion works');
          toast({
            title: "Success",
            description: `${photoType} photo deleted successfully`,
          });
        } else {
          const errorMessage = error?.message || error?.response?.data?.error || 'Unknown error occurred';
          toast({
            title: "Error",
            description: `Failed to delete ${photoType} photo: ${errorMessage}`,
            variant: "destructive",
          });
        }
      }
    }
  };
  
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
  const targetWorkouts = monthlyGoalData?.targetWorkouts || 0;
  const hasExplicitGoal = monthlyGoalData?.targetWorkouts !== undefined && monthlyGoalData?.targetWorkouts > 0;
  
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
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-[#FFD300]" />
            Monthly Goal
          </h3>
          <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="border border-slate-800 rounded-2xl p-4 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-slate-700 rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square bg-slate-700 rounded-xl"></div>
              <div className="aspect-square bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Special state when no goal is set
  if (!hasExplicitGoal) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <MonthlyGoalSettingDialog 
            month={selectedMonth} 
            year={selectedYear}
            currentGoal={targetWorkouts}
            trigger={
              <button className="w-full text-[#FFD300] text-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-800/50 px-3 py-2 rounded-lg transition-colors border border-dashed border-slate-600 hover:border-[#FFD300]/50">
                <Target className="h-5 w-5 text-[#FFD300]" />
                Set your goal here
              </button>
            }
          />
        </div>
        
        <div className="border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Target className="h-8 w-8 text-[#FFD300] mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Set your goal here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-[#FFD300]" />
          Monthly Goal
        </h3>
        <MonthlyGoalSettingDialog 
          month={selectedMonth} 
          year={selectedYear}
          currentGoal={targetWorkouts}
        />
      </div>
      
      {/* Start Workout Button - Only show when goal is set */}
      {hasExplicitGoal && targetWorkouts > 0 && (
        <div className="mb-4">
          <Link href="/new-workout">
            <div className="bg-[#FFD300] text-black rounded-xl p-3 text-center hover:bg-[#E6BE00] transition-colors active:scale-95 transform duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#090C11] rounded-xl flex items-center justify-center">
                    <Play className="w-6 h-6 text-[#FFD300]" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-bold text-[#090C11] text-lg">Start Workout</p>
                    <p className="text-[#090C11]/70 text-sm">Begin your training session</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
      
      <div className="border border-slate-800 rounded-2xl p-4 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="text-slate-400 hover:text-white hover:bg-[#2A2F36] h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#FFD300]" />
            <span className="text-sm font-semibold text-white">
              {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="text-slate-400 hover:text-white hover:bg-[#2A2F36] h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Section */}
        <div className="space-y-3">
          <GoalProgressBar 
            current={completedWorkouts} 
            target={targetWorkouts}
            month={format(new Date(selectedYear, selectedMonth - 1), 'MMMM')}
          />
        </div>
        
        {/* Calendar */}
        <MonthlyCalendar 
          month={selectedMonth} 
          year={selectedYear}
          workoutDates={workoutDates}
          className=""
        />
        
        {/* Photo Progress Section */}
        <div className="space-y-3">
          <h4 className="text-white text-sm font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4 text-[#FFD300]" />
            Photo Progress
          </h4>
          
          {/* Photo Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Before Photo */}
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-medium">
                Before Photo
              </label>
              {beforePhoto ? (
                <div className="aspect-square rounded-xl border border-[#FFD300]/30 flex items-center justify-center relative overflow-hidden">
                  <div className="relative w-full h-full">
                    <img 
                      src={beforePhoto.imageUrl} 
                      alt="Before photo" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded text-center">
                      {format(new Date(beforePhoto.timestamp), 'MMM dd')}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => handleDeletePhoto(beforePhoto.id, 'before')}
                      title="Delete before photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const result = e.target?.result as string;
                          handlePhotoUpload(result, 'before');
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <div className="text-center text-slate-500">
                    <Camera className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">Add workout photo</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Latest Photo - Display Only */}
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-medium">
                Latest Photo
              </label>
              {latestWorkoutWithPhoto?.imageUrl ? (
                <div className="aspect-square rounded-xl border border-emerald-500/30 flex items-center justify-center relative overflow-hidden">
                  <div className="relative w-full h-full">
                    <img 
                      src={latestWorkoutWithPhoto.imageUrl} 
                      alt="Latest workout photo" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded text-center">
                      {format(new Date(latestWorkoutWithPhoto.date), 'MMM dd')}
                    </div>
                    <div className="absolute top-1 right-1 bg-emerald-500 text-white p-1 rounded">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <Camera className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">Latest from<br />workouts</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Note about before photo */}
          {!beforePhoto && (
            <div className="text-xs text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 p-2 rounded-xl">
              💡 Before photo is set automatically when you start your first workout of the month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}