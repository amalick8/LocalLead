import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadWithPayment } from '@/hooks/useLeads';
import { usePurchaseLead } from '@/hooks/usePayments';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Lock,
  Unlock,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LeadCardProps {
  lead: LeadWithPayment;
}

export function LeadCard({ lead }: LeadCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const purchaseLead = usePurchaseLead();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (!user) return;

    setIsPurchasing(true);
    try {
      await purchaseLead.mutateAsync({
        leadId: lead.id,
        userId: user.id,
        amountCents: lead.service?.price_cents || 1000,
      });

      toast({
        title: 'Lead Unlocked!',
        description: 'You can now view the full contact details.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const price = ((lead.service?.price_cents || 1000) / 100).toFixed(2);

  return (
    <Card className="card-elevated overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {lead.service?.name || 'Service'}
            </Badge>
            <h3 className="font-semibold text-lg">
              {lead.is_purchased ? lead.name : `${lead.name.charAt(0)}***`}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{lead.city}{lead.zip_code ? `, ${lead.zip_code}` : ''}</span>
        </div>

        <p className="text-sm leading-relaxed">
          {lead.is_purchased
            ? lead.description
            : lead.description.slice(0, 100) + (lead.description.length > 100 ? '...' : '')}
        </p>

        {lead.is_purchased ? (
          <div className="space-y-2 p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 text-success font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Contact Information Unlocked
            </div>
            <div className="space-y-1 text-sm">
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Contact details hidden until purchased
            </span>
          </div>
        )}
      </CardContent>

      {!lead.is_purchased && (
        <CardFooter className="pt-0">
          <Button
            variant="cta"
            className="w-full"
            onClick={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Unlock for ${price}
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
