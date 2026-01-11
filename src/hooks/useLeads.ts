import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
    queryKey: ['leads', 'business', userId],
    enabled: !!userId,
    queryFn: async () => {
      // First get the leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          service:services(name, price_cents)
        `)
        .eq('status', 'new')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Then get the user's payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('lead_id')
        .eq('user_id', userId!)
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      const purchasedLeadIds = new Set(payments?.map(p => p.lead_id) || []);

      return (leads as Lead[]).map(lead => ({
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
