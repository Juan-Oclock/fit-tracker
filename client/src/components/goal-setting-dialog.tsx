import { useState } from "react";
import { useUpdateGoal } from "@/hooks/use-workouts";
import { useToast } from "@/hooks/use-toast";
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

interface GoalSettingDialogProps {
  currentGoal: number;
  canSetNewGoal: boolean;
  trigger?: React.ReactNode;
}

export function GoalSettingDialog({ currentGoal, canSetNewGoal, trigger }: GoalSettingDialogProps) {
  const [open, setOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(currentGoal.toString());
  const updateGoal = useUpdateGoal();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalValue = parseInt(newGoal);
    if (goalValue < 1 || goalValue > 14 || isNaN(goalValue)) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a number between 1 and 14.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateGoal.mutateAsync({ weeklyGoal: goalValue });
      toast({
        title: "Goal Updated!",
        description: `Your weekly workout goal is now ${goalValue} workouts.`,
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

  const defaultTrigger = (
    <Button 
      variant={canSetNewGoal ? "default" : "secondary"} 
      size="sm"
      disabled={!canSetNewGoal}
      className="text-xs px-2 py-1 h-auto"
    >
      <Target className="w-3 h-3 mr-1" />
      {canSetNewGoal ? "Set Goal" : "Goal Set"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Weekly Workout Goal</DialogTitle>
          <DialogDescription>
            {canSetNewGoal 
              ? "Choose your workout goal for this week. You can update this once per week."
              : "You've already set your goal for this week. Goals can be updated once per week."
            }
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
                max="14"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="col-span-3"
                placeholder="Enter your weekly goal"
                disabled={!canSetNewGoal}
              />
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 px-4">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Start with 3-4 workouts per week if you're new to fitness</li>
                <li>Experienced athletes can aim for 5-6 workouts per week</li>
                <li>Remember to include rest days for recovery</li>
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
              type="submit" 
              disabled={updateGoal.isPending || !canSetNewGoal}
            >
              {updateGoal.isPending ? "Updating..." : "Update Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}