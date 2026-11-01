'use client';
import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import { getProfile, saveProfile } from '@/lib/store';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProfile(getProfile());
    setLoading(false);
  }, []);

  const updateProfile = useCallback((data: UserProfile) => {
    saveProfile(data);
    setProfile(data);
  }, []);

  return { profile, loading, updateProfile };
}
