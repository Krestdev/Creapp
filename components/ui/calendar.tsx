import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarProps = {
  selected?: Date;
  onSelect: (date: Date) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
};

export function Calendar({
  selected,
  onSelect,
  className = "",
  disabled,
}: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Generate days of the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

  const days: (number | null)[] = [];

  // Empty days at start
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const handleDayClick = (day: number | null) => {
    if (day) {
      const selectedDate = new Date(currentYear, currentMonth, day);
      onSelect(selectedDate);
    }
  };

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      let newMonth = direction === "prev" ? prev - 1 : prev + 1;
      let newYear = currentYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }

      setCurrentYear(newYear);
      return newMonth;
    });
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      selected?.getDate() === day &&
      selected?.getMonth() === currentMonth &&
      selected?.getFullYear() === currentYear
    );
  };

  const isDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return disabled ? disabled(date) : false;
  };

  return (
    <div className={cn("p-4 bg-background border rounded-lg shadow-sm w-[280px]", className)}>
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth("prev")}
          className="p-1 rounded-md hover:bg-accent transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-base font-medium">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <button
          onClick={() => changeMonth("next")}
          className="p-1 rounded-md hover:bg-accent transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div 
            key={day} 
            className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && handleDayClick(day)}
            disabled={!day || isDisabled(day)}
            className={cn(
              "h-8 w-8 flex items-center justify-center text-sm rounded-md transition-colors",
              !day && "invisible",
              day && isToday(day) && "bg-primary/10 text-primary font-medium",
              day && isSelected(day) && "bg-primary text-primary-foreground",
              day && !isSelected(day) && !isToday(day) && "hover:bg-accent",
              day && isDisabled(day) && "opacity-50 cursor-not-allowed"
            )}
            aria-selected={day ? isSelected(day) : false}
            aria-disabled={!day || isDisabled(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}