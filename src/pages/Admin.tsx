import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';
import { useAllServices, useUpdateService, useCreateService } from '@/hooks/useServices';
import { useAdminLeads } from '@/hooks/useLeads';
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
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Settings,
  Users,
  FileText,
  DollarSign,
  Plus,
  Pencil,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface Profile {
  id: string;
  email: string;
  business_name: string | null;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data: services, isLoading: servicesLoading } = useAllServices();
  const { data: leads, isLoading: leadsLoading } = useAdminLeads();
  const updateService = useUpdateService();
  const createService = useCreateService();

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

  const totalRevenue = leads?.reduce((acc, lead) => {
    if (lead.status === 'purchased') {
      return acc + (lead.service?.price_cents || 0);
    }
    return acc;
  }, 0) || 0;

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

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{leads?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Purchased
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {leads?.filter(l => l.status === 'purchased').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Businesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profiles?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${(totalRevenue / 100).toFixed(0)}
                </div>
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
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles?.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                              {profile.business_name || '-'}
                            </TableCell>
                            <TableCell>{profile.email}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(profile.created_at), {
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
          <Zap className="h-4 w-4" />
          <span>LocalLead Admin</span>
        </div>
      </footer>
    </div>
  );
}
