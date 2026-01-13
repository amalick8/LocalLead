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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LeadCardProps {
  lead: LeadWithPayment;
}

const getServiceColor = (serviceName: string | undefined) => {
  const colors: Record<string, string> = {
    Plumbing: "bg-blue-100 text-blue-700 border-blue-200",
    Electrical: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Landscaping: "bg-green-100 text-green-700 border-green-200",
    Cleaning: "bg-pink-100 text-pink-700 border-pink-200",
    HVAC: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Roofing: "bg-red-100 text-red-700 border-red-200",
    Painting: "bg-purple-100 text-purple-700 border-purple-200",
    Handyman: "bg-orange-100 text-orange-700 border-orange-200",
  }
  return colors[serviceName || ''] || "bg-gray-100 text-gray-700 border-gray-200"
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
      // This will redirect to Stripe Checkout; do not mark payment as complete here
      await purchaseLead.mutateAsync({
        leadId: lead.id,
        userId: user.id,
        amountCents: lead.service?.price_cents || 1000,
      });
      // Note: User will be redirected to Stripe, so toast is handled in Dashboard after return
    } catch (error) {
      setIsPurchasing(false); // Only reset if error (redirect won't happen)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const price = ((lead.service?.price_cents || 1000) / 100).toFixed(2);
  const serviceName = lead.service?.name || 'Service';
  const isPurchased = lead.is_purchased;

  return (
    <Card
      className={`border-2 shadow-lg transition-all hover:shadow-xl ${
        isPurchased ? "border-green-200 bg-gradient-to-br from-white to-green-50" : "border-gray-200 bg-white"
      }`}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Badge className={`${getServiceColor(serviceName)} border-2 font-bold text-base px-3 py-1`}>
              {serviceName}
            </Badge>
            <div className="flex items-center gap-2 text-base text-gray-600">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="font-medium">
                {lead.city}{lead.zip_code ? `, ${lead.zip_code}` : ''}
              </span>
            </div>
          </div>
          {isPurchased ? (
            <Badge className="flex items-center gap-2 bg-green-600 text-white px-3 py-2">
              <Unlock className="h-4 w-4" />
              <span className="font-semibold">Unlocked</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2">
              <Lock className="h-4 w-4" />
              <span className="font-semibold">Locked</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-base leading-relaxed text-gray-700 font-medium">
          {lead.description}
        </p>

        {isPurchased ? (
          <div className="mt-4 space-y-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 border-2 border-green-300 shadow-sm">
            {lead.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                <a
                  href={`mailto:${lead.email}`}
                  className="text-gray-900 font-medium hover:text-green-600 transition-colors"
                >
                  {lead.email}
                </a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <a href={`tel:${lead.phone}`} className="text-gray-900 font-medium hover:text-green-600 transition-colors">
                  {lead.phone}
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 p-5 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="blur-sm text-gray-500 font-medium">contact@email.com</span>
              <Lock className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="blur-sm text-gray-500 font-medium">(555) 123-4567</span>
              <Lock className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
            <p className="text-sm text-gray-600 text-center pt-2 border-t border-gray-300">
              Unlock to view contact details
            </p>
          </div>
        )}
      </CardContent>

      {!isPurchased && (
        <CardFooter className="border-t-2 border-gray-200 pt-4 bg-gradient-to-b from-white to-gray-50">
          <Button
            className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            onClick={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-5 w-5" />
                Unlock Lead for ${price}
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
