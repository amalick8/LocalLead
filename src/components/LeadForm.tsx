import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useServices } from '@/hooks/useServices';
import { useCreateLead } from '@/hooks/useLeads';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

const leadSchema = z.object({
  service_id: z.string().min(1, 'Please select a service'),
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  city: z.string().trim().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  zip_code: z.string().max(20).optional().or(z.literal('')),
  description: z.string().trim().min(10, 'Please describe what you need (at least 10 characters)').max(1000, 'Description must be less than 1000 characters'),
  contact_preference: z.enum(['phone', 'email']),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function LeadForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: services, isLoading: servicesLoading } = useServices();
  const createLead = useCreateLead();

  const [formData, setFormData] = useState<LeadFormData>({
    service_id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    zip_code: '',
    description: '',
    contact_preference: 'email',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = leadSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Validate contact info based on preference
    if (result.data.contact_preference === 'email' && !result.data.email) {
      setErrors({ email: 'Email is required when email contact is preferred' });
      return;
    }
    if (result.data.contact_preference === 'phone' && !result.data.phone) {
      setErrors({ phone: 'Phone is required when phone contact is preferred' });
      return;
    }

    try {
      await createLead.mutateAsync({
        service_id: result.data.service_id,
        name: result.data.name,
        email: result.data.email || undefined,
        phone: result.data.phone || undefined,
        city: result.data.city,
        zip_code: result.data.zip_code || undefined,
        description: result.data.description,
        contact_preference: result.data.contact_preference,
      });

      toast({
        title: 'Request submitted!',
        description: 'A local business will contact you soon.',
      });

      navigate('/thank-you');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit your request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="service">What service do you need?</Label>
          <Select
            value={formData.service_id}
            onValueChange={(value) => handleChange('service_id', value)}
          >
            <SelectTrigger className="mt-1.5 h-12">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service_id && (
            <p className="text-sm text-destructive mt-1">{errors.service_id}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Smith"
              className="mt-1.5 h-12"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Los Angeles"
              className="mt-1.5 h-12"
            />
            {errors.city && (
              <p className="text-sm text-destructive mt-1">{errors.city}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="zip_code">ZIP Code (optional)</Label>
          <Input
            id="zip_code"
            value={formData.zip_code}
            onChange={(e) => handleChange('zip_code', e.target.value)}
            placeholder="90210"
            className="mt-1.5 h-12"
          />
        </div>

        <div>
          <Label htmlFor="description">Describe what you need</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Tell us about your project or what service you're looking for..."
            className="mt-1.5 min-h-[120px] resize-none"
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <Label>Preferred contact method</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contact_preference"
                value="email"
                checked={formData.contact_preference === 'email'}
                onChange={(e) => handleChange('contact_preference', e.target.value)}
                className="h-4 w-4 text-primary"
              />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contact_preference"
                value="phone"
                checked={formData.contact_preference === 'phone'}
                onChange={(e) => handleChange('contact_preference', e.target.value)}
                className="h-4 w-4 text-primary"
              />
              <span>Phone</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 h-12"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1.5 h-12"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="cta"
        size="lg"
        className="w-full"
        disabled={createLead.isPending}
      >
        {createLead.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Get Free Quotes
          </>
        )}
      </Button>
    </form>
  );
}
