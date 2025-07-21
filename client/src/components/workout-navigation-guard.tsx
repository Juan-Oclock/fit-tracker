import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Save, ArrowRight } from "lucide-react";

interface WorkoutNavigationGuardProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onSaveAndLeave: () => void;
  isSaving?: boolean;
}

export function WorkoutNavigationGuard({
  isOpen,
  onClose,
  onContinue,
  onSaveAndLeave,
  isSaving = false,
}: WorkoutNavigationGuardProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Active Workout Session
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left mt-2">
            You have an active workout session running. Please complete and save your workout first before leaving this page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Stay Here
            </Button>
          </AlertDialogCancel>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              onClick={onSaveAndLeave}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save & Leave
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={onContinue}
              className="flex-1 sm:flex-none"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Leave Anyway
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
