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
      <div className="space-y-2">
        <Label htmlFor="service" className="text-base font-semibold text-gray-900">
          What service do you need?
        </Label>
        <Select
          value={formData.service_id}
          onValueChange={(value) => handleChange('service_id', value)}
        >
          <SelectTrigger id="service" className="h-14 text-base border-2 border-gray-200 focus:border-primary">
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
        <p className="text-sm text-gray-500">Choose the type of service you're looking for</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold text-gray-900">
            Your Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Smith"
            className="h-14 text-base border-2 border-gray-200 focus:border-primary"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-base font-semibold text-gray-900">
            Where are you located?
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter your city or ZIP code"
            className="h-14 text-base border-2 border-gray-200 focus:border-primary"
          />
          {errors.city && (
            <p className="text-sm text-destructive mt-1">{errors.city}</p>
          )}
          <p className="text-sm text-gray-500">We'll find pros in your area</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zip_code" className="text-base font-semibold text-gray-900">
          ZIP Code (optional)
        </Label>
        <Input
          id="zip_code"
          value={formData.zip_code}
          onChange={(e) => handleChange('zip_code', e.target.value)}
          placeholder="90210"
          className="h-14 text-base border-2 border-gray-200 focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold text-gray-900">
          Describe your project
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Tell us what you need help with..."
          className="min-h-[120px] resize-none text-base border-2 border-gray-200 focus:border-primary"
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description}</p>
        )}
        <p className="text-sm text-gray-500">The more details, the better we can match you</p>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold text-gray-900">Preferred contact method</Label>
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
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-semibold text-gray-900">
            Your contact info
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Phone number or email"
            className="h-14 text-base border-2 border-gray-200 focus:border-primary"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
          <p className="text-sm text-gray-500">How should pros reach you?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-semibold text-gray-900">
            Phone (optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="h-14 text-base border-2 border-gray-200 focus:border-primary"
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-16 w-full text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 hover:from-blue-700 hover:via-blue-800 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all"
        disabled={createLead.isPending}
      >
        {createLead.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Get Free Quotes Now
          </>
        )}
      </Button>

      <p className="text-center text-sm text-gray-500">
        No commitment required • Get responses within 24 hours
      </p>
    </form>
  );
}
