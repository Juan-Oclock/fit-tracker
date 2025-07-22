import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateMonthlyGoal } from "@/hooks/use-monthly-goals";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, AlertTriangle } from "lucide-react";
import { getDaysInMonth } from "date-fns";

interface MonthlyGoalSettingDialogProps {
  currentGoal: number;
  month: number;
  year: number;
  trigger?: React.ReactNode;
}

export function MonthlyGoalSettingDialog({ currentGoal, month, year, trigger }: MonthlyGoalSettingDialogProps) {
  const [open, setOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(currentGoal.toString());
  const { toast } = useToast();
  const updateMonthlyGoal = useUpdateMonthlyGoal();

  // Calculate remaining days in the month
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  // Only calculate remaining days if we're setting goal for current month
  const isCurrentMonth = month === currentMonth && year === currentYear;
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const remainingDays = isCurrentMonth ? daysInMonth - currentDay + 1 : daysInMonth;
  const maxPossibleWorkouts = remainingDays;
  
  const goalValue = parseInt(newGoal);
  const isGoalTooHigh = !isNaN(goalValue) && goalValue > maxPossibleWorkouts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (goalValue < 0 || goalValue > 31 || isNaN(goalValue)) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a number between 0 and 31 (0 to clear goal).",
        variant: "destructive",
      });
      return;
    }

    // Warning for goals that exceed remaining days
    if (isGoalTooHigh && isCurrentMonth) {
      toast({
        title: "Goal Too High",
        description: `You only have ${remainingDays} days remaining in ${monthNames[month - 1]}. Maximum achievable goal is ${maxPossibleWorkouts} workouts (1 per day).`,
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMonthlyGoal.mutateAsync({ targetWorkouts: goalValue, month, year });
      toast({
        title: goalValue === 0 ? "Goal Cleared!" : "Goal Updated!",
        description: goalValue === 0 ? "Your monthly workout goal has been cleared." : `Your monthly workout goal is now ${goalValue} workouts.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm"
      className="flex items-center space-x-1"
    >
      <Target className="h-4 w-4" />
      <span className="hidden sm:inline">Set Monthly Goal</span>
      <span className="sm:hidden">Goal</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Monthly Workout Goal</DialogTitle>
          <DialogDescription>
            Choose your workout goal for {monthNames[month - 1]} {year}. This will be your target number of workouts for the entire month.
            {isCurrentMonth && (
              <span className="block mt-2 text-amber-600 dark:text-amber-400">
                📅 {remainingDays} days remaining in this month (max: {maxPossibleWorkouts} workouts)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form id="goal-form" onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Workouts
              </Label>
              <div className="col-span-3 space-y-2">
                <Input
                  id="goal"
                  type="number"
                  min="0"
                  max={isCurrentMonth ? maxPossibleWorkouts.toString() : "31"}
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className={`${isGoalTooHigh ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your monthly goal (0 to clear)"
                />
                {isGoalTooHigh && isCurrentMonth && (
                  <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Goal exceeds remaining days ({remainingDays} days left)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 px-4">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Beginners: Aim for 12-16 workouts per month (3-4 per week)</li>
                <li>Intermediate: Target 16-20 workouts per month (4-5 per week)</li>
                <li>Advanced: Consider 20-24 workouts per month (5-6 per week)</li>
                <li>Remember to include rest days for proper recovery</li>
                {isCurrentMonth && (
                  <li className="text-amber-600 dark:text-amber-400">
                    💡 For this month, maximum achievable: {maxPossibleWorkouts} workouts
                  </li>
                )}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => {
                setNewGoal('0');
                const form = document.getElementById('goal-form') as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }}
            >
              Clear Goal
            </Button>
            <Button type="submit" disabled={isGoalTooHigh && isCurrentMonth}>
              Update Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}