import { useState, useEffect } from 'react';
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
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';
import { useServices } from '@/hooks/useServices';
import { useProfile, useUpdateProfile, useOnboardingComplete } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, MapPin, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const onboardingSchema = z.object({
  business_type: z.string().min(1, 'Business type is required'),
  service_description: z.string().min(10, 'Service description must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(5, 'Zip code must be at least 5 characters'),
});

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { isComplete } = useOnboardingComplete(user?.id);
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    business_type: '',
    service_description: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already completed or admin
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (!authLoading && role === 'admin') {
      navigate('/admin');
      return;
    }
    if (!authLoading && !profileLoading && isComplete) {
      navigate('/dashboard');
      return;
    }
  }, [authLoading, user, role, profileLoading, isComplete, navigate]);

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        business_type: profile.business_type || '',
        service_description: profile.service_description || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = onboardingSchema.parse(formData);
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to complete onboarding.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      setIsSubmitting(true);

      await updateProfile.mutateAsync({
        id: user.id,
        ...validated,
      });

      toast({
        title: 'Onboarding complete!',
        description: 'Your business profile has been saved.',
      });

      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to save profile.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || profileLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || role === 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <Header />
      
      <main className="mx-auto max-w-2xl px-6 py-10 lg:px-8 pt-24">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Complete Your Business Profile</CardTitle>
            <CardDescription className="text-base">
              Help us match you with the right leads by telling us about your business
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="business_type" className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Business Type *
                </Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) => handleChange('business_type', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your primary service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (specify in description)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.business_type && (
                  <p className="text-sm text-red-500">{errors.business_type}</p>
                )}
              </div>

              {/* Service Description */}
              <div className="space-y-2">
                <Label htmlFor="service_description" className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Service Description *
                </Label>
                <Textarea
                  id="service_description"
                  placeholder="Describe the services you offer in detail..."
                  value={formData.service_description}
                  onChange={(e) => handleChange('service_description', e.target.value)}
                  className="min-h-[120px] resize-none"
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.service_description.length}/10 characters minimum
                </p>
                {errors.service_description && (
                  <p className="text-sm text-red-500">{errors.service_description}</p>
                )}
              </div>

              {/* Location Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Business Location</h3>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-base font-semibold">
                    City *
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g., San Francisco"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="h-12"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* State and Zip Code Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-base font-semibold">
                      State *
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="e.g., CA"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                      className="h-12"
                      maxLength={2}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip_code" className="text-base font-semibold">
                      Zip Code *
                    </Label>
                    <Input
                      id="zip_code"
                      type="text"
                      placeholder="e.g., 94102"
                      value={formData.zip_code}
                      onChange={(e) => handleChange('zip_code', e.target.value.replace(/\D/g, ''))}
                      className="h-12"
                      maxLength={10}
                    />
                    {errors.zip_code && (
                      <p className="text-sm text-red-500">{errors.zip_code}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Complete Onboarding'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
