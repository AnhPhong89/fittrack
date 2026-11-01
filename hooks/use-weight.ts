'use client';
import { useState, useEffect, useCallback } from 'react';
import { WeightEntry } from '@/lib/types';
import { getWeightEntries, addWeightEntry, deleteWeightEntry } from '@/lib/store';

export function useWeight() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(getWeightEntries());
    setLoading(false);
  }, []);

  const addEntry = useCallback((entry: WeightEntry) => {
    addWeightEntry(entry);
    setEntries(getWeightEntries());
  }, []);

  const deleteEntry = useCallback((id: string) => {
    deleteWeightEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, loading, addEntry, deleteEntry };
}
