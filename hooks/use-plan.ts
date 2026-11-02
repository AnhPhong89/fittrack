'use client';
import { useState, useEffect, useCallback } from 'react';
import { PlanState } from '@/lib/types';
import { getPlanState, savePlanState } from '@/lib/store';
import { DEFAULT_SCHEDULE } from '@/lib/plan-data';

const DEFAULT_PLAN: PlanState = { dietMode: 'normal', schedule: DEFAULT_SCHEDULE, seed: 0 };

export function usePlan() {
  const [plan, setPlan] = useState<PlanState>(DEFAULT_PLAN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPlan(getPlanState() ?? DEFAULT_PLAN);
    setLoading(false);
  }, []);

  const updatePlan = useCallback((patch: Partial<PlanState>) => {
    setPlan((prev) => {
      const next = { ...prev, ...patch };
      savePlanState(next);
      return next;
    });
  }, []);

  return { plan, loading, updatePlan };
}
