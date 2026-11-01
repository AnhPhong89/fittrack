'use client';
import { useState, useEffect, useCallback } from 'react';
import { MealEntry } from '@/lib/types';
import { getMealsByDate, addMealEntry, deleteMealEntry } from '@/lib/store';
import { getTodayISO } from '@/lib/calculations';

export function useNutrition(date?: string) {
  const targetDate = date ?? getTodayISO();
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(getMealsByDate(targetDate));
    setLoading(false);
  }, [targetDate]);

  const addEntry = useCallback(
    (entry: MealEntry) => {
      addMealEntry(entry);
      setEntries(getMealsByDate(targetDate));
    },
    [targetDate]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      deleteMealEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    []
  );

  const totals = {
    calories: entries.reduce((s, e) => s + e.calories, 0),
    protein: entries.reduce((s, e) => s + e.protein, 0),
    carbs: entries.reduce((s, e) => s + e.carbs, 0),
    fat: entries.reduce((s, e) => s + e.fat, 0),
  };

  return { entries, loading, addEntry, deleteEntry, totals };
}
