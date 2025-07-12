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
import { Target } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalValue = parseInt(newGoal);
    if (goalValue < 1 || goalValue > 31 || isNaN(goalValue)) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a number between 1 and 31.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMonthlyGoal.mutateAsync({ targetWorkouts: goalValue, month, year });
      toast({
        title: "Goal Updated!",
        description: `Your monthly workout goal is now ${goalValue} workouts.`,
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
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Workouts
              </Label>
              <Input
                id="goal"
                type="number"
                min="1"
                max="31"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="col-span-3"
                placeholder="Enter your monthly goal"
              />
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 px-4">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Beginners: Aim for 12-16 workouts per month (3-4 per week)</li>
                <li>Intermediate: Target 16-20 workouts per month (4-5 per week)</li>
                <li>Advanced: Consider 20-24 workouts per month (5-6 per week)</li>
                <li>Remember to include rest days for proper recovery</li>
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
            <Button type="submit">
              Update Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}