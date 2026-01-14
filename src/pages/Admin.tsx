import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';
import { useAllServices, useUpdateService, useCreateService } from '@/hooks/useServices';
import { useAdminLeads, useExpireLead, useLeadAnalytics } from '@/hooks/useLeads';
import { useAdminPayments } from '@/hooks/usePayments';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Settings,
  Users,
  FileText,
  DollarSign,
  Plus,
  Pencil,
  CreditCard,
  XCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Profile {
  id: string;
  email: string;
  business_name: string | null;
  phone?: string | null;
  business_type?: string | null;
  service_description?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  is_disabled?: boolean;
  disabled_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: services, isLoading: servicesLoading } = useAllServices();
  const { data: leads, isLoading: leadsLoading } = useAdminLeads();
  const { data: payments, isLoading: paymentsLoading } = useAdminPayments();
  const { data: analytics, isLoading: analyticsLoading } = useLeadAnalytics();
  const updateService = useUpdateService();
  const createService = useCreateService();
  const expireLead = useExpireLead();

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles', 'admin'],
    enabled: role === 'admin',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  const [editingService, setEditingService] = useState<{
    id: string;
    name: string;
    price_cents: number;
  } | null>(null);

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price_cents: 1000,
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [editingBusiness, setEditingBusiness] = useState<Profile | null>(null);
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    phone: '',
    business_type: '',
    service_description: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (!authLoading && role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, role, authLoading, navigate]);

  const handleUpdatePrice = async () => {
    if (!editingService) return;

    try {
      await updateService.mutateAsync({
        id: editingService.id,
        price_cents: editingService.price_cents,
      });

      toast({
        title: 'Price updated',
        description: `${editingService.name} price has been updated.`,
      });

      setEditingService(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update price.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateService = async () => {
    try {
      await createService.mutateAsync(newService);

      toast({
        title: 'Service created',
        description: `${newService.name} has been added.`,
      });

      setNewService({ name: '', description: '', price_cents: 1000 });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create service.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || !user || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleExpireLead = async (leadId: string) => {
    try {
      await expireLead.mutateAsync(leadId);
      toast({
        title: 'Lead expired',
        description: 'The lead has been marked as expired.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to expire lead.',
        variant: 'destructive',
      });
    }
  };

  const openEditBusiness = (profile: Profile) => {
    setEditingBusiness(profile);
    setBusinessForm({
      business_name: profile.business_name || '',
      phone: profile.phone || '',
      business_type: profile.business_type || '',
      service_description: profile.service_description || '',
      city: profile.city || '',
      state: profile.state || '',
      zip_code: profile.zip_code || '',
      country: profile.country || 'US',
    });
  };

  const handleSaveBusiness = async () => {
    if (!editingBusiness) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: businessForm.business_name || null,
          phone: businessForm.phone || null,
          business_type: businessForm.business_type || null,
          service_description: businessForm.service_description || null,
          city: businessForm.city || null,
          state: businessForm.state || null,
          zip_code: businessForm.zip_code || null,
          country: businessForm.country || 'US',
        })
        .eq('id', editingBusiness.id);

      if (error) throw error;

      toast({ title: 'Business updated', description: 'Profile changes have been saved.' });
      setEditingBusiness(null);
      queryClient.invalidateQueries({ queryKey: ['profiles', 'admin'] });
    } catch (error) {
      console.error('[Admin] Failed to update business profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update business.',
        variant: 'destructive',
      });
    }
  };

  const handleDisableBusiness = async (profile: Profile, disable: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_disabled: disable,
          disabled_at: disable ? new Date().toISOString() : null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: disable ? 'Business disabled' : 'Business re-enabled',
        description: disable
          ? 'This business can no longer access leads or purchase flow.'
          : 'This business can access the platform again.',
      });

      queryClient.invalidateQueries({ queryKey: ['profiles', 'admin'] });
    } catch (error) {
      console.error('[Admin] Failed to toggle business disabled state:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update business status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBusiness = async (profile: Profile) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          deleted_at: now,
          is_disabled: true,
          disabled_at: now,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Business removed',
        description: 'The business has been soft-deleted (removed from operations).',
      });

      queryClient.invalidateQueries({ queryKey: ['profiles', 'admin'] });
    } catch (error) {
      console.error('[Admin] Failed to soft-delete business:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove business.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container-wide">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage services, leads, and businesses
            </p>
          </div>

          {/* Analytics Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold">{analytics?.total_leads || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Purchased
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold text-green-600">
                    {analytics?.purchased_leads || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold text-blue-600">
                    ${((analytics?.total_revenue_cents || 0) / 100).toFixed(0)}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Businesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profiles?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  New Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold">{analytics?.new_leads || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expired
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold text-gray-500">
                    {analytics?.expired_leads || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold">
                    {analytics?.conversion_rate?.toFixed(1) || '0.0'}%
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Lead Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-3xl font-bold">
                    ${((analytics?.avg_lead_price_cents || 0) / 100).toFixed(2)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="services" className="space-y-6">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Services & Pricing
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All Leads
              </TabsTrigger>
              <TabsTrigger value="businesses" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Businesses
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Services & Pricing</CardTitle>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="cta" size="sm">
                        <Plus className="h-4 w-4" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Service</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="serviceName">Service Name</Label>
                          <Input
                            id="serviceName"
                            value={newService.name}
                            onChange={(e) =>
                              setNewService({ ...newService, name: e.target.value })
                            }
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="serviceDesc">Description</Label>
                          <Input
                            id="serviceDesc"
                            value={newService.description}
                            onChange={(e) =>
                              setNewService({ ...newService, description: e.target.value })
                            }
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="servicePrice">Price per Lead ($)</Label>
                          <Input
                            id="servicePrice"
                            type="number"
                            value={newService.price_cents / 100}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                price_cents: Math.round(parseFloat(e.target.value) * 100),
                              })
                            }
                            className="mt-1.5"
                          />
                        </div>
                        <Button
                          onClick={handleCreateService}
                          disabled={createService.isPending}
                          className="w-full"
                        >
                          {createService.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Create Service'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {servicesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services?.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {service.description || '-'}
                            </TableCell>
                            <TableCell>
                              {editingService?.id === service.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={editingService.price_cents / 100}
                                    onChange={(e) =>
                                      setEditingService({
                                        ...editingService,
                                        price_cents: Math.round(
                                          parseFloat(e.target.value) * 100
                                        ),
                                      })
                                    }
                                    className="w-20 h-8"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={handleUpdatePrice}
                                    disabled={updateService.isPending}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingService(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <span className="font-medium">
                                  ${(service.price_cents / 100).toFixed(2)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={service.is_active ? 'default' : 'secondary'}>
                                {service.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setEditingService({
                                    id: service.id,
                                    name: service.name,
                                    price_cents: service.price_cents,
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <CardTitle>All Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  {leadsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads?.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.service?.name}</TableCell>
                            <TableCell>{lead.city}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  lead.status === 'purchased'
                                    ? 'default'
                                    : lead.status === 'expired'
                                    ? 'outline'
                                    : lead.status === 'new'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {lead.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(lead.created_at), {
                                addSuffix: true,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              {lead.status === 'new' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExpireLead(lead.id)}
                                  disabled={expireLead.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Expire
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="businesses">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Businesses</CardTitle>
                </CardHeader>
                <CardContent>
                  {profilesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles?.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                              {profile.business_name || '-'}
                            </TableCell>
                            <TableCell>{profile.email}</TableCell>
                            <TableCell>
                              {profile.deleted_at ? (
                                <Badge variant="outline">deleted</Badge>
                              ) : profile.is_disabled ? (
                                <Badge variant="secondary">disabled</Badge>
                              ) : (
                                <Badge variant="default">active</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(profile.created_at), {
                                addSuffix: true,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditBusiness(profile)}
                                  disabled={!!profile.deleted_at}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                                      disabled={!!profile.deleted_at}
                                    >
                                      {profile.is_disabled ? 'Enable' : 'Disable'}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {profile.is_disabled ? 'Re-enable business?' : 'Disable business?'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {profile.is_disabled
                                          ? 'This will allow the business to access leads and purchases again.'
                                          : 'This will block the business from accessing leads and purchasing.'}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDisableBusiness(profile, !profile.is_disabled)}
                                      >
                                        Confirm
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      disabled={!!profile.deleted_at}
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove this business?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This is a soft-delete. The business profile will be marked deleted and disabled.
                                        This does not delete the Supabase Auth user.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteBusiness(profile)}>
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Edit Business Dialog */}
              <Dialog open={!!editingBusiness} onOpenChange={(open) => !open && setEditingBusiness(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Business</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bizName">Business Name</Label>
                        <Input
                          id="bizName"
                          value={businessForm.business_name}
                          onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bizPhone">Phone</Label>
                        <Input
                          id="bizPhone"
                          value={businessForm.phone}
                          onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bizType">Business Type (Service)</Label>
                      <Input
                        id="bizType"
                        value={businessForm.business_type}
                        onChange={(e) => setBusinessForm({ ...businessForm, business_type: e.target.value })}
                        className="mt-1.5"
                        placeholder="e.g., Plumbing"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bizDesc">Service Description</Label>
                      <Input
                        id="bizDesc"
                        value={businessForm.service_description}
                        onChange={(e) => setBusinessForm({ ...businessForm, service_description: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bizCity">City</Label>
                        <Input
                          id="bizCity"
                          value={businessForm.city}
                          onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bizState">State</Label>
                        <Input
                          id="bizState"
                          value={businessForm.state}
                          onChange={(e) => setBusinessForm({ ...businessForm, state: e.target.value })}
                          className="mt-1.5"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bizZip">Zip Code</Label>
                        <Input
                          id="bizZip"
                          value={businessForm.zip_code}
                          onChange={(e) => setBusinessForm({ ...businessForm, zip_code: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bizCountry">Country</Label>
                        <Input
                          id="bizCountry"
                          value={businessForm.country}
                          onChange={(e) => setBusinessForm({ ...businessForm, country: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveBusiness} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>All Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : !payments || payments.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
                        <p className="text-muted-foreground">
                          Payments will appear here once businesses purchase leads.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Email</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Lead ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {payment.profile.email}
                            </TableCell>
                            <TableCell>{payment.service.name}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {payment.lead_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              ${(payment.amount_cents / 100).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === 'completed'
                                    ? 'default'
                                    : payment.status === 'pending'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(payment.created_at), {
                                addSuffix: true,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container-wide flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <img 
            src="/icon.svg" 
            alt="LocalLead Logo" 
            className="h-6 w-6"
          />
          <span>LocalLead Admin</span>
        </div>
      </footer>
    </div>
  );
}
