'use client';
import { useState, useEffect, useCallback } from 'react';
import { ExerciseEntry } from '@/lib/types';
import { getExercisesByDate, addExerciseEntry, deleteExerciseEntry, getExerciseEntries } from '@/lib/store';
import { getTodayISO } from '@/lib/calculations';

export function useExercise(date?: string) {
  const targetDate = date ?? getTodayISO();
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [allEntries, setAllEntries] = useState<ExerciseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(getExercisesByDate(targetDate));
    setAllEntries(getExerciseEntries());
    setLoading(false);
  }, [targetDate]);

  const addEntry = useCallback(
    (entry: ExerciseEntry) => {
      addExerciseEntry(entry);
      setEntries(getExercisesByDate(targetDate));
      setAllEntries(getExerciseEntries());
    },
    [targetDate]
  );

  const deleteEntry = useCallback((id: string) => {
    deleteExerciseEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setAllEntries(getExerciseEntries());
  }, []);

  const totalCaloriesBurned = entries.reduce((s, e) => s + e.caloriesBurned, 0);

  return { entries, allEntries, loading, addEntry, deleteEntry, totalCaloriesBurned };
}
