import { useState } from "react";
import { useExercises } from "@/hooks/use-exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface ExerciseEntry {
  id: string;
  exerciseId: number | null;
  exerciseName: string;
  sets: number;
  reps: string;
  weight: number;
  notes: string;
}

export default function ExerciseForm() {
  const { data: exercises } = useExercises();
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([
    {
      id: "1",
      exerciseId: null,
      exerciseName: "",
      sets: 3,
      reps: "8-12",
      weight: 0,
      notes: "",
    },
  ]);

  const addExercise = () => {
    const newEntry: ExerciseEntry = {
      id: Date.now().toString(),
      exerciseId: null,
      exerciseName: "",
      sets: 3,
      reps: "8-12",
      weight: 0,
      notes: "",
    };
    setExerciseEntries([...exerciseEntries, newEntry]);
  };

  const removeExercise = (id: string) => {
    setExerciseEntries(exerciseEntries.filter((entry) => entry.id !== id));
  };

  const updateExercise = (id: string, field: keyof ExerciseEntry, value: any) => {
    setExerciseEntries(exerciseEntries.map((entry) => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Exercises</CardTitle>
          <Button onClick={addExercise} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {exerciseEntries.map((entry, index) => (
            <div key={entry.id} className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900 dark:text-white">Exercise {index + 1}</h4>
                {exerciseEntries.length > 1 && (
                  <Button
                    onClick={() => removeExercise(entry.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Exercise</Label>
                  {exercises ? (
                    <Select
                      value={entry.exerciseId?.toString() || ""}
                      onValueChange={(value) => {
                        const exerciseId = parseInt(value);
                        const exercise = exercises.find(e => e.id === exerciseId);
                        updateExercise(entry.id, "exerciseId", exerciseId);
                        updateExercise(entry.id, "exerciseName", exercise?.name || "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map((exercise) => (
                          <SelectItem key={exercise.id} value={exercise.id.toString()}>
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Exercise name"
                      value={entry.exerciseName}
                      onChange={(e) => updateExercise(entry.id, "exerciseName", e.target.value)}
                    />
                  )}
                </div>
                
                <div>
                  <Label>Muscle Group</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chest">Chest</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                      <SelectItem value="shoulders">Shoulders</SelectItem>
                      <SelectItem value="arms">Arms</SelectItem>
                      <SelectItem value="legs">Legs</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    value={entry.sets}
                    onChange={(e) => updateExercise(entry.id, "sets", parseInt(e.target.value) || 0)}
                    min="1"
                    max="10"
                  />
                </div>
                
                <div>
                  <Label>Reps</Label>
                  <Input
                    placeholder="8-12"
                    value={entry.reps}
                    onChange={(e) => updateExercise(entry.id, "reps", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Weight (lbs)</Label>
                  <Input
                    type="number"
                    value={entry.weight}
                    onChange={(e) => updateExercise(entry.id, "weight", parseFloat(e.target.value) || 0)}
                    min="0"
                    step="2.5"
                  />
                </div>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Form notes, RPE, etc..."
                  value={entry.notes}
                  onChange={(e) => updateExercise(entry.id, "notes", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
