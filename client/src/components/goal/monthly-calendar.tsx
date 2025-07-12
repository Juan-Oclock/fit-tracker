import { useMemo } from "react";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { cn } from "@/lib/utils";

interface MonthlyCalendarProps {
  month: number; // 1-12
  year: number;
  workoutDates: string[]; // Array of workout dates (YYYY-MM-DD format)
  className?: string;
}

export function MonthlyCalendar({ month, year, workoutDates, className }: MonthlyCalendarProps) {
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const firstDayOfMonth = startOfMonth(new Date(year, month - 1));
    const startingDayOfWeek = getDay(firstDayOfMonth); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert workout dates to Set for O(1) lookup
    const workoutDateSet = new Set(workoutDates.map(date => {
      const d = new Date(date);
      return d.getDate();
    }));
    
    // Create array of days with their workout status
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, hasWorkout: false, isEmpty: true });
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        hasWorkout: workoutDateSet.has(day),
        isEmpty: false,
        isToday: new Date().getDate() === day && 
                new Date().getMonth() === month - 1 && 
                new Date().getFullYear() === year
      });
    }
    
    return { days, daysInMonth, monthName: format(new Date(year, month - 1), 'MMMM yyyy') };
  }, [month, year, workoutDates]);
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month - 1 && today.getFullYear() === year;
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {calendarData.monthName}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {workoutDates.length} / {calendarData.daysInMonth} days with workouts
        </p>
      </div>
      
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.days.map((dayData, index) => {
          if (dayData.isEmpty) {
            return <div key={index} className="h-8 w-8" />;
          }
          
          return (
            <div
              key={index}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-110",
                {
                  // No workout - gray dot
                  "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400": !dayData.hasWorkout,
                  // Today indicator - blue border
                  "ring-2 ring-blue-500 ring-offset-1": dayData.isToday,
                  // Future days in current month - lighter
                  "opacity-50": isCurrentMonth && dayData.day! > today.getDate(),
                }
              )}
              style={{
                // Workout day - use #FFD300 color
                backgroundColor: dayData.hasWorkout ? '#FFD300' : undefined,
                color: dayData.hasWorkout ? '#090C11' : undefined
              }}
              title={dayData.hasWorkout ? `Workout completed on ${dayData.day}` : `No workout on ${dayData.day}`}
            >
              {dayData.day}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full" style={{backgroundColor: '#FFD300'}}></div>
          <span>Workout</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <span>Rest day</span>
        </div>
        {isCurrentMonth && (
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-full border-2 border-blue-500"></div>
            <span>Today</span>
          </div>
        )}
      </div>
    </div>
  );
}