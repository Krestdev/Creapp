import React from "react";
import { useState } from "react";

// Simuler le composant Calendar simplifié
type CalendarProps = {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  className?: string;
};

export function Calendar({ selected, onSelect, className = "" }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Générer les jours du mois
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const days = [];
  
  // Jours vides au début
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  const handleDayClick = (day: number | null | undefined) => {
    if (day && onSelect) {
      const newDate = new Date(currentYear, currentMonth, day);
      onSelect(newDate);
    }
  };
  
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  return (
    <div className={`p-4 bg-white border rounded-lg shadow-sm ${className}`}>
      {/* En-tête avec mois/année */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-medium">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button 
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(day)}
            disabled={!day}
            className={`
              h-8 w-8 flex items-center justify-center text-sm rounded-md transition-colors
              ${!day ? 'invisible' : ''}
              ${day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear() 
                ? 'bg-primary/30 text-primary font-medium' : ''}
              ${selected && selected.getDate() === day && selected.getMonth() === currentMonth && selected.getFullYear() === currentYear
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-100'
              }
              disabled:cursor-not-allowed
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}