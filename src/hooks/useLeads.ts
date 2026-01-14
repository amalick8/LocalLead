import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface Lead {
  id: string;
  service_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string;
  zip_code: string | null;
  description: string;
  contact_preference: 'phone' | 'email';
  status: 'new' | 'purchased' | 'expired';
  created_at: string;
  updated_at: string;
  service?: {
    name: string;
    price_cents: number;
  };
}

export interface LeadWithPayment extends Lead {
  is_purchased: boolean;
}

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          service:services(name, price_cents)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useBusinessLeads(userId: string | undefined) {
  // Fetch user profile for filtering
  const { data: profile } = useProfile(userId);

  return useQuery({
    queryKey: ['leads', 'business', userId, profile?.business_type, profile?.city, profile?.zip_code],
    enabled: !!userId,
    queryFn: async () => {
      // Step 1: Get matching service ID if business_type is set
      let matchingServiceId: string | null = null;
      if (profile?.business_type) {
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .select('id')
          .eq('name', profile.business_type)
          .eq('is_active', true)
          .single();

        if (!serviceError && service) {
          matchingServiceId = service.id;
        }
      }

      // Step 2: Build base query - filter by status and service (if available)
      let query = supabase
        .from('leads')
        .select(`
          *,
          service:services(name, price_cents)
        `)
        .eq('status', 'new');

      // Filter by service if business_type matches a service
      if (matchingServiceId) {
        query = query.eq('service_id', matchingServiceId);
      }

      // Step 3: Fetch leads (we'll filter location in memory for OR logic)
      const { data: leads, error: leadsError } = await query.order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Step 4: Filter leads by location (city OR zip_code match)
      // Only filter if profile has location data
      let filteredLeads = (leads || []) as Lead[];
      
      if (profile && (profile.city || profile.zip_code)) {
        filteredLeads = filteredLeads.filter(lead => {
          // Normalize city comparison (case-insensitive)
          const cityMatch = profile.city && lead.city && 
            lead.city.toLowerCase().trim() === profile.city.toLowerCase().trim();
          
          // Normalize zip code comparison (remove non-digits)
          const zipMatch = profile.zip_code && lead.zip_code && 
            lead.zip_code.replace(/\D/g, '') === profile.zip_code.replace(/\D/g, '');
          
          // Match if city OR zip_code matches
          return cityMatch || zipMatch;
        });
      }

      // Step 5: Get the user's payments to mark purchased leads
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('lead_id')
        .eq('user_id', userId!)
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      const purchasedLeadIds = new Set(payments?.map(p => p.lead_id) || []);

      return filteredLeads.map(lead => ({
        ...lead,
        is_purchased: purchasedLeadIds.has(lead.id),
      })) as LeadWithPayment[];
    },
  });
}

export function usePurchasedLeads(userId: string | undefined) {
  return useQuery({
    queryKey: ['leads', 'purchased', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('lead_id')
        .eq('user_id', userId!)
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      if (!payments || payments.length === 0) {
        return [];
      }

      const leadIds = payments.map(p => p.lead_id);

      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          service:services(name, price_cents)
        `)
        .in('id', leadIds)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      return leads as Lead[];
    },
  });
}

export function useCreateLead() {
  return useMutation({
    mutationFn: async (lead: {
      service_id: string;
      name: string;
      email?: string;
      phone?: string;
      city: string;
      zip_code?: string;
      description: string;
      contact_preference: 'phone' | 'email';
    }) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useAdminLeads() {
  return useQuery({
    queryKey: ['leads', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          service:services(name, price_cents)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useExpireLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      // Use the database function for expiration
      const { data, error } = await supabase.rpc('expire_lead', {
        lead_id: leadId,
      });

      if (error) throw error;

      // If function returned false, lead wasn't expired (might already be purchased/expired)
      if (data === false) {
        throw new Error('Lead cannot be expired (may already be purchased or expired)');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export interface LeadAnalytics {
  total_leads: number;
  purchased_leads: number;
  expired_leads: number;
  new_leads: number;
  total_revenue_cents: number;
  avg_lead_price_cents: number;
  conversion_rate: number;
}

export function useLeadAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_lead_analytics');

      if (error) throw error;

      return (data?.[0] || {
        total_leads: 0,
        purchased_leads: 0,
        expired_leads: 0,
        new_leads: 0,
        total_revenue_cents: 0,
        avg_lead_price_cents: 0,
        conversion_rate: 0,
      }) as LeadAnalytics;
    },
  });
}
