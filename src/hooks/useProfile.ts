import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string;
  business_name: string | null;
  phone: string | null;
  business_type: string | null;
  service_description: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', updates.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
    },
  });
}

/**
 * Check if user has completed onboarding
 * Onboarding is complete when all required fields are filled:
 * - business_type
 * - service_description
 * - city
 * - state
 * - zip_code
 */
export function useOnboardingComplete(userId: string | undefined) {
  const { data: profile } = useProfile(userId);

  if (!profile) {
    return { isComplete: false, isLoading: true };
  }

  const isComplete = !!(
    profile.business_type &&
    profile.service_description &&
    profile.city &&
    profile.state &&
    profile.zip_code
  );

  return { isComplete, isLoading: false, profile };
}
